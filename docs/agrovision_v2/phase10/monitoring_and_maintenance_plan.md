# AgroVision AI 2.0 — Post-Release Monitoring & Maintenance Plan

**Document Version:** 2.0.0  
**Target Roles:** MLOps Engineers, Agronomy Quality Analysts, Software Support Engineers  
**Scope:** Telemetry Metrics, Drift Detection, Human-in-the-Loop Review, and Continuous Maintenance Workflows

---

## 1. Post-Release Quality Telemetry

To ensure diagnostic trustworthiness without compromising farmer privacy, AgroVision AI 2.0 establishes an aggregated, privacy-conscious monitoring framework.

### 1.1 Core Telemetry Metrics & SLIs

| Metric Key | Metric Name | Target Threshold | Incident Alert Trigger |
| :--- | :--- | :--- | :--- |
| **`abstention_rate`** | Total Diagnostic Abstention Frequency | 10% – 25% | > 35% over 1 hour |
| **`crop_mismatch_rate`** | Discrepancy between selected crop & neural prediction | < 8% | > 15% over 1 hour |
| **`unsupported_crop_rate`** | Frequency of requests for out-of-scope crops | Informational | > 10% (suggests candidate for addition) |
| **`image_quality_fail_rate`**| Non-crop or blurry image upload rejections | 3% – 8% | > 20% (possible UI upload camera issue) |
| **`model_unavailable_rate`**| Inference fallback frequency due to resource exhaustion | 0% | > 0.5% |
| **`p95_inference_latency`** | End-to-end diagnosis latency | < 1,200 ms | > 2,500 ms |
| **`chem_guidance_block_rate`**| Pesticide recommendation withholding rate | Correlates with abstention | Drift from baseline |

### 1.2 Data Privacy Invariant
- **No Raw Image Retention by Default:** Uploaded farmer photographs are processed in volatile RAM. They are never persisted to long-term storage without explicit, affirmative farmer opt-in.
- **Aggregated Logs Only:** Operational logs capture correlation IDs, crop IDs, decision status tags, and confidence percentiles, omitting farmer names, phone numbers, and location coordinates beyond broad agro-climatic zones (e.g. Telangana North Zone).

---

## 2. Model Drift & Failure-Case Detection

### 2.1 Distribution Drift Tracking
Agricultural computer vision is subject to acute seasonal and environmental drift:
- **Phenological Drift:** New crop varieties exhibiting different leaf pigmentation or canopy geometry.
- **Sensor Drift:** Farmer smartphone camera white-balance and compression variances.
- **Seasonal Drift:** Wet season (monsoon) foliage exhibiting water-sheen and reflection artifacts that mimic fungal lesions.

### 2.2 Rejection of Automated Self-Training
> [!IMPORTANT]
> **Strict MLOps Rule:** Farmer agreement, repetitive scans, or click-through actions **MUST NEVER** be treated as verified ground truth. The system **MUST NOT** retrain models automatically on unreviewed uploads. Automated retraining on unvalidated field submissions leads to catastrophic label contamination and hallucination loops.

### 2.3 Human-in-the-Loop Review Pipeline
When farmers voluntarily opt-in to agronomic consultation review:
1. **Quarantine Queue:** Ambiguous scans with low confidence ($\tau < 0.50$) or conflicting questionnaire evidence are queued in an internal review backlog.
2. **Plant Pathologist Verification:** Qualified agricultural extension officers (e.g. ANGRAU / PJTSAU extension scientists) review the high-resolution photo alongside questionnaire notes.
3. **Canonical Label Assignment:** Only confirmed, verified disease diagnoses are tagged and exported to the held-out validation pool for future model iterations.

---

## 3. Maintenance Workflows & SOPs

### 3.1 SOP-01: Adding a New Crop Species
1. **Taxonomy Update:**
   - Define canonical crop record in `docs/agrovision_v2/phase2/crop_registry.json`.
   - Update `crop_organ_compatibility_matrix.json` with supported organs.
2. **Questionnaire Calibration:**
   - Add crop-specific growth stages and known regional symptom profiles to `questionnaire_config.json`.
3. **Knowledge Base Authoring:**
   - Author verified IPM packages, look-alikes, and CIBRC chemical recommendations in `crop_disease_knowledge.json`.
4. **Model Retraining & Independent Evaluation:**
   - Assemble verified field imagery (minimum 500 images per disease class).
   - Train and execute Phase 9 independent evaluation; confirm field accuracy $\ge 85\%$ before release.

### 3.2 SOP-02: Adding or Correcting a Disease Label
1. **Disease Registry Update:**
   - Assign unique `dis_<crop>_<disease>` identifier in `disease_registry.json`.
   - Document causal pathogen, taxonomic classification, and regional prevalence.
2. **Knowledge Base Verification:**
   - Reference official university package of practices (ANGRAU / PJTSAU / TNAU).
   - Ensure CIBRC chemical approvals cite current Central Insecticides Board registrations.
3. **Regression Testing:**
   - Re-run `scratch/test_phase10_release_verification.py` to ensure schema integrity.

### 3.3 SOP-03: Updating Preprocessing or Thresholds
1. **Calibrated Threshold Recalibration:**
   - If model architecture changes, compute new risk-coverage curve on held-out field test set.
   - Adjust `CONFIDENCE_THRESHOLD_TAU` in `.env` based on acceptable clinical false-positive tolerance.
2. **Preprocessing Pipeline Compatibility:**
   - Verify image dimensions (224x224 RGB), normalization range ($[-1, 1]$ or $[0, 1]$), and color space invariants across backend and client.

### 3.4 SOP-04: Emergency Hotfix & Rollback
Follow the validated procedures in `docs/agrovision_v2/phase10/model_versioning_and_rollback.md`. Rollback to baseline checkpoint `v1_baseline_39class` can be executed within 60 seconds.
