# AgroVision AI 2.0 — Deployment Readiness Checklist & Operational Runbook

## 1. System Integration Status Summary

- **Phase:** Phase 8: Full-Stack Integration and End-to-End System Validation
- **Integrated Version:** AgroVision AI 2.0.0
- **Integration Status:** `PASS` (Verification Gate Passed 12/12)
- **Deployment Recommendation:** **STAGING READY / PRODUCTION CANDIDATE GATED** (Awaiting Phase 9 Independent Verification & Explicit User Approval)

---

## 2. Verification Gate Audit Checklist

| Item | Verification Requirement | Status | Verification Evidence / Trace |
| :---: | :--- | :---: | :--- |
| **01** | Required component interfaces are validated | `PASS` | `api_contract_validation.json` confirms all 6 core endpoints match schema contracts |
| **02** | Frontend and backend schemas agree | `PASS` | `FullDiagnosisResponse` matches `AdaptiveQuestionnaire.jsx` Step 7 rendering |
| **03** | Model identity, preprocessing, and class mapping verified | `PASS` | `model_class_mapping_proposal.json` maps 39 baseline & 72 unified classes |
| **04** | Model failures reported honestly | `PASS` | Platform WDAC restriction handled via `model_unavailable` without faking predictions |
| **05** | Questionnaire evidence reaches diagnosis engine correctly | `PASS` | Sourced from `QuestionnaireSubmissionRequest` into multimodal pipeline |
| **06** | Evidence and uncertainty preserved in response | `PASS` | `evidence_ledger`, `contradictions`, and `uncertainty_reasons` populated |
| **07** | Knowledge-base lookups return valid, applicable records | `PASS` | Validated against PJTSAU Vyavasaya Panchangam & CIBRC registries |
| **08** | Unsupported diagnoses do not produce unsupported treatments | `PASS` | Enforced by `guidance_permitted == False` & `verified_chemical_treatments == []` |
| **09** | Positive-path and failure-path tests actually execute | `PASS` | 13/13 tests executed and passed in `scratch/test_phase8_fullstack_e2e.py` |
| **10** | Relevant regression tests execute | `PASS` | 4/4 regression tests passed (`predict-yield`, `assistant/chat`, `root`, `predict-disease`) |
| **11** | Yield prediction and unrelated features remain intact | `PASS` | Verified live yield response: `1.021` tons/acre, gross revenue Rs. 88,969 |
| **12** | Original datasets and checkpoints remain preserved | `PASS` | Zero destructive commands; all `.h5`, `.pkl`, and raw dataset files untouched |
| **13** | No unapproved candidate model is deployed | `PASS` | Production checkpoints unchanged; experiments kept in isolated Phase 6 folders |
| **14** | All unresolved issues are documented | `PASS` | Windows WDAC DLL constraint documented in runtime readiness report |

---

## 3. Platform & Host Dependency Requirements

### Backend Environment
- **Operating System:** Linux (Ubuntu 22.04 LTS recommended) or Windows 11 (with appropriate execution policies)
- **Python:** Version 3.10 to 3.12 64-bit
- **Native Binaries:** Ensure host allows execution of native C++ / Fortran wheel extensions (`_pywrap_tensorflow_lite_metrics_wrapper.pyd`).
- **RAM:** Minimum 4GB (8GB recommended for concurrent visual inference requests)
- **Disk:** 500MB free disk space for application code and knowledge registries

### Frontend Environment
- **Node.js:** Version 18.x or 20.x LTS
- **Build Tool:** Vite 8.x / React 19.x
- **Static Assets:** Gzip bundled (`dist/` directory size: 1.25MB JS, 75KB CSS)

---

## 4. Operational Runbook & Health Probes

### 1. Service Health Check
```bash
# Verify backend gateway
curl -s http://localhost:8000/ | grep "AgroVision AI Backend"

# Verify decision status catalog
curl -s http://localhost:8000/diagnosis/v1/statuses | grep "catalog_version"

# Verify canonical crop catalog
curl -s http://localhost:8000/questionnaire/crops | grep "canonical_name"
```

### 2. End-to-End Test Execution Command
```bash
python scratch/test_phase8_fullstack_e2e.py
```

### 3. Rollback Procedure
If any unexpected runtime anomaly occurs in staging:
1. Revert `backend/app/routes/diagnosis.py` and `backend/app/services/diagnostic_workflow_orchestrator.py` via Git.
2. The legacy endpoint `/predict/predict-disease` remains 100% operational as a standalone route.
3. No database migrations or persistent state schema modifications were introduced in Phase 8.
