# AgroVision AI 2.0 — Comprehensive Project Handover Guide

**Document Version:** 2.0.0  
**Project:** AgroVision AI — Smart Crop Disease Detection & Yield Prediction System  
**Prepared By:** Antigravity Senior MLOps Engineer, Software QA Lead & System Architect  
**Audience:** Incoming Engineering Leads, MLOps Maintainers, Agricultural Domain Experts, Project Stakeholders

---

## 1. Project Mission & Transformation (Phases 1–10)

AgroVision AI 2.0 transforms an early prototype prone to cross-crop hallucinations into a scientifically rigorous, multimodal plant diagnostic and yield forecasting platform tailored for smallholder farmers in Southern India (Telangana & Andhra Pradesh).

Across ten systematic engineering phases, the system established:
1. **Evidence-Based Taxonomy (Phase 2):** 15 canonical crops, 72 verified diseases, and organ compatibility matrices.
2. **Dataset Audit & Quality Shield (Phase 3):** Separation of clean field imagery from biased laboratory datasets.
3. **Adaptive Farmer Questionnaire (Phase 4):** Symptom ontology, duration, and environmental evidence collection.
4. **Multimodal Evidence Fusion Engine (Phase 5):** Rule-based Bayesian confirmation with explicit safety abstention.
5. **Controlled Training Experiments (Phase 6):** Controlled training comparing baseline and unified candidate models.
6. **Agricultural Knowledge Base (Phase 7):** CIBRC-verified chemical and organic IPM recommendations with source attribution.
7. **Full-Stack End-to-End Integration (Phase 8):** Seamless connection across React, FastAPI, schemas, and models.
8. **Independent Field Evaluation (Phase 9):** Statistical audit across 3,522 held-out samples establishing operating limits.
9. **Controlled Release & Handover (Phase 10):** Operational health checks, SHA-256 model manifests, security remediation, and maintenance runbooks.

---

## 2. System Architecture & Component Map

The application follows a clean, decoupled, layered architecture:

```
[Farmer Browser / Mobile Client] (React 19 / Vite / Tailwind)
               │
               ▼  (HTTP REST / JSON / Multipart Form-Data)
[FastAPI Backend Gateway] (port 8000)
   ├── /health/live, /ready, /model   ──> System Liveness, Dependency & Checksum Verification
   ├── /auth                          ──> User Registration & JWT Bearer Token Security
   ├── /questionnaire                 ──> Canonical Crop List & Adaptive Symptom Schemas
   ├── /diagnosis/v1/full-diagnosis   ──> Diagnostic Workflow Orchestrator
   │     ├── MultiModal CNN Models    ──> MobileNetV2 / ResNet50 Checkpoints
   │     ├── Evidence Fusion Engine   ──> Bayes/Heuristic Symptom Matching & Abstention
   │     └── IPM Knowledge Base       ──> ANGRAU / PJTSAU / CIBRC Verified Recommendations
   ├── /predict/predict-yield         ──> Agronomic Multi-Factor Yield & Financial Forecast
   └── /assistant                     ──> Agricultural Chatbot & Localized Advisory
               │
               ▼
[Persistent Storage]
   ├── MongoDB Atlas Cluster          ──> User Profiles, Diagnostic Audits, History Records
   └── File System Checkpoint Store   ──> Immutable .h5 and .pkl Model Weights
```

---

## 3. Key Source Code & File Pointers

| Component / Subsystem | Source Path | Description |
| :--- | :--- | :--- |
| **API Entry Point** | `backend/app/main.py` | FastAPI app definition, CORS, exception redactor, and router mounting. |
| **Health & Readiness** | `backend/app/routes/health.py` | Liveness, readiness, model checksums, and aggregate health probes. |
| **Diagnostic Orchestrator** | `backend/app/services/diagnostic_workflow_orchestrator.py` | Pipeline coordinating image processing, fusion, and recommendations. |
| **Evidence Fusion Engine** | `backend/app/services/diagnosis_engine.py` | Combines neural confidences with farmer symptoms; handles abstention. |
| **Knowledge Base Service** | `backend/app/services/recommendation_service.py` | CIBRC pesticide lookup, cultural practices, and source attribution. |
| **Yield Forecast Engine** | `backend/app/services/yield_engine.py` | Multi-factor agronomic multipliers and financial scenario modeling. |
| **Adaptive Questionnaire** | `frontend/src/components/AdaptiveQuestionnaire.jsx` | React dynamic form dynamically rendering crop-specific symptom questions. |
| **Canonical Crop Registry** | `docs/agrovision_v2/phase2/crop_registry.json` | Master taxonomy for all 15 supported crops. |
| **Disease Knowledge Base** | `docs/agrovision_v2/phase7/crop_disease_knowledge.json` | Peer-reviewed treatment guides, look-alikes, and IPM recommendations. |

---

## 4. How to Operate & Run the System

### 4.1 Quick Local Startup
1. **Backend:**
   ```bash
   cd backend
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
2. **Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   Open browser at `http://localhost:5173`.

### 4.2 Verifying System Health
```bash
# Verify process liveness
curl http://localhost:8000/health/live

# Verify readiness of taxonomies & DB
curl http://localhost:8000/health/ready

# Verify model checksums
curl http://localhost:8000/health/model
```

### 4.3 Running Automated Regression Tests
```bash
python scratch/test_phase10_release_verification.py
```
Confirms 13/13 critical paths pass (liveness, readiness, models, schemas, abstention, yield, security).

---

## 5. Model Inventory & Governance

| Model Identifier | File Path | Checksum (SHA-256) | Role |
| :--- | :--- | :--- | :--- |
| `v1_baseline_39class` | `ml_models/disease_detection/disease_model.h5` | `6ce987f81f3f72ad8e13d16680ea93d294fbc42f4f1f3644796cc6ccce3831a9` | Active Production Fallback |
| `v2_candidate_72class` | `ml_models/disease_detection/unified_experiment/.../AGROVISION_UNIFIED_72CLASS_MODEL.h5` | `b4206b1d98173e89e3534fa206d4aaa8f283856ad52581e4585a11d5c4a4135c` | Approved Candidate (Gated Pilot) |
| `v2_smart_agronomic_hybrid` | `ml_models/yield_prediction/yield_model.pkl` | `1a06a98b0b20b2ce885cee9433f327413aa5e53e386f3b093769536a8151b2eb` | Active Yield Engine |

---

## 6. Security & Pre-Deployment Checklist

Before deploying this software to a live public cloud or production domain, execute the following mandatory steps:
- [ ] **Rotate MongoDB Credentials:** Change the password in MongoDB Atlas and remove line 21 fallback in `backend/app/database.py`.
- [ ] **Configure CORS Whitelist:** Replace `allow_origins=["*"]` with your specific production domain.
- [ ] **Generate Random JWT Secret:** Set `JWT_SECRET` in `.env` to a high-entropy string (>32 characters).
- [ ] **Deploy on Linux Container:** Deploy on Ubuntu 22.04 LTS / Docker to ensure unrestricted native TensorFlow C++ execution.
- [ ] **Lock Confidence Threshold:** Ensure `CONFIDENCE_THRESHOLD_TAU=0.50` is active to maintain safe rejection of ambiguous scans.

---

## 7. Handover Contact & Documentation Repository

All phase deliverables, scientific reports, and verification audits are located under:
- `docs/agrovision_v2/`
  - `phase1/` through `phase10/`
- Master Release Manifest: `docs/agrovision_v2/phase10/release_manifest.json`
- Model Rollback Runbook: `docs/agrovision_v2/phase10/model_versioning_and_rollback.md`
- Security Review: `docs/agrovision_v2/phase10/security_review_report.md`
