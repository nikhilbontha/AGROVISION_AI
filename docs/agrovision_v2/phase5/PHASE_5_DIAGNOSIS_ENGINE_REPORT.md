# AgroVision AI 2.0 — Phase 5 Multimodal Diagnosis Engine and Evidence Fusion Report

**Document Version:** 2.0.0  
**Phase:** Phase 5 — Multimodal Diagnosis Engine and Evidence Fusion  
**Author:** Senior Machine-Learning Architect & Plant-Disease Systems Engineer  
**Status:** COMPLETED & PASSED  
**Execution Timestamp:** 2026-10-11T06:09:42Z  

---

## Executive Summary

Phase 5 introduces the **AgroVision AI 2.0 Multimodal Diagnosis Engine**, an evidence-fusion decision pipeline designed to overcome the core failure modes of computer-vision-only plant disease detection. In legacy crop-disease applications, neural networks blindly evaluate leaf images and return high softmax confidence scores regardless of whether the farmer selected a different crop, examined an incompatible organ, or described symptoms that contradict the visual hypothesis. 

This Phase 5 implementation does **not** train or deploy new neural network checkpoints, nor does it alter legacy production endpoints or yield prediction engines. Instead, it constructs a modular 12-stage decision architecture that fuses:
1. Visual model candidate scores (from exact model-version class index mappings),
2. Farmer-selected crop identity (enforcing strict host gating),
3. Affected plant organ compatibility (evaluated against the Phase 2 Crop-Organ Compatibility Matrix),
4. Structured symptom evidence from the Phase 4 Farmer Questionnaire, and
5. Validated agronomic knowledge references (ICAR, CABI, ANGRAU).

The engine strictly separates **uncalibrated model softmax scores** from **diagnostic confidence**, implements **selective prediction with 10 explicit abstention states**, handles contradictions transparently, generates actionable follow-up questions from the Phase 4 configuration when ambiguity arises, and produces an audit-ready **Evidence Ledger** explaining every ranking or rejection.

All 17 automated unit and integration tests executed cleanly (**17/17 PASSED**), verifying schema conformance, abstention safety, and zero regression on unrelated features.

---

## 1. Architecture and Pipeline Stages

The diagnosis engine executes an explicit 12-stage sequential pipeline where each stage returns structured evaluations, uncertainty reasons, and errors. No stage is silently bypassed.

```
       [ Farmer Questionnaire Payload + Leaf Image / Mock Model Output ]
                                      │
                                      ▼
             Stage 1: Input & Payload Validation (Pydantic / Schema)
                                      │
                                      ▼
             Stage 2: Model & Runtime Availability Check (DLL / Checkpoint)
                                      │
                                      ▼
             Stage 3: Model Output & Class-Index Mapping Validation
                                      │
                                      ▼
             Stage 4: Crop Identity Assessment & Host Gating
                                      │
                                      ▼
             Stage 5: Plant-Organ Compatibility Evaluation
                                      │
                                      ▼
             Stage 6: Image-Based Candidate Diagnosis Generation
                                      │
                                      ▼
             Stage 7: Farmer Symptom Evidence Extraction
                                      │
                                      ▼
             Stage 8: Candidate-to-Questionnaire Compatibility Assessment
                                      │
                                      ▼
             Stage 9: Multimodal Evidence Fusion & Contradiction Handling
                                      │
                                      ▼
             Stage 10: Confidence & Uncertainty Assessment
                                      │
                                      ▼
             Stage 11: Selective Prediction & Abstention Decision
                                      │
                                      ▼
             Stage 12: Structured Diagnostic Report & Follow-Up Questions
```

### Stage-by-Stage Breakdown

1. **Stage 1: Input and Payload Validation**
   - Validates incoming questionnaire payloads against the Phase 4 Pydantic schema (`QuestionnaireSubmissionRequest`).
   - Requires canonical crop ID, affected plant organ, and at least one observed symptom sign.
   - If invalid, halts immediately with `decision_status = "invalid_input"`.

2. **Stage 2: Image / Model Availability Check**
   - Inspects physical model weights and probes the TensorFlow runtime.
   - Specifically handles the Windows Application Control DLL block (`_pywrap_tensorflow_lite_metrics_wrapper`).
   - When the neural network is unavailable and no decoupled mock output is supplied, reports `model_unavailable` honestly without fabricating a mock prediction.

3. **Stage 3: Model Output and Class-Index Validation**
   - Validates model output vectors against `model_class_mapping_proposal.json`.
   - Checks for duplicate indices, out-of-range bounds, or class collisions, rejecting malformed arrays with `invalid_input`.

4. **Stage 4: Crop Identity Evidence Assessment**
   - Validates the farmer-selected crop against `crop_registry.json`.
   - If the crop is absent or marked unsupported (`is_supported = false`), returns `unsupported_crop` and provides an agricultural extension referral.
   - Evaluates agreement between the visual model's top predicted crop and the farmer's selection. If they disagree, flags `crop_mismatch` and preserves both hypotheses rather than silently overriding the farmer.

5. **Stage 5: Plant-Organ Compatibility Assessment**
   - Cross-checks `(selected_crop_id, affected_organ)` against `crop_organ_compatibility_matrix.json`.
   - If the organ is impossible or unsupported for the crop (e.g., Apple ears/cobs, Rice tubers), triggers `organ_mismatch` abstention.
   - Incompatible candidate diseases are down-weighted and documented in the evidence ledger.

6. **Stage 6: Image-Based Candidate Diagnosis Generation**
   - Resolves top model output indices to canonical disease IDs (`disease_registry.json`).
   - Filters candidate diseases to those permitted on the host crop. Preserves raw softmax scores without mathematical distortion.

7. **Stage 7: Farmer Symptom Evidence Extraction**
   - Extracts observed symptoms (`sym_spots`, `sym_wilting`, `sym_mosaic`, etc.), duration, spread rate, and environmental conditions from the questionnaire payload.

8. **Stage 8: Candidate-to-Questionnaire Compatibility Assessment**
   - Matches extracted symptoms against `evidence_fusion_rules.json` symptom mapping profiles for each disease candidate.
   - Distinguishes diagnostic pathognomonic signs from generic chlorosis/wilting.

9. **Stage 9: Multimodal Evidence Fusion & Contradiction Handling**
   - Computes an interpretable composite evidence score using configurable, provisional heuristic weights:
     - Base Model Score: weight 0.50
     - Primary Symptom Match: weight +0.25
     - Organ Compatibility: weight 1.0 multiplier
     - Environmental Prior: weight +0.10
   - Detects severe contradictions:
     - Model predicts healthy leaf but farmer reports severe rot or wilting (`HEALT_PREDICTION_CONTRADICTS_SEVERE_SYMPTOMS`).
     - Chronic duration (>2 weeks) but model predicts acute viral blast.
   - When severe contradictions occur, sets the contradiction flag and routes the case to expert review.

10. **Stage 10: Confidence and Uncertainty Assessment**
    - Assesses margin between Rank 1 and Rank 2 candidates (`margin < 0.15`).
    - Evaluates total candidate evidence scores against provisional thresholds.
    - Selects relevant follow-up questions from `questionnaire_config.json` that are unanswered, crop-applicable, and organ-valid.

11. **Stage 11: Selective Prediction and Abstention Decision**
    - Applies the decision state machine to select one of 10 explicit statuses (`diagnosis_supported`, `multiple_candidates`, `needs_more_information`, `crop_mismatch`, `organ_mismatch`, `unsupported_crop`, `model_unavailable`, `invalid_input`, `insufficient_evidence`, `expert_review_recommended`).
    - Permits the engine to safely abstain rather than forcing an ungrounded prediction.

12. **Stage 12: Structured Diagnostic Report Generation**
    - Assembles the complete response conformant to `diagnosis_response_schema.json`.
    - Includes the full Evidence Ledger, uncalibrated softmax indicators, uncertainty reasons, authoritative citations (ICAR, CABI, ANGRAU), and explicit limitations.

---

## 2. Decision and Abstention Behavior

The engine implements a 10-state decision taxonomy cataloged in `docs/agrovision_v2/phase5/decision_status_catalog.json`.

| Decision Status | Description | Action / Next Step |
|---|---|---|
| `diagnosis_supported` | High candidate evidence score (≥ 0.50), verified host crop, compatible organ, and consistent symptom signs. | Present primary diagnosis, evidence ledger, and ICAR IPM guidance. |
| `multiple_candidates` | Top-1 and Top-2 candidate scores have a narrow margin (< 0.15), indicating differential ambiguity. | Return ranked candidate list with differential reasoning and targeted follow-up questions. |
| `needs_more_information` | Moderate evidence (0.35–0.50) without disqualifying contradictions. | Request farmer to answer targeted follow-up questions. |
| `crop_mismatch` | Strong disagreement between farmer-selected crop and neural vision feature hypothesis. | Alert farmer to re-verify crop identity and upload a focused foliage photograph. |
| `organ_mismatch` | Selected plant organ is biologically incompatible with the crop or candidate pathogen. | Request clarification on affected plant part or upload leaf images. |
| `unsupported_crop` | Selected crop is outside the 14 canonical supported crops in AgroVision AI 2.0. | Refer farmer to local Krishi Vigyan Kendra (KVK) or extension clinic. |
| `model_unavailable` | Neural vision model weights missing or runtime DLL execution blocked by OS security policy. | Report engine status honestly without fabricating predictions. |
| `invalid_input` | Missing required fields, contradictory questionnaire values, or malformed model vector. | Return HTTP 422 / validation error detailing invalid parameters. |
| `insufficient_evidence` | All candidate scores fall below baseline threshold (< 0.35) or symptoms are purely unclear/unsure. | Abstain from diagnosis; advise farmer to rescan under daylight. |
| `expert_review_recommended` | Severe contradiction detected between visual model and farmer symptoms (e.g. Model Healthy vs severe rot). | Advise physical inspection by district agricultural officer. |

---

## 3. Separation of Model Probabilities and Diagnostic Confidence

A core requirement of AgroVision AI 2.0 is eradicating the false perception that neural network softmax outputs represent calibrated real-world probabilities.

### Engineering Controls Implemented:
1. **Raw Model Scores Preserved**: The exact float value from the neural network output is preserved in `raw_model_score` and `raw_model_scores` list.
2. **Explicit Calibration Metadata**: Every diagnostic response includes `"calibration_status": "uncalibrated_softmax"`. The API contract forbids claiming Bayesian or Platt-calibrated certainty until an independent validation dataset and temperature scaling have been evaluated.
3. **Evidence Scores Distinct from Softmax**: The composite `evidence_score` represents a rule-based heuristic compatibility index, not a probability.
4. **Provisional Labeling**: All thresholds (e.g., 0.50 for supported diagnosis, 0.15 for candidate margin) are marked `"provisional": true` in `evidence_fusion_rules.json` and are subject to empirical recalibration in later phases.
5. **Mandatory Limitations Disclosure**: Every diagnostic response includes mandatory limitation disclaimers:
   - *"Raw neural network scores represent uncalibrated softmax logits and must not be interpreted as absolute real-world probabilities."*
   - *"Visual feature extraction is conditioned on dataset representations; lab-cardboard image memorization risk applies to crops lacking field images."*
   - *"This diagnosis decision engine provides decision-support evidence and does not substitute for accredited agricultural laboratory testing."*

---

## 4. Evidence Fusion and Contradiction Handling

### Evidence Ledger
For every candidate diagnosis evaluated, the engine produces an entry in the `evidence_ledger` containing:
- `canonical_disease_id` & `canonical_crop_id`
- `raw_model_score`
- `organ_compatibility` (`PERMITTED`, `REDUCED_CONFIDENCE`, or `INCOMPATIBLE`)
- `supporting_evidence` (e.g., `"Symptom 'sym_spots' strongly matches characteristic pathology."`)
- `conflicting_evidence` (e.g., `"Reported duration (>2 weeks) conflicts with acute late blight progression."`)
- `missing_evidence` (e.g., `"Presence of morning dew or high humidity unconfirmed."`)
- `contradictions`
- `ranking_reason`

### Strict Host Crop Gating
In legacy implementations, a tomato image passed into the model could erroneously return Potato Late Blight or Pepper Bacterial Spot simply because those classes were in the flat 38/39-class list.
In Phase 5:
- The farmer's selected crop acts as a host filter.
- Diseases not permitted on the host crop are strictly excluded from the host candidate list.
- If the model strongly predicts another crop's disease, the engine generates a `crop_mismatch` event, documents both hypotheses, and abstains from declaring a cross-crop winner.

---

## 5. Automated Test Suite and Real Execution Results

An automated test suite (`scratch/test_phase5_diagnosis_engine.py`) covering all 17 required scenarios was executed against the live backend.

### Test Results Summary

| # | Test Name | Scenario Tested | Outcome | Details |
|---|---|---|---|---|
| 1 | `test_valid_model_output_and_class_mapping` | Valid model index resolution | **PASS** | Indices 26, 27 resolved to `dis_tomato_early_blight` and `dis_tomato_late_blight`. |
| 2 | `test_unknown_or_duplicate_model_indices` | Duplicate & out-of-bounds indices | **PASS** | Index 0 duplicate and 999 rejected with `invalid_input`. |
| 3 | `test_missing_model_and_runtime_failure` | TensorFlow runtime DLL block | **PASS** | OS DLL block reported as `model_unavailable` without crashing. |
| 4 | `test_invalid_input_payload` | Empty/malformed questionnaire | **PASS** | Missing required fields rejected with validation error. |
| 5 | `test_unsupported_crop` | Unsupported crop selection | **PASS** | Unsupported crop returned `unsupported_crop` and KVK referral. |
| 6 | `test_crop_conflict_preservation` | Farmer Chilli vs Model Tomato | **PASS** | Disagreement preserved as `crop_mismatch` without silent override. |
| 7 | `test_unsupported_or_incompatible_organ` | Apple + ears/cobs | **PASS** | Incompatible organ triggered `organ_mismatch` abstention. |
| 8 | `test_contradictory_symptom_answers` | Model Healthy vs Severe Rot/Wilting | **PASS** | Contradiction triggered `expert_review_recommended`. |
| 9 | `test_missing_questionnaire_answers` | Sparse / unsure questionnaire answers | **PASS** | Sparse inputs handled gracefully without pipeline crash. |
| 10 | `test_multiple_candidates_differential_diagnosis` | Close candidate scores (0.48 vs 0.44) | **PASS** | Detected narrow margin (<0.15) and returned `multiple_candidates`. |
| 11 | `test_insufficient_evidence_and_abstention` | Low scores (<0.35) and unsure symptoms | **PASS** | Abstention status `insufficient_evidence` returned cleanly. |
| 12 | `test_provisional_threshold_handling` | Configurable heuristic thresholds | **PASS** | Verified provisional rules documented as uncalibrated heuristics. |
| 13 | `test_calibrated_vs_uncalibrated_metadata` | Score calibration disclosure | **PASS** | Labels scores as `uncalibrated_softmax` with explicit limitations. |
| 14 | `test_knowledge_base_references_integrity` | Authoritative knowledge citations | **PASS** | Validated 3 authoritative citations (ICAR, CABI, ANGRAU). |
| 15 | `test_follow_up_question_selection` | Ambiguous candidate follow-ups | **PASS** | Generated 2 targeted follow-up questions from Phase 4 config. |
| 16 | `test_schema_valid_api_responses` | Full response JSON Schema Draft-07 | **PASS** | Complete response payload strictly validated against schema. |
| 17 | `test_regression_protection_for_yield_and_legacy` | Regression safety on `/predict/predict-yield` | **PASS** | Yield forecast executed with `success=True` and valid yield metrics. |

**Total Tests:** 17  
**Tests Passed:** 17  
**Tests Failed:** 0  
**Overall Suite Result:** **PASS**

---

## 6. Actual Files Created and Modified

### Deliverables Created
1. `docs/agrovision_v2/phase5/PHASE_5_DIAGNOSIS_ENGINE_REPORT.md` (This master report)
2. `docs/agrovision_v2/phase5/diagnosis_response_schema.json` (JSON Schema Draft-07 response definition)
3. `docs/agrovision_v2/phase5/evidence_fusion_rules.json` (Configurable provisional fusion rules & weights)
4. `docs/agrovision_v2/phase5/decision_status_catalog.json` (Catalog of 10 decision & abstention statuses)
5. `docs/agrovision_v2/phase5/validation_results.json` (Machine-readable automated test execution log)

### Backend Source Code Created & Integrated
1. `backend/app/schemas/diagnosis_schema.py` (Pydantic models for request, response, candidates, and ledgers)
2. `backend/app/services/diagnosis_engine.py` (12-stage multimodal diagnosis engine and evidence fusion service)
3. `backend/app/routes/diagnosis.py` (Versioned FastAPI router exposing `/diagnosis/v1/diagnose`, `/statuses`, `/rules`)
4. `backend/app/main.py` (Mounted `diagnosis.router` under `/diagnosis`)
5. `scratch/test_phase5_diagnosis_engine.py` (Automated 17-test verification test runner)

---

## 7. Runtime Dependencies and Known Limitations

1. **TensorFlow Runtime Environment on Host**:
   - The host system enforces a Windows Application Control policy that blocks `_pywrap_tensorflow_lite_metrics_wrapper.pyd`.
   - The diagnosis engine handles this safely via defensive caching and probing: if called without mock scores, it reports `model_unavailable` honestly rather than crashing the server or faking predictions.
2. **Provisional Heuristic Weights**:
   - The fusion score weights (0.50 model, 0.25 primary symptom, 0.10 environmental prior) are provisional rule-based heuristics. They are marked as provisional in `evidence_fusion_rules.json` and must undergo formal empirical tuning on real-world test sets in future phases.
3. **No Co-Infection Disentanglement**:
   - As documented in the system limitations, the single-label classification architecture cannot reliably diagnose co-infections. If multiple diseases are present, the engine provides a differential candidate ranking rather than asserting a mixed infection.

---

## 8. Compatibility and Regression Verification

- **Preservation of Existing Functionality**:
  - The live legacy endpoint `POST /predict/predict-disease` remains untouched.
  - The yield forecasting engine `app/services/yield_engine.py` and `POST /predict/predict-yield` were tested and verified to operate with zero regressions.
  - Authentication, mandi market rates, weather feeds, and chatbot routes were unmodified.
- **Git Working Tree Integrity**:
  - All existing user uncommitted files and previous experiment checkpoints were preserved. No files were overwritten or deleted.
- **No Retraining**:
  - Zero models were trained, retrained, or deployed in this phase.

---

## 9. Verification Gate Summary

| # | Verification Gate Criteria | Evaluation | Evidence |
|---|---|---|---|
| 1 | Phase 2 taxonomy mappings validate | **PASS** | Validated against `crop_registry.json`, `disease_registry.json`, and `crop_organ_compatibility_matrix.json`. |
| 2 | Phase 4 questionnaire payloads validate | **PASS** | Validated via `QuestionnaireSubmissionRequest` Pydantic schema in Stage 1. |
| 3 | Model scores separated from calibrated confidence | **PASS** | Response metadata explicitly labels scores as `uncalibrated_softmax`. Heuristic composite score distinct from probability. |
| 4 | Crop and organ contradictions handled explicitly | **PASS** | Incompatible organs trigger `organ_mismatch`. Crop disagreement triggers `crop_mismatch`. |
| 5 | Evidence fusion is explainable and configurable | **PASS** | Rules configured in `evidence_fusion_rules.json`. Evidence ledger explains every candidate ranking. |
| 6 | Insufficient evidence can trigger abstention | **PASS** | Low scores or unsure answers trigger `insufficient_evidence` or `needs_more_information`. |
| 7 | Follow-up questions are valid and relevant | **PASS** | Selected dynamically from Phase 4 config for unanswered, crop-applicable questions. |
| 8 | Response schema validates | **PASS** | Strict validation against `diagnosis_response_schema.json` via `jsonschema.validate()`. |
| 9 | Automated tests actually execute | **PASS** | 17/17 automated tests executed and logged to `validation_results.json`. |
| 10 | Runtime failures reported honestly | **PASS** | Windows DLL block reported as `model_unavailable` without fabricated predictions. |
| 11 | Existing unrelated features and user changes preserved | **PASS** | `/predict/predict-yield` regression tested and passed; git working tree preserved. |
| 12 | No model was trained or deployed | **PASS** | Zero training scripts executed; zero checkpoint modifications. |
| 13 | No unsupported diagnosis or fabricated performance claim | **PASS** | Clear disclaimer of uncalibrated softmax logits and lack of accredited laboratory equivalence. |

**OVERALL PHASE 5 STATUS:** **PASS**
