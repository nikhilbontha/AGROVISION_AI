import os
import zipfile
import time

zip_path = r"e:\tekworks_projects\crop\datasets\archive.zip"
target_dir = r"e:\tekworks_projects\crop\datasets\regional_dataset_2"

print(f"Checking extraction status of {zip_path} into {target_dir}...")

if not os.path.exists(target_dir):
    os.makedirs(target_dir, exist_ok=True)

test_file = os.path.join(target_dir, "Andhra_Master_Dataset", "Banana_Black Sigatoka", "20210218_160016.jpg")

if os.path.exists(test_file):
    print(f"Dataset 2 is already extracted at {target_dir}!")
else:
    print(f"Extracting {zip_path} to {target_dir}... This may take a few seconds.")
    start = time.time()
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(target_dir)
    print(f"Extraction completed in {time.time() - start:.2f} seconds!")

# Verify extracted image count
extracted_count = 0
for root, dirs, files in os.walk(target_dir):
    for f in files:
        if f.lower().endswith(('.jpg', '.jpeg', '.png')):
            extracted_count += 1

print(f"Total image files found in {target_dir}: {extracted_count}")
