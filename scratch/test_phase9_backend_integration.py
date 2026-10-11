import os
import json
import tensorflow as tf
import numpy as np
from PIL import Image
import io

print("=== AGROVISION AI PHASE 9: BACKEND INTEGRATION TEST SCRIPT ===")

BASE_DIR = r"e:\tekworks_projects\crop"
UNIFIED_MODEL_PATH = os.path.join(BASE_DIR, "ml_models/disease_detection/unified_experiment/artifacts/agrovision_phase7_20261010_231412/AGROVISION_UNIFIED_72CLASS_MODEL.h5")
UNIFIED_MAPPING_PATH = os.path.join(BASE_DIR, "ml_models/disease_detection/unified_experiment/unified_label_mapping.json")

print(f"Checking Master Model Checkpoint: {UNIFIED_MODEL_PATH}")
print(f"Exists: {os.path.exists(UNIFIED_MODEL_PATH)} (Size: {os.path.getsize(UNIFIED_MODEL_PATH)/(1024**2):.2f} MB)")

print(f"Checking Unified Mapping: {UNIFIED_MAPPING_PATH}")
print(f"Exists: {os.path.exists(UNIFIED_MAPPING_PATH)}")

# Load mapping
with open(UNIFIED_MAPPING_PATH, 'r', encoding='utf-8') as f:
    mapping_data = json.load(f)

idx_to_class = {m['canonical_class_id']: m['canonical_class_key'] for m in mapping_data if 'canonical_class_id' in m}
class_to_meta = {m['canonical_class_key']: (m['canonical_crop'], m['canonical_disease']) for m in mapping_data if 'canonical_class_key' in m}

print(f"Loaded {len(idx_to_class)} index-to-class mappings.")
print(f"Loaded {len(class_to_meta)} class-to-metadata mappings.")

# Load model
model = tf.keras.models.load_model(UNIFIED_MODEL_PATH, compile=False)
print(f"Loaded Model Input Shape: {model.input_shape}")
print(f"Loaded Model Output Shape: {model.output_shape}")

# Test dummy inference
dummy_img = np.zeros((1, 224, 224, 3), dtype=np.float32)
preds = model.predict(dummy_img, verbose=0)[0]
top_idx = int(np.argmax(preds))
top_conf = float(np.max(preds))
top_key = idx_to_class.get(top_idx, "Unknown")
crop, disease = class_to_meta.get(top_key, ("Unknown", "Unknown"))

print("\nDummy Inference Test Results:")
print(f"  Top Class ID: {top_idx}")
print(f"  Top Class Key: {top_key}")
print(f"  Canonical Crop: {crop}")
print(f"  Canonical Disease: {disease}")
print(f"  Confidence: {top_conf*100:.2f}%")
print(f"  Finite Preds: {bool(np.all(np.isfinite(preds)))}")
print(f"  Output Dim Match: {len(preds)} == 72 -> {len(preds) == 72}")

print("\nPhase 9 Precondition and Loading Check: SUCCESS!")
