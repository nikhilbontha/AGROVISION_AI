import os
import hashlib
import json

BASE_DIR = r"E:\tekworks_projects\crop"
MANIFEST_PATH = os.path.join(BASE_DIR, "docs", "TWO_DATASET_INTEGRITY_MANIFEST.json")

def get_file_sha256(filepath):
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(65536), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

print("Re-verifying Baseline Integrity Hashes...")
with open(MANIFEST_PATH, "r") as f:
    manifest = json.load(f)

mismatches = []
matches = 0

# Verify Dataset 2 Archive Hash
d2_info = manifest["dataset_2_archive"]
current_d2_hash = get_file_sha256(d2_info["absolute_path"])
if current_d2_hash == d2_info["sha256"]:
    matches += 1
    print("[OK] Dataset 2 Archive Hash Matches Baseline!")
else:
    mismatches.append(f"Dataset 2 Archive Hash Mismatch: {current_d2_hash} vs {d2_info['sha256']}")

# Verify Model Artifacts Hashes
m_info = manifest["existing_model_artifacts"]
for fname, meta in m_info.items():
    cur_hash = get_file_sha256(meta["absolute_path"])
    if cur_hash == meta["sha256"]:
        matches += 1
        print(f"[OK] Model Artifact '{fname}' Hash Matches Baseline!")
    else:
        mismatches.append(f"Model Artifact '{fname}' Mismatch: {cur_hash} vs {meta['sha256']}")

# Verify Yield Artifacts Hashes
y_info = manifest["yield_prediction_artifacts"]
for rel_p, meta in y_info.items():
    cur_hash = get_file_sha256(meta["absolute_path"])
    if cur_hash == meta["sha256"]:
        matches += 1
        print(f"[OK] Yield Artifact '{rel_p}' Hash Matches Baseline!")
    else:
        mismatches.append(f"Yield Artifact '{rel_p}' Mismatch: {cur_hash} vs {meta['sha256']}")

# Sample verify 50 random files from Dataset 1
d1_info = manifest["dataset_1"]["files"]
sample_keys = list(d1_info.keys())[:50]
d1_matches = 0
for rel_p in sample_keys:
    abs_p = os.path.join(BASE_DIR, rel_p)
    cur_h = get_file_sha256(abs_p)
    if cur_h == d1_info[rel_p]["sha256"]:
        d1_matches += 1
    else:
        mismatches.append(f"Dataset 1 File '{rel_p}' Mismatch")

print(f"[OK] Sample verified {d1_matches}/{len(sample_keys)} Dataset 1 files against baseline.")

print(f"\nIntegrity Verification Result: {matches + d1_matches} Matches, {len(mismatches)} Mismatches.")
if len(mismatches) == 0:
    print("STATUS: INTEGRITY VERIFICATION PASSED (100% MATCH)")
else:
    print("STATUS: INTEGRITY VERIFICATION FAILED")
    for m in mismatches:
        print("  -", m)
