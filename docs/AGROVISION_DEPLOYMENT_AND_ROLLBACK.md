# AgroVision AI — Deployment & Rollback Playbook

**Date:** October 11, 2026  
**System:** AgroVision AI Multi-Crop Disease Prediction System  
**Status:** Production Ready  

---

## 1. Active Production Configuration

| Component | Path / Configuration |
| :--- | :--- |
| **Primary Production Model** | `ml_models/disease_detection/unified_experiment/artifacts/agrovision_phase7_20261010_231412/AGROVISION_UNIFIED_72CLASS_MODEL.h5` |
| **Canonical Class Mapping** | `ml_models/disease_detection/unified_experiment/artifacts/agrovision_phase7_20261010_231412/unified_label_mapping.json` |
| **Baseline Rollback Model** | `ml_models/disease_detection/disease_model.h5` |
| **Baseline Class Mapping** | `ml_models/disease_detection/class_indices.json` |
| **Backend API Route** | `backend/app/routes/predict.py` |
| **Disease Metadata Registry** | `backend/app/utils/disease_info.py` |
| **Frontend UI Page** | `frontend/src/pages/DiseaseDetection.jsx` |
| **Confidence Threshold ($\tau$)** | `0.50` (Configurable via `CONFIDENCE_THRESHOLD`) |

---

## 2. Startup Commands

### Backend Server (FastAPI)
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Server (React / Vite)
```bash
cd frontend
npm run dev
```

---

## 3. Deployment Verification

Run the automated diagnostic audit suite:
```bash
python scratch/test_critical_inference_repairs.py
```

Expected Output:
```text
=== ALL 9 AUDIT TESTS PASSED (PASS) ===
Audit results saved to e:\tekworks_projects\crop\reports\critical_inference_audit_results.json
```

---

## 4. 60-Second Rollback Protocol

If an unexpected runtime regression occurs, follow this procedure to restore the original 39-class baseline model in under 60 seconds:

### Step 1: Update Model Loading Environment / Paths
In `backend/app/routes/predict.py`, revert the model initialization constants:

```python
MODEL_PATH = os.path.abspath(os.path.join(
    os.path.dirname(__file__), 
    "../../ml_models/disease_detection/disease_model.h5"
))
MAPPING_PATH = os.path.abspath(os.path.join(
    os.path.dirname(__file__), 
    "../../ml_models/disease_detection/class_indices.json"
))
```

### Step 2: Restart Backend Service
```bash
cd backend
python -m uvicorn app.main:app --reload
```

### Step 3: Verify Rollback
Send a test POST request to `http://localhost:8000/api/predict`:
```bash
curl -X POST "http://localhost:8000/api/predict" -F "file=@test_leaf.jpg"
```
Verify the model returns a diagnosis from the 39-class baseline taxonomy.

---

## 5. Troubleshooting & FAQ

### Issue: `CROP_MISMATCH` Response in UI
- **Cause:** User selected a crop (e.g., Rice) that conflicts with the model's high-confidence prediction (e.g., Tomato).
- **Resolution:** Expected behavior. The UI displays an alert asking the user to confirm their uploaded image or change the crop selection.

### Issue: `UNCERTAIN_DIAGNOSIS` Response
- **Cause:** Model confidence is below $\tau = 0.50$, or foliage area is below 5%.
- **Resolution:** The user is prompted to upload a clearer, well-lit photograph focusing closely on single plant leaves.
