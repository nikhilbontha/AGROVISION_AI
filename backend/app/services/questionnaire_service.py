import os
import json
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from fastapi import HTTPException
from app.schemas.questionnaire_schema import QuestionnaireSubmissionRequest, StructuredEvidenceReceipt

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
CROP_REG_PATH = os.path.join(BASE_DIR, "docs", "agrovision_v2", "phase2", "crop_registry.json")
MATRIX_PATH = os.path.join(BASE_DIR, "docs", "agrovision_v2", "phase2", "crop_organ_compatibility_matrix.json")
CONFIG_PATH = os.path.join(BASE_DIR, "docs", "agrovision_v2", "phase4", "questionnaire_config.json")

class QuestionnaireService:
    def __init__(self):
        self._crop_registry = None
        self._organ_matrix = None
        self._config = None
        self._load_metadata()

    def _load_metadata(self):
        if os.path.exists(CROP_REG_PATH):
            with open(CROP_REG_PATH, "r", encoding="utf-8") as f:
                self._crop_registry = json.load(f).get("crops", [])
        else:
            self._crop_registry = []

        if os.path.exists(MATRIX_PATH):
            with open(MATRIX_PATH, "r", encoding="utf-8") as f:
                self._organ_matrix = json.load(f).get("crops_matrix", [])
        else:
            self._organ_matrix = []

        if os.path.exists(CONFIG_PATH):
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                self._config = json.load(f)
        else:
            self._config = {"config_version": "2.0.0", "questions": []}

    def get_config(self) -> Dict[str, Any]:
        if not self._config or not self._config.get("questions"):
            self._load_metadata()
        return self._config

    def get_supported_crops(self) -> List[Dict[str, Any]]:
        if not self._crop_registry:
            self._load_metadata()
        
        crops_list = []
        for c in self._crop_registry:
            crops_list.append({
                "crop_id": c["crop_id"],
                "canonical_name": c["canonical_name"],
                "aliases": c.get("aliases", []),
                "scientific_name": c.get("scientific_name", ""),
                "supported_organs": c.get("supported_organs", []),
                "verification_status": c.get("verification_status", "unknown")
            })
        
        # Add special uncertainty choices
        crops_list.append({
            "crop_id": "crop_unsure",
            "canonical_name": "I am not sure / Unidentified Crop",
            "aliases": ["Unknown", "Unsure"],
            "scientific_name": "",
            "supported_organs": ["leaves", "stems", "roots", "flowers", "fruits", "whole_plant", "unsure"],
            "verification_status": "uncertainty_supported"
        })
        crops_list.append({
            "crop_id": "crop_unsupported",
            "canonical_name": "Other Crop (Not in Catalog)",
            "aliases": ["Unsupported"],
            "scientific_name": "",
            "supported_organs": ["leaves", "stems", "roots", "flowers", "fruits", "whole_plant", "unsure"],
            "verification_status": "unsupported"
        })
        return crops_list

    def validate_crop_organ_compatibility(self, crop_id: str, organ: str) -> Dict[str, Any]:
        if not self._crop_registry or not self._organ_matrix:
            self._load_metadata()

        if crop_id in ["crop_unsure", "crop_unsupported"]:
            return {
                "crop_id": crop_id,
                "organ": organ,
                "is_compatible": True,
                "validation_policy": "PRESERVED_UNCERTAINTY",
                "message": "Crop uncertainty preserved. Organ will be recorded as general botanical evidence."
            }

        crop_entry = next((c for c in self._crop_registry if c["crop_id"] == crop_id), None)
        if not crop_entry:
            return {
                "crop_id": crop_id,
                "organ": organ,
                "is_compatible": False,
                "validation_policy": "INVALID_CROP",
                "message": f"Unknown crop identifier '{crop_id}'. Not found in canonical registry."
            }

        if organ in ["unsure", "other"]:
            return {
                "crop_id": crop_id,
                "organ": organ,
                "is_compatible": True,
                "validation_policy": "PRESERVED_UNCERTAINTY",
                "message": "Organ uncertainty preserved. Diagnostic engine will not force organ-specific constraints."
            }

        # Check in compatibility matrix
        matrix_entry = next((m for m in self._organ_matrix if m["crop_id"] == crop_id), None)
        if matrix_entry:
            organ_status = matrix_entry.get("crop_level_organ_status", {}).get(organ, {})
            policy = organ_status.get("validation_policy", "UNSUPPORTED")
            is_compat = policy in ["PERMITTED", "REFERENCE_ONLY_UNTESTED"]
            return {
                "crop_id": crop_id,
                "organ": organ,
                "is_compatible": is_compat,
                "validation_policy": policy,
                "represented_in_dataset": organ_status.get("represented_in_dataset", False),
                "supported_by_reference": organ_status.get("supported_by_reference", False),
                "message": f"Organ '{organ}' policy for {crop_entry['canonical_name']} is '{policy}'."
            }

        # Fallback to crop_entry supported_organs
        supported = crop_entry.get("supported_organs", [])
        is_compat = organ in supported
        return {
            "crop_id": crop_id,
            "organ": organ,
            "is_compatible": is_compat,
            "validation_policy": "PERMITTED" if is_compat else "UNSUPPORTED",
            "message": f"Organ '{organ}' {'is supported' if is_compat else 'is not supported'} for {crop_entry['canonical_name']}."
        }

    def process_farmer_evidence(self, submission: QuestionnaireSubmissionRequest) -> StructuredEvidenceReceipt:
        if not self._config:
            self._load_metadata()

        discrepancy_flags = []
        skipped_or_unknown = list(submission.unknown_or_skipped_fields or [])

        # 1. Validate Crop
        crop_id = submission.selected_crop_id
        is_supported = True
        crop_canonical_name = "Unknown Crop"

        if crop_id == "crop_unsure":
            is_supported = False
            crop_canonical_name = "Unidentified / Unsure Crop"
            discrepancy_flags.append("CROP_UNCERTAINTY_FLAGGED")
            skipped_or_unknown.append("selected_crop")
        elif crop_id == "crop_unsupported":
            is_supported = False
            crop_canonical_name = "Unsupported Crop"
            discrepancy_flags.append("UNSUPPORTED_CROP_REQUESTED")
        else:
            crop_entry = next((c for c in self._crop_registry if c["crop_id"] == crop_id), None)
            if not crop_entry:
                raise HTTPException(status_code=400, detail=f"Invalid canonical crop ID '{crop_id}'. Not found in Phase 2 registry.")
            crop_canonical_name = crop_entry["canonical_name"]

        # 2. Validate Organ
        organ_val = self.validate_crop_organ_compatibility(crop_id, submission.affected_organ)
        organ_policy = organ_val.get("validation_policy", "UNSUPPORTED")
        if not organ_val.get("is_compatible", False):
            discrepancy_flags.append(f"INCOMPATIBLE_ORGAN_FOR_CROP:{submission.affected_organ}")

        if submission.affected_organ in ["unsure", "other"]:
            skipped_or_unknown.append("affected_organ")

        # 3. Validate Symptoms against Config
        symptom_q = next((q for q in self._config.get("questions", []) if q["question_id"] == "q_symptoms_observed"), None)
        valid_symptom_ids = {opt["option_id"] for opt in symptom_q.get("allowed_options", [])} if symptom_q else set()

        reported_symptom_details = []
        for sym_id in submission.symptom_ids:
            if valid_symptom_ids and sym_id not in valid_symptom_ids:
                raise HTTPException(status_code=400, detail=f"Invalid symptom ID '{sym_id}'. Not recognized in questionnaire configuration.")
            
            # Lookup label
            opt_label = sym_id
            if symptom_q:
                opt = next((o for o in symptom_q.get("allowed_options", []) if o["option_id"] == sym_id), None)
                if opt:
                    opt_label = opt["label"]
            reported_symptom_details.append({"symptom_id": sym_id, "label": opt_label})

        if "sym_unsure" in submission.symptom_ids:
            skipped_or_unknown.append("symptoms_uncertain")

        # 4. Check Conditional Logic
        if submission.previous_treatment == "treatment_no" and submission.treatment_details:
            # Treatment details should not be set if treatment was No
            discrepancy_flags.append("CONDITIONAL_MISMATCH:treatment_details_provided_without_treatment")

        # 5. Check Uncertainty in other fields
        if submission.symptom_duration == "dur_unsure":
            skipped_or_unknown.append("symptom_duration")
        if submission.spread_rate == "spread_unsure":
            skipped_or_unknown.append("spread_rate")
        if submission.symptom_location == "loc_unsure":
            skipped_or_unknown.append("symptom_location")
        if submission.visible_pests == "pest_unsure":
            skipped_or_unknown.append("visible_pests")
        if not submission.growth_stage or submission.growth_stage == "stage_unsure":
            skipped_or_unknown.append("growth_stage")

        # Environmental context packaging
        env_context = {
            "symptom_duration": submission.symptom_duration,
            "symptom_location": submission.symptom_location,
            "spread_rate": submission.spread_rate,
            "growth_stage": submission.growth_stage,
            "weather_and_field_conditions": submission.weather_and_field_conditions or [],
            "visible_pests": submission.visible_pests,
            "previous_treatment": submission.previous_treatment,
            "treatment_details": submission.treatment_details,
            "location": submission.optional_location.dict() if submission.optional_location else None,
            "sowing_date": submission.sowing_date,
            "variety_name": submission.variety_name,
            "irrigation_method": submission.irrigation_method,
            "additional_notes": submission.additional_notes
        }

        receipt = StructuredEvidenceReceipt(
            receipt_id=f"EVID_{uuid.uuid4().hex[:12].upper()}",
            status="EVIDENCE_STRUCTURED_ACCEPTED",
            questionnaire_version=submission.questionnaire_version,
            validated_crop_id=crop_id,
            crop_canonical_name=crop_canonical_name,
            is_crop_supported=is_supported,
            affected_organ=submission.affected_organ,
            organ_validation_status=organ_policy,
            symptom_count=len(submission.symptom_ids),
            reported_symptoms=reported_symptom_details,
            environmental_context=env_context,
            unknown_or_skipped_fields=list(set(skipped_or_unknown)),
            discrepancy_flags=discrepancy_flags,
            ready_for_multimodal_inference=True,
            disclaimer=(
                "Structured farmer evidence accepted and verified according to Phase 4 protocol. "
                "No visual prediction model has been altered or executed. This evidence is staged for "
                "Phase 5 multimodal Bayesian/heuristic diagnostic synthesis."
            ),
            received_at=datetime.utcnow()
        )
        return receipt

questionnaire_service = QuestionnaireService()
