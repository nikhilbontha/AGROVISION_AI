from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime

class ImageReference(BaseModel):
    filename: Optional[str] = None
    content_type: Optional[str] = None
    size_bytes: Optional[int] = Field(None, le=15728640)
    sha256: Optional[str] = None

class LocationContext(BaseModel):
    state: Optional[str] = Field(None, max_length=100)
    district: Optional[str] = Field(None, max_length=100)

class QuestionnaireSubmissionRequest(BaseModel):
    questionnaire_version: str = "2.0.0"
    image_reference: Optional[ImageReference] = None
    selected_crop_id: str = Field(..., description="Canonical crop ID, crop_unsure, or crop_unsupported")
    crop_selection_source: str = Field("farmer_manual", description="farmer_manual, farmer_confirmed_model, farmer_override_model, unsure, unsupported")
    affected_organ: str = Field(..., description="leaves, stems, roots, flowers, fruits, pods, ears_cobs, rhizomes_tubers, bolls, panicles_seeds, whole_plant, unsure, other")
    affected_organs: Optional[List[str]] = Field(default_factory=list, description="Optional multi-organ selection list")
    symptom_ids: List[str] = Field(..., min_items=1, description="List of observed symptom IDs")
    symptom_location: str = Field("loc_unsure", description="loc_single_part, loc_multiple_parts_single_plant, loc_multiple_plants, loc_whole_field, loc_unsure")
    symptom_duration: str = Field("dur_unsure", description="dur_1_to_3_days, dur_4_to_7_days, dur_1_to_2_weeks, dur_over_2_weeks, dur_unsure")
    spread_rate: str = Field("spread_unsure", description="spread_rapid, spread_slow, spread_none, spread_unsure")
    growth_stage: Optional[str] = Field(None, description="stage_seedling, stage_vegetative, stage_flowering, stage_fruiting, stage_maturity, stage_unsure")
    weather_and_field_conditions: Optional[List[str]] = Field(default_factory=list)
    visible_pests: str = Field("pest_unsure", description="pest_yes, pest_no, pest_unsure")
    previous_treatment: str = Field("treatment_no", description="treatment_yes, treatment_no")
    treatment_details: Optional[str] = Field(None, max_length=300)
    optional_location: Optional[LocationContext] = None
    sowing_date: Optional[str] = Field(None, max_length=30)
    variety_name: Optional[str] = Field(None, max_length=100)
    irrigation_method: Optional[str] = Field(None, max_length=100)
    additional_notes: Optional[str] = Field(None, max_length=1000)
    unknown_or_skipped_fields: Optional[List[str]] = Field(default_factory=list)
    submitted_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    @validator('selected_crop_id')
    def validate_crop_id_format(cls, v):
        if not (v.startswith('crop_') or v in ['unsure', 'unsupported']):
            raise ValueError(f"Invalid crop ID format: {v}")
        return v

class StructuredEvidenceReceipt(BaseModel):
    receipt_id: str
    status: str = "EVIDENCE_STRUCTURED_ACCEPTED"
    questionnaire_version: str
    validated_crop_id: str
    crop_canonical_name: str
    is_crop_supported: bool
    affected_organ: str
    organ_validation_status: str
    symptom_count: int
    reported_symptoms: List[Dict[str, str]]
    environmental_context: Dict[str, Any]
    unknown_or_skipped_fields: List[str]
    discrepancy_flags: List[str]
    ready_for_multimodal_inference: bool
    disclaimer: str
    received_at: datetime
