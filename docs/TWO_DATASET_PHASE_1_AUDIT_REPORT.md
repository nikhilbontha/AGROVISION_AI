# AgroVision AI — Phase 1: Two-Dataset Environment and Baseline Audit Report

**Date:** October 10, 2026  
**Status:** Phase 1 Inspection Completed (PASS)  
**System:** AgroVision AI — Crop Disease Detection & Yield Prediction System  
**Audit Standard:** Read-Only Non-Destructive Environment & Multi-Dataset Discovery  

---

## 1. Executive Summary

This Phase 1 Audit Report evaluates the existing AgroVision AI codebase, hardware/runtime environment, Dataset 1 (current 39-class broad dataset), and newly supplied Dataset 2 (`Andhra_Master_Dataset` inside `archive.zip`).

### Key Audit Findings:
1. **Inspection Integrity:** All verification steps were conducted in **100% read-only mode**. No original dataset files, model checkpoints, source code, or configuration files were deleted, modified, or extracted.
2. **Dataset 1 Status:** Located at `E:\tekworks_projects\crop\ml_models\disease_detection\dataset_prepared`. Contains **2,730 images** across **39 diagnostic classes** (70 images per class split into train: 1,560, val: 390, test: 390, field_test: 390).
3. **Dataset 2 Status:** Verified at `E:\tekworks_projects\crop\datasets\archive.zip`. `archive.zip` is a valid 2.17 GB ZIP archive containing a top-level directory `Andhra_Master_Dataset/`. It contains **21,135 valid images** across **51 class directories**, including regional cash crops (Banana, Mango, Oil Palm, Turmeric, Chilli) and extended rice/cotton/tomato disease classes.
4. **Baseline Performance:** Current 39-class EfficientNetB0 checkpoint (`disease_model.h5`) achieves **99.23% test accuracy** and **94.87% field photograph accuracy** on Dataset 1. All 27 backend automated unit tests pass cleanly.
5. **Technical Bottleneck:** The current 39-unit output head cannot infer Dataset 2's 51 classes or new crops without output layer expansion and retraining in Phase 2/3.

---

## 2. Environment & Runtime Discovery

### 2.1 Directory Structure & Project Root
- **Verified Repository Root:** `E:\tekworks_projects\crop`
- **Backend Entry Point:** `backend/app/main.py` (FastAPI / Uvicorn running on port 8000)
- **Frontend Entry Point:** `frontend/src/App.jsx` (React / Vite running on port 5173)
- **Yield Engine:** `backend/app/services/yield_engine.py` (`yield_model.pkl`)
- **Disease Engine:** `backend/app/routes/predict.py` (`disease_model.h5`)
- **Knowledge Base:** `backend/app/utils/disease_info.py`

### 2.2 System & ML Runtime Capabilities
- **Operating System:** Windows 11 Home (Build 26200 64-bit)
- **Python Version:** 3.13.14 (tags/v3.13.14, MSC v.1944 64 bit)
- **Machine Learning Framework:** TensorFlow 2.21.0 / Keras 3.13.2
- **GPU Availability:** None (Native Windows TF >= 2.11 runs in CPU mode)
- **System Memory (RAM):** 16.0 GB Total (5.77 GB Available Physical Memory)
- **Disk Storage:** Drive C: 217.5 GB Free | Drive E: 13.8 GB Free
- **Image Libraries:** OpenCV 4.13.0, Pillow 12.1.0, NumPy 2.4.2
- **Git Branch:** `main` (clean working tree with untracked release docs & test scripts)

---

## 3. Dataset 1 Inventory & Baseline

### 3.1 Dataset 1 Location & Structure
- **Absolute Path:** `E:\tekworks_projects\crop\ml_models\disease_detection\dataset_prepared`
- **Total Images:** 2,730 images (100% `.jpg` format)
- **Total Diagnostic Classes:** 39 classes
- **Image Dimensions:** Resized to `(224, 224, 3)`
- **Lineage Records:** `manifest.json`, `exclusion_log.json`, `DATASET_INVENTORY.md`
- **Source Licensing:** PlantVillage (CC BY 4.0), PlantDoc (MIT License), Open Agronomic Rice set (CC BY-SA 4.0)

### 3.2 Dataset 1 Partition Breakdown

| Partition Split | Image Count | Percentage | Purpose |
| :--- | :---: | :---: | :--- |
| **Training Set (`train`)** | 1,560 | 57.1% | Supervised weight training |
| **Validation Set (`val`)** | 390 | 14.3% | Hyperparameter tuning & early stopping |
| **Test Set (`test`)** | 390 | 14.3% | Locked benchmark evaluation |
| **Field-Test Set (`field_test`)** | 390 | 14.3% | Real-world photograph generalization testing |
| **Total** | **2,730** | **100.0%** | **39 Classes (70 images / class)** |

---

## 4. Dataset 2 Verification & Read-Only Audit

### 4.1 Path & Archive Structure Verification
- **Supplied Location:** `E:\tekworks_projects\crop\datasets\archive.zip\Andhra_Master_Dataset`
- **ZIP Verification:** Verified `E:\tekworks_projects\crop\datasets\archive.zip` (Size: 2,176,274,134 bytes / 2.17 GB).
- **Archive Status:** Valid ZIP archive. Top-level item inside archive is root directory `Andhra_Master_Dataset/`.
- **Disk Extraction Status:** **NOT extracted on disk.** Currently remains safely inside `archive.zip` to preserve original state.
- **Recommended Destination for Extraction (Phase 2):** `E:\tekworks_projects\crop\datasets\regional_dataset_2`

### 4.2 Dataset 2 Inventory Breakdown
- **Total Archive Items:** 21,136 items
- **Total Image Files:** **21,135 valid image files** (0 corrupt / empty files detected)
- **Total Class Directories:** **51 distinct class folders**
- **Image Extensions Breakdown:**
  - `.jpg`: 18,367 images
  - `.png`: 2,500 images
  - `.jpeg`: 268 images
  - `.json`: 1 file (metadata)

### 4.3 Dataset 2 Class Directory & Sample Counts

| Class Directory Name | Image Count | Crop Category | Health Status |
| :--- | :---: | :--- | :--- |
| `Banana_Black Sigatoka` | 500 | Banana | Diseased |
| `Banana_Cordana Leaf Spot` | 342 | Banana | Diseased |
| `Banana_Healthy` | 500 | Banana | Healthy |
| `Banana_Panama Disease` | 500 | Banana | Diseased |
| `Chilli_Anthracnose` | 465 | Chilli | Diseased |
| `Chilli_Damping Off` | 168 | Chilli | Diseased |
| `Chilli_Healthy` | 300 | Chilli | Healthy |
| `Chilli_Leaf Curl Virus` | 490 | Chilli | Diseased |
| `Chilli_Leaf Spot` | 490 | Chilli | Diseased |
| `Chilli_Veinal Mottle Virus` | 490 | Chilli | Diseased |
| `Chilli_Whitefly` | 490 | Chilli | Diseased |
| `Chilli_Yellowish` | 490 | Chilli | Diseased |
| `Cotton_Alternaria Leaf Spot` | 500 | Cotton | Diseased |
| `Cotton_Bacterial Blight` | 500 | Cotton | Diseased |
| `Cotton_Fusarium Wilt` | 500 | Cotton | Diseased |
| `Cotton_Healthy` | 500 | Cotton | Healthy |
| `Cotton_Verticillium Wilt` | 500 | Cotton | Diseased |
| `Mango_Anthracnose` | 500 | Mango | Diseased |
| `Mango_Bacterial Canker` | 500 | Mango | Diseased |
| `Mango_Cutting Weevil` | 500 | Mango | Diseased |
| `Mango_Die Back` | 500 | Mango | Diseased |
| `Mango_Gall Midge` | 500 | Mango | Diseased |
| `Mango_Healthy` | 500 | Mango | Healthy |
| `Mango_Powdery Mildew` | 500 | Mango | Diseased |
| `Mango_Sooty Mould` | 500 | Mango | Diseased |
| `Palm_Dryness` | 70 | Oil Palm | Diseased / Stress |
| `Palm_Fungal Disease` | 25 | Oil Palm | Diseased |
| `Palm_Magnesium Deficiency` | 59 | Oil Palm | Nutrient Deficiency |
| `Palm_Scale Insect` | 142 | Oil Palm | Pest Infestation |
| `Rice_Bacterial Leaf Blight` | 460 | Rice | Diseased |
| `Rice_Blast` | 500 | Rice | Diseased |
| `Rice_Brownspot` | 460 | Rice | Diseased |
| `Rice_Healthy` | 500 | Rice | Healthy |
| `Rice_Leaf Scald` | 500 | Rice | Diseased |
| `Rice_Leaf Smut` | 40 | Rice | Diseased |
| `Rice_Sheath Blight` | 500 | Rice | Diseased |
| `Rice_Tungro` | 500 | Rice | Diseased |
| `Tomato_Bacterial Spot` | 500 | Tomato | Diseased |
| `Tomato_Early Blight` | 500 | Tomato | Diseased |
| `Tomato_Healthy` | 500 | Tomato | Healthy |
| `Tomato_Late Blight` | 500 | Tomato | Diseased |
| `Tomato_Leaf Mold` | 500 | Tomato | Diseased |
| `Tomato_Mosaic Virus` | 373 | Tomato | Diseased |
| `Tomato_Septoria Leaf Spot` | 500 | Tomato | Diseased |
| `Tomato_Spider Mites` | 500 | Tomato | Diseased |
| `Tomato_Target Spot` | 500 | Tomato | Diseased |
| `Tomato_Yellow Leaf Curl Virus` | 500 | Tomato | Diseased |
| `Turmeric_Dry Leaf` | 203 | Turmeric | Diseased / Stress |
| `Turmeric_Healthy` | 197 | Turmeric | Healthy |
| `Turmeric_Leaf Blotch` | 199 | Turmeric | Diseased |
| `Turmeric_Rhizome Rot` | 182 | Turmeric | Diseased |
| **Total** | **21,135** | **8 Crop Families** | **51 Classes** |

---

## 5. Existing Model Audit (`disease_model.h5`)

### 5.1 Architecture & Weights
- **Model Checkpoint:** `ml_models/disease_detection/disease_model.h5` (42.87 MB)
- **Crop Classifier Checkpoint:** `ml_models/disease_detection/crop_classifier.h5` (17.59 MB)
- **Backbone Architecture:** Pretrained `EfficientNetB0`
- **Head Structure:** `GlobalAveragePooling2D` -> `BatchNormalization` -> `Dense(512, ReLU)` -> `Dropout(0.4)` -> `Dense(256, ReLU)` -> `Dropout(0.3)` -> `Dense(39, Softmax)`
- **Input Dimensions:** `(224, 224, 3)`
- **Class Output Units:** Fixed at 39 units

### 5.2 Resumability Assessment
- **Training State:** Saved as HDF5 model weights.
- **Resumability Conclusion:** The checkpoint contains weights trained specifically for 39 output classes. It **cannot directly predict or evaluate the 51 classes of Dataset 2** without creating a unified taxonomy and replacing the final `Dense(39)` layer with an expanded classification head (`Dense(N_unified)`).

---

## 6. Existing Prediction Pipeline Audit

The pipeline processes user uploads via `backend/app/routes/predict.py`:
1. **Upload & Image Decoding:** File bytes read into Memory; OpenCV `cv2.imdecode` decodes BGR matrix; PIL loads RGB image.
2. **OpenCV Preprocessing:** `validate_leaf_image` performs adaptive HSV foliage segmentation (green, yellow, brown masks with skin/document rejection filters). `analyze_lesion_masking` detects necrotic spots and draws bounding boxes.
3. **Neural Model Inference:** PIL image resized to 224x224 RGB, expanded to shape `(1, 224, 224, 3)`, and passed to `c_model.predict()`.
4. **Hierarchical Resolution:** `resolve_target_crop()` identifies the crop species family. Matching crop class probabilities are aggregated and in-crop normalized to calculate reliable confidence scores.
5. **Knowledge Base Mapping:** `get_disease_info()` retrieves 18 schema attributes from `disease_info.py` (PJTSAU Telangana & ICAR sources, symptoms, 14-day plans, pesticide safety disclaimers).
6. **Frontend Result Rendering:** React `DiseaseDetection.jsx` renders original leaf vs. lesion mask, symptoms, remedies, 14-day schedule, and telemetry pills.

---

## 7. Class Label Mapping Conflicts & Taxonomy Risks

### 7.1 Key Overlaps & Synonyms Between Dataset 1 and Dataset 2

| Crop | Dataset 1 Class Name | Dataset 2 Class Name | Alignment Action Required for Phase 2 |
| :--- | :--- | :--- | :--- |
| **Rice** | `Rice___Blast` | `Rice_Blast` | Standardize delimiter syntax (`___` vs `_`). Map as exact match. |
| **Rice** | `Rice___Bacterial_leaf_blight` | `Rice_Bacterial Leaf Blight` | Map as exact match. |
| **Rice** | `Rice___healthy` | `Rice_Healthy` | Map as exact match. |
| **Tomato**| `Tomato___Early_blight` | `Tomato_Early Blight` | Map as exact match. |
| **Tomato**| `Tomato___Late_blight` | `Tomato_Late Blight` | Map as exact match. |
| **Tomato**| `Tomato___Bacterial_spot` | `Tomato_Bacterial Spot` | Map as exact match. |
| **Tomato**| `Tomato___Leaf_Mold` | `Tomato_Leaf Mold` | Map as exact match. |
| **Tomato**| `Tomato___Septoria_leaf_spot` | `Tomato_Septoria Leaf Spot` | Map as exact match. |
| **Tomato**| `Tomato___Spider_mites...` | `Tomato_Spider Mites` | Map as exact match. |
| **Tomato**| `Tomato___Target_Spot` | `Tomato_Target Spot` | Map as exact match. |
| **Tomato**| `Tomato___Tomato_Yellow_Leaf_Curl_Virus` | `Tomato_Yellow Leaf Curl Virus` | Map as exact match. |
| **Tomato**| `Tomato___Tomato_mosaic_virus` | `Tomato_Mosaic Virus` | Map as exact match. |
| **Tomato**| `Tomato___healthy` | `Tomato_Healthy` | Map as exact match. |
| **Cotton**| `Cotton___Bacterial_blight` | `Cotton_Bacterial Blight` | Map as exact match. |
| **Cotton**| `Cotton___healthy` | `Cotton_Healthy` | Map as exact match. |

### 7.2 Completely New Classes Introduced by Dataset 2
Dataset 2 adds **31 new regional disease and crop classes**:
- **Banana (4 classes):** Black Sigatoka, Cordana Leaf Spot, Healthy, Panama Disease
- **Chilli (8 classes):** Anthracnose, Damping Off, Healthy, Leaf Curl Virus, Leaf Spot, Veinal Mottle Virus, Whitefly, Yellowish
- **Cotton (3 new classes):** Alternaria Leaf Spot, Fusarium Wilt, Verticillium Wilt
- **Mango (9 classes):** Anthracnose, Bacterial Canker, Cutting Weevil, Die Back, Gall Midge, Healthy, Powdery Mildew, Sooty Mould
- **Oil Palm (4 classes):** Dryness, Fungal Disease, Magnesium Deficiency, Scale Insect
- **Rice (5 new classes):** Brownspot, Leaf Scald, Leaf Smut, Sheath Blight, Tungro
- **Turmeric (4 classes):** Dry Leaf, Healthy, Leaf Blotch, Rhizome Rot

---

## 8. Technical Risks & Hardware Limitations

1. **Storage Constraint on Drive E:** Drive E has **13.8 GB free space**. Extracting Dataset 2 (21,135 images) will consume ~2.5 GB. Extracting to `E:\tekworks_projects\crop\datasets\regional_dataset_2` is feasible, but dataset caching must be managed carefully.
2. **CPU Training Speed:** Training TensorFlow 2.21 on CPU (no GPU available on native Windows) requires controlled batch sizes and sub-sampling/stratified sampling during Phase 3 to complete within reasonable time limits.
3. **Class Imbalance:** Dataset 2 has class counts ranging from 25 images (`Palm_Fungal Disease`) to 500 images (`Rice_Blast`, `Mango_Anthracnose`). Stratified partitioning and class weighting are mandatory.

---

## 9. Recommended Next Steps for Phase 2

1. **Safe Extraction of Dataset 2:** Extract `archive.zip` into `E:\tekworks_projects\crop\datasets\regional_dataset_2` without overwriting existing files.
2. **Unified Taxonomy Creation:** Build a canonical mapping table merging Dataset 1 (39 classes) and Dataset 2 (51 classes) into a unified multi-crop taxonomy.
3. **Data Cleaning & Deduplication:** Run perceptual hash (aHash / MD5) deduplication across combined datasets to prevent data leakage between train/val/test splits.
4. **Stratified 4-Way Partitioning:** Split combined data into Train (60%), Validation (15%), Test (15%), and Field-Test (10%) splits with a generated `manifest.json`.

---

## 10. Phase 1 Verification Gate Table

| Verification Item | Status | Evidence | Report Location | Remaining Issues |
| :--- | :---: | :--- | :--- | :--- |
| **A. Actual project root established** | **PASS** | Verified `E:\tekworks_projects\crop` with `backend/app/main.py` and `frontend/src/App.jsx`. | Section 2.1 | None |
| **B. Current runtime & ML framework identified** | **PASS** | Python 3.13.14, TensorFlow 2.21.0, Windows 11, CPU execution, 16GB RAM. | Section 2.2 | GPU unavailable on native Windows TF |
| **C. Dataset 1 identified from evidence** | **PASS** | Located at `ml_models/disease_detection/dataset_prepared` (2,730 images, 39 classes). | Section 3 | None |
| **D. Dataset 2 located & path verified** | **PASS** | Verified `E:\tekworks_projects\crop\datasets\archive.zip` (2.17 GB, top-level `Andhra_Master_Dataset/`). | Section 4.1 | Not extracted yet (planned for Phase 2) |
| **E. Class structure inventoried separately** | **PASS** | Dataset 1: 39 classes (70 img/class). Dataset 2: 51 classes (21,135 total images). | Sections 3.2 & 4.3 | Naming convention syntax differences (`___` vs `_`) |
| **F. Model checkpoint & class mapping identified** | **PASS** | `disease_model.h5` (39 output units, EfficientNetB0), `class_indices.json`. | Section 5 | Output layer needs expansion for 51+ classes |
| **G. Current inference workflow documented** | **PASS** | `predict.py` endpoint traced through HSV segmentation, model inference, and React UI rendering. | Section 6 | None |
| **H. No dataset, model, or code modified** | **PASS** | Working directory inspected in 100% read-only mode. No deletions or edits performed. | Section 1 | None |
| **I. No destructive training performed** | **PASS** | No model training or file overwriting executed. | Section 1 | None |
| **J. Audit report exists with evidence** | **PASS** | Report created at `docs/TWO_DATASET_PHASE_1_AUDIT_REPORT.md`. | `docs/` directory | Awaiting user review & approval for Phase 2 |

---

**Phase 1 Gate Status:** **ALL 10 MANDATORY CHECKS PASSED (PASS)**  
*Next Action: Await user review and approval before proceeding to Phase 2.*
