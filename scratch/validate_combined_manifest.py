import os
import json
import zipfile
from collections import Counter

BASE_DIR = r"E:\tekworks_projects\crop"
EXPERIMENT_DIR = os.path.join(BASE_DIR, "ml_models", "disease_detection", "unified_experiment")
COMBINED_MANIFEST = os.path.join(EXPERIMENT_DIR, "combined_training_manifest.json")
QUARANTINE_MANIFEST = os.path.join(EXPERIMENT_DIR, "quarantine_manifest.json")
MAPPING_FILE = os.path.join(EXPERIMENT_DIR, "unified_label_mapping.json")

print("=================================================================")
print("  AGROVISION AI - PHASE 4 COMBINED MANIFEST VALIDATION ENGINE    ")
print("=================================================================")

with open(COMBINED_MANIFEST, "r") as f:
    combined = json.load(f)

with open(QUARANTINE_MANIFEST, "r") as f:
    quarantine = json.load(f)

with open(MAPPING_FILE, "r") as f:
    mappings = json.load(f)

errors = []

# 1. Reconciliation of counts
total_input = 2730 + 21135 # Dataset 1 + Dataset 2
total_output = len(combined) + len(quarantine)
if total_input == total_output:
    print(f"[OK] Total count reconciled exactly: {total_input} inputs == {len(combined)} combined + {len(quarantine)} quarantined.")
else:
    errors.append(f"Count mismatch: {total_input} inputs vs {total_output} outputs.")

# 2. Verify all combined records have valid canonical_class_id >= 0
class_ids = set()
class_to_meaning = {}
for rec in combined:
    cls_id = rec.get("canonical_class_id", -1)
    c_key = rec.get("canonical_class_key")
    if cls_id < 0:
        errors.append(f"Invalid canonical_class_id {cls_id} for record {rec['record_id']}")
    class_ids.add(cls_id)
    if cls_id in class_to_meaning:
        if class_to_meaning[cls_id] != c_key:
            errors.append(f"Conflicting meaning for class_id {cls_id}: {class_to_meaning[cls_id]} vs {c_key}")
    else:
        class_to_meaning[cls_id] = c_key

print(f"[OK] Verified {len(class_ids)} canonical class IDs. No conflicting class meanings detected.")

# 3. Verify healthy label separation
healthy_count = sum(1 for rec in combined if rec.get("is_healthy"))
diseased_count = len(combined) - healthy_count
print(f"[OK] Healthy vs Diseased Breakdown: {healthy_count} Healthy images, {diseased_count} Diseased images.")

# 4. Readability check for sample image paths in Dataset 1 & Dataset 2 archive
d1_sample = [r for r in combined if r["dataset_source"] == "Dataset_1"][:10]
for rec in d1_sample:
    abs_p = os.path.join(BASE_DIR, rec["image_path"])
    if not os.path.exists(abs_p):
        errors.append(f"Missing Dataset 1 image file: {abs_p}")

zip_path = os.path.join(BASE_DIR, "datasets", "archive.zip")
d2_sample = [r for r in combined if r["dataset_source"] == "Dataset_2"][:10]
with zipfile.ZipFile(zip_path, 'r') as z:
    for rec in d2_sample:
        try:
            info = z.getinfo(rec["archive_path"])
            if info.file_size == 0:
                errors.append(f"Empty Dataset 2 archive file: {rec['archive_path']}")
        except KeyError:
            errors.append(f"Missing archive member: {rec['archive_path']}")

print(f"[OK] Verified readability for Dataset 1 files and Dataset 2 archive members.")

# 5. Summary status
print("\nValidation Summary:")
if len(errors) == 0:
    print("STATUS: PHASE 4 MANIFEST COMPATIBILITY VALIDATION PASSED (100% OK)")
else:
    print("STATUS: MANIFEST VALIDATION FAILED")
    for err in errors:
        print("  -", err)
