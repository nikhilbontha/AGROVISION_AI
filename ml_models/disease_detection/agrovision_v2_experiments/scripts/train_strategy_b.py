"""
AgroVision AI 2.0 - Strategy B Training Script
Crop-Specific Disease Classifiers for Major Crop Families
"""
import os
import sys
import json
import time

def check_environment():
    try:
        import tensorflow as tf
        return True, tf
    except Exception as e:
        return False, str(e)

def main():
    print("=" * 75)
    print(" AgroVision AI 2.0 - Training Strategy B (Crop-Specific Classifiers)")
    print("=" * 75)
    
    env_ok, tf_or_err = check_environment()
    if not env_ok:
        print("[BLOCKED] Deep learning runtime unavailable:")
        print(f"  Reason: {tf_or_err}")
        print("  Status: Training execution cannot proceed on this host environment.")
        return 2

    # Load mappings
    map_path = os.path.join(os.path.dirname(__file__), "..", "mappings", "crop_specific_class_mappings.json")
    with open(map_path, "r", encoding="utf-8") as f:
        mapping = json.load(f)
        
    crops = mapping.get("crops", {})
    print(f"Loaded mappings for {len(crops)} crop families.")
    for cid, cinfo in crops.items():
        print(f"  - {cinfo['crop_name']} ({cid}): {cinfo['num_classes']} classes")
        
    return 0

if __name__ == "__main__":
    sys.exit(main())
