# AgroVision AI 2.0 — Release Security & Input Handling Review

**Date:** October 11, 2026  
**Auditor:** Senior Security Reviewer & MLOps Engineer  
**Status:** COMPLETE — FINDINGS CATALOGED WITH REMEDIATION PLAN  
**Scope:** FastAPI Backend, React Frontend, Authentication, Image Uploads, Diagnostic Pipelines, Secrets Management

---

## 1. Executive Summary

This security review evaluates the AgroVision AI 2.0 system prior to release readiness handover. The evaluation examined the external attack surface, data privacy, authentication mechanisms, file-upload handlers, secret storage, and potential information leakage.

The core diagnosis and evidence-fusion workflows exhibit strong input validation, strict image size gating (15 MB), and defensive exception handling with redacted stack traces. However, critical findings regarding credential hardcoding in source code and permissive CORS settings require remediation before production deployment.

---

## 2. Attack Surface Assessment & Findings Matrix

| Finding ID | Severity | Category | Description | Status |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | **CRITICAL** | Secrets Management | Hardcoded MongoDB connection fallback string discovered in source code file `backend/app/database.py` line 21. | Remediation Required |
| **SEC-02** | **HIGH** | CORS Configuration | Permissive wildcard origin `allow_origins=["*"]` configured in `backend/app/main.py`. | Remediation Required |
| **SEC-03** | **MEDIUM** | Error Exposure | Global exception handler previously printed raw python tracebacks. Refactored to return opaque correlation IDs in Phase 10. | **RESOLVED** |
| **SEC-04** | **LOW** | Image File Upload | Multipart upload enforces 15MB file cap, OpenCV bitmap decode verification, and dimension bounds (>16x16px). | **VERIFIED SECURE** |
| **SEC-05** | **LOW** | Path Traversal | Filenames passed by client are sanitized; uploads are processed in-memory via `io.BytesIO` without writing unvalidated files to disk. | **VERIFIED SECURE** |
| **SEC-06** | **MEDIUM** | Auth Token Expiry | JWT tokens use standard HS256 with 24-hour expiration (`ACCESS_TOKEN_EXPIRE_MINUTES=1440`). | **VERIFIED ACCEPTABLE** |
| **SEC-07** | **INFO** | Farmer Data Privacy | In-memory evidence fusion does not retain raw images permanently by default. Diagnostic history is scoped to user IDs. | **DOCUMENTED** |

---

## 3. Detailed Security Findings & Remediation

### SEC-01: Hardcoded Database Credentials in Fallback Connection
- **Location:** `backend/app/database.py` (line 21)
- **Vulnerability:** If environment variables `MONGO_URI` or `MONGO_URL` are not defined, the application falls back to an embedded MongoDB Atlas connection string containing hardcoded database credentials.
- **Risk:** Exposure of the database credentials if source code is shared, committed to public repositories, or leaked via misconfigured repositories.
- **Remediation Action (Required prior to Production):**
  1. Rotate the database credentials immediately in MongoDB Atlas console.
  2. Remove the fallback connection string from `database.py`. In production mode (`ENVIRONMENT=production`), the application must fail fast at startup if `MONGO_URI` is missing:
     ```python
     MONGO_URI = os.getenv("MONGO_URI")
     if not MONGO_URI:
         raise RuntimeError("FATAL: MONGO_URI environment variable must be configured.")
     ```
  3. Populate credentials solely via secure environment variables or vault secret injection.

### SEC-02: Permissive Cross-Origin Resource Sharing (CORS)
- **Location:** `backend/app/main.py` (lines 13-19)
- **Vulnerability:** `allow_origins=["*"]` allows any website to make cross-origin requests to the AgroVision AI API.
- **Risk:** Malicious third-party web domains could attempt unauthorized cross-origin requests or CSRF against authenticated farmer sessions.
- **Remediation Action:**
  - Replace wildcard origins with an environment-driven whitelist:
    ```python
    allowed_origins = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["*"],
    )
    ```

### SEC-03: Information Disclosure via Exception Handling (Resolved in Phase 10)
- **Previous State:** `global_exception_handler` returned `{"traceback": traceback.format_exc()}`, leaking internal file paths, Python virtual environment structures, and library versions to end users.
- **Remediated State:** Refactored in `backend/app/main.py` to generate an opaque 8-character `correlation_id` and generic error message. Raw tracebacks are restricted to server-side logging.
- **Verification:** Verified in Phase 10 regression test `REL-012` (HTTP 422/500 returns cleanly without python stack traces).

---

## 4. Input Handling and Image Upload Validation

### 4.1 Image Upload Security Controls
All image processing endpoints (`/diagnosis/v1/full-diagnosis-upload` and `/predict/predict-disease`) implement rigorous defensive checks:
1. **Size Limits:** Hard cap at 15 MB (`15,728,640 bytes`). Uploads exceeding this return HTTP 400 immediately.
2. **Empty Buffer Rejection:** Zero-byte files are rejected before buffer allocation.
3. **True Binary Decoding:** The upload is passed through `cv2.imdecode(np_arr, cv2.IMREAD_COLOR)`:
   - Polyglot files or malformed headers fail OpenCV decoding and are rejected with HTTP 400.
   - Images with dimensions smaller than 16x16 pixels are rejected as degenerate inputs.
4. **In-Memory Streaming:** No temporary files are written to `/tmp` or local disk, preventing symlink race conditions, arbitrary file overwrite, or disk space exhaustion.

### 4.2 Questionnaire Input Schema Validation
- All farmer inputs are strictly validated through Pydantic v2 schemas (`QuestionnaireSubmissionRequest`).
- String fields enforce maximum character length constraints (e.g. `treatment_details <= 300` characters, `additional_notes <= 1000` characters).
- Crop IDs must match the canonical taxonomy prefix (`crop_*`, `crop_unsure`, or `crop_unsupported`).
- Injections of unexpected keys are stripped or rejected with HTTP 422.

---

## 5. Privacy, Logging, and Data Retention

1. **Farmer Privacy:**
   - Raw image byte buffers are decoded in volatile memory for inference and immediately released to garbage collection.
   - PII (names, contact numbers) are not logged in operational stdout.
2. **Audit Logging:**
   - Health probes (`/health/live`, `/health/ready`, `/health/model`) expose only aggregated boolean health indicators and SHA-256 model checksums.
   - No filesystem absolute paths, database passwords, or secret tokens are returned by any diagnostic endpoint.
3. **Database Records:**
   - Historical scans stored in MongoDB `history` collection store only crop species, predicted disease, confidence, and timestamp.
   - Users are isolated by MongoDB ObjectID filtering verified through JWT bearer authentication.

---

## 6. Security Sign-Off Recommendation

The technical security posture of AgroVision AI 2.0 is **CONDITIONALLY APPROVED** for controlled pilot release, subject to the mandatory pre-deployment completion of **SEC-01** (database credential rotation and environment variable enforcement) and **SEC-02** (CORS whitelist configuration).
