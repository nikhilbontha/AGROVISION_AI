# AGROVISION AI - PHASE 0: AUDIT & BASELINE VERIFICATION REPORT

**Date:** October 10, 2026  
**System:** AgroVision AI — Crop Disease Detection & Yield Prediction System  
**Audit Conducted By:** Senior Computer Vision Engineer & AI Systems Architect  
**Status:** COMPLETE (Phase 0 Verification Gate Passed)

---

## 1. Actual Project Environment

### Frontend
- **Framework:** React 19 (`react` 19.2.6, `react-dom` 19.2.6) with Vite 8 (`vite` 8.0.13)
- **Styling:** Vanilla CSS & Tailwind CSS 3 (`tailwindcss` 3.4.19), Framer Motion 12 (`framer-motion` 12.39.0), Lucide React (`lucide-react` 1.25.0)
- **Language:** JavaScript (JSX, ES Modules)
- **Package Manager:** `npm` (`package.json` at `frontend/package.json`)
- **HTTP Client:** Axios (`axios` 1.16.1) pointing to `http://localhost:8000` via `frontend/src/api.js`
- **Entry Points:** `frontend/src/main.jsx`, `frontend/src/App.jsx`
- **Active Dev Server:** `vite` (running on local dev port)

### Backend
- **Framework:** FastAPI (`fastapi` 0.115+) with `uvicorn` web server
- **Language:** Python 3.10+
- **Package Manager:** `pip` (`backend/requirements.txt`)
- **Database:** MongoDB (Async connection via `motor` to local/remote MongoDB instance)
- **Security & Auth:** JWT tokens (`python-jose`, `passlib` with `bcrypt`)
- **API Entry Points:** `backend/app/main.py`, `backend/app/routes/predict.py`, `backend/app/routes/auth.py`, `backend/app/routes/dashboard.py`, `backend/app/routes/history.py`, `backend/app/routes/assistant.py`

### AI / ML Ecosystem & Installed Versions
- **Deep Learning Framework:** TensorFlow 2.18 / CPU (`tensorflow-cpu`)
- **Computer Vision:** OpenCV (`opencv-python-headless` 4.x), Pillow (`pillow` 10.x)
- **Machine Learning / Data Science:** Scikit-Learn (`scikit-learn`), Joblib (`joblib`), NumPy (`numpy`), Pandas (`pandas`)

### Storage & Persistence
- **Database Collections:** MongoDB `users`, `disease_collection`, `yield_collection`, `history_collection`
- **Model Storage:** Local disk (`ml_models/disease_detection/`, `ml_models/leaf_detection/`, `ml_models/yield_prediction/`)

---

## 2. Repository Structure

```
crop/
├── .gitignore
├── README.md
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── render.yaml
│   ├── requirements.txt
│   ├── scratch_test.py
│   ├── app/
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── admin.py
│   │   │   ├── assistant.py
│   │   │   ├── auth.py
│   │   │   ├── dashboard.py
│   │   │   ├── history.py
│   │   │   └── predict.py
│   │   ├── schemas/
│   │   │   └── schemas.py
│   │   ├── services/
│   │   │   ├── assistant_service.py
│   │   │   ├── market_service.py
│   │   │   ├── weather_service.py
│   │   │   └── yield_engine.py
│   │   └── utils/
│   │       ├── disease_info.py
│   │       ├── image_utils.py
│   │       └── security.py
│   ├── scripts/
│   └── tests/
│       ├── test_api.py
│       ├── test_disease_prediction.py
│       ├── test_predict.py
│       ├── test_realworld_diseases.py
│       └── test_yield_engine.py
├── datasets/
│   ├── crop_yield.csv
│   └── synthetic_plant_village/
├── docs/
│   ├── AGROVISION AI.pptx
│   ├── AgroVision_Project_Report.md
│   ├── Research_Paper_AgroVision_AI.md
│   ├── TRAINING_GUIDE.md
│   ├── presentation.md
│   ├── project_briefing.md
│   └── project_documentation.md
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── api.js
│       ├── index.css
│       ├── main.jsx
│       ├── admin/
│       ├── components/
│       ├── context/
│       ├── i18n/
│       └── pages/
│           ├── Dashboard.jsx
│           ├── DiseaseDetection.jsx
│           ├── Home.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           └── YieldPrediction.jsx
└── ml_models/
    ├── disease_detection/
    │   ├── class_indices.json
    │   ├── crop_classifier.h5
    │   ├── crop_indices.json
    │   ├── disease_model.h5
    │   ├── evaluation_report.json
    │   ├── train.py
    │   ├── train_realworld_model.py
    │   ├── dataset_prepared/
    │   │   ├── train/
    │   │   ├── val/
    │   │   ├── test/ (390 images)
    │   │   └── field_test/ (390 images)
    │   └── scripts/
    ├── leaf_detection/
    │   ├── leaf_model.h5
    │   └── train.py
    └── yield_prediction/
        └── yield_model.pkl
```

---

## 3. Current Model Architecture

1. **Disease Detection Model (`ml_models/disease_detection/disease_model.h5`):**
   - **Backbone:** Transfer Learning with `EfficientNetB0` (ImageNet pretrained weights)
   - **Custom Head:** `GlobalAveragePooling2D` -> `BatchNormalization` -> `Dense(512, swish)` -> `Dropout(0.4)` -> `Dense(256, swish)` -> `Dropout(0.3)` -> `Dense(39, softmax)`
   - **Loss Function:** Categorical Crossentropy with label smoothing (`0.1`)
   - **Input Dimensions:** `(224, 224, 3)`, float32 array in RGB format
   - **Output Dimension:** `39` classes

2. **Crop Classifier (`ml_models/disease_detection/crop_classifier.h5`):**
   - **Output Dimension:** `11` crop family classes (`Apple`, `Corn`, `Cotton`, `Grape`, `Non_Plant`, `Orange`, `Pepper`, `Potato`, `Rice`, `Tomato`, `Wheat`)

3. **Leaf Detection Model (`ml_models/leaf_detection/leaf_model.h5`):**
   - Binary leaf segmentation model

4. **Yield Prediction Model (`ml_models/yield_prediction/yield_model.pkl`):**
   - Scikit-Learn `RandomForestRegressor` model trained on `datasets/crop_yield.csv`

---

## 4. Dataset and Class Inventory

### Class Indices (`class_indices.json` - 39 Classes Total)

| Index | Class Name | Target Crop | Pathogen / Condition |
| shadow | | | |
| 0 | `Apple___Apple_scab` | Apple | Apple Scab |
| 1 | `Apple___Black_rot` | Apple | Black Rot |
| 2 | `Apple___Cedar_apple_rust` | Apple | Cedar Apple Rust |
| 3 | `Apple___healthy` | Apple | Healthy |
| 4 | `Corn___Cercospora_leaf_spot Gray_leaf_spot` | Corn | Cercospora Gray Leaf Spot |
| 5 | `Corn___Common_rust` | Corn | Common Rust |
| 6 | `Corn___Northern_Leaf_Blight` | Corn | Northern Leaf Blight |
| 7 | `Corn___healthy` | Corn | Healthy |
| 8 | `Cotton___Bacterial_blight` | Cotton | Bacterial Blight |
| 9 | `Cotton___healthy` | Cotton | Healthy |
| 10 | `Grape___Black_rot` | Grape | Black Rot |
| 11 | `Grape___Esca_(Black_Measles)` | Grape | Esca (Black Measles) |
| 12 | `Grape___Leaf_blight_(Isariopsis_Leaf_Spot)` | Grape | Leaf Blight (Isariopsis Spot) |
| 13 | `Grape___healthy` | Grape | Healthy |
| 14 | `Non_Plant___Unsupported` | Non_Plant | Out of Distribution / Non-Plant |
| 15 | `Orange___Haunglongbing_(Citrus_greening)` | Orange | Citrus Greening |
| 16 | `Orange___healthy` | Orange | Healthy |
| 17 | `Pepper,_bell___Bacterial_spot` | Pepper | Bacterial Spot |
| 18 | `Pepper,_bell___healthy` | Pepper | Healthy |
| 19 | `Potato___Early_blight` | Potato | Early Blight |
| 20 | `Potato___Late_blight` | Potato | Late Blight |
| 21 | `Potato___healthy` | Potato | Healthy |
| 22 | `Rice___Bacterial_leaf_blight` | Rice | Bacterial Leaf Blight |
| 23 | `Rice___Blast` | Rice | Rice Blast |
| 24 | `Rice___healthy` | Rice | Healthy |
| 25 | `Tomato___Bacterial_spot` | Tomato | Bacterial Spot |
| 26 | `Tomato___Early_blight` | Tomato | Early Blight |
| 27 | `Tomato___Late_blight` | Tomato | Late Blight |
| 28 | `Tomato___Leaf_Mold` | Tomato | Leaf Mold |
| 29 | `Tomato___Septoria_leaf_spot` | Tomato | Septoria Leaf Spot |
| 30 | `Tomato___Spider_mites Two-spotted_spider_mite` | Tomato | Spider Mites |
| 31 | `Tomato___Target_Spot` | Tomato | Target Spot |
| 32 | `Tomato___Tomato_Yellow_Leaf_Curl_Virus` | Tomato | Yellow Leaf Curl Virus |
| 33 | `Tomato___Tomato_mosaic_virus` | Tomato | Mosaic Virus |
| 34 | `Tomato___healthy` | Tomato | Healthy |
| 35 | `Wheat___Leaf_rust` | Wheat | Leaf Rust |
| 36 | `Wheat___Powdery_mildew` | Wheat | Powdery Mildew |
| 37 | `Wheat___Stripe_rust` | Wheat | Stripe Rust |
| 38 | `Wheat___healthy` | Wheat | Healthy |

---

## 5. End-to-End Image Upload & Inference Workflow Tracing

1. **Frontend File Selection:** User selects image via drag-and-drop, file picker, or web camera in `DiseaseDetection.jsx`. `processFile()` sets `selectedFile` and creates `previewUrl`.
2. **Frontend Validation:** Only basic MIME type check (`file.type.startsWith('image/')`).
3. **API Request Construction:** `FormData` created with `file` and `crop_type` (`"Auto-Detect"` or specific crop name). Sent via POST to `/predict/predict-disease?lang=en`.
4. **Backend Image Decoding:** `contents = await file.read()`. OpenCV decodes bytes to BGR matrix `cv_img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)`. Original image converted to Base64 PNG string.
5. **Leaf Validation (`validate_leaf_image`):** Adaptive HSV color masking checks foliage green/yellow/brown ratio against thresholds. If foliage ratio < 0.02, returns `success: False` with `NON_CROP_IMAGE`.
6. **Crop Resolution (`resolve_target_crop`):**
   - Priority 1: User selection dropdown.
   - Priority 2: Keyword match in `filename` (e.g. `rice`, `wheat`, `corn`, `tomato`).
   - Priority 3: Model probability aggregation across crop families (weighting disease classes 2.5x if lesion spots detected).
   - Priority 4: OpenCV HSV fruit/cob masks.
   - Fallback: Defaults to `"Tomato"` if score < 0.15.
7. **Model Checkpoint Loading:** `get_disease_model()` lazy-loads `ml_models/disease_detection/disease_model.h5` and `class_indices.json`.
8. **Neural Network Preprocessing:** `PIL.Image.open(io.BytesIO(contents)).convert('RGB').resize((224, 224))`. `tf.keras.preprocessing.image.img_to_array()` generates shape `(1, 224, 224, 3)` with float32 values `[0.0, 255.0]`.
9. **Inference & Prediction Filtering:**
   - Raw softmax array `raw_preds = c_model.predict(img_arr)[0]` extracted.
   - Backend iterates over `raw_preds` sorted by probability and filters strictly for classes where `c_fam == target_crop`.
   - **OpenCV Disease Force Rule:** If OpenCV HSV mask detects spot contours (`is_spotted == True`), backend **ignores** `"healthy"` top predictions and forces the top disease class within `target_crop`.
10. **Confidence Calculation:** Overridden with hardcoded floors: `cnn_confidence = max(best_prob * 100.0, 88.5)`, `confidence_score = round(max(cnn_confidence, 88.5), 1)`, `crop_confidence = 98.6`.
11. **API Response Generation:** Result dictionary constructed with `crop`, `disease_info`, Base64 original/processed images, symptoms, treatments from `disease_info.py`. Database record inserted into MongoDB `disease_collection`.
12. **Frontend Result Rendering:** `setResult(response.data)` renders tabbed diagnostic dashboard (Overview, Cause, Treatment, Timeline, Probabilities) with audio speech synthesis and print option.

---

## 6. Confirmed Root Causes of Classification Failures

1. **Rule-Based OpenCV Lesion Spot Forcing Overriding Neural Network:**
   - In `predict.py` (lines 526-534), whenever OpenCV HSV color segmentation detects any brown/yellow specks (`is_spotted = True`), the code **overrides the neural network's top prediction if it was "healthy"** and forces the prediction to a disease class. This causes healthy leaves with slight soil specks, water spots, or natural yellowing to be wrongly declared diseased.

2. **Crop Family Aggregation Bias Towards Tomato:**
   - In `resolve_target_crop` (lines 193-206), `crop_family_scores` sums raw probability values across all classes of each crop. Because Tomato has 9 classes in `class_indices.json` while Wheat/Corn/Rice have only 3 or 4 classes, Tomato accumulates a larger cumulative probability sum, causing Auto-Detect to heavily bias towards Tomato. Furthermore, the fallback return at line 232 is hardcoded to `"Tomato"`.

3. **Artificial & Overridden Confidence Scores:**
   - Regardless of actual model softmax probabilities (which may be low, e.g. 15%-30%), the backend forces `cnn_confidence = max(best_prob * 100.0, 88.5)` and `crop_confidence = 98.6`. This creates false user confidence in inaccurate predictions.

4. **Low Underlying Model Accuracy (~30.5%):**
   - The current `disease_model.h5` checkpoint has an overall top-1 accuracy of only **30.51%** on the test dataset (119 correct out of 390 images). The model frequently confuses Apple, Grape, and Potato as Tomato, and confuses Wheat Stripe Rust with Wheat Leaf Rust.

5. **Heuristic Hardcoded Fallbacks for Unsupported/Low-Confidence Crops:**
   - Lines 542-566 in `predict.py` contain hardcoded conditional statements: e.g., `if target_crop == "Wheat": predicted_key = "Wheat___Stripe_rust" if is_spotted else "Wheat___healthy"`. This bypasses model inference entirely and outputs static guess strings based on binary spot presence.

6. **Image Preprocessing Inconsistency:**
   - In `train.py` / `train_realworld_model.py`, `ImageDataGenerator` was trained on raw `[0, 255]` pixel ranges without `rescale=1./255`. However, test scripts (`test_predict.py`) applied `/ 255.0` normalization.

---

## 7. Suspected Issues Requiring Further Testing

1. **Lack of Contrast / Sunlight Normalization during Field Camera Capture:**
   - Real-world photos taken under direct sunlight vs cloud shade exhibit significant color temperature variance, affecting OpenCV HSV thresholding.
2. **Out-of-Distribution (OOD) Non-Plant Images:**
   - `validate_leaf_image` uses HSV heuristic bounds; complex non-plant textures (e.g., green fabrics, printed paper) can bypass HSV validation.

---

## 8. Baseline Test Results

Evaluation executed on the official 390-image test set (`ml_models/disease_detection/dataset_prepared/test`, 10 images per class across 39 classes):

### Raw Model Evaluation (`disease_model.h5`)
- **Total Tested Images:** 390
- **Raw Top-1 Disease Classification Accuracy:** **119 / 390 (30.51%)**
- **Raw Crop Identification Accuracy:** **207 / 390 (53.08%)**
- **Top Crop Misclassifications:**
  - Apple -> Tomato: 17 images
  - Grape -> Tomato: 14 images
  - Potato -> Tomato: 14 images
  - Orange -> Pepper: 12 images
  - Tomato -> Grape: 12 images
- **Top Disease Misclassifications:**
  - Wheat Stripe Rust -> Wheat Leaf Rust: 10 images
  - Corn Cercospora Gray Leaf Spot -> Corn Northern Leaf Blight: 7 images
  - Tomato Mosaic Virus -> Tomato Yellow Leaf Curl Virus: 7 images
  - Wheat Healthy -> Rice Blast: 7 images
  - Citrus Greening -> Pepper Healthy: 6 images

### End-to-End Backend Pipeline Evaluation (`predict_disease` in `predict.py`)
- **Total Tested Images:** 390
- **End-to-End Disease Accuracy:** **168 / 390 (43.08%)**
- **End-to-End Crop Identification Accuracy:** **380 / 390 (97.44%)** (Boosted by filename/target crop filtering heuristics)
- **Non-Leaf Image Rejections:** 3 / 390

---

## 9. Files Eligible for Cleanup (In Subsequent Phases)

- `backend/scratch_test.py` (Temporary evaluation script)
- `backend/tests/test_predict.py` (Stale test script with mismatched scaling)
- `ml_models/disease_detection/legacy_backup/` (Obsolete checkpoints)
- `ml_models/disease_detection/scripts/generate_data.py` (Unused mock data generator)

---

## 10. Files That Must Be Preserved (Protected Core)

### Crop Yield Prediction Engine (MUST NOT BE MODIFIED)
- `backend/app/services/yield_engine.py`
- `backend/app/services/market_service.py`
- `backend/app/services/weather_service.py`
- `backend/app/schemas/schemas.py` (`YieldRequest`)
- `ml_models/yield_prediction/yield_model.pkl`
- `datasets/crop_yield.csv`
- `frontend/src/pages/YieldPrediction.jsx`

### Application Infrastructure & Admin Features (MUST NOT BE MODIFIED)
- `backend/app/routes/auth.py`
- `backend/app/routes/dashboard.py`
- `backend/app/routes/history.py`
- `backend/app/routes/admin.py`
- `backend/app/routes/assistant.py`
- `backend/app/database.py`
- `frontend/src/admin/` (All admin panel routes and components)
- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/pages/Home.jsx`
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/Register.jsx`

---

## 11. Recommended Rebuild Architecture (Phase 1 & Phase 2 Vision)

1. **Two-Stage Modular Architecture:**
   - **Stage 1 (Crop Family Classifier):** Dedicated EfficientNet / ConvNeXt backbone trained specifically to classify crop species with >98% precision.
   - **Stage 2 (Crop-Specific Disease Classifiers):** Dedicated fine-tuned heads for each crop species (e.g. Wheat Classifier, Rice Classifier, Tomato Classifier), eliminating cross-crop confusion.
2. **True Out-of-Distribution (OOD) Abstention Network:**
   - Replace brittle HSV heuristic checks with a trained MobileNetV3 / ResNet leaf validation binary classifier or Mahalanobis distance / softmax entropy thresholding.
3. **Clean End-to-End Probability Pipeline:**
   - Remove heuristic hardcoded overrides, artificial confidence minimums, and OpenCV rule-based healthy-to-disease forcing.

---

## 12. Required Hardware and Dependencies

- **Hardware:** Standard CPU (Intel Core i5/i7 or AMD Ryzen) or CUDA-enabled GPU (NVIDIA RTX 3060+) for model training.
- **Python Dependencies:** `tensorflow-cpu` (or `tensorflow`), `opencv-python-headless`, `scikit-learn`, `numpy`, `pillow`, `fastapi`, `uvicorn`.

---

## 13. Proposed Phase-by-Phase Implementation Plan

- **Phase 0:** Audit & Baseline Verification **(CURRENT PHASE — COMPLETED)**
- **Phase 1:** Dataset Preparation, Cleaning & Stratified Re-split
- **Phase 2:** Two-Stage Modular AI Model Retraining & Evaluation
- **Phase 3:** Backend Inference Pipeline Overhaul & Anti-Hallucination Cleaning
- **Phase 4:** End-to-End System Verification, Testing & UI Calibration

---

## 14. Phase 0 Verification Gate Verdicts

| Verification Item | Status | Notes / Evidence |
| :--- | :---: | :--- |
| **1. Actual project environment documented** | **PASS** | React 19/Vite 8 frontend, FastAPI/Python 3.10 backend, TensorFlow 2.18/EfficientNetB0, MongoDB fully audited. |
| **2. Current inference workflow traced** | **PASS** | 12-step trace from `DiseaseDetection.jsx` file pick to `predict.py` processing, OpenCV masking, and UI rendering. |
| **3. Model & class mappings identified** | **PASS** | `disease_model.h5` (39 classes), `crop_classifier.h5` (11 crops), `class_indices.json` documented. |
| **4. Baseline tests reported honestly** | **PASS** | Evaluated on 390 test images: Raw Model Accuracy = **30.51%**, Pipeline Accuracy = **43.08%**. Confirmed confusions documented. |
| **5. Cleanup targets listed** | **PASS** | Isolated stale scripts (`scratch_test.py`, `legacy_backup/`). No files deleted in Phase 0. |
| **6. Protected components identified** | **PASS** | Yield Prediction engine (`yield_engine.py`, `yield_model.pkl`), Admin panel, Auth, and Dashboard strictly marked for protection. |

**OVERALL PHASE 0 VERDICT: PASS**
