# AgroVision AI 2.0 — Phase 2: Class Reconciliation & Label Audit Report

**Document ID:** `docs/agrovision_v2/phase2/class_reconciliation_report.md`  
**Date:** October 11, 2026  
**Status:** Audit & Reconciliation Completed (PASS)  
**System:** AgroVision AI — Crop & Disease Taxonomy Engineering  

---

## 1. Executive Summary

This report performs a comprehensive class-by-class reconciliation comparing:
1. **Dataset 1 raw folder labels** (39 classes, PlantVillage/PlantDoc lab subset)
2. **Dataset 2 raw folder labels** (51 classes, Andhra Pradesh/Telangana regional survey)
3. **Existing unified 72-class mapping** (`unified_label_mapping.json`)
4. **Active runtime model indices** (`class_indices.json` vs. Model v2 output head)
5. **Backend frontend metadata dictionary** (`DISEASE_INFO` in `backend/app/utils/disease_info.py`)

Every class discrepancy, casing artifact, semantic collision, and pathogen misattribution is documented with empirical evidence and authoritative plant-pathology references.

---

## 2. Investigation of the Rice Bacterial Leaf Blight Pathogen Misattribution

### 2.1 The Issue
In Phase 1 testing and earlier revisions of AgroVision AI, when `Rice___Bacterial_leaf_blight` or `Rice___Bacterial_Leaf_Blight` was evaluated, the frontend displayed:
```
Category: Fungal / Oomycete Pathogen
```
and recommended standard broad-spectrum fungal protectants rather than bactericides or systemic antibiotics.

### 2.2 Root Cause Analysis
- **Dataset 1 Label:** `Rice___Bacterial_leaf_blight` (lowercase `l` and `b`).
- **Dataset 2 Label:** `Rice_Bacterial Leaf Blight` (Title Case with space).
- **Unified 72-Class Mapping:** `Rice___Bacterial_Leaf_Blight` (Title Case `Leaf_Blight`).
- **Backend Metadata Lookup (`disease_info.py`):** The dictionary key was originally written as `Rice___Bacterial_leaf_blight`.
- **Fallthrough Mechanism:**
  When the Model v2 candidate outputted `Rice___Bacterial_Leaf_Blight`, `DISEASE_INFO.get(class_name)` failed to find an exact match due to casing difference.
  The code fell through to a generic keyword heuristic:
  ```python
  if "blight" in key.lower():
      category = "Fungal / Oomycete Pathogen"
  ```
  Because the word `"blight"` was detected before `"bacterial"`, the system erroneously tagged the bacterial blight as fungal!

### 2.3 Scientific Ground Truth Verification
- **Host:** *Oryza sativa* L. (Rice / Paddy).
- **Causal Organism:** *Xanthomonas oryzae* pv. *oryzae* (Ishiyama) Swings et al.
- **Taxonomy:** Domain: Bacteria, Phylum: Pseudomonadota, Class: Gammaproteobacteria, Order: Xanthomonadales, Family: Xanthomonadaceae, Genus: *Xanthomonas*.
- **Authoritative References:**
  1. *ICAR-Indian Institute of Rice Research (IIRR), Hyderabad:* "Bacterial Blight of Rice: Epidemiology, Host-Plant Resistance and Management" (Technical Bulletin No. 98, 2023).
  2. *Acharya N.G. Ranga Agricultural University (ANGRAU):* "Vyavasaya Panchangam — Rice Crop Protection Guidelines", p. 48–52 (2024).
  3. *International Rice Research Institute (IRRI):* Rice Knowledge Bank — Bacterial Blight Diagnostic Key.
- **Pathology & Management:**
  - Water-soaked yellowish-white stripes along leaf margins with wavy borders; amber-colored bacterial ooze beads on lesions under morning dew.
  - Applying fungal fungicides (e.g. Carbendazim, Mancozeb) is **completely ineffective** and economically wasteful.
  - Valid IPM management requires: Plant resistance (e.g., cultivars with *Xa21*, *xa13*, *xa5* genes), avoiding excess nitrogen, draining water, and foliar sprays of Streptocycline / Plantomycin (bactericides) or Copper Oxychloride strictly as recommended by ANGRAU.
- **Canonical Reconciliation:**
  - Canonical Disease ID: `dis_rice_bacterial_leaf_blight`
  - Condition Type: `disease`
  - Pathogen Type: `bacterial` (100% verified, zero fallback ambiguity).

---

## 3. Class Reconciliation Matrix across All 90 Raw Dataset Classes

The table below reconciles all 90 dataset folder names into the 75 canonical disease/condition records.

| # | Dataset 1 Label | Dataset 2 Label | Unified 72-Class Key | Canonical Disease ID | Canonical Crop ID | Condition Type | Verified Pathogen Type | Reconciliation Category |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `Apple___Apple_scab` | — | `Apple___Apple_Scab` | `dis_apple_scab` | `crop_apple` | `disease` | `fungal` | Exact match (Title Case shift) |
| **2** | `Apple___Black_rot` | — | `Apple___Black_Rot` | `dis_apple_black_rot` | `crop_apple` | `disease` | `fungal` | Exact match (Title Case shift) |
| **3** | `Apple___Cedar_apple_rust` | — | `Apple___Cedar_Apple_Rust`| `dis_apple_cedar_apple_rust`| `crop_apple`| `disease` | `fungal` | Exact match (Title Case shift) |
| **4** | `Apple___healthy` | — | `Apple___Healthy` | `dis_apple_healthy` | `crop_apple` | `healthy` | `abiotic` | Healthy casing shift |
| **5** | — | `Banana_Black Sigatoka` | `Banana___Black_Sigatoka` | `dis_banana_black_sigatoka` | `crop_banana` | `disease` | `fungal` | Dataset 2 regional class |
| **6** | — | `Banana_Cordana Leaf Spot` | `Banana___Cordana_Leaf_Spot`| `dis_banana_cordana_leaf_spot`| `crop_banana`| `disease` | `fungal` | Dataset 2 regional class |
| **7** | — | `Banana_Healthy` | `Banana___Healthy` | `dis_banana_healthy` | `crop_banana` | `healthy` | `abiotic` | Dataset 2 regional class |
| **8** | — | `Banana_Panama Disease` | `Banana___Panama_Disease` | `dis_banana_panama_disease` | `crop_banana` | `disease` | `fungal` | Dataset 2 regional class |
| **9** | — | `Chilli_Anthracnose` | `Chilli___Anthracnose` | `dis_chilli_anthracnose` | `crop_chilli` | `disease` | `fungal` | Dataset 2 regional class |
| **10** | — | `Chilli_Damping Off` | `Chilli___Damping_Off` | `dis_chilli_damping_off` | `crop_chilli` | `disease` | `oomycete` | Dataset 2 regional class |
| **11** | — | `Chilli_Healthy` | `Chilli___Healthy` | `dis_chilli_healthy` | `crop_chilli` | `healthy` | `abiotic` | Dataset 2 regional class |
| **12** | — | `Chilli_Leaf Curl Virus` | `Chilli___Leaf_Curl_Virus`| `dis_chilli_leaf_curl` | `crop_chilli` | `disease` | `viral` | Dataset 2 regional class |
| **13** | — | `Chilli_Leaf Spot` | `Chilli___Leaf_Spot` | `dis_chilli_leaf_spot` | `crop_chilli` | `disease` | `fungal` | Dataset 2 regional class |
| **14** | — | `Chilli_Veinal Mottle Virus`| `Chilli___Veinal_Mottle_Virus`|`dis_chilli_veinal_mottle`| `crop_chilli` | `disease` | `viral` | Dataset 2 regional class |
| **15** | — | `Chilli_Whitefly` | `Chilli___Whitefly` | `dis_chilli_whitefly` | `crop_chilli` | `pest_damage` | `pest` | Dataset 2 insect vector damage |
| **16** | — | `Chilli_Yellowish` | `Chilli___Yellowish_Chlorosis`| `dis_chilli_yellowish`| `crop_chilli` | `unknown` | `unknown` | Excluded: Ambiguous label (ID -1) |
| **17** | `Corn___Cercospora_leaf_spot Gray_leaf_spot`| — | `Corn___Cercospora_Gray_Leaf_Spot`| `dis_corn_cercospora_gray_leaf_spot`| `crop_corn`| `disease` | `fungal` | Synonymous naming alias |
| **18** | `Corn___Common_rust` | — | `Corn___Common_Rust` | `dis_corn_common_rust` | `crop_corn` | `disease` | `fungal` | Exact match (Title Case shift) |
| **19** | `Corn___healthy` | — | `Corn___Healthy` | `dis_corn_healthy` | `crop_corn` | `healthy` | `abiotic` | Healthy casing shift |
| **20** | `Corn___Northern_Leaf_Blight`| — | `Corn___Northern_Leaf_Blight`| `dis_corn_northern_leaf_blight`| `crop_corn`| `disease` | `fungal` | Exact match |
| **21** | — | `Cotton_Alternaria Leaf Spot`| `Cotton___Alternaria_Leaf_Spot`|`dis_cotton_alternaria_leaf_spot`|`crop_cotton`| `disease` | `fungal` | Dataset 2 regional class |
| **22** | `Cotton___Bacterial_blight`| `Cotton_Bacterial Blight` | `Cotton___Bacterial_Blight` | `dis_cotton_bacterial_blight` | `crop_cotton` | `disease` | `bacterial` | Cross-dataset merged class |
| **23** | — | `Cotton_Fusarium Wilt` | `Cotton___Fusarium_Wilt` | `dis_cotton_fusarium_wilt` | `crop_cotton` | `disease` | `fungal` | Dataset 2 regional class |
| **24** | `Cotton___healthy` | `Cotton_Healthy` | `Cotton___Healthy` | `dis_cotton_healthy` | `crop_cotton` | `healthy` | `abiotic` | Cross-dataset merged healthy |
| **25** | — | `Cotton_Verticillium Wilt` | `Cotton___Verticillium_Wilt`| `dis_cotton_verticillium_wilt`| `crop_cotton`| `disease` | `fungal` | Dataset 2 regional class |
| **26** | `Grape___Black_rot` | — | `Grape___Black_Rot` | `dis_grape_black_rot` | `crop_grape` | `disease` | `fungal` | Exact match (Title Case shift) |
| **27** | `Grape___Esca_(Black_Measles)`| — | `Grape___Esca_Black_Measles`| `dis_grape_esca` | `crop_grape` | `disease` | `fungal` | Casing / parenthesis cleanup |
| **28** | `Grape___healthy` | — | `Grape___Healthy` | `dis_grape_healthy` | `crop_grape` | `healthy` | `abiotic` | Healthy casing shift |
| **29** | `Grape___Leaf_blight_(Isariopsis_Leaf_Spot)`| — | `Grape___Leaf_Blight_Isariopsis_Spot`|`dis_grape_leaf_blight`| `crop_grape`| `disease` | `fungal` | Parenthesis & syntax cleanup |
| **30** | — | `Mango_Anthracnose` | `Mango___Anthracnose` | `dis_mango_anthracnose` | `crop_mango` | `disease` | `fungal` | Dataset 2 regional class |
| **31** | — | `Mango_Bacterial Canker` | `Mango___Bacterial_Canker` | `dis_mango_bacterial_canker` | `crop_mango` | `disease` | `bacterial` | Dataset 2 regional bacterial |
| **32** | — | `Mango_Cutting Weevil` | `Mango___Cutting_Weevil` | `dis_mango_cutting_weevil` | `crop_mango` | `pest_damage` | `pest` | Dataset 2 insect pest damage |
| **33** | — | `Mango_Die Back` | `Mango___Die_Back` | `dis_mango_die_back` | `crop_mango` | `disease` | `fungal` | Dataset 2 regional class |
| **34** | — | `Mango_Gall Midge` | `Mango___Gall_Midge` | `dis_mango_gall_midge` | `crop_mango` | `pest_damage` | `pest` | Dataset 2 insect gall damage |
| **35** | — | `Mango_Healthy` | `Mango___Healthy` | `dis_mango_healthy` | `crop_mango` | `healthy` | `abiotic` | Dataset 2 regional class |
| **36** | — | `Mango_Powdery Mildew` | `Mango___Powdery_Mildew` | `dis_mango_powdery_mildew` | `crop_mango` | `disease` | `fungal` | Dataset 2 regional class |
| **37** | — | `Mango_Sooty Mould` | `Mango___Sooty_Mould` | `dis_mango_sooty_mould` | `crop_mango` | `disease` | `fungal` | Dataset 2 regional class |
| **38** | `Non_Plant___Unsupported` | — | `Non_Plant___Unsupported_Object`|`dis_non_plant_unsupported`|`crop_non_plant`| `unknown` | `unknown` | OOD synthetic control class |
| **39** | `Orange___Haunglongbing_(Citrus_greening)`| — | `Orange___Citrus_Greening` | `dis_orange_citrus_greening` | `crop_orange` | `disease` | `bacterial` | Spelling fix & canonical name |
| **40** | `Orange___healthy` | — | `Orange___Healthy` | `dis_orange_healthy` | `crop_orange` | `healthy` | `abiotic` | Healthy casing shift |
| **41** | — | `Palm_Magnesium Deficiency`| `Palm___Magnesium_Deficiency`|`dis_palm_magnesium_deficiency`|`crop_oil_palm`|`nutrient_disorder`|`nutritional`| Dataset 2 nutritional disorder |
| **42** | — | `Palm_Scale Insect` | `Palm___Scale_Insect` | `dis_palm_scale_insect` | `crop_oil_palm`| `pest_damage` | `pest` | Dataset 2 insect pest damage |
| **43** | — | `Palm_Dryness` | `Palm___Dryness` | `dis_palm_dryness` | `crop_oil_palm`| `abiotic_stress`| `abiotic` | Excluded: Moisture stress (ID -1) |
| **44** | — | `Palm_Fungal Disease` | `Palm___Fungal_Disease` | `dis_palm_fungal_disease` | `crop_oil_palm`| `unknown` | `unknown` | Excluded: Undifferentiated (ID -1) |
| **45** | `Pepper,_bell___Bacterial_spot`| — | `Pepper___Bacterial_Spot` | `dis_pepper_bacterial_spot` | `crop_pepper_bell`|`disease` | `bacterial` | Crop name separation (Bell) |
| **46** | `Pepper,_bell___healthy` | — | `Pepper___Healthy` | `dis_pepper_healthy` | `crop_pepper_bell`|`healthy` | `abiotic` | Crop name separation (Bell) |
| **47** | `Potato___Early_blight` | — | `Potato___Early_Blight` | `dis_potato_early_blight` | `crop_potato` | `disease` | `fungal` | Title Case shift (Dataset 1 only) |
| **48** | `Potato___healthy` | — | `Potato___Healthy` | `dis_potato_healthy` | `crop_potato` | `healthy` | `abiotic` | Healthy casing shift |
| **49** | `Potato___Late_blight` | — | `Potato___Late_Blight` | `dis_potato_late_blight` | `crop_potato` | `disease` | `oomycete` | Oomycete pathogen verification |
| **50** | `Rice___Bacterial_leaf_blight`| `Rice_Bacterial Leaf Blight`| `Rice___Bacterial_Leaf_Blight`|`dis_rice_bacterial_leaf_blight`|`crop_rice`| `disease` | `bacterial` | Cross-dataset merged bacterial |
| **51** | `Rice___Blast` | `Rice_Blast` | `Rice___Blast` | `dis_rice_blast` | `crop_rice` | `disease` | `fungal` | Cross-dataset merged class |
| **52** | — | `Rice_Brownspot` | `Rice___Brown_Spot` | `dis_rice_brown_spot` | `crop_rice` | `disease` | `fungal` | Word spacing standardization |
| **53** | `Rice___healthy` | `Rice_Healthy` | `Rice___Healthy` | `dis_rice_healthy` | `crop_rice` | `healthy` | `abiotic` | Cross-dataset merged healthy |
| **54** | — | `Rice_Leaf Scald` | `Rice___Leaf_Scald` | `dis_rice_leaf_scald` | `crop_rice` | `disease` | `fungal` | Dataset 2 regional class |
| **55** | — | `Rice_Leaf Smut` | `Rice___Leaf_Smut` | `dis_rice_leaf_smut` | `crop_rice` | `disease` | `fungal` | Dataset 2 small sample (40 img) |
| **56** | — | `Rice_Sheath Blight` | `Rice___Sheath_Blight` | `dis_rice_sheath_blight` | `crop_rice` | `disease` | `fungal` | Dataset 2 stem/sheath class |
| **57** | — | `Rice_Tungro` | `Rice___Tungro` | `dis_rice_tungro` | `crop_rice` | `disease` | `viral` | Dataset 2 viral complex |
| **58** | `Tomato___Bacterial_spot`| `Tomato_Bacterial Spot` | `Tomato___Bacterial_Spot` | `dis_tomato_bacterial_spot` | `crop_tomato` | `disease` | `bacterial` | Cross-dataset merged bacterial |
| **59** | `Tomato___Early_blight` | `Tomato_Early Blight` | `Tomato___Early_Blight` | `dis_tomato_early_blight` | `crop_tomato` | `disease` | `fungal` | Cross-dataset merged class |
| **60** | `Tomato___healthy` | `Tomato_Healthy` | `Tomato___Healthy` | `dis_tomato_healthy` | `crop_tomato` | `healthy` | `abiotic` | Cross-dataset merged healthy |
| **61** | `Tomato___Late_blight` | `Tomato_Late Blight` | `Tomato___Late_Blight` | `dis_tomato_late_blight` | `crop_tomato` | `disease` | `oomycete` | Cross-dataset merged oomycete |
| **62** | `Tomato___Leaf_Mold` | `Tomato_Leaf Mold` | `Tomato___Leaf_Mold` | `dis_tomato_leaf_mold` | `crop_tomato` | `disease` | `fungal` | Cross-dataset merged class |
| **63** | `Tomato___Tomato_mosaic_virus`| `Tomato_Mosaic Virus` | `Tomato___Mosaic_Virus` | `dis_tomato_mosaic_virus` | `crop_tomato` | `disease` | `viral` | Name prefix cleanup & merge |
| **64** | `Tomato___Septoria_leaf_spot`| `Tomato_Septoria Leaf Spot`| `Tomato___Septoria_Leaf_Spot`|`dis_tomato_septoria_leaf_spot`|`crop_tomato`|`disease`| `fungal` | Cross-dataset merged class |
| **65** | `Tomato___Spider_mites Two-spotted_spider_mite`| `Tomato_Spider Mites`| `Tomato___Spider_Mites`|`dis_tomato_spider_mites`|`crop_tomato`|`pest_damage`| `pest` | Syntax cleanup & merge |
| **66** | `Tomato___Target_Spot` | `Tomato_Target Spot` | `Tomato___Target_Spot` | `dis_tomato_target_spot` | `crop_tomato` | `disease` | `fungal` | Cross-dataset merged class |
| **67** | `Tomato___Tomato_Yellow_Leaf_Curl_Virus`| `Tomato_Yellow Leaf Curl Virus`| `Tomato___Yellow_Leaf_Curl_Virus`|`dis_tomato_yellow_leaf_curl`|`crop_tomato`|`disease`| `viral` | Name prefix cleanup & merge |
| **68** | — | `Turmeric_Dry Leaf` | `Turmeric___Dry_Leaf` | `dis_turmeric_dry_leaf` | `crop_turmeric` | `abiotic_stress`| `abiotic` | Dataset 2 physiological stress |
| **69** | — | `Turmeric_Healthy` | `Turmeric___Healthy` | `dis_turmeric_healthy` | `crop_turmeric` | `healthy` | `abiotic` | Dataset 2 regional class |
| **70** | — | `Turmeric_Leaf Blotch` | `Turmeric___Leaf_Blotch` | `dis_turmeric_leaf_blotch` | `crop_turmeric` | `disease` | `fungal` | Dataset 2 regional class |
| **71** | — | `Turmeric_Rhizome Rot` | `Turmeric___Rhizome_Rot` | `dis_turmeric_rhizome_rot` | `crop_turmeric` | `disease` | `oomycete` | Non-foliar subterranean rot |
| **72** | `Wheat___healthy` | — | `Wheat___Healthy` | `dis_wheat_healthy` | `crop_wheat` | `healthy` | `abiotic` | Healthy casing shift |
| **73** | `Wheat___Leaf_rust` | — | `Wheat___Leaf_Rust` | `dis_wheat_leaf_rust` | `crop_wheat` | `disease` | `fungal` | Title Case shift (Dataset 1 only) |
| **74** | `Wheat___Powdery_mildew`| — | `Wheat___Powdery_Mildew` | `dis_wheat_powdery_mildew` | `crop_wheat` | `disease` | `fungal` | Title Case shift (Dataset 1 only) |
| **75** | `Wheat___Stripe_rust` | — | `Wheat___Stripe_Rust` | `dis_wheat_stripe_rust` | `crop_wheat` | `disease` | `fungal` | Title Case shift (Dataset 1 only) |

---

## 4. Key Findings across Reconciliation Categories

### 1. Exact Matches (15 Classes)
15 classes exist identically in both Dataset 1 and Dataset 2:
- **Cotton (2 classes):** Bacterial Blight, Healthy
- **Rice (3 classes):** Bacterial Leaf Blight, Blast, Healthy
- **Tomato (10 classes):** Bacterial Spot, Early Blight, Healthy, Late Blight, Leaf Mold, Mosaic Virus, Septoria Leaf Spot, Spider Mites, Target Spot, Yellow Leaf Curl Virus.
These 15 classes form the bridge between laboratory cardboard benchmarks and regional field imagery.

### 2. Naming Aliases & Syntax Cleanups
- `Corn___Cercospora_leaf_spot Gray_leaf_spot` $\to$ Standardized as `dis_corn_cercospora_gray_leaf_spot`.
- `Tomato___Spider_mites Two-spotted_spider_mite` $\to$ Standardized as `dis_tomato_spider_mites`.
- `Tomato___Tomato_mosaic_virus` $\to$ Redundant "Tomato" prefix stripped $\to$ `dis_tomato_mosaic_virus`.
- `Grape___Esca_(Black_Measles)` $\to$ Unbalanced parentheses removed $\to$ `dis_grape_esca`.
- `Orange___Haunglongbing_(Citrus_greening)` $\to$ Corrected historical typo ("Haunglongbing") $\to$ `dis_orange_citrus_greening`.

### 3. Crop-Name Conflict: Pepper vs. Chilli
- In Dataset 1: The label is `Pepper,_bell___Bacterial_spot` and `Pepper,_bell___healthy` (*Capsicum annuum var. grossum* / Sweet Bell Pepper).
- In Dataset 2: The labels are `Chilli_Anthracnose`, `Chilli_Leaf Curl Virus`, etc. (*Capsicum annuum* hot cultivar / Andhra Mirapa).
- **Previous Defect:** Frontend and backend conflated "Pepper" and "Chilli", causing Bell Pepper lab images to override hot chilli diagnostics.
- **Reconciliation:** We established two distinct canonical crop IDs:
  - `crop_pepper_bell` (Bell Pepper / Capsicum)
  - `crop_chilli` (Hot Chilli / Mirapa)
  This cleanly resolves morphological and agronomic confusion.

### 4. Pathogen-Type Corrections: Oomycetes vs. True Fungi
- `Phytophthora infestans` (Tomato Late Blight & Potato Late Blight) and `Pythium aphanidermatum` (Chilli Damping Off & Turmeric Rhizome Rot) belong to kingdom Stramenopila (Oomycota / Water Molds), NOT true fungi (Eumycota).
- Standard fungicides (e.g. Carbendazim, Hexaconazole) targeting fungal ergosterol pathways fail against oomycetes because oomycete cell walls contain cellulose and lack ergosterol.
- Categorizing them accurately as `pathogen_type: "oomycete"` enables the knowledge base to recommend oomycete-specific active ingredients (e.g. Metalaxyl, Cymoxanil, Dimethomorph, Copper fungicides).

### 5. Non-Foliar Organ Discrepancies
- In Dataset 1: 100% of images are leaves mounted on cardboard.
- In Dataset 2:
  - `Turmeric_Rhizome Rot` contains photographs of subterranean harvested rhizome fingers and rot lesions.
  - `Chilli_Anthracnose` contains photographs of red ripening chilli pods.
  - `Mango_Anthracnose` and `Mango_Bacterial Canker` contain photographs of ripe and green fruit.
- When farmers submit these non-foliar images, the legacy leaf-only OpenCV filter (`foliage_ratio >= 0.02`) rejected them. The new `crop_organ_compatibility_matrix.json` resolves this constraint.

### 6. Insufficient Supporting Images & Excluded Classes
- `Palm_Fungal Disease` (Dataset 2): Only 25 total images. Generic undifferentiated label without identified pathogen species. Excluded from neural model (assigned canonical ID -1).
- `Palm_Dryness` (Dataset 2): 70 images. Abiotic stress lacking distinct fungal/bacterial lesions. Excluded.
- `Chilli_Yellowish` (Dataset 2): 490 images. Conflates nutritional chlorosis with viral yellowing. Excluded.
- `Rice_Leaf Smut` (Dataset 2): Only 40 images. Flagged as `verified` biologically but statistically vulnerable; retained with caution.
