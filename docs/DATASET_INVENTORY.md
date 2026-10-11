# AGROVISION AI - DATASET INVENTORY & DIAGNOSTIC REPORT

**Date:** October 10, 2026  
**Taxonomy Version:** 2.0.0  
**Total Scanned Valid Samples:** 2730  
**Total Quarantined / Excluded Files:** 0  

---

## 1. Executive Summary & Distribution

- **Total Crop Families:** 11 (Apple, Corn, Cotton, Grape, Non_Plant, Orange, Pepper, Potato, Rice, Tomato, Wheat)
- **Total Diagnostic Classes:** 39
- **Healthy Crop Foliage Images:** 700 (25.6%)
- **Diseased Foliage Images:** 2030 (74.4%)

### Partition Split Overview
- **Training Set (60%):** 1560 images
- **Validation Set (15%):** 390 images
- **Test Set (15%):** 390 images
- **Independent Field-Test Set (10%):** 390 images (Protected from training & tuning)

---

## 2. Crop Family Image Inventory

| Crop Family | Total Images | Share (%) | Status |
| :--- | :---: | :---: | :--- |
| **Tomato** | 700 | 25.6% | Sufficient |
| **Apple** | 280 | 10.3% | Sufficient |
| **Corn** | 280 | 10.3% | Sufficient |
| **Grape** | 280 | 10.3% | Sufficient |
| **Wheat** | 280 | 10.3% | Sufficient |
| **Potato** | 210 | 7.7% | Sufficient |
| **Rice** | 210 | 7.7% | Sufficient |
| **Cotton** | 140 | 5.1% | Sufficient |
| **Orange** | 140 | 5.1% | Sufficient |
| **Pepper** | 140 | 5.1% | Sufficient |
| **Non_Plant** | 70 | 2.6% | Moderate Coverage |

---

## 3. Detailed Class Inventory & Partition Breakdown

| Class ID | Class Name | Healthy? | Train | Val | Test | Field Test | Total | Sufficiency |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 0 | `Apple___Apple_scab` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 1 | `Apple___Black_rot` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 2 | `Apple___Cedar_apple_rust` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 3 | `Apple___healthy` | Healthy | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 4 | `Corn___Cercospora_leaf_spot Gray_leaf_spot` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 5 | `Corn___Common_rust` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 6 | `Corn___Northern_Leaf_Blight` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 7 | `Corn___healthy` | Healthy | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 8 | `Cotton___Bacterial_blight` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 9 | `Cotton___healthy` | Healthy | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 10 | `Grape___Black_rot` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 11 | `Grape___Esca_(Black_Measles)` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 12 | `Grape___Leaf_blight_(Isariopsis_Leaf_Spot)` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 13 | `Grape___healthy` | Healthy | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 14 | `Non_Plant___Unsupported` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 15 | `Orange___Haunglongbing_(Citrus_greening)` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 16 | `Orange___healthy` | Healthy | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 17 | `Pepper,_bell___Bacterial_spot` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 18 | `Pepper,_bell___healthy` | Healthy | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 19 | `Potato___Early_blight` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 20 | `Potato___Late_blight` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 21 | `Potato___healthy` | Healthy | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 22 | `Rice___Bacterial_leaf_blight` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 23 | `Rice___Blast` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 24 | `Rice___healthy` | Healthy | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 25 | `Tomato___Bacterial_spot` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 26 | `Tomato___Early_blight` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 27 | `Tomato___Late_blight` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 28 | `Tomato___Leaf_Mold` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 29 | `Tomato___Septoria_leaf_spot` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 30 | `Tomato___Spider_mites Two-spotted_spider_mite` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 31 | `Tomato___Target_Spot` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 32 | `Tomato___Tomato_Yellow_Leaf_Curl_Virus` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 33 | `Tomato___Tomato_mosaic_virus` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 34 | `Tomato___healthy` | Healthy | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 35 | `Wheat___Leaf_rust` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 36 | `Wheat___Powdery_mildew` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 37 | `Wheat___Stripe_rust` | Diseased | 40 | 10 | 10 | 10 | **70** | Full (70+) |
| 38 | `Wheat___healthy` | Healthy | 40 | 10 | 10 | 10 | **70** | Full (70+) |

---

## 4. Exclusion & Data Cleaning Log Summary

- **Exact Duplicate Hash Collisions:** Excluded via MD5 hashing.
- **Near-Duplicate Image Collisions:** Excluded via perceptual aHash.
- **Corrupt / Unreadable Images:** Quarantined prior to partition splitting.
- **Log Location:** `ml_models/disease_detection/dataset_prepared/exclusion_log.json`

---

## 5. Verification Gate Status

- [x] Every included class has an explicit taxonomy definition.
- [x] Reproducible preparation script executed.
- [x] Duplicate leakage investigated and quarantined.
- [x] Independent field-test partition protected.
