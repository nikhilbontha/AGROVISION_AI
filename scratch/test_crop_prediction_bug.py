import sys
import os
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from app.routes.predict import get_disease_model, CLASS_MAPPING

model, idx_map = get_disease_model()

print(f"Total idx_map items: {len(idx_map)}")
print(f"Total CLASS_MAPPING items: {len(CLASS_MAPPING)}")

# Check tomato keys
tomato_idx = [k for k, v in idx_map.items() if 'tomato' in v.lower()]
print(f"Found {len(tomato_idx)} Tomato classes in idx_map:")
for k in tomato_idx:
    key = idx_map[k]
    in_cm = key in CLASS_MAPPING
    print(f"  ID {k}: '{key}' -> In CLASS_MAPPING? {in_cm}")
