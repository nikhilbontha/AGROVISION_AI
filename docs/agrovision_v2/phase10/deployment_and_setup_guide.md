# AgroVision AI 2.0 — Deployment & Environment Setup Guide

**Document Version:** 2.0.0  
**Target Environments:** Linux Production (Ubuntu 22.04 LTS / Docker) & Local Development (Windows / macOS / Linux)  
**Status:** VALIDATED REPRODUCIBLE RUNBOOK

---

## 1. System Requirements & Prerequisites

### 1.1 Supported Operating Systems & Hardware
- **Production Recommended:** Ubuntu 22.04 LTS (x86_64 / AMD64) with 4+ CPU cores, 8 GB RAM, and optional NVIDIA GPU with CUDA 12.x for accelerated batch inference.
- **Local Development:** Windows 10/11, macOS (Apple Silicon / Intel), or Linux.
- **Runtime Engines:**
  - Python: `3.10` – `3.13`
  - Node.js: `v20.x` or `v24.x` (verified with v24.14.0)
  - npm: `10.x` or `11.x` (verified with v11.9.0)
  - Database: MongoDB 6.0+ (Local Community Server or MongoDB Atlas ReplicaSet)

> [!NOTE]
> On Windows machines enforcing Windows Defender Application Control (WDAC), native C++ tensor DLL loading may be restricted by enterprise policy. In such environments, Linux containers (Docker) provide full native TensorFlow execution without policy blockage.

---

## 2. Environment Configuration

### Step 1: Clone Repository & Create Environment Configuration
```bash
git clone https://github.com/nikhilbontha/AGROVISION_AI.git
cd AGROVISION_AI

# Create backend .env from verified template
cp backend/.env.example backend/.env
```

### Step 2: Configure Required Environment Variables in `backend/.env`
```ini
ENVIRONMENT=production
DEBUG=false
APP_HOST=0.0.0.0
APP_PORT=8000
CORS_ALLOWED_ORIGINS=https://agrovision.example.com,http://localhost:5173

# Replace with your secure MongoDB connection string
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/agrovision?appName=AgroVisionAI

# High-entropy random JWT secret (min 32 characters)
JWT_SECRET=generate_a_secure_random_hex_key_here

# External AI & Weather APIs
GEMINI_API_KEY=your_gemini_api_key
WEATHER_API_KEY=your_openweathermap_api_key

# Model paths and parameters
MODEL_PATH_DISEASE=ml_models/disease_detection/disease_model.h5
CONFIDENCE_THRESHOLD_TAU=0.50
```

---

## 3. Backend Setup & Service Startup

### Step 1: Create Virtual Environment & Install Dependencies
```bash
cd backend
python -m venv venv

# On Linux/macOS:
source venv/bin/activate

# On Windows:
.\venv\Scripts\activate

# Install locked dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 2: Launch Backend Service
For local development:
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
For production deployment (systemd / Gunicorn / Uvicorn workers):
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4 --proxy-headers
```

---

## 4. Frontend Setup & Build

### Step 1: Install Node Dependencies
```bash
cd ../frontend
npm install
```

### Step 2: Build Production Bundle
```bash
npm run build
```
The optimized production bundle will be generated under `frontend/dist/` (Entry: `frontend/dist/index.html`).

### Step 3: Serve Frontend
For local development:
```bash
npm run dev -- --host 0.0.0.0 --port 5173
```
For production: Serve `frontend/dist` via Nginx, Caddy, or Cloudflare Pages with fallback routing to `index.html`.

---

## 5. Deployment Verification & Health Checks

Execute the following HTTP checks against the running backend to verify health:

### 1. Process Liveness Probe
```bash
curl -f http://localhost:8000/health/live
```
**Expected Response:** `{"status": "alive", "uptime_seconds": ..., "timestamp": ...}`

### 2. Readiness Probe
```bash
curl -f http://localhost:8000/health/ready
```
**Expected Response:** `{"status": "ready", "registries": {"crop_registry": "ready", ...}, "database": "connected"}`

### 3. Model Integrity Probe
```bash
curl -f http://localhost:8000/health/model
```
**Expected Response:** Verifies `checksum_verified: true` for all active and candidate models.

### 4. Execute Full Regression Verification Suite
```bash
python scratch/test_phase10_release_verification.py
```
**Pass Criteria:** 13/13 tests pass with 100% success rate.

---

## 6. Troubleshooting Common Deployment Issues

| Symptom | Root Cause | Solution |
| :--- | :--- | :--- |
| `/health/ready` returns HTTP 503 | MongoDB unreachable or timeout | Verify network egress to MongoDB Atlas on port 27017; check `MONGO_URI` credentials in `.env`. |
| `MODEL_UNAVAILABLE` on diagnosis | Model file missing or host tensor policy blocked | Verify `ml_models/disease_detection/disease_model.h5` exists; deploy in Linux container if on WDAC-restricted Windows host. |
| CORS Error in Browser Console | Client origin not listed in whitelist | Add frontend domain (e.g. `https://agrovision.example.com`) to `CORS_ALLOWED_ORIGINS` in `backend/.env`. |
| 422 Unprocessable Entity | Payload doesn't match Pydantic schema | Verify questionnaire fields include `selected_crop_id` with prefix `crop_` and array of `symptom_ids`. |
