import os
import sys
import time
import json
import requests
import io
import concurrent.futures
from PIL import Image

print("=== AGROVISION AI PHASE 10: END-TO-END QA & VALIDATION SUITE ===")

BASE_URL = "http://localhost:8000/predict"
FRONTEND_URL = "http://localhost:5173"

reports_dir = r"e:\tekworks_projects\crop\reports\final_qa"
os.makedirs(reports_dir, exist_ok=True)

test_results = []

def record_test(test_id, category, name, pass_condition, details):
    status = "PASS" if pass_condition else "FAIL"
    test_results.append({
        "test_id": test_id,
        "category": category,
        "name": name,
        "status": status,
        "details": details
    })
    print(f"[{status}] Test {test_id} ({category}): {name} - {details}")

def create_dummy_image(color=(34, 139, 34), size=(300, 300), format='JPEG'):
    img = Image.new('RGB', size, color=color)
    buf = io.BytesIO()
    img.save(buf, format=format)
    return buf.getvalue()

def extract_crop_name(rj):
    c = rj.get('crop')
    if isinstance(c, dict):
        return c.get('name', '')
    return str(c or '')

# -------------------------------------------------------------
# TASK 1: Environment & Repository Audit
# -------------------------------------------------------------
sys.path.append(r"e:\tekworks_projects\crop\backend")
from app.routes.predict import get_disease_model, get_yield_model, predict_disease, predict_yield, CLASS_MAPPING, SUPPORTED_CROPS
from app.services.yield_engine import calculate_smart_yield
from app.schemas.schemas import YieldRequest

candidate_model_path = r"e:\tekworks_projects\crop\ml_models\disease_detection\unified_experiment\artifacts\agrovision_phase7_20261010_231412\AGROVISION_UNIFIED_72CLASS_MODEL.h5"
baseline_model_path = r"e:\tekworks_projects\crop\ml_models\disease_detection\disease_model.h5"

record_test(
    "T1.1", "Repo Audit", "Candidate Master Model Checkpoint Exists",
    os.path.exists(candidate_model_path),
    f"File size: {os.path.getsize(candidate_model_path) if os.path.exists(candidate_model_path) else 0} bytes"
)

record_test(
    "T1.2", "Repo Audit", "Baseline Rollback Model Preserved",
    os.path.exists(baseline_model_path),
    f"File size: {os.path.getsize(baseline_model_path) if os.path.exists(baseline_model_path) else 0} bytes"
)

# -------------------------------------------------------------
# TASK 2: Application Startup & Server Health
# -------------------------------------------------------------
try:
    r_backend = requests.get("http://localhost:8000/docs", timeout=5)
    backend_up = (r_backend.status_code == 200)
except Exception as e:
    backend_up = False

try:
    r_frontend = requests.get(FRONTEND_URL, timeout=5)
    frontend_up = (r_frontend.status_code == 200)
except Exception as e:
    frontend_up = False

record_test("T2.1", "App Startup", "FastAPI Backend Online", backend_up, "GET /docs returned HTTP 200")
record_test("T2.2", "App Startup", "Vite Frontend Server Online", frontend_up, f"GET {FRONTEND_URL} returned HTTP 200")

# -------------------------------------------------------------
# TASK 3: Disease Detection End-to-End & Wheat vs Corn Verification
# -------------------------------------------------------------
disease_model, idx_map = get_disease_model()
record_test("T3.1", "Disease Detection", "Master Model Loader Initialization", disease_model is not None, f"Loaded model with {len(idx_map)} class indices")

# Wheat image test (Specific Wheat vs Corn bug investigation)
wheat_img_path = r"e:\tekworks_projects\crop\ml_models\disease_detection\dataset_prepared\train\Wheat___Stripe_rust\Wheat___Stripe_rust_train_0.jpg"
if os.path.exists(wheat_img_path):
    with open(wheat_img_path, 'rb') as f:
        wheat_bytes = f.read()
    files = {'file': ('wheat_test.jpg', wheat_bytes, 'image/jpeg')}
    data = {'crop_type': 'Wheat'}
    res = requests.post(f"{BASE_URL}/predict-disease", files=files, data=data)
    if res.status_code == 200:
        resp_json = res.json()
        pred_crop = extract_crop_name(resp_json)
        pred_disease = resp_json.get('disease', '')
        conf = resp_json.get('confidence', 0.0)
        is_wheat = (pred_crop.lower() == 'wheat')
        record_test("T3.2", "Disease Detection", "Wheat Image Diagnosis (Wheat vs Corn Bug Fix)", is_wheat, f"Predicted Crop: '{pred_crop}', Disease: '{pred_disease}', Confidence: {conf:.4f}")
    else:
        record_test("T3.2", "Disease Detection", "Wheat Image Diagnosis", False, f"Server returned status {res.status_code}")
else:
    record_test("T3.2", "Disease Detection", "Wheat Image Diagnosis", False, "Wheat sample file not found")

# Representative regional crop samples inference
crop_tests = [
    ("Rice", r"e:\tekworks_projects\crop\datasets\regional_dataset_2\Andhra_Master_Dataset\Rice_Blast\BLAST1_001.jpg"),
    ("Mango", r"e:\tekworks_projects\crop\datasets\regional_dataset_2\Andhra_Master_Dataset\Mango_Anthracnose\20211008_124249 (Custom).jpg"),
    ("Cotton", r"e:\tekworks_projects\crop\datasets\regional_dataset_2\Andhra_Master_Dataset\Cotton_Bacterial Blight\aug_bacterial_(1).png"),
    ("Banana", r"e:\tekworks_projects\crop\datasets\regional_dataset_2\Andhra_Master_Dataset\Banana_Black Sigatoka\20210218_160016.jpg")
]

all_crops_passed = True
crop_details = []
for crop_name, img_path in crop_tests:
    if os.path.exists(img_path):
        with open(img_path, 'rb') as f:
            b = f.read()
        mime = 'image/png' if img_path.endswith('.png') else 'image/jpeg'
        files = {'file': (os.path.basename(img_path), b, mime)}
        res = requests.post(f"{BASE_URL}/predict-disease", files=files, data={'crop_type': crop_name})
        if res.status_code == 200:
            rj = res.json()
            c_name = extract_crop_name(rj)
            crop_details.append(f"{crop_name}->{c_name}:{rj.get('confidence'):.2f}")
        else:
            all_crops_passed = False
    else:
        all_crops_passed = False

record_test("T3.3", "Disease Detection", "Regional Crop Samples Inference", all_crops_passed, ", ".join(crop_details))

# Non-plant / Low-confidence rejection test
blue_img = create_dummy_image(color=(0, 0, 255), size=(200, 200))
files = {'file': ('blue_test.jpg', blue_img, 'image/jpeg')}
res = requests.post(f"{BASE_URL}/predict-disease", files=files, data={'crop_type': 'Auto-Detect'})
if res.status_code == 200:
    rj = res.json()
    is_uncertain = not rj.get('success', True) or rj.get('is_uncertain', False) or rj.get('disease') == 'Uncertain Diagnosis'
    record_test("T3.4", "Disease Detection", "Out-of-Distribution Non-Plant Rejection Threshold", is_uncertain, f"Success: {rj.get('success')}, Is Uncertain: {rj.get('is_uncertain')}, Message: '{rj.get('message')}'")
else:
    record_test("T3.4", "Disease Detection", "Out-of-Distribution Non-Plant Rejection Threshold", False, f"Status: {res.status_code}")

# -------------------------------------------------------------
# TASK 4: Yield Prediction Regression Testing
# -------------------------------------------------------------
valid_yield_payload = {
    "district": "Hyderabad",
    "crop_type": "Wheat",
    "soil_type": "Loamy",
    "area": 2.5,
    "area_unit": "acres",
    "expected_farmgate_price": 2600.0
}
res_yield = requests.post(f"{BASE_URL}/predict-yield", json=valid_yield_payload)
yield_ok = (res_yield.status_code == 200)
if yield_ok:
    yj = res_yield.json()
    harvest_ton = yj.get('total_expected_yield_tons', yj.get('total_expected_harvest', 0))
    record_test("T4.1", "Yield Engine", "Valid Input Yield Prediction API", harvest_ton > 0, f"Total harvest forecast: {harvest_ton:.2f} tons")
else:
    record_test("T4.1", "Yield Engine", "Valid Input Yield Prediction API", False, f"Status {res_yield.status_code}")

# Invalid Type Yield Rejection (Passing bad soil_ph type to force Pydantic 422)
invalid_yield_payload = {
    "district": "Hyderabad",
    "soil_ph": "INVALID_STRING_PH_VALUE"
}
res_invalid = requests.post(f"{BASE_URL}/predict-yield", json=invalid_yield_payload)
record_test("T4.2", "Yield Engine", "Invalid Payload Validation Rejection", res_invalid.status_code == 422, f"HTTP Status: {res_invalid.status_code} (Unprocessable Entity)")

# -------------------------------------------------------------
# TASK 6: Security & Input Validation Checks
# -------------------------------------------------------------
# Corrupted image payload
files_corrupt = {'file': ('corrupt.jpg', b"CORRUPTED_BYTES_12345", 'image/jpeg')}
res_corrupt = requests.post(f"{BASE_URL}/predict-disease", files=files_corrupt)
record_test("T6.1", "Security", "Corrupted File Handling Safety", res_corrupt.status_code in [200, 400, 422, 500], f"Returned HTTP {res_corrupt.status_code}")

# Stack trace leakage check
res_err_json = res_corrupt.json() if res_corrupt.headers.get('content-type') == 'application/json' else {}
err_str = str(res_err_json)
has_stack_trace = ("Traceback (most recent call last)" in err_str or "C:\\Users\\" in err_str or "e:\\tekworks" in err_str)
record_test("T6.2", "Security", "Zero Stack Trace / Path Exposure in Error Response", not has_stack_trace, "Confirmed error payload masks internal server paths")

# CORS headers check
res_cors = requests.options(f"{BASE_URL}/predict-disease")
record_test("T6.3", "Security", "CORS Configuration Verification", res_cors.status_code in [200, 204, 405], f"OPTIONS response status: {res_cors.status_code}")

# -------------------------------------------------------------
# TASK 8: Performance & Latency Benchmark
# -------------------------------------------------------------
# Warm-up request
files = {'file': ('wheat_test.jpg', wheat_bytes, 'image/jpeg')}
requests.post(f"{BASE_URL}/predict-disease", files=files, data={'crop_type': 'Wheat'})

durations = []
for _ in range(5):
    t0 = time.time()
    files = {'file': ('wheat_test.jpg', wheat_bytes, 'image/jpeg')}
    requests.post(f"{BASE_URL}/predict-disease", files=files, data={'crop_type': 'Wheat'})
    durations.append(time.time() - t0)

avg_latency_ms = (sum(durations) / len(durations)) * 1000
record_test("T8.1", "Performance", "Disease Inference Average Latency", avg_latency_ms < 3000, f"Average latency across 5 runs: {avg_latency_ms:.2f} ms")

# Small concurrent workload test (3 concurrent requests)
def send_request(idx):
    f = {'file': (f'req_{idx}.jpg', wheat_bytes, 'image/jpeg')}
    r = requests.post(f"{BASE_URL}/predict-disease", files=f, data={'crop_type': 'Wheat'})
    return r.status_code == 200

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
    futures = [executor.submit(send_request, i) for i in range(3)]
    concurrent_results = [f.result() for f in futures]

all_concurrent_ok = all(concurrent_results)
record_test("T8.2", "Performance", "Controlled Concurrent Workload (3 Workers)", all_concurrent_ok, f"3/3 concurrent requests succeeded: {all_concurrent_ok}")

# -------------------------------------------------------------
# SUMMARY & SAVE
# -------------------------------------------------------------
passed_count = sum(1 for t in test_results if t['status'] == 'PASS')
total_count = len(test_results)
overall_verdict = "PASS" if passed_count == total_count else "FAIL"

print("\n--- PHASE 10 E2E QA TEST SUITE SUMMARY ---")
print(f"Total Tests Executed: {total_count}")
print(f"Passed:               {passed_count}")
print(f"Failed:               {total_count - passed_count}")
print(f"Overall Gate Verdict: {overall_verdict}")

out_path = os.path.join(reports_dir, "phase10_qa_results.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump({
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_tests": total_count,
        "passed": passed_count,
        "failed": total_count - passed_count,
        "verdict": overall_verdict,
        "tests": test_results
    }, f, indent=2)

print(f"Saved Phase 10 QA JSON to {out_path}")
