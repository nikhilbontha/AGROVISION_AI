"""
AgroVision AI 2.0 - Strategy D Training Script
Shared Feature Extractor Trunk with Multi-Head Crop Classifiers
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
    print(" AgroVision AI 2.0 - Training Strategy D (Shared Backbone + Multi-Head)")
    print("=" * 75)
    
    env_ok, tf_or_err = check_environment()
    if not env_ok:
        print("[BLOCKED] Deep learning runtime unavailable:")
        print(f"  Reason: {tf_or_err}")
        print("  Status: Training execution cannot proceed on this host environment.")
        return 2

    tf = tf_or_err
    cfg_path = os.path.join(os.path.dirname(__file__), "..", "configs", "train_strategy_d_multihead.json")
    with open(cfg_path, "r", encoding="utf-8") as f:
        cfg = json.load(f)
        
    print(f"Backbone: {cfg['architecture']['trunk_backbone']}")
    print(f"Embedding dim: {cfg['architecture']['shared_embedding_dim']}")
    print(f"Number of conditioned heads: {len(cfg['architecture']['heads'])}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
