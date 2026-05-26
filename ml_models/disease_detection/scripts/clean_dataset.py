import os
import shutil
import hashlib
from PIL import Image
from tqdm import tqdm

def clean_dataset(dataset_path):
    if not os.path.exists(dataset_path):
        print(f"Error: Dataset path '{dataset_path}' does not exist.")
        return

    print(f"Cleaning dataset at: {dataset_path}")

    # 1. Remove invalid classes
    invalid_classes = [
        "Background_without_leaves",
        "Background_without_leaves_1",
    ]

    for cls in invalid_classes:
        cls_path = os.path.join(dataset_path, cls)
        if os.path.exists(cls_path):
            print(f"Removing invalid class directory: {cls}")
            shutil.rmtree(cls_path)

    # 2. Iterate over all valid classes
    valid_classes = [d for d in os.listdir(dataset_path) if os.path.isdir(os.path.join(dataset_path, d))]
    print(f"Found {len(valid_classes)} valid classes.")

    total_images_before = 0
    total_images_after = 0
    removed_corrupted = 0
    removed_duplicates = 0

    for cls in valid_classes:
        cls_path = os.path.join(dataset_path, cls)
        images = [f for f in os.listdir(cls_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        total_images_before += len(images)

        hashes = set()
        
        print(f"Processing {cls}...")
        for img_name in tqdm(images, desc=cls, leave=False):
            img_path = os.path.join(cls_path, img_name)
            
            # Check for corruption
            try:
                with Image.open(img_path) as img:
                    img.verify() # verify that it is, in fact, an image
            except (IOError, SyntaxError) as e:
                print(f"Removing corrupted image: {img_path}")
                os.remove(img_path)
                removed_corrupted += 1
                continue

            # Check for duplicates using MD5 hash
            with open(img_path, "rb") as f:
                file_hash = hashlib.md5(f.read()).hexdigest()
            
            if file_hash in hashes:
                # Duplicate found
                os.remove(img_path)
                removed_duplicates += 1
            else:
                hashes.add(file_hash)

        # Recount after cleaning
        total_images_after += len(os.listdir(cls_path))

    print("\n--- Cleaning Summary ---")
    print(f"Total images before cleaning: {total_images_before}")
    print(f"Total images after cleaning:  {total_images_after}")
    print(f"Corrupted images removed:     {removed_corrupted}")
    print(f"Duplicate images removed:     {removed_duplicates}")
    print("------------------------")

if __name__ == "__main__":
    # Update this path to the actual dataset location
    DATASET_PATH = r"C:\Users\nikhi\tensorflow_datasets\downloads\extracted\ZIP.data.mend.com_publ-file_data_tywb_file_d565-c1rDQyRTmE0CqGGXmH53WlQp0NWefMfDW89aj1A0m5D_A\Plant_leave_diseases_dataset_without_augmentation"
    clean_dataset(DATASET_PATH)
