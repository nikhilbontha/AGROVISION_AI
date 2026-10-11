from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from app.schemas.questionnaire_schema import (
    QuestionnaireSubmissionRequest,
    StructuredEvidenceReceipt
)
from app.services.questionnaire_service import questionnaire_service

router = APIRouter()

class CropOrganValidationRequest(BaseModel):
    crop_id: str
    organ: str

@router.get("/config", summary="Retrieve versioned questionnaire configuration")
def get_questionnaire_config():
    """Returns the adaptive questionnaire questions, answer types, display conditions, and allowed options."""
    return questionnaire_service.get_config()

@router.get("/crops", summary="Retrieve canonical crop registry for selection")
def get_supported_crops():
    """Returns all validated crops from Phase 2 registry, including common aliases, scientific names, and supported organs."""
    return {"crops": questionnaire_service.get_supported_crops()}

@router.post("/validate-crop-organ", summary="Validate crop and affected plant organ compatibility")
def validate_crop_organ(payload: CropOrganValidationRequest):
    """Checks whether an organ (e.g. leaves, ears_cobs, tubers) is supported for the selected crop under the Phase 2 compatibility matrix."""
    return questionnaire_service.validate_crop_organ_compatibility(payload.crop_id, payload.organ)

@router.post("/submit-evidence", response_model=StructuredEvidenceReceipt, summary="Submit structured farmer questionnaire evidence")
def submit_questionnaire_evidence(payload: QuestionnaireSubmissionRequest):
    """
    Validates and structures farmer evidence for later multimodal disease diagnosis.
    Does NOT execute model inference or predict unsupported diseases.
    """
    return questionnaire_service.process_farmer_evidence(payload)
