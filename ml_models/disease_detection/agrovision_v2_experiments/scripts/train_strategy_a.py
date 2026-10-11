"""
AgroVision AI 2.0 - Strategy A Training Script
Unified 72-Class EfficientNet-B0 Disease Classifier
"""
import os
import sys
import json
import time
import numpy as np

def check_environment():
    try:
        import tensorflow as tf
        from tensorflow.keras import layers, models, optimizers, callbacks
        return True, tf
    except Exception as e:
        return False, str(e)

def main():
    print("=" * 75)
    print(" AgroVision AI 2.0 - Training Strategy A (Unified Baseline)")
    print("=" * 75)
    
    env_ok, tf_or_err = check_environment()
    if not env_ok:
        print("[BLOCKED] Deep learning runtime unavailable:")
        print(f"  Reason: {tf_or_err}")
        print("  Status: Training execution cannot proceed on this host environment.")
        print("  Resolution: Run in an isolated container/environment without Windows Application Control DLL blocks.")
        return 2

    tf = tf_or_err
    print(f"TensorFlow Version: {tf.__version__}")
    
    # Load config
    cfg_path = os.path.join(os.path.dirname(__file__), "..", "configs", "train_strategy_a_unified.json")
    with open(cfg_path, "r", encoding="utf-8") as f:
        cfg = json.load(f)
        
    print(f"Loaded Configuration: {cfg['experiment_id']}")
    print(f"Target Num Classes: {cfg['model']['num_classes']}")
    print(f"Input Shape: {cfg['model']['input_shape']}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
