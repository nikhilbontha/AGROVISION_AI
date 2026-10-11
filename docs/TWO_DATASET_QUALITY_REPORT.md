# AgroVision AI — Phase 3: Dataset Quality Inspection and Validation Report

**Date:** October 10, 2026  
**Status:** Verification Gate Passed (PASS)  
**System:** AgroVision AI — Multi-Dataset Quality & Taxonomy Validation  
**Inspection Script:** [`scratch/inspect_dataset_quality.py`](file:///e:/tekworks_projects/crop/scratch/inspect_dataset_quality.py)  
**Derived Output Directory:** [`ml_models/disease_detection/unified_experiment/`](file:///e:/tekworks_projects/crop/ml_models/disease_detection/unified_experiment)  

---

## 1. Executive Summary

Phase 3 performs a comprehensive, non-destructive quality inspection, duplicate analysis, label structure audit, and class imbalance evaluation across **Dataset 1** (2,730 images, 39 classes) and **Dataset 2** (`Andhra_Master_Dataset` inside `archive.zip`: 21,135 images, 51 classes).

### Key Deliverables & Findings:
1. **Input Path Verification:** Confirmed that Dataset 1 (`ml_models/disease_detection/dataset_prepared`), Dataset 2 (`datasets/archive.zip`), and baseline manifests (`docs/TWO_DATASET_INTEGRITY_MANIFEST.json`) exist unchanged at their approved locations.
2. **100% File Readability:** Zero corrupt or unreadable image files detected in either dataset. All 23,865 combined image files decode cleanly.
3. **Zero Cross-Dataset Leakage:** **0 exact MD5 collisions** between Dataset 1 and Dataset 2. Dataset 2 contains 293 internal MD5 duplicate clusters (412 total duplicate images) which will be safely deduplicated during Phase 4 partitioning.
4. **Taxonomy & Regional Expansion:** Dataset 2 adds **31 new diagnostic classes** and introduces 5 vital regional crops (Banana, Mango, Oil Palm, Turmeric, Chilli) while expanding Cotton, Rice, Potato, and Tomato disease coverage.
5. **Reproducibility Verified:** The inspection engine script ([`inspect_dataset_quality.py`](file:///e:/tekworks_projects/crop/scratch/inspect_dataset_quality.py)) was executed twice with identical file counts, hash maps, and duplicate counts.

---

## 2. Dataset 1 Quality & Structure Audit

### 2.1 File Inventory
- **Location:** `E:\tekworks_projects\crop\ml_models\disease_detection\dataset_prepared`
- **Total Files Scanned:** 2,730 `.jpg` image files + 2 manifest JSON files.
- **Corrupt / Unreadable Images:** **0**
- **Dimensions:** Resized to standard `(224, 224, 3)` RGB.
- **Internal Duplicates:** **0 exact MD5 duplicate groups**.

### 2.2 Class & Partition Breakdown
Contains 39 classes (70 images per class, strictly partitioned into 40 train / 10 val / 10 test / 10 field_test).

---

## 3. Dataset 2 Quality & Structure Audit

### 3.1 File Inventory
- **Source Archive:** `E:\tekworks_projects\crop\datasets\archive.zip` (Top-level folder: `Andhra_Master_Dataset/`)
- **Total Image Files:** **21,135 valid images** (18,367 `.jpg`, 2,500 `.png`, 268 `.jpeg`).
- **Corrupt / Unreadable Images:** **0** (100% Pillow RGB decodable).
- **Quality Flags:** 
  - `SMALL_DIMENSIONS` (< 64x64): **0**
  - `UNUSUAL_COLOR_MODE`: **0** (All RGB/Grayscale converted cleanly).

### 3.2 Duplicate Analysis Summary
- **Intra-Dataset (Dataset 2) Exact MD5 Duplicates:** 293 duplicate groups (412 images). These represent identical re-uploaded images in subfolders.
- **Cross-Dataset (Dataset 1 <-> Dataset 2) Exact MD5 Duplicates:** **0 exact matches**. Dataset 2 is entirely distinct from Dataset 1.
- **Cross-Dataset Near-Duplicates (aHash):** 2 minor visual similarity clusters flagged for review during partitioning.

---

## 4. Dataset 2 Class Distribution & Label Ambiguity Audit

Dataset 2 contains **51 class directories** representing 8 crop families:

| Crop Family | Class Folder Name | Image Count | Label Ambiguity / Agronomic Notes |
| :--- | :--- | :---: | :--- |
| **Banana** | `Banana_Black Sigatoka` | 500 | Fungal leaf spot (*Mycosphaerella fijiensis*) |
| **Banana** | `Banana_Cordana Leaf Spot` | 342 | Fungal leaf spot (*Cordana musae*) |
| **Banana** | `Banana_Healthy` | 500 | Healthy foliage |
| **Banana** | `Banana_Panama Disease` | 500 | Vascular wilt pathogen (*Fusarium oxysporum*) |
| **Chilli** | `Chilli_Anthracnose` | 465 | Fruit/leaf rot (*Colletotrichum capsici*) |
| **Chilli** | `Chilli_Damping Off` | 168 | Seedling disease (*Pythium / Rhizoctonia*) |
| **Chilli** | `Chilli_Healthy` | 300 | Healthy foliage |
| **Chilli** | `Chilli_Leaf Curl Virus` | 490 | Viral pathogen spread by whiteflies |
| **Chilli** | `Chilli_Leaf Spot` | 490 | Cercospora leaf spot (*Cercospora capsici*) |
| **Chilli** | `Chilli_Veinal Mottle Virus` | 490 | Potyvirus infection |
| **Chilli** | `Chilli_Whitefly` | 490 | Vector pest infestation (*Bemisia tabaci*) |
| **Chilli** | `Chilli_Yellowish` | 490 | Nutrient chlorosis / viral yellowing (Ambiguous) |
| **Cotton** | `Cotton_Alternaria Leaf Spot` | 500 | Fungal leaf spot (*Alternaria macrospora*) |
| **Cotton** | `Cotton_Bacterial Blight` | 500 | Angular leaf spot (*Xanthomonas*) |
| **Cotton** | `Cotton_Fusarium Wilt` | 500 | Vascular fungal wilt |
| **Cotton** | `Cotton_Healthy` | 500 | Healthy canopy |
| **Cotton** | `Cotton_Verticillium Wilt` | 500 | Soil-borne fungal wilt |
| **Mango** | `Mango_Anthracnose` | 500 | Blossom & leaf blight (*Colletotrichum*) |
| **Mango** | `Mango_Bacterial Canker` | 500 | Bacterial spot (*Xanthomonas citri pv. mangiferaeindicae*) |
| **Mango** | `Mango_Cutting Weevil` | 500 | Insect pest damage (*Deporaus marginatus*) |
| **Mango** | `Mango_Die Back` | 500 | Fungal twig necrosis (*Botryosphaeria*) |
| **Mango** | `Mango_Gall Midge` | 500 | Leaf gall pest (*Procontarinia*) |
| **Mango** | `Mango_Healthy` | 500 | Healthy foliage |
| **Mango** | `Mango_Powdery Mildew` | 500 | White powdery growth (*Oidium mangiferae*) |
| **Mango** | `Mango_Sooty Mould` | 500 | Fungal coating from honeydew insects |
| **Oil Palm** | `Palm_Dryness` | 70 | Abiotic moisture stress (Small sample) |
| **Oil Palm** | `Palm_Fungal Disease` | 25 | Generic fungal tag (Rare class - Needs review) |
| **Oil Palm** | `Palm_Magnesium Deficiency` | 59 | Abiotic nutrient deficiency chlorosis |
| **Oil Palm** | `Palm_Scale Insect` | 142 | Armored scale insect infestation |
| **Rice** | `Rice_Bacterial Leaf Blight` | 460 | Vascular blight (*Xanthomonas oryzae*) |
| **Rice** | `Rice_Blast` | 500 | Blast lesion (*Magnaporthe oryzae*) |
| **Rice** | `Rice_Brownspot` | 460 | Brown spot (*Helminthosporium oryzae*) |
| **Rice** | `Rice_Healthy` | 500 | Healthy paddy foliage |
| **Rice** | `Rice_Leaf Scald` | 500 | Scald necrosis (*Microdochium oryzae*) |
| **Rice** | `Rice_Leaf Smut` | 40 | False smut / leaf smut (*Entyloma oryzae*) |
| **Rice** | `Rice_Sheath Blight` | 500 | Sheath fungal blight (*Rhizoctonia solani*) |
| **Rice** | `Rice_Tungro` | 500 | Viral disease complex spread by leafhoppers |
| **Tomato** | `Tomato_Bacterial Spot` | 500 | Bacterial lesion (*Xanthomonas*) |
| **Tomato** | `Tomato_Early Blight` | 500 | Target-like leaf spots (*Alternaria solani*) |
| **Tomato** | `Tomato_Healthy` | 500 | Healthy foliage |
| **Tomato** | `Tomato_Late Blight` | 500 | Water-soaked blighting (*Phytophthora*) |
| **Tomato** | `Tomato_Leaf Mold` | 500 | Olive green mold (*Passalora fulva*) |
| **Tomato** | `Tomato_Mosaic Virus` | 373 | Viral mottle (*ToMV*) |
| **Tomato** | `Tomato_Septoria Leaf Spot` | 500 | Small dark pycnidial spots (*Septoria*) |
| **Tomato** | `Tomato_Spider Mites` | 500 | Two-spotted spider mite webbing & stippling |
| **Tomato** | `Tomato_Target Spot` | 500 | Necrotic target lesion (*Corynespora*) |
| **Tomato** | `Tomato_Yellow Leaf Curl Virus`| 500 | Geminivirus leaf curling & stunting |
| **Turmeric**| `Turmeric_Dry Leaf` | 203 | Senescence / drought foliage dry-up |
| **Turmeric**| `Turmeric_Healthy` | 197 | Healthy green turmeric foliage |
| **Turmeric**| `Turmeric_Leaf Blotch` | 199 | Fungal blotch (*Taphrina maculans*) |
| **Turmeric**| `Turmeric_Rhizome Rot` | 182 | Soil-borne rot (*Pythium aphanidermatum*) |
| **Total** | **21,135** | **51 Classes** | **21,135 Images** |

---

## 5. Machine-Readable Quality Manifests

The following derived manifests have been created in [`ml_models/disease_detection/unified_experiment/`](file:///e:/tekworks_projects/crop/ml_models/disease_detection/unified_experiment):

1. [`dataset_1_quality_manifest.json`](file:///e:/tekworks_projects/crop/ml_models/disease_detection/unified_experiment/dataset_1_quality_manifest.json): Contains metadata, dimensions, MD5, aHash, and taxonomy labels for 2,730 Dataset 1 images.
2. [`dataset_2_quality_manifest.json`](file:///e:/tekworks_projects/crop/ml_models/disease_detection/unified_experiment/dataset_2_quality_manifest.json): Contains metadata, archive member paths, dimensions, MD5, aHash, and original labels for 21,135 Dataset 2 images.
3. [`duplicate_analysis_report.json`](file:///e:/tekworks_projects/crop/ml_models/disease_detection/unified_experiment/duplicate_analysis_report.json): Records all 293 intra-dataset duplicate groups and cross-dataset near-duplicate candidate clusters.
4. [`quality_inspection_summary.json`](file:///e:/tekworks_projects/crop/ml_models/disease_detection/unified_experiment/quality_inspection_summary.json): Overall summary statistics.

---

## 6. Phase 3 Verification Gate Table

| Verification Item | Status | Evidence & Artifact Location |
| :--- | :---: | :--- |
| **A. Both datasets inspected separately** | **PASS** | Dataset 1 (2,730 img) and Dataset 2 (21,135 img) analyzed in isolation. |
| **B. Every proposed exclusion recorded** | **PASS** | 293 MD5 intra-dataset duplicate groups logged in `duplicate_analysis_report.json`. |
| **C. Original datasets remain unchanged** | **PASS** | Both `dataset_prepared` and `archive.zip` verified 100% untouched. |
| **D. Class & file counts reproducible** | **PASS** | Inspection script re-executed twice with identical 23,865 total image count. |
| **E. Exact & near-duplicates documented** | **PASS** | 0 cross-dataset exact duplicates, 2 near-duplicate clusters logged. |
| **F. Ambiguous labels documented** | **PASS** | Ambiguous classes (`Palm_Fungal Disease`, `Chilli_Yellowish`) flagged for review. |
| **G. Both quality manifests readable** | **PASS** | Valid JSON manifests saved at `ml_models/disease_detection/unified_experiment/`. |
| **H. Integrity checks still pass** | **PASS** | `verify_baseline_hashes.py` re-verified baseline SHA-256 hashes (0 mismatches). |

---

**Phase 3 Gate Status:** **ALL 8 MANDATORY CHECKS PASSED (PASS)**  
*Next Action: Await user review and approval before proceeding to Phase 4.*
