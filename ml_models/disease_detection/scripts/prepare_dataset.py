"""
AgroVision AI Phase 2 Fast & Reproducible Dataset Preparation Engine.
Performs deterministic label standardization, duplicate detection, and leak-free stratified splitting.
"""

import os
import sys
import json
import hashlib
import numpy as np
from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PREPARED_DIR = os.path.join(BASE_DIR, "dataset_prepared")
TAXONOMY_PATH = os.path.join(BASE_DIR, "crop_taxonomy.json")
CLASS_INDICES_PATH = os.path.join(BASE_DIR, "class_indices.json")
MANIFEST_PATH = os.path.join(DATASET_PREPARED_DIR, "manifest.json")
EXCLUSION_LOG_PATH = os.path.join(DATASET_PREPARED_DIR, "exclusion_log.json")

SOURCE_DATASET_DIR = r"C:\Users\nikhi\tensorflow_datasets\downloads\extracted\ZIP.data.mend.com_publ-file_data_tywb_file_d565-c1rDQyRTmE0CqGGXmH53WlQp0NWefMfDW89aj1A0m5D_A\Plant_leave_diseases_dataset_without_augmentation"

SEED = 42

def compute_fast_hash(filepath):
    """Computes fast MD5 checksum based on file size and head/tail bytes."""
    sz = os.path.getsize(filepath)
    hasher = hashlib.md5()
    hasher.update(str(sz).encode('utf-8'))
    with open(filepath, 'rb') as f:
        head = f.read(4096)
        hasher.update(head)
        if sz > 8192:
            f.seek(sz - 4096)
            tail = f.read(4096)
            hasher.update(tail)
    return hasher.hexdigest(), sz

def prepare_dataset(seed=SEED):
    print("==========================================================")
    print("   AGROVISION AI - PHASE 2 DATASET PREPARATION ENGINE     ")
    print("==========================================================")

    np.random.seed(seed)

    if not os.path.exists(TAXONOMY_PATH):
        print(f"Error: Taxonomy file missing at {TAXONOMY_PATH}")
        return False

    with open(TAXONOMY_PATH, 'r') as f:
        taxonomy = json.load(f)

    # Class mapping dictionary
    class_indices = {item['class_name']: item['class_id'] for item in taxonomy['classes']}
    with open(CLASS_INDICES_PATH, 'w') as f:
        json.dump(class_indices, f, indent=4)
    print(f"Saved class_indices.json ({len(class_indices)} classes)")

    exclusions = []
    seen_hashes = set()
    valid_images_per_class = {cls_name: [] for cls_name in class_indices.keys()}

    print(f"Scanning dataset directories...")
    
    # 1. Scan primary dataset directories in dataset_prepared (train, val, test, field_test)
    for partition_name in ['train', 'val', 'test', 'field_test']:
        p_dir = os.path.join(DATASET_PREPARED_DIR, partition_name)
        if not os.path.exists(p_dir):
            continue

        for cls_name in os.listdir(p_dir):
            if cls_name not in class_indices:
                continue
            cls_path = os.path.join(p_dir, cls_name)
            if not os.path.isdir(cls_path):
                continue

            for fname in sorted(os.listdir(cls_path)):
                fpath = os.path.join(cls_path, fname)
                if not fname.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    exclusions.append({'file': fpath, 'reason': 'Unsupported format extension'})
                    continue

                try:
                    fhash, fsz = compute_fast_hash(fpath)
                    if fsz < 500:
                        exclusions.append({'file': fpath, 'reason': 'File size too small (<500 bytes)'})
                        continue
                    if fhash in seen_hashes:
                        exclusions.append({'file': fpath, 'reason': 'Duplicate file hash collision'})
                        continue

                    seen_hashes.add(fhash)
                    valid_images_per_class[cls_name].append((fpath, fhash, (224, 224)))
                except Exception as e:
                    exclusions.append({'file': fpath, 'reason': f'Corrupt or unreadable file: {e}'})

    # 2. Fill missing samples from full source dataset if available
    if os.path.exists(SOURCE_DATASET_DIR):
        for cls_folder in os.listdir(SOURCE_DATASET_DIR):
            if cls_folder not in class_indices:
                continue
            if len(valid_images_per_class[cls_folder]) >= 70:
                continue

            cls_path = os.path.join(SOURCE_DATASET_DIR, cls_folder)
            for fname in sorted(os.listdir(cls_path)):
                fpath = os.path.join(cls_path, fname)
                if not fname.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    continue
                try:
                    fhash, fsz = compute_fast_hash(fpath)
                    if fhash not in seen_hashes:
                        seen_hashes.add(fhash)
                        valid_images_per_class[cls_folder].append((fpath, fhash, (224, 224)))
                        if len(valid_images_per_class[cls_folder]) >= 70:
                            break
                except Exception:
                    continue

    # Partition Splitting (Deterministic Shuffle with Fixed Seed)
    manifest = {
        'train': [],
        'val': [],
        'test': [],
        'field_test': []
    }

    for cls_name, items in sorted(valid_images_per_class.items()):
        items_sorted = sorted(items, key=lambda x: x[1]) # Sort deterministically by hash
        rng = np.random.RandomState(seed)
        rng.shuffle(items_sorted)

        n_total = len(items_sorted)
        if n_total >= 70:
            n_train = 40
            n_val = 10
            n_test = 10
            n_field = 10
        elif n_total >= 40:
            n_train = int(n_total * 0.6)
            n_val = int(n_total * 0.15)
            n_test = int(n_total * 0.15)
            n_field = n_total - (n_train + n_val + n_test)
        else:
            n_train = n_total
            n_val = 0
            n_test = 0
            n_field = 0

        train_set = items_sorted[:n_train]
        val_set = items_sorted[n_train:n_train+n_val]
        test_set = items_sorted[n_train+n_val:n_train+n_val+n_test]
        field_set = items_sorted[n_train+n_val+n_test:n_train+n_val+n_test+n_field]

        for item in train_set:
            manifest['train'].append({'file': item[0], 'class': cls_name, 'class_id': class_indices[cls_name], 'size': item[2]})
        for item in val_set:
            manifest['val'].append({'file': item[0], 'class': cls_name, 'class_id': class_indices[cls_name], 'size': item[2]})
        for item in test_set:
            manifest['test'].append({'file': item[0], 'class': cls_name, 'class_id': class_indices[cls_name], 'size': item[2]})
        for item in field_set:
            manifest['field_test'].append({'file': item[0], 'class': cls_name, 'class_id': class_indices[cls_name], 'size': item[2]})

    os.makedirs(DATASET_PREPARED_DIR, exist_ok=True)
    with open(MANIFEST_PATH, 'w') as f:
        json.dump(manifest, f, indent=4)

    with open(EXCLUSION_LOG_PATH, 'w') as f:
        json.dump({'total_excluded': len(exclusions), 'exclusions': exclusions}, f, indent=4)

    print("\n--- DATASET PREPARATION SUMMARY ---")
    print(f"Total Valid Images Scanned: {sum(len(v) for v in valid_images_per_class.values())}")
    print(f"Total Exclusions / Quarantined: {len(exclusions)}")
    print(f"Train Partition Images: {len(manifest['train'])}")
    print(f"Val Partition Images: {len(manifest['val'])}")
    print(f"Test Partition Images: {len(manifest['test'])}")
    print(f"Field Test Partition Images: {len(manifest['field_test'])}")
    print(f"Saved manifest to {MANIFEST_PATH}")
    print(f"Saved exclusion log to {EXCLUSION_LOG_PATH}")

    return True

if __name__ == "__main__":
    prepare_dataset()
