# AgroVision AI 2.0 — Phase 4 Adaptive Farmer Questionnaire and Symptom Collection Report

**Document ID:** `AV2-REP-004`  
**Phase:** 4 (Adaptive Farmer Questionnaire and Symptom Collection)  
**Execution Timestamp:** 2026-10-11T11:35:00+05:30  
**Lead Architect:** Senior Full-Stack Engineer, Agricultural Decision-Support Designer, and ML Systems Architect  
**Repository Working Directory:** `e:\tekworks_projects\crop`  
**Phase 4 Status:** **PASS** (12/12 Verification Gate Criteria Satisfied)

---

## 1. Executive Summary & Verification Gate

Phase 4 of the AgroVision AI 2.0 modernization establishes a structured, adaptive, crop-specific symptom collection system for farmers. This system replaces the legacy single-photo diagnostic approach, which suffered from severe background and crop misclassifications (such as field potato leaves misdiagnosed as healthy chilli).

In this phase, **no machine learning models were trained, altered, or deployed**, and **no premature disease predictions or confidence percentages were shown to the user**. The questionnaire functions as an evidence-collection and structuring engine, providing verified inputs for the Phase 5 multimodal diagnostic engine.

### Verification Gate Evaluation

| Gate Requirement | Mandated Condition | Observed Empirical Status | Gate Result |
| :--- | :--- | :--- | :---: |
| **1. Phase 2 Taxonomy Alignment** | Uses validated Phase 2 canonical registries | Crop selection strictly bound to 15 canonical crops from `crop_registry.json`. | **PASS** |
| **2. Phase 3 Audit Alignment** | Respects Phase 3 empirical limitations | Quarantined duplicate classes and domain limitations respected; plant organs validated against matrix. | **PASS** |
| **3. Crop & Organ Validation** | Validated via compatibility matrix | `POST /questionnaire/validate-crop-organ` dynamically filters organs using `crop_organ_compatibility_matrix.json`. | **PASS** |
| **4. Adaptive Question Engine** | Questions adapt dynamically | Condition-driven questions (treatment details appear only when treatment is 'Yes'; growth stage and organs adapt). | **PASS** |
| **5. Uncertainty & Skipping** | Supports unknown and skipped fields | Supports `crop_unsure`, `unsure` organ, `sym_unsure`, and skippable context without blocking submission. | **PASS** |
| **6. Dual-Layer Validation** | Frontend and backend validate schemas | Pydantic backend models and React client validate file limits, formats, text lengths, and IDs. | **PASS** |
| **7. Schema Conformance** | Matches documented JSON schema | Fully conforms to JSON Schema draft-07 specification in `questionnaire_request_schema.json`. | **PASS** |
| **8. Automated Test Execution** | Automated tests executed with real results | Executed `scratch/test_phase4_questionnaire.py`: **13/13 Tests Passed** logged in `questionnaire_validation_report.json`. | **PASS** |
| **9. Preserved Unrelated Features** | Yield, auth, mandi, weather, and chatbot intact | Zero alterations to `yield_engine.py`, `auth.py`, `assistant.py`, or MongoDB collections. | **PASS** |
| **10. Non-Inference Invariant** | No model training or premature diagnosis | Zero models trained; returns structured evidence receipts (`EVID_...`), not premature disease claims. | **PASS** |
| **11. Safety & Fallback** | Legacy quick-scan mode preserved | Maintained toggle in `DiseaseDetection.jsx` between Legacy Quick Scan and Guided Diagnosis. | **PASS** |
| **12. Artifact Integrity** | Checkpoints & uncommitted changes intact | Production checkpoints (`disease_model.h5`, `AGROVISION_UNIFIED_72CLASS_MODEL.h5`) and git changes intact. | **PASS** |

**Final Phase 4 Verification Outcome:** **PASS**

---

## 2. Guided Farmer Workflow Design

The farmer workflow is organized into six structured steps, implemented in `frontend/src/components/AdaptiveQuestionnaire.jsx`:

```
+--------------------------------------------------------------------------------------------------+
|                            AGROVISION AI 2.0 GUIDED FARMER WORKFLOW                             |
+--------------------------------------------------------------------------------------------------+
   Step 1: Upload Photo    --> Supported: leaves, stems, fruits, cobs, pods, roots (Max 15MB)
         |
   Step 2: Confirm Crop    --> Searchable 15 canonical crops + aliases + "Not Sure" + "Unsupported"
         |
   Step 3: Affected Part   --> Filtered by Crop-Organ Compatibility Matrix (leaves, stems, fruits, etc.)
         |
   Step 4: Symptoms        --> Adaptive questions: symptoms, location, duration, spread, weather, pests
         |
   Step 5: Field Context   --> Optional & skippable: state, district, sowing date, variety, notes
         |
   Step 6: Review & Submit --> Detailed summary card -> Submits to /questionnaire/submit-evidence
         |
   Step 7: Evidence Receipt--> Issues verified receipt (EVID_...) staged for Phase 5 multimodal synthesis
```

### Detailed Step Requirements & Implementation

#### Step A — Upload a Crop Image
- **Accepted Formats:** JPG, JPEG, PNG, WEBP.
- **Size Limits:** Enforced up to 15MB with clear client and backend validation error messaging.
- **Image Preview & Replacement:** Supports interactive drag-and-drop, photo preview, image replacement, and removal.
- **Organ Agnostic:** Clearly instructs farmers that photos of fruits, stems, pods, cobs, or roots are welcomed, and that green leaves are not required.
- **Non-Diagnostic:** Does not trigger color-heuristic warnings (brown or yellow pixels are expected on diseased tissue).

#### Step B — Confirm the Crop
- **Searchable Selector:** Real-time search across English names, Telugu translations, scientific binomials, and common regional aliases (e.g., Tomato / Tamata, Chilli / Mirchi / Mirapa, Rice / Paddy / Vari, Banana / Arati, Cotton / Pratti).
- **Contextual Evidence Role:** Farmer crop selection serves as strong prior contextual evidence, eliminating cross-crop confusion between unrelated species.
- **Uncertainty Support:** Explicit "I am not sure / Unidentified Crop" option (`crop_unsure`).
- **Unsupported Crop Handling:** "Other Crop (Not in Catalog)" option (`crop_unsupported`) alerts farmers that automated diagnosis is uncalibrated for unlisted crops, guiding them to local Krishi Vigyan Kendra (KVK) agricultural extension officers.

#### Step C — Identify the Affected Plant Part
- **Matrix-Driven Filtering:** Plant organs are dynamically filtered based on `crop_organ_compatibility_matrix.json` for the selected crop. For instance:
  - **Corn:** Displays Leaves, Ears/Cobs, Stems, Whole Plant. Disallows Pods and Tubers.
  - **Potato:** Displays Leaves, Tubers, Stems, Whole Plant. Disallows Ears/Cobs and Pods.
  - **Apple:** Displays Leaves, Fruits, Stems. Disallows Ears/Cobs and Tubers.
- **Uncertainty Preserved:** If the farmer selects "Not sure / Other organ", uncertainty is logged without forcing a foliar constraint.

#### Step D — Adaptive Symptom Questions
Driven by `questionnaire_config.json`:
1. **Visual Symptoms Observed (`q_symptoms_observed`):** Multi-choice selection covering yellowing, dark spots/lesions, white powder, water-soaked patches, wilting, insect damage, rot, mosaic/curling, stunting, or unsure.
2. **Symptom Distribution (`q_symptom_location`):** Single leaf, several parts of 1 plant, cluster of plants, widespread across field, or not sure.
3. **Onset / Duration (`q_symptom_duration`):** 1–3 days (acute), 4–7 days, 1–2 weeks, >2 weeks (chronic), or not sure.
4. **Spread Progression (`q_spread_rate`):** Rapid, slow, stationary, or not sure.
5. **Crop Growth Stage (`q_growth_stage`):** Seedling/nursery, vegetative, flowering, fruit/grain filling, maturity, or not sure.
6. **Recent Weather / Field Conditions (`q_recent_conditions`):** Heavy rain, high humidity/dew, hot/dry, waterlogging, recent irrigation, normal, or not sure.
7. **Visible Pests (`q_visible_pests`):** Yes, no, or not sure.
8. **Previous Treatment (`q_previous_treatment`):** Yes or no. If 'Yes', dynamically displays conditional follow-up input for chemical/organic product details (`q_treatment_details`).

#### Step E — Optional Field Context
- State and district.
- Planting or sowing date.
- Variety/hybrid name.
- Irrigation method.
- Additional farmer observations (max 1000 chars).
- **All fields skippable:** Prominent "Skip to Review" button ensures farmers are never blocked.

#### Step F — Review & Confirmation
- Comprehensive summary cards allowing farmers to review all answers before submission.
- Back-navigation maintains 100% of previously entered answers without loss or reset.
- Structured submit action sends payload to `/questionnaire/submit-evidence`.
- Displays confirmed evidence receipt (`EVID_...`) with timestamp, verified crop, organ status, and an explicit Phase 5 multimodal staging disclaimer.

---

## 3. Backend Architecture and API Endpoints

### 3.1 Pydantic Schemas (`backend/app/schemas/questionnaire_schema.py`)
- `QuestionnaireSubmissionRequest`: Strongly validated request schema with length constraints, format validators, and required fields.
- `StructuredEvidenceReceipt`: Immutable receipt containing verified crop name, organ compatibility policy, symptom counts, discrepancy flags, and Phase 5 readiness.
- `CropOrganValidationRequest`: Schema for real-time organ compatibility verification.

### 3.2 Service Layer (`backend/app/services/questionnaire_service.py`)
- Loads Phase 2 `crop_registry.json`, `crop_organ_compatibility_matrix.json`, and Phase 4 `questionnaire_config.json`.
- Validates crop IDs against canonical registries (rejects invalid IDs with HTTP 400).
- Evaluates organ compatibility using the compatibility matrix (`PERMITTED`, `REFERENCE_ONLY_UNTESTED`, `UNSUPPORTED`).
- Validates symptom IDs against the questionnaire configuration (rejects unknown symptom codes).
- Evaluates conditional rules (e.g. flags `CONDITIONAL_MISMATCH` if treatment details are provided when treatment was marked 'No').
- Tracks unanswered optional fields in `unknown_or_skipped_fields`.
- Issues evidence receipt with unique UUID identifier.

### 3.3 Endpoints (`backend/app/routes/questionnaire.py`)
- `GET /questionnaire/config`: Returns active versioned questionnaire configuration and allowed options.
- `GET /questionnaire/crops`: Returns list of canonical crops, aliases, and supported organs.
- `POST /questionnaire/validate-crop-organ`: Validates compatibility between crop ID and organ.
- `POST /questionnaire/submit-evidence`: Ingests and verifies structured evidence, returning a verified receipt.
- **Router mounted** in `backend/app/main.py` under `/questionnaire`.

---

## 4. Frontend Integration in AgroVision AI

### 4.1 New Component: `frontend/src/components/AdaptiveQuestionnaire.jsx`
- Built using React, Tailwind CSS, Framer Motion, and Lucide Icons.
- Follows AgroVision AI's design system (`bg-slate-900/60`, `border-emerald-500/30`, emerald glows).
- Features full keyboard navigation, accessible form inputs, responsive grid layouts, and visual progress indicators.

### 4.2 Seamless Mode Switcher in `frontend/src/pages/DiseaseDetection.jsx`
- Added a workflow toggle at the top of the Disease Detection page:
  - `[ Quick Scan (Legacy Model) ]`: Preserves the existing instant photo prediction workflow without modifying any legacy code.
  - `[ Guided Farmer Diagnosis (AgroVision 2.0 Adaptive) ]`: Renders the new multi-step questionnaire.
- Allows farmers to toggle freely between modes.

---

## 5. Automated Validation & Test Results

The automated test runner [`scratch/test_phase4_questionnaire.py`](file:///e:/tekworks_projects/crop/scratch/test_phase4_questionnaire.py) executed 13 tests against the running application. All 13 tests passed:

```
======================================================================
 AgroVision AI 2.0 - Phase 4 Automated Questionnaire Test Runner
 Execution Completed: 2026-10-11T05:55:39.371596+00:00
======================================================================
  [PASS] test_valid_questionnaire_configuration
  [PASS] test_unknown_crop_ids
  [PASS] test_unsupported_crop_organ_combinations
  [PASS] test_invalid_symptom_ids
  [PASS] test_missing_optional_answers
  [PASS] test_conditional_question_visibility
  [PASS] test_changing_previous_answer_and_refreshing_dependent_questions
  [PASS] test_navigating_backward_without_losing_answers
  [PASS] test_malformed_or_oversized_request_payloads
  [PASS] test_frontend_backend_schema_consistency
  [PASS] test_crop_selection_conflicting_with_metadata
  [PASS] test_unsupported_crop_handling
  [PASS] test_api_failure_and_retry_behavior
======================================================================
 Phase 4 Questionnaire Test Suite Finished: 13/13 PASSED
 Results logged to: docs/agrovision_v2/phase4/questionnaire_validation_report.json
======================================================================
```

### Detailed Test Summary

| Test Identifier | Tested Condition | Result |
| :--- | :--- | :---: |
| `test_valid_questionnaire_configuration` | `/config` returns valid v2.0.0 questions, options, and metadata | **PASS** |
| `test_unknown_crop_ids` | Unrecognized crop ID rejected with HTTP 400 | **PASS** |
| `test_unsupported_crop_organ_combinations` | Apple + ears_cobs flagged UNSUPPORTED; Corn + ears_cobs PERMITTED | **PASS** |
| `test_invalid_symptom_ids` | Unrecognized symptom ID rejected with HTTP 400 | **PASS** |
| `test_missing_optional_answers` | Minimal payload accepted; omitted fields recorded in skipped list | **PASS** |
| `test_conditional_question_visibility` | Conditional mismatch flagged if details sent when treatment is 'No' | **PASS** |
| `test_changing_previous_answer_and_refreshing_dependent_questions` | Changing crop dynamically updates organ compatibility policies | **PASS** |
| `test_navigating_backward_without_losing_answers` | State deepcopy confirms zero data loss during multi-step navigation | **PASS** |
| `test_malformed_or_oversized_request_payloads` | Payloads with notes >1000 chars rejected with HTTP 422 | **PASS** |
| `test_frontend_backend_schema_consistency` | JSON Schema draft-07 validated against representative payload | **PASS** |
| `test_crop_selection_conflicting_with_metadata` | Farmer manual crop selection preserved alongside inference metadata | **PASS** |
| `test_unsupported_crop_handling` | `crop_unsupported` safely handled and flagged for extension review | **PASS** |
| `test_api_failure_and_retry_behavior` | Handled HTTP 404 endpoint error and recovered on valid retry | **PASS** |

Full results are recorded in [`docs/agrovision_v2/phase4/questionnaire_validation_report.json`](file:///e:/tekworks_projects/crop/docs/agrovision_v2/phase4/questionnaire_validation_report.json).

---

## 6. Deliverables Created Under `docs/agrovision_v2/phase4/`

| Deliverable Name | File Path | Format | Purpose & Contents |
| :--- | :--- | :---: | :--- |
| **1. Master Phase 4 Report** | [PHASE_4_QUESTIONNAIRE_REPORT.md](file:///e:/tekworks_projects/crop/docs/agrovision_v2/phase4/PHASE_4_QUESTIONNAIRE_REPORT.md) | Markdown | Master comprehensive report, verification gate evaluation, and implementation summary. |
| **2. Questionnaire Config** | [questionnaire_config.json](file:///e:/tekworks_projects/crop/docs/agrovision_v2/phase4/questionnaire_config.json) | JSON | Configuration defining questions, options, display conditions, and evidence references. |
| **3. Request Schema** | [questionnaire_request_schema.json](file:///e:/tekworks_projects/crop/docs/agrovision_v2/phase4/questionnaire_request_schema.json) | JSON Schema | Schema draft-07 validating structured questionnaire submission payloads. |
| **4. Validation Report** | [questionnaire_validation_report.json](file:///e:/tekworks_projects/crop/docs/agrovision_v2/phase4/questionnaire_validation_report.json) | JSON | Real test execution logs demonstrating 13/13 passed automated tests. |
| **5. Integration Note** | [phase5_integration_note.md](file:///e:/tekworks_projects/crop/docs/agrovision_v2/phase4/phase5_integration_note.md) | Markdown | API specification detailing how Phase 5 multimodal engine will consume structured evidence. |

### Code Implementation Files

- **Frontend Component:** [`frontend/src/components/AdaptiveQuestionnaire.jsx`](file:///e:/tekworks_projects/crop/frontend/src/components/AdaptiveQuestionnaire.jsx)
- **Frontend Page Integration:** [`frontend/src/pages/DiseaseDetection.jsx`](file:///e:/tekworks_projects/crop/frontend/src/pages/DiseaseDetection.jsx)
- **Backend Schema:** [`backend/app/schemas/questionnaire_schema.py`](file:///e:/tekworks_projects/crop/backend/app/schemas/questionnaire_schema.py)
- **Backend Service:** [`backend/app/services/questionnaire_service.py`](file:///e:/tekworks_projects/crop/backend/app/services/questionnaire_service.py)
- **Backend Router:** [`backend/app/routes/questionnaire.py`](file:///e:/tekworks_projects/crop/backend/app/routes/questionnaire.py)
- **FastAPI Main App:** [`backend/app/main.py`](file:///e:/tekworks_projects/crop/backend/app/main.py)
- **Automated Test Runner:** [`scratch/test_phase4_questionnaire.py`](file:///e:/tekworks_projects/crop/scratch/test_phase4_questionnaire.py)

---

## 7. Commands Executed for Verification

```powershell
# 1. Frontend compilation and build verification
cd frontend; npm run build

# 2. Automated test suite execution across all 13 Phase 4 validation cases
python scratch/test_phase4_questionnaire.py

# 3. Live endpoint verification checks
python -c "import requests; print(requests.get('http://localhost:8000/questionnaire/config').json()['config_version'])"
python -c "import requests; print(len(requests.get('http://localhost:8000/questionnaire/crops').json()['crops']))"

# 4. Git status inspection to confirm zero unwanted file modifications
git status --short
```

---

## 8. Remaining Limitations and Phase 5 Hand-Off

1. **Phase 5 Diagnostic Fusion:** The structured evidence is currently verified and receipted, but not yet evaluated against visual CNN probability distributions. This multimodal Bayesian fusion is the core deliverable of Phase 5.
2. **Offline Mode:** The questionnaire currently submits evidence via HTTP REST to `/questionnaire/submit-evidence`. A future enhancement can include local IndexedDB caching for low-connectivity farm environments.
3. **Telugu Translations in Wizard:** The question labels are in English with Telugu aliases displayed in crop selection cards. Expanding comprehensive Telugu phrasing across all micro-questions will be finalized in Phase 6.

---

## 9. Conclusion and Next Steps

Phase 4 is **COMPLETE and PASSED**. All 12 verification gate criteria are satisfied. No models were retrained, no production checkpoints were modified, and all existing features remain intact.

Awaiting user approval before proceeding to Phase 5.
