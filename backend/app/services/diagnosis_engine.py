import os
import json
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime

from app.schemas.diagnosis_schema import (
    DiagnosisRequest,
    DiagnosisResponse,
    DiagnosisCandidate,
    LedgerEntry,
    RawModelScore,
    FollowUpQuestion
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
CROP_REG_PATH = os.path.join(BASE_DIR, "docs", "agrovision_v2", "phase2", "crop_registry.json")
DIS_REG_PATH = os.path.join(BASE_DIR, "docs", "agrovision_v2", "phase2", "disease_registry.json")
MATRIX_PATH = os.path.join(BASE_DIR, "docs", "agrovision_v2", "phase2", "crop_organ_compatibility_matrix.json")
MAPPING_PATH = os.path.join(BASE_DIR, "docs", "agrovision_v2", "phase2", "model_class_mapping_proposal.json")
RULES_PATH = os.path.join(BASE_DIR, "docs", "agrovision_v2", "phase5", "evidence_fusion_rules.json")
STATUS_CATALOG_PATH = os.path.join(BASE_DIR, "docs", "agrovision_v2", "phase5", "decision_status_catalog.json")
QUESTIONNAIRE_CONFIG_PATH = os.path.join(BASE_DIR, "docs", "agrovision_v2", "phase4", "questionnaire_config.json")

class DiagnosisEngine:
    def __init__(self):
        self._crop_registry = {}
        self._disease_registry = {}
        self._organ_matrix = {}
        self._model_mappings = {}
        self._fusion_rules = {}
        self._questionnaire_config = {}
        self._load_metadata()

    def _load_metadata(self):
        if os.path.exists(CROP_REG_PATH):
            with open(CROP_REG_PATH, "r", encoding="utf-8") as f:
                crops = json.load(f).get("crops", [])
                self._crop_registry = {c["crop_id"]: c for c in crops}

        if os.path.exists(DIS_REG_PATH):
            with open(DIS_REG_PATH, "r", encoding="utf-8") as f:
                diseases = json.load(f).get("diseases", [])
                self._disease_registry = {d["disease_id"]: d for d in diseases}

        if os.path.exists(MATRIX_PATH):
            with open(MATRIX_PATH, "r", encoding="utf-8") as f:
                matrix = json.load(f).get("crops_matrix", [])
                self._organ_matrix = {m["crop_id"]: m.get("crop_level_organ_status", {}) for m in matrix}

        if os.path.exists(MAPPING_PATH):
            with open(MAPPING_PATH, "r", encoding="utf-8") as f:
                self._model_mappings = json.load(f).get("models", {})

        if os.path.exists(RULES_PATH):
            with open(RULES_PATH, "r", encoding="utf-8") as f:
                self._fusion_rules = json.load(f)

        if os.path.exists(QUESTIONNAIRE_CONFIG_PATH):
            with open(QUESTIONNAIRE_CONFIG_PATH, "r", encoding="utf-8") as f:
                self._questionnaire_config = json.load(f)

        self._tf_probed = False
        self._tf_available = False
        self._tf_msg = ""

    # -------------------------------------------------------------------------
    # STAGE 1: Input and Payload Validation
    # -------------------------------------------------------------------------
    def stage_1_validate_input(self, request: DiagnosisRequest) -> Tuple[bool, List[str]]:
        errors = []
        payload = request.questionnaire_payload
        if not payload.selected_crop_id:
            errors.append("MISSING_SELECTED_CROP_ID")
        if not payload.affected_organ:
            errors.append("MISSING_AFFECTED_ORGAN")
        if not payload.symptom_ids:
            errors.append("MISSING_SYMPTOM_IDS")
        return len(errors) == 0, errors

    # -------------------------------------------------------------------------
    # STAGE 2: Image / Model Availability Check
    # -------------------------------------------------------------------------
    def stage_2_check_model_availability(self, request: DiagnosisRequest) -> Tuple[bool, str]:
        # If deterministic mock scores are provided (for test decoupling), accept
        if request.mock_model_scores is not None:
            return True, "DETERMINISTIC_MOCK_ADAPTER"

        # Check real model loading
        model_version = request.model_version or "v1_baseline_39class"
        mapping = self._model_mappings.get(model_version)
        if not mapping:
            return False, f"UNKNOWN_MODEL_VERSION:{model_version}"

        ckpt_path = mapping.get("checkpoint_path", "")
        abs_ckpt = os.path.join(BASE_DIR, ckpt_path)
        if not os.path.exists(abs_ckpt):
            return False, f"MODEL_CHECKPOINT_NOT_FOUND_ON_DISK:{ckpt_path}"

        # Real TensorFlow runtime test with cached result
        if not self._tf_probed:
            self._tf_probed = True
            try:
                import tensorflow as tf
                _ = tf.constant([1.0, 2.0])
                self._tf_available = True
                self._tf_msg = "TENSORFLOW_AVAILABLE"
            except Exception as e:
                self._tf_available = False
                self._tf_msg = f"TENSORFLOW_RUNTIME_UNAVAILABLE: ({str(e)})"

        return self._tf_available, self._tf_msg

    # -------------------------------------------------------------------------
    # STAGE 3: Model Output & Class-Index Validation
    # -------------------------------------------------------------------------
    def stage_3_validate_model_indices(self, model_version: str, raw_scores: List[Dict[str, Any]]) -> Tuple[bool, List[str]]:
        errors = []
        mapping_info = self._model_mappings.get(model_version, {})
        class_mappings = mapping_info.get("output_class_mappings", [])
        expected_classes = mapping_info.get("total_classes", len(class_mappings))

        indices_seen = set()
        for item in raw_scores:
            idx = item.get("output_index")
            if idx is None or idx < 0 or idx >= expected_classes:
                errors.append(f"OUT_OF_BOUNDS_INDEX:{idx}")
            if idx in indices_seen:
                errors.append(f"DUPLICATE_INDEX:{idx}")
            indices_seen.add(idx)

        return len(errors) == 0, errors

    # -------------------------------------------------------------------------
    # STAGE 4: Crop Identity Evidence Assessment
    # -------------------------------------------------------------------------
    # STAGE 4: Crop Identity Evidence Assessment & Routing
    # -------------------------------------------------------------------------
    def stage_4_assess_crop(
        self,
        selected_crop_id: str,
        crop_mass: Dict[str, float],
        visual_top_crop: Optional[str]
    ) -> Tuple[str, str, List[str]]:
        reasons = []
        if selected_crop_id == "crop_unsupported":
            return "unsupported_crop", "unsupported", ["CROP_SPECIES_NOT_IN_CANONICAL_CATALOG"]

        if selected_crop_id not in self._crop_registry and selected_crop_id != "crop_unsure":
            return "unsupported_crop", "unsupported", [f"UNKNOWN_CROP_ID:{selected_crop_id}"]

        if selected_crop_id == "crop_unsure":
            reasons.append("FARMER_UNCERTAIN_OF_CROP")
            if visual_top_crop and crop_mass.get(visual_top_crop, 0.0) >= 0.35:
                reasons.append(f"Auto-routed to visual dominant crop '{visual_top_crop}' ({crop_mass[visual_top_crop]*100:.1f}% confidence).")
                return "auto_routed", "visual_auto_detected", reasons
            return "crop_uncertain", "visual_auto_detected", reasons

        # Farmer explicitly selected a known crop
        selected_mass = crop_mass.get(selected_crop_id, 0.0)
        top_mass = crop_mass.get(visual_top_crop, 0.0) if visual_top_crop else 0.0

        # Known botanical sister families with similar foliar texture
        solanaceae = {"crop_tomato", "crop_potato", "crop_chilli", "crop_pepper_bell"}
        cereals = {"crop_wheat", "crop_corn", "crop_rice"}

        is_sister_confusion = (
            (visual_top_crop in solanaceae and selected_crop_id in solanaceae) or
            (visual_top_crop in cereals and selected_crop_id in cereals)
        )

        # Trigger decisive crop mismatch ONLY if visual evidence overwhelmingly contradicts the farmer
        # and it is NOT a sister-crop foliar confusion
        if visual_top_crop and visual_top_crop != selected_crop_id:
            if top_mass >= 0.65 and selected_mass < 0.05 and not is_sister_confusion:
                reasons.append(
                    f"CROP_DISAGREEMENT: Farmer selected '{selected_crop_id}' ({selected_mass*100:.1f}%), but visual features decisively indicate '{visual_top_crop}' ({top_mass*100:.1f}%)."
                )
                return "crop_mismatch_detected", "user_conditioned", reasons

        # Standard User-Conditioned Diagnosis
        reasons.append(
            f"Diagnosis conditioned on farmer-selected host '{selected_crop_id}'. Visual feature distribution: {visual_top_crop} ({top_mass*100:.1f}%), {selected_crop_id} ({selected_mass*100:.1f}%)."
        )
        return "user_conditioned_verified", "user_conditioned", reasons

    # -------------------------------------------------------------------------
    # STAGE 5: Plant-Organ Compatibility Assessment
    # -------------------------------------------------------------------------
    def stage_5_assess_organ(self, crop_id: str, organ: str) -> Tuple[str, float, List[str]]:
        notes = []
        if organ in ["unsure", "whole_plant"]:
            return "PRESERVED_UNCERTAINTY", 0.85, ["ORGAN_UNCERTAINTY_PRESERVED"]

        crop_matrix = self._organ_matrix.get(crop_id, {})
        status_info = crop_matrix.get(organ, {})
        policy = status_info.get("validation_policy", "UNSUPPORTED")

        weight_config = self._fusion_rules.get("organ_compatibility_weights", {})
        weight = weight_config.get(policy, {}).get("weight", 0.0)

        if policy == "UNSUPPORTED":
            notes.append(f"INCOMPATIBLE_ORGAN: Organ '{organ}' is biologically unsupported for '{crop_id}'.")
        elif policy == "REFERENCE_ONLY_UNTESTED":
            notes.append(f"UNTESTED_ORGAN_DOMAIN: Organ '{organ}' confirmed in literature but has no field training images.")

        return policy, weight, notes

    # -------------------------------------------------------------------------
    # STAGE 6: Image-Based Candidate Diagnosis Generation
    # -------------------------------------------------------------------------
    def stage_6_generate_candidates(self, model_version: str, raw_scores: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        mapping_info = self._model_mappings.get(model_version, {})
        class_mappings = {m["output_index"]: m for m in mapping_info.get("output_class_mappings", [])}

        candidates = []
        for s in raw_scores:
            idx = s["output_index"]
            score = float(s["score"])
            mapping = class_mappings.get(idx, {})
            c_dis_id = mapping.get("canonical_disease_id", "dis_unknown")
            c_crop_id = mapping.get("canonical_crop_id", "crop_unknown")
            c_name = mapping.get("canonical_name", mapping.get("raw_output_label", f"Class_{idx}"))

            candidates.append({
                "output_index": idx,
                "raw_model_score": score,
                "canonical_disease_id": c_dis_id,
                "canonical_crop_id": c_crop_id,
                "canonical_name": c_name
            })

        # Sort descending by raw score
        candidates.sort(key=lambda x: x["raw_model_score"], reverse=True)
        return candidates

    # -------------------------------------------------------------------------
    # STAGE 7 & 8: Questionnaire Symptom Extraction & Compatibility
    # -------------------------------------------------------------------------
    def stage_8_assess_compatibility(
        self,
        candidate: Dict[str, Any],
        farmer_crop_id: str,
        affected_organ: str,
        reported_symptoms: List[str],
        conditions: List[str]
    ) -> Dict[str, Any]:
        c_dis_id = candidate["canonical_disease_id"]
        c_crop_id = candidate["canonical_crop_id"]
        dis_info = self._disease_registry.get(c_dis_id, {})

        supporting = []
        conflicting = []
        missing = []
        contradictions = []
        score_mod = 0.0

        # Host Crop Check
        is_host_match = True
        if farmer_crop_id not in ["crop_unsure", "crop_unsupported"] and farmer_crop_id != c_crop_id:
            is_host_match = False
            conflicting.append(f"Host mismatch: Candidate belongs to '{c_crop_id}', but farmer selected '{farmer_crop_id}'.")

        # Organ Check (Pathogen-level tissue tropism)
        supported_organs = dis_info.get("supported_organs", ["leaves"])
        organs_to_check = [affected_organ] if isinstance(affected_organ, str) else list(affected_organ)
        has_organ_match = any(org in ["unsure", "whole_plant"] or org in supported_organs for org in organs_to_check)
        if not has_organ_match:
            organ_status = "TISSUE_MISMATCH"
            conflicting.append(f"Organ mismatch: Disease typically affects {supported_organs}, not '{affected_organ}'.")
            contradictions.append(f"ORGAN_CONTRADICTION:foliar_disease_on_{affected_organ}")
            score_mod -= 0.35
        else:
            organ_status = "COMPATIBLE"

        # Symptom Matching
        symptom_matrix = self._fusion_rules.get("symptom_pathology_matrix", {})
        for sym_id in reported_symptoms:
            rule = symptom_matrix.get(sym_id, {})
            if c_dis_id in rule.get("typical_diseases", []):
                supporting.append(f"Symptom '{sym_id}' strongly matches characteristic pathology.")
                score_mod += 0.25
            elif c_dis_id in rule.get("conflicts_with", []):
                conflicting.append(f"Symptom '{sym_id}' conflicts with candidate condition.")
                contradictions.append(f"SYMPTOM_CONTRADICTION:{sym_id}_conflicts_with_{c_dis_id}")
                score_mod -= 0.40

        # Environmental Prior
        env_rules = self._fusion_rules.get("environmental_priors", {})
        pathogen_type = dis_info.get("pathogen_type", "")
        for cond_id in conditions:
            env_rule = env_rules.get(cond_id, {})
            if pathogen_type in env_rule.get("favored_pathogens", []):
                supporting.append(f"Environmental condition '{cond_id}' favors {pathogen_type} pathogens.")
                score_mod += env_rule.get("weight_modifier", 0.10)

        # Healthy Foliage Contradiction Check
        if dis_info.get("condition_type") == "healthy" or "healthy" in c_dis_id:
            severe_symptoms = {"sym_rot", "sym_wilting", "sym_water_soaked"}
            if any(s in severe_symptoms for s in reported_symptoms):
                contradictions.append("CONTRADICTION:healthy_model_vs_severe_symptom")
                conflicting.append("Model indicates Healthy foliage, but farmer reports severe rot/wilting.")

        return {
            "supporting_evidence": supporting,
            "conflicting_evidence": conflicting,
            "missing_evidence": missing,
            "contradictions": contradictions,
            "score_modifier": score_mod,
            "organ_status": organ_status,
            "is_host_match": is_host_match
        }

    # -------------------------------------------------------------------------
    # STAGE 9 & 10: Evidence Fusion, Contradictions, and Uncertainty
    # -------------------------------------------------------------------------
    def stage_9_10_fuse_evidence(
        self,
        candidates: List[Dict[str, Any]],
        farmer_crop_id: str,
        affected_organ: str,
        organ_policy: str,
        organ_weight: float,
        reported_symptoms: List[str],
        conditions: List[str]
    ) -> Tuple[List[DiagnosisCandidate], List[LedgerEntry], List[str], List[str]]:
        ranked_candidates = []
        ledger_entries = []
        all_contradictions = []
        uncertainty_reasons = []

        # 1. Separate Eligible Host Candidates vs Cross-Crop Candidates
        if farmer_crop_id not in ["crop_unsure", "crop_unsupported"]:
            eligible_cands = [c for c in candidates if c["canonical_crop_id"] == farmer_crop_id]
        else:
            eligible_cands = candidates

        # Compute within-host conditional probability (user-conditioned softmax)
        eligible_sum = sum(c["raw_model_score"] for c in eligible_cands)
        for cand in eligible_cands:
            raw_score = cand["raw_model_score"]
            cond_score = round(raw_score / eligible_sum, 4) if eligible_sum > 0 else round(raw_score, 4)

            compat = self.stage_8_assess_compatibility(
                cand, farmer_crop_id, affected_organ, reported_symptoms, conditions
            )

            # Multimodal Evidence Score: weighted conditioned vision score + symptom/prior modifier
            raw_ev_score = cond_score * organ_weight + compat["score_modifier"]
            ev_score = max(0.0, min(1.0, round(raw_ev_score, 4)))

            dis_info = self._disease_registry.get(cand["canonical_disease_id"], {})
            sci_name = dis_info.get("scientific_name")

            rationale = "Candidate evaluated under user-conditioned host and tissue constraints."
            if compat["contradictions"]:
                rationale = f"Penalized due to {len(compat['contradictions'])} severe evidence contradictions."
            elif compat["supporting_evidence"]:
                rationale = f"Supported by {len(compat['supporting_evidence'])} symptom/environmental observations."

            # Map organ compatibility status to pathogen-specific tissue match
            tissue_status = compat["organ_status"]
            if organ_policy == "UNSUPPORTED":
                tissue_status = "UNSUPPORTED_ORGAN"

            ranked_candidates.append({
                "canonical_disease_id": cand["canonical_disease_id"],
                "canonical_crop_id": cand["canonical_crop_id"],
                "canonical_name": cand["canonical_name"],
                "scientific_name": sci_name,
                "raw_model_score": round(raw_score, 4),
                "conditioned_score": cond_score,
                "evidence_score": ev_score,
                "decision_rationale": rationale,
                "tissue_status": tissue_status,
                "compat": compat
            })

        # Sort primarily by evidence score, secondarily by conditioned model score
        ranked_candidates.sort(key=lambda x: (x["evidence_score"], x["conditioned_score"]), reverse=True)

        # Build output candidates list (Top 5)
        final_candidates = []
        for i, c in enumerate(ranked_candidates[:5]):
            final_candidates.append(DiagnosisCandidate(
                rank=i + 1,
                canonical_disease_id=c["canonical_disease_id"],
                canonical_name=c["canonical_name"],
                scientific_name=c["scientific_name"],
                raw_model_score=c["raw_model_score"],
                conditioned_score=c["conditioned_score"],
                evidence_score=c["evidence_score"],
                decision_rationale=c["decision_rationale"]
            ))

            # Only collect contradictions from top active candidates considered for diagnosis
            if c["compat"]["contradictions"]:
                all_contradictions.extend(c["compat"]["contradictions"])

            # Populate Evidence Ledger for these active diagnostic candidates
            ledger_entries.append(LedgerEntry(
                canonical_disease_id=c["canonical_disease_id"],
                canonical_crop_id=c["canonical_crop_id"],
                raw_model_score=c["raw_model_score"],
                organ_compatibility=c["tissue_status"],
                supporting_evidence=c["compat"]["supporting_evidence"],
                conflicting_evidence=c["compat"]["conflicting_evidence"],
                missing_evidence=c["compat"]["missing_evidence"],
                contradictions=c["compat"]["contradictions"],
                ranking_reason=c["decision_rationale"]
            ))

        # If unconditioned raw top-1 class belonged to another crop, append an explicit audit entry
        if candidates and farmer_crop_id not in ["crop_unsure", "crop_unsupported"]:
            raw_top = candidates[0]
            if raw_top["canonical_crop_id"] != farmer_crop_id:
                ledger_entries.append(LedgerEntry(
                    canonical_disease_id=raw_top["canonical_disease_id"],
                    canonical_crop_id=raw_top["canonical_crop_id"],
                    raw_model_score=round(raw_top["raw_model_score"], 4),
                    organ_compatibility="INCOMPATIBLE_HOST",
                    supporting_evidence=[],
                    conflicting_evidence=[
                        f"Cross-crop visual feature: Model highest unconditioned raw score belongs to '{raw_top['canonical_crop_id']}', eliminated by farmer host selection '{farmer_crop_id}'."
                    ],
                    missing_evidence=[],
                    contradictions=["HOST_MISMATCH:foreign_crop_candidate"],
                    ranking_reason="Eliminated from diagnosis: Foreign crop species. Maintained in ledger for model auditability."
                ))

        all_contradictions = list(set(all_contradictions))
        return final_candidates, ledger_entries, all_contradictions, uncertainty_reasons

    # -------------------------------------------------------------------------
    # STAGE 11: Selective Prediction and Abstention Decision
    # -------------------------------------------------------------------------
    def stage_11_decide_status(
        self,
        model_available: bool,
        crop_status: str,
        organ_policy: str,
        candidates: List[DiagnosisCandidate],
        contradictions: List[str]
    ) -> Tuple[str, str, List[str]]:
        reasons = []

        if not model_available:
            return "model_unavailable", "Vision model checkpoint could not be loaded due to OS policy.", [
                "MODEL_CHECKPOINT_OR_RUNTIME_UNAVAILABLE"
            ]

        if crop_status == "unsupported_crop":
            return "unsupported_crop", "Selected crop species is outside the validated 15-crop catalog.", [
                "CROP_NOT_IN_CANONICAL_REGISTRY"
            ]

        if crop_status == "crop_mismatch_detected":
            return "crop_mismatch", "Visual foliage features disagree with farmer's selected crop.", [
                "MODEL_VS_FARMER_CROP_DISAGREEMENT"
            ]

        if organ_policy == "UNSUPPORTED":
            return "organ_mismatch", "The selected plant part cannot be evaluated for this crop.", [
                "ORGAN_POLICY_UNSUPPORTED"
            ]

        # Only trigger healthy contradiction if the top candidate is healthy foliage
        top_is_healthy = False
        if candidates:
            top_dis = self._disease_registry.get(candidates[0].canonical_disease_id, {})
            if top_dis.get("condition_type") == "healthy" or "healthy" in candidates[0].canonical_disease_id:
                top_is_healthy = True

        if top_is_healthy and "CONTRADICTION:healthy_model_vs_severe_symptom" in contradictions:
            return "expert_review_recommended", "Critical contradiction between visual healthy prediction and severe farmer symptoms.", [
                "HEALTHY_MODEL_VS_SEVERE_ROT_CONTRADICTION"
            ]

        if not candidates or all(c.evidence_score < 0.35 for c in candidates):
            return "insufficient_evidence", "Evidence is insufficient to support any diagnosis hypothesis.", [
                "ALL_CANDIDATE_SCORES_BELOW_BASELINE_THRESHOLD"
            ]

        # Check for Multiple Close Candidates (Ambiguity)
        if len(candidates) >= 2:
            top_1 = candidates[0].evidence_score
            top_2 = candidates[1].evidence_score
            margin = top_1 - top_2
            if margin < 0.15 and top_1 >= 0.40:
                reasons.append(f"AMBIGUOUS_CANDIDATES: Top-1 ({candidates[0].canonical_name}) and Top-2 ({candidates[1].canonical_name}) score margin is {margin:.3f} (< 0.15).")
                return "multiple_candidates", "Multiple plausible disease candidates identified. Differential diagnosis provided.", reasons

        # Diagnosis Supported
        if candidates and candidates[0].evidence_score >= 0.50:
            return "diagnosis_supported", "Diagnosis supported by consistent visual and symptom evidence.", []

        return "needs_more_information", "Diagnostic score is moderate; additional symptom details needed.", [
            "MODERATE_CONFIDENCE_REQUIRES_FOLLOWUP"
        ]

    # -------------------------------------------------------------------------
    # STAGE 10 & 12: Follow-Up Questions Selection & Diagnostic Report
    # -------------------------------------------------------------------------
    def stage_12_generate_report(
        self,
        request: DiagnosisRequest,
        decision_status: str,
        crop_status: str,
        candidates: List[DiagnosisCandidate],
        ledger: List[LedgerEntry],
        raw_scores_formatted: List[RawModelScore],
        contradictions: List[str],
        uncertainty_reasons: List[str],
        status_message: str,
        visually_predicted_crop_id: Optional[str] = None,
        visual_crop_confidence: Optional[float] = None,
        crop_routing_mode: str = "user_conditioned"
    ) -> DiagnosisResponse:
        payload = request.questionnaire_payload

        # Select Follow-Up Questions from Phase 4 configuration
        follow_ups = []
        if decision_status in ["multiple_candidates", "needs_more_information", "insufficient_evidence"]:
            questions = self._questionnaire_config.get("questions", [])
            answered_ids = set()
            if payload.symptom_ids and any(s != "sym_unsure" for s in payload.symptom_ids):
                answered_ids.add("q_symptoms_observed")
            if payload.symptom_location and payload.symptom_location != "loc_unsure":
                answered_ids.add("q_symptom_location")
            if payload.symptom_duration and payload.symptom_duration != "dur_unsure":
                answered_ids.add("q_symptom_duration")
            if payload.spread_rate and payload.spread_rate != "spread_unsure":
                answered_ids.add("q_spread_rate")
            if payload.growth_stage and payload.growth_stage != "stage_unsure":
                answered_ids.add("q_growth_stage")
            if payload.weather_and_field_conditions and any(c != "cond_unsure" for c in payload.weather_and_field_conditions):
                answered_ids.add("q_recent_conditions")
            if payload.visible_pests and payload.visible_pests != "pest_unsure":
                answered_ids.add("q_visible_pests")
            if payload.previous_treatment is not None:
                answered_ids.add("q_previous_treatment")

            purpose_map = {
                "q_growth_stage": "Identify crop phenological stage and developmental vulnerability window",
                "q_recent_conditions": "Assess microclimate humidity and leaf wetness favoring fungal sporulation",
                "q_spread_rate": "Differentiate between rapid airborne dispersal and slow localized disease progression",
                "q_symptom_duration": "Distinguish acute virulent infection from chronic physiological stress",
                "q_visible_pests": "Detect insect vectors transmitting viral or bacterial pathogens",
                "q_symptom_location": "Determine whether infection is localized or systemic across the field canopy",
                "q_previous_treatment": "Rule out phytotoxicity or fungicide tolerance altering visual appearance"
            }

            for q in questions:
                q_id = q.get("question_id")
                if q_id in answered_ids:
                    continue
                applicable_crops = q.get("applicable_crop_ids", ["*"])
                if applicable_crops != ["*"] and payload.selected_crop_id not in applicable_crops:
                    continue
                applicable_organs = q.get("applicable_plant_organs", ["*"])
                if applicable_organs != ["*"] and payload.affected_organ not in applicable_organs:
                    continue
                if q.get("display_conditions"):
                    continue

                purpose = purpose_map.get(q_id, "Clarify field context to resolve candidate diagnostic ambiguity")
                follow_ups.append(FollowUpQuestion(
                    question_id=q_id,
                    question_text=q["question_text"],
                    purpose=purpose,
                    allowed_options=q.get("allowed_options", [])[:4]
                ))
                if len(follow_ups) >= 2:
                    break

        # Recommended Next Steps
        recommended_next_step = status_message
        if decision_status == "diagnosis_supported" and candidates:
            recommended_next_step = f"Inspect foliage for {candidates[0].canonical_name}. Refer to validated agronomic IPM practices."
        elif decision_status == "unsupported_crop":
            recommended_next_step = "Take fresh physical plant samples to your local Krishi Vigyan Kendra (KVK) or district agricultural officer."
        elif decision_status in ["crop_mismatch", "organ_mismatch"]:
            recommended_next_step = "Re-check crop selection and take a closer photo focusing on clear affected foliage."

        # Knowledge References
        refs = [
            "ICAR Integrated Pest Management Packages for Horticultural Crops (2024)",
            "CABI PlantwisePlus Knowledge Bank (2023)",
            "ANGRAU Crop Protection Diagnostic Manual (2024)"
        ]

        limitations = [
            "Decision threshold tau >= 0.50 applies to the multimodal evidence fusion score (combining vision, symptoms, organ specificity, and environment), not a calibrated Bayesian posterior.",
            "Visual feature extraction is conditioned on dataset representations; unconditioned 72-class probabilities represent raw heuristic logits.",
            "This diagnosis decision engine provides decision-support evidence and does not substitute for accredited agricultural laboratory testing."
        ]

        return DiagnosisResponse(
            diagnosis_engine_version="2.0.0",
            decision_status=decision_status,
            selected_crop_id=payload.selected_crop_id,
            crop_selection_status=crop_status,
            visually_predicted_crop_id=visually_predicted_crop_id,
            visual_crop_confidence=visual_crop_confidence,
            crop_routing_mode=crop_routing_mode,
            gating_threshold_info="Decision threshold tau >= 0.50 applied to multimodal evidence fusion score",
            affected_organ=payload.affected_organ,
            candidate_diagnoses=candidates,
            evidence_ledger=ledger[:8],
            raw_model_scores=raw_scores_formatted[:10],
            calibration_status="uncalibrated_heuristic_fusion",
            uncertainty_reasons=uncertainty_reasons,
            contradictions=contradictions,
            follow_up_questions=follow_ups,
            recommended_next_step=recommended_next_step,
            knowledge_references=refs,
            model_version=request.model_version or "v1_baseline_39class",
            taxonomy_version="2.0.0",
            questionnaire_version=payload.questionnaire_version,
            limitations=limitations
        )

    # -------------------------------------------------------------------------
    # MASTER PIPELINE EXECUTION
    # -------------------------------------------------------------------------
    def run_diagnosis_pipeline(self, request: DiagnosisRequest) -> DiagnosisResponse:
        self._load_metadata()
        payload = request.questionnaire_payload

        # Stage 1: Validate input
        is_valid, errs = self.stage_1_validate_input(request)
        if not is_valid:
            return self.stage_12_generate_report(
                request, "invalid_input", "crop_uncertain", [], [], [], [], errs,
                f"Invalid request payload: {', '.join(errs)}"
            )

        # Early Taxonomy Boundary Check: Unsupported Crop
        if payload.selected_crop_id == "crop_unsupported":
            return self.stage_12_generate_report(
                request, "unsupported_crop", "unsupported_crop", [], [], [], [],
                ["CROP_SPECIES_NOT_IN_CANONICAL_CATALOG"],
                "The selected crop is not supported in the AgroVision 2.0 canonical taxonomy.",
                crop_routing_mode="unsupported"
            )

        # Stage 2: Check Model Availability
        model_avail, model_msg = self.stage_2_check_model_availability(request)

        # Handle Mock or Real Model Scores
        raw_scores = request.mock_model_scores or []
        raw_scores_formatted = [
            RawModelScore(output_index=s["output_index"], class_label=s.get("class_label", f"Index_{s['output_index']}"), score=float(s["score"]))
            for s in raw_scores
        ]

        # Stage 3: Validate Model Output Indices if scores present
        if raw_scores:
            idx_valid, idx_errs = self.stage_3_validate_model_indices(request.model_version or "v1_baseline_39class", raw_scores)
            if not idx_valid:
                return self.stage_12_generate_report(
                    request, "invalid_input", "crop_uncertain", [], [], raw_scores_formatted, [], idx_errs,
                    f"Model output indices validation failure: {', '.join(idx_errs)}"
                )

        # If model is unavailable and no mock scores provided -> Abstain
        if not model_avail and not raw_scores:
            return self.stage_12_generate_report(
                request, "model_unavailable", "crop_uncertain", [], [], [], [], [model_msg],
                "Neural vision model is unavailable due to OS Application Control security policy."
            )

        # Stage 6: Generate Candidates
        candidates_raw = self.stage_6_generate_candidates(request.model_version or "v1_baseline_39class", raw_scores)

        # Calculate Crop Family Probability Distribution
        crop_mass: Dict[str, float] = {}
        mapping_info = self._model_mappings.get(request.model_version or "v1_baseline_39class", {})
        class_mappings = {m["output_index"]: m for m in mapping_info.get("output_class_mappings", [])}
        for s in raw_scores:
            idx = s["output_index"]
            m = class_mappings.get(idx, {})
            c_id = m.get("canonical_crop_id")
            if c_id:
                crop_mass[c_id] = crop_mass.get(c_id, 0.0) + float(s["score"])

        visual_top_crop = max(crop_mass.items(), key=lambda x: x[1])[0] if crop_mass else None
        visual_top_conf = round(crop_mass[visual_top_crop], 4) if visual_top_crop else None

        # Stage 4: Assess Crop Identity & Routing Mode
        crop_status, crop_routing_mode, crop_reasons = self.stage_4_assess_crop(
            payload.selected_crop_id, crop_mass, visual_top_crop
        )

        # Stage 5: Assess Organ Compatibility
        organ_policy, organ_weight, organ_notes = self.stage_5_assess_organ(payload.selected_crop_id, payload.affected_organ)

        # Stage 9 & 10: Fuse Evidence
        final_candidates, ledger, contradictions, uncertainty_reasons = self.stage_9_10_fuse_evidence(
            candidates_raw,
            payload.selected_crop_id,
            payload.affected_organ,
            organ_policy,
            organ_weight,
            payload.symptom_ids,
            payload.weather_and_field_conditions or []
        )
        uncertainty_reasons.extend(crop_reasons + organ_notes)

        # Stage 11: Decide Status (Abstention / Selective Prediction)
        decision_status, status_msg, decision_reasons = self.stage_11_decide_status(
            model_avail, crop_status, organ_policy, final_candidates, contradictions
        )
        uncertainty_reasons.extend(decision_reasons)

        # Stage 12: Generate Report
        return self.stage_12_generate_report(
            request,
            decision_status,
            crop_status,
            final_candidates,
            ledger,
            raw_scores_formatted,
            contradictions,
            list(set(uncertainty_reasons)),
            status_msg,
            visually_predicted_crop_id=visual_top_crop,
            visual_crop_confidence=visual_top_conf,
            crop_routing_mode=crop_routing_mode
        )

diagnosis_engine = DiagnosisEngine()
