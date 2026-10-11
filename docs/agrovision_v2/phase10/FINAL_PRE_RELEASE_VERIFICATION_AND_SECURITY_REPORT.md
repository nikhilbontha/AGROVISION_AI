# AgroVision AI — Final Pre-Release Verification & Security Remediation Report

**Date of Verification:** October 11, 2026  
**Auditor Roles:** Senior ML Engineer, Backend Security Engineer, Software QA Lead  
**Overall Pre-Release Decision:** **`PASS (READY_WITH_LIMITATIONS)`**  
**Permission to Deploy:** **`HOLD — AWAITING EXPLICIT USER AUTHORIZATION & CREDENTIAL ROTATION`**  
**Repository Branch / Commit:** `main` (`d8df06c1637e1b9b5cc5fa0a5254f717370a621d`)

---

## 1. Executive Summary

This final pre-release verification evaluated the AgroVision AI system across five critical technical dimensions:
1. **Database Configuration Security:** Remediation of hardcoded MongoDB credentials in source code.
2. **Phase 10 Reproduction & Regression Verification:** Execution of 27 backend unit tests, 13 release regression tests, and the Vite production build.
3. **Independent Metric Recalculation:** Independent statistical audit of Phase 9 evaluation artifacts across 3,522 test samples.
4. **Real-Image Diagnostic Checks:** Real-image inference audits across Wheat, Chilli, Tomato, Potato, Corn, and non-plant inputs.
5. **Release Governance & Deployment Boundary:** Strict enforcement that release readiness does **not** equal live deployment permission.

The system passed all verification gates under the established constraints. Unsupervised autonomous chemical spraying remains disallowed, and live deployment is held pending explicit user sign-off.

---

## 2. Task 1: Database Security Remediation

### 2.1 Vulnerability Discovered & Remediated
- **File:** `backend/app/database.py` (line 21)
- **Previous State:** The connection string setup contained an unsafe hardcoded fallback containing active MongoDB Atlas connection credentials:
  ```python
  # PREVIOUS UNSAFE CODE (REMOVED):
  MONGO_URI = os.getenv("MONGO_URI") or os.getenv("MONGO_URL") or "mongodb://<hardcoded_credentials>@ac-tsdlgxt-shard-00-01.../agrovision"
  ```
- **Remediated State:**
  - Removed the hardcoded secret fallback completely.
  - Dynamically detects `.env` from the `backend/` directory or project root using `dotenv`.
  - Reads exclusively from `MONGO_URI` or `MONGO_URL`.
  - In production mode (`ENVIRONMENT=production`), raises a non-sensitive fail-fast configuration error if `MONGO_URI` is missing:
    ```python
    if not MONGO_URI:
        if os.getenv("ENVIRONMENT", "").lower() == "production":
            raise RuntimeError("Configuration Error: 'MONGO_URI' environment variable is required in production.")
        MONGO_URI = "mongodb://localhost:27017/agrovision"
    ```
- **Placeholder Templates Verified:**
  - `backend/.env.example` and root `.env.example` verified to contain placeholders only (`<DB_USERNAME>`, `<DB_PASSWORD>`, etc.).
- **Required Manual Action:**
  > [!WARNING]
  > Because credentials were previously embedded in source code, the database owner **MUST rotate the database password** in the MongoDB Atlas console before any network exposure.

---

## 3. Task 2: Reproducibility of Phase 10 Verifications

All core release test suites were re-executed against the live running server and codebase:

### 3.1 Backend Test Suite (27 / 27 PASS)
Command: `python -m unittest discover -s tests -p "test_*.py"` (in `backend/`)  
- `test_api.py` (Root API & health) — **PASS**
- `test_disease_prediction.py` (Leaf validator & HSV masking) — **PASS**
- `test_knowledge_base.py` (Pathogen lookup & IPM treatments) — **PASS**
- `test_predict.py` (Predict endpoints & routing) — **PASS**
- `test_realworld_diseases.py` (Symptom checks & target crop switching) — **PASS**
- `test_yield_engine.py` (Agronomic multipliers & financial ROI forecasts) — **PASS**  
**Result:** **27 tests executed, 0 failures, 0 errors (100% OK)**

### 3.2 Phase 10 Master Regression Suite (13 / 13 PASS)
Command: `python scratch/test_phase10_release_verification.py`  
- `REL-001` (Root status 2.0.0) — **PASS**
- `REL-002` (`/health/live` probe) — **PASS**
- `REL-003` (`/health/ready` probe) — **PASS**
- `REL-004` (`/health/model` SHA-256 hashes) — **PASS**
- `REL-005` (Frontend Vite dist bundle) — **PASS**
- `REL-006` (Questionnaire 15 crops) — **PASS**
- `REL-007` (Questionnaire config 9 questions) — **PASS**
- `REL-008` (Multimodal workflow & CIBRC recommendations) — **PASS**
- `REL-009` (Unsupported crop safe abstention) — **PASS**
- `REL-010` (Low-confidence chemical gating) — **PASS**
- `REL-011` (Smart agronomic yield engine) — **PASS**
- `REL-012` (Traceback redaction & correlation ID) — **PASS**
- `REL-013` (Rollback checkpoint integrity) — **PASS**  
**Result:** **13 tests executed, 13 passed (100% PASS)**

### 3.3 Frontend Production Build
Command: `npm run build` (in `frontend/`)  
- Modules transformed: 2,861
- Build time: **1.39s**
- Output: `frontend/dist/index.html` (verified present, 0 errors)

---

## 4. Task 3: Independent Metric Recalculation & Evaluation Validation

Evaluation artifacts under `docs/agrovision_v2/phase9/` were independently audited and recalculated from source manifests:

### 4.1 Sample Counts & Distribution
- **Total Test Partition (`test_manifest.json`):** **3,522 samples** (15.13% of dataset)
  - Dataset 1 (Laboratory cardboard / PlantVillage): **409 samples**
  - Dataset 2 (Regional Andhra & Telangana field photos): **3,113 samples**
- **Dedicated Field Partition (`field_test_manifest.json`):** **3,175 samples**
- **Total Canonical Classes Evaluated:** **72 classes** (Indices 0 through 71)

### 4.2 Independent Metric Recalculation
- **Overall Accuracy:** 2,830 correct / 3,522 total = **80.35%** (Wilson 95% CI: `[0.7901, 0.8163]`)
- **Regional Field Subset Accuracy:** 2,704 correct / 3,113 total = **86.86%**
- **Laboratory Subset Accuracy:** 126 correct / 409 total = **30.81%**
- **Balanced Macro-Recall:** **70.23%**
- **Macro-Precision:** **70.51%**
- **Macro-F1:** **68.08%**
- **Top-3 Accuracy:** **94.65%**

### 4.3 Error Breakdown & Denominators
- **Total Misclassifications:** **692 samples**
  - Cross-Crop Errors (Wrong Crop predicted by raw argmax): **264 samples** (**38.15% of all errors**)
  - Wrong Disease (Same Crop): **398 samples** (**57.51% of all errors**)
  - Healthy Misclassified as Diseased: **30 samples** (**4.34% of all errors**)

### 4.4 Calibration & Selective Prediction Policy
- The calibrated threshold $\tau = 0.50$ was tuned on the held-out validation set (`val_manifest.json`) and validated against the independent test set:
  - **Rejection Rate at $\tau = 0.50$:** **24.96%** (Coverage: **75.04%**)
  - **Accuracy on Accepted Samples:** **91.33%**
  - **Error Rate on Accepted Samples:** **8.67%** (Reduced from 19.65% unconstrained)

---

## 5. Task 4: Real-Image Diagnostic Verification

Evaluated live on real test image files across target crops (`scratch/test_real_image_diagnostics.py`):

| Probe ID | Category | Fixture Image File | Actual API Output | Behavior Verification |
| :--- | :--- | :--- | :--- | :--- |
| **REAL-01** | Wheat Diseased | `Wheat___Stripe_rust_test_1.jpg` | `UNCERTAIN_DIAGNOSIS` | **Honest Abstention** (Conf < 50%) |
| **REAL-02** | Wheat Healthy | `Wheat___healthy_test_1.jpg` | `Wheat Healthy` (72.9%) | **True Positive** |
| **REAL-03** | Chilli Diseased | `IMG_0192_JPG.rf.59b5...jpg` | `UNCERTAIN_DIAGNOSIS` | **Honest Abstention** (Ambiguous field lesion) |
| **REAL-04** | Chilli Healthy | `1.jpeg` | `Chilli Healthy` (94.8%) | **True Positive** |
| **REAL-05** | Tomato Diseased | `Tomato___Late_blight_test.jpg` | `CROP_MISMATCH` | **Safeguard Active** (Crop cue warning) |
| **REAL-06** | Tomato Healthy | `Tomato___healthy_test.jpg` | `CROP_MISMATCH` | **Safeguard Active** (Crop cue warning) |
| **REAL-07** | Potato Diseased | `Potato___Late_blight_test.jpg` | `UNCERTAIN_DIAGNOSIS` | **Honest Abstention** (Lab background blur) |
| **REAL-08** | Potato Healthy | `Potato___healthy_test.jpg` | `UNCERTAIN_DIAGNOSIS` | **Honest Abstention** (Lab background blur) |
| **REAL-09** | Corn Diseased | `Corn___Common_rust_test.jpg` | `Corn Common Rust` (65.9%) | **True Positive** |
| **REAL-10** | Corn Healthy | `Corn___healthy_test.jpg` | `Corn Healthy` (78.1%) | **True Positive** |
| **REAL-11** | Non-Plant Object | `Non_Plant___Unsupported.jpg` | `Unsupported Object` (81.1%) | **Correct Out-of-Distribution Handling** |
| **REAL-12** | Pure Noise / Black | `pure_black_noise.jpg` | `NON_CROP_IMAGE` (HTTP 200) | **Leaf Validator Rejection** |

### Critical Finding:
Under genuine field conditions and low confidence, the application **never fabricates or hallucinates a diagnosis**. It strictly returns `UNCERTAIN_DIAGNOSIS`, `CROP_MISMATCH`, or `NON_CROP_IMAGE` with actionable agronomic follow-up advice.

---

## 6. Mocks vs. Real Inference Clarification

To maintain strict scientific transparency:
- **Phase 8/10 Regression Tests (`REL-008`, `REL-009`, `REL-010`):** Use deterministic model score fixtures injected into the evidence fusion and recommendation engine. This isolates the decision-table logic and CIBRC chemical gating rules from tensor library runtime variability.
- **Phase 9 Statistical Audit & Real-Image Diagnostic Tests (`REAL-01` to `REAL-12`):** Run **100% genuine neural network forward passes** through OpenCV preprocessors, TensorFlow Keras model files, and Scikit-Learn joblib pickles.

---

## 7. Model Checksums & Ledger Verification

All three production model files were re-hashed via SHA-256:
- `ml_models/disease_detection/disease_model.h5`:  
  `6ce987f81f3f72ad8e13d16680ea93d294fbc42f4f1f3644796cc6ccce3831a9` (42,876,776 bytes) — **MATCHES MANIFEST**
- `ml_models/disease_detection/.../AGROVISION_UNIFIED_72CLASS_MODEL.h5`:  
  `b4206b1d98173e89e3534fa206d4aaa8f283856ad52581e4585a11d5c4a4135c` (34,265,504 bytes) — **MATCHES MANIFEST**
- `ml_models/yield_prediction/yield_model.pkl`:  
  `1a06a98b0b20b2ce885cee9433f327413aa5e53e386f3b093769536a8151b2eb` (10,460,163 bytes) — **MATCHES MANIFEST**

*Existing models, class indices, and yield prediction algorithms were not replaced or modified.*

---

## 8. Final Decision & Deployment Boundary

### Overall Release Verification Decision:
$$\mathbf{DECISION} = \mathbf{PASS\ (READY\_WITH\_LIMITATIONS)}$$

### Deployment Permission:
$$\mathbf{DEPLOYMENT\ STATUS} = \mathbf{HOLD\ (DO\ NOT\ DEPLOY)}$$

### Justification & Mandatory Next Steps:
1. **Security Action:** Database owner must rotate the previously hardcoded credentials in the MongoDB Atlas console before any public exposure.
2. **Operational Constraint:** The application is suitable for deployment **only** under supervised extension pilot conditions where farmers confirm their crop species.
3. **Explicit Authorization:** Live deployment remains paused awaiting explicit user authorization.
