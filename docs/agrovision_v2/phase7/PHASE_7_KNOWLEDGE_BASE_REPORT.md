# AgroVision AI 2.0 — Phase 7 Agricultural Knowledge Base and Evidence-Based Recommendations Report

**Document Version:** 2.0.0  
**Phase:** Phase 7 — Agricultural Knowledge Base and Evidence-Based Recommendations  
**Author:** Senior Agricultural Knowledge Engineer, Plant Pathologist, Extension Researcher & Backend Architect  
**Status:** COMPLETED & PASSED  
**Execution Timestamp:** 2026-10-11T06:39:06Z  

---

## Executive Summary

Phase 7 constructs a structured, versioned, evidence-based agricultural knowledge base and recommendation service for **AgroVision AI 2.0**. In conventional plant disease detection systems, a classification label is often linked directly to an uncalibrated chemical recommendation without regard for diagnostic certainty, local regulatory pesticide approvals, biological look-alikes, or regional agro-climatic conditions.

Phase 7 eliminates this hazard:
1. **Canonical Taxonomy Alignment**: The knowledge base establishes 75 standardized knowledge records mapped 1-to-1 to the Phase 2 canonical crop and disease registries (`crop_registry.json` and `disease_registry.json`).
2. **Institutional Source Grounding**: All substantive symptom descriptions, look-alike field differentiators, biological controls, and cultural practices are anchored in authoritative institutional sources:
   - **PJTSAU** (*Vyavasaya Panchangam* 2024 for Telangana)
   - **ANGRAU** (*Crop Protection Diagnostic Guide* 2024 for Andhra Pradesh)
   - **ICAR-NCIPM / ICAR-IIRR / ICAR-CICR** (National Integrated Pest Management Packages)
   - **CIBRC** (Central Insecticides Board & Registration Committee, Ministry of Agriculture, Govt. of India)
3. **Pesticide Safety & Label Compliance**: Only active ingredients with statutory CIBRC label-claim registrations or State Agricultural University packages of practices are listed. Cross-crop extrapolation is strictly prohibited. Unverified chemical claims (such as direct chemical cures for plant viruses or fastidious phloem bacteria like Citrus Greening) are explicitly excluded.
4. **Diagnostic Status Gating**: The recommendation service connects to Phase 5's decision engine and enforces strict safety gating: **disease-specific chemical recommendations are withheld whenever the diagnosis status is uncertain** (e.g. `multiple_candidates`, `needs_more_information`, `crop_mismatch`, `organ_mismatch`, `insufficient_evidence`, `model_unavailable`, `expert_review_recommended`).
5. **Telangana & Andhra Pradesh Regionalization**: Recommendations incorporate agroclimatic zone contexts across 6 key agricultural zones in Telangana and Andhra Pradesh, aligning with Kharif (*Vanakkalam / Sarva*) and Rabi (*Yasangi / Dalva*) seasonal pressures.
6. **Automated Verification**: All 12 automated unit and integration tests passed (**12/12 PASSED**), confirming schema validation, reference integrity, antiviral restrictions, status gating, missing record safety, and zero regression.

---

## 1. Knowledge Base Architecture and Schema Design

The knowledge base schema (`docs/agrovision_v2/phase7/knowledge_base_schema.json`) enforces a rigorous, versioned Draft-07 JSON Schema contract. Every knowledge record decouples disease pathology from raw model predictions and incorporates 23 structured fields:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           KNOWLEDGE RECORD SCHEMA                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│ • Identification:     knowledge_record_id, crop_id, disease_id, canonical_name  │
│ • Pathology:          condition_type, pathogen_type, scientific_name            │
│ • Symptoms:           affected_organs, typical_symptoms, early, advanced        │
│ • Epidemiology:       conditions_favoring_development, transmission_or_spread   │
│ • Differential Field: common_look_alikes, diagnostic_distinguishing_features    │
│ • IPM Management:     cultural, mechanical, biological, verified chemical       │
│ • Field Actions:      prevention_practices, monitoring_guidance, when_seek_help │
│ • Regional Context:   states, priority districts, seasons, regional varieties   │
│ • Governance:         evidence_references, review_status, last_reviewed_date    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Condition & Pathogen Types Taxonomy
- **Condition Types:** `infectious_disease`, `physiological_disorder`, `pest_infestation`, `healthy_condition`
- **Pathogen Types:** `fungal`, `bacterial`, `viral`, `oomycete`, `phytoplasma`, `physiological`, `insect_pest`, `none`

---

## 2. Crop and Disease Coverage

The knowledge base covers all **16 canonical crops** and **75 canonical conditions** in the AgroVision 2.0 taxonomy:

| Crop Identifier | Crop Common Name | Covered Conditions | Key Diseases & Conditions Covered |
|---|---|:---:|---|
| `crop_rice` | Rice / Paddy | 8 | Blast (*Magnaporthe oryzae*), Bacterial Leaf Blight, Brown Spot, Sheath Blight, Tungro, Healthy |
| `crop_tomato` | Tomato | 10 | Early Blight (*Alternaria solani*), Late Blight (*Phytophthora infestans*), Bacterial Spot, Leaf Mold, Mosaic, Yellow Leaf Curl, Healthy |
| `crop_chilli` | Chilli | 8 | Anthracnose / Dieback (*Colletotrichum capsici*), Damping Off, Bacterial Spot, Leaf Curl Virus, Mosaic, Healthy |
| `crop_cotton` | Cotton | 5 | Bacterial Blight (*Xanthomonas citri*), Alternaria Leaf Spot, Fusarium Wilt, Grey Mildew, Healthy |
| `crop_mango` | Mango | 8 | Anthracnose (*Colletotrichum gloeosporioides*), Bacterial Canker, Powdery Mildew, Sooty Mold, Dieback, Cutting Weevil, Healthy |
| `crop_corn` | Maize / Corn | 4 | Cercospora Gray Leaf Spot, Common Rust (*Puccinia sorghi*), Northern Leaf Blight, Healthy |
| `crop_potato` | Potato | 3 | Early Blight, Late Blight (*Phytophthora infestans*), Healthy |
| `crop_wheat` | Wheat | 4 | Stripe Rust (*Puccinia striiformis*), Leaf Rust (*Puccinia triticina*), Powdery Mildew, Healthy |
| `crop_banana` | Banana | 4 | Black Sigatoka (*Pseudocercospora fijiensis*), Cordana Leaf Spot, Panama Wilt, Healthy |
| `crop_apple` | Apple | 4 | Apple Scab (*Venturia inaequalis*), Black Rot, Cedar Apple Rust, Healthy |
| `crop_grape` | Grape | 4 | Black Rot (*Guignardia bidwellii*), Esca (Black Measles), Leaf Blight, Healthy |
| `crop_turmeric` | Turmeric | 4 | Leaf Blotch (*Taphrina maculans*), Leaf Spot (*Colletotrichum curcumae*), Dry Leaf, Healthy |
| `crop_oil_palm` | Oil Palm | 4 | Magnesium Deficiency, Scale Insect, Leaf Dryness, Healthy |
| `crop_orange` | Sweet Orange | 2 | Citrus Greening (*Candidatus Liberibacter*), Healthy |
| `crop_pepper_bell`| Bell Pepper | 2 | Bacterial Spot (*Xanthomonas campestris*), Healthy |
| `crop_non_plant`| Non-Plant | 1 | Unsupported Non-Plant Surface |

**Total Canonical Records:** **75 Knowledge Records**

---

## 3. Evidence Sources and Provenance

Every substantive knowledge claim in `docs/agrovision_v2/phase7/crop_disease_knowledge.json` references registered institutional authorities cataloged in `docs/agrovision_v2/phase7/evidence_sources.json`:

1. **`SRC_PJTSAU_POP_2024`**: PJTSAU *Vyavasaya Panchangam* 2024 (Statutory agricultural extension package of practices for Telangana).
2. **`SRC_ANGRAU_DIAGNOSTIC_2024`**: ANGRAU *Crop Protection Guide and Disease Diagnostic Field Compendium* 2024 (Authoritative university diagnostic manual for Andhra Pradesh).
3. **`SRC_ICAR_IPM_HORT_2023`**: ICAR National Integrated Pest Management Packages for Major Horticultural Crops (Bio-control protocols, sanitation, and threshold levels).
4. **`SRC_ICAR_IIRR_RICE_2024`**: ICAR-IIRR Rice Diseases Compendium and Eco-Friendly Management Guidelines (Hyderabad).
5. **`SRC_CIBRC_REGISTER_2024`**: Central Insecticides Board & Registration Committee Major Uses Registered Under the Insecticides Act, 1968 (Statutory active ingredient label claims, dilution rates, and pre-harvest intervals).
6. **`SRC_CABI_PLANTWISE_2023`**: CABI PlantwisePlus Knowledge Bank: Pest and Disease Management Decision Guides (Global symptom ontology and secondary spread epidemiology).
7. **`SRC_ICAR_CICR_COTTON_2023`**: ICAR-CICR Cotton Disease Diagnosis and Integrated Disease Management Manual (Nagpur).

---

## 4. Pesticide Safety and Chemical Control Exclusions

In accordance with strict agronomic safety mandates:
- **No Extrapolation**: Pesticides registered for Tomato Late Blight are never extrapolated to Potato Late Blight unless explicitly co-registered by CIBRC.
- **Verified Active Ingredients**:
  - *Rice Blast:* Tricyclazole 75% WP @ 0.6 g/L (PHI: 30 days) — CIBRC Approved.
  - *Rice Bacterial Leaf Blight:* Streptocycline (0.1 g/L) + Copper Oxychloride 50% WP (2.5 g/L) — PJTSAU/ANGRAU POP.
  - *Rice Sheath Blight:* Hexaconazole 5% EC @ 1.0 ml/L (PHI: 30 days) — CIBRC Approved.
  - *Chilli Anthracnose:* Azoxystrobin + Difenoconazole 18.2% + 11.4% SC @ 1.0 ml/L (PHI: 5 days) — CIBRC Approved.
  - *Tomato Late Blight:* Metalaxyl-M + Mancozeb 4% + 64% WP @ 2.5 g/L (PHI: 7 days) — CIBRC Approved.
  - *Tomato Early Blight:* Chlorothalonil 75% WP @ 2.0 g/L (PHI: 7 days) — CIBRC Approved.
  - *Cotton Bacterial Blight:* Copper Oxychloride 50% WP @ 2.5 g/L (PHI: 15 days) — ICAR-CICR Recommended.
  - *Wheat Leaf Rust:* Propiconazole 25% EC @ 1.0 ml/L (PHI: 35 days) — CIBRC Approved.
- **Scientific Exclusions**:
  - *Plant Viruses* (Tomato Leaf Curl, Chilli Mosaic): Direct anti-viral chemical curative sprays do not exist. Direct chemical spray claims are scientifically fraudulent and strictly excluded. Control is restricted to insect vector eradication (whiteflies/aphids) and rouging.
  - *Citrus Greening* (*Candidatus Liberibacter*): Phloem-limited bacterium with zero curative chemical sprays under CIBRC. Claims of chemical cures are rejected; management is vector control (*Diaphorina citri*) and infected tree eradication.

---

## 5. Diagnostic Decision Status Gating

The recommendation service (`RecommendationService`) enforces strict safety gating based on the Phase 5 decision engine status:

| Phase 5 Diagnostic Decision Status | Guidance Permitted? | Chemical Recommendations | Action Provided to Farmer |
|---|:---:|:---:|---|
| `diagnosis_supported` | **YES** | **Included** (Verified CIBRC / POP only) | Full farmer report: distinguishing symptoms, look-alikes, cultural IPM, biologicals, and verified chemical sprays. |
| `multiple_candidates` | **NO** | **WITHHELD** | Differential diagnosis warning; advises against chemical spraying; provides immediate non-chemical field sanitation. |
| `needs_more_information` | **NO** | **WITHHELD** | Prompts for additional observation answers (symptom duration, humidity, close-up image). |
| `crop_mismatch` | **NO** | **WITHHELD** | Alerts farmer to re-verify crop species before applying treatments. |
| `organ_mismatch` | **NO** | **WITHHELD** | Alerts that examined organ is biologically incompatible with disease pathology. |
| `unsupported_crop` | **NO** | **WITHHELD** | Explains lack of automated model coverage; refers to nearest KVK or MAO. |
| `model_unavailable` | **NO** | **WITHHELD** | Offline notice; suggests standard university agronomic packages of practices. |
| `insufficient_evidence` | **NO** | **WITHHELD** | Explains image/symptom ambiguity; provides daylight rescan guidance. |
| `expert_review_recommended` | **NO** | **WITHHELD** | Identifies severe visual-to-questionnaire contradiction; advises immediate physical sample testing. |

---

## 6. Regional Applicability: Telangana and Andhra Pradesh

Recommendations are contextualized to South Indian agro-climatic zones defined in `docs/agrovision_v2/phase7/regional_applicability.json`:

1. **Telangana Agro-Climatic Zones**:
   - *Northern Telangana Zone* (Adilabad, Nizamabad, Jagtial): Black cotton soils, heavy Kharif rainfall (900–1150 mm). High fungal blight pressure on Rice, Cotton, and Turmeric.
   - *Central Telangana Zone* (Warangal, Karimnagar, Khammam): Red sandy loams and black soils. High Anthracnose and viral vector pressure on Chilli and Cotton.
   - *Southern Telangana Zone* (Mahabubnagar, Nalgonda, Ranga Reddy): Semi-arid red loams (Dubba). Tomato early blight and viral leaf curl focus.
2. **Andhra Pradesh Agro-Climatic Zones**:
   - *North Coastal Zone* (Srikakulam, Visakhapatnam): Coastal cyclonic humidity, blast and sheath blight focus in Rice.
   - *Krishna-Godavari Delta Zone* (Guntur, Krishna, Godavari): Intensive commercial farming, high pesticide resistance risk; emphasizes fungicide class rotation.
   - *Scarce Rainfall Rayalaseema Zone* (Kurnool, Anantapur, Kadapa): Drought-tolerant varieties, soil-borne damping off and wilt focus.
3. **Seasonal Context**:
   - *Kharif (Vanakkalam / Sarva)*: High humidity (>80%) and persistent rainfall favoring foliar fungal sporulation.
   - *Rabi (Yasangi / Dalva)*: Winter dew and dry heat favoring powdery mildews and rusts.

---

## 7. Automated Test Suite Results (12/12 PASSED)

The automated verification suite (`scratch/test_phase7_knowledge_base.py`) was executed against the live backend:

```
===========================================================================
 AgroVision AI 2.0 - Phase 7 Agricultural Knowledge Base Test Runner
 Execution Started: 2026-10-11T06:39:06.710500+00:00
===========================================================================
  [PASS] test_no_duplicate_knowledge_record_ids
  [PASS] test_canonical_crop_disease_references
  [PASS] test_knowledge_base_json_schema_conformance
  [PASS] test_institutional_evidence_references_integrity
  [PASS] test_chemical_recommendations_compliance
  [PASS] test_antiviral_and_noncurative_chemical_exclusions
  [PASS] test_regional_applicability_telangana_and_ap
  [PASS] test_status_gating_uncertain_diagnoses_withhold_chemicals
  [PASS] test_supported_diagnosis_returns_verified_ipm
  [PASS] test_missing_knowledge_record_fails_safely
  [PASS] test_specific_disease_knowledge_endpoint
  [PASS] test_regression_safety_yield_and_diagnosis
===========================================================================
 Phase 7 Knowledge Base Test Suite Finished: 12/12 PASSED
 Results logged to: docs/agrovision_v2/phase7/knowledge_validation_results.json
===========================================================================
```

---

## 8. Exact Files Created and Modified

### Deliverables Created in `docs/agrovision_v2/phase7/`:
1. `PHASE_7_KNOWLEDGE_BASE_REPORT.md` (This master report)
2. `knowledge_base_schema.json` (JSON Schema Draft-07 specification)
3. `crop_disease_knowledge.json` (75 canonical knowledge records)
4. `evidence_sources.json` (Authoritative institutional source registry)
5. `regional_applicability.json` (Telangana and AP agro-climatic zones and cropping seasons)
6. `chemical_recommendation_validation.json` (CIBRC approved treatments and antiviral exclusions)
7. `knowledge_validation_results.json` (Automated test suite execution log)

### Backend Code Created & Integrated:
1. `backend/app/schemas/recommendation_schema.py` (Pydantic request/response models)
2. `backend/app/services/recommendation_service.py` (Modular recommendation decision engine)
3. `backend/app/routes/diagnosis.py` (Exposed `POST /diagnosis/v1/recommend`, `GET /diagnosis/v1/knowledge/{disease_id}`, `GET /diagnosis/v1/sources`)
4. `scratch/build_phase7_knowledge_base.py` (Automated knowledge base generator script)
5. `scratch/test_phase7_knowledge_base.py` (Automated 12-test verification test runner)

---

## 9. Verification Gate Table

| # | Verification Gate Criteria | Evaluation | Evidence / Verification |
|---|---|:---:|---|
| 1 | Validated Phase 2 taxonomy is used | **PASS** | 100% of records reference canonical IDs in `crop_registry.json` and `disease_registry.json`. |
| 2 | Knowledge records reference valid canonical IDs | **PASS** | Validated via `test_canonical_crop_disease_references`. |
| 3 | Every verified substantive claim has traceable evidence | **PASS** | All claims reference PJTSAU, ANGRAU, ICAR, CIBRC, or CABI identifiers. |
| 4 | Crop-specific diseases and look-alikes are distinguished | **PASS** | Distinguishing field features and look-alikes documented for all 75 records. |
| 5 | Unverified claims are explicitly marked | **PASS** | Records lacking approved CIBRC label claims are labeled `provisional_review` or omit chemical sprays. |
| 6 | Chemical recommendations traceable and restricted | **PASS** | Only statutory CIBRC/POP treatments included; cross-crop extrapolation prohibited. |
| 7 | Regional claims supported by applicable sources | **PASS** | PJTSAU and ANGRAU agroclimatic zones and Kharif/Rabi seasons documented. |
| 8 | Uncertain diagnoses cannot trigger chemical treatment | **PASS** | All 8 uncertain decision statuses verified to withhold chemical recommendations. |
| 9 | Missing knowledge records fail safely | **PASS** | Fails safely with KVK referral without falling back to generic chemical sprays. |
| 10 | Automated tests actually execute | **PASS** | All 12 automated tests executed and logged to `knowledge_validation_results.json`. |
| 11 | Production model behavior and unrelated features unchanged | **PASS** | Zero modifications to production checkpoints, `/predict/predict-disease`, or yield engine. |
| 12 | All changes and limitations documented | **PASS** | Documented in master report and machine-readable schema metadata. |

**PHASE 7 VERIFICATION GATE: PASS**

---

*Phase 7 is complete. In accordance with instructions, Phase 8 has not been started, models were not retrained, and live prediction endpoints remain unchanged. Please review and provide explicit approval to proceed.*
