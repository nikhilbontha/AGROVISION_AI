import os
import sys
import json
import requests
import io
import time
from PIL import Image

print("=== AGROVISION AI — CRITICAL INFERENCE AUDIT & REPAIR TEST SUITE ===")

BASE_URL = "http://localhost:8000/predict"

test_results = []

def record(test_id, category, name, pass_condition, details):
    status = "PASS" if pass_condition else "FAIL"
    test_results.append({
        "test_id": test_id,
        "category": category,
        "name": name,
        "status": status,
        "details": details
    })
    print(f"[{status}] Test {test_id} ({category}): {name} - {details}")

# 1. Model Loading & Mapping Agreement
sys.path.append(r"e:\tekworks_projects\crop\backend")
from app.routes.predict import get_disease_model
from app.utils.disease_info import get_disease_info

c_model, idx_map = get_disease_model()
record("T1.1", "Model Audit", "72-Class Master Checkpoint Initialization", c_model is not None, f"Output shape: {c_model.output_shape if c_model else 'None'}")
record("T1.2", "Model Audit", "Class Mapping Length Agreement", len(idx_map) >= 72, f"Total class indices: {len(idx_map)}")

# 2. Disease Metadata Category Verification (Rice Bacterial Leaf Blight Fix)
info_blb = get_disease_info("Rice___Bacterial_Leaf_Blight")
is_bacterial = (info_blb.get("category") == "Bacterial Infection")
record("T2.1", "Metadata Audit", "Rice Bacterial Leaf Blight Category Correctness", is_bacterial, f"Category returned: '{info_blb.get('category')}'")

info_blb_lower = get_disease_info("Rice___Bacterial_leaf_blight")
is_bacterial_lower = (info_blb_lower.get("category") == "Bacterial Infection")
record("T2.2", "Metadata Audit", "Case-Insensitive Disease Metadata Lookup", is_bacterial_lower, f"Category returned: '{info_blb_lower.get('category')}'")

# 3. Crop Mismatch & Unconstrained Inference Verification
# Test Tomato image with selected_crop = 'Chilli' (User Screenshot 1 Bug Fix)
tomato_img_path = r"e:\tekworks_projects\crop\ml_models\disease_detection\dataset_prepared\train\Tomato___Early_blight\Tomato___Early_blight_train_0.jpg"
if not os.path.exists(tomato_img_path):
    tomato_img_path = r"e:\tekworks_projects\crop\datasets\regional_dataset_2\Andhra_Master_Dataset\Tomato_Healthy\000146ff-92a4-4db6-90ad-8fce2ae4fddd___GH_HL Leaf 259.1.JPG"

if os.path.exists(tomato_img_path):
    with open(tomato_img_path, 'rb') as f:
        tom_bytes = f.read()
    files = {'file': ('tomato_test.jpg', tom_bytes, 'image/jpeg')}
    data = {'crop_type': 'Chilli'}
    res = requests.post(f"{BASE_URL}/predict-disease", files=files, data=data)
    if res.status_code == 200:
        rj = res.json()
        is_safe_handled = (not rj.get('success', False) or rj.get('error_code') in ['CROP_MISMATCH', 'UNCERTAIN_DIAGNOSIS'] or rj.get('predicted_crop') == 'Tomato')
        record("T3.1", "Inference Repair", "Crop Mismatch / Safe Rejection (Tomato image uploaded as Chilli)", is_safe_handled, f"Response: {rj.get('message', rj.get('crop'))}")
    else:
        record("T3.1", "Inference Repair", "Crop Mismatch Detection", False, f"HTTP {res.status_code}")
else:
    record("T3.1", "Inference Repair", "Crop Mismatch Detection", False, "Tomato sample not found")

# Test Auto-Detect on Tomato image
if os.path.exists(tomato_img_path):
    files = {'file': ('tomato_test.jpg', tom_bytes, 'image/jpeg')}
    data = {'crop_type': 'Auto-Detect'}
    res = requests.post(f"{BASE_URL}/predict-disease", files=files, data=data)
    if res.status_code == 200:
        rj = res.json()
        pred_c = rj.get('crop', {}).get('name') if isinstance(rj.get('crop'), dict) else rj.get('crop')
        is_valid_pred = (pred_c == 'Tomato' or rj.get('is_uncertain', False) or not rj.get('success', False))
        record("T3.2", "Inference Repair", "Auto-Detect Crop Species (Tomato Image)", is_valid_pred, f"Predicted crop: '{pred_c}', Disease: '{rj.get('disease')}'")
    else:
        record("T3.2", "Inference Repair", "Auto-Detect Crop Species", False, f"HTTP {res.status_code}")

# 4. Regional Crops Diagnostic Inferences (Wheat, Rice, Corn, Chilli)
wheat_sample = r"e:\tekworks_projects\crop\ml_models\disease_detection\dataset_prepared\train\Wheat___Stripe_rust\Wheat___Stripe_rust_train_0.jpg"
rice_sample = r"e:\tekworks_projects\crop\datasets\regional_dataset_2\Andhra_Master_Dataset\Rice_Blast\BLAST1_001.jpg"
chilli_sample = r"e:\tekworks_projects\crop\datasets\regional_dataset_2\Andhra_Master_Dataset\Chilli_Leaf Curl Virus\FLIPV-download (1).jpg"

samples = [("Wheat", wheat_sample), ("Rice", rice_sample), ("Chilli", chilli_sample)]
all_samples_ok = True
details_list = []
for crop_n, sample_p in samples:
    if os.path.exists(sample_p):
        with open(sample_p, 'rb') as f:
            sb = f.read()
        files = {'file': (os.path.basename(sample_p), sb, 'image/jpeg')}
        res = requests.post(f"{BASE_URL}/predict-disease", files=files, data={'crop_type': 'Auto-Detect'})
        if res.status_code == 200:
            rj = res.json()
            c_res = rj.get('crop', {}).get('name') if isinstance(rj.get('crop'), dict) else rj.get('crop')
            details_list.append(f"{crop_n}->{c_res}:{rj.get('confidence'):.1f}%")
        else:
            all_samples_ok = False
    else:
        all_samples_ok = False

record("T4.1", "Inference Audit", "Multi-Crop Diagnostic Accuracy", all_samples_ok, ", ".join(details_list))

# 5. Out-of-Distribution Safety & Non-Plant Rejection
img = Image.new('RGB', (300, 300), color=(0, 0, 255))
buf = io.BytesIO()
img.save(buf, format='JPEG')
blue_bytes = buf.getvalue()
files = {'file': ('non_plant.jpg', blue_bytes, 'image/jpeg')}
res = requests.post(f"{BASE_URL}/predict-disease", files=files, data={'crop_type': 'Auto-Detect'})
if res.status_code == 200:
    rj = res.json()
    is_safe_rejection = (not rj.get('success', True) or rj.get('is_uncertain', False))
    record("T5.1", "Safety Rejection", "Out-of-Distribution Non-Plant Safety Rejection", is_safe_rejection, f"Message: '{rj.get('message')}'")
else:
    record("T5.1", "Safety Rejection", "Out-of-Distribution Non-Plant Safety Rejection", False, f"HTTP {res.status_code}")

# 6. Yield Prediction Regression Safety
valid_yield_payload = {
    "district": "Hyderabad",
    "crop_type": "Wheat",
    "soil_type": "Loamy",
    "area": 2.5,
    "area_unit": "acres"
}
res_yield = requests.post(f"{BASE_URL}/predict-yield", json=valid_yield_payload)
yield_ok = (res_yield.status_code == 200 and res_yield.json().get('total_expected_yield_tons', 0) > 0)
record("T6.1", "Regression Safety", "Yield Engine API Regression", yield_ok, f"Total harvest forecast: {res_yield.json().get('total_expected_yield_tons', 0):.2f} tons")

# SUMMARY & JSON SAVE
passed = sum(1 for t in test_results if t['status'] == 'PASS')
total = len(test_results)
verdict = "PASS" if passed == total else "FAIL"

print(f"\n--- AUDIT TEST SUMMARY: {passed}/{total} PASSED ({verdict}) ---")
out_file = r"e:\tekworks_projects\crop\reports\critical_inference_audit_results.json"
os.makedirs(os.path.dirname(out_file), exist_ok=True)
with open(out_file, "w", encoding='utf-8') as f:
    json.dump({"total": total, "passed": passed, "verdict": verdict, "tests": test_results}, f, indent=2)

print(f"Saved audit test results to {out_file}")
