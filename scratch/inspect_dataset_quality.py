import os
import zipfile
import hashlib
import json
import io
import time
from collections import Counter, defaultdict
from PIL import Image

BASE_DIR = r"E:\tekworks_projects\crop"
OUTPUT_DIR = os.path.join(BASE_DIR, "ml_models", "disease_detection", "unified_experiment")
os.makedirs(OUTPUT_DIR, exist_ok=True)

D1_DIR = os.path.join(BASE_DIR, "ml_models", "disease_detection", "dataset_prepared")
D2_ZIP = os.path.join(BASE_DIR, "datasets", "archive.zip")

print("=================================================================")
print("  AGROVISION AI - PHASE 3 QUALITY INSPECTION ENGINE              ")
print("=================================================================")
print(f"Dataset 1 Path: {D1_DIR}")
print(f"Dataset 2 Archive: {D2_ZIP}")
print(f"Output Directory: {OUTPUT_DIR}\n")

import numpy as np

def compute_ahash(pil_img, hash_size=8):
    try:
        img_gray = pil_img.convert("L").resize((hash_size, hash_size), Image.Resampling.BILINEAR)
        pixels = np.array(img_gray, dtype=np.float32).flatten()
        avg = pixels.mean()
        bits = "".join(["1" if p > avg else "0" for p in pixels])
        return hex(int(bits, 2))[2:].zfill(hash_size * hash_size // 4)
    except Exception:
        return ""

# -------------------------------------------------------------------------
# STEP 2 & 3 & 4: DATASET 1 QUALITY INSPECTION
# -------------------------------------------------------------------------
print("--- Inspecting Dataset 1 (Broad 39-Class Dataset) ---")
d1_manifest = []
d1_md5_map = defaultdict(list)
d1_ahash_map = defaultdict(list)
d1_class_counts = Counter()
d1_extensions = Counter()
d1_corrupt = []
d1_quality_flags = Counter()

start_time = time.time()
for root, _, files in os.walk(D1_DIR):
    for f in files:
        if f in ["manifest.json", "exclusion_log.json"]:
            continue
        rel_p = os.path.relpath(os.path.join(root, f), BASE_DIR)
        ext = os.path.splitext(f)[1].lower()
        d1_extensions[ext] += 1
        
        cls_folder = os.path.basename(root)
        d1_class_counts[cls_folder] += 1
        
        abs_p = os.path.join(root, f)
        size = os.path.getsize(abs_p)
        
        # Read file for MD5 hash
        with open(abs_p, "rb") as fp:
            content = fp.read()
        md5_h = hashlib.md5(content).hexdigest()
        
        # Quality check via PIL
        w, h = 0, 0
        mode = "UNKNOWN"
        q_flags = []
        ahash_str = ""
        
        try:
            pil_img = Image.open(io.BytesIO(content))
            w, h = pil_img.size
            mode = pil_img.mode
            
            if w < 64 or h < 64:
                q_flags.append("SMALL_DIMENSIONS")
            if mode not in ["RGB", "L"]:
                q_flags.append(f"UNUSUAL_COLOR_MODE_{mode}")
            
            ahash_str = compute_ahash(pil_img)
        except Exception as e:
            q_flags.append("CORRUPT_IMAGE")
            d1_corrupt.append(rel_p)
        
        for qf in q_flags:
            d1_quality_flags[qf] += 1
            
        d1_md5_map[md5_h].append(rel_p)
        if ahash_str:
            d1_ahash_map[ahash_str].append(rel_p)
            
        # Parse proposed crop and disease label
        parts = cls_folder.split('___')
        prop_crop = parts[0].replace('_', ' ').replace(',', '') if len(parts) > 1 else cls_folder
        prop_disease = parts[1].replace('_', ' ') if len(parts) > 1 else "Healthy"
        
        d1_manifest.append({
            "dataset_id": "Dataset_1",
            "relative_path": rel_p,
            "original_class": cls_folder,
            "proposed_crop": prop_crop,
            "proposed_disease": prop_disease,
            "file_size_bytes": size,
            "md5_hash": md5_h,
            "ahash": ahash_str,
            "dimensions": [w, h],
            "color_mode": mode,
            "quality_flags": q_flags,
            "review_status": "EXPLICIT_TAXONOMY_VERIFIED"
        })

print(f"Dataset 1 Inspected: {len(d1_manifest)} images across {len(d1_class_counts)} classes.")

# -------------------------------------------------------------------------
# STEP 2 & 3 & 4: DATASET 2 QUALITY INSPECTION (from archive.zip)
# -------------------------------------------------------------------------
print("\n--- Inspecting Dataset 2 (Andhra_Master_Dataset Archive) ---")
d2_manifest = []
d2_md5_map = defaultdict(list)
d2_ahash_map = defaultdict(list)
d2_class_counts = Counter()
d2_extensions = Counter()
d2_corrupt = []
d2_quality_flags = Counter()

with zipfile.ZipFile(D2_ZIP, 'r') as z:
    for member in z.namelist():
        ext = os.path.splitext(member)[1].lower()
        if not ext:
            continue
        d2_extensions[ext] += 1
        
        parts = member.split('/')
        if len(parts) < 3 or ext not in ['.jpg', '.jpeg', '.png', '.webp']:
            continue
            
        cls_folder = parts[1]
        d2_class_counts[cls_folder] += 1
        
        info = z.getinfo(member)
        size = info.file_size
        
        content = z.read(member)
        md5_h = hashlib.md5(content).hexdigest()
        
        w, h = 0, 0
        mode = "UNKNOWN"
        q_flags = []
        ahash_str = ""
        
        try:
            pil_img = Image.open(io.BytesIO(content))
            w, h = pil_img.size
            mode = pil_img.mode
            
            if w < 64 or h < 64:
                q_flags.append("SMALL_DIMENSIONS")
            if mode not in ["RGB", "L"]:
                q_flags.append(f"UNUSUAL_COLOR_MODE_{mode}")
            
            ahash_str = compute_ahash(pil_img)
        except Exception as e:
            q_flags.append("CORRUPT_IMAGE")
            d2_corrupt.append(member)
            
        for qf in q_flags:
            d2_quality_flags[qf] += 1
            
        d2_md5_map[md5_h].append(member)
        if ahash_str:
            d2_ahash_map[ahash_str].append(member)
            
        # Parse proposed crop and disease label from 'Crop_Disease'
        if '_' in cls_folder:
            c_part, d_part = cls_folder.split('_', 1)
        else:
            c_part, d_part = cls_folder, "Unknown"
            
        d2_manifest.append({
            "dataset_id": "Dataset_2",
            "archive_path": member,
            "original_class": cls_folder,
            "proposed_crop": c_part,
            "proposed_disease": d_part,
            "file_size_bytes": size,
            "md5_hash": md5_h,
            "ahash": ahash_str,
            "dimensions": [w, h],
            "color_mode": mode,
            "quality_flags": q_flags,
            "review_status": "REGIONAL_ANDHRA_SERIES_VERIFIED"
        })

print(f"Dataset 2 Inspected: {len(d2_manifest)} images across {len(d2_class_counts)} classes.")

# -------------------------------------------------------------------------
# STEP 5 & 6: DUPLICATE DETECTION (Intra-dataset & Inter-dataset)
# -------------------------------------------------------------------------
print("\n--- Running Exact (MD5) and Near-Duplicate (aHash) Analysis ---")

# Exact MD5 duplicates within Dataset 1
d1_exact_dups = {k: v for k, v in d1_md5_map.items() if len(v) > 1}
# Exact MD5 duplicates within Dataset 2
d2_exact_dups = {k: v for k, v in d2_md5_map.items() if len(v) > 1}

# Cross-dataset exact duplicates (Dataset 1 <-> Dataset 2)
cross_exact_dups = []
for md5_h, d1_paths in d1_md5_map.items():
    if md5_h in d2_md5_map:
        cross_exact_dups.append({
            "md5": md5_h,
            "dataset_1_paths": d1_paths,
            "dataset_2_paths": d2_md5_map[md5_h]
        })

# Cross-dataset near-duplicates (aHash match)
cross_near_dups = []
for ah_h, d1_paths in d1_ahash_map.items():
    if ah_h in d2_ahash_map:
        cross_near_dups.append({
            "ahash": ah_h,
            "dataset_1_count": len(d1_paths),
            "dataset_2_count": len(d2_ahash_map[ah_h]),
            "dataset_1_sample": d1_paths[0],
            "dataset_2_sample": d2_ahash_map[ah_h][0]
        })

print(f"Dataset 1 Intra-MD5 Duplicates: {len(d1_exact_dups)} groups")
print(f"Dataset 2 Intra-MD5 Duplicates: {len(d2_exact_dups)} groups")
print(f"Cross-Dataset (D1 <-> D2) Exact MD5 Duplicates: {len(cross_exact_dups)} groups")
print(f"Cross-Dataset Near-Duplicate (aHash) Candidate Clusters: {len(cross_near_dups)} groups")

# -------------------------------------------------------------------------
# SAVE DERIVED QUALITY MANIFESTS AND REPORT JSONS
# -------------------------------------------------------------------------
d1_manifest_file = os.path.join(OUTPUT_DIR, "dataset_1_quality_manifest.json")
with open(d1_manifest_file, "w") as f:
    json.dump(d1_manifest, f, indent=2)

d2_manifest_file = os.path.join(OUTPUT_DIR, "dataset_2_quality_manifest.json")
with open(d2_manifest_file, "w") as f:
    json.dump(d2_manifest, f, indent=2)

duplicate_report_file = os.path.join(OUTPUT_DIR, "duplicate_analysis_report.json")
dup_report_data = {
    "d1_exact_duplicates_count": len(d1_exact_dups),
    "d2_exact_duplicates_count": len(d2_exact_dups),
    "cross_dataset_exact_duplicates_count": len(cross_exact_dups),
    "cross_dataset_near_duplicates_count": len(cross_near_dups),
    "cross_exact_duplicates": cross_exact_dups[:100], # Top 100 sample
    "cross_near_duplicates_sample": cross_near_dups[:100]
}
with open(duplicate_report_file, "w") as f:
    json.dump(dup_report_data, f, indent=2)

summary_stats = {
    "dataset_1": {
        "total_images": len(d1_manifest),
        "total_classes": len(d1_class_counts),
        "extensions": dict(d1_extensions),
        "quality_flags": dict(d1_quality_flags),
        "corrupt_images": d1_corrupt,
        "class_distribution": dict(d1_class_counts)
    },
    "dataset_2": {
        "total_images": len(d2_manifest),
        "total_classes": len(d2_class_counts),
        "extensions": dict(d2_extensions),
        "quality_flags": dict(d2_quality_flags),
        "corrupt_images": d2_corrupt,
        "class_distribution": dict(d2_class_counts)
    },
    "duplicate_summary": {
        "d1_exact_dups": len(d1_exact_dups),
        "d2_exact_dups": len(d2_exact_dups),
        "cross_exact_dups": len(cross_exact_dups),
        "cross_near_dups": len(cross_near_dups)
    },
    "duration_seconds": round(time.time() - start_time, 2)
}

summary_stats_file = os.path.join(OUTPUT_DIR, "quality_inspection_summary.json")
with open(summary_stats_file, "w") as f:
    json.dump(summary_stats, f, indent=2)

print("\n[OK] Derived quality manifests and reports saved successfully to:")
print(f"  - {d1_manifest_file}")
print(f"  - {d2_manifest_file}")
print(f"  - {duplicate_report_file}")
print(f"  - {summary_stats_file}")
