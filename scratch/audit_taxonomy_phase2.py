import sys
import os
import json

sys.path.insert(0, os.path.abspath('backend'))
from app.utils.disease_info import DISEASE_INFO, NORMALIZED_DISEASE_INFO, get_disease_info

print(f"Total DISEASE_INFO keys: {len(DISEASE_INFO)}")
print(f"Total NORMALIZED_DISEASE_INFO keys: {len(NORMALIZED_DISEASE_INFO)}")

# Check Rice Bacterial leaf blight
for k in list(DISEASE_INFO.keys()):
    if 'bacterial' in k.lower() and 'rice' in k.lower():
        print(f"Key: '{k}' -> category: '{DISEASE_INFO[k].get('category')}', sci_name: '{DISEASE_INFO[k].get('scientific_name')}'")

# Check what get_disease_info returns for canonical keys
test_keys = [
    "Rice___Bacterial_Leaf_Blight",
    "Rice___Bacterial_leaf_blight",
    "Tomato___Early_Blight",
    "Chilli___Anthracnose",
    "Chilli___Leaf_Curl_Virus",
    "Banana___Black_Sigatoka",
    "Palm___Magnesium_Deficiency",
    "Palm___Scale_Insect",
    "Corn___Northern_Leaf_Blight",
    "Non_Plant___Unsupported_Object"
]

print("\n--- Testing get_disease_info() lookup on canonical keys ---")
for tk in test_keys:
    info = get_disease_info(tk)
    cat = info.get("category")
    sci = info.get("scientific_name")
    print(f"Query: '{tk}' -> Category: '{cat}', Sci: '{sci}'")
