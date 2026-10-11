"""
AgroVision AI 2.0 - Strategy C Training Script
Crop Identity Router Architecture
"""
import os
import sys
import json
import time
import joblib
import numpy as np
import cv2
from sklearn.ensemble import RandomForestClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import accuracy_score, balanced_accuracy_score, classification_report, confusion_matrix

def extract_visual_features(image_path, target_size=(128, 128)):
    """
    Extract robust 136-dimensional visual feature vector:
    - 3D HSV Color Histogram (64 bins)
    - RGB Color Mean and Standard Deviations (6 features)
    - Grayscale Texture Histogram (32 bins)
    - Hu Spatial Moments (7 invariant shape moments)
    - Downscaled Intensity Grid (27 features)
    """
    if not os.path.exists(image_path):
        return None
        
    img = cv2.imread(image_path)
    if img is None:
        return None
        
    img = cv2.resize(img, target_size)
    
    # 1. HSV Histogram
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    hist_hsv = cv2.calcHist([hsv], [0, 1, 2], None, [4, 4, 4], [0, 180, 0, 256, 0, 256])
    hist_hsv = cv2.normalize(hist_hsv, hist_hsv).flatten() # 64 dims
    
    # 2. RGB Stats
    mean, std = cv2.meanStdDev(img)
    rgb_stats = np.hstack([mean.flatten(), std.flatten()]) # 6 dims
    
    # 3. Grayscale Texture
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    hist_gray = cv2.calcHist([gray], [0], None, [32], [0, 256])
    hist_gray = cv2.normalize(hist_gray, hist_gray).flatten() # 32 dims
    
    # 4. Hu Moments
    moments = cv2.moments(gray)
    hu = cv2.HuMoments(moments).flatten()
    hu = -np.sign(hu) * np.log10(np.abs(hu) + 1e-10) # 7 dims
    
    # 5. Spatial Grid Subsampling
    small = cv2.resize(img, (3, 3)).flatten() / 255.0 # 27 dims
    
    feats = np.hstack([hist_hsv, rgb_stats, hist_gray, hu, small])
    return feats

def get_resolved_path(record, base_dir):
    source = record.get("dataset_source")
    if source == "Dataset_1":
        return os.path.join(base_dir, record["image_path"])
    elif source == "Dataset_2":
        return os.path.join(base_dir, "datasets", "regional_dataset_2", record.get("archive_path", ""))
    return None

def train_crop_router(max_train_samples=2500, max_eval_samples=600):
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
    train_manifest_path = os.path.join(base_dir, "ml_models", "disease_detection", "unified_experiment", "train_manifest.json")
    val_manifest_path = os.path.join(base_dir, "ml_models", "disease_detection", "unified_experiment", "val_manifest.json")
    test_manifest_path = os.path.join(base_dir, "ml_models", "disease_detection", "unified_experiment", "test_manifest.json")
    
    with open(train_manifest_path, "r", encoding="utf-8") as f:
        train_records = json.load(f)
    with open(val_manifest_path, "r", encoding="utf-8") as f:
        val_records = json.load(f)
    with open(test_manifest_path, "r", encoding="utf-8") as f:
        test_records = json.load(f)
        
    print(f"Loaded manifests: Train={len(train_records)}, Val={len(val_records)}, Test={len(test_records)}")
    
    # Stratified subsampling for fast, deterministic training on host CPU
    np.random.seed(42)
    step_tr = max(1, len(train_records) // max_train_samples)
    sampled_train = train_records[::step_tr][:max_train_samples]
    
    step_te = max(1, len(test_records) // max_eval_samples)
    sampled_test = test_records[::step_te][:max_eval_samples]
    
    # Unique crops mapping
    crops = sorted(list(set(r["canonical_crop"] for r in train_records)))
    crop_to_idx = {c: i for i, c in enumerate(crops)}
    idx_to_crop = {i: c for i, c in enumerate(crops)}
    
    print(f"Training Crop Router on {len(crops)} crop classes using {len(sampled_train)} samples...")
    
    X_train, y_train = [], []
    for r in sampled_train:
        p = get_resolved_path(r, base_dir)
        if p and os.path.exists(p):
            f = extract_visual_features(p)
            if f is not None:
                X_train.append(f)
                y_train.append(crop_to_idx[r["canonical_crop"]])
                
    X_train = np.array(X_train)
    y_train = np.array(y_train)
    print(f"Extracted training feature matrix: {X_train.shape}")
    
    # Fit Random Forest + Calibrated Probability
    base_rf = RandomForestClassifier(n_estimators=100, max_depth=16, random_state=42, n_jobs=-1)
    base_rf.fit(X_train, y_train)
    
    # Evaluate on held-out test split
    print(f"Evaluating on {len(sampled_test)} held-out test samples...")
    X_test, y_test = [], []
    for r in sampled_test:
        p = get_resolved_path(r, base_dir)
        if p and os.path.exists(p):
            f = extract_visual_features(p)
            if f is not None:
                X_test.append(f)
                y_test.append(crop_to_idx[r["canonical_crop"]])
                
    X_test = np.array(X_test)
    y_test = np.array(y_test)
    
    y_pred = base_rf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    bal_acc = balanced_accuracy_score(y_test, y_pred)
    
    print(f"--> Test Overall Accuracy: {acc:.4f}")
    print(f"--> Test Balanced Accuracy: {bal_acc:.4f}")
    
    # Save artifacts
    art_dir = os.path.join(base_dir, "ml_models", "disease_detection", "agrovision_v2_experiments", "artifacts", "strategy_c")
    os.makedirs(art_dir, exist_ok=True)
    
    model_save_path = os.path.join(art_dir, "crop_identity_router.pkl")
    joblib.dump({
        "model": base_rf,
        "crops": crops,
        "crop_to_idx": crop_to_idx,
        "idx_to_crop": idx_to_crop,
        "feature_dim": X_train.shape[1]
    }, model_save_path)
    
    metrics_path = os.path.join(art_dir, "crop_router_metrics.json")
    metrics = {
        "strategy": "C_CROP_IDENTITY_ROUTER",
        "num_crops": len(crops),
        "test_samples": len(y_test),
        "overall_accuracy": float(acc),
        "balanced_accuracy": float(bal_acc),
        "feature_dim": int(X_train.shape[1]),
        "classifier": "RandomForestClassifier(n_estimators=100, max_depth=16)"
    }
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
        
    print(f"Saved Crop Router artifact to: {model_save_path}")
    print(f"Saved Metrics to: {metrics_path}")
    return metrics

if __name__ == "__main__":
    train_crop_router()
