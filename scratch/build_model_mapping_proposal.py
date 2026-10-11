import json
import os

# Load registries
with open('docs/agrovision_v2/phase2/disease_registry.json', 'r', encoding='utf-8') as f:
    dis_reg = json.load(f)['diseases']

with open('ml_models/disease_detection/class_indices.json', 'r', encoding='utf-8') as f:
    v1_indices = json.load(f)

with open('ml_models/disease_detection/unified_experiment/unified_label_mapping.json', 'r', encoding='utf-8') as f:
    u_mapping = json.load(f)

# Build v1 mappings (39 classes)
v1_map = []
for orig_label, idx in sorted(v1_indices.items(), key=lambda x: x[1]):
    # find in dis_reg
    match = None
    for d in dis_reg:
        if d['dataset_class_aliases'].get('Dataset_1') == orig_label:
            match = d
            break
    if match:
        v1_map.append({
            "output_index": idx,
            "raw_output_label": orig_label,
            "canonical_disease_id": match['disease_id'],
            "canonical_crop_id": match['crop_id'],
            "canonical_name": match['canonical_name']
        })
    else:
        print(f"Warning: no match for v1 label {orig_label}")

# Build v2 mappings (72 classes)
v2_map = []
u_by_id = {}
for m in u_mapping:
    cid = m.get('canonical_class_id')
    if cid is not None and cid >= 0 and cid not in u_by_id:
        u_by_id[cid] = m

for idx in range(72):
    m_info = u_by_id[idx]
    ckey = m_info['canonical_class_key']
    # find in dis_reg
    match = None
    for d in dis_reg:
        if d['model_class_indices'].get('v2_unified_72class') == idx:
            match = d
            break
    if match:
        v2_map.append({
            "output_index": idx,
            "raw_output_label": ckey,
            "canonical_disease_id": match['disease_id'],
            "canonical_crop_id": match['crop_id'],
            "canonical_name": match['canonical_name']
        })
    else:
        print(f"Warning: no match for v2 index {idx}")

# Unmapped / excluded
excluded = [
    {
        "raw_dataset_label": "Chilli_Yellowish",
        "dataset_source": "Dataset_2",
        "assigned_canonical_disease_id": "dis_chilli_yellowish",
        "canonical_crop_id": "crop_chilli",
        "exclusion_reason": "Conflates viral chlorosis, nutrient deficiency, and moisture stress. Excluded from neural softmax heads to prevent false confidence."
    },
    {
        "raw_dataset_label": "Palm_Dryness",
        "dataset_source": "Dataset_2",
        "assigned_canonical_disease_id": "dis_palm_dryness",
        "canonical_crop_id": "crop_oil_palm",
        "exclusion_reason": "Abiotic moisture stress; lacks distinct pathogen lesions and consistent diagnostic criteria."
    },
    {
        "raw_dataset_label": "Palm_Fungal Disease",
        "dataset_source": "Dataset_2",
        "assigned_canonical_disease_id": "dis_palm_fungal_disease",
        "canonical_crop_id": "crop_oil_palm",
        "exclusion_reason": "Statistically insufficient sample size (25 images); generic undifferentiated label without identified pathogen species."
    }
]

# Identify index shifts between v1 and v2
index_shifts = []
for item1 in v1_map:
    dis_id = item1['canonical_disease_id']
    idx1 = item1['output_index']
    # find in v2
    item2 = next((x for x in v2_map if x['canonical_disease_id'] == dis_id), None)
    if item2:
        idx2 = item2['output_index']
        if idx1 != idx2:
            index_shifts.append({
                "canonical_disease_id": dis_id,
                "canonical_name": item1['canonical_name'],
                "v1_index": idx1,
                "v2_index": idx2,
                "shift_magnitude": idx2 - idx1
            })

proposal = {
    "schema_version": "2.0.0",
    "generated_at": "2026-10-11T11:20:00+05:30",
    "description": "Explicit decouple mapping binding specific neural model checkpoints to stable canonical disease identifiers, preventing index collision or array-position dependence.",
    "models": {
        "v1_baseline_39class": {
            "model_identifier": "v1_baseline_39class",
            "checkpoint_path": "ml_models/disease_detection/disease_model.h5",
            "total_classes": len(v1_map),
            "architecture": "EfficientNetB0 (ImageNet Transfer + Fine-Tune)",
            "output_class_mappings": v1_map
        },
        "v2_unified_72class": {
            "model_identifier": "v2_unified_72class",
            "checkpoint_path": "ml_models/disease_detection/unified_experiment/artifacts/agrovision_phase7_20261010_231412/AGROVISION_UNIFIED_72CLASS_MODEL.h5",
            "total_classes": len(v2_map),
            "architecture": "EfficientNetB0 (Combined 72-Class Strategy A Baseline)",
            "output_class_mappings": v2_map
        }
    },
    "unmapped_excluded_classes": excluded,
    "index_shift_analysis": {
        "summary": f"{len(index_shifts)} classes changed their output index between Model v1 and Model v2.",
        "example_collisions_prevented": index_shifts[:10]
    }
}

output_path = 'docs/agrovision_v2/phase2/model_class_mapping_proposal.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(proposal, f, indent=2)

print(f"Generated {output_path} successfully. Total v1: {len(v1_map)}, Total v2: {len(v2_map)}, Shifts logged: {len(index_shifts)}.")
