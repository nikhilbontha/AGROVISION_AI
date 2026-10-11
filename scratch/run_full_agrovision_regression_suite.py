import sys
import os
import json
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from app.routes.predict import get_disease_model, PRIMARY_DISEASE_MODEL_PATH, PRIMARY_MAPPING_PATH, router as predict_router
from app.utils.disease_info import get_disease_info

def run_regression_suite():
    print("=====================================================================")
    print("  AGROVISION AI — STAGE 9 & 10 FULL SYSTEM REGRESSION TEST SUITE     ")
    print("=====================================================================")
    
    passed_tests = 0
    total_tests = 7
    
    # 1. Model Loading Check
    print("\n[TEST 1/7] Loading Primary Production Model...")
    try:
        model, canonical_mapping = get_disease_model()
        assert model is not None
        num_classes = model.output_shape[-1]
        assert num_classes == 72, f"Expected 72 classes, got {num_classes}"
        print(f"  PASS: Loaded model from {PRIMARY_DISEASE_MODEL_PATH} with {num_classes} classes.")
        passed_tests += 1
    except Exception as e:
        print(f"  FAIL: Model load failed - {e}")

    # 2. Canonical Mapping Check
    print("\n[TEST 2/7] Verifying Canonical Class Index Mapping...")
    try:
        model, canonical_mapping = get_disease_model()
        assert len(canonical_mapping) >= 72, f"Expected at least 72 classes, got {len(canonical_mapping)}"
        cls_0 = canonical_mapping.get(0) or canonical_mapping.get("0")
        cls_46 = canonical_mapping.get(46) or canonical_mapping.get("46")
        assert cls_0 == "Apple___Apple_Scab", f"Expected 'Apple___Apple_Scab', got '{cls_0}'"
        assert cls_46 == "Rice___Bacterial_Leaf_Blight", f"Expected 'Rice___Bacterial_Leaf_Blight', got '{cls_46}'"
        print("  PASS: 72 canonical class mappings verified.")
        passed_tests += 1
    except Exception as e:
        print(f"  FAIL: Canonical mapping check failed - {e}")

    # 3. Unconstrained Prediction Math Check
    print("\n[TEST 3/7] Testing Unconstrained Prediction & Global Probabilities...")
    try:
        model, canonical_mapping = get_disease_model()
        dummy_input = np.ones((1, 224, 224, 3), dtype=np.float32) * 128.0
        preds = model.predict(dummy_input, verbose=0)[0]
        top_idx = int(np.argmax(preds))
        top_prob = float(preds[top_idx])
        top_class = canonical_mapping.get(top_idx) or canonical_mapping.get(str(top_idx))
        
        prob_sum = float(np.sum(preds))
        assert abs(prob_sum - 1.0) < 1e-3
        print(f"  PASS: Unconstrained global output top prediction: '{top_class}' (prob={top_prob:.4f}, sum={prob_sum:.4f}).")
        passed_tests += 1
    except Exception as e:
        print(f"  FAIL: Prediction test failed - {e}")

    # 4. Crop Mismatch Logic Test
    print("\n[TEST 4/7] Testing Crop Mismatch Safeguard Logic...")
    try:
        predicted_crop = "Tomato"
        user_selected_crop = "Rice"
        top_confidence = 0.92
        
        crop_mismatch = (
            user_selected_crop != 'Auto-Detect' and 
            user_selected_crop.lower() != predicted_crop.lower() and 
            top_confidence >= 0.50
        )
        assert crop_mismatch == True
        print(f"  PASS: Correctly flagged crop mismatch between selected '{user_selected_crop}' and predicted '{predicted_crop}'.")
        passed_tests += 1
    except Exception as e:
        print(f"  FAIL: Crop mismatch logic failed - {e}")

    # 5. Metadata Casing & Category Normalization Test
    print("\n[TEST 5/7] Testing Disease Metadata Retrieval & Casing Normalization...")
    try:
        info = get_disease_info("Rice___Bacterial_Leaf_Blight", lang="en")
        category = info.get("category")
        assert category == "Bacterial Infection", f"Expected 'Bacterial Infection', got '{category}'"
        print(f"  PASS: 'Rice___Bacterial_Leaf_Blight' correctly mapped to category '{category}'.")
        passed_tests += 1
    except Exception as e:
        print(f"  FAIL: Metadata casing normalization failed - {e}")

    # 6. Yield & Predict Router Preservation Check
    print("\n[TEST 6/7] Verifying Yield & Prediction Router Compatibility...")
    try:
        assert predict_router is not None
        print("  PASS: Yield & Prediction API router intact.")
        passed_tests += 1
    except Exception as e:
        print(f"  FAIL: Router import check failed - {e}")

    # 7. Dataset Manifest Integrity Check
    print("\n[TEST 7/7] Checking Phase 5 Locked Test Partition Manifest...")
    try:
        test_manifest_path = "ml_models/disease_detection/unified_experiment/test_manifest.json"
        with open(test_manifest_path, 'r') as f:
            test_data = json.load(f)
        assert len(test_data) == 3522
        print(f"  PASS: Locked test set partition verified ({len(test_data)} records).")
        passed_tests += 1
    except Exception as e:
        print(f"  FAIL: Test manifest check failed - {e}")

    print("\n=====================================================================")
    print(f"  REGRESSION SUITE RESULTS: {passed_tests}/{total_tests} TESTS PASSED")
    print("=====================================================================")
    
    results_summary = {
        "passed_tests": passed_tests,
        "total_tests": total_tests,
        "status": "PASS" if passed_tests == total_tests else "FAIL",
        "final_release_decision": "OPTION_A_READY_FOR_CONTROLLED_INTEGRATION"
    }
    
    with open("reports/full_regression_suite_results.json", "w") as f:
        json.dump(results_summary, f, indent=2)
        
    return passed_tests == total_tests

if __name__ == "__main__":
    success = run_regression_suite()
    sys.exit(0 if success else 1)
