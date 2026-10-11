# AgroVision AI 2.0 — Phase 5 Multimodal Diagnostic Integration Note

**Document ID:** `AV2-INT-005`  
**Phase Target:** Preparation for Phase 5 (Multimodal Diagnostic Reasoning Engine)  
**Schema Version:** 2.0.0  
**Integration Status:** Staged & Validated  

---

## 1. Objective & Architectural Role

The Phase 4 Adaptive Farmer Questionnaire produces verified, structured evidence receipts (`StructuredEvidenceReceipt`) rather than premature model inferences. 

In Phase 5, this structured evidence will be synthesized with visual feature extractors and agronomic knowledge priors into a multi-evidence diagnostic engine.

```
+-----------------------------------------------------------------------------------+
|                           PHASE 5 MULTIMODAL DIAGNOSTIC ENGINE                    |
+-----------------------------------------------------------------------------------+
                                          |
          +-------------------------------+-------------------------------+
          |                                                               |
+-----------------------+                                       +-------------------+
|  Stream A: Visual CNN |                                       | Stream B: Farmer  |
|  (ResNet/EfficientNet)|                                       | Structured Receipt|
+-----------------------+                                       +-------------------+
          |                                                               |
          |-- Visual Feature Vector                                       |-- Selected Crop
          |-- Organ Attention Saliency                                    |-- Affected Organ
          |-- Top-K Image Candidates                                      |-- Symptom IDs
          |                                                               |-- Field Context
          +-------------------------------+-------------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      | Bayesian / Evidential Fusion Head     |
                      | 1. Crop Gating (Eliminate cross-crop) |
                      | 2. Organ Masking                      |
                      | 3. Symptom Prior Weighting            |
                      | 4. Epistemic Uncertainty Estimation   |
                      +---------------------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      | Final Diagnosis or Explicit Referral  |
                      +---------------------------------------+
```

---

## 2. Ingestion Interface Specification

Phase 5 diagnostic endpoints (`POST /predict/multimodal-diagnose`) will consume the `QuestionnaireSubmissionRequest` payload or the verified `receipt_id`.

### Input Schema Fields Consumed by Phase 5

| Field | Source Type | Phase 5 Consumption & Mathematical Role |
| :--- | :--- | :--- |
| `selected_crop_id` | Canonical ID | **Hard Hierarchical Gate:** Restricts the candidate disease hypothesis space to only diseases biologically associated with the selected crop in `crop_registry.json`. Completely prevents cross-crop false alarms (e.g., prevents Potato field photos from predicting Chilli). |
| `crop_selection_source` | Enum | **Confidence Weighting:** If `farmer_manual` or `farmer_confirmed_model`, prior confidence is high ($w_{crop} = 0.95$). If `unsure`, the visual crop classifier runs in joint open-set mode. |
| `affected_organ` | Vocabulary ID | **Organ Masking & Saliency Validation:** If the organ is `ears_cobs` or `fruits`, foliar-only disease hypotheses (e.g. Cercospora Leaf Spot) have their likelihood penalized according to `crop_organ_compatibility_matrix.json`. |
| `symptom_ids` | List of IDs | **Symptom Compatibility Prior:** Each disease profile in `disease_registry.json` maintains characteristic symptoms. The likelihood is scaled by the Jaccard similarity or log-likelihood ratio of reported vs expected symptoms. |
| `symptom_duration` | Enum | **Etiological Progression Filter:** Distinguishes acute airborne blights (1–3 days) from chronic abiotic nutritional chlorosis (>2 weeks). |
| `spread_rate` | Enum | **Epidemiological Rate Modifier:** Rapidly multiplying symptoms upweight fungal/bacterial pathogens over non-transmissible abiotic stresses. |
| `weather_and_field_conditions` | List of IDs | **Environmental Conduciveness Score:** Wet/humid conditions upweight *Phytophthora* and *Venturia* (Late Blight, Scab); dry heat upweights mites and Begomoviruses (Leaf Curl). |
| `visible_pests` | Enum | **Vector-Borne Pathogen Multiplier:** Live whitefly or aphid observations increase the prior probability of Begomoviruses (e.g. Chilli Leaf Curl, Tomato Yellow Leaf Curl). |
| `previous_treatment` | Enum & text | **Phytotoxicity / Resistance Flag:** If a fungicide was applied recently and symptoms persist, warns against simple re-spraying and flags potential chemical resistance or non-fungal etiology. |
| `image_reference` | Object / Upload | **Visual Tensor Extraction:** The uploaded raw image is passed through the preprocessed vision backbone to generate logits $P(D \mid I)$. |

---

## 3. Discrepancy & Conflict Resolution Invariants

Phase 5 must handle disagreements gracefully without silent overwrites:

1. **Visual Model Disagrees with Farmer's Crop Selection:**
   - If visual crop classifier predicts `crop_tomato` with 88% confidence, but farmer explicitly selected `crop_chilli`:
   - Phase 5 **does not silently overwrite** either.
   - It computes conditional predictions for both hypotheses: $P(D \mid I, \text{Crop}=\text{Chilli})$ and $P(D \mid I, \text{Crop}=\text{Tomato})$.
   - It alerts the user: *"Visual model detected Tomato foliage features, but you selected Chilli. Presenting diagnoses for both possibilities."*
2. **Unsupported Organ Combination:**
   - If farmer selected `crop_apple` and `ears_cobs` (unsupported organ), Phase 5 preserves uncertainty and logs `INCOMPATIBLE_ORGAN_FOR_CROP`, refusing to output an unverified fruit-rot diagnosis.
3. **Missing or Skipped Fields:**
   - When optional fields are in `unknown_or_skipped_fields`, the Bayesian engine sets the corresponding likelihood factor to $1.0$ (neutral prior), ensuring missing context never blocks diagnostic inference.

---

## 4. Phase 5 Implementation Staging Checklist

- [ ] Connect `questionnaire_service` structured output into Phase 5 diagnostic service.
- [ ] Implement Bayesian evidence fusion combining visual softmax logits with questionnaire symptom vectors.
- [ ] Wire epistemic uncertainty thresholds (softmax entropy > threshold $\rightarrow$ trigger explicit referral to Krishi Vigyan Kendra).
- [ ] Update frontend to display evidence breakdown alongside visual bounding box/mask overlays.
