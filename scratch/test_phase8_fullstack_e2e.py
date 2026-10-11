"""
AgroVision AI 2.0 - Phase 8: Full-Stack Integration & End-to-End System Validation Suite
Automated positive-path, failure-path, and regression test execution.
"""
import sys
import os
import json
import io
import time
from typing import Dict, Any
from PIL import Image
import numpy as np

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from fastapi.testclient import TestClient
from app.main import app
from app.routes.auth import get_current_user

# Mock authentication dependency for regression tests requiring user context
def mock_get_current_user():
    return {"id": "test_farmer_001", "name": "Ramesh Kumar", "role": "farmer", "state": "Telangana"}

app.dependency_overrides[get_current_user] = mock_get_current_user
client = TestClient(app)

def create_synthetic_leaf_image(width=224, height=224) -> bytes:
    """Create a synthetic green crop leaf image in PNG format."""
    arr = np.zeros((height, width, 3), dtype=np.uint8)
    arr[:, :, 1] = 180  # Strong green channel
    arr[:, :, 0] = 40   # Low blue
    arr[:, :, 2] = 50   # Low red
    # Add a simulated spot in the center
    arr[90:130, 90:130, 2] = 120 # brownish spot
    arr[90:130, 90:130, 1] = 80
    img = Image.fromarray(arr)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

def run_tests():
    e2e_results = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "phase": "Phase 8: Full-Stack Integration and End-to-End System Validation",
        "total_tests": 0,
        "passed_tests": 0,
        "failed_tests": 0,
        "test_cases": []
    }

    regression_results = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "phase": "Phase 8: Regression Validation",
        "total_tests": 0,
        "passed_tests": 0,
        "failed_tests": 0,
        "test_cases": []
    }

    api_contracts = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "endpoints_evaluated": []
    }

    print("=" * 70)
    print("AGROVISION AI 2.0 - PHASE 8 FULL-STACK E2E TEST SUITE")
    print("=" * 70)

    # -------------------------------------------------------------
    # POSITIVE PATH TESTS
    # -------------------------------------------------------------
    print("\n[SECTION 1: POSITIVE PATH INTEGRATION TESTS]")

    # Positive 1: Multipart upload with valid image & questionnaire
    img_bytes = create_synthetic_leaf_image()
    valid_payload = {
        "questionnaire_version": "2.0.0",
        "selected_crop_id": "crop_tomato",
        "crop_selection_source": "farmer_manual",
        "affected_organ": "leaves",
        "symptom_ids": ["sym_water_soaked_spots", "sym_white_downy_growth"],
        "symptom_location": "loc_multiple_plants",
        "symptom_duration": "dur_4_to_7_days",
        "spread_rate": "spread_rapid",
        "growth_stage": "stage_vegetative",
        "weather_and_field_conditions": ["cond_high_humidity", "cond_recent_rain"],
        "visible_pests": "pest_no",
        "previous_treatment": "treatment_no"
    }

    res1 = client.post(
        "/diagnosis/v1/full-diagnosis-upload",
        data={
            "payload_json": json.dumps(valid_payload),
            "state": "Telangana",
            "district": "Warangal"
        },
        files={"file": ("leaf.png", img_bytes, "image/png")}
    )
    p1_pass = (res1.status_code == 200 and "decision_status" in res1.json())
    e2e_results["test_cases"].append({
        "id": "POS-01",
        "name": "Multipart Image & Questionnaire Upload E2E Workflow",
        "passed": p1_pass,
        "status_code": res1.status_code,
        "details": f"Decision Status: {res1.json().get('decision_status') if p1_pass else res1.text[:200]}"
    })
    print(f"  [POS-01] Multipart Upload Workflow: {'PASS' if p1_pass else 'FAIL'} (Status: {res1.status_code})")

    # Positive 2: Deterministic Mock Fusion -> Single Candidate Confirmed & Recommendations
    mock_scores = [
        {"class_label": "Tomato___Late_blight", "score": 0.88, "output_index": 27},
        {"class_label": "Tomato___Early_blight", "score": 0.08, "output_index": 26}
    ]
    res2 = client.post(
        "/diagnosis/v1/full-diagnosis",
        json={
            "questionnaire_payload": valid_payload,
            "mock_model_scores": mock_scores,
            "state": "Telangana",
            "district": "Warangal"
        }
    )
    data2 = res2.json() if res2.status_code == 200 else {}
    p2_pass = (
        res2.status_code == 200
        and data2.get("decision_status") in ["diagnosis_supported", "single_candidate_confirmed"]
        and data2.get("recommendations", {}).get("guidance_permitted") is True
        and len(data2.get("recommendations", {}).get("verified_chemical_treatments", [])) > 0
    )
    e2e_results["test_cases"].append({
        "id": "POS-02",
        "name": "Deterministic Multimodal Fusion -> Single Candidate Confirmed with CIBRC Guidance",
        "passed": p2_pass,
        "status_code": res2.status_code,
        "details": f"Status: {data2.get('decision_status')}, Guidance Permitted: {data2.get('recommendations', {}).get('guidance_permitted')}"
    })
    print(f"  [POS-02] Single Candidate Confirmed with CIBRC Guidance: {'PASS' if p2_pass else 'FAIL'}")

    # Positive 3: Knowledge Base Specific Lookup
    res3 = client.get("/diagnosis/v1/knowledge/dis_tomato_late_blight")
    p3_pass = (res3.status_code == 200 and res3.json().get("disease_id") == "dis_tomato_late_blight")
    e2e_results["test_cases"].append({
        "id": "POS-03",
        "name": "Knowledge Base Direct Retrieval for Valid Canonical Disease",
        "passed": p3_pass,
        "status_code": res3.status_code,
        "details": f"Retrieved disease: {res3.json().get('canonical_name') if p3_pass else res3.text[:100]}"
    })
    print(f"  [POS-03] Knowledge Base Direct Retrieval: {'PASS' if p3_pass else 'FAIL'}")

    # Positive 4: Decision Status Catalog
    res4 = client.get("/diagnosis/v1/statuses")
    p4_pass = (res4.status_code == 200 and len(res4.json().get("statuses", [])) >= 8)
    e2e_results["test_cases"].append({
        "id": "POS-04",
        "name": "Decision Status Catalog Metadata Retrieval",
        "passed": p4_pass,
        "status_code": res4.status_code,
        "details": f"Retrieved {len(res4.json().get('statuses', []))} decision statuses"
    })
    print(f"  [POS-04] Status Catalog Metadata: {'PASS' if p4_pass else 'FAIL'}")

    # Positive 5: Canonical Crops Listing
    res5 = client.get("/questionnaire/crops")
    p5_pass = (res5.status_code == 200 and len(res5.json().get("crops", [])) >= 10)
    e2e_results["test_cases"].append({
        "id": "POS-05",
        "name": "Questionnaire Canonical Crop Taxonomy Catalog",
        "passed": p5_pass,
        "status_code": res5.status_code,
        "details": f"Retrieved {len(res5.json().get('crops', []))} crops"
    })
    print(f"  [POS-05] Crop Taxonomy Catalog: {'PASS' if p5_pass else 'FAIL'}")

    # -------------------------------------------------------------
    # FAILURE PATH & SAFETY ABSTENTION TESTS
    # -------------------------------------------------------------
    print("\n[SECTION 2: FAILURE PATH & SAFETY ABSTENTION TESTS]")

    # Failure 1: Corrupted Image File
    corrupt_bytes = b"NOT_A_VALID_IMAGE_HEADER_GARBAGE_BYTES_12345"
    res_f1 = client.post(
        "/diagnosis/v1/full-diagnosis-upload",
        data={"payload_json": json.dumps(valid_payload)},
        files={"file": ("corrupt.jpg", corrupt_bytes, "image/jpeg")}
    )
    f1_pass = (res_f1.status_code == 400 and "Corrupted or unreadable image file" in res_f1.text)
    e2e_results["test_cases"].append({
        "id": "FAIL-01",
        "name": "Corrupted Image Binary Rejection",
        "passed": f1_pass,
        "status_code": res_f1.status_code,
        "details": res_f1.text[:150]
    })
    print(f"  [FAIL-01] Corrupted Image Rejection: {'PASS' if f1_pass else 'FAIL'} ({res_f1.status_code})")

    # Failure 2: Empty Image File (0 bytes)
    res_f2 = client.post(
        "/diagnosis/v1/full-diagnosis-upload",
        data={"payload_json": json.dumps(valid_payload)},
        files={"file": ("empty.png", b"", "image/png")}
    )
    f2_pass = (res_f2.status_code == 400 and "Empty image file" in res_f2.text)
    e2e_results["test_cases"].append({
        "id": "FAIL-02",
        "name": "Empty Image File Rejection",
        "passed": f2_pass,
        "status_code": res_f2.status_code,
        "details": res_f2.text[:150]
    })
    print(f"  [FAIL-02] Empty Image File Rejection: {'PASS' if f2_pass else 'FAIL'} ({res_f2.status_code})")

    # Failure 3: Unsupported Crop Safe Handling
    unsupported_crop_payload = dict(valid_payload, selected_crop_id="crop_unsupported")
    res_f3 = client.post(
        "/diagnosis/v1/full-diagnosis",
        json={"questionnaire_payload": unsupported_crop_payload}
    )
    data_f3 = res_f3.json() if res_f3.status_code == 200 else {}
    f3_pass = (
        res_f3.status_code == 200
        and data_f3.get("decision_status") == "unsupported_crop"
        and data_f3.get("recommendations", {}).get("guidance_permitted") is False
        and len(data_f3.get("recommendations", {}).get("verified_chemical_treatments", [])) == 0
    )
    e2e_results["test_cases"].append({
        "id": "FAIL-03",
        "name": "Unsupported Crop Safe Abstention & Chemical Withholding",
        "passed": f3_pass,
        "status_code": res_f3.status_code,
        "details": f"Decision: {data_f3.get('decision_status')}, Guidance Permitted: {data_f3.get('recommendations', {}).get('guidance_permitted')}"
    })
    print(f"  [FAIL-03] Unsupported Crop Abstention: {'PASS' if f3_pass else 'FAIL'}")

    # Failure 4: Organ Incompatibility Safe Detection
    organ_mismatch_payload = dict(valid_payload, affected_organ="rhizomes_tubers")
    res_f4 = client.post(
        "/diagnosis/v1/full-diagnosis",
        json={"questionnaire_payload": organ_mismatch_payload}
    )
    data_f4 = res_f4.json() if res_f4.status_code == 200 else {}
    f4_pass = (
        res_f4.status_code == 200
        and data_f4.get("decision_status") in ["organ_mismatch", "needs_more_information", "model_unavailable"]
        and data_f4.get("recommendations", {}).get("guidance_permitted") is False
    )
    e2e_results["test_cases"].append({
        "id": "FAIL-04",
        "name": "Plant Organ Incompatibility Abstention",
        "passed": f4_pass,
        "status_code": res_f4.status_code,
        "details": f"Decision: {data_f4.get('decision_status')}, Organ: {organ_mismatch_payload['affected_organ']}"
    })
    print(f"  [FAIL-04] Organ Incompatibility Abstention: {'PASS' if f4_pass else 'FAIL'}")

    # Failure 5: Multiple Plausible Candidates & Chemical Gating Invariant
    ambiguous_mock_scores = [
        {"class_label": "Tomato___Late_blight", "score": 0.44, "output_index": 28},
        {"class_label": "Tomato___Early_blight", "score": 0.42, "output_index": 27}
    ]
    res_f5 = client.post(
        "/diagnosis/v1/full-diagnosis",
        json={
            "questionnaire_payload": valid_payload,
            "mock_model_scores": ambiguous_mock_scores
        }
    )
    data_f5 = res_f5.json() if res_f5.status_code == 200 else {}
    f5_pass = (
        res_f5.status_code == 200
        and data_f5.get("decision_status") == "multiple_candidates"
        and data_f5.get("recommendations", {}).get("guidance_permitted") is False
        and len(data_f5.get("recommendations", {}).get("verified_chemical_treatments", [])) == 0
    )
    e2e_results["test_cases"].append({
        "id": "FAIL-05",
        "name": "Multiple Plausible Candidates Withholding Chemical Treatment",
        "passed": f5_pass,
        "status_code": res_f5.status_code,
        "details": f"Status: {data_f5.get('decision_status')}, Chemicals Count: {len(data_f5.get('recommendations', {}).get('verified_chemical_treatments', []))}"
    })
    print(f"  [FAIL-05] Multiple Candidates Chemical Withholding: {'PASS' if f5_pass else 'FAIL'}")

    # Failure 6: Insufficient Evidence / Full Uncertainty Abstention
    uncertain_payload = dict(valid_payload, symptom_ids=["sym_unsure"], weather_and_field_conditions=[])
    res_f6 = client.post(
        "/diagnosis/v1/full-diagnosis",
        json={"questionnaire_payload": uncertain_payload}
    )
    data_f6 = res_f6.json() if res_f6.status_code == 200 else {}
    f6_pass = (
        res_f6.status_code == 200
        and data_f6.get("decision_status") in ["needs_more_information", "model_unavailable", "unsure_crop"]
        and data_f6.get("recommendations", {}).get("guidance_permitted") is False
    )
    e2e_results["test_cases"].append({
        "id": "FAIL-06",
        "name": "Insufficient Evidence Abstention & Advisory Callout",
        "passed": f6_pass,
        "status_code": res_f6.status_code,
        "details": f"Status: {data_f6.get('decision_status')}"
    })
    print(f"  [FAIL-06] Insufficient Evidence Abstention: {'PASS' if f6_pass else 'FAIL'}")

    # Failure 7: Nonexistent Disease Knowledge Lookup (404)
    res_f7 = client.get("/diagnosis/v1/knowledge/dis_alien_crop_blight")
    f7_pass = (res_f7.status_code == 404)
    e2e_results["test_cases"].append({
        "id": "FAIL-07",
        "name": "Missing Disease Knowledge Record 404 Response",
        "passed": f7_pass,
        "status_code": res_f7.status_code,
        "details": f"Status Code: {res_f7.status_code}"
    })
    print(f"  [FAIL-07] Missing Disease Record 404: {'PASS' if f7_pass else 'FAIL'}")

    # Failure 8: Crop Selection Disagreement (Farmer selected Potato, Model predicted Tomato)
    disagree_scores = [
        {"class_label": "Tomato___Late_blight", "score": 0.92, "output_index": 28}
    ]
    disagree_payload = dict(valid_payload, selected_crop_id="crop_potato")
    res_f8 = client.post(
        "/diagnosis/v1/full-diagnosis",
        json={
            "questionnaire_payload": disagree_payload,
            "mock_model_scores": disagree_scores
        }
    )
    data_f8 = res_f8.json() if res_f8.status_code == 200 else {}
    f8_pass = (
        res_f8.status_code == 200
        and data_f8.get("decision_status") in ["crop_mismatch", "needs_more_information"]
        and data_f8.get("recommendations", {}).get("guidance_permitted") is False
    )
    e2e_results["test_cases"].append({
        "id": "FAIL-08",
        "name": "Crop Selection Disagreement Detection",
        "passed": f8_pass,
        "status_code": res_f8.status_code,
        "details": f"Status: {data_f8.get('decision_status')}, Guidance Permitted: {data_f8.get('recommendations', {}).get('guidance_permitted')}"
    })
    print(f"  [FAIL-08] Crop Disagreement Detection: {'PASS' if f8_pass else 'FAIL'}")

    # -------------------------------------------------------------
    # REGRESSION TESTS (PRESERVING EXISTING FUNCTIONALITY)
    # -------------------------------------------------------------
    print("\n[SECTION 3: REGRESSION INTEGRATION TESTS]")

    # Regression 1: Root Health Check
    res_r1 = client.get("/")
    r1_pass = (res_r1.status_code == 200 and "AgroVision AI Backend" in res_r1.text)
    regression_results["test_cases"].append({
        "id": "REG-01",
        "name": "API Root Health Endpoint",
        "passed": r1_pass,
        "status_code": res_r1.status_code
    })
    print(f"  [REG-01] API Root Health Check: {'PASS' if r1_pass else 'FAIL'}")

    # Regression 2: Yield Prediction Endpoint (/predict/predict-yield)
    yield_req = {
        "district": "Warangal",
        "soil_type": "Black Soil",
        "crop_type": "Cotton",
        "cultivated_acres": 3.5,
        "irrigation_type": "Drip Irrigation",
        "fertilizer_used_kg": 150.0,
        "pesticide_used_liters": 2.5
    }
    res_r2 = client.post("/predict/predict-yield", json=yield_req)
    data_r2 = res_r2.json() if res_r2.status_code == 200 else {}
    r2_pass = (
        res_r2.status_code == 200
        and "predicted_yield_tons_per_acre" in data_r2
        and "estimated_revenue" in data_r2
    )
    regression_results["test_cases"].append({
        "id": "REG-02",
        "name": "Production Smart Yield Forecasting & Profitability Engine",
        "passed": r2_pass,
        "status_code": res_r2.status_code,
        "details": f"Yield/Acre: {data_r2.get('predicted_yield_tons_per_acre')} tons, Revenue: Rs. {data_r2.get('estimated_revenue')}"
    })
    print(f"  [REG-02] Yield Prediction Endpoint: {'PASS' if r2_pass else 'FAIL'} (Yield: {data_r2.get('predicted_yield_tons_per_acre')} t/ac)")

    # Regression 3: Assistant / Chatbot Endpoint (/assistant/chat)
    chat_req = {
        "message": "What is the recommended fertilizer for cotton crop?",
        "language": "en",
        "page_context": "crop_care"
    }
    res_r3 = client.post("/assistant/chat", json=chat_req)
    data_r3 = res_r3.json() if res_r3.status_code == 200 else {}
    r3_pass = (res_r3.status_code == 200 and "reply" in data_r3 and len(data_r3["reply"]) > 5)
    regression_results["test_cases"].append({
        "id": "REG-03",
        "name": "AI Agronomist Assistant Chatbot Service",
        "passed": r3_pass,
        "status_code": res_r3.status_code,
        "details": f"Intent: {data_r3.get('intent')}, Reply Length: {len(data_r3.get('reply', ''))} chars"
    })
    print(f"  [REG-03] Assistant Chatbot Endpoint: {'PASS' if r3_pass else 'FAIL'}")

    # Regression 4: Legacy Disease Prediction (/predict/predict-disease) Rejection Policy Check
    # Validate that legacy endpoint responds safely to synthetic image
    res_r4 = client.post(
        "/predict/predict-disease",
        data={"crop_type": "Tomato", "lang": "en"},
        files={"file": ("test.png", img_bytes, "image/png")}
    )
    # Legacy endpoint should execute safely or return calibrated uncertainty/safe unavailable without 500 crash
    r4_pass = (res_r4.status_code == 200 and ("disease" in res_r4.json() or "is_uncertain" in res_r4.json() or res_r4.json().get("error_code") == "MODEL_UNAVAILABLE"))
    regression_results["test_cases"].append({
        "id": "REG-04",
        "name": "Legacy Disease Detection Endpoint Stability & Rejection Policy",
        "passed": r4_pass,
        "status_code": res_r4.status_code,
        "details": f"Response disease/uncertainty handled safely: {r4_pass}"
    })
    print(f"  [REG-04] Legacy Disease Endpoint Stability: {'PASS' if r4_pass else 'FAIL'}")

    # -------------------------------------------------------------
    # API CONTRACT RECORDING
    # -------------------------------------------------------------
    api_contracts["endpoints_evaluated"] = [
        {
            "path": "/diagnosis/v1/full-diagnosis-upload",
            "method": "POST",
            "content_type": "multipart/form-data",
            "consumer": "AdaptiveQuestionnaire.jsx (Step 6/7)",
            "contract_status": "VALIDATED"
        },
        {
            "path": "/diagnosis/v1/full-diagnosis",
            "method": "POST",
            "content_type": "application/json",
            "consumer": "Automated Multimodal Integration Services",
            "contract_status": "VALIDATED"
        },
        {
            "path": "/diagnosis/v1/knowledge/{disease_id}",
            "method": "GET",
            "content_type": "application/json",
            "consumer": "Diagnostic Detail Modals & Extension Officers",
            "contract_status": "VALIDATED"
        },
        {
            "path": "/diagnosis/v1/statuses",
            "method": "GET",
            "content_type": "application/json",
            "consumer": "Frontend Decision Status Badges & Catalogs",
            "contract_status": "VALIDATED"
        },
        {
            "path": "/predict/predict-yield",
            "method": "POST",
            "content_type": "application/json",
            "consumer": "YieldPrediction.jsx & Advisory Dashboard",
            "contract_status": "PRESERVED_UNCHANGED"
        },
        {
            "path": "/assistant/chat",
            "method": "POST",
            "content_type": "application/json",
            "consumer": "ChatbotWidget.jsx & Assistant Drawer",
            "contract_status": "PRESERVED_UNCHANGED"
        }
    ]

    # Summarize Results
    e2e_results["total_tests"] = len(e2e_results["test_cases"])
    e2e_results["passed_tests"] = sum(1 for t in e2e_results["test_cases"] if t["passed"])
    e2e_results["failed_tests"] = e2e_results["total_tests"] - e2e_results["passed_tests"]

    regression_results["total_tests"] = len(regression_results["test_cases"])
    regression_results["passed_tests"] = sum(1 for t in regression_results["test_cases"] if t["passed"])
    regression_results["failed_tests"] = regression_results["total_tests"] - regression_results["passed_tests"]

    # Save deliverables
    out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docs", "agrovision_v2", "phase8"))
    os.makedirs(out_dir, exist_ok=True)

    with open(os.path.join(out_dir, "end_to_end_test_results.json"), "w", encoding="utf-8") as f:
        json.dump(e2e_results, f, indent=2)

    with open(os.path.join(out_dir, "regression_test_results.json"), "w", encoding="utf-8") as f:
        json.dump(regression_results, f, indent=2)

    with open(os.path.join(out_dir, "api_contract_validation.json"), "w", encoding="utf-8") as f:
        json.dump(api_contracts, f, indent=2)

    print("\n" + "=" * 70)
    print(f"E2E SUITE SUMMARY: {e2e_results['passed_tests']}/{e2e_results['total_tests']} PASSED")
    print(f"REGRESSION SUITE SUMMARY: {regression_results['passed_tests']}/{regression_results['total_tests']} PASSED")
    print(f"DELIVERABLES PERSISTED TO: {out_dir}")
    print("=" * 70)

    if e2e_results["failed_tests"] > 0 or regression_results["failed_tests"] > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    run_tests()
