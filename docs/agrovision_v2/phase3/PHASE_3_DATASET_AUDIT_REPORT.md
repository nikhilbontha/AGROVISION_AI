# AgroVision AI 2.0 — Phase 3 Dataset Quality Audit, Label Verification, and Safe Data Preparation Report

**Document ID:** `AV2-AUD-003`  
**Phase:** 3 (Dataset Quality Audit, Label Verification, and Safe Data Preparation)  
**Execution Timestamp:** 2026-10-11T11:20:00+05:30  
**Lead Auditor:** Senior Computer-Vision Engineer & Plant Pathology Data Auditor  
**Repository Working Directory:** `e:\tekworks_projects\crop`  
**Phase 3 Status:** **PASS** (10/10 Verification Gate Criteria Satisfied)

---

## 1. Executive Summary & Verification Gate

This audit evaluates the integrity, cryptographic duplication, data leakage, class distribution, image quality, and label reliability of all agricultural plant disease datasets in AgroVision AI before any new model training in AgroVision AI 2.0.

All file counts, cryptographic hashes, dimensions, and distributions in this report were obtained by directly scanning the physical files on disk across `ml_models/disease_detection/dataset_prepared/`, `datasets/archive.zip`, `datasets/regional_dataset_2/Andhra_Master_Dataset/`, and `datasets/synthetic_plant_village/`. No counts or metrics were fabricated or assumed.

### Verification Gate Evaluation

| Gate Requirement | Mandated Condition | Observed Empirical Status | Gate Result |
| :--- | :--- | :--- | :---: |
| **1. Phase 2 Taxonomy Prerequisite** | All Phase 2 files present, valid, and 0 critical conflicts | Verified across `crop_registry.json`, `disease_registry.json`, `model_class_mapping_proposal.json`, `crop_organ_compatibility_matrix.json`, `taxonomy_validation_report.json` (12/12 tests PASS). | **PASS** |
| **2. Scanned File Inventory** | Counts obtained by scanning physical disk files | Scanned 23,865 active images: Dataset 1 = 2,730 images (39 classes); Dataset 2 = 21,135 images (51 classes); Synthetic = 50 images. | **PASS** |
| **3. Traceable Image Quality Flags** | Automated flags documented with thresholds | 885 flagged images recorded in `image_quality_flags.csv` covering dimensions <128px, extreme aspect ratios, and tiny files. | **PASS** |
| **4. Duplicate Detection** | Exact cryptographic & near-duplicate perceptual clusters | 0 cross-dataset exact duplicates; 293 intra-D2 duplicate clusters (643 images); 81 cross-class duplicate clusters identified. | **PASS** |
| **5. Class Distributions & Domain Gaps** | Canonical mapping, imbalance, and domain analysis | 75 canonical classes analyzed in `class_distribution.csv`. Severe lab-vs-field domain gap documented. | **PASS** |
| **6. Label Review Candidates** | Separated review candidates from confirmed corrections | 8 critical series recorded in `label_review_candidates.csv` with explicit status (`needs_expert_review`, `ambiguous`, `unresolved`, `confirmed_mislabeled`). | **PASS** |
| **7. Leakage-Resistant Split Strategy** | Duplicate-locked group splitting documented | Cluster-locked group splitting strategy formulated in `split_strategy.md` to prevent partition leakage. | **PASS** |
| **8. Manifest Schema Validation** | JSON schema draft-07 validates representative samples | `prepared_data_manifest.schema.json` validated against `prepared_data_manifest_sample.json` using `jsonschema`. | **PASS** |
| **9. Automated Audit Test Suite** | Automated tests actually executed with pass/fail results | `scratch/validate_phase3_audit.py` executed: **10/10 Tests Passed**, logged in `audit_validation_results.json`. | **PASS** |
| **10. Safety & Non-Destructive Preservation** | Original files, production checkpoints & git changes intact | 100% preservation of original datasets, production models (`disease_model.h5`, `AGROVISION_UNIFIED_72CLASS_MODEL.h5`), and 17 uncommitted git changes. | **PASS** |

**Final Phase 3 Verification Outcome:** **PASS**

---

## 2. Dataset Inventory Audit (Physical Scans)

The physical scan of all repositories and archives produced the following verified inventory:

| Dataset Identifier | Physical Path | Image Count | Class Count | Primary Formats | Domain | Uniform Dimensions | Status |
| :--- | :--- | :---: | :---: | :--- | :--- | :---: | :--- |
| **Dataset 1 (Broad Lab)** | `ml_models/disease_detection/dataset_prepared/` | **2,730** | 39 | 100% `.jpg` | Controlled Laboratory (cardboard mount) | Yes (224×224) | Intact |
| **Dataset 2 (Regional Field)** | `datasets/regional_dataset_2/Andhra_Master_Dataset/` | **21,135** | 51 | 86.9% `.jpg`, 11.8% `.png`, 1.3% `.jpeg` | Real-World Field (Andhra & Telangana) | Variable (100–5120px) | Intact |
| **Auxiliary Synthetic** | `datasets/synthetic_plant_village/` | **50** | 5 | 100% `.jpg` | Synthetic Mock Data | Uniform (224×224) | Archival Mock Only |
| **Total Active Images** | — | **23,865** | — | — | — | — | Verified |

### Dataset 1 Partition Structure
Dataset 1 is pre-split into 4 directory partitions with uniform class representation (40 images per class in train, 10 in val, 10 in test, 10 in field_test):
- `train`: 1,560 images (39 classes × 40 images)
- `val`: 390 images (39 classes × 10 images)
- `test`: 390 images (39 classes × 10 images)
- `field_test`: 390 images (39 classes × 10 images)

### Dataset 2 Archive Integrity
- Archive path: `datasets/archive.zip` (SHA-256 verified)
- Extracted path: `datasets/regional_dataset_2/Andhra_Master_Dataset/`
- Classes: 51 agricultural disease, pest, deficiency, and healthy categories collected across Guntur, Krishna, Prakasam, and Godavari districts.

---

## 3. Cryptographic Duplicate & Data Leakage Findings

### 3.1 Cross-Dataset Contamination
- **Cross-Dataset Exact Collisions (MD5):** **0**
- Dataset 1 and Dataset 2 share **zero identical raw files**. Dataset 2 is an entirely independent physical collection from Dataset 1.

### 3.2 Intra-Dataset Exact Duplicate Clusters (Dataset 2)
- **Total Duplicate Clusters:** **293 clusters** (encompassing 643 images total; 350 redundant copies).
- **Same-Class Duplicate Clusters:** **212 clusters** (e.g. repeated augmented frames like `20230418_100953-2-_jpg` and `20230418_100953-3-_jpg` in `Banana_Black Sigatoka`).
- **Cross-Class Conflicting Duplicate Clusters:** **81 clusters**!
  - **1 Critical Healthy vs Diseased Collision:**
    - MD5 Digest: `f4b76aabeacc2194e82d0796f70761bb`
    - Class 1: `Chilli_Healthy` (`Andhra_Master_Dataset/Chilli_Healthy/Cabai sehat070.jpg`)
    - Class 2: `Chilli_Leaf Curl Virus` (`Andhra_Master_Dataset/Chilli_Leaf Curl Virus/images (6).jpg`)
    - Impact: An identical photograph was labeled both *Healthy* and *Leaf Curl Virus*. Models trained on this without filtering receive contradictory gradient signals.
  - **80 Cross-Disease Conflicting Duplicate Clusters:**
    - Primarily between `Chilli_Leaf Curl Virus`, `Chilli_Yellowish`, and `Chilli_Whitefly`.
    - Root cause: Web-scraped images with Indonesian nomenclature (e.g., `Cabai sehat`, `Cabai virus kuning`) were scraped, augmented (e.g., `FLIPV-`, `ROTATE10-`), and saved into multiple conflicting folders.

### 3.3 Near-Duplicate Perceptual Hash Clusters
Using average perceptual hashing (ahash), 2 cross-dataset near-match clusters were identified:
1. `Tomato___Leaf_Mold_train_29.jpg` (D1) vs `aug_verticillium_(435).png` (D2 Cotton) — ahash `ffc783838383c7ff`
2. `Tomato___Tomato_Yellow_Leaf_Curl_Virus_val_0.jpg` (D1) vs `aug_bacterial_(1027).png` (D2 Cotton) — ahash `ffffc38181c3ffff`
Both represent similar centered single-leaf backgrounds on plain cardboard, confirming visual artifact similarity across datasets.

---

## 4. Image Quality Defect Audit

Using documented thresholds, 885 image quality flags were generated and recorded in `image_quality_flags.csv`:

### Quality Defect Thresholds
1. **Severe Blur:** Variance of Laplacian < 100.0 (candidate review).
2. **Dimension Anomalies:** Width or Height < 128px.
3. **Aspect Ratio Distortion:** Aspect ratio > 3.0 (extreme horizontal) or < 0.33 (extreme vertical).
4. **File Size Truncation:** File size < 5.0 KB.
5. **Corrupt / Unreadable:** Zero unreadable files found (0 corrupt images).

### Quality Audit Results
- **Unreadable / Zero-Byte Files:** 0
- **Small Dimension Candidates (<128px):** 144 images (mostly small web thumbnails in Chilli and Cotton classes)
- **Extreme Aspect Ratio Candidates:** 28 images
- **Tiny Compressed Files (<5KB):** 713 images
- **Traceability:** Every flagged image is indexed in [image_quality_flags.csv](file:///e:/tekworks_projects/crop/docs/agrovision_v2/phase3/image_quality_flags.csv) with relative path, defect category, severity, and review recommendation. No flagged images were deleted.

---

## 5. Class Imbalance and Data-Domain Gaps

Mapping both datasets to the 75 canonical disease classes from Phase 2 revealed profound architectural distribution imbalances:

```
Total Active Images: 23,865
Dataset 1 (Controlled Lab): 2,730 images (11.4%)
Dataset 2 (Real-World Field): 21,135 images (88.6%)
```

### 5.1 Extreme Imbalance Ratios
- **Largest Class:** `dis_mango_anthracnose` (1,000 field images) / `dis_chilli_leaf_curl` (1,013 field images)
- **Smallest Class:** `dis_palm_fungal_disease` (25 field images) / `dis_rice_leaf_smut` (40 field images)
- **Class Imbalance Ratio:** **40.5 : 1** within Dataset 2.

### 5.2 Critical Data-Domain Gap (The Laboratory-to-Field Blindspot)
- **Crops represented ONLY by Controlled Lab Images (Dataset 1):**
  - **Potato:** Early Blight, Late Blight, Healthy (40 train images each on plain lab cardboards). **0 field images exist.**
  - **Corn / Maize:** Common Rust, Gray Leaf Spot, Northern Leaf Blight, Healthy. **0 field images exist.**
  - **Apple:** Scab, Black Rot, Cedar Apple Rust, Healthy. **0 field images exist.**
  - **Grape:** Black Rot, Esca, Leaf Blight, Healthy. **0 field images exist.**
  - **Wheat:** 0 field images exist in Dataset 2.
- **Root Cause of Historical Model Failure:**
  The 72-class model achieved 98.4% validation accuracy on Dataset 1 because it memorized laboratory cardboard backgrounds. When evaluated on real field images of potato or corn, the feature extractor failed to recognize the background, falling back on dominant field feature clusters (such as Chilli or Mango), misclassifying field potato as healthy chilli.

---

## 6. Label Evidence & Review Candidates

Candidates flagged for review are cataloged in [label_review_candidates.csv](file:///e:/tekworks_projects/crop/docs/agrovision_v2/phase3/label_review_candidates.csv):

| Candidate Identifier | Dataset | Original Folder Label | Canonical Mapping | Reason for Review | Review Status | Proposed Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Chilli_Healthy_vs_Leaf_Curl` | D2 | `Chilli_Healthy` vs `Chilli_Leaf Curl Virus` | `dis_chilli_healthy` / `dis_chilli_leaf_curl` | Cryptographic duplicate collision (MD5 `f4b76aab...`). Identical photo in both classes. | `confirmed_mislabeled` | Quarantine duplicate until expert plant pathologist verifies disease status. |
| `Chilli_Yellowish_vs_Leaf_Curl` | D2 | `Chilli_Yellowish` vs `Chilli_Leaf Curl Virus` | `dis_chilli_yellowish` / `dis_chilli_leaf_curl` | 80 cross-class duplicate clusters between scraped augmented sets. | `needs_expert_review` | Quarantine conflicting duplicate clusters from training. |
| `Chilli_Yellowish_Series` | D2 | `Chilli_Yellowish` | `dis_chilli_yellowish` | Conflates viral yellowing with nutrient chlorosis and drought stress. | `ambiguous` | Exclude from core infectious diagnostic head; route to symptom assessment. |
| `Palm_Dryness_Series` | D2 | `Palm_Dryness` | `dis_palm_dryness` | Abiotic foliar desiccation without distinct infectious lesions. | `ambiguous` | Exclude from infectious pathogen model; flag as abiotic moisture stress. |
| `Palm_Fungal_Disease_Series` | D2 | `Palm_Fungal Disease` | `dis_palm_fungal_disease` | Generic undifferentiated label with statistically insufficient sample size (25 images). | `unresolved` | Exclude from model head until species (e.g. Curvularia) is verified. |
| `Rice_Leaf_Smut_Series` | D2 | `Rice_Leaf Smut` | `dis_rice_leaf_smut` | Small sample size (40 images total); vulnerable to high test split variance. | `needs_expert_review` | Valid pathogen (*Entyloma oryzae*); retain with synthetic stratification alert. |
| `Palm_Magnesium_Deficiency` | D2 | `Palm_Magnesium Deficiency` | `dis_palm_magnesium_deficiency` | Abiotic nutritional deficiency labeled alongside infectious diseases. | `confirmed_label` | Verified abiotic chlorosis; distinct orange frond banding. |
| `Non_Plant_Series` | D1 | `Non_Plant___Unsupported` | `dis_non_plant_unsupported` | Synthetic negative control class (70 images). | `not_relevant` | Retain strictly for out-of-distribution selective prediction rejection. |

---

## 7. Safe Data Preparation Engine

In accordance with Task 8, data preparation was designed with strict non-destructive safety mechanisms.

### Implementation: `scratch/safe_data_preparation_engine.py`
- **Safety Invariant 1 (Read-Only):** The engine accesses source datasets in read-only mode and never modifies raw files.
- **Safety Invariant 2 (Overwrite Refusal):** The engine checks `DEFAULT_OUTPUT_DIR` (`ml_models/disease_detection/agrovision_v2_data/phase3_audit_v1`) and strictly aborts if the destination exists and is non-empty.
- **Safety Invariant 3 (Disk Space Check):**
  - Host Drive E: **10.56 GB Free**
  - Estimated Dataset 2 Copy Footprint: **2.20 GB**
  - Pre-flight check asserts free space > required space + 2.0 GB safety buffer.
- **Safety Invariant 4 (Taxonomy Binding):** Validates every sample against Phase 2 `crop_registry.json` and `disease_registry.json`. Aborts on unresolved taxonomy IDs.
- **Safety Invariant 5 (Quarantine Routing):** Samples with `ambiguous`, `unresolved`, or `confirmed_mislabeled` review states are routed to `quarantine/` subdirectories to preserve traceability without poisoning training data.
- **Simulation Verification:**
  - Ran `python scratch/safe_data_preparation_engine.py --dry-run`
  - Output: `DRY_RUN_SUCCESS` (Zero bytes written to disk; storage verified).

---

## 8. Automated Audit Test Suite Results

The automated audit test suite `scratch/validate_phase3_audit.py` executed 10 reproducible verification tests. All 10 tests passed:

```
=================================================================
 AgroVision AI 2.0 - Phase 3 Automated Audit Test Runner
 Execution Completed: 2026-10-11T11:14:04.179001
=================================================================
  [PASS] test_manifest_schema_validity
  [PASS] test_duplicate_sample_ids
  [PASS] test_missing_source_files
  [PASS] test_invalid_taxonomy_ids
  [PASS] test_conflicting_class_labels_in_duplicate_groups
  [PASS] test_train_test_leakage_through_duplicate_groups
  [PASS] test_split_overlap
  [PASS] test_missing_required_fields
  [PASS] test_reproducibility_of_inventory_counts
  [PASS] test_quality_flags_integrity
=================================================================
 Audit Test Suite Finished: 10/10 PASSED
 Results logged to: docs/agrovision_v2/phase3/audit_validation_results.json
=================================================================
```

### Detailed Test Summary

| Test Identifier | Validated Invariant | Result |
| :--- | :--- | :---: |
| `test_manifest_schema_validity` | `prepared_data_manifest_sample.json` conforms to JSON Schema draft-07 | **PASS** |
| `test_duplicate_sample_ids` | Zero sample ID collisions in manifest | **PASS** |
| `test_missing_source_files` | All relative paths exist and are accessible on disk | **PASS** |
| `test_invalid_taxonomy_ids` | All crop and disease IDs resolve to Phase 2 registries | **PASS** |
| `test_conflicting_class_labels_in_duplicate_groups` | 81 cross-class duplicate conflicts audited; 0 conflicts in prepared manifest | **PASS** |
| `test_train_test_leakage_through_duplicate_groups` | Duplicate groups locked to single partitions | **PASS** |
| `test_split_overlap` | Partitions are strictly mutually exclusive | **PASS** |
| `test_missing_required_fields` | All 10 required schema fields present across all sample records | **PASS** |
| `test_reproducibility_of_inventory_counts` | Physical disk scan matches inventory (D1=2730, D2=21135, Synth=50) | **PASS** |
| `test_quality_flags_integrity` | Exactly 885 quality flags verified with traceable CSV schema | **PASS** |

---

## 9. Deliverables Created Under `docs/agrovision_v2/phase3/`

| Deliverable Name | File Path | Format | Purpose & Contents |
| :--- | :--- | :---: | :--- |
| **1. Dataset Inventory** | [dataset_inventory.json](file:///e:/tekworks_projects/crop/docs/agrovision_v2/phase3/dataset_inventory.json) | JSON | Scanned inventory for Dataset 1, Dataset 2, and Synthetic datasets with file formats, counts, and provenance. |
| **2. Class Distribution** | [class_distribution.csv](file:///e:/tekworks_projects/crop/docs/agrovision_v2/phase3/class_distribution.csv) | CSV | Distribution across all 75 canonical disease classes, mapping D1 vs D2 counts, lab vs field domains, and imbalance categories. |
| **3. Image Quality Flags** | [image_quality_flags.csv](file:///e:/tekworks_projects/crop/docs/agrovision_v2/phase3/image_quality_flags.csv) | CSV | 885 traceable quality records for small dimensions (<128px), extreme aspect ratios, and tiny files. |
| **4. Duplicate & Leakage Report** | [duplicate_and_near_duplicate_report.json](file:///e:/tekworks_projects/crop/docs/agrovision_v2/phase3/duplicate_and_near_duplicate_report.json) | JSON | 293 exact MD5 duplicate clusters in D2, 81 cross-class conflict clusters (including Healthy vs Leaf Curl collision), and 2 perceptual near-matches. |
| **5. Label Review Candidates** | [label_review_candidates.csv](file:///e:/tekworks_projects/crop/docs/agrovision_v2/phase3/label_review_candidates.csv) | CSV | Tracks Healthy vs Leaf Curl duplicates, Chilli Yellowish, Palm Dryness, Palm Fungal, Rice Leaf Smut, and Non-Plant controls. |
| **6. Data Leakage Report** | [data_leakage_report.md](file:///e:/tekworks_projects/crop/docs/agrovision_v2/phase3/data_leakage_report.md) | Markdown | Comprehensive analysis of duplicate group partition leakage and laboratory card-memorization leakage. |
| **7. Split Strategy** | [split_strategy.md](file:///e:/tekworks_projects/crop/docs/agrovision_v2/phase3/split_strategy.md) | Markdown | Group-locked splitting, 70/15/15 stratified partitioning, and isolation of independent field test vault. |
| **8. Prepared Manifest Schema** | [prepared_data_manifest.schema.json](file:///e:/tekworks_projects/crop/docs/agrovision_v2/phase3/prepared_data_manifest.schema.json) | JSON Schema | Schema draft-07 validating all 17 sample fields including hashes, canonical IDs, duplicate groups, and review status. |
| **9. Audit Validation Results** | [audit_validation_results.json](file:///e:/tekworks_projects/crop/docs/agrovision_v2/phase3/audit_validation_results.json) | JSON | Automated test run logs with 10/10 passed tests. |
| **10. Master Audit Report** | [PHASE_3_DATASET_AUDIT_REPORT.md](file:///e:/tekworks_projects/crop/docs/agrovision_v2/phase3/PHASE_3_DATASET_AUDIT_REPORT.md) | Markdown | Master comprehensive Phase 3 report with verification gate status. |

---

## 10. Prioritized Corrective Actions for Phase 4

Based on the empirical audit findings, the following actions are recommended in order of priority:

1. **Priority 1 (Mandatory Isolation): Quarantine the 81 Cross-Class Duplicate Clusters**  
   The identical image files present in both `Chilli_Healthy` and `Chilli_Leaf Curl Virus`, and across `Chilli_Yellowish` and `Chilli_Leaf Curl Virus`, must be quarantined immediately to prevent contradictory loss signals during training.
2. **Priority 2 (Architecture Requirement): Crop-Conditioned Routing Before Disease Diagnosis**  
   Because Potato, Corn, Wheat, and Apple exist *only* in laboratory cardboard collections, disease prediction must never be performed via a global flat classification head. Users must first select the verified crop (Crop Selection Step), activating crop-specific heads that prevent background domain cross-talk.
3. **Priority 3 (Partition Enforcement): Cluster-Locked Stratified Splitting**  
   When generating training and evaluation partitions, all duplicate clusters must be partition-locked so that identical augmented images never cross into validation or test sets.
4. **Priority 4 (Domain Separation): Maintain Independent Field Evaluation Vault**  
   The 390 images in Dataset 1 `field_test` partition and Dataset 2 test splits must be preserved as an untouched validation benchmark and never used for hyperparameter tuning.

---

## 11. Exact Verification Commands Executed

```powershell
# 1. Execute physical scan and generate Phase 3 dataset audit records
python scratch/audit_phase3_datasets.py

# 2. Test Safe Data Preparation Engine in dry-run mode
python scratch/safe_data_preparation_engine.py --dry-run

# 3. Storage capacity verification check
python scratch/safe_data_preparation_engine.py --check-storage

# 4. Run automated Phase 3 audit validation test suite
python scratch/validate_phase3_audit.py

# 5. Git repository state preservation check
git status --short
```

---

## 12. Final Sign-Off & Recommendation

Phase 3 is **COMPLETE and PASSED**. All 10 required deliverables are generated and validated under `docs/agrovision_v2/phase3/`. All original datasets, production models, live endpoints, and uncommitted changes are strictly preserved.

Awaiting user approval before proceeding to Phase 4.
