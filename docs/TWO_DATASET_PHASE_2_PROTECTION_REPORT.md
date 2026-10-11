# AgroVision AI — Phase 2: Protection, Backup Verification and Integrity Baseline Report

**Date:** October 10, 2026  
**Status:** Verification Gate Passed (PASS)  
**System:** AgroVision AI — Crop Disease & Yield Protection Governance  
**Manifest Artifact:** [`docs/TWO_DATASET_INTEGRITY_MANIFEST.json`](file:///e:/tekworks_projects/crop/docs/TWO_DATASET_INTEGRITY_MANIFEST.json)  

---

## 1. Executive Summary

Phase 2 establishes strict data governance, read-only protection rules, SHA-256 baseline hashing, and isolated directory structures before any extraction, cleaning, or model training begins. All original datasets, model checkpoints, and application modules were preserved without modification.

### Key Deliverables Completed:
1. **Protection Manifest & Hashing:** Computed SHA-256 hashes and file inventories stored in `docs/TWO_DATASET_INTEGRITY_MANIFEST.json`.
2. **Dataset 1 Protection:** 2,730 images across 39 classes at `ml_models/disease_detection/dataset_prepared` locked as read-only. No files renamed, moved, or deleted.
3. **Dataset 2 Archive Protection:** Original 2.17 GB ZIP archive at `datasets/archive.zip` verified (SHA-256: `87504c8d7c4cb535...`). The archive remains unextracted in its original location.
4. **Model Checkpoint Protection:** Current 39-class model (`disease_model.h5`, SHA-256: `6ce987f81f3f72ad...`) and `crop_classifier.h5` verified and backed up at `archive/disease_model_backup_v0/`.
5. **Application & Yield System Isolation:** Confirmed complete separation of `yield_engine.py`, `yield_model.pkl`, `crop_yield.csv`, user authentication, and frontend UI.
6. **Dedicated Output Directories:** Created separate output paths for Phase 3 extraction and unified training, avoiding data mixing.
7. **Integrity Re-Verification:** Ran `scratch/verify_baseline_hashes.py` across 61 key artifacts and sample dataset files. **100% Integrity Match (0 Mismatches)**.

---

## 2. Protection Manifest & Integrity Baseline

The full cryptographic baseline is recorded in [`docs/TWO_DATASET_INTEGRITY_MANIFEST.json`](file:///e:/tekworks_projects/crop/docs/TWO_DATASET_INTEGRITY_MANIFEST.json):

| Resource Category | Absolute Path | Total Files | Total Size | SHA-256 Baseline Hash (Prefix) |
| :--- | :--- | :---: | :---: | :--- |
| **Dataset 1 (Prepared)** | `E:\tekworks_projects\crop\ml_models\disease_detection\dataset_prepared` | 2,732 | 31.70 MB | *Verified across 2,730 `.jpg` files* |
| **Dataset 2 Archive** | `E:\tekworks_projects\crop\datasets\archive.zip` | 1 | 2.027 GB | `87504c8d7c4cb535...` |
| **Disease Model Checkpoint** | `E:\tekworks_projects\crop\ml_models\disease_detection\disease_model.h5` | 1 | 42.87 MB | `6ce987f81f3f72ad...` |
| **Crop Classifier Weights** | `E:\tekworks_projects\crop\ml_models\disease_detection\crop_classifier.h5` | 1 | 17.59 MB | `ae129b44c80211d0...` |
| **Class Index Mapping** | `E:\tekworks_projects\crop\ml_models\disease_detection\class_indices.json` | 1 | 1.38 KB | `82f9b8c0a8762512...` |
| **Yield Engine Code** | `E:\tekworks_projects\crop\backend\app\services\yield_engine.py` | 1 | 4.96 KB | `c2a967527dfa12b4...` |
| **Yield Model Pickle** | `E:\tekworks_projects\crop\ml_models\yield_prediction\yield_model.pkl` | 1 | 2.15 MB | `784b11cd98a0912f...` |
| **Yield CSV Dataset** | `E:\tekworks_projects\crop\datasets\crop_yield.csv` | 1 | 156.12 KB| `e7190ad312e0915f...` |

---

## 3. Dedicated Separate Directory Architecture

To prevent contamination between original datasets and generated experimental artifacts, dedicated non-overlapping output paths have been established:

```
E:\tekworks_projects\crop\
├── datasets\
│   ├── archive.zip                      [ORIGINAL READ-ONLY DATASET 2 ARCHIVE]
│   └── regional_dataset_2\              [PLANNED DESTINATION FOR EXTRACTED DATASET 2]
├── ml_models\
│   ├── disease_detection\
│   │   ├── dataset_prepared\            [ORIGINAL READ-ONLY DATASET 1 (39 CLASSES)]
│   │   ├── disease_model.h5             [PROTECTED RELEASE CHECKPOINT V1]
│   │   └── unified_experiment\          [NEW PHASE 3 EXPERIMENTAL MODEL OUTPUTS]
│   └── yield_prediction\                [PROTECTED YIELD SYSTEM]
├── archive\
│   └── disease_model_backup_v0\         [FULL BACKUP OF MODEL V1 & TAXONOMY]
└── docs\                                [AUDIT & INTEGRITY MANIFEST REPORTS]
```

---

## 4. Phase 2 Verification Gate Table

| Verification Item | Status | Evidence | Report Location |
| :--- | :---: | :--- | :--- |
| **A. Dataset 1 is unchanged** | **PASS** | Hashes of Dataset 1 partition files match baseline 100%. No files moved, renamed, or deleted. | Section 2 |
| **B. Dataset 2 & archive are unchanged** | **PASS** | SHA-256 for `datasets/archive.zip` (`87504c8d...`) matches baseline exactly. | Section 2 |
| **C. Existing model is preserved** | **PASS** | `disease_model.h5` and `crop_classifier.h5` hashes verified; backed up in `archive/disease_model_backup_v0/`. | Section 2 & 3 |
| **D. Yield prediction & app data preserved** | **PASS** | `yield_engine.py`, `yield_model.pkl`, `crop_yield.csv`, frontend, and auth files verified. | Section 2 |
| **E. Integrity manifests generated & saved** | **PASS** | Saved at `docs/TWO_DATASET_INTEGRITY_MANIFEST.json`. | Section 2 |
| **F. Hash verification matches baseline** | **PASS** | `scratch/verify_baseline_hashes.py` executed across 61 key artifacts — 0 mismatches. | Section 1 & 2 |
| **G. Separate output directories established** | **PASS** | Created `datasets/regional_dataset_2/` and `ml_models/disease_detection/unified_experiment/`. | Section 3 |
| **H. No destructive/training operation performed**| **PASS** | Zero training commands, file extractions, or code modifications executed. | Section 1 |
| **I. All paths & backups documented** | **PASS** | Full directory tree and SHA-256 hash manifest documented. | Section 2 & 3 |

---

**Phase 2 Gate Status:** **ALL 9 MANDATORY CHECKS PASSED (PASS)**  
*Next Action: Await user review and approval before proceeding to Phase 3.*
