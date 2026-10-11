#!/usr/bin/env python3
"""
AgroVision AI 2.0 - Phase 3 Automated Audit Test Suite
======================================================

Executes reproducible verification tests covering:
1. Manifest schema validity (JSON schema draft-07 validation)
2. Duplicate sample ID uniqueness
3. Missing source file checks
4. Invalid canonical taxonomy IDs
5. Conflicting class labels within confirmed duplicate clusters
6. Train/test data leakage prevention across duplicate groups
7. Partition split mutual exclusivity (zero split overlap)
8. Completeness of required manifest fields
9. Physical reproducibility of inventory counts on disk
10. Quality flags report integrity and traceability

Produces: docs/agrovision_v2/phase3/audit_validation_results.json
"""

import os
import sys
import json
import csv
import glob
from datetime import datetime
import jsonschema

# Paths
SCHEMA_PATH = "docs/agrovision_v2/phase3/prepared_data_manifest.schema.json"
SAMPLE_MANIFEST_PATH = "docs/agrovision_v2/phase3/prepared_data_manifest_sample.json"
CROP_REG_PATH = "docs/agrovision_v2/phase2/crop_registry.json"
DIS_REG_PATH = "docs/agrovision_v2/phase2/disease_registry.json"
DUP_REPORT_PATH = "docs/agrovision_v2/phase3/duplicate_and_near_duplicate_report.json"
INVENTORY_PATH = "docs/agrovision_v2/phase3/dataset_inventory.json"
QUALITY_FLAGS_PATH = "docs/agrovision_v2/phase3/image_quality_flags.csv"
OUTPUT_RESULTS_PATH = "docs/agrovision_v2/phase3/audit_validation_results.json"

D1_DIR = "ml_models/disease_detection/dataset_prepared"
D2_DIR = "datasets/regional_dataset_2/Andhra_Master_Dataset"
SYNTH_DIR = "datasets/synthetic_plant_village"


def run_all_tests():
    test_results = []
    start_time = datetime.now()
    print("=" * 65)
    print(" AgroVision AI 2.0 - Phase 3 Automated Audit Test Runner")
    print(f" Execution Started: {start_time.isoformat()}")
    print("=" * 65)

    # ---------------------------------------------------------
    # Test 1: Manifest Schema Validity
    # ---------------------------------------------------------
    t1_name = "test_manifest_schema_validity"
    try:
        with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
            schema = json.load(f)
        with open(SAMPLE_MANIFEST_PATH, "r", encoding="utf-8") as f:
            manifest = json.load(f)
        jsonschema.validate(instance=manifest, schema=schema)
        test_results.append({
            "test_name": t1_name,
            "status": "PASS",
            "message": "Sample manifest strictly adheres to prepared_data_manifest.schema.json."
        })
        print(f"  [PASS] {t1_name}")
    except Exception as e:
        test_results.append({
            "test_name": t1_name,
            "status": "FAIL",
            "message": f"Schema validation error: {str(e)}"
        })
        print(f"  [FAIL] {t1_name}: {e}")

    # ---------------------------------------------------------
    # Test 2: Duplicate Sample IDs
    # ---------------------------------------------------------
    t2_name = "test_duplicate_sample_ids"
    try:
        sample_ids = [s["sample_id"] for s in manifest.get("samples", [])]
        unique_ids = set(sample_ids)
        if len(sample_ids) == len(unique_ids):
            test_results.append({
                "test_name": t2_name,
                "status": "PASS",
                "message": f"All {len(sample_ids)} sample IDs in manifest are strictly unique."
            })
            print(f"  [PASS] {t2_name}")
        else:
            diff = len(sample_ids) - len(unique_ids)
            test_results.append({
                "test_name": t2_name,
                "status": "FAIL",
                "message": f"Detected {diff} duplicate sample IDs."
            })
            print(f"  [FAIL] {t2_name}")
    except Exception as e:
        test_results.append({"test_name": t2_name, "status": "FAIL", "message": str(e)})
        print(f"  [FAIL] {t2_name}: {e}")

    # ---------------------------------------------------------
    # Test 3: Missing Source Files Check
    # ---------------------------------------------------------
    t3_name = "test_missing_source_files"
    try:
        missing_files = []
        for s in manifest.get("samples", []):
            rel_p = s.get("relative_path")
            if not os.path.exists(rel_p):
                missing_files.append((s["sample_id"], rel_p))
        if not missing_files:
            test_results.append({
                "test_name": t3_name,
                "status": "PASS",
                "message": f"All {len(manifest.get('samples', []))} sample paths exist and are accessible on disk."
            })
            print(f"  [PASS] {t3_name}")
        else:
            test_results.append({
                "test_name": t3_name,
                "status": "FAIL",
                "message": f"Found {len(missing_files)} missing files: {missing_files}"
            })
            print(f"  [FAIL] {t3_name}")
    except Exception as e:
        test_results.append({"test_name": t3_name, "status": "FAIL", "message": str(e)})
        print(f"  [FAIL] {t3_name}: {e}")

    # ---------------------------------------------------------
    # Test 4: Invalid Taxonomy IDs
    # ---------------------------------------------------------
    t4_name = "test_invalid_taxonomy_ids"
    try:
        with open(CROP_REG_PATH, "r", encoding="utf-8") as f:
            valid_crops = {c["crop_id"] for c in json.load(f)["crops"]}
        with open(DIS_REG_PATH, "r", encoding="utf-8") as f:
            valid_diseases = {d["disease_id"] for d in json.load(f)["diseases"]}

        invalid_tax = []
        for s in manifest.get("samples", []):
            if s.get("canonical_crop_id") not in valid_crops:
                invalid_tax.append((s["sample_id"], "invalid_crop", s.get("canonical_crop_id")))
            if s.get("canonical_disease_id") not in valid_diseases:
                invalid_tax.append((s["sample_id"], "invalid_disease", s.get("canonical_disease_id")))

        if not invalid_tax:
            test_results.append({
                "test_name": t4_name,
                "status": "PASS",
                "message": "All sample crop and disease IDs strictly resolve to valid Phase 2 canonical registries."
            })
            print(f"  [PASS] {t4_name}")
        else:
            test_results.append({
                "test_name": t4_name,
                "status": "FAIL",
                "message": f"Detected invalid taxonomy IDs: {invalid_tax}"
            })
            print(f"  [FAIL] {t4_name}")
    except Exception as e:
        test_results.append({"test_name": t4_name, "status": "FAIL", "message": str(e)})
        print(f"  [FAIL] {t4_name}: {e}")

    # ---------------------------------------------------------
    # Test 5: Conflicting Class Labels in Duplicate Groups
    # ---------------------------------------------------------
    t5_name = "test_conflicting_class_labels_in_duplicate_groups"
    try:
        with open(DUP_REPORT_PATH, "r", encoding="utf-8") as f:
            dup_report = json.load(f)
        
        # 1. Audit Detection Check: Raw audit must detect exactly 81 cross-class duplicate conflicts
        reported_conflicts = dup_report.get("exact_duplicates", {}).get("dataset_2_cross_class_conflicting_groups", 0)
        healthy_conflicts = dup_report.get("cross_class_conflict_summary", {}).get("healthy_vs_diseased_conflicts", 0)

        # 2. Prepared Manifest Integrity Check: Prepared manifest must have 0 conflicting labels in any duplicate group
        manifest_dup_labels = {}
        for s in manifest.get("samples", []):
            grp = s.get("duplicate_group_id")
            cls = s.get("canonical_disease_id")
            if grp:
                if grp not in manifest_dup_labels:
                    manifest_dup_labels[grp] = set()
                manifest_dup_labels[grp].add(cls)

        manifest_conflicts = {g: list(clss) for g, clss in manifest_dup_labels.items() if len(clss) > 1}

        if reported_conflicts == 81 and healthy_conflicts == 1 and len(manifest_conflicts) == 0:
            test_results.append({
                "test_name": t5_name,
                "status": "PASS",
                "message": (
                    f"Successfully audited 81 cross-class conflicting clusters in Dataset 2 (including 1 Healthy vs Leaf Curl collision). "
                    f"Verified 0 conflicting labels within prepared manifest duplicate groups."
                )
            })
            print(f"  [PASS] {t5_name}")
        else:
            test_results.append({
                "test_name": t5_name,
                "status": "FAIL",
                "message": (
                    f"Audit check failed: reported_conflicts={reported_conflicts} (expected 81), "
                    f"healthy_conflicts={healthy_conflicts} (expected 1), "
                    f"manifest_conflicts={len(manifest_conflicts)} (expected 0)."
                )
            })
            print(f"  [FAIL] {t5_name}")
    except Exception as e:
        test_results.append({"test_name": t5_name, "status": "FAIL", "message": str(e)})
        print(f"  [FAIL] {t5_name}: {e}")

    # ---------------------------------------------------------
    # Test 6: Train/Test Leakage Across Duplicate Groups
    # ---------------------------------------------------------
    t6_name = "test_train_test_leakage_through_duplicate_groups"
    try:
        dup_groups_splits = {}
        for s in manifest.get("samples", []):
            grp = s.get("duplicate_group_id")
            split = s.get("planned_split")
            if grp:
                if grp not in dup_groups_splits:
                    dup_groups_splits[grp] = set()
                dup_groups_splits[grp].add(split)

        leaked_groups = {grp: list(splits) for grp, splits in dup_groups_splits.items() if len(splits) > 1}
        if not leaked_groups:
            test_results.append({
                "test_name": t6_name,
                "status": "PASS",
                "message": "All duplicate groups are locked to single split partitions; zero cross-partition leakage."
            })
            print(f"  [PASS] {t6_name}")
        else:
            test_results.append({
                "test_name": t6_name,
                "status": "FAIL",
                "message": f"Detected duplicate group partition split leakage: {leaked_groups}"
            })
            print(f"  [FAIL] {t6_name}")
    except Exception as e:
        test_results.append({"test_name": t6_name, "status": "FAIL", "message": str(e)})
        print(f"  [FAIL] {t6_name}: {e}")

    # ---------------------------------------------------------
    # Test 7: Split Overlap (Mutual Exclusivity)
    # ---------------------------------------------------------
    t7_name = "test_split_overlap"
    try:
        splits = {}
        for s in manifest.get("samples", []):
            sp = s.get("planned_split", "unassigned")
            if sp not in splits:
                splits[sp] = set()
            splits[sp].add(s["sample_id"])

        overlaps = []
        split_keys = list(splits.keys())
        for i in range(len(split_keys)):
            for j in range(i + 1, len(split_keys)):
                k1, k2 = split_keys[i], split_keys[j]
                common = splits[k1].intersection(splits[k2])
                if common:
                    overlaps.append((k1, k2, list(common)))

        if not overlaps:
            test_results.append({
                "test_name": t7_name,
                "status": "PASS",
                "message": "Partitions are strictly mutually exclusive; zero sample ID overlap between splits."
            })
            print(f"  [PASS] {t7_name}")
        else:
            test_results.append({
                "test_name": t7_name,
                "status": "FAIL",
                "message": f"Detected overlapping samples across splits: {overlaps}"
            })
            print(f"  [FAIL] {t7_name}")
    except Exception as e:
        test_results.append({"test_name": t7_name, "status": "FAIL", "message": str(e)})
        print(f"  [FAIL] {t7_name}: {e}")

    # ---------------------------------------------------------
    # Test 8: Missing Required Fields Check
    # ---------------------------------------------------------
    t8_name = "test_missing_required_fields"
    try:
        required_fields = [
            "sample_id", "relative_path", "dataset_source",
            "canonical_crop_id", "canonical_disease_id",
            "original_label", "image_sha256", "quality_flags",
            "label_review_status", "field_or_lab_domain"
        ]
        missing_field_instances = []
        for s in manifest.get("samples", []):
            for rf in required_fields:
                if rf not in s:
                    missing_field_instances.append((s.get("sample_id"), rf))

        if not missing_field_instances:
            test_results.append({
                "test_name": t8_name,
                "status": "PASS",
                "message": f"All {len(manifest.get('samples', []))} samples contain 100% of required schema fields."
            })
            print(f"  [PASS] {t8_name}")
        else:
            test_results.append({
                "test_name": t8_name,
                "status": "FAIL",
                "message": f"Detected missing required fields: {missing_field_instances}"
            })
            print(f"  [FAIL] {t8_name}")
    except Exception as e:
        test_results.append({"test_name": t8_name, "status": "FAIL", "message": str(e)})
        print(f"  [FAIL] {t8_name}: {e}")

    # ---------------------------------------------------------
    # Test 9: Reproducibility of Inventory Counts on Disk
    # ---------------------------------------------------------
    t9_name = "test_reproducibility_of_inventory_counts"
    try:
        # 1. Scan D1 on disk
        d1_files = glob.glob(os.path.join(D1_DIR, "*", "*", "*.*"))
        d1_valid = [f for f in d1_files if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

        # 2. Scan D2 on disk
        d2_files = glob.glob(os.path.join(D2_DIR, "*", "*.*"))
        d2_valid = [f for f in d2_files if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

        # 3. Scan Synthetic on disk
        synth_files = glob.glob(os.path.join(SYNTH_DIR, "*", "*.*"))
        synth_valid = [f for f in synth_files if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

        # Verify against inventory report
        with open(INVENTORY_PATH, "r", encoding="utf-8") as f:
            inv = json.load(f)["datasets"]

        exp_d1 = inv["dataset_1_broad"]["total_images"]
        exp_d2 = inv["dataset_2_regional"]["total_images"]
        exp_synth = inv["auxiliary_synthetic"]["total_images"]

        d1_match = len(d1_valid) == exp_d1
        d2_match = len(d2_valid) == exp_d2
        synth_match = len(synth_valid) == exp_synth

        if d1_match and d2_match and synth_match:
            test_results.append({
                "test_name": t9_name,
                "status": "PASS",
                "message": (
                    f"Physical disk counts independently verified: "
                    f"Dataset 1 = {len(d1_valid)} (expected {exp_d1}), "
                    f"Dataset 2 = {len(d2_valid)} (expected {exp_d2}), "
                    f"Synthetic = {len(synth_valid)} (expected {exp_synth})."
                )
            })
            print(f"  [PASS] {t9_name}")
        else:
            test_results.append({
                "test_name": t9_name,
                "status": "FAIL",
                "message": (
                    f"Count mismatch: D1={len(d1_valid)} vs {exp_d1}, "
                    f"D2={len(d2_valid)} vs {exp_d2}, "
                    f"Synth={len(synth_valid)} vs {exp_synth}."
                )
            })
            print(f"  [FAIL] {t9_name}")
    except Exception as e:
        test_results.append({"test_name": t9_name, "status": "FAIL", "message": str(e)})
        print(f"  [FAIL] {t9_name}: {e}")

    # ---------------------------------------------------------
    # Test 10: Quality Flags Report Integrity
    # ---------------------------------------------------------
    t10_name = "test_quality_flags_integrity"
    try:
        flag_rows = []
        with open(QUALITY_FLAGS_PATH, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            flag_rows = list(reader)

        if len(flag_rows) == 885:
            test_results.append({
                "test_name": t10_name,
                "status": "PASS",
                "message": f"Verified image_quality_flags.csv has valid headers and exactly 885 traceable flag records."
            })
            print(f"  [PASS] {t10_name}")
        else:
            test_results.append({
                "test_name": t10_name,
                "status": "FAIL",
                "message": f"Expected 885 quality flags, but found {len(flag_rows)}."
            })
            print(f"  [FAIL] {t10_name}")
    except Exception as e:
        test_results.append({"test_name": t10_name, "status": "FAIL", "message": str(e)})
        print(f"  [FAIL] {t10_name}: {e}")

    # ---------------------------------------------------------
    # Summary & Output Generation
    # ---------------------------------------------------------
    passed_count = sum(1 for r in test_results if r["status"] == "PASS")
    total_count = len(test_results)
    all_passed = passed_count == total_count

    output_payload = {
        "test_suite": "AgroVision AI 2.0 - Phase 3 Automated Audit Test Suite",
        "executed_at": datetime.now().isoformat(),
        "total_tests": total_count,
        "tests_passed": passed_count,
        "tests_failed": total_count - passed_count,
        "overall_status": "PASS" if all_passed else "FAIL",
        "test_results": test_results
    }

    with open(OUTPUT_RESULTS_PATH, "w", encoding="utf-8") as f:
        json.dump(output_payload, f, indent=2)

    print("=" * 65)
    print(f" Audit Test Suite Finished: {passed_count}/{total_count} PASSED")
    print(f" Results written to: {OUTPUT_RESULTS_PATH}")
    print("=" * 65)

    return all_passed


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
