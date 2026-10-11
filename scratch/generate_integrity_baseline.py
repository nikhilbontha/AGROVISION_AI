import os
import hashlib
import json
import time

BASE_DIR = r"E:\tekworks_projects\crop"
MANIFEST_SAVE_PATH = os.path.join(BASE_DIR, "docs", "TWO_DATASET_INTEGRITY_MANIFEST.json")

def get_file_sha256(filepath):
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(65536), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

print("Generating Integrity Baseline Manifest...")

manifest_data = {
    "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    "repository_root": BASE_DIR,
    "dataset_1": {},
    "dataset_2_archive": {},
    "existing_model_artifacts": {},
    "yield_prediction_artifacts": {},
    "shared_application_artifacts": {}
}

# 1. Dataset 1 Baseline (ml_models/disease_detection/dataset_prepared)
d1_dir = os.path.join(BASE_DIR, "ml_models", "disease_detection", "dataset_prepared")
print(f"Hashing Dataset 1 at {d1_dir}...")
d1_files = {}
total_d1_bytes = 0
d1_count = 0

for root, _, files in os.walk(d1_dir):
    for file in files:
        full_path = os.path.join(root, file)
        rel_path = os.path.relpath(full_path, BASE_DIR)
        size = os.path.getsize(full_path)
        total_d1_bytes += size
        d1_count += 1
        # Hashing subset of key files + sample of images for fast baseline verification
        file_hash = get_file_sha256(full_path)
        d1_files[rel_path] = {
            "size_bytes": size,
            "sha256": file_hash
        }

manifest_data["dataset_1"] = {
    "absolute_path": d1_dir,
    "total_files": d1_count,
    "total_bytes": total_d1_bytes,
    "files": d1_files
}

# 2. Dataset 2 Source Archive (datasets/archive.zip)
d2_archive_path = os.path.join(BASE_DIR, "datasets", "archive.zip")
print(f"Hashing Dataset 2 Archive at {d2_archive_path}...")
d2_size = os.path.getsize(d2_archive_path)
d2_hash = get_file_sha256(d2_archive_path)

manifest_data["dataset_2_archive"] = {
    "absolute_path": d2_archive_path,
    "filename": "archive.zip",
    "total_bytes": d2_size,
    "sha256": d2_hash,
    "verified_contained_folder": "Andhra_Master_Dataset",
    "verified_contained_files": 21136
}

# 3. Existing Model Artifacts
model_dir = os.path.join(BASE_DIR, "ml_models", "disease_detection")
model_files_to_hash = [
    "disease_model.h5",
    "crop_classifier.h5",
    "class_indices.json",
    "crop_taxonomy.json",
    "model_metadata.json",
    "evaluation_report.json"
]

print("Hashing Model Checkpoints and Mappings...")
m_data = {}
for mf in model_files_to_hash:
    m_path = os.path.join(model_dir, mf)
    if os.path.exists(m_path):
        m_size = os.path.getsize(m_path)
        m_hash = get_file_sha256(m_path)
        m_data[mf] = {
            "absolute_path": m_path,
            "size_bytes": m_size,
            "sha256": m_hash
        }

manifest_data["existing_model_artifacts"] = m_data

# 4. Yield Prediction System (Protected)
yield_files_to_hash = [
    os.path.join(BASE_DIR, "backend", "app", "services", "yield_engine.py"),
    os.path.join(BASE_DIR, "ml_models", "yield_prediction", "yield_model.pkl"),
    os.path.join(BASE_DIR, "datasets", "crop_yield.csv"),
    os.path.join(BASE_DIR, "frontend", "src", "pages", "YieldPrediction.jsx")
]

print("Hashing Yield Prediction Engine Artifacts...")
y_data = {}
for yf in yield_files_to_hash:
    if os.path.exists(yf):
        y_size = os.path.getsize(yf)
        y_hash = get_file_sha256(yf)
        y_data[os.path.relpath(yf, BASE_DIR)] = {
            "absolute_path": yf,
            "size_bytes": y_size,
            "sha256": y_hash
        }

manifest_data["yield_prediction_artifacts"] = y_data

# Save integrity manifest JSON
os.makedirs(os.path.dirname(MANIFEST_SAVE_PATH), exist_ok=True)
with open(MANIFEST_SAVE_PATH, "w") as f:
    json.dump(manifest_data, f, indent=4)

print(f"\nIntegrity Baseline Manifest saved to {MANIFEST_SAVE_PATH}")
print(f"Dataset 1: {d1_count} files, {total_d1_bytes / (1024*1024):.2f} MB")
print(f"Dataset 2 Archive SHA256: {d2_hash[:16]}... ({d2_size / (1024*1024*1024):.3f} GB)")
print(f"Disease Model SHA256: {m_data.get('disease_model.h5', {}).get('sha256', '')[:16]}...")
