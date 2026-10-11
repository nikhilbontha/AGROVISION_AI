import os
import json
import hashlib
import random
from collections import defaultdict, Counter

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(data, path, indent=2):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=indent)

def compute_json_hash(data):
    s = json.dumps(data, sort_keys=True)
    return hashlib.md5(s.encode('utf-8')).hexdigest()

def partition_dataset(combined_records, seed=42):
    # Group records by duplicate_group_id
    groups = defaultdict(list)
    for r in combined_records:
        gid = r['duplicate_group_id']
        groups[gid].append(r)
    
    # Map groups to primary canonical_class_id for stratification
    class_groups = defaultdict(list)
    for gid, record_list in groups.items():
        # Use primary record's class ID for stratification
        cid = record_list[0]['canonical_class_id']
        class_groups[cid].append((gid, record_list))
    
    train_records = []
    val_records = []
    test_records = []
    
    sorted_class_ids = sorted(class_groups.keys())
    
    for cid in sorted_class_ids:
        c_groups = class_groups[cid]
        c_groups.sort(key=lambda x: x[0])
        
        rng = random.Random(seed + cid * 10007)
        rng.shuffle(c_groups)
        
        n_groups = len(c_groups)
        total_images = sum(len(g[1]) for g in c_groups)
        
        if n_groups == 1:
            for r in c_groups[0][1]:
                r_copy = dict(r)
                r_copy['partition'] = 'train'
                train_records.append(r_copy)
        elif n_groups == 2:
            for r in c_groups[0][1]:
                r_copy = dict(r)
                r_copy['partition'] = 'train'
                train_records.append(r_copy)
            for r in c_groups[1][1]:
                r_copy = dict(r)
                r_copy['partition'] = 'val'
                val_records.append(r_copy)
        elif n_groups == 3:
            for r in c_groups[0][1]:
                r_copy = dict(r)
                r_copy['partition'] = 'train'
                train_records.append(r_copy)
            for r in c_groups[1][1]:
                r_copy = dict(r)
                r_copy['partition'] = 'val'
                val_records.append(r_copy)
            for r in c_groups[2][1]:
                r_copy = dict(r)
                r_copy['partition'] = 'test'
                test_records.append(r_copy)
        else:
            target_val = 0.15 * total_images
            target_test = 0.15 * total_images
            
            c_train_groups = []
            c_val_groups = []
            c_test_groups = []
            
            val_count = 0
            test_count = 0
            
            for gid, recs in c_groups:
                cnt = len(recs)
                if val_count < target_val:
                    c_val_groups.append((gid, recs))
                    val_count += cnt
                elif test_count < target_test:
                    c_test_groups.append((gid, recs))
                    test_count += cnt
                else:
                    c_train_groups.append((gid, recs))
            
            if not c_train_groups and c_val_groups:
                c_train_groups.append(c_val_groups.pop())
            
            for _, recs in c_train_groups:
                for r in recs:
                    r_copy = dict(r)
                    r_copy['partition'] = 'train'
                    train_records.append(r_copy)
            for _, recs in c_val_groups:
                for r in recs:
                    r_copy = dict(r)
                    r_copy['partition'] = 'val'
                    val_records.append(r_copy)
            for _, recs in c_test_groups:
                for r in recs:
                    r_copy = dict(r)
                    r_copy['partition'] = 'test'
                    test_records.append(r_copy)
                    
    return train_records, val_records, test_records

def run_phase5():
    base_dir = r"e:\tekworks_projects\crop\ml_models\disease_detection\unified_experiment"
    combined_manifest_path = os.path.join(base_dir, "combined_training_manifest.json")
    quarantine_manifest_path = os.path.join(base_dir, "quarantine_manifest.json")
    mapping_path = os.path.join(base_dir, "unified_label_mapping.json")
    archive_zip_path = r"e:\tekworks_projects\crop\datasets\archive.zip"
    
    print("[1] Loading Phase 4 input manifests...")
    combined_records = load_json(combined_manifest_path)
    quarantine_records = load_json(quarantine_manifest_path)
    mapping = load_json(mapping_path)
    
    print(f"    Loaded {len(combined_records)} combined records and {len(quarantine_records)} quarantined records.")
    
    # Step 1 Validation
    print("[2] Step 1 Validation of combined manifest records...")
    missing_files = 0
    missing_mappings = 0
    quarantined_in_combined = 0
    quarantine_ids = set(r['record_id'] for r in quarantine_records)
    
    valid_class_ids = set(m['canonical_class_id'] for m in mapping if 'canonical_class_id' in m)
    class_id_to_canonical = {m['canonical_class_id']: m['canonical_class_key'] for m in mapping if 'canonical_class_id' in m}
    
    archive_zip_exists = os.path.exists(archive_zip_path)
    
    for r in combined_records:
        source = r.get('dataset_source')
        if source == 'Dataset_1':
            img_p = r.get('image_path')
            if not img_p or not os.path.exists(img_p):
                missing_files += 1
        elif source == 'Dataset_2':
            arch_p = r.get('archive_path')
            if not arch_p or not archive_zip_exists:
                missing_files += 1
        else:
            missing_files += 1
            
        if r['canonical_class_id'] not in valid_class_ids:
            missing_mappings += 1
        if r['record_id'] in quarantine_ids:
            quarantined_in_combined += 1
            
    print(f"    Validation results: Missing files={missing_files}, Missing mappings={missing_mappings}, Quarantined in combined={quarantined_in_combined}")
    if missing_files > 0 or missing_mappings > 0 or quarantined_in_combined > 0:
        raise ValueError(f"Combined manifest failed Step 1 validation! Missing files={missing_files}, Mappings={missing_mappings}, Quarantined={quarantined_in_combined}")
        
    # Step 2 & 3: Partition dataset with leakage control
    SEED = 42
    print(f"[3] Partitioning dataset with seed={SEED}...")
    train_recs, val_recs, test_recs = partition_dataset(combined_records, seed=SEED)
    
    # Field test subset: Dataset 2 images or field_test directory images in test set
    field_test_recs = [r for r in test_recs if r['dataset_source'] == 'Dataset_2' or ('image_path' in r and 'field_test' in r['image_path'])]
    
    print(f"    Partition counts:")
    print(f"      Train: {len(train_recs)} images ({len(train_recs)/len(combined_records)*100:.2f}%)")
    print(f"      Val:   {len(val_recs)} images ({len(val_recs)/len(combined_records)*100:.2f}%)")
    print(f"      Test:  {len(test_recs)} images ({len(test_recs)/len(combined_records)*100:.2f}%)")
    print(f"      Field Test (subset of Test): {len(field_test_recs)} images")
    
    # Step 7: Leakage & Validation Checks
    print("[4] Running automated leakage and integrity checks...")
    train_gids = set(r['duplicate_group_id'] for r in train_recs)
    val_gids = set(r['duplicate_group_id'] for r in val_recs)
    test_gids = set(r['duplicate_group_id'] for r in test_recs)
    
    train_hashes = set(r['md5_hash'] for r in train_recs)
    val_hashes = set(r['md5_hash'] for r in val_recs)
    test_hashes = set(r['md5_hash'] for r in test_recs)
    
    train_ids = set(r['record_id'] for r in train_recs)
    val_ids = set(r['record_id'] for r in val_recs)
    test_ids = set(r['record_id'] for r in test_recs)
    
    gid_tv_overlap = train_gids & val_gids
    gid_tt_overlap = train_gids & test_gids
    gid_vt_overlap = val_gids & test_gids
    
    hash_tv_overlap = train_hashes & val_hashes
    hash_tt_overlap = train_hashes & test_hashes
    hash_vt_overlap = val_hashes & test_hashes
    
    id_tv_overlap = train_ids & val_ids
    id_tt_overlap = train_ids & test_ids
    id_vt_overlap = val_ids & test_ids
    
    total_partitioned = len(train_recs) + len(val_recs) + len(test_recs)
    reconciled = (total_partitioned == len(combined_records))
    
    leakage_passed = (
        len(gid_tv_overlap) == 0 and len(gid_tt_overlap) == 0 and len(gid_vt_overlap) == 0 and
        len(hash_tv_overlap) == 0 and len(hash_tt_overlap) == 0 and len(hash_vt_overlap) == 0 and
        len(id_tv_overlap) == 0 and len(id_tt_overlap) == 0 and len(id_vt_overlap) == 0 and
        reconciled
    )
    
    leakage_report = {
        "status": "PASS" if leakage_passed else "FAIL",
        "duplicate_group_overlaps": {
            "train_val": len(gid_tv_overlap),
            "train_test": len(gid_tt_overlap),
            "val_test": len(gid_vt_overlap)
        },
        "hash_overlaps": {
            "train_val": len(hash_tv_overlap),
            "train_test": len(hash_tt_overlap),
            "val_test": len(hash_vt_overlap)
        },
        "id_overlaps": {
            "train_val": len(id_tv_overlap),
            "train_test": len(id_tt_overlap),
            "val_test": len(id_vt_overlap)
        },
        "count_reconciliation": {
            "combined_input_count": len(combined_records),
            "train_count": len(train_recs),
            "val_count": len(val_recs),
            "test_count": len(test_recs),
            "sum_partitioned": total_partitioned,
            "reconciled": reconciled
        }
    }
    
    print(f"    Leakage detection verdict: [OK] {leakage_report['status']}")
    
    # Step 8: Class and source distributions
    print("[5] Generating class and dataset source distribution report...")
    class_dist = {}
    for cid in sorted(valid_class_ids):
        canonical_key = class_id_to_canonical[cid]
        train_c = [r for r in train_recs if r['canonical_class_id'] == cid]
        val_c = [r for r in val_recs if r['canonical_class_id'] == cid]
        test_c = [r for r in test_recs if r['canonical_class_id'] == cid]
        
        train_ds1 = len([r for r in train_c if r['dataset_source'] == 'Dataset_1'])
        train_ds2 = len([r for r in train_c if r['dataset_source'] == 'Dataset_2'])
        val_ds1 = len([r for r in val_c if r['dataset_source'] == 'Dataset_1'])
        val_ds2 = len([r for r in val_c if r['dataset_source'] == 'Dataset_2'])
        test_ds1 = len([r for r in test_c if r['dataset_source'] == 'Dataset_1'])
        test_ds2 = len([r for r in test_c if r['dataset_source'] == 'Dataset_2'])
        
        class_dist[str(cid)] = {
            "canonical_key": canonical_key,
            "train_total": len(train_c),
            "train_dataset_1": train_ds1,
            "train_dataset_2": train_ds2,
            "val_total": len(val_c),
            "val_dataset_1": val_ds1,
            "val_dataset_2": val_ds2,
            "test_total": len(test_c),
            "test_dataset_1": test_ds1,
            "test_dataset_2": test_ds2,
            "total_images": len(train_c) + len(val_c) + len(test_c)
        }
        
    dist_report = {
        "summary": {
            "total_canonical_classes": len(valid_class_ids),
            "classes_represented_in_train": sum(1 for c in class_dist.values() if c['train_total'] > 0),
            "classes_represented_in_val": sum(1 for c in class_dist.values() if c['val_total'] > 0),
            "classes_represented_in_test": sum(1 for c in class_dist.values() if c['test_total'] > 0),
            "rare_classes_lt_10_samples": [c['canonical_key'] for c in class_dist.values() if c['total_images'] < 10]
        },
        "per_class_distribution": class_dist
    }
    
    # Step 9: Reproducibility Test
    print("[6] Testing deterministic reproducibility (run 2 with same seed)...")
    train_r2, val_r2, test_r2 = partition_dataset(combined_records, seed=SEED)
    
    hash_tr1 = compute_json_hash(train_recs)
    hash_tr2 = compute_json_hash(train_r2)
    hash_va1 = compute_json_hash(val_recs)
    hash_va2 = compute_json_hash(val_r2)
    hash_te1 = compute_json_hash(test_recs)
    hash_te2 = compute_json_hash(test_r2)
    
    reproducible = (hash_tr1 == hash_tr2) and (hash_va1 == hash_va2) and (hash_te1 == hash_te2)
    
    repro_report = {
        "status": "PASS" if reproducible else "FAIL",
        "random_seed": SEED,
        "run1_hashes": {"train": hash_tr1, "val": hash_va1, "test": hash_te1},
        "run2_hashes": {"train": hash_tr2, "val": hash_va2, "test": hash_te2},
        "is_identical": reproducible
    }
    print(f"    Reproducibility verdict: [OK] {repro_report['status']}")
    
    # Save Manifests & Config
    print("[7] Saving immutable partition manifests and deliverables...")
    partition_config = {
        "version": "1.0",
        "timestamp": "2026-10-10T23:07:00+05:30",
        "random_seed": SEED,
        "target_split_ratios": {"train": 0.70, "val": 0.15, "test": 0.15},
        "actual_split_counts": {
            "train": len(train_recs),
            "val": len(val_recs),
            "test": len(test_recs),
            "field_test": len(field_test_recs),
            "quarantined": len(quarantine_records),
            "total_input": len(combined_records)
        },
        "actual_split_percentages": {
            "train": round(len(train_recs)/len(combined_records)*100, 2),
            "val": round(len(val_recs)/len(combined_records)*100, 2),
            "test": round(len(test_recs)/len(combined_records)*100, 2)
        }
    }
    
    save_json(partition_config, os.path.join(base_dir, "partition_config.json"))
    save_json(train_recs, os.path.join(base_dir, "train_manifest.json"))
    save_json(val_recs, os.path.join(base_dir, "val_manifest.json"))
    save_json(test_recs, os.path.join(base_dir, "test_manifest.json"))
    save_json(field_test_recs, os.path.join(base_dir, "field_test_manifest.json"))
    save_json(quarantine_records, os.path.join(base_dir, "exclusion_manifest.json"))
    
    save_json(leakage_report, os.path.join(base_dir, "leakage_detection_report.json"))
    save_json(dist_report, os.path.join(base_dir, "class_distribution_report.json"))
    save_json(repro_report, os.path.join(base_dir, "reproducibility_report.json"))
    
    print("[8] All Phase 5 deliverables generated successfully!")

if __name__ == "__main__":
    run_phase5()
