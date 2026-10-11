import zipfile
import os
import collections

zpath = r"e:\tekworks_projects\crop\datasets\archive.zip"
print(f"Checking {zpath}...")
print("Is valid ZIP:", zipfile.is_zipfile(zpath))

z = zipfile.ZipFile(zpath, 'r')
namelist = z.namelist()
print(f"Total items in archive: {len(namelist)}")

ext_counts = collections.Counter()
class_counts = collections.Counter()
subdirs_level1 = set()
subdirs_level2 = set()

for n in namelist:
    parts = n.split('/')
    if len(parts) > 1 and parts[1]:
        subdirs_level1.add(parts[1])
    if len(parts) > 2 and parts[2]:
        subdirs_level2.add(f"{parts[1]}/{parts[2]}")
    
    ext = os.path.splitext(n)[1].lower()
    if ext:
        ext_counts[ext] += 1
        if ext in ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.JPG', '.JPEG', '.PNG']:
            if len(parts) >= 3:
                # Class directory name under Andhra_Master_Dataset
                cls_name = parts[1]
                class_counts[cls_name] += 1

print("\nFile Extensions Breakdown:")
for ext, cnt in ext_counts.most_common():
    print(f"  {ext}: {cnt}")

print(f"\nTotal image files detected in Andhra_Master_Dataset: {sum(class_counts.values())}")
print(f"Total class folders detected: {len(class_counts)}")
print("\nClass Folders and Image Counts:")
for cls_name, cnt in sorted(class_counts.items()):
    print(f"  - {cls_name}: {cnt} images")

# Check test readability of a sample of images
valid_test_count = 0
corrupt_count = 0
for n in namelist:
    ext = os.path.splitext(n)[1].lower()
    if ext in ['.jpg', '.jpeg', '.png']:
        try:
            info = z.getinfo(n)
            if info.file_size > 0:
                valid_test_count += 1
            else:
                corrupt_count += 1
        except Exception as e:
            corrupt_count += 1

print(f"\nArchive Readability Check: {valid_test_count} valid image files, {corrupt_count} corrupt/empty files.")
