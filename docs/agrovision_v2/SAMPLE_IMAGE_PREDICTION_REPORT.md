# AgroVision AI — Sample Image Prediction Evaluation & Diagnostic Trace Report

**Evaluation Date:** October 11, 2026  
**Auditor:** Agricultural Computer-Vision Engineer & Dataset-Quality Specialist  
**Evaluated Pipeline:** AgroVision AI 2.0 (Phase 7/8 Unified 72-Class Model + Phase 8 Calibrated Evidence Fusion Engine)  
**Model Checkpoint:** `AGROVISION_UNIFIED_72CLASS_MODEL.h5` (73 output classes, MobileNetV2 backbone)  
**Sample Image Registry:** [`docs/agrovision_v2/sample_image_registry.json`](./sample_image_registry.json)  

---

## 1. Evaluation Methodology & Ground-Truth Integrity Protocol

In agricultural diagnostic computer vision, evaluating an AI system against unverified field photos presents severe risks of false metric inflation and misleading clinical conclusions. Under this protocol:
1. **Ground-Truth Distinction:** Provisional farmer interpretations are strictly distinguished from confirmed botanical ground truths. Samples whose etiology is unproven are marked `N/A — label unverified`.
2. **Organ-Aware Evaluation:** Diagnoses on non-foliar plant organs (fruits, panicles, cobs) are evaluated against dataset training boundaries (which were overwhelmingly trained on foliar leaflets).
3. **Decoupled Reporting:** Raw neural network output logits are analyzed independently from the final evidence-fusion decision layer (calibrated rejection $\tau = 50.0\%$, crop mismatch checks, and organ compatibility gating).
4. **No Metric Generalization:** Performance on these 9 exploratory field samples is reported strictly per sample and is **not** generalized to represent global model accuracy across the entire 72-class taxonomy.

---

## 2. Sample Image Prediction Summary Table

| Sample | Verified crop | Verified disease | Model top-1 | Top-1 correct? | Final status |
|---|---|---|---|---|---|
| **SAMPLE_01** (`images (5).jpeg`) | Tomato | *Unverified* (Fruit rot) | Chilli : Healthy (86.5%) | N/A — label unverified | `CROP_MISMATCH` (Abstained) |
| **SAMPLE_02** (`images (4).jpeg`) | Tomato | *Unverified* (Fruit spot) | Chilli : Healthy (27.8%) | N/A — label unverified | `UNCERTAIN_DIAGNOSIS` (Abstained) |
| **SAMPLE_03** (`images (3).jpeg`) | Rice | *Unverified* (Panicle glume rot) | Rice : Bacterial Leaf Blight (55.8%) | N/A — label unverified | `CONFIRMED_DIAGNOSIS` (Non-abstained foliar attribution) |
| **SAMPLE_04** (`false-smut-in-rice.jpg`) | Rice | Rice False Smut *(Unsupported)* | Rice : Bacterial Leaf Blight (87.7%) | **No** *(Wrong disease attribution)* | `CONFIRMED_DIAGNOSIS` *(False Positive attribution to Blight)* |
| **SAMPLE_05** (`images (2).jpeg`) | Corn | *Ambiguous* (Ear rot / borer) | Rice : Tungro (33.0%) | N/A — label unverified | `UNCERTAIN_DIAGNOSIS` (Abstained) |
| **SAMPLE_06** (`images (1).jpeg`) | Corn | Non-disease pest damage | Rice : Sheath Blight (35.0%) | **No** *(Appropriate abstention)* | `UNCERTAIN_DIAGNOSIS` (Abstained) |
| **SAMPLE_07** (`images.jpeg`) | Soybean *(Unsupported)* | *Unsupported foliar pathogen* | Chilli : Leaf Spot (56.3%) | **No** *(Out-of-domain crop)* | `CROP_MISMATCH` / Auto: Wrong crop |
| **SAMPLE_08** (`Crop-Diseases_...webp`) | Wheat | Wheat Stripe Rust *(Yellow Rust)* | Rice : Bacterial Leaf Blight (75.8%) | **No** *(Cross-crop foliar confusion)* | `CROP_MISMATCH` (Abstained when Wheat selected) |
| **SAMPLE_09** (`Rust_leaves_MAIN.jpg`) | Wheat | Wheat Rust Complex *(Stem/Leaf)* | Rice : Bacterial Leaf Blight (60.3%) | **No** *(Cross-crop foliar confusion)* | `CROP_MISMATCH` (Abstained when Wheat selected) |

---

## 3. Deep Per-Sample Technical Prediction Trace & Agronomic Analysis

### SAMPLE_01: `images (5).jpeg`
- **Visual Description:** Single tomato fruit on the vine exhibiting a large, dark-brown/black sunken necrotic rot lesion at the calyx end spreading across the fruit shoulder. Healthy green foliage is visible around it.
- **Affected Organ:** `fruits`
- **Label Status:** `unverified` (Provisional: Tomato Late Blight fruit rot vs. Anthracnose fruit rot vs. Buckeye rot).
- **Raw Neural Network Output:**
  - Top-1: `Chilli Healthy` (86.5%)
  - Top-2: `Apple Cedar Apple Rust` (3.05%)
  - Top-3: `Potato Late Blight` (1.05%)
  - Conditioned on `Tomato`: `Tomato Late Blight` (0.30%)
- **Diagnostic Pipeline Assessment:**
  - When the farmer enters `Tomato`, the system identifies that the visual classifier placed 86.5% probability on a different genus (`Chilli`) while Tomato probability was near zero.
  - The pipeline triggers `CROP_MISMATCH`, withholds chemical recommendations, and prompts the farmer to verify crop selection.
  - **Failure Mode & Insight:** The model was trained almost exclusively on tomato *leaves*. When presented with a smooth red/orange *fruit* surface, the leaf texture extractor failed, latching onto smooth green chilli foliage background features. The crop mismatch gate prevented a false healthy declaration.

---

### SAMPLE_02: `images (4).jpeg`
- **Visual Description:** Cluster of unripe green-to-yellowing tomatoes displaying multiple circular, pitted, brownish lesions and sunken necrotic speckles across the fruit skin.
- **Affected Organ:** `fruits`
- **Label Status:** `unverified` (Ghost spot / Botrytis vs. Early blight fruit lesion vs. Bacterial speck).
- **Raw Neural Network Output:**
  - Top-1: `Chilli Healthy` (27.8%)
  - Top-2: `Apple Apple Scab` (5.57%)
  - Top-3: `Wheat Stripe Rust` (4.98%)
  - Conditioned on `Tomato`: `Tomato Yellow Leaf Curl Virus` (2.41%)
- **Diagnostic Pipeline Assessment:**
  - Top-1 probability is only 27.8%, far below the safety threshold $\tau = 50.0\%$.
  - The system triggers `UNCERTAIN_DIAGNOSIS`, abstains from diagnosis, displays honest uncertainty, and withholds chemical prescriptions.
  - **Failure Mode & Insight:** **Appropriate abstention due to insufficient evidence**. Because fruit spots do not match leaf lesion patterns, entropy is high and the model produces low confidence. The calibrated rejection policy prevented false diagnosis.

---

### SAMPLE_03: `images (3).jpeg`
- **Visual Description:** Close-up of an emerging rice panicle with several darkened, brownish-black spikelets and glumes showing grain rot/blight against green foliage.
- **Affected Organ:** `panicles_seeds`
- **Label Status:** `unverified` (Rice grain discoloration complex / glume blight vs. panicle blast).
- **Raw Neural Network Output:**
  - Top-1: `Rice Bacterial Leaf Blight` (55.85%)
  - Top-2: `Rice Brown Spot` (13.80%)
  - Top-3: `Apple Apple Scab` (2.52%)
- **Diagnostic Pipeline Assessment:**
  - Raw probability exceeds 50.0% ($P = 0.5585$). In standalone image mode, it returns `CONFIRMED_DIAGNOSIS` attributing the image to *Rice Bacterial Leaf Blight*.
  - **Failure Mode & Insight:** **Correct crop, but incorrect disease and organ attribution**. The model correctly recognized the crop as Rice ($69.65\%$ aggregate rice mass), but because the training set lacks a dedicated "Rice Grain Discoloration / Panicle Blight" class, the model forced the dark spikelet discoloration into its dominant rice class (*Bacterial Leaf Blight*). In the multimodal pipeline, farmer input of organ=`panicles_seeds` downweights foliar bacterial blight, preventing unwarranted bactericide sprays.

---

### SAMPLE_04: `false-smut-in-rice.jpg`
- **Visual Description:** Ripening rice panicle displaying prominent velvety, dark greenish-black spherical smut balls (*pseudomorphs*) transforming individual grains.
- **Affected Organ:** `panicles_seeds`
- **Label Status:** `verified_crop_and_symptom_unsupported_disease` (Pathogen: *Ustilaginoidea virens*).
- **Raw Neural Network Output:**
  - Top-1: `Rice Bacterial Leaf Blight` (87.67%)
  - Top-2: `Rice Healthy` (4.94%)
  - Top-3: `Oil Palm Scale Insect` (1.80%)
- **Diagnostic Pipeline Assessment:**
  - Raw image model outputs $87.67\%$ confidence for Bacterial Leaf Blight.
  - **Failure Mode & Insight:** **Unsupported disease forced into supported class (Overconfidence on OOD disease)**. Rice False Smut is a major rice disease in South Asia, but it is **absent** from the 72-class training dataset. When an unsupported disease appears on a supported host, the vision model hallucinates the closest supported disease with high confidence.
  - **Remedy:** The organ-compatibility matrix flags `panicles_seeds` for Bacterial Leaf Blight as biologically incongruent, and multimodal evidence rules require panicle smut confirmation before issuing false blight treatments.

---

### SAMPLE_05: `images (2).jpeg`
- **Visual Description:** Field photo of a corn ear with partially peeled dry husk, revealing yellow kernels with insect feeding holes and localized blackish necrotic fungal ear rot.
- **Affected Organ:** `ears_cobs`
- **Label Status:** `ambiguous` (Unverified ear rot pathogen / secondary insect feeding).
- **Raw Neural Network Output:**
  - Top-1: `Rice Tungro` (32.95%)
  - Top-2: `Rice Bacterial Leaf Blight` (21.85%)
  - Top-3: `Rice Sheath Blight` (17.05%)
  - Conditioned on `Corn`: `Corn Common Rust` (1.36%)
- **Diagnostic Pipeline Assessment:**
  - Top-1 probability is $32.95\% < 50.0\%$.
  - The system triggers `UNCERTAIN_DIAGNOSIS`, holds the diagnosis, and withholds chemical advice.
  - **Failure Mode & Insight:** **Appropriate abstention due to insufficient evidence and organ out-of-distribution**. Corn ear diseases are not in the foliar dataset. The model exhibited high entropy across classes, which was safely caught by the $\tau = 50.0\%$ rejection threshold.

---

### SAMPLE_06: `images (1).jpeg`
- **Visual Description:** Maize leaf held by human hand exhibiting extensive chewing damage, irregular jagged holes, and window-paning characteristic of lepidopteran larvae (Fall Armyworm *Spodoptera frugiperda*). No fungal pustules, concentric rings, or water-soaked halos.
- **Affected Organ:** `leaves`
- **Label Status:** `verified_non_disease_injury` (Mechanical / Insect pest mastication).
- **Raw Neural Network Output:**
  - Top-1: `Rice Sheath Blight` (34.98%)
  - Top-2: `Chilli Leaf Curl Virus` (27.32%)
  - Top-3: `Cotton Fusarium Wilt` (9.73%)
  - Conditioned on `Corn`: `Corn Cercospora Gray Leaf Spot` (0.19%)
- **Diagnostic Pipeline Assessment:**
  - Raw score is only $34.98\% < 50.0\%$.
  - Pipeline triggers `UNCERTAIN_DIAGNOSIS`, abstains from declaring a plant disease, and issues guidance to examine for insect larvae.
  - **Failure Mode & Insight:** **Appropriate abstention on non-disease damage**. Non-disease insect injury does not exhibit microbial lesion signatures. The model did not hallucinate a fungal disease, and the safety threshold prevented inappropriate pesticide/fungicide issuance.

---

### SAMPLE_07: `images.jpeg`
- **Visual Description:** Trifoliate pubescent leaflets with distinctive interveinal chlorotic yellowing and irregular necrotic brown blotches.
- **Affected Organ:** `leaves`
- **Label Status:** `verified_crop_unsupported_in_model` (Crop: Soybean *Glycine max*).
- **Raw Neural Network Output:**
  - Top-1: `Chilli Leaf Spot` (56.31%)
  - Top-2: `Chilli Whitefly` (6.85%)
  - Top-3: `Grape Esca Black Measles` (4.27%)
- **Diagnostic Pipeline Assessment:**
  - In unconstrained Auto-Detect mode, the model hallucinates `Chilli Leaf Spot` ($56.31\%$) due to foliar visual similarity between pubescent soybean leaflets and chilli cercospora spots.
  - When farmer specifies `Soybean` (or an unsupported crop ID), the pipeline triggers `unsupported_crop` / `CROP_MISMATCH`, abstains from issuing chemical prescriptions, and informs the farmer that Soybean diseases are currently unindexed.
  - **Failure Mode & Insight:** **Unsupported crop species forced into supported class during unconstrained inference**. Emphasizes why multimodal farmer crop selection is critical to prevent out-of-domain cross-crop false positives.

---

### SAMPLE_08: `Crop-Diseases_-Types-Causes-and-Symptoms-2-min.webp`
- **Visual Description:** Cereal foliage showing textbook linear parallel stripes of bright yellow-orange uredinial pustules along the leaf blade flanked by chlorotic streaking.
- **Affected Organ:** `leaves`
- **Label Status:** `verified_ground_truth` (Pathogen: *Puccinia striiformis* f. sp. *tritici* / Wheat Stripe Rust).
- **Raw Neural Network Output:**
  - Top-1: `Rice Bacterial Leaf Blight` (75.75%)
  - Top-2: `Rice Blast` (3.32%)
  - Top-3: `Oil Palm Scale Insect` (2.78%)
  - Conditioned on `Wheat`: `Wheat Stripe Rust` (0.63%)
- **Diagnostic Pipeline Assessment:**
  - In unconstrained auto-detect mode, the model misattributes the yellow linear chlorosis of wheat stripe rust to `Rice Bacterial Leaf Blight` ($75.75\%$).
  - When the farmer enters `Wheat`, the pipeline detects that the visual model overwhelmingly favored Rice ($75.75\%$) over Wheat ($<1\%$). It flags `CROP_MISMATCH` and abstains.
  - **Failure Mode & Insight:** **Severe cross-crop foliar confusion (Model Error on Supported Class)**. Wheat Stripe Rust is a supported class in the 72-class model (`Wheat___Stripe_rust`), but the model's feature extractor confused the elongated parallel yellow chlorosis of stripe rust with the longitudinal yellow/tan marginal lesions of Rice Bacterial Leaf Blight. This represents a confirmed model failure on an in-distribution target.

---

### SAMPLE_09: `Rust_leaves_MAIN.jpg`
- **Visual Description:** Dense stand of cereal culms and drying leaves covered with reddish-brown erumpent pustules (*Puccinia* rust complex / Stem Rust *Puccinia graminis*).
- **Affected Organ:** `leaves` / `stems`
- **Label Status:** `verified_crop_rust_complex` (Wheat Rust complex).
- **Raw Neural Network Output:**
  - Top-1: `Rice Bacterial Leaf Blight` (60.34%)
  - Top-2: `Rice Sheath Blight` (7.42%)
  - Top-3: `Tomato Bacterial Spot` (7.29%)
  - Conditioned on `Wheat`: `Wheat Stripe Rust` (0.14%)
- **Diagnostic Pipeline Assessment:**
  - Unconstrained model misclassifies to `Rice Bacterial Leaf Blight` ($60.34\%$).
  - Conditioned on `Wheat`, the system detects `CROP_MISMATCH` and abstains.
  - **Failure Mode & Insight:** **Cross-crop foliar confusion and training distribution bias**. The high representation of Rice Bacterial Leaf Blight images in the training dataset creates a strong prior that attracts yellowish-brown linear foliar patterns from other cereals (Wheat, Barley).

---

## 4. Analysis of Diagnostic Failure Modes

Across the nine evaluated samples, five distinct diagnostic behaviors were characterized:

```
                                  EVALUATION TAXONOMY
                                          │
         ┌────────────────────────────────┴────────────────────────────────┐
         ▼                                                                 ▼
    UNVERIFIED SAMPLES                                             VERIFIED SAMPLES
   (SAMPLE_01, 02, 03, 05)                                      (SAMPLE_04, 06, 07, 08, 09)
         │                                                                 │
         ├─ Fruit rot/spots vs Leaf models                                 ├─ Unsupported Disease (False Smut): Overconfidence
         ├─ Grain rot vs Panicle Blast                                     ├─ Non-Disease Injury (Chewing): Appropriate Abstention
         └─ Appropriate abstentions on high entropy                        ├─ Unsupported Crop (Soybean): Cross-crop leakage
                                                                           └─ Supported Disease Error (Stripe Rust): Foliar confusion
```

### 1. Correct Crop but Incorrect Disease
- **Observed in:** `SAMPLE_03` (Rice Panicle Discoloration $\rightarrow$ Rice Bacterial Leaf Blight) and `SAMPLE_04` (Rice False Smut $\rightarrow$ Rice Bacterial Leaf Blight).
- **Root Cause:** The model accurately localizes the host crop genus (*Oryza sativa*), but lacks the granular target class (panicle glume rot or false smut), collapsing onto the dominant leaf blight class.

### 2. Wrong Crop Prediction (Cross-Crop Confusion)
- **Observed in:** `SAMPLE_08` (Wheat Stripe Rust $\rightarrow$ Rice Bacterial Blight), `SAMPLE_09` (Wheat Rust $\rightarrow$ Rice Bacterial Blight), and `SAMPLE_07` (Soybean $\rightarrow$ Chilli Leaf Spot).
- **Root Cause:** Background chlorosis and elongated lesion textures in cereal blades overlap feature embeddings across Rice and Wheat. Severe class imbalance during training biased weights toward Rice.

### 3. Unsupported Disease Forced into Supported Class
- **Observed in:** `SAMPLE_04` (Rice False Smut).
- **Root Cause:** Standard softmax classifiers assume closed-world semantics. Without an open-set distance metric or organ constraint, high-confidence errors occur on out-of-vocabulary diseases.

### 4. Appropriate Abstention due to Insufficient Evidence
- **Observed in:** `SAMPLE_02` (Tomato fruit spots, $P = 27.8\%$), `SAMPLE_05` (Corn ear rot, $P = 32.9\%$), and `SAMPLE_06` (Corn chewing insect damage, $P = 35.0\%$).
- **Success Mechanism:** The Phase 8 calibrated rejection policy ($\tau = 50.0\%$) and entropy thresholds performed exactly as designed, preventing unverified or non-disease symptoms from issuing hazardous agricultural treatments.

---

## 5. Farmer-Facing Verification & Agronomic Safety Audit

| Safety Criteria | Application Behavior | Audit Verdict |
| :--- | :--- | :---: |
| **Honest Display of Uncertainty** | When confidence is $<50.0\%$, the UI explicitly presents `Low Diagnosis Confidence` banner and shows top candidates as *hypotheses* rather than confirmed diagnoses. | **PASS** |
| **Avoid Unrelated-Crop Candidates** | When the farmer selects a host crop in the questionnaire, the multimodal engine strictly conditions candidate ranking on that host species. | **PASS** |
| **Explain Visible Symptoms Honestly** | The application quotes observed farmer questionnaire symptoms alongside model confidence, rather than fabricating unobserved evidence. | **PASS** |
| **Withhold Chemical Guidance When Uncertain** | In all abstained, mismatched, or low-confidence states, the recommendation engine **withholds synthetic chemical/fungicide advice**, displaying only preventative cultural practices and advisory contact. | **PASS** |
| **Organ Incongruity Shielding** | When farmers report fruit or panicle damage, the organ compatibility matrix downweights leaf-exclusive disease classes. | **PASS** |

---

## 6. Prioritized Model Error Inventory & Recommended ML Experiments

Based on this sample evaluation, remaining defects in the vision pipeline are prioritized as follows:

### Priority 1 (High): Cereal Foliar Confusion (Wheat Rust vs. Rice Bacterial Leaf Blight)
- **Problem:** Severe cross-crop false attribution where real Wheat Stripe Rust is misclassified as Rice Bacterial Leaf Blight with $>75\%$ probability.
- **Root Cause:** Color-histogram and linear-lesion overlap between yellow rust stripes and bacterial blight leaf scorch, amplified by class imbalance in regional training partitions.
- **Recommended ML Experiment (Experiment Phase 11-A):**
  - **Hypothesis:** Multi-task hierarchical loss (predicting `Crop Genus` at branch 1 and `Disease Condition` at branch 2) will enforce hard botanical boundary separation before fine-grained lesion classification.
  - **Data Action:** Balance Wheat Stripe Rust and Rice Bacterial Leaf Blight training batches with hard-negative mining and fine-grained texture attention (Self-Attention / Vision Transformer block).

### Priority 2 (High): Organ-Specific Out-of-Distribution Rejection
- **Problem:** Models trained on leaves emit high-confidence predictions on fruits (`SAMPLE_01`) and panicles (`SAMPLE_03`, `SAMPLE_04`).
- **Recommended ML Experiment (Experiment Phase 11-B):**
  - **Hypothesis:** An auxiliary organ-classifier head (classifying `leaf`, `fruit`, `stem`, `panicle_ear`) operating upstream will gate disease classification, automatically rejecting non-leaf images if disease models only cover foliar stages.

### Priority 3 (Medium): Open-Set Recognition for Unsupported Regional Pathogens
- **Problem:** Closed-world softmax forces Rice False Smut and Soybean diseases into supported classes with $P > 55\%$.
- **Recommended ML Experiment (Experiment Phase 11-C):**
  - **Hypothesis:** Replacing penultimate-layer cosine distance / temperature scaling with OpenMax or Mahalanobis distance rejection will identify out-of-vocabulary pathogens and trigger an explicit `UNSUPPORTED_PATHOGEN_DETECTED` state.
