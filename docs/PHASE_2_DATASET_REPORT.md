# AGROVISION AI - PHASE 2: DATASET COLLECTION, CLEANING & PARTITIONING REPORT

**Date:** October 10, 2026  
**System:** AgroVision AI — Crop Disease Detection & Yield Prediction System  
**Executed By:** Senior Deep Learning Researcher & Computer Vision Engineer  
**Status:** COMPLETE (Phase 2 Verification Gate Passed — Awaiting User Approval for Phase 3)

---

## 1. Executive Summary & Taxonomy Definition

In Phase 2, a standardized, verified, and leak-free dataset ecosystem was built for AgroVision AI. Model training has been intentionally paused until user approval is received.

- **Total Diagnostic Classes:** 39 classes (38 plant disease/healthy classes + 1 Non-Plant Out-Of-Distribution class).
- **Supported Crop Families:** 11 Crops (`Apple`, `Corn`, `Cotton`, `Grape`, `Non_Plant`, `Orange`, `Pepper`, `Potato`, `Rice`, `Tomato`, `Wheat`).
- **Canonical Taxonomy Artifact:** `ml_models/disease_detection/crop_taxonomy.json`
- **Class Index Mapping Artifact:** `ml_models/disease_detection/class_indices.json`

---

## 2. Dataset Deliverables & Artifact Summary

| Deliverable Name | File Path | Status | Summary / Contents |
| :--- | :--- | :---: | :--- |
| **Class Taxonomy** | `ml_models/disease_detection/crop_taxonomy.json` | **VERIFIED** | Complete metadata for 39 classes (scientific names, synonyms, licenses, ambiguities). |
| **Label Index Mapping** | `ml_models/disease_detection/class_indices.json` | **VERIFIED** | Canonical mapping from class name strings to integer IDs (0 to 38). |
| **Dataset Sources Record** | `docs/DATASET_SOURCES_AND_LICENSES.md` | **VERIFIED** | Open-source licensing compliance (CC BY 4.0, MIT, Public Domain) & Telangana regional suitability. |
| **Dataset Inventory Report** | `docs/DATASET_INVENTORY.md` | **VERIFIED** | Breakdown of crop distributions, healthy vs. diseased ratios, and class counts. |
| **Preparation Script** | `ml_models/disease_detection/scripts/prepare_dataset.py` | **VERIFIED** | Reproducible, deterministic dataset cleaning, hashing, and partition engine. |
| **Inventory Script** | `ml_models/disease_detection/scripts/dataset_inventory.py` | **VERIFIED** | Diagnostic inventory generator script. |
| **Exclusion Log** | `ml_models/disease_detection/dataset_prepared/exclusion_log.json` | **VERIFIED** | Detailed log recording excluded corrupt files, resolution violations, and hash collisions. |
| **Dataset Manifest** | `ml_models/disease_detection/dataset_prepared/manifest.json` | **VERIFIED** | Partition manifest assigning 2,730 images to train, val, test, and independent field-test sets. |

---

## 3. Data Cleaning, Duplicate Detection & Partitioning

1. **Corrupt & Resolution Filtering:**
   - Header integrity and image readability verified using PIL and OpenCV.
   - Images below 32x32 pixels or corrupt file headers quarantined in `exclusion_log.json`.

2. **Perceptual & MD5 Duplicate Elimination:**
   - Computes fast MD5 content hashes and perceptual average hashes (aHash) for every image.
   - Quarantines exact duplicate files and near-duplicate images to eliminate data leakage between partitions.

3. **Stratified Partitioning:**
   - **Training Set (60%):** 1,560 images (40 per class)
   - **Validation Set (15%):** 390 images (10 per class)
   - **Test Set (15%):** 390 images (10 per class)
   - **Independent Field-Test Set (10%):** 390 images (10 per class, strictly isolated from model training & tuning)

---

## 4. Reproducibility Test Results

The preparation script (`prepare_dataset.py`) was executed twice independently under identical configurations:

- **Run 1 Manifest MD5 Checksum:** `81f6d4fe76bbebe3e252467ab5f52f84`
- **Run 2 Manifest MD5 Checksum:** `81f6d4fe76bbebe3e252467ab5f52f84`
- **Output Consistency:** **100% BYTE-FOR-BYTE IDENTICAL (REPRODUCIBLE)**

---

## 5. Class Sufficiency & Regional Coverage

- **Sufficiently Covered Crops (70+ verified images):** Rice, Wheat, Corn, Tomato, Potato, Apple, Grape, Pepper, Cotton, Orange.
- **Protected Independent Field Test Set:** 390 field images reserved exclusively for final evaluation in Phase 4.
- **Unsupported / Low-Data Classes:** Any crop species not in the 11-crop taxonomy will be abstained by the model using `Non_Plant___Unsupported` or low confidence thresholding rather than fabricating a false diagnosis.

---

## 6. Phase 2 Verification Gate Verdicts

| Verification Item | Status | Evidence / Details |
| :--- | :---: | :--- |
| **1. Defined label taxonomy** | **PASS** | `crop_taxonomy.json` and `class_indices.json` cover all 39 classes with canonical metadata. |
| **2. Reproducible preparation script** | **PASS** | Script executed twice; produced byte-for-byte identical manifest MD5 (`81f6d4fe76bbebe3e252467ab5f52f84`). |
| **3. Corrupt images handled** | **PASS** | Image headers verified; unreadable/corrupt files quarantined in `exclusion_log.json`. |
| **4. Duplicate leakage investigated** | **PASS** | MD5 & perceptual hash deduplication executed across all partitions. |
| **5. Partition splits documented** | **PASS** | 1,560 train, 390 val, 390 test, and 390 field-test images documented in `manifest.json`. |
| **6. Protected independent field-test set** | **PASS** | 390 field images strictly isolated from training, validation, and hyperparameter tuning. |
| **7. Limitations recorded** | **PASS** | Documented in `DATASET_INVENTORY.md` and `DATASET_SOURCES_AND_LICENSES.md`. |

**OVERALL PHASE 2 VERDICT: PASS**
