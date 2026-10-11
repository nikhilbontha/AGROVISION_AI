# AgroVision AI 2.0 — Phase 3: Data Leakage and Duplicate Audit Report

**Document ID:** `docs/agrovision_v2/phase3/data_leakage_report.md`  
**Date:** October 11, 2026  
**Status:** Audit Completed (PASS)  
**System:** AgroVision AI — Dataset Quality, Label Verification & Safe Preparation  

---

## 1. Executive Summary

This report evaluates exact duplicates, perceptual near-duplicates, label collision clusters, and split-leakage vulnerabilities across **Dataset 1** (2,730 images), **Dataset 2** (21,135 images), and the existing train/val/test partitions.

### Key Audit Findings:
1. **Intra-Dataset Exact Duplicates in Dataset 2:**
   - **293 exact MD5 duplicate clusters** containing **412 total duplicate images** (119 redundant identical files).
   - These represent identical photos repeatedly uploaded during regional field data consolidation.
2. **Cross-Dataset Collision Integrity:**
   - **0 exact MD5 collisions** between Dataset 1 (PlantVillage lab) and Dataset 2 (Andhra field photos). Dataset 1 and Dataset 2 are 100% distinct image sets.
3. **Cross-Dataset Perceptual Near-Duplicates:**
   - 2 visual near-match clusters identified via Average Hash (`aHash`). These correspond to generic blurred leaf backgrounds rather than identical specimen leaks.
4. **Partition Leakage in Historical Partitions:**
   - In historical uncurated partitions, duplicate cluster members had a non-zero probability of being assigned to both `train` and `test` splits if splitting was performed uniformly at random without group hashing.
   - For AgroVision AI 2.0, **group-based cryptographic partitioning** must be enforced to lock all members of a duplicate/near-duplicate cluster into the same split partition.

---

## 2. Cryptographic Hash Exact Duplicate Analysis

### 2.1 Dataset 1 Audit
- **Total Images Scanned:** 2,730 (`.jpg`)
- **Unique MD5 Hashes:** 2,730
- **Internal Duplicate Groups:** **0** (Dataset 1 is strictly deduplicated).

### 2.2 Dataset 2 Audit
- **Total Images Scanned:** 21,135 (`.jpg`, `.png`, `.jpeg`)
- **Unique MD5 Hashes:** 20,842
- **Duplicate MD5 Clusters:** **293 clusters**
- **Total Images Involved:** **412 images**
- **Distribution across Crops:**
  - Chilli (`Chilli_Leaf Curl Virus`, `Chilli_Leaf Spot`): 84 duplicate clusters
  - Cotton (`Cotton_Alternaria Leaf Spot`, `Cotton_Bacterial Blight`): 62 duplicate clusters
  - Mango (`Mango_Anthracnose`, `Mango_Die Back`): 78 duplicate clusters
  - Rice (`Rice_Blast`, `Rice_Bacterial Leaf Blight`): 45 duplicate clusters
  - Tomato (`Tomato_Early Blight`, `Tomato_Late Blight`): 24 duplicate clusters

### 2.3 Sample Duplicate Clusters in Dataset 2

| MD5 Hash | Image Count | Sample Path 1 | Sample Path 2 | Assigned Class | Cross-Class Collision? |
| :--- | :---: | :--- | :--- | :--- | :---: |
| `0079a45b98751f893e48f72921021484` | 2 | `Chilli_Leaf Spot/aug_spot_(12).jpg` | `Chilli_Leaf Spot/aug_spot_(198).jpg` | `Chilli_Leaf Spot` | **No (Same Class)** |
| `0139bc672621a148386c99c8285514f7` | 2 | `Mango_Anthracnose/20211008_124530.jpg` | `Mango_Anthracnose/20211008_124530_1.jpg` | `Mango_Anthracnose` | **No (Same Class)** |
| `04987fa76fbb33658eb8d43818e690f3` | 2 | `Rice_Blast/BLAST1_015.jpg` | `Rice_Blast/BLAST1_015_copy.jpg` | `Rice_Blast` | **No (Same Class)** |
| `0a811c7fa82496a7981b837482811a01` | 3 | `Cotton_Bacterial Blight/img_12.png` | `Cotton_Bacterial Blight/img_12_aug.png` | `Cotton_Bacterial Blight`| **No (Same Class)** |

*Finding:* 100% of exact MD5 duplicates occur **within the same class directory**. Zero cross-label contradictions were found among exact cryptographic duplicates.

---

## 3. Cross-Dataset Perceptual Similarity & Near-Duplicates

To verify that Dataset 2 did not secretly ingest downscaled or recompressed PlantVillage images from Dataset 1, perceptual hashing (`aHash`, 64-bit fingerprint) was executed across all 23,865 combined images:

```
Total Perceptual Fingerprints Generated: 23,865
Unique Perceptual Fingerprints: 22,941
Cross-Dataset aHash Overlaps: 2 clusters (4 images total)
```

### Detailed Inspection of the 2 Cross-Dataset Candidates:
1. **Candidate 1 (Hash: `ffc783838383c7ff`):**
   - *Dataset 1 Image:* `ml_models/disease_detection/dataset_prepared/train/Tomato___Leaf_Mold/Tomato___Leaf_Mold_train_29.jpg`
   - *Dataset 2 Image:* `Andhra_Master_Dataset/Cotton_Verticillium Wilt/aug_verticillium_(435).png`
   - *Visual Audit:* Both images feature an out-of-focus, washed-out green background with a central vertical brown vein. The underlying leaves are biologically distinct (Tomato pinnate leaf vs. Cotton palmate lobed leaf). **Verdict: Incidental visual similarity in low-frequency hash; not a duplicate.**
2. **Candidate 2 (Hash: `ffffc38181c3ffff`):**
   - *Dataset 1 Image:* `ml_models/disease_detection/dataset_prepared/val/Tomato___Tomato_Yellow_Leaf_Curl_Virus/Tomato___Tomato_Yellow_Leaf_Curl_Virus_val_0.jpg`
   - *Dataset 2 Image:* `Andhra_Master_Dataset/Cotton_Bacterial Blight/aug_bacterial_(1027).png`
   - *Visual Audit:* High-brightness overexposed leaf edges against white background. **Verdict: False positive near-duplicate due to sensor saturation; distinct plant specimens.**

**Conclusion on Cross-Dataset Leakage:** There is **zero cross-dataset contamination**. Dataset 2 is an entirely independent, native regional collection.

---

## 4. Historical Split Leakage Vulnerability

In the historical Phase 5/7 experiment, data partitioning was performed at the image file level:
- If image `aug_spot_(12).jpg` was placed into `train` and its exact clone `aug_spot_(198).jpg` was placed into `val` or `test`, the model achieved an artificial accuracy boost by memorizing pixel values.
- **Risk Assessment:** Out of 21,135 images in Dataset 2, 412 images belong to duplicate clusters (1.95% of data). While this does not compromise the overall statistical validity of the dataset, it represents a known leakage channel.

---

## 5. Mandatory Corrective Action for AgroVision AI 2.0

To permanently eliminate data leakage in all future model training (Phase 4+):
1. **Cluster-Locked Splitting:** Group every exact duplicate cluster into a single atomic `duplicate_group_id`.
2. **Atomic Partition Assignment:** When assigning samples to `train`, `val`, or `test`, partition by `duplicate_group_id` rather than individual `sample_id`. If one member of a duplicate group is in `train`, all members are locked into `train`.
3. **Deduplicated Evaluation:** When computing benchmark test metrics, evaluate only **one representative image per duplicate cluster** to prevent duplicate weighting from artificially inflating test performance.
