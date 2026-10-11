from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class RecommendationRequest(BaseModel):
    crop_id: str
    disease_id: Optional[str] = None
    decision_status: str
    affected_organ: Optional[str] = "leaves"
    state: Optional[str] = "Telangana"
    district: Optional[str] = None
    season: Optional[str] = None
    evidence_context: Optional[Dict[str, Any]] = None

class VerifiedTreatment(BaseModel):
    active_ingredient: str
    formulation: str
    dosage_per_liter: str
    cibrc_status: str
    pre_harvest_interval_days: Optional[Any] = None
    source_reference_id: str
    chemical_name: Optional[str] = None
    dosage: Optional[str] = None
    cibrc_registered: Optional[bool] = True
    safe_waiting_period_days: Optional[Any] = None
    source_reference: Optional[str] = None

class RecommendationResponse(BaseModel):
    recommendation_version: str = "2.0.0"
    decision_status: str
    crop_id: str
    disease_id: Optional[str] = None
    canonical_name: Optional[str] = None
    guidance_permitted: bool
    status_banner: Optional[str] = None
    what_may_be_happening: str
    why_considered: str
    symptoms_to_check: List[str] = Field(default_factory=list)
    look_alikes: List[Any] = Field(default_factory=list)
    what_to_do_now: List[str] = Field(default_factory=list)
    cultural_preventative_measures: List[str] = Field(default_factory=list)
    biological_controls: List[str] = Field(default_factory=list)
    verified_chemical_treatments: List[VerifiedTreatment] = Field(default_factory=list)
    chemical_cautions: List[str] = Field(default_factory=list)
    prevention_and_monitoring: List[str] = Field(default_factory=list)
    when_to_seek_expert_help: List[str] = Field(default_factory=list)
    regional_advisory: Optional[Dict[str, Any]] = None
    evidence_references: List[Dict[str, Any]] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
