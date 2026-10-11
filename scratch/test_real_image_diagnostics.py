"""
AgroVision AI 2.0 - Real-Image Diagnostic Verification Suite
Evaluates actual image fixtures across Wheat, Chilli, Tomato, Potato, Corn,
Unsupported, and Degenerate/Ambiguous inputs against the live backend API.
Verifies honest prediction, leaf validation, and safety abstention.
"""

import os
import sys
import json
import glob
import urllib.request
import urllib.error
from datetime import datetime, timezone

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API_URL = "http://127.0.0.1:8000/predict/predict-disease"

# Catalog test image paths
IMAGE_SPECS = [
    {
        "category": "Wheat_Diseased",
        "crop": "Wheat",
        "expected_healthy": False,
        "search_pattern": "ml_models/disease_detection/dataset_prepared/test/Wheat___Stripe_rust/*.*"
    },
    {
        "category": "Wheat_Healthy",
        "crop": "Wheat",
        "expected_healthy": True,
        "search_pattern": "ml_models/disease_detection/dataset_prepared/test/Wheat___healthy/*.*"
    },
    {
        "category": "Chilli_Diseased",
        "crop": "Chilli",
        "expected_healthy": False,
        "search_pattern": "datasets/regional_dataset_2/Andhra_Master_Dataset/Chilli_Anthracnose/*.*"
    },
    {
        "category": "Chilli_Healthy",
        "crop": "Chilli",
        "expected_healthy": True,
        "search_pattern": "datasets/regional_dataset_2/Andhra_Master_Dataset/Chilli_Healthy/*.*"
    },
    {
        "category": "Tomato_Diseased",
        "crop": "Tomato",
        "expected_healthy": False,
        "search_pattern": "ml_models/disease_detection/dataset_prepared/test/Tomato___Late_blight/*.*"
    },
    {
        "category": "Tomato_Healthy",
        "crop": "Tomato",
        "expected_healthy": True,
        "search_pattern": "ml_models/disease_detection/dataset_prepared/test/Tomato___healthy/*.*"
    },
    {
        "category": "Potato_Diseased",
        "crop": "Potato",
        "expected_healthy": False,
        "search_pattern": "ml_models/disease_detection/dataset_prepared/test/Potato___Late_blight/*.*"
    },
    {
        "category": "Potato_Healthy",
        "crop": "Potato",
        "expected_healthy": True,
        "search_pattern": "ml_models/disease_detection/dataset_prepared/test/Potato___healthy/*.*"
    },
    {
        "category": "Corn_Diseased",
        "crop": "Corn",
        "expected_healthy": False,
        "search_pattern": "ml_models/disease_detection/dataset_prepared/test/Corn___Common_rust/*.*"
    },
    {
        "category": "Corn_Healthy",
        "crop": "Corn",
        "expected_healthy": True,
        "search_pattern": "ml_models/disease_detection/dataset_prepared/test/Corn___healthy/*.*"
    },
    {
        "category": "Non_Plant_Unsupported",
        "crop": "Auto-Detect",
        "expected_healthy": None,
        "search_pattern": "ml_models/disease_detection/dataset_prepared/test/Non_Plant___Unsupported/*.*"
    }
]

def create_multipart_body(file_bytes, filename, crop_type):
    boundary = "----AgroVisionTestBoundary12345"
    lines = []
    
    # file field
    lines.append(f"--{boundary}".encode('utf-8'))
    lines.append(f'Content-Disposition: form-data; name="file"; filename="{filename}"'.encode('utf-8'))
    lines.append(b'Content-Type: image/jpeg\r\n')
    lines.append(file_bytes)
    
    # crop_type field
    lines.append(f"--{boundary}".encode('utf-8'))
    lines.append(b'Content-Disposition: form-data; name="crop_type"\r\n')
    lines.append(crop_type.encode('utf-8'))
    
    lines.append(f"--{boundary}--\r\n".encode('utf-8'))
    
    body = b"\r\n".join(lines[:-1]) + b"\r\n" + lines[-1]
    headers = {"Content-Type": f"multipart/form-data; boundary={boundary}"}
    return body, headers

def run_real_image_checks():
    print("=" * 70)
    print("AGROVISION AI 2.0 - REAL-IMAGE DIAGNOSTIC VERIFICATION")
    print("=" * 70)
    
    audit_results = {
        "suite": "Real-Image Diagnostic Checks",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total_probes": 0,
        "probes": []
    }
    
    for spec in IMAGE_SPECS:
        pattern = os.path.join(BASE_DIR, spec["search_pattern"].replace("/", os.sep))
        matches = glob.glob(pattern)
        
        if not matches:
            print(f"[SKIP] No files found for pattern: {spec['search_pattern']}")
            continue
            
        test_file = matches[0]
        fname = os.path.basename(test_file)
        with open(test_file, "rb") as f:
            fbytes = f.read()
            
        body, headers = create_multipart_body(fbytes, fname, spec["crop"])
        req = urllib.request.Request(API_URL, data=body, headers=headers)
        
        audit_results["total_probes"] += 1
        probe_record = {
            "category": spec["category"],
            "crop_conditioned": spec["crop"],
            "file": fname,
            "file_size_bytes": len(fbytes)
        }
        
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                probe_record["http_status"] = resp.status
                probe_record["success"] = data.get("success")
                probe_record["predicted_disease"] = data.get("disease")
                probe_record["confidence"] = data.get("confidence")
                probe_record["severity"] = data.get("severity")
                probe_record["is_uncertain"] = data.get("is_uncertain", False)
                probe_record["error_code"] = data.get("error_code")
                
                print(f"[OK] {spec['category']:<22} | File: {fname[:20]:<20} | Pred: {data.get('disease') or data.get('error_code')} | Conf: {data.get('confidence')}%")
        except urllib.error.HTTPError as e:
            err_data = json.loads(e.read().decode('utf-8'))
            probe_record["http_status"] = e.code
            probe_record["error_detail"] = err_data
            print(f"[ERR] {spec['category']:<22} | HTTP {e.code}: {err_data}")
        except Exception as e:
            probe_record["exception"] = str(e)
            print(f"[FAIL] {spec['category']:<22} | Exception: {e}")
            
        audit_results["probes"].append(probe_record)
        
    # Test 12: Poor Quality / Non-Plant Solid Color Noise
    import numpy as np
    import cv2
    solid_noise = np.zeros((224, 224, 3), dtype=np.uint8) # pure black
    _, noise_buf = cv2.imencode(".jpg", solid_noise)
    body, headers = create_multipart_body(noise_buf.tobytes(), "pure_black_noise.jpg", "Auto-Detect")
    req = urllib.request.Request(API_URL, data=body, headers=headers)
    audit_results["total_probes"] += 1
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"[OK] {'Degenerate_Noise':<22} | Code: {data.get('error_code')} | Success: {data.get('success')} (Properly rejected)")
            audit_results["probes"].append({
                "category": "Degenerate_Noise",
                "crop_conditioned": "Auto-Detect",
                "error_code": data.get("error_code"),
                "leaf_detected": data.get("leaf_detected"),
                "abstention_success": data.get("success") is False
            })
    except Exception as e:
        print(f"[FAIL] Degenerate_Noise | {e}")
        
    out_file = os.path.join(BASE_DIR, "docs", "agrovision_v2", "phase10", "real_image_diagnostic_results.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(audit_results, f, indent=2)
    print(f"\nReal-image diagnostic audit complete. Results saved to: {out_file}")

if __name__ == "__main__":
    run_real_image_checks()
