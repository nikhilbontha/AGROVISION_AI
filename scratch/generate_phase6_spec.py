import os
import json

base_dir = r"e:\tekworks_projects\crop\ml_models\disease_detection\unified_experiment"
mapping_path = os.path.join(base_dir, "unified_label_mapping.json")

with open(mapping_path, 'r', encoding='utf-8') as f:
    mapping = json.load(f)

class_id_to_canonical = {m['canonical_class_id']: m['canonical_class_key'] for m in mapping if 'canonical_class_id' in m}
num_classes = len(class_id_to_canonical)

spec = {
    "experiment_metadata": {
        "title": "AgroVision AI Unified 72-Class Training & Strategy Selection Spec",
        "version": "2.0.0",
        "timestamp": "2026-10-10T23:12:00+05:30",
        "num_canonical_classes": num_classes,
        "input_shape": [224, 224, 3],
        "random_seed": 42
    },
    "existing_checkpoint_audit": {
        "checkpoint_path": "ml_models/disease_detection/disease_model.h5",
        "architecture": "EfficientNetB0",
        "existing_output_classes": 39,
        "trainable_parameters": 4851914,
        "has_optimizer_state": False,
        "usable_for_weight_transfer": True,
        "usable_for_direct_resume": False
    },
    "data_manifests": {
        "train": "ml_models/disease_detection/unified_experiment/train_manifest.json",
        "val": "ml_models/disease_detection/unified_experiment/val_manifest.json",
        "test": "ml_models/disease_detection/unified_experiment/test_manifest.json",
        "field_test": "ml_models/disease_detection/unified_experiment/field_test_manifest.json",
        "exclusion": "ml_models/disease_detection/unified_experiment/exclusion_manifest.json"
    },
    "training_candidates": [
        {
            "candidate_id": "STRATEGY_A_COMBINED_BASELINE",
            "name": "Strategy A: Full Combined Training (ImageNet Backbone)",
            "architecture": "EfficientNetB0 + Dense(72, Softmax)",
            "initialization": "ImageNet Pretrained Weights",
            "stage1_epochs": 5,
            "stage1_lr": 0.001,
            "stage2_epochs": 12,
            "stage2_lr": 0.0001,
            "batch_size": 32,
            "class_weighting": "Inverse Frequency Scaling",
            "label_smoothing": 0.1,
            "target_checkpoint": "ml_models/disease_detection/unified_experiment/checkpoints/AGROVISION_EFFNET_U72_STRATEGY_A.h5"
        },
        {
            "candidate_id": "STRATEGY_B_WARMSTART_FINETUNE",
            "name": "Strategy B: Warm-Start Fine-Tuning (39-Class Weights Transfer)",
            "architecture": "EfficientNetB0 Backbone + New Dense(72, Softmax) Head",
            "initialization": "disease_model.h5 Learned Conv Weights",
            "stage1_epochs": 5,
            "stage1_lr": 0.001,
            "stage2_epochs": 12,
            "stage2_lr": 0.0001,
            "batch_size": 32,
            "class_weighting": "Inverse Frequency Scaling",
            "label_smoothing": 0.1,
            "target_checkpoint": "ml_models/disease_detection/unified_experiment/checkpoints/AGROVISION_EFFNET_U72_STRATEGY_B.h5"
        }
    ],
    "evaluation_metrics": [
        "Overall Accuracy",
        "Macro F1 Score",
        "Weighted F1 Score",
        "Per-Class Precision, Recall, F1",
        "Broad Crop Accuracy (Dataset 1)",
        "Regional Crop Accuracy (Dataset 2)",
        "Confusion Matrix (72x72)",
        "Inference Latency (ms)"
    ],
    "hardware_requirements": {
        "execution_mode": "TensorFlow CPU / DirectML",
        "expected_vram_gb": "N/A (CPU RAM)",
        "expected_disk_mb": 300,
        "batch_size": 32
    }
}

spec_path = os.path.join(base_dir, "training_specification.json")
with open(spec_path, 'w', encoding='utf-8') as f:
    json.dump(spec, f, indent=2)

print(f"Saved training specification to {spec_path}")
