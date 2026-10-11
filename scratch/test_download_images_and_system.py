import os
import sys
import glob
import io
import json
import base64
import requests
import cv2
import numpy as np
from PIL import Image

DOWNLOADS_DIR = r"C:\Users\nikhi\Downloads"
API_BASE = "http://127.0.0.1:8000"

print("=" * 80)
print(" AGROVISION AI: COMPREHENSIVE LOCAL DOWNLOADS IMAGE TEST SUITE")
print("=" * 80)

# 1. Collect all images in Downloads
exts = ('.jpg', '.jpeg', '.png', '.webp', '.bmp')
all_images = [
    os.path.join(DOWNLOADS_DIR, f)
    for f in os.listdir(DOWNLOADS_DIR)
    if f.lower().endswith(exts)
]

print(f"Total images detected in {DOWNLOADS_DIR}: {len(all_images)}")

# Filter specifically for crop, plant, agricultural, or relevant test images
# Keywords or known crop names
crop_keywords = [
    "crop", "disease", "rust", "rice", "wheat", "cotton", "leaf", "leaves",
    "smut", "blight", "spot", "mango", "chilli", "tomato", "potato", "apple",
    "grape", "corn", "maize", "whatsapp", "images", "download", "df02a", "screenshot"
]

crop_images = []
other_images = []

for p in all_images:
    fname = os.path.basename(p).lower()
    if any(k in fname for k in crop_keywords):
        crop_images.append(p)
    else:
        other_images.append(p)

print(f"Target crop/field candidate images selected: {len(crop_images)}")
print(f"Other general/system images in Downloads: {len(other_images)}")

# We will test all candidate crop images + a sample of non-crop images (to verify negative-class / reject gate)
test_queue = list(crop_images)
if other_images:
    # Add up to 3 non-crop images for rejection testing
    test_queue.extend(other_images[:3])

print(f"Total images queued for automated deep testing: {len(test_queue)}")
print("-" * 80)

results = []

for idx, img_path in enumerate(test_queue, 1):
    fname = os.path.basename(img_path)
    file_size_kb = os.path.getsize(img_path) / 1024.0
    
    # 1. Basic Image Validation
    try:
        pil_img = Image.open(img_path)
        w, h = pil_img.size
        format_name = pil_img.format
        mode = pil_img.mode
        cv_img = cv2.imread(img_path)
    except Exception as e:
        results.append({
            "filename": fname,
            "path": img_path,
            "valid_image": False,
            "error": str(e)
        })
        continue

    # 2. Test via Live Backend /predict/predict-disease endpoint
    api_res = None
    try:
        with open(img_path, "rb") as f:
            files = {"file": (fname, f, f"image/{format_name.lower() if format_name else 'jpeg'}")}
            data = {"crop_type": "Auto-Detect", "lang": "en"}
            r = requests.post(f"{API_BASE}/predict/predict-disease", files=files, data=data, timeout=15)
            api_res = r.json()
    except Exception as e:
        api_res = {"error": str(e), "success": False}

    # Extract metrics
    success = api_res.get("success", False)
    error_code = api_res.get("error_code")
    predicted_crop = api_res.get("crop")
    predicted_disease = api_res.get("disease")
    confidence = api_res.get("confidence") or api_res.get("confidence_score")
    severity = api_res.get("severity")
    is_leaf = api_res.get("is_leaf", True if success else False)
    is_uncertain = api_res.get("is_uncertain", False)
    message = api_res.get("message", "")
    top_candidate = api_res.get("top_candidate") or {}
    
    # Check if there is diagnosis follow-up or recommendations
    rec_count = len(api_res.get("recommendations", {}).get("chemical", [])) + len(api_res.get("recommendations", {}).get("organic", [])) if "recommendations" in api_res else 0

    outcome_type = ""
    if success and not is_uncertain:
        outcome_type = "CONFIRMED_DIAGNOSIS"
    elif is_uncertain:
        outcome_type = "UNCERTAIN_SAFETY_GATE"
    elif error_code == "NON_CROP_IMAGE":
        outcome_type = "REJECTED_NON_CROP"
    elif error_code == "CROP_MISMATCH":
        outcome_type = "CROP_MISMATCH"
    else:
        outcome_type = "INFERENCE_ALERT"

    item_report = {
        "index": idx,
        "filename": fname,
        "resolution": f"{w}x{h}",
        "size_kb": round(file_size_kb, 1),
        "outcome_type": outcome_type,
        "success": success,
        "error_code": error_code,
        "crop": predicted_crop,
        "disease": predicted_disease,
        "confidence": confidence,
        "severity": severity,
        "is_leaf": is_leaf,
        "is_uncertain": is_uncertain,
        "top_candidate": top_candidate,
        "message": message[:120] + "..." if len(message) > 120 else message
    }
    results.append(item_report)

    status_str = f"[{outcome_type}]"
    if outcome_type == "CONFIRMED_DIAGNOSIS":
        print(f"{idx:02d}. {fname:<38} -> {predicted_crop} : {predicted_disease} ({confidence}%) [Severity: {severity}]")
    elif outcome_type == "UNCERTAIN_SAFETY_GATE":
        cand_name = top_candidate.get('disease', 'N/A')
        cand_conf = top_candidate.get('confidence', confidence)
        print(f"{idx:02d}. {fname:<38} -> UNCERTAIN ({cand_conf}%) [Top: {cand_name}]")
    elif outcome_type == "REJECTED_NON_CROP":
        print(f"{idx:02d}. {fname:<38} -> REJECTED (Non-Crop / Foliage Filter Active)")
    else:
        print(f"{idx:02d}. {fname:<38} -> {outcome_type}: {message[:60]}")

# Save JSON results to scratch
out_json_path = r"e:\tekworks_projects\crop\scratch\downloads_images_test_results.json"
with open(out_json_path, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print("\n" + "=" * 80)
print(f"Completed testing {len(results)} images. Full JSON saved to {out_json_path}")
print("=" * 80)
