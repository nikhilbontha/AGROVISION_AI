# AgroVision AI — Model Evaluation & Performance Benchmark Report

**Date:** October 11, 2026  
**Status:** Verification Gate Passed (PASS)  
**Evaluated Candidate:** [`AGROVISION_UNIFIED_72CLASS_MODEL.h5`](file:///e:/tekworks_projects/crop/ml_models/disease_detection/unified_experiment/artifacts/agrovision_phase7_20261010_231412/AGROVISION_UNIFIED_72CLASS_MODEL.h5)  
**Evaluated Baseline:** [`disease_model.h5`](file:///e:/tekworks_projects/crop/ml_models/disease_detection/disease_model.h5)  
**Independent Locked Test Set:** [`test_manifest.json`](file:///e:/tekworks_projects/crop/ml_models/disease_detection/unified_experiment/test_manifest.json) (**3,522 images**, 0 train/val leakage)  
**Machine-Readable Report:** [`model_evaluation_metrics.json`](file:///e:/tekworks_projects/crop/reports/model_evaluation_metrics.json)

---

## 1. Executive Summary

This evaluation benchmark compares the 39-class production baseline model against the newly integrated 72-class master candidate (`AGROVISION_UNIFIED_72CLASS_MODEL.h5`) using unconstrained global prediction across the zero-leakage test dataset of 3,522 images.

> [!IMPORTANT]
> **VERDICT: OPTION A — INTEGRATION APPROVED**  
> The 72-class master candidate expands supported crop coverage from 11 to 16 crop species families, improves overall test accuracy from **34.96% to 80.35%** (+45.39%), achieves **86.86% accuracy on regional field photographs**, and delivers **91.33% accuracy** under the standard production confidence rejection threshold ($\tau = 0.50$).

---

## 2. Comparative Benchmark Results

| Metric / Dimension | Baseline (`disease_model.h5`) | Master Candidate (`AGROVISION_UNIFIED_72CLASS_MODEL.h5`) | Net Improvement |
| :--- | :---: | :---: | :---: |
| **Supported Canonical Classes** | 39 classes (11 crops) | **72 classes (16 crops)** | **+33 Classes** |
| **Test Image Sample Size** | 409 eligible images | **3,522 images (100% Test Split)** | **+3,113 Images** |
| **Overall Test Accuracy** | 34.96% | **80.35%** | **+45.39%** |
| **Balanced Accuracy** | 31.20% | **70.23%** | **+39.03%** |
| **Macro Precision** | 0.3210 | **0.7051** | **+0.3841** |
| **Macro Recall** | 0.3120 | **0.7023** | **+0.3903** |
| **Macro F1-Score** | 0.3120 | **0.6808** | **+0.3688** |
| **Weighted F1-Score** | 0.3450 | **0.8079** | **+0.4629** |
| **Regional Andhra Field Acc.** | Unsupported (0%) | **86.86%** | **+86.86%** |
| **Field Photograph Subset Acc.** | 33.08% | **85.83%** | **+52.75%** |

---

## 3. Regional Crop Performance Breakdown

Performance across the primary regional crops of South India (Andhra Pradesh Master Dataset):

| Crop Family | Canonical Sub-Classes | Test Sample Count | Accuracy (%) | Reliability Status |
| :--- | :---: | :---: | :---: | :--- |
| **Banana** | 4 Classes | 276 | **89.13%** | Release Approved |
| **Chilli** | 8 Classes | 462 | **86.15%** | Release Approved |
| **Cotton** | 5 Classes | 396 | **88.64%** | Release Approved |
| **Mango** | 9 Classes | 675 | **91.41%** | Release Approved |
| **Oil Palm** | 4 Classes | 44 | **81.82%** | Release Approved |
| **Rice** | 8 Classes | 550 | **84.55%** | Release Approved |
| **Turmeric** | 4 Classes | 117 | **87.18%** | Release Approved |

---

## 4. Confidence Rejection Policy Thresholds

Calibrated on the 3,521 validation images to filter out non-plant images and low-confidence visual noise:

| Threshold ($\tau$) | Rejection Rate (%) | Accepted Accuracy (%) | Mode |
| :---: | :---: | :---: | :--- |
| $\tau = 0.00$ | 0.00% | 80.01% | Unfiltered Raw Baseline |
| $\tau = 0.30$ | 9.34% | 84.77% | Permissive Mode |
| **$\tau = 0.50$** | **24.96%** | **91.33%** | **Standard Production Mode (Recommended)** |
| $\tau = 0.60$ | 32.92% | 93.44% | High Precision Mode |
| $\tau = 0.80$ | 53.56% | 96.57% | Strict Expert Mode |

---

## 5. Error Analysis Summary

Out of 3,522 locked test images, 692 errors were logged:
1. **Wrong Disease, Same Crop (398 cases / 57.5%):** Visual similarity between fine-grained fungal spot sub-types.
2. **Wrong Crop Family (264 cases / 38.2%):** Low-contrast PlantVillage lab background images. Unconstrained inference combined with $\tau = 0.50$ rejection converts these low-confidence predictions into informative `UNCERTAIN_DIAGNOSIS` responses rather than false positive predictions.
3. **Healthy Misclassified as Diseased (30 cases / 4.3%):** Slight leaf tip yellowing mistaken for early chlorosis.

---

## 6. Verification Gate

- [x] Zero train/val/test data leakage.
- [x] Unconstrained global prediction operational in backend API.
- [x] Crop mismatch detection safeguards active.
- [x] 60-second baseline model fallback preserved.
