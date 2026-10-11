import os
import glob
import json
from collections import Counter

prepared_path = r"ml_models\disease_detection\dataset_prepared"
manifest_path = os.path.join(prepared_path, "manifest.json")

print("Checking Dataset 1 at:", prepared_path)
print("Manifest exists:", os.path.exists(manifest_path))

if os.path.exists(manifest_path):
    with open(manifest_path, "r") as f:
        manifest = json.load(f)
    print("Manifest total samples:", manifest.get("total_samples"))
    print("Manifest class count:", manifest.get("num_classes"))
    print("Manifest splits:", manifest.get("splits"))

splits = ['train', 'val', 'test', 'field_test']
split_counts = {}
class_counts = Counter()
ext_counts = Counter()

for s in splits:
    s_path = os.path.join(prepared_path, s)
    if os.path.exists(s_path):
        files = glob.glob(os.path.join(s_path, "*", "*"))
        split_counts[s] = len(files)
        for f in files:
            cls = os.path.basename(os.path.dirname(f))
            class_counts[cls] += 1
            ext_counts[os.path.splitext(f)[1].lower()] += 1

print("\nActual Split Counts:")
for s, cnt in split_counts.items():
    print(f"  {s}: {cnt} images")

print(f"\nTotal Dataset 1 Prepared Images: {sum(split_counts.values())}")
print(f"Total Dataset 1 Classes: {len(class_counts)}")
print("Image Extensions:", dict(ext_counts))

print("\nDataset 1 Classes:")
for cls_name, cnt in sorted(class_counts.items()):
    print(f"  - {cls_name}: {cnt} images")
