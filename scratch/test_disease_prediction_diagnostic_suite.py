import os
import sys
import json
import cv2
import numpy as np

sys.path.insert(0, os.path.abspath("backend"))

from app.services.diagnostic_workflow_orchestrator import workflow_orchestrator
from app.schemas.questionnaire_schema import QuestionnaireSubmissionRequest

def run_diagnostic_suite():
    print("================================================================================")
    print("AGROVISION AI 2.0 - REPRODUCIBLE 12-SCENARIO DIAGNOSTIC VALIDATION TEST SUITE")
    print("================================================================================")

    results = []

    fixtures = {
        "tomato_healthy": r"datasets\regional_dataset_2\Andhra_Master_Dataset\Tomato_Healthy\000146ff-92a4-4db6-90ad-8fce2ae4fddd___GH_HL Leaf 259.1.JPG",
        "tomato_late_blight": r"datasets\regional_dataset_2\Andhra_Master_Dataset\Tomato_Late Blight\0003faa8-4b27-4c65-bf42-6d9e352ca1a5___RS_Late.B 4946.JPG",
        "chilli_healthy": r"datasets\regional_dataset_2\Andhra_Master_Dataset\Chilli_Healthy\1.jpeg",
        "chilli_anthracnose": r"datasets\regional_dataset_2\Andhra_Master_Dataset\Chilli_Anthracnose\IMG_0192_JPG.rf.59b533b31325c8b6ae209d8f1b11804a.jpg",
        "potato_early_blight": r"ml_models\disease_detection\dataset_prepared\test\Potato___Early_blight\Potato___Early_blight_test_8.jpg",
        "wheat_leaf_rust": r"ml_models\disease_detection\dataset_prepared\test\Wheat___Leaf_rust\Wheat___Leaf_rust_test_1.jpg",
        "corn_common_rust": r"ml_models\disease_detection\dataset_prepared\test\Corn___Common_rust\Corn___Common_rust_test_4.jpg"
    }

    # Helper to read bytes
    def read_bytes(path):
        with open(path, "rb") as f:
            return f.read()

    # 1. Tomato healthy leaf
    print("\n--- Test 1: Tomato Healthy Leaf ---")
    t1_bytes = read_bytes(fixtures["tomato_healthy"])
    t1_payload = QuestionnaireSubmissionRequest(
        selected_crop_id="crop_tomato",
        affected_organ="leaves",
        symptom_ids=["sym_unsure"],
        weather_and_field_conditions=[]
    )
    t1_resp = workflow_orchestrator.execute_workflow(t1_payload, image_bytes=t1_bytes, filename="tomato_healthy.jpg")
    results.append({
        "scenario_id": 1,
        "name": "Tomato healthy leaf",
        "expected_crop": "Tomato",
        "expected_disease": "Healthy",
        "inference_type": "REAL_MODEL",
        "status": t1_resp.decision_status,
        "crop_selection_status": t1_resp.crop_selection_status,
        "visual_predicted_crop": t1_resp.visually_predicted_crop_id,
        "top_candidate": t1_resp.candidate_diagnoses[0].canonical_name if t1_resp.candidate_diagnoses else None,
        "top_evidence_score": t1_resp.candidate_diagnoses[0].evidence_score if t1_resp.candidate_diagnoses else 0.0,
        "raw_model_score": t1_resp.candidate_diagnoses[0].raw_model_score if t1_resp.candidate_diagnoses else 0.0,
        "abstention_reasons": t1_resp.uncertainty_reasons,
        "guidance_permitted": t1_resp.recommendations.get("guidance_permitted") if t1_resp.recommendations else False
    })
    print(f"Status: {t1_resp.decision_status} | Top: {results[-1]['top_candidate']} ({results[-1]['top_evidence_score']*100:.1f}%)")

    # 2. Tomato leaf with known disease
    print("\n--- Test 2: Tomato Leaf with Late Blight ---")
    t2_bytes = read_bytes(fixtures["tomato_late_blight"])
    t2_payload = QuestionnaireSubmissionRequest(
        selected_crop_id="crop_tomato",
        affected_organ="leaves",
        symptom_ids=["sym_blight", "sym_water_soaked"],
        weather_and_field_conditions=["cond_high_humidity"]
    )
    t2_resp = workflow_orchestrator.execute_workflow(t2_payload, image_bytes=t2_bytes, filename="tomato_late_blight.jpg")
    results.append({
        "scenario_id": 2,
        "name": "Tomato leaf with known disease",
        "expected_crop": "Tomato",
        "expected_disease": "Late Blight",
        "inference_type": "REAL_MODEL",
        "status": t2_resp.decision_status,
        "crop_selection_status": t2_resp.crop_selection_status,
        "visual_predicted_crop": t2_resp.visually_predicted_crop_id,
        "top_candidate": t2_resp.candidate_diagnoses[0].canonical_name if t2_resp.candidate_diagnoses else None,
        "top_evidence_score": t2_resp.candidate_diagnoses[0].evidence_score if t2_resp.candidate_diagnoses else 0.0,
        "raw_model_score": t2_resp.candidate_diagnoses[0].raw_model_score if t2_resp.candidate_diagnoses else 0.0,
        "abstention_reasons": t2_resp.uncertainty_reasons,
        "guidance_permitted": t2_resp.recommendations.get("guidance_permitted") if t2_resp.recommendations else False
    })
    print(f"Status: {t2_resp.decision_status} | Top: {results[-1]['top_candidate']} ({results[-1]['top_evidence_score']*100:.1f}%)")

    # 3. Chilli healthy leaf
    print("\n--- Test 3: Chilli Healthy Leaf ---")
    t3_bytes = read_bytes(fixtures["chilli_healthy"])
    t3_payload = QuestionnaireSubmissionRequest(
        selected_crop_id="crop_chilli",
        affected_organ="leaves",
        symptom_ids=["sym_unsure"],
        weather_and_field_conditions=[]
    )
    t3_resp = workflow_orchestrator.execute_workflow(t3_payload, image_bytes=t3_bytes, filename="chilli_healthy.jpg")
    results.append({
        "scenario_id": 3,
        "name": "Chilli healthy leaf",
        "expected_crop": "Chilli",
        "expected_disease": "Healthy",
        "inference_type": "REAL_MODEL",
        "status": t3_resp.decision_status,
        "crop_selection_status": t3_resp.crop_selection_status,
        "visual_predicted_crop": t3_resp.visually_predicted_crop_id,
        "top_candidate": t3_resp.candidate_diagnoses[0].canonical_name if t3_resp.candidate_diagnoses else None,
        "top_evidence_score": t3_resp.candidate_diagnoses[0].evidence_score if t3_resp.candidate_diagnoses else 0.0,
        "raw_model_score": t3_resp.candidate_diagnoses[0].raw_model_score if t3_resp.candidate_diagnoses else 0.0,
        "abstention_reasons": t3_resp.uncertainty_reasons,
        "guidance_permitted": t3_resp.recommendations.get("guidance_permitted") if t3_resp.recommendations else False
    })
    print(f"Status: {t3_resp.decision_status} | Top: {results[-1]['top_candidate']} ({results[-1]['top_evidence_score']*100:.1f}%)")

    # 4. Chilli leaf with known disease (Anthracnose)
    print("\n--- Test 4: Chilli Leaf with Anthracnose ---")
    t4_bytes = read_bytes(fixtures["chilli_anthracnose"])
    t4_payload = QuestionnaireSubmissionRequest(
        selected_crop_id="crop_chilli",
        affected_organ="leaves",
        symptom_ids=["sym_spots", "sym_rot"],
        weather_and_field_conditions=["cond_high_humidity"]
    )
    t4_resp = workflow_orchestrator.execute_workflow(t4_payload, image_bytes=t4_bytes, filename="chilli_anthracnose.jpg")
    results.append({
        "scenario_id": 4,
        "name": "Chilli leaf with known disease",
        "expected_crop": "Chilli",
        "expected_disease": "Anthracnose",
        "inference_type": "REAL_MODEL",
        "status": t4_resp.decision_status,
        "crop_selection_status": t4_resp.crop_selection_status,
        "visual_predicted_crop": t4_resp.visually_predicted_crop_id,
        "top_candidate": t4_resp.candidate_diagnoses[0].canonical_name if t4_resp.candidate_diagnoses else None,
        "top_evidence_score": t4_resp.candidate_diagnoses[0].evidence_score if t4_resp.candidate_diagnoses else 0.0,
        "raw_model_score": t4_resp.candidate_diagnoses[0].raw_model_score if t4_resp.candidate_diagnoses else 0.0,
        "abstention_reasons": t4_resp.uncertainty_reasons,
        "guidance_permitted": t4_resp.recommendations.get("guidance_permitted") if t4_resp.recommendations else False
    })
    print(f"Status: {t4_resp.decision_status} | Top: {results[-1]['top_candidate']} ({results[-1]['top_evidence_score']*100:.1f}%)")

    # 5. Potato disease image
    print("\n--- Test 5: Potato Disease Image ---")
    t5_bytes = read_bytes(fixtures["potato_early_blight"])
    t5_payload = QuestionnaireSubmissionRequest(
        selected_crop_id="crop_potato",
        affected_organ="leaves",
        symptom_ids=["sym_blight"],
        weather_and_field_conditions=[]
    )
    t5_resp = workflow_orchestrator.execute_workflow(t5_payload, image_bytes=t5_bytes, filename="potato_early_blight.jpg")
    results.append({
        "scenario_id": 5,
        "name": "Potato disease image",
        "expected_crop": "Potato",
        "expected_disease": "Early Blight",
        "inference_type": "REAL_MODEL",
        "status": t5_resp.decision_status,
        "crop_selection_status": t5_resp.crop_selection_status,
        "visual_predicted_crop": t5_resp.visually_predicted_crop_id,
        "top_candidate": t5_resp.candidate_diagnoses[0].canonical_name if t5_resp.candidate_diagnoses else None,
        "top_evidence_score": t5_resp.candidate_diagnoses[0].evidence_score if t5_resp.candidate_diagnoses else 0.0,
        "raw_model_score": t5_resp.candidate_diagnoses[0].raw_model_score if t5_resp.candidate_diagnoses else 0.0,
        "abstention_reasons": t5_resp.uncertainty_reasons,
        "guidance_permitted": t5_resp.recommendations.get("guidance_permitted") if t5_resp.recommendations else False
    })
    print(f"Status: {t5_resp.decision_status} | Top: {results[-1]['top_candidate']} ({results[-1]['top_evidence_score']*100:.1f}%)")

    # 6. Wheat disease image
    print("\n--- Test 6: Wheat Disease Image ---")
    t6_bytes = read_bytes(fixtures["wheat_leaf_rust"])
    t6_payload = QuestionnaireSubmissionRequest(
        selected_crop_id="crop_wheat",
        affected_organ="leaves",
        symptom_ids=["sym_rust_pustules"],
        weather_and_field_conditions=[]
    )
    t6_resp = workflow_orchestrator.execute_workflow(t6_payload, image_bytes=t6_bytes, filename="wheat_leaf_rust.jpg")
    results.append({
        "scenario_id": 6,
        "name": "Wheat disease image",
        "expected_crop": "Wheat",
        "expected_disease": "Leaf Rust",
        "inference_type": "REAL_MODEL",
        "status": t6_resp.decision_status,
        "crop_selection_status": t6_resp.crop_selection_status,
        "visual_predicted_crop": t6_resp.visually_predicted_crop_id,
        "top_candidate": t6_resp.candidate_diagnoses[0].canonical_name if t6_resp.candidate_diagnoses else None,
        "top_evidence_score": t6_resp.candidate_diagnoses[0].evidence_score if t6_resp.candidate_diagnoses else 0.0,
        "raw_model_score": t6_resp.candidate_diagnoses[0].raw_model_score if t6_resp.candidate_diagnoses else 0.0,
        "abstention_reasons": t6_resp.uncertainty_reasons,
        "guidance_permitted": t6_resp.recommendations.get("guidance_permitted") if t6_resp.recommendations else False
    })
    print(f"Status: {t6_resp.decision_status} | Top: {results[-1]['top_candidate']} ({results[-1]['top_evidence_score']*100:.1f}%)")

    # 7. Corn disease image
    print("\n--- Test 7: Corn Disease Image ---")
    t7_bytes = read_bytes(fixtures["corn_common_rust"])
    t7_payload = QuestionnaireSubmissionRequest(
        selected_crop_id="crop_corn",
        affected_organ="leaves",
        symptom_ids=["sym_rust_pustules"],
        weather_and_field_conditions=[]
    )
    t7_resp = workflow_orchestrator.execute_workflow(t7_payload, image_bytes=t7_bytes, filename="corn_common_rust.jpg")
    results.append({
        "scenario_id": 7,
        "name": "Corn disease image",
        "expected_crop": "Corn",
        "expected_disease": "Common Rust",
        "inference_type": "REAL_MODEL",
        "status": t7_resp.decision_status,
        "crop_selection_status": t7_resp.crop_selection_status,
        "visual_predicted_crop": t7_resp.visually_predicted_crop_id,
        "top_candidate": t7_resp.candidate_diagnoses[0].canonical_name if t7_resp.candidate_diagnoses else None,
        "top_evidence_score": t7_resp.candidate_diagnoses[0].evidence_score if t7_resp.candidate_diagnoses else 0.0,
        "raw_model_score": t7_resp.candidate_diagnoses[0].raw_model_score if t7_resp.candidate_diagnoses else 0.0,
        "abstention_reasons": t7_resp.uncertainty_reasons,
        "guidance_permitted": t7_resp.recommendations.get("guidance_permitted") if t7_resp.recommendations else False
    })
    print(f"Status: {t7_resp.decision_status} | Top: {results[-1]['top_candidate']} ({results[-1]['top_evidence_score']*100:.1f}%)")

    # 8. Blurry or low-quality plant image
    print("\n--- Test 8: Blurry / Low-Quality Plant Image ---")
    raw_img = cv2.imread(fixtures["tomato_late_blight"])
    blurred_img = cv2.GaussianBlur(raw_img, (45, 45), 25)
    _, buf = cv2.imencode(".jpg", blurred_img)
    t8_bytes = buf.tobytes()
    t8_payload = QuestionnaireSubmissionRequest(
        selected_crop_id="crop_tomato",
        affected_organ="leaves",
        symptom_ids=["sym_unsure"],
        weather_and_field_conditions=[]
    )
    t8_resp = workflow_orchestrator.execute_workflow(t8_payload, image_bytes=t8_bytes, filename="blurry_leaf.jpg")
    results.append({
        "scenario_id": 8,
        "name": "Blurry or low-quality plant image",
        "expected_crop": "Tomato (Degraded)",
        "expected_disease": "Uncertain / Diffuse",
        "inference_type": "REAL_MODEL",
        "status": t8_resp.decision_status,
        "crop_selection_status": t8_resp.crop_selection_status,
        "visual_predicted_crop": t8_resp.visually_predicted_crop_id,
        "top_candidate": t8_resp.candidate_diagnoses[0].canonical_name if t8_resp.candidate_diagnoses else None,
        "top_evidence_score": t8_resp.candidate_diagnoses[0].evidence_score if t8_resp.candidate_diagnoses else 0.0,
        "raw_model_score": t8_resp.candidate_diagnoses[0].raw_model_score if t8_resp.candidate_diagnoses else 0.0,
        "abstention_reasons": t8_resp.uncertainty_reasons,
        "guidance_permitted": t8_resp.recommendations.get("guidance_permitted") if t8_resp.recommendations else False
    })
    print(f"Status: {t8_resp.decision_status} | Top: {results[-1]['top_candidate']} ({results[-1]['top_evidence_score']*100:.1f}%)")

    # 9. Non-plant image
    print("\n--- Test 9: Non-Plant Synthetic Image ---")
    synth_img = np.full((224, 224, 3), 128, dtype=np.uint8)
    cv2.circle(synth_img, (112, 112), 50, (0, 0, 255), -1) # Red synthetic circle
    _, buf_np = cv2.imencode(".jpg", synth_img)
    t9_bytes = buf_np.tobytes()
    t9_payload = QuestionnaireSubmissionRequest(
        selected_crop_id="crop_unsure",
        affected_organ="leaves",
        symptom_ids=["sym_unsure"],
        weather_and_field_conditions=[]
    )
    t9_resp = workflow_orchestrator.execute_workflow(t9_payload, image_bytes=t9_bytes, filename="non_plant.jpg")
    results.append({
        "scenario_id": 9,
        "name": "Non-plant image",
        "expected_crop": "Non-Plant / Uncertain",
        "expected_disease": "Abstain",
        "inference_type": "REAL_MODEL",
        "status": t9_resp.decision_status,
        "crop_selection_status": t9_resp.crop_selection_status,
        "visual_predicted_crop": t9_resp.visually_predicted_crop_id,
        "top_candidate": t9_resp.candidate_diagnoses[0].canonical_name if t9_resp.candidate_diagnoses else None,
        "top_evidence_score": t9_resp.candidate_diagnoses[0].evidence_score if t9_resp.candidate_diagnoses else 0.0,
        "raw_model_score": t9_resp.candidate_diagnoses[0].raw_model_score if t9_resp.candidate_diagnoses else 0.0,
        "abstention_reasons": t9_resp.uncertainty_reasons,
        "guidance_permitted": t9_resp.recommendations.get("guidance_permitted") if t9_resp.recommendations else False
    })
    print(f"Status: {t9_resp.decision_status} | Top: {results[-1]['top_candidate']}")

    # 10. Supported crop paired with a disease from another crop
    print("\n--- Test 10: Supported Crop Paired with Incompatible Disease Symptoms ---")
    t10_bytes = read_bytes(fixtures["tomato_late_blight"])
    t10_payload = QuestionnaireSubmissionRequest(
        selected_crop_id="crop_tomato",
        affected_organ="fruits",
        symptom_ids=["sym_mosaic_pattern"], # Viral foliar symptom on fruits
        weather_and_field_conditions=[]
    )
    t10_resp = workflow_orchestrator.execute_workflow(t10_payload, image_bytes=t10_bytes, filename="tomato_fruit_cross.jpg")
    results.append({
        "scenario_id": 10,
        "name": "Supported crop paired with cross-crop / mismatched organ",
        "expected_crop": "Tomato",
        "expected_disease": "Penalized / Abstain",
        "inference_type": "REAL_MODEL",
        "status": t10_resp.decision_status,
        "crop_selection_status": t10_resp.crop_selection_status,
        "visual_predicted_crop": t10_resp.visually_predicted_crop_id,
        "top_candidate": t10_resp.candidate_diagnoses[0].canonical_name if t10_resp.candidate_diagnoses else None,
        "top_evidence_score": t10_resp.candidate_diagnoses[0].evidence_score if t10_resp.candidate_diagnoses else 0.0,
        "raw_model_score": t10_resp.candidate_diagnoses[0].raw_model_score if t10_resp.candidate_diagnoses else 0.0,
        "abstention_reasons": t10_resp.uncertainty_reasons,
        "guidance_permitted": t10_resp.recommendations.get("guidance_permitted") if t10_resp.recommendations else False
    })
    print(f"Status: {t10_resp.decision_status} | Top: {results[-1]['top_candidate']} ({results[-1]['top_evidence_score']*100:.1f}%)")

    # 11. Unknown or unsupported crop
    print("\n--- Test 11: Unknown or Unsupported Crop ---")
    t11_bytes = read_bytes(fixtures["tomato_late_blight"])
    t11_payload = QuestionnaireSubmissionRequest(
        selected_crop_id="crop_unsupported",
        affected_organ="leaves",
        symptom_ids=["sym_blight"],
        weather_and_field_conditions=[]
    )
    t11_resp = workflow_orchestrator.execute_workflow(t11_payload, image_bytes=t11_bytes, filename="unsupported_crop.jpg")
    results.append({
        "scenario_id": 11,
        "name": "Unknown or unsupported crop",
        "expected_crop": "Unsupported Crop",
        "expected_disease": "Abstain",
        "inference_type": "REAL_MODEL",
        "status": t11_resp.decision_status,
        "crop_selection_status": t11_resp.crop_selection_status,
        "visual_predicted_crop": t11_resp.visually_predicted_crop_id,
        "top_candidate": t11_resp.candidate_diagnoses[0].canonical_name if t11_resp.candidate_diagnoses else None,
        "top_evidence_score": 0.0,
        "raw_model_score": 0.0,
        "abstention_reasons": t11_resp.uncertainty_reasons,
        "guidance_permitted": t11_resp.recommendations.get("guidance_permitted") if t11_resp.recommendations else False
    })
    print(f"Status: {t11_resp.decision_status} | Guidance: {results[-1]['guidance_permitted']}")

    # 12. Missing or contradictory questionnaire evidence
    print("\n--- Test 12: Healthy Model vs Severe Symptom Contradiction ---")
    t12_bytes = read_bytes(fixtures["tomato_healthy"])
    t12_payload = QuestionnaireSubmissionRequest(
        selected_crop_id="crop_tomato",
        affected_organ="leaves",
        symptom_ids=["sym_rot", "sym_wilting"], # Severe rot reported on healthy image
        weather_and_field_conditions=[]
    )
    t12_resp = workflow_orchestrator.execute_workflow(t12_payload, image_bytes=t12_bytes, filename="contradictory.jpg")
    results.append({
        "scenario_id": 12,
        "name": "Missing or contradictory questionnaire evidence",
        "expected_crop": "Tomato",
        "expected_disease": "Expert Review Recommended",
        "inference_type": "REAL_MODEL",
        "status": t12_resp.decision_status,
        "crop_selection_status": t12_resp.crop_selection_status,
        "visual_predicted_crop": t12_resp.visually_predicted_crop_id,
        "top_candidate": t12_resp.candidate_diagnoses[0].canonical_name if t12_resp.candidate_diagnoses else None,
        "top_evidence_score": t12_resp.candidate_diagnoses[0].evidence_score if t12_resp.candidate_diagnoses else 0.0,
        "raw_model_score": t12_resp.candidate_diagnoses[0].raw_model_score if t12_resp.candidate_diagnoses else 0.0,
        "abstention_reasons": t12_resp.uncertainty_reasons,
        "guidance_permitted": t12_resp.recommendations.get("guidance_permitted") if t12_resp.recommendations else False
    })
    print(f"Status: {t12_resp.decision_status} | Top: {results[-1]['top_candidate']}")

    print("\n================================================================================")
    print("ALL 12 DIAGNOSTIC SCENARIOS EXECUTED SUCCESSFULLY")
    print("================================================================================")

    out_path = r"scratch\diagnostic_test_suite_results.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"Detailed results saved to {out_path}")

if __name__ == "__main__":
    run_diagnostic_suite()
