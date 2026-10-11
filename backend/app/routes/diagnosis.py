from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
import os
import json

from app.schemas.diagnosis_schema import DiagnosisRequest, DiagnosisResponse, FullDiagnosisResponse
from app.schemas.recommendation_schema import RecommendationRequest, RecommendationResponse
from app.schemas.questionnaire_schema import QuestionnaireSubmissionRequest
from app.services.diagnosis_engine import diagnosis_engine
from app.services.recommendation_service import recommendation_service
from app.services.diagnostic_workflow_orchestrator import workflow_orchestrator
from pydantic import BaseModel, Field
from fastapi import File, Form, UploadFile
import base64
import cv2
import numpy as np

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
STATUS_CATALOG_PATH = os.path.join(BASE_DIR, "docs", "agrovision_v2", "phase5", "decision_status_catalog.json")
RULES_PATH = os.path.join(BASE_DIR, "docs", "agrovision_v2", "phase5", "evidence_fusion_rules.json")
SOURCES_PATH = os.path.join(BASE_DIR, "docs", "agrovision_v2", "phase7", "evidence_sources.json")
KB_PATH = os.path.join(BASE_DIR, "docs", "agrovision_v2", "phase7", "crop_disease_knowledge.json")

class FullDiagnosisRequest(BaseModel):
    questionnaire_payload: QuestionnaireSubmissionRequest
    mock_model_scores: Optional[List[Dict[str, Any]]] = None
    model_version: Optional[str] = "v1_baseline_39class"
    state: Optional[str] = "Telangana"
    district: Optional[str] = None
    image_base64: Optional[str] = None

@router.post("/v1/full-diagnosis", response_model=FullDiagnosisResponse, summary="Execute Full Diagnostic & Recommendation Workflow (JSON)")
def execute_full_diagnosis(request: FullDiagnosisRequest):
    """
    Unified end-to-end diagnosis workflow (Phases 2-7):
    Validates crop, runs model inference, fuses questionnaire evidence,
    and retrieves source-backed IPM recommendations with decision-status gating.
    """
    img_bytes = None
    if request.image_base64:
        try:
            img_bytes = base64.b64decode(request.image_base64.split(",")[-1])
        except Exception:
            pass

    return workflow_orchestrator.execute_workflow(
        questionnaire_payload=request.questionnaire_payload,
        image_bytes=img_bytes,
        mock_model_scores=request.mock_model_scores,
        model_version=request.model_version,
        state=request.state,
        district=request.district
    )

@router.post("/v1/full-diagnosis-upload", response_model=FullDiagnosisResponse, summary="Execute Full Diagnostic Workflow with Multipart Image Upload")
async def execute_full_diagnosis_upload(
    payload_json: str = Form(...),
    file: Optional[UploadFile] = File(None),
    mock_scores_json: Optional[str] = Form(None),
    state: Optional[str] = Form("Telangana"),
    district: Optional[str] = Form(None)
):
    """
    Multipart endpoint for direct farmer image file upload + structured questionnaire JSON payload.
    """
    try:
        payload_dict = json.loads(payload_json)
        q_payload = QuestionnaireSubmissionRequest(**payload_dict)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Invalid questionnaire payload JSON: {e}")

    mock_scores = None
    if mock_scores_json:
        try:
            mock_scores = json.loads(mock_scores_json)
        except Exception:
            pass

    img_bytes = None
    fname = None
    if file:
        img_bytes = await file.read()
        fname = file.filename
        if len(img_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty image file uploaded. Please select a valid photo.")
        if len(img_bytes) > 15 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image file exceeds maximum limit of 15MB.")
        try:
            np_arr = np.frombuffer(img_bytes, np.uint8)
            cv_img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if cv_img is None or cv_img.shape[0] < 16 or cv_img.shape[1] < 16:
                raise HTTPException(status_code=400, detail="Corrupted or unreadable image file. Please upload a valid JPG, PNG, or WEBP photo.")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to decode image data: {e}")

    return workflow_orchestrator.execute_workflow(
        questionnaire_payload=q_payload,
        image_bytes=img_bytes,
        filename=fname,
        mock_model_scores=mock_scores,
        state=state,
        district=district
    )

@router.post("/v1/diagnose", response_model=DiagnosisResponse, summary="Execute Multimodal Diagnosis Pipeline")
def execute_diagnosis(request: DiagnosisRequest):
    """
    Executes the 12-stage multimodal diagnostic decision engine:
    Combines image model scores, farmer questionnaire evidence, crop gating,
    and organ compatibility matrices. Supports explicit selective prediction and abstention.
    """
    return diagnosis_engine.run_diagnosis_pipeline(request)

@router.post("/v1/recommend", response_model=RecommendationResponse, summary="Generate Evidence-Based Agronomic Recommendations")
def get_recommendations(request: RecommendationRequest):
    """
    Retrieves validated, source-backed IPM recommendations, look-alikes, and chemical controls.
    Enforces strict status gating: withholds disease-specific chemical treatments if the diagnostic status is uncertain.
    """
    return recommendation_service.generate_recommendations(request)

@router.get("/v1/knowledge/{disease_id}", summary="Retrieve Specific Crop Disease Knowledge Record")
def get_disease_knowledge(disease_id: str):
    """Retrieves validated knowledge record including symptoms, IPM options, and evidence references."""
    if os.path.exists(KB_PATH):
        with open(KB_PATH, "r", encoding="utf-8") as f:
            records = json.load(f).get("records", [])
            for r in records:
                if r["disease_id"] == disease_id:
                    return r
    raise HTTPException(status_code=404, detail=f"Knowledge record for disease '{disease_id}' not found.")

@router.get("/v1/sources", summary="Retrieve Authoritative Evidence Sources")
def get_evidence_sources():
    """Returns official institutional sources (PJTSAU, ANGRAU, ICAR, CIBRC, CABI)."""
    if os.path.exists(SOURCES_PATH):
        with open(SOURCES_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"sources": []}

@router.get("/v1/statuses", summary="Retrieve Decision Status Catalog")
def get_decision_statuses():
    """Returns all 10 explicit decision and abstention statuses, trigger conditions, and farmer actions."""
    if os.path.exists(STATUS_CATALOG_PATH):
        with open(STATUS_CATALOG_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"catalog_version": "2.0.0", "statuses": []}

@router.get("/v1/rules", summary="Retrieve Evidence Fusion Rules")
def get_evidence_fusion_rules():
    """Returns provisional, configurable evidence fusion weights, symptom matching matrices, and contradiction rules."""
    if os.path.exists(RULES_PATH):
        with open(RULES_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"rules_version": "2.0.0", "rules": {}}
