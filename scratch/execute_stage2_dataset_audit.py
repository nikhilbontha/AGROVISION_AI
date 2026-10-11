import os
import sys
import json
import hashlib
from PIL import Image

print("=== STAGE 2: DATASET AUDIT & MANIFEST GENERATION ===")

ds1_path = r"e:\tekworks_projects\crop\ml_models\disease_detection\dataset_prepared"
ds2_path = r"e:\tekworks_projects\crop\datasets\regional_dataset_2\Andhra_Master_Dataset"
out_dir = r"e:\tekworks_projects\crop\reports\dataset_manifests"
os.makedirs(out_dir, exist_ok=True)

def audit_directory(base_dir, dataset_name):
    records = []
    class_counts = {}
    corrupt_count = 0
    hashes = set()
    duplicate_count = 0

    if not os.path.exists(base_dir):
        print(f"Warning: {dataset_name} path {base_dir} does not exist.")
        return records, class_counts, corrupt_count, duplicate_count

    for root, dirs, files in os.walk(base_dir):
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in ['.jpg', '.jpeg', '.png', '.webp']:
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, base_dir)
                parts = rel_path.split(os.sep)
                class_label = parts[0] if len(parts) > 1 else "Uncategorized"

                # Check image readability
                is_valid = True
                width, height = 0, 0
                try:
                    with Image.open(full_path) as img:
                        img.verify()
                    with Image.open(full_path) as img:
                        width, height = img.size
                except Exception as e:
                    is_valid = False
                    corrupt_count += 1

                # Calculate quick file md5 hash for duplicate detection
                file_hash = None
                if is_valid:
                    try:
                        with open(full_path, 'rb') as fp:
                            file_hash = hashlib.md5(fp.read()).hexdigest()
                        if file_hash in hashes:
                            duplicate_count += 1
                        else:
                            hashes.add(file_hash)
                    except Exception:
                        pass

                class_counts[class_label] = class_counts.get(class_label, 0) + 1
                records.append({
                    "dataset": dataset_name,
                    "rel_path": rel_path,
                    "class_label": class_label,
                    "width": width,
                    "height": height,
                    "is_valid": is_valid,
                    "file_hash": file_hash
                })

    return records, class_counts, corrupt_count, duplicate_count

print("Scanning Dataset 1 (Broad Crop Coverage)...")
ds1_records, ds1_counts, ds1_corrupt, ds1_dups = audit_directory(ds1_path, "Dataset_1_Broad")
print(f"Dataset 1: {len(ds1_records)} images across {len(ds1_counts)} classes ({ds1_corrupt} corrupt, {ds1_dups} duplicate hashes)")

print("Scanning Dataset 2 (Andhra Regional Master)...")
ds2_records, ds2_counts, ds2_corrupt, ds2_dups = audit_directory(ds2_path, "Dataset_2_Regional")
print(f"Dataset 2: {len(ds2_records)} images across {len(ds2_counts)} classes ({ds2_corrupt} corrupt, {ds2_dups} duplicate hashes)")

summary = {
    "dataset_1": {
        "path": ds1_path,
        "total_images": len(ds1_records),
        "total_classes": len(ds1_counts),
        "corrupt_images": ds1_corrupt,
        "duplicate_hashes": ds1_dups,
        "class_distribution": ds1_counts
    },
    "dataset_2": {
        "path": ds2_path,
        "total_images": len(ds2_records),
        "total_classes": len(ds2_counts),
        "corrupt_images": ds2_corrupt,
        "duplicate_hashes": ds2_dups,
        "class_distribution": ds2_counts
    },
    "combined_total_images": len(ds1_records) + len(ds2_records)
}

out_summary_path = os.path.join(out_dir, "dataset_audit_summary.json")
with open(out_summary_path, "w", encoding='utf-8') as f:
    json.dump(summary, f, indent=2)

print(f"Saved dataset audit summary to {out_summary_path}")
