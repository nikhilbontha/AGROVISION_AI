from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.schemas.questionnaire_schema import QuestionnaireSubmissionRequest

class DiagnosisCandidate(BaseModel):
    rank: int = Field(..., ge=1)
    canonical_disease_id: str
    canonical_name: str
    scientific_name: Optional[str] = None
    raw_model_score: float = Field(..., ge=0.0, le=1.0)
    conditioned_score: Optional[float] = None
    evidence_score: float = Field(..., ge=0.0, le=1.0)
    decision_rationale: str

class LedgerEntry(BaseModel):
    canonical_disease_id: str
    canonical_crop_id: str
    raw_model_score: float
    organ_compatibility: str
    supporting_evidence: List[str] = Field(default_factory=list)
    conflicting_evidence: List[str] = Field(default_factory=list)
    missing_evidence: List[str] = Field(default_factory=list)
    contradictions: List[str] = Field(default_factory=list)
    ranking_reason: str

class RawModelScore(BaseModel):
    output_index: int
    class_label: str
    score: float

class FollowUpQuestion(BaseModel):
    question_id: str
    question_text: str
    purpose: str
    allowed_options: List[Dict[str, Any]] = Field(default_factory=list)

class DiagnosisRequest(BaseModel):
    questionnaire_payload: QuestionnaireSubmissionRequest
    model_version: Optional[str] = "v1_baseline_39class"
    # Deterministic mock scores allowed for testing or decoupled evaluation
    mock_model_scores: Optional[List[Dict[str, Any]]] = None

class DiagnosisResponse(BaseModel):
    diagnosis_engine_version: str = "2.0.0"
    decision_status: str
    selected_crop_id: str
    crop_selection_status: str
    visually_predicted_crop_id: Optional[str] = None
    visual_crop_confidence: Optional[float] = None
    crop_routing_mode: str = "user_conditioned"
    gating_threshold_info: str = "Decision threshold tau >= 0.50 applied to multimodal evidence fusion score"
    affected_organ: str
    candidate_diagnoses: List[DiagnosisCandidate] = Field(default_factory=list)
    evidence_ledger: List[LedgerEntry] = Field(default_factory=list)
    raw_model_scores: List[RawModelScore] = Field(default_factory=list)
    calibration_status: str = "uncalibrated_heuristic_fusion"
    uncertainty_reasons: List[str] = Field(default_factory=list)
    contradictions: List[str] = Field(default_factory=list)
    follow_up_questions: List[FollowUpQuestion] = Field(default_factory=list)
    recommended_next_step: str
    knowledge_references: List[str] = Field(default_factory=list)
    model_version: str = "v1_baseline_39class"
    taxonomy_version: str = "2.0.0"
    questionnaire_version: str = "2.0.0"
    limitations: List[str] = Field(default_factory=list)

class FullDiagnosisResponse(DiagnosisResponse):
    recommendations: Optional[Dict[str, Any]] = None
    processed_image: Optional[str] = None
    lesion_count: Optional[int] = 0
    severity: Optional[str] = "Low"
    bounding_boxes: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
