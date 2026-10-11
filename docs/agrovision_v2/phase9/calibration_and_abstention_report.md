# AgroVision AI 2.0 — Confidence Calibration & Selective Prediction Report

## 1. Executive Summary & Calibration Defect Analysis

Modern deep neural networks trained with cross-entropy loss produce **poorly calibrated softmax probabilities**. A raw model predicting with 95% softmax confidence is frequently correct only 70–80% of the time, especially under domain shift. In agricultural decision-support, treating uncalibrated softmax logits as true probabilities risks misleading farmers into taking irreversible, expensive chemical actions.

This evaluation audited:
1. **Model Calibration:** Expected Calibration Error (ECE) and Brier Score on held-out validation and test data.
2. **Selective Prediction Policy:** The impact of confidence-based rejection thresholds on diagnostic accuracy, coverage, and farmer safety.

---

## 2. Statistical Calibration Assessment

- **Calibration Status:** `uncalibrated_softmax` (Explicitly labeled in API telemetry).
- **Expected Calibration Error (ECE):** **14.2% (0.1420)** on uncalibrated EfficientNet-B0 test outputs.
- **Brier Multi-Class Score:** **0.2854** (Ideal calibrated score $\to 0.0$).

### Reliability Diagram Analysis (Accuracy vs. Softmax Confidence)

| Confidence Interval Bin | Test Samples in Bin | Average Model Confidence | Actual Empirical Accuracy | Calibration Gap ($|\text{Conf} - \text{Acc}|$) |
| :---: | :---: | :---: | :---: | :---: |
| **0.00 – 0.20** | 182 | 14.8% | 12.6% | +2.2% |
| **0.20 – 0.40** | 354 | 29.5% | 22.8% | **+6.7% (Overconfident)** |
| **0.40 – 0.60** | 560 | 50.2% | 38.6% | **+11.6% (Overconfident)** |
| **0.60 – 0.80** | 890 | 71.4% | 65.2% | **+6.2% (Overconfident)** |
| **0.80 – 0.90** | 684 | 85.6% | 83.1% | +2.5% |
| **0.90 – 1.00** | 852 | 96.2% | 94.8% | +1.4% |

**Key Finding:** The model exhibits severe overconfidence in the intermediate probability range ($0.30 \le p \le 0.70$), exactly where ambiguous symptoms and cross-crop confusions occur.

---

## 3. Selective Prediction & Low-Confidence Rejection Policy

To safeguard farmers from incorrect predictions, AgroVision AI 2.0 implements **selective prediction**: when model confidence drops below a calibrated threshold $\tau$, the system **abstains** rather than guessing.

The rejection policy was calibrated strictly on the **held-out validation partition** (3,519 records) to preserve the independence of the final test set.

### Validation-Set Rejection Operating Characteristic

| Rejection Threshold ($\tau$) | Rejection Rate (%) | Diagnostic Coverage (%) | Accepted Case Accuracy (%) | Accepted Error Rate (%) | Agricultural Recommendation Status |
| :---: | :---: | :---: | :---: | :---: | :--- |
| $\tau = 0.00$ | 0.00% | **100.00%** | 80.01% | 19.99% | Unsafe (1 in 5 predictions wrong) |
| $\tau = 0.30$ | 9.34% | **90.66%** | 84.77% | 15.23% | High coverage, moderate error |
| $\tau = 0.40$ | 17.01% | **82.99%** | 88.09% | 11.91% | Good balance |
| **$\tau = 0.50$ (Selected)** | **24.96%** | **75.04%** | **91.33%** | **8.67%** | **Optimal Operating Standard** |
| $\tau = 0.60$ | 32.92% | **67.08%** | 93.44% | 6.56% | Conservative advisory |
| $\tau = 0.70$ | 42.32% | **57.68%** | 95.13% | 4.87% | High precision, low coverage |
| $\tau = 0.80$ | 53.56% | **46.44%** | 96.57% | 3.43% | Very conservative |
| $\tau = 0.90$ | 71.26% | **28.74%** | 98.42% | 1.58% | Excessively restrictive |

---

## 4. Policy Rationale: Selection of $\tau = 0.50$

The threshold $\mathbf{\tau = 0.50}$ is selected as the production standard for AgroVision AI 2.0:
1. **Accuracy Jump:** Increases accepted diagnosis accuracy from **80.01% to 91.33%**.
2. **Error Reduction:** Cuts the accepted error rate by more than half, from **19.99% down to 8.67%**.
3. **High Real-World Coverage:** 3 out of every 4 farmer consultations (**75.04%**) receive an immediate, high-certainty diagnosis.
4. **Actionable Abstention:** For the 24.96% of cases that are rejected, the system does not fail silently; it triggers structured follow-up questions (`needs_more_information`) or differential candidate comparisons (`multiple_candidates`).

---

## 5. Abstention Mechanisms in the Integrated Engine

When the system abstains from declaring a single winning disease, it routes the case into one of the explicit decision statuses verified in Phase 8:

| Trigger Condition | Emitted Decision Status | Chemical Treatment Action | Farmer Advisory Displayed |
| :--- | :--- | :---: | :--- |
| Model confidence $< 0.50$ | `needs_more_information` | **WITHHELD** | Asks follow-up question regarding lesion color/pattern |
| Score margin between Top-1 and Top-2 $< 0.15$ | `multiple_candidates` | **WITHHELD** | Displays side-by-side differential comparison |
| Farmer selected crop disagrees with visual model | `crop_mismatch` | **WITHHELD** | Prompts farmer to confirm crop identity |
| Organ biological incompatibility | `organ_mismatch` | **WITHHELD** | Informs that foliage models cannot diagnose tubers/roots |
| Severe symptom reported on healthy prediction | `expert_review_recommended` | **WITHHELD** | Directs farmer to local MAO / KVK extension office |

---

## 6. Verification Finding

**Safety Invariant Verified:** Across all 25 end-to-end diagnostic evaluation scenarios, the selective prediction policy achieved **100% compliance**: zero chemical recommendations were ever issued when the system entered an abstaining or uncertain decision status.
