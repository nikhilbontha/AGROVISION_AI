import sys
import json
import time
import requests

BASE_URL = "http://localhost:8000"

def log_test(name, success, details=""):
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} | {name} {details}")
    return success

def run_all_backend_tests():
    print("=" * 60)
    print("🧪 AGROVISION AI — BACKEND COMPREHENSIVE INTEGRATION SUITE")
    print("=" * 60)
    results = []

    # 1. Health check
    try:
        r = requests.get(f"{BASE_URL}/health", timeout=5)
        results.append(log_test("Health Endpoint (/health)", r.status_code == 200, f"[{r.status_code}]"))
    except Exception as e:
        results.append(log_test("Health Endpoint (/health)", False, str(e)))

    # 2. Register a test user
    test_user_email = f"test_farmer_{int(time.time())}@agrovision.ai"
    test_password = "FarmerPassword123!"
    token = None
    user_id = None

    try:
        reg_payload = {
            "name": "AutoTest Farmer",
            "email": test_user_email,
            "password": test_password,
            "phone": "+919876543210",
            "role": "farmer",
            "language": "en"
        }
        r = requests.post(f"{BASE_URL}/auth/register", json=reg_payload, timeout=5)
        results.append(log_test("User Registration (/auth/register)", r.status_code in [200, 201], f"[{r.status_code}] Email: {test_user_email}"))
    except Exception as e:
        results.append(log_test("User Registration (/auth/register)", False, str(e)))

    # 3. Login with that user
    try:
        login_payload = {
            "email": test_user_email,
            "password": test_password
        }
        r = requests.post(f"{BASE_URL}/auth/login", json=login_payload, timeout=5)
        login_ok = r.status_code == 200 and "access_token" in r.json()
        if login_ok:
            data = r.json()
            token = data.get("access_token")
            user_id = data.get("user", {}).get("id")
        results.append(log_test("User Login (/auth/login)", login_ok, f"[{r.status_code}] User ID: {user_id}"))
    except Exception as e:
        results.append(log_test("User Login (/auth/login)", False, str(e)))

    headers = {"Authorization": f"Bearer {token}"} if token else {}

    # 4. Auth Me check
    if token:
        try:
            r = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=5)
            results.append(log_test("Auth Me Profile (/auth/me)", r.status_code == 200, f"[{r.status_code}] Name: {r.json().get('name')}"))
        except Exception as e:
            results.append(log_test("Auth Me Profile (/auth/me)", False, str(e)))

    # 5. Questionnaire Crops List
    try:
        r = requests.get(f"{BASE_URL}/questionnaire/crops", timeout=5)
        crops = r.json().get("crops", [])
        results.append(log_test("Questionnaire Crops (/questionnaire/crops)", r.status_code == 200 and len(crops) > 0, f"[{r.status_code}] {len(crops)} crops found"))
    except Exception as e:
        results.append(log_test("Questionnaire Crops (/questionnaire/crops)", False, str(e)))

    # 6. Questionnaire Config
    try:
        r = requests.get(f"{BASE_URL}/questionnaire/config", timeout=5)
        results.append(log_test("Questionnaire Config (/questionnaire/config)", r.status_code == 200, f"[{r.status_code}]"))
    except Exception as e:
        results.append(log_test("Questionnaire Config (/questionnaire/config)", False, str(e)))

    # 7. Questionnaire Submit Evidence (Diagnostic Inference)
    try:
        evidence_payload = {
            "selected_crop_id": "crop_tomato",
            "affected_organ": "leaves",
            "symptom_ids": ["sym_spots", "sym_yellowing"],
            "symptom_duration": "dur_4_to_7_days"
        }
        r = requests.post(f"{BASE_URL}/questionnaire/submit-evidence", json=evidence_payload, timeout=8)
        results.append(log_test("Questionnaire Evidence Submission (/questionnaire/submit-evidence)", r.status_code == 200, f"[{r.status_code}] Receipt: {r.json().get('receipt_id')}"))
    except Exception as e:
        results.append(log_test("Questionnaire Evidence Submission (/questionnaire/submit-evidence)", False, str(e)))

    # 7b. Multimodal Clinical Diagnosis Inference
    try:
        diag_payload = {
            "questionnaire_payload": evidence_payload
        }
        r = requests.post(f"{BASE_URL}/diagnosis/v1/diagnose", json=diag_payload, timeout=8)
        results.append(log_test("Clinical Diagnosis Engine (/diagnosis/v1/diagnose)", r.status_code == 200, f"[{r.status_code}]"))
    except Exception as e:
        results.append(log_test("Clinical Diagnosis Engine (/diagnosis/v1/diagnose)", False, str(e)))

    # 8. Disease Detection Prediction (using a sample leaf)
    try:
        with open("frontend/public/samples/potato_late_blight.jpg", "rb") as img_file:
            files = {"file": ("sample_leaf.jpg", img_file, "image/jpeg")}
            data = {"crop_type": "Potato"}
            r = requests.post(f"{BASE_URL}/predict/predict-disease", files=files, data=data, timeout=12)
            results.append(log_test("Disease Prediction API (/predict/predict-disease)", r.status_code == 200, f"[{r.status_code}]"))
    except Exception as e:
        results.append(log_test("Disease Prediction API (/predict/predict-disease)", False, str(e)))

    # 9. Yield Prediction Endpoint
    try:
        yield_payload = {
            "state": "Andhra Pradesh",
            "district": "Guntur",
            "crop": "Chilli",
            "season": "Kharif",
            "area_acres": 2.5,
            "soil_type": "Black",
            "nitrogen": 120,
            "phosphorus": 60,
            "potassium": 40,
            "ph": 6.8,
            "rainfall_mm": 850,
            "temperature_c": 28.5,
            "irrigation_type": "Drip",
            "fertilizer_used": "NPK 19-19-19",
            "pesticide_used": "Neem Oil & Mancozeb",
            "user_id": user_id or 1
        }
        r = requests.post(f"{BASE_URL}/predict/predict-yield", json=yield_payload, timeout=8)
        results.append(log_test("Yield Prediction API (/predict/predict-yield)", r.status_code == 200, f"[{r.status_code}]"))
    except Exception as e:
        results.append(log_test("Yield Prediction API (/predict/predict-yield)", False, str(e)))

    # 10. Dashboard Stats
    try:
        r = requests.get(f"{BASE_URL}/dashboard/stats?user_id={user_id or 1}", headers=headers, timeout=5)
        results.append(log_test("Dashboard Stats (/dashboard/stats)", r.status_code == 200, f"[{r.status_code}]"))
    except Exception as e:
        results.append(log_test("Dashboard Stats (/dashboard/stats)", False, str(e)))

    # 11. Dashboard Profit Analysis
    try:
        r = requests.get(f"{BASE_URL}/dashboard/profit-analysis?user_id={user_id or 1}", headers=headers, timeout=5)
        results.append(log_test("Dashboard Profit Analysis (/dashboard/profit-analysis)", r.status_code == 200, f"[{r.status_code}]"))
    except Exception as e:
        results.append(log_test("Dashboard Profit Analysis (/dashboard/profit-analysis)", False, str(e)))

    # 12. Dashboard Analytics
    try:
        r = requests.get(f"{BASE_URL}/dashboard/analytics?user_id={user_id or 1}", headers=headers, timeout=5)
        results.append(log_test("Dashboard Analytics (/dashboard/analytics)", r.status_code == 200, f"[{r.status_code}]"))
    except Exception as e:
        results.append(log_test("Dashboard Analytics (/dashboard/analytics)", False, str(e)))

    print("=" * 60)
    passed = sum(1 for x in results if x)
    total = len(results)
    print(f"RESULTS: {passed}/{total} BACKEND TESTS PASSED ({'100%' if passed == total else f'{(passed/total)*100:.1f}%'})")
    print("=" * 60)
    return passed == total

if __name__ == "__main__":
    success = run_all_backend_tests()
    sys.exit(0 if success else 1)
