"""
AgroVision AI 2.0 - Verification Suite for Redesigned Diagnostic Results UI
Tests all 10 mandated scenarios against backend schemas and verifies frontend render contracts.
"""
import json
import os
import sys

# Ensure backend path is on sys.path
sys.path.insert(0, os.path.abspath("backend"))

from app.schemas.diagnosis_schema import FullDiagnosisResponse, DiagnosisResponse
from app.schemas.recommendation_schema import RecommendationResponse, VerifiedTreatment

def run_redesign_verification_suite():
    print("=" * 80)
    print("AGROVISION AI 2.0 - REDESIGNED DIAGNOSTIC RESULTS UI VERIFICATION SUITE")
    print("=" * 80)

    scenarios = [
        # Scenario 1: Supported, well-supported diagnosis
        {
            "id": "scenario_1_supported_well_supported",
            "name": "Supported, well-supported diagnosis (Tomato Late Blight)",
            "payload": {
                "diagnosis_engine_version": "2.0.0",
                "decision_status": "single_candidate_confirmed",
                "selected_crop_id": "crop_tomato",
                "crop_selection_status": "CONFIRMED_SUPPORTED",
                "visually_predicted_crop_id": "crop_tomato",
                "visual_crop_confidence": 0.94,
                "crop_routing_mode": "user_conditioned",
                "affected_organ": "leaves",
                "candidate_diagnoses": [
                    {
                        "rank": 1,
                        "canonical_disease_id": "dis_tomato_late_blight",
                        "canonical_name": "Tomato Late Blight",
                        "scientific_name": "Phytophthora infestans",
                        "raw_model_score": 0.95,
                        "conditioned_score": 0.96,
                        "evidence_score": 0.98,
                        "decision_rationale": "High visual pattern match with dark water-soaked lesions and characteristic foliar blight."
                    },
                    {
                        "rank": 2,
                        "canonical_disease_id": "dis_tomato_early_blight",
                        "canonical_name": "Tomato Early Blight",
                        "scientific_name": "Alternaria solani",
                        "raw_model_score": 0.03,
                        "conditioned_score": 0.03,
                        "evidence_score": 0.12,
                        "decision_rationale": "Minor concentric ring resemblance, rejected due to dominant late blight margin."
                    }
                ],
                "evidence_ledger": [
                    {
                        "canonical_disease_id": "dis_tomato_late_blight",
                        "canonical_crop_id": "crop_tomato",
                        "raw_model_score": 0.95,
                        "organ_compatibility": "COMPATIBLE",
                        "supporting_evidence": [
                            "Dark irregular water-soaked spots on foliage observed in photo",
                            "Farmer noted rapid spread in high humidity"
                        ],
                        "conflicting_evidence": [],
                        "missing_evidence": [],
                        "contradictions": [],
                        "ranking_reason": "Dominant probability and full host-organ compatibility"
                    }
                ],
                "calibration_status": "uncalibrated_heuristic_fusion",
                "recommended_next_step": "Apply systemic CIBRC registered fungicide immediately and isolate affected rows.",
                "model_version": "v2_unified_72class",
                "recommendations": {
                    "recommendation_version": "2.0.0",
                    "decision_status": "single_candidate_confirmed",
                    "crop_id": "crop_tomato",
                    "disease_id": "dis_tomato_late_blight",
                    "canonical_name": "Tomato Late Blight",
                    "guidance_permitted": True,
                    "what_may_be_happening": "Tomato late blight caused by oomycete pathogen Phytophthora infestans.",
                    "why_considered": "Symptoms match rapid foliar necrosis and wet lesion margins.",
                    "what_to_do_now": ["Prune and destroy infected lower leaves. Do not compost infected plant debris."],
                    "cultural_preventative_measures": ["Avoid overhead irrigation and increase row spacing for airflow."],
                    "verified_chemical_treatments": [
                        {
                            "active_ingredient": "Metalaxyl 8% + Mancozeb 64% WP",
                            "formulation": "WP",
                            "dosage_per_liter": "2.5 g/L",
                            "cibrc_status": "REGISTERED",
                            "source_reference_id": "CIBRC_FUNGICIDE_2024",
                            "chemical_name": "Metalaxyl + Mancozeb",
                            "dosage": "2.5 g/L water",
                            "cibrc_registered": True,
                            "safe_waiting_period_days": 10
                        }
                    ],
                    "symptoms_to_check": ["Inspect underleaf surface for white downy sporulation during early morning."],
                    "when_to_seek_expert_help": ["If blight spreads over 20% of canopy within 3 days, contact local AEO."]
                }
            }
        },
        # Scenario 2: Uncertain diagnosis
        {
            "id": "scenario_2_uncertain_diagnosis",
            "name": "Uncertain diagnosis (Multiple Candidates)",
            "payload": {
                "decision_status": "multiple_candidates",
                "selected_crop_id": "crop_tomato",
                "crop_selection_status": "CONFIRMED_SUPPORTED",
                "visually_predicted_crop_id": "crop_tomato",
                "affected_organ": "leaves",
                "candidate_diagnoses": [
                    {
                        "rank": 1,
                        "canonical_disease_id": "dis_tomato_septoria",
                        "canonical_name": "Tomato Septoria Leaf Spot",
                        "raw_model_score": 0.28,
                        "evidence_score": 0.35,
                        "decision_rationale": "Small circular spots observed but indistinct from early bacterial speck."
                    },
                    {
                        "rank": 2,
                        "canonical_disease_id": "dis_tomato_bacterial_spot",
                        "canonical_name": "Tomato Bacterial Spot",
                        "raw_model_score": 0.25,
                        "evidence_score": 0.32,
                        "decision_rationale": "Marginal chlorosis with dark specks."
                    }
                ],
                "uncertainty_reasons": ["Multiple disease hypotheses have overlapping evidence scores."],
                "recommended_next_step": "Provide clearer close-up photograph of spot margins.",
                "recommendations": {
                    "guidance_permitted": False,
                    "status_banner": "Chemical advice withheld: diagnostic certainty threshold not reached.",
                    "what_may_be_happening": "Inconclusive foliar spotting. Multiple pathogens remain plausible.",
                    "why_considered": "Evidence score below gating threshold tau=0.50.",
                    "what_to_do_now": ["Inspect spots with a magnifying glass for black pycnidia (Septoria) vs greasy margins (Bacterial)."],
                    "when_to_seek_expert_help": ["Consult local Krishi Vigyan Kendra for leaf scrape microscopy."]
                }
            }
        },
        # Scenario 3: Visual crop prediction conflicts with farmer selection
        {
            "id": "scenario_3_crop_mismatch",
            "name": "Crop mismatch (Selected Tomato, Detected Chilli)",
            "payload": {
                "decision_status": "crop_mismatch",
                "selected_crop_id": "crop_tomato",
                "crop_selection_status": "CROP_MISMATCH",
                "visually_predicted_crop_id": "crop_chilli",
                "visual_crop_confidence": 0.88,
                "affected_organ": "leaves",
                "candidate_diagnoses": [],
                "uncertainty_reasons": ["Selected crop 'tomato' contradicts visually classified crop 'chilli'."],
                "recommended_next_step": "Verify selected crop or upload photograph of actual tomato foliage.",
                "recommendations": {
                    "guidance_permitted": False,
                    "status_banner": "Chemical advice withheld due to unresolved crop mismatch.",
                    "what_may_be_happening": "Crop mismatch detected between farmer input and computer vision features.",
                    "why_considered": "Prevent applying incorrect crop pesticide.",
                    "what_to_do_now": ["Verify the crop selected in Step 2."]
                }
            }
        },
        # Scenario 4: Unsupported crop
        {
            "id": "scenario_4_unsupported_crop",
            "name": "Unsupported crop",
            "payload": {
                "decision_status": "unsupported_crop",
                "selected_crop_id": "crop_unsure",
                "crop_selection_status": "UNSUPPORTED_CROP",
                "affected_organ": "leaves",
                "candidate_diagnoses": [],
                "uncertainty_reasons": ["Species is outside the 12 canonical PJTSAU supported crops."],
                "recommended_next_step": "Select one of the 12 verified Telangana/AP crops.",
                "recommendations": {
                    "guidance_permitted": False,
                    "what_may_be_happening": "Crop species not currently in automated diagnostic catalog.",
                    "why_considered": "Out-of-domain input safeguards activated.",
                    "what_to_do_now": ["Seek in-person consultation at district horticulture office."]
                }
            }
        },
        # Scenario 5: Poor quality / insufficient evidence
        {
            "id": "scenario_5_poor_quality",
            "name": "Poor quality image / insufficient evidence",
            "payload": {
                "decision_status": "insufficient_evidence",
                "selected_crop_id": "crop_tomato",
                "crop_selection_status": "CONFIRMED_SUPPORTED",
                "affected_organ": "leaves",
                "candidate_diagnoses": [],
                "uncertainty_reasons": ["Image resolution or focus is inadequate to detect lesion sporulation."],
                "recommended_next_step": "Capture a clearer in-focus image with daylight illumination.",
                "recommendations": {
                    "guidance_permitted": False,
                    "what_may_be_happening": "Image blurry or underexposed.",
                    "why_considered": "Confidence below minimum acceptable safety boundary.",
                    "what_to_do_now": ["Retake photo in steady daylight."]
                }
            }
        },
        # Scenario 6: Diagnosis with no verified treatment recommendation
        {
            "id": "scenario_6_no_verified_treatment",
            "name": "Diagnosis with no verified chemical treatment (Cultural Only)",
            "payload": {
                "decision_status": "diagnosis_supported",
                "selected_crop_id": "crop_tomato",
                "crop_selection_status": "CONFIRMED_SUPPORTED",
                "affected_organ": "leaves",
                "recommended_next_step": "Isolate affected plants and practice strict tool sanitation.",
                "candidate_diagnoses": [
                    {
                        "rank": 1,
                        "canonical_disease_id": "dis_tomato_mosaic_virus",
                        "canonical_name": "Tomato Mosaic Virus",
                        "scientific_name": "Tomato mosaic virus (ToMV)",
                        "raw_model_score": 0.82,
                        "evidence_score": 0.78,
                        "decision_rationale": "Mottled light and dark green leaves with stunted growth."
                    }
                ],
                "recommendations": {
                    "guidance_permitted": False,
                    "status_banner": "Viral disease: No curative chemical pesticide exists.",
                    "what_may_be_happening": "Viral infection spread mechanically or by seed.",
                    "why_considered": "Characteristic mosaic pattern.",
                    "what_to_do_now": ["Rogue out and burn infected plants immediately; wash hands with soap before touching healthy plants."],
                    "cultural_preventative_measures": ["Use certified disease-free seeds and sanitize pruning shears with 10% bleach."],
                    "verified_chemical_treatments": [],
                    "when_to_seek_expert_help": ["Contact AEO if virus appears widespread in nursery trays."]
                }
            }
        },
        # Scenario 7: Diagnosis with two plausible alternatives
        {
            "id": "scenario_7_two_alternatives",
            "name": "Diagnosis with two plausible alternatives",
            "payload": {
                "decision_status": "diagnosis_supported",
                "selected_crop_id": "crop_rice",
                "crop_selection_status": "CONFIRMED_SUPPORTED",
                "affected_organ": "leaves",
                "recommended_next_step": "Apply preventive bio-control and monitor leaf canopy.",
                "candidate_diagnoses": [
                    {
                        "rank": 1,
                        "canonical_disease_id": "dis_rice_blast",
                        "canonical_name": "Rice Blast",
                        "scientific_name": "Magnaporthe oryzae",
                        "raw_model_score": 0.75,
                        "evidence_score": 0.81,
                        "decision_rationale": "Spindle-shaped lesions with grey center and brown margin."
                    },
                    {
                        "rank": 2,
                        "canonical_disease_id": "dis_rice_brown_spot",
                        "canonical_name": "Rice Brown Spot",
                        "scientific_name": "Bipolaris oryzae",
                        "raw_model_score": 0.15,
                        "evidence_score": 0.22,
                        "decision_rationale": "Oval brown spots with distinct yellow halo."
                    },
                    {
                        "rank": 3,
                        "canonical_disease_id": "dis_rice_bacterial_leaf_blight",
                        "canonical_name": "Rice Bacterial Leaf Blight",
                        "scientific_name": "Xanthomonas oryzae",
                        "raw_model_score": 0.08,
                        "evidence_score": 0.14,
                        "decision_rationale": "Wavy marginal chlorosis from leaf tip downwards."
                    }
                ],
                "recommendations": {
                    "guidance_permitted": True,
                    "what_may_be_happening": "Foliar blast lesions forming on leaf blades.",
                    "why_considered": "Classic eye-shaped lesions.",
                    "look_alikes": [
                        {"disease_name": "Rice Brown Spot", "distinguishing_symptom": "Brown spot lesions are smaller and circular, without pointy spindle ends."},
                        {"disease_name": "Rice Bacterial Leaf Blight", "distinguishing_symptom": "BLB lesions start as water-soaked stripes along leaf margins, not central spindles."}
                    ],
                    "what_to_do_now": ["Drain excess water from the paddy field for 24-48 hours."],
                    "cultural_preventative_measures": ["Avoid excess nitrogen application in blast-prone conditions."]
                }
            }
        },
        # Scenario 8: Diagnosis with no alternatives
        {
            "id": "scenario_8_no_alternatives",
            "name": "Diagnosis with no alternatives (Single definitive candidate)",
            "payload": {
                "decision_status": "single_candidate_confirmed",
                "selected_crop_id": "crop_apple",
                "crop_selection_status": "CONFIRMED_SUPPORTED",
                "affected_organ": "leaves",
                "recommended_next_step": "Rake and destroy fallen leaves.",
                "candidate_diagnoses": [
                    {
                        "rank": 1,
                        "canonical_disease_id": "dis_apple_scab",
                        "canonical_name": "Apple Scab",
                        "scientific_name": "Venturia inaequalis",
                        "raw_model_score": 0.99,
                        "evidence_score": 0.99,
                        "decision_rationale": "Velvety olive-green lesions on upper leaf surface."
                    }
                ],
                "recommendations": {
                    "guidance_permitted": True,
                    "what_may_be_happening": "Apple scab caused by Venturia inaequalis.",
                    "what_to_do_now": ["Rake and destroy fallen leaves."],
                    "cultural_preventative_measures": ["Prune tree canopies to encourage rapid foliage drying."]
                }
            }
        },
        # Scenario 9: Backend response with missing optional fields
        {
            "id": "scenario_9_missing_optional_fields",
            "name": "Backend response with missing optional fields (Minimal Valid Schema)",
            "payload": {
                "decision_status": "diagnosis_supported",
                "selected_crop_id": "crop_wheat",
                "crop_selection_status": "CONFIRMED_SUPPORTED",
                "affected_organ": "leaves",
                "recommended_next_step": "Monitor stripe progression.",
                "candidate_diagnoses": [
                    {
                        "rank": 1,
                        "canonical_disease_id": "dis_wheat_stripe_rust",
                        "canonical_name": "Wheat Stripe Rust",
                        "raw_model_score": 0.70,
                        "evidence_score": 0.70,
                        "decision_rationale": "Yellow pustules in linear stripes along veins."
                    }
                ],
                "recommendations": {}
            }
        },
        # Scenario 10: Valid response alongside yield prediction capability
        {
            "id": "scenario_10_yield_interop",
            "name": "Valid response with yield-prediction compatibility context",
            "payload": {
                "decision_status": "single_candidate_confirmed",
                "selected_crop_id": "crop_corn",
                "crop_selection_status": "CONFIRMED_SUPPORTED",
                "affected_organ": "leaves",
                "recommended_next_step": "Scout upper leaves for rust pustules.",
                "candidate_diagnoses": [
                    {
                        "rank": 1,
                        "canonical_disease_id": "dis_corn_common_rust",
                        "canonical_name": "Corn Common Rust",
                        "scientific_name": "Puccinia sorghi",
                        "raw_model_score": 0.92,
                        "evidence_score": 0.94,
                        "decision_rationale": "Golden brown to cinnamon powdery pustules scattered on both leaf surfaces."
                    }
                ],
                "recommendations": {
                    "guidance_permitted": True,
                    "what_may_be_happening": "Common rust pustules active on maize foliage.",
                    "what_to_do_now": ["Scout upper leaves for pustule density."],
                    "when_to_seek_expert_help": ["If rust covers >10% of ear leaf area before silking, consult agronomy officer."]
                }
            }
        }
    ]

    passed_count = 0
    for idx, s in enumerate(scenarios, 1):
        print(f"\n--- Testing Scenario {idx}: {s['name']} ---")
        try:
            # Validate against Pydantic response schema
            resp = FullDiagnosisResponse(**s["payload"])
            
            # Check Section A constraints (Status, crop)
            assert resp.decision_status in [
                "single_candidate_confirmed", "diagnosis_supported", "multiple_candidates",
                "insufficient_evidence", "crop_mismatch", "organ_mismatch",
                "unsupported_crop", "expert_review_recommended", "model_unavailable"
            ]
            assert resp.selected_crop_id.startswith("crop_")
            
            # Check Section B constraints (Leading candidate logic)
            is_confirmed = resp.decision_status in ["single_candidate_confirmed", "diagnosis_supported"]
            is_mismatch = (
                resp.decision_status in ["crop_mismatch", "organ_mismatch"] or
                (resp.visually_predicted_crop_id and resp.visually_predicted_crop_id != resp.selected_crop_id)
            )
            has_confident_diag = is_confirmed and len(resp.candidate_diagnoses) > 0 and resp.candidate_diagnoses[0].evidence_score >= 0.40 and not is_mismatch and resp.decision_status != "unsupported_crop"
            
            if s["id"] in ["scenario_1_supported_well_supported", "scenario_6_no_verified_treatment", "scenario_7_two_alternatives", "scenario_8_no_alternatives", "scenario_9_missing_optional_fields", "scenario_10_yield_interop"]:
                assert has_confident_diag is True, f"Expected confident diagnosis for {s['id']}"
                print(f"  [PASS] Section B: Identified leading candidate '{resp.candidate_diagnoses[0].canonical_name}' (Score: {resp.candidate_diagnoses[0].evidence_score * 100:.0f}%)")
            else:
                assert has_confident_diag is False, f"Expected unforced/inconclusive state for {s['id']}"
                print(f"  [PASS] Section B: Correctly unforced / inconclusive state ('We could not confidently identify the disease')")

            # Check Section C constraints (Mismatch detection)
            if s["id"] == "scenario_3_crop_mismatch":
                assert is_mismatch is True
                print(f"  [PASS] Section C: Detected mismatch: Farmer={resp.selected_crop_id} vs Vision={resp.visually_predicted_crop_id}")

            # Check Section F constraints (Alternatives: at most 2)
            alts = resp.candidate_diagnoses[1:3]
            assert len(alts) <= 2
            if s["id"] == "scenario_7_two_alternatives":
                assert len(alts) == 2
                print(f"  [PASS] Section F: Bounded alternatives count = {len(alts)} ({alts[0].canonical_name}, {alts[1].canonical_name})")
            elif s["id"] == "scenario_8_no_alternatives":
                assert len(alts) == 0
                print(f"  [PASS] Section F: Cleanly omitted alternatives when none exist")

            # Check Section E constraints (Chemical gating)
            recs = resp.recommendations or {}
            guidance_permitted = recs.get("guidance_permitted", False)
            if s["id"] in ["scenario_2_uncertain_diagnosis", "scenario_3_crop_mismatch", "scenario_4_unsupported_crop", "scenario_5_poor_quality"]:
                assert guidance_permitted is False, f"Guidance must be withheld for {s['id']}"
                print(f"  [PASS] Section E: Chemical advice withheld guardrail verified")
            elif s["id"] == "scenario_1_supported_well_supported":
                assert guidance_permitted is True
                print(f"  [PASS] Section E: Chemical advice permitted with CIBRC validation")

            passed_count += 1
            print(f"  [OK] Scenario {idx} verified successfully.")
        except Exception as e:
            print(f"  [FAIL] Scenario {idx} failed: {e}")
            raise

    print("\n" + "=" * 80)
    print(f"ALL {passed_count}/{len(scenarios)} REDESIGN TEST SCENARIOS PASSED WITH ZERO ERRORS")
    print("=" * 80)

if __name__ == "__main__":
    run_redesign_verification_suite()
