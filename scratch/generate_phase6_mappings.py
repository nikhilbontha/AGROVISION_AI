import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UNIFIED_MAP_PATH = os.path.join(BASE_DIR, "ml_models", "disease_detection", "unified_experiment", "unified_label_mapping.json")
CROP_REG_PATH = os.path.join(BASE_DIR, "docs", "agrovision_v2", "phase2", "crop_registry.json")
DIS_REG_PATH = os.path.join(BASE_DIR, "docs", "agrovision_v2", "phase2", "disease_registry.json")

MAPPINGS_DIR = os.path.join(BASE_DIR, "ml_models", "disease_detection", "agrovision_v2_experiments", "mappings")
os.makedirs(MAPPINGS_DIR, exist_ok=True)

with open(UNIFIED_MAP_PATH, "r", encoding="utf-8") as f:
    unified_mapping = json.load(f)

with open(CROP_REG_PATH, "r", encoding="utf-8") as f:
    crop_reg = json.load(f)["crops"]

with open(DIS_REG_PATH, "r", encoding="utf-8") as f:
    dis_reg = json.load(f)["diseases"]
    canonical_dis_lookup = {d["disease_id"]: d for d in dis_reg}

crop_name_to_id = {
    "Apple": "crop_apple",
    "Banana": "crop_banana",
    "Chilli": "crop_chilli",
    "Corn": "crop_corn",
    "Cotton": "crop_cotton",
    "Grape": "crop_grape",
    "Mango": "crop_mango",
    "Orange": "crop_orange",
    "Palm": "crop_oil_palm",
    "Pepper": "crop_pepper_bell",
    "Potato": "crop_potato",
    "Rice": "crop_rice",
    "Tomato": "crop_tomato",
    "Turmeric": "crop_turmeric",
    "Wheat": "crop_wheat",
    "Non_Plant": "crop_non_plant"
}

# 1. Build Crop-Specific Class Mappings (Strategy B)
crops_dict = {}
for entry in unified_mapping:
    crop_name = entry["canonical_crop"]
    crop_id = crop_name_to_id.get(crop_name, f"crop_{crop_name.lower()}")
    if crop_id not in crops_dict:
        crops_dict[crop_id] = {
            "crop_id": crop_id,
            "crop_name": crop_name,
            "classes": []
        }
    
    # Clean disease identifier
    dis_raw = entry["canonical_disease"].lower().replace(" ", "_").replace("-", "_").replace("(", "").replace(")", "")
    cand_id = f"dis_{crop_id.replace('crop_', '')}_{dis_raw}"
    
    # Try exact match or closest match in disease registry
    canonical_id = cand_id
    if cand_id not in canonical_dis_lookup:
        for reg_id in canonical_dis_lookup:
            if reg_id.startswith(f"dis_{crop_id.replace('crop_', '')}") and dis_raw[:5] in reg_id:
                canonical_id = reg_id
                break

    crops_dict[crop_id]["classes"].append({
        "local_class_index": len(crops_dict[crop_id]["classes"]),
        "global_canonical_id": entry.get("canonical_class_id"),
        "canonical_class_key": entry.get("canonical_class_key"),
        "canonical_disease_id": canonical_id,
        "canonical_disease_name": entry["canonical_disease"],
        "is_healthy": entry.get("is_healthy", False)
    })

for cid in crops_dict:
    crops_dict[cid]["num_classes"] = len(crops_dict[cid]["classes"])

out_crops = {
    "mapping_version": "2.0.0",
    "generated_at": "2026-10-11T12:00:00+05:30",
    "description": "Crop-specific disease index mappings for Strategy B and Strategy D multi-head classifiers.",
    "crops": crops_dict
}

with open(os.path.join(MAPPINGS_DIR, "crop_specific_class_mappings.json"), "w", encoding="utf-8") as f:
    json.dump(out_crops, f, indent=2)

# 2. Build Crop Router Class Mapping (Strategy C)
router_classes = []
sorted_crop_names = sorted(list(crop_name_to_id.keys()))
for idx, cname in enumerate(sorted_crop_names):
    cid = crop_name_to_id[cname]
    router_classes.append({
        "router_output_index": idx,
        "canonical_crop_id": cid,
        "crop_display_name": cname,
        "num_diseases": crops_dict.get(cid, {}).get("num_classes", 0)
    })

out_router = {
    "mapping_version": "2.0.0",
    "generated_at": "2026-10-11T12:00:00+05:30",
    "description": "Stage-1 Crop Identity Router class index mapping for Strategy C.",
    "num_router_classes": len(router_classes),
    "router_classes": router_classes
}

with open(os.path.join(MAPPINGS_DIR, "crop_router_mapping.json"), "w", encoding="utf-8") as f:
    json.dump(out_router, f, indent=2)

print(f"Generated crop-specific mappings for {len(crops_dict)} crops.")
print(f"Generated crop router mapping with {len(router_classes)} crop classes.")
