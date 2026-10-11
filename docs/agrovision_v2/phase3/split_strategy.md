# AgroVision AI 2.0 — Phase 3: Leakage-Resistant Data Split Strategy

**Document ID:** `docs/agrovision_v2/phase3/split_strategy.md`  
**Date:** October 11, 2026  
**Status:** Strategy Formulated (PASS)  
**System:** AgroVision AI — Dataset Quality, Label Verification & Safe Preparation  

---

## 1. Executive Summary

This document establishes the official **leakage-resistant data partition strategy** for future model development in AgroVision AI 2.0. It defines the principles, grouping rules, stratification algorithms, and isolation boundaries necessary to ensure that future test metrics reflect genuine real-world generalization rather than data memorization.

---

## 2. Fundamental Splitting Principles

### Principle 1: Group-Locked Atomic Partitioning
- All exact cryptographic duplicates (sharing identical MD5/SHA256 hashes) and high-confidence near-duplicates (identical photo shoots/bursts) are assigned an atomic `group_id`.
- The partition allocator operates on **groups**, not individual files:
  $$\forall s_a, s_b \in G_k \implies \text{split}(s_a) = \text{split}(s_b)$$
  If sample $s_a$ is placed into `train`, duplicate $s_b$ must never be placed into `val` or `test`.

### Principle 2: Strict Isolation of the Final Benchmark Test Set
- **Development vs. Evaluation Separation:**
  - `train`: Used solely for backpropagation weight updates.
  - `val`: Used exclusively for hyperparameter tuning, learning rate scheduling, early stopping, and temperature scaling calibration.
  - `test`: Locked vault partition evaluated **only once** for final release gating.
- **Strict Prohibition:** Model architecture, data augmentation policies, confidence rejection thresholds ($\tau$), and feature preprocessing must **never be tuned against the test partition**.

### Principle 3: Stratified Group Balancing
- To maintain balanced disease representation, group splitting must follow stratified allocation:
  - **70% Training Partition (`train`)**
  - **15% Validation Partition (`val`)**
  - **15% Independent Test Partition (`test`)**
- Stratification is conditioned on `canonical_disease_id` while maintaining atomic group locking.

---

## 3. Handling Imbalanced & Rare Classes

Certain regional classes possess very few samples, making standard 70/15/15 stratification statistically vulnerable:

| Class Identifier | Total Images | Recommended Partition Allocation | Agronomic Stratification Policy |
| :--- | :---: | :---: | :--- |
| `dis_rice_leaf_smut` | 40 | 28 Train / 6 Val / 6 Test | Minimum floor: at least 6 test images reserved for evaluation. |
| `dis_palm_magnesium_deficiency`| 59 | 41 Train / 9 Val / 9 Test | Preserved entirely in training/validation; flag high variance in test metrics. |
| `dis_palm_scale_insect` | 142 | 100 Train / 21 Val / 21 Test | Standard 70/15/15 ratio. |
| `dis_chilli_damping_off` | 168 | 118 Train / 25 Val / 25 Test | Standard 70/15/15 ratio. |
| `dis_turmeric_rhizome_rot` | 182 | 128 Train / 27 Val / 27 Test | Standard 70/15/15 ratio; ensures underground rot photos in test set. |

---

## 4. Addressing Domain Shift & Lab Cardboard Bias

As discovered in Phase 1 and Phase 2, Dataset 1 classes (Apple, Corn, Grape, Orange, Pepper Bell, Potato, Wheat) exist only as laboratory cardboard photographs.

### The Two-Tiered Evaluation Strategy:
1. **Tier 1 (Regional In-Situ Field Test Set):**
   - Composed exclusively of Dataset 2 field photographs (Banana, Chilli, Cotton, Mango, Rice, Tomato, Turmeric).
   - Serves as the primary operational benchmark for South Indian farming conditions.
2. **Tier 2 (Controlled Lab Diagnostic Test Set):**
   - Composed of held-out Dataset 1 laboratory images.
   - Evaluates basic visual symptom feature representation for crops lacking field datasets, but explicitly flagged as `lab_only_benchmark` with documented domain shift warnings.

---

## 5. Audit of Historical Test Split Reuse

> [!WARNING]
> **Audit Warning on Historical Test Split Reuse:**  
> The 3,522-image test partition (`test_manifest.json`) generated in the Phase 5 experiment was previously evaluated during Phase 8 and Phase 9 integration testing.
> In machine learning methodology, repeatedly using the same held-out test partition across multiple development cycles risks **implicit test set feedback**.
> For AgroVision AI 2.0 release benchmarking (Phase 4+), a clean, re-seeded random partition based on the new `group_id` specification must be generated and locked prior to final evaluation.
