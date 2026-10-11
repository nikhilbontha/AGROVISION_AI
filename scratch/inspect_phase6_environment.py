import os
import json
import psutil
import platform

print("=== AGROVISION AI PHASE 6 INSPECTION SCRIPT ===")

# 1. System Resources
try:
    import torch
    torch_available = True
    torch_cuda = torch.cuda.is_available()
    gpu_name = torch.cuda.get_device_name(0) if torch_cuda else "None"
except Exception as e:
    torch_available = False
    torch_cuda = False
    gpu_name = f"Error: {e}"

try:
    import tensorflow as tf
    tf_available = True
    tf_gpus = tf.config.list_physical_devices('GPU')
    tf_gpu_count = len(tf_gpus)
except Exception as e:
    tf_available = False
    tf_gpus = []
    tf_gpu_count = 0

mem = psutil.virtual_memory()
disk = psutil.disk_usage('e:\\')

env_info = {
    "os": platform.system() + " " + platform.release(),
    "python_version": platform.python_version(),
    "cpu_count": psutil.cpu_count(logical=True),
    "ram_total_gb": round(mem.total / (1024**3), 2),
    "ram_available_gb": round(mem.available / (1024**3), 2),
    "disk_free_gb": round(disk.free / (1024**3), 2),
    "tensorflow_available": tf_available,
    "tensorflow_version": tf.__version__ if tf_available else None,
    "tf_gpu_count": tf_gpu_count,
    "pytorch_available": torch_available,
    "pytorch_cuda": torch_cuda,
    "gpu_name": gpu_name
}

print("\n--- Environment Hardware & Framework Check ---")
print(json.dumps(env_info, indent=2))

# 2. Inspect existing model checkpoint: disease_model.h5
h5_path = r"e:\tekworks_projects\crop\ml_models\disease_detection\disease_model.h5"
meta_path = r"e:\tekworks_projects\crop\ml_models\disease_detection\model_metadata.json"
indices_path = r"e:\tekworks_projects\crop\ml_models\disease_detection\class_indices.json"

print("\n--- Checkpoint Files Inspection ---")
print(f"disease_model.h5 exists: {os.path.exists(h5_path)} (Size: {os.path.getsize(h5_path)/(1024**2):.2f} MB)")
print(f"model_metadata.json exists: {os.path.exists(meta_path)}")
print(f"class_indices.json exists: {os.path.exists(indices_path)}")

if os.path.exists(meta_path):
    with open(meta_path, 'r') as f:
        meta = json.load(f)
    print("\nMetadata summary:")
    print(json.dumps(meta, indent=2))

if os.path.exists(indices_path):
    with open(indices_path, 'r') as f:
        c_indices = json.load(f)
    print(f"\nExisting class_indices.json count: {len(c_indices)}")

if tf_available and os.path.exists(h5_path):
    try:
        model = tf.keras.models.load_model(h5_path, compile=False)
        print("\nLoaded Keras Model Summary:")
        print(f"  Model Name: {model.name}")
        print(f"  Input Shape: {model.input_shape}")
        print(f"  Output Shape: {model.output_shape}")
        print(f"  Total Layers: {len(model.layers)}")
        print(f"  Total Parameters: {model.count_params():,}")
        
        # Check optimizer state
        optimizer_weights = getattr(model.optimizer, 'weights', None)
        print(f"  Optimizer Attached: {model.optimizer is not None}")
        print(f"  Optimizer Weights Count: {len(optimizer_weights) if optimizer_weights else 0}")
    except Exception as e:
        print(f"Error inspecting model architecture with TF: {e}")
