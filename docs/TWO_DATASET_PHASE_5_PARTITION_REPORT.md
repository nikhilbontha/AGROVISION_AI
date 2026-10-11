# AgroVision AI — Phase 5: Leakage-Free Data Partitioning and Test Set Preparation Report

**Date:** October 10, 2026  
**Status:** Verification Gate Passed (PASS)  
**System:** AgroVision AI — Unified Multi-Crop & Regional Disease Dataset Partition Engine  
**Derived Experiment Directory:** [`ml_models/disease_detection/unified_experiment/`](file:///e:/tekworks_projects/crop/ml_models/disease_detection/unified_experiment)  
**Partition Generator & Verifier Script:** [`scratch/generate_phase5_partitions.py`](file:///e:/tekworks_projects/crop/scratch/generate_phase5_partitions.py)  

---

## 1. Executive Summary

Phase 5 establishes a **leakage-free, stratified, reproducible dataset partition** from the Phase 4 combined training manifest (**23,280 eligible images** across 72 canonical classes).

All images sharing identical MD5 content hashes or near-duplicate identifiers (`duplicate_group_id`) were strictly locked into a single partition, eliminating data leakage between training, validation, and testing partitions.

### Key Partition Statistics:
- **Total Combined Input:** 23,280 images (100.0%)
- **Training Manifest (`train_manifest.json`):** 16,237 images (69.75%)
- **Validation Manifest (`val_manifest.json`):** 3,521 images (15.12%)
- **Final Test Manifest (`test_manifest.json`):** 3,522 images (15.13%)
- **Reserved Field-Test Manifest (`field_test_manifest.json`):** 3,175 images (regional field photographs reserved inside final test set)
- **Exclusion / Quarantine Manifest (`exclusion_manifest.json`):** 585 images (`Chilli_Yellowish`: 490, `Palm_Dryness`: 70, `Palm_Fungal Disease`: 25)
- **Exact Count Reconciliation:** `16,237 + 3,521 + 3,522 = 23,280` (100% exact match).

---

## 2. Partition Strategy & Leakage Control

### Split Configuration:
- **Random Seed:** `42`
- **Stratification Unit:** Primary canonical class ID (`0` to `71`)
- **Group Locking Unit:** `duplicate_group_id` (MD5 hash prefix)

### Anti-Leakage Protocol:
1. **Zero Hash Overlap:** Verified 0 MD5 hash collisions across `train`, `val`, and `test` splits.
2. **Zero Duplicate Group Leakage:** All copies of duplicate or near-duplicate images remain co-located inside the same partition.
3. **Multi-Class Conflict Handling:** 35 duplicate groups (70 images total) in Dataset 2 with conflicting source labels were kept co-located in single partitions (e.g. Train) to prevent cross-partition label leakage.
4. **Independent Test Set Protection:** The test set (`test_manifest.json`) is locked and immutable. It will not be used for fitting, tuning, hyperparameter search, or threshold selection.

---

## 3. Class & Dataset Source Distribution Summary

### Dataset Source Breakdown per Partition:

| Partition | Dataset 1 (Broad Crop) | Dataset 2 (Regional Andhra) | Total Records | Share (%) |
| :--- | :---: | :---: | :---: | :---: |
| **Training Split** | 1,911 | 14,326 | **16,237** | **69.75%** |
| **Validation Split** | 410 | 3,111 | **3,521** | **15.12%** |
| **Final Test Split** | 409 | 3,113 | **3,522** | **15.13%** |
| **Total Partitioned** | **2,730** | **20,550** | **23,280** | **100.00%** |
| **Quarantined (Excluded)** | 0 | 585 | **585** | N/A |
| **Grand Total** | **2,730** | **21,135** | **23,865** | N/A |

### Crop-Level Class Representation:
All 72 canonical classes are represented across Train, Validation, and Test partitions.
- **72 classes in Train** (100% representation)
- **72 classes in Validation** (100% representation)
- **72 classes in Test** (100% representation)

---

## 4. Deterministic Reproducibility Verification

The partition generator script [`scratch/generate_phase5_partitions.py`](file:///e:/tekworks_projects/crop/scratch/generate_phase5_partitions.py) was executed twice under identical conditions using random seed `42`.

### Manifest MD5 Hashes Across Runs:
- **Train Manifest Hash:** `44a2dfebfc2d744f4ffb415a7707e7b3` (Identical between Run 1 and Run 2)
- **Validation Manifest Hash:** `d061c4bb5cfd05bb6580dfa80fc51179` (Identical between Run 1 and Run 2)
- **Test Manifest Hash:** `0dc862e367469a473173d1f054817a32` (Identical between Run 1 and Run 2)
- **Verdict:** **PASS (100% Deterministic & Reproducible)**

---

## 5. Machine-Readable Artifact Inventory

All Phase 5 deliverables are saved in [`ml_models/disease_detection/unified_experiment/`](file:///e:/tekworks_projects/crop/ml_models/disease_detection/unified_experiment):

1. [`partition_config.json`](file:///e:/tekworks_projects/crop/ml_models/disease_detection/unified_experiment/partition_config.json): Partition parameters, random seed, timestamp, and target vs actual split ratios.
2. [`train_manifest.json`](file:///e:/tekworks_projects/crop/ml_models/disease_detection/unified_experiment/train_manifest.json): 16,237 training records with canonical mappings and duplicate group IDs.
3. [`val_manifest.json`](file:///e:/tekworks_projects/crop/ml_models/disease_detection/unified_experiment/val_manifest.json): 3,521 validation records for hyperparameter selection and early stopping.
4. [`test_manifest.json`](file:///e:/tekworks_projects/crop/ml_models/disease_detection/unified_experiment/test_manifest.json): 3,522 locked final test records.
5. [`field_test_manifest.json`](file:///e:/tekworks_projects/crop/ml_models/disease_detection/unified_experiment/field_test_manifest.json): 3,175 reserved regional field photograph test records.
6. [`exclusion_manifest.json`](file:///e:/tekworks_projects/crop/ml_models/disease_detection/unified_experiment/exclusion_manifest.json): 585 quarantined records excluded from all training/eval splits.
7. [`leakage_detection_report.json`](file:///e:/tekworks_projects/crop/ml_models/disease_detection/unified_experiment/leakage_detection_report.json): Automated zero-leakage verification results.
8. [`class_distribution_report.json`](file:///e:/tekworks_projects/crop/ml_models/disease_detection/unified_experiment/class_distribution_report.json): Per-class and per-source count distribution breakdown.
9. [`reproducibility_report.json`](file:///e:/tekworks_projects/crop/ml_models/disease_detection/unified_experiment/reproducibility_report.json): Dual-run cryptographic hash equivalence proof.

---

## 6. Phase 5 Verification Gate Table

| Verification Item | Status | Evidence & Output Location |
| :--- | :---: | :--- |
| **A. Every partition has a documented purpose** | **PASS** | Train (model fitting), Val (early stopping/hyperparams), Test (final evaluation), Field-Test (out-of-domain evaluation). |
| **B. Exact duplicates do not cross partitions** | **PASS** | 0 MD5 hash overlaps between Train, Val, and Test splits. |
| **C. Known related image groups locked in single splits** | **PASS** | `duplicate_group_id` enforced; 0 group overlaps across partitions. |
| **D. Final test set protected** | **PASS** | Locked 3,522 test images isolated from training or hyperparameter search. |
| **E. Class coverage and limitations documented** | **PASS** | All 72 classes represented; distributions recorded in `class_distribution_report.json`. |
| **F. Partition manifests are reproducible** | **PASS** | Seed 42 dual-run test verified 100% identical manifest hashes. |
| **G. All image paths and labels valid** | **PASS** | Step 1 check confirmed all 23,280 records exist and map to valid canonical classes. |
| **H. Both original datasets remain unchanged** | **PASS** | Source datasets (`dataset_prepared` and `archive.zip`) remain read-only and untouched. |

---

**Phase 5 Gate Status:** **ALL 8 MANDATORY CHECKS PASSED (PASS)**  
*Next Action: Await user review and approval before proceeding to Phase 6.*
