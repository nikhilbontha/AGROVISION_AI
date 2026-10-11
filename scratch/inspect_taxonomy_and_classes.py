import json
import os

print("=== INSPECTING TAXONOMY & REGISTRIES ===")

# 1. Crop Registry
with open("docs/agrovision_v2/phase2/crop_registry.json", "r", encoding="utf-8") as f:
    crop_data = json.load(f)

crops = crop_data.get("crops", []) if isinstance(crop_data, dict) else crop_data
print(f"Total crops in crop_registry: {len(crops)}")
for c in crops:
    print(f"  {c.get('crop_id')}: {c.get('canonical_name')} ({c.get('scientific_name')}) - Supported: {c.get('is_supported', True)}")

# 2. Disease Registry
with open("docs/agrovision_v2/phase2/disease_registry.json", "r", encoding="utf-8") as f:
    dis_data = json.load(f)

diseases = dis_data.get("diseases", []) if isinstance(dis_data, dict) else dis_data
print(f"\nTotal diseases in disease_registry: {len(diseases)}")

# Check key diseases related to our 9 images: Tomato, Rice, Corn, Wheat, Soybean, Chilli
target_crops = ["crop_tomato", "crop_rice", "crop_corn", "crop_wheat", "crop_chilli", "crop_soybean"]
for d in diseases:
    cid = d.get("crop_id")
    if cid in target_crops:
        print(f"  [{cid}] {d.get('disease_id')}: {d.get('canonical_name')} ({d.get('scientific_name')}) - Organs: {d.get('affected_organs', [])}")

# 3. Model Classes (72 Unified Classes)
with open("ml_models/disease_detection/unified_experiment/unified_label_mapping.json", "r", encoding="utf-8") as f:
    label_map = json.load(f)

print(f"\nTotal model classes in unified_label_mapping: {len(label_map)}")
print("Model classes matching Wheat, Rice, Corn, Tomato, Soybean:")
if isinstance(label_map, list):
    for idx, item in enumerate(label_map):
        cls_name = item.get("canonical_class_name") or item.get("folder_name") or str(item)
        if any(k in cls_name.lower() for k in ["wheat", "rice", "corn", "tomato", "soybean"]):
            print(f"  Class {idx}: {cls_name}")
elif isinstance(label_map, dict):
    for idx, cls_name in label_map.items():
        if any(k in str(cls_name).lower() for k in ["wheat", "rice", "corn", "tomato", "soybean"]):
            print(f"  Class {idx}: {cls_name}")
