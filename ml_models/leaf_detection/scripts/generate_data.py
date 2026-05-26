import os
import cv2
import numpy as np

# Create directories
base_dir = "dataset"
leaf_dir = os.path.join(base_dir, "leaf_present")
no_leaf_dir = os.path.join(base_dir, "no_leaf")

os.makedirs(leaf_dir, exist_ok=True)
os.makedirs(no_leaf_dir, exist_ok=True)

# Generate synthetic "leaf_present" (mostly green blobs)
for i in range(50):
    img = np.random.randint(0, 50, (128, 128, 3), dtype=np.uint8) # Dark background
    # Add a green blob
    cv2.circle(img, (64, 64), np.random.randint(20, 50), (np.random.randint(0,50), np.random.randint(150, 255), np.random.randint(0,50)), -1)
    cv2.imwrite(os.path.join(leaf_dir, f"leaf_{i}.jpg"), img)

# Generate synthetic "no_leaf" (random shapes, charts, people shapes, bright text)
for i in range(50):
    img = np.random.randint(100, 255, (128, 128, 3), dtype=np.uint8) # Bright background like paper/charts
    # Add some random lines (like a chart)
    for _ in range(5):
        cv2.line(img, (np.random.randint(0, 128), np.random.randint(0, 128)), 
                 (np.random.randint(0, 128), np.random.randint(0, 128)), 
                 (0, 0, 255), 3)
    cv2.imwrite(os.path.join(no_leaf_dir, f"noleaf_{i}.jpg"), img)

print("Generated synthetic dataset for leaf detection in 'dataset/' directory.")
