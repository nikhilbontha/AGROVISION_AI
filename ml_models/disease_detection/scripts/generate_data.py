import os
from PIL import Image
import numpy as np

def generate_synthetic_images():
    base_dir = "../../datasets/synthetic_plant_village"
    os.makedirs(base_dir, exist_ok=True)
    
    # We create 5 sample classes to represent crop diseases
    classes = ["Early_Blight", "Late_Blight", "Healthy", "Rust", "Leaf_Spot"]
    
    print(f"Generating synthetic dataset at {base_dir}...")
    for cls in classes:
        class_dir = os.path.join(base_dir, cls)
        os.makedirs(class_dir, exist_ok=True)
        
        # Generate 10 images per class
        for i in range(10):
            # Create a random RGB image (224x224)
            img_array = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
            img = Image.fromarray(img_array)
            img.save(os.path.join(class_dir, f"{cls}_{i}.jpg"))
            
    print("Synthetic dataset generated successfully!")

if __name__ == "__main__":
    generate_synthetic_images()
