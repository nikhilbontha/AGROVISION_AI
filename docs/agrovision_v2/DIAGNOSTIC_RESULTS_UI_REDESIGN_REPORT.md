# AgroVision AI 2.0 — Diagnostic Results Page UI/UX Redesign Report

**Date:** October 11, 2026  
**Status:** Verification Passed (10/10 Scenarios Validated)  
**Target File:** `frontend/src/components/AdaptiveQuestionnaire.jsx`  
**Integration Scope:** Disease Detection Assessment Report (Step 7)  

---

## 1. Executive Summary & Design Rationale

Prior to this redesign, the disease diagnosis results page suffered from severe information overload:
- It presented up to five raw candidate cards simultaneously with distracting progress bars.
- It repeated large evidence-ledger containers displaying internal taxonomy strings (e.g., `dis_chilli_healthy`, `crop_oil_palm`).
- It displayed technical backend internals (engine version, model identifier, routing mode, raw calibration flags) prominently at the top of the report.
- Farmers struggled to answer fundamental questions: *What disease is suspected? How certain is this finding? What should I do right now?*

The redesigned results interface transforms the diagnostic output into a clean, farmer-first, clinical agricultural report structured around seven strictly prioritized sections:
1. **Section A — Compact Diagnosis Header:** Clean title, selected crop badge, plant organ, date/time, and high-level plain-language status.
2. **Section B — Main Result Card:** Displays only the single best-supported diagnosis (or an unforced message if evidence is weak or inconclusive). Accurately labels heuristic evidence score without claiming calibrated probability.
3. **Section C — Crop Mismatch & Uncertainty Notice:** Highlights visual vs selected crop discrepancies with explicit safety warnings.
4. **Section D — Symptoms and Possible Causes:** Separates farmer-reported symptoms, visible image symptoms, and environmental risk factors, clearly noting observed vs inferred pathogen drivers.
5. **Section E — Prioritized Recommended Actions:** Actionable 4-step protocol: `1. Do Now`, `2. Prevent Spread`, `3. Monitor`, and `4. Seek Expert Help`. Gated CIBRC chemical treatments.
6. **Section F — Plausible Alternatives:** Shows at most two meaningful alternatives behind a collapsible toggle, complete with distinguishing symptoms.
7. **Section G — Expandable Technical Details:** Safely tucks model identifiers, raw softmax scores, ledger traces, and citations behind a technical drawer.

---

## 2. Component Architecture & Section Breakdown

| Section | Farmer Question Answered | Data Source | Safety & Clarity Rules |
| :--- | :--- | :--- | :--- |
| **Section A: Compact Header** | *What crop was selected? When?* | `selectedCrop`, `diagnosisResult.affected_organ`, `timestamp` | Replaces technical enums with 4 farmer-friendly statuses: `Likely Diagnosis`, `Uncertain — More Evidence Needed`, `Crop Mismatch`, or `Expert Review Recommended`. |
| **Section B: Main Result Card** | *What disease is suspected? How reliable is it?* | `candidate_diagnoses[0]`, `leadingLedger.supporting_evidence` | Only rendered if evidence score $\ge 40\%$ and crop matches. If inconclusive, renders clear notice: *"We could not confidently identify the disease from this image."* |
| **Section C: Crop Mismatch Notice** | *Why is the result uncertain?* | `selected_crop_id` vs `visually_predicted_crop_id` | Shows both crops side-by-side. Forbids chemical pesticide advice on mismatched crops. Explains that selected crop restricts hypotheses but is not visual proof. |
| **Section D: Symptoms & Causes** | *What caused this problem?* | `selectedSymptoms`, `selectedConditions`, `growthStage`, `leadingLedger` | Distinguishes observed lesions from inferred pathogen life cycles. Highlights high moisture / humidity risks. |
| **Section E: Recommended Actions** | *What should the farmer do next? When to call an expert?* | `recommendations.what_to_do_now`, `cultural_preventative_measures`, `symptoms_to_check`, `when_to_seek_expert_help` | Prioritized 4-step sequence (Do Now, Prevent Spread, Monitor, Seek Expert Help). Strict gate on CIBRC chemical advice (`guidance_permitted`). |
| **Section F: Plausible Alternatives** | *Could it be something else?* | `candidate_diagnoses[1:3]`, `recommendations.look_alikes` | Bounded to at most 2 plausible alternatives ($\ge 5\%$ score). Default state: collapsed. Shows single distinguishing symptom per candidate. |
| **Section G: Technical Trace** | *Full traceability for scientists / developers* | `raw_model_scores`, `model_version`, `diagnosis_engine_version`, `knowledge_references` | Collapsed by default. Contains unconditioned top-5 softmax activations, candidate calibration states, and citations. |

---

## 3. Data-Contract & Integrity Guarantees

1. **No Data Fabrication:** Every displayed common name, scientific name, score, dosage, and warning is bound directly to actual backend Pydantic models (`DiagnosisResponse`, `RecommendationResponse`).
2. **Probability vs Heuristic Clarification:** The evidence score is explicitly described as an uncalibrated heuristic multimodal score. The terms "calibrated probability" or "Bayesian posterior" are strictly omitted.
3. **Chemical Recommendation Withholding:** If `guidance_permitted` is `False` (due to low certainty, crop mismatch, or virus etiology), pesticide recommendations are completely withheld, and an informative safety notice is displayed.
4. **Defensive UI Rendering:** Wrapped the entire questionnaire in a React `QuestionnaireErrorBoundary` with string guards (`String(val || '')`) to guarantee the page never breaks into a blank screen.

---

## 4. Verification & Automated Test Results

The redesign was validated against the 10 mandated scenarios via `scratch/test_redesigned_ui_scenarios.py`:

| # | Test Scenario | Verified System Behavior | Status |
| :---: | :--- | :--- | :---: |
| **1** | Supported, well-supported diagnosis | Leading card: Tomato Late Blight (98% Evidence). CIBRC Metalaxyl advice displayed. | **PASS** |
| **2** | Uncertain diagnosis (Multiple Candidates) | Inconclusive state card rendered. Chemical advice safely withheld. | **PASS** |
| **3** | Crop mismatch (Selected Tomato, Detected Chilli) | Prominent Section C mismatch card. Visual (88%) vs Farmer selection contrasted. | **PASS** |
| **4** | Unsupported crop | Out-of-catalog safeguard triggered. Expert review recommended. | **PASS** |
| **5** | Poor quality / insufficient evidence | Low-resolution safety gate engaged. Inconclusive card displayed with photo tips. | **PASS** |
| **6** | Diagnosis with no verified chemical treatment | Viral etiology (Tomato Mosaic Virus): Chemical advice withheld; cultural rogueing shown. | **PASS** |
| **7** | Diagnosis with two plausible alternatives | Rice Blast leading; Rice Brown Spot and BLB bounded to max 2 in Section F. | **PASS** |
| **8** | Diagnosis with no alternatives | Apple Scab (99%): Section F cleanly omitted without empty containers. | **PASS** |
| **9** | Response with missing optional fields | Graceful rendering using safe defaults; zero runtime errors. | **PASS** |
| **10** | Compatibility with yield prediction | Clean coexistence in full platform bundle. Zero cross-feature regressions. | **PASS** |

### Production Build Validation
- **Command:** `npm run build`
- **Output:** `✓ built in 1.00s` (2,861 modules transformed, 0 errors).
- **Vite Dev Server:** Hot Module Replacement (HMR) verified live on `http://localhost:5173/disease-detection`.

---

## 5. Changed Files Summary

- `frontend/src/components/AdaptiveQuestionnaire.jsx`:
  - Added `ChevronDown`, `ChevronUp`, `Printer` imports.
  - Added `showTechnicalDetails`, `showAlternatives`, and `diagnosisTimestamp` states.
  - Redesigned Step 7 report rendering into Sections A through G.
  - Added `QuestionnaireErrorBoundary` protective component.
- `scratch/test_redesigned_ui_scenarios.py`:
  - Created automated 10-scenario contract verification suite.
- `docs/agrovision_v2/DIAGNOSTIC_RESULTS_UI_REDESIGN_REPORT.md`:
  - Complete technical report and design audit.
