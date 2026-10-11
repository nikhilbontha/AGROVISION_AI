import os
import json
import hashlib
from collections import Counter, defaultdict

BASE_DIR = r"E:\tekworks_projects\crop"
EXPERIMENT_DIR = os.path.join(BASE_DIR, "ml_models", "disease_detection", "unified_experiment")
os.makedirs(EXPERIMENT_DIR, exist_ok=True)

# -------------------------------------------------------------------------
# STEP 1: LOAD PHASE 3 MANIFESTS & DUPLICATE REPORTS
# -------------------------------------------------------------------------
print("Loading Phase 3 Derived Quality Manifests...")

with open(os.path.join(EXPERIMENT_DIR, "dataset_1_quality_manifest.json"), "r") as f:
    d1_records = json.load(f)

with open(os.path.join(EXPERIMENT_DIR, "dataset_2_quality_manifest.json"), "r") as f:
    d2_records = json.load(f)

with open(os.path.join(EXPERIMENT_DIR, "duplicate_analysis_report.json"), "r") as f:
    dup_report = json.load(f)

print(f"Loaded Dataset 1 records: {len(d1_records)}")
print(f"Loaded Dataset 2 records: {len(d2_records)}")

# -------------------------------------------------------------------------
# STEP 2, 3, 4, 5 & 6: DEFINE CANONICAL TAXONOMY & LABEL MAPPING TABLE
# -------------------------------------------------------------------------
# Explicit mapping dictionary from (dataset_id, original_label) -> canonical metadata
EXPLICIT_MAPPINGS = {
    # --- DATASET 1 (39 Classes) ---
    ("Dataset_1", "Apple___Apple_scab"): ("Apple", "Apple Scab", "EXACT_MATCH", False),
    ("Dataset_1", "Apple___Black_rot"): ("Apple", "Black Rot", "EXACT_MATCH", False),
    ("Dataset_1", "Apple___Cedar_apple_rust"): ("Apple", "Cedar Apple Rust", "EXACT_MATCH", False),
    ("Dataset_1", "Apple___healthy"): ("Apple", "Healthy", "EXACT_MATCH", True),
    ("Dataset_1", "Corn___Cercospora_leaf_spot Gray_leaf_spot"): ("Corn", "Cercospora Gray Leaf Spot", "EXACT_MATCH", False),
    ("Dataset_1", "Corn___Common_rust"): ("Corn", "Common Rust", "EXACT_MATCH", False),
    ("Dataset_1", "Corn___Northern_Leaf_Blight"): ("Corn", "Northern Leaf Blight", "EXACT_MATCH", False),
    ("Dataset_1", "Corn___healthy"): ("Corn", "Healthy", "EXACT_MATCH", True),
    ("Dataset_1", "Cotton___Bacterial_blight"): ("Cotton", "Bacterial Blight", "EXACT_MATCH", False),
    ("Dataset_1", "Cotton___healthy"): ("Cotton", "Healthy", "EXACT_MATCH", True),
    ("Dataset_1", "Grape___Black_rot"): ("Grape", "Black Rot", "EXACT_MATCH", False),
    ("Dataset_1", "Grape___Esca_(Black_Measles)"): ("Grape", "Esca Black Measles", "EXACT_MATCH", False),
    ("Dataset_1", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)"): ("Grape", "Leaf Blight Isariopsis Spot", "EXACT_MATCH", False),
    ("Dataset_1", "Grape___healthy"): ("Grape", "Healthy", "EXACT_MATCH", True),
    ("Dataset_1", "Non_Plant___Unsupported"): ("Non_Plant", "Unsupported Object", "EXACT_MATCH", False),
    ("Dataset_1", "Orange___Haunglongbing_(Citrus_greening)"): ("Orange", "Citrus Greening", "EXACT_MATCH", False),
    ("Dataset_1", "Orange___healthy"): ("Orange", "Healthy", "EXACT_MATCH", True),
    ("Dataset_1", "Pepper,_bell___Bacterial_spot"): ("Pepper", "Bacterial Spot", "EXACT_MATCH", False),
    ("Dataset_1", "Pepper,_bell___healthy"): ("Pepper", "Healthy", "EXACT_MATCH", True),
    ("Dataset_1", "Potato___Early_blight"): ("Potato", "Early Blight", "EXACT_MATCH", False),
    ("Dataset_1", "Potato___Late_blight"): ("Potato", "Late Blight", "EXACT_MATCH", False),
    ("Dataset_1", "Potato___healthy"): ("Potato", "Healthy", "EXACT_MATCH", True),
    ("Dataset_1", "Rice___Bacterial_leaf_blight"): ("Rice", "Bacterial Leaf Blight", "EXACT_MATCH", False),
    ("Dataset_1", "Rice___Blast"): ("Rice", "Blast", "EXACT_MATCH", False),
    ("Dataset_1", "Rice___healthy"): ("Rice", "Healthy", "EXACT_MATCH", True),
    ("Dataset_1", "Tomato___Bacterial_spot"): ("Tomato", "Bacterial Spot", "EXACT_MATCH", False),
    ("Dataset_1", "Tomato___Early_blight"): ("Tomato", "Early Blight", "EXACT_MATCH", False),
    ("Dataset_1", "Tomato___Late_blight"): ("Tomato", "Late Blight", "EXACT_MATCH", False),
    ("Dataset_1", "Tomato___Leaf_Mold"): ("Tomato", "Leaf Mold", "EXACT_MATCH", False),
    ("Dataset_1", "Tomato___Septoria_leaf_spot"): ("Tomato", "Septoria Leaf Spot", "EXACT_MATCH", False),
    ("Dataset_1", "Tomato___Spider_mites Two-spotted_spider_mite"): ("Tomato", "Spider Mites", "EXACT_MATCH", False),
    ("Dataset_1", "Tomato___Target_Spot"): ("Tomato", "Target Spot", "EXACT_MATCH", False),
    ("Dataset_1", "Tomato___Tomato_Yellow_Leaf_Curl_Virus"): ("Tomato", "Yellow Leaf Curl Virus", "EXACT_MATCH", False),
    ("Dataset_1", "Tomato___Tomato_mosaic_virus"): ("Tomato", "Mosaic Virus", "EXACT_MATCH", False),
    ("Dataset_1", "Tomato___healthy"): ("Tomato", "Healthy", "EXACT_MATCH", True),
    ("Dataset_1", "Wheat___Leaf_rust"): ("Wheat", "Leaf Rust", "EXACT_MATCH", False),
    ("Dataset_1", "Wheat___Powdery_mildew"): ("Wheat", "Powdery Mildew", "EXACT_MATCH", False),
    ("Dataset_1", "Wheat___Stripe_rust"): ("Wheat", "Stripe Rust", "EXACT_MATCH", False),
    ("Dataset_1", "Wheat___healthy"): ("Wheat", "Healthy", "EXACT_MATCH", True),

    # --- DATASET 2 (51 Classes) ---
    ("Dataset_2", "Banana_Black Sigatoka"): ("Banana", "Black Sigatoka", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Banana_Cordana Leaf Spot"): ("Banana", "Cordana Leaf Spot", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Banana_Healthy"): ("Banana", "Healthy", "VERIFIED_SYNONYM", True),
    ("Dataset_2", "Banana_Panama Disease"): ("Banana", "Panama Disease", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Chilli_Anthracnose"): ("Chilli", "Anthracnose", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Chilli_Damping Off"): ("Chilli", "Damping Off", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Chilli_Healthy"): ("Chilli", "Healthy", "VERIFIED_SYNONYM", True),
    ("Dataset_2", "Chilli_Leaf Curl Virus"): ("Chilli", "Leaf Curl Virus", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Chilli_Leaf Spot"): ("Chilli", "Leaf Spot", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Chilli_Veinal Mottle Virus"): ("Chilli", "Veinal Mottle Virus", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Chilli_Whitefly"): ("Chilli", "Whitefly", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Chilli_Yellowish"): ("Chilli", "Yellowish Chlorosis", "NEEDS_REVIEW", False),
    ("Dataset_2", "Cotton_Alternaria Leaf Spot"): ("Cotton", "Alternaria Leaf Spot", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Cotton_Bacterial Blight"): ("Cotton", "Bacterial Blight", "EXACT_MATCH", False),
    ("Dataset_2", "Cotton_Fusarium Wilt"): ("Cotton", "Fusarium Wilt", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Cotton_Healthy"): ("Cotton", "Healthy", "EXACT_MATCH", True),
    ("Dataset_2", "Cotton_Verticillium Wilt"): ("Cotton", "Verticillium Wilt", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Mango_Anthracnose"): ("Mango", "Anthracnose", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Mango_Bacterial Canker"): ("Mango", "Bacterial Canker", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Mango_Cutting Weevil"): ("Mango", "Cutting Weevil", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Mango_Die Back"): ("Mango", "Die Back", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Mango_Gall Midge"): ("Mango", "Gall Midge", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Mango_Healthy"): ("Mango", "Healthy", "VERIFIED_SYNONYM", True),
    ("Dataset_2", "Mango_Powdery Mildew"): ("Mango", "Powdery Mildew", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Mango_Sooty Mould"): ("Mango", "Sooty Mould", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Palm_Dryness"): ("Palm", "Dryness", "NEEDS_REVIEW", False),
    ("Dataset_2", "Palm_Fungal Disease"): ("Palm", "Fungal Disease", "UNSUPPORTED", False),
    ("Dataset_2", "Palm_Magnesium Deficiency"): ("Palm", "Magnesium Deficiency", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Palm_Scale Insect"): ("Palm", "Scale Insect", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Rice_Bacterial Leaf Blight"): ("Rice", "Bacterial Leaf Blight", "EXACT_MATCH", False),
    ("Dataset_2", "Rice_Blast"): ("Rice", "Blast", "EXACT_MATCH", False),
    ("Dataset_2", "Rice_Brownspot"): ("Rice", "Brown Spot", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Rice_Healthy"): ("Rice", "Healthy", "EXACT_MATCH", True),
    ("Dataset_2", "Rice_Leaf Scald"): ("Rice", "Leaf Scald", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Rice_Leaf Smut"): ("Rice", "Leaf Smut", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Rice_Sheath Blight"): ("Rice", "Sheath Blight", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Rice_Tungro"): ("Rice", "Tungro", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Tomato_Bacterial Spot"): ("Tomato", "Bacterial Spot", "EXACT_MATCH", False),
    ("Dataset_2", "Tomato_Early Blight"): ("Tomato", "Early Blight", "EXACT_MATCH", False),
    ("Dataset_2", "Tomato_Healthy"): ("Tomato", "Healthy", "EXACT_MATCH", True),
    ("Dataset_2", "Tomato_Late Blight"): ("Tomato", "Late Blight", "EXACT_MATCH", False),
    ("Dataset_2", "Tomato_Leaf Mold"): ("Tomato", "Leaf Mold", "EXACT_MATCH", False),
    ("Dataset_2", "Tomato_Mosaic Virus"): ("Tomato", "Mosaic Virus", "EXACT_MATCH", False),
    ("Dataset_2", "Tomato_Septoria Leaf Spot"): ("Tomato", "Septoria Leaf Spot", "EXACT_MATCH", False),
    ("Dataset_2", "Tomato_Spider Mites"): ("Tomato", "Spider Mites", "EXACT_MATCH", False),
    ("Dataset_2", "Tomato_Target Spot"): ("Tomato", "Target Spot", "EXACT_MATCH", False),
    ("Dataset_2", "Tomato_Yellow Leaf Curl Virus"): ("Tomato", "Yellow Leaf Curl Virus", "EXACT_MATCH", False),
    ("Dataset_2", "Turmeric_Dry Leaf"): ("Turmeric", "Dry Leaf", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Turmeric_Healthy"): ("Turmeric", "Healthy", "VERIFIED_SYNONYM", True),
    ("Dataset_2", "Turmeric_Leaf Blotch"): ("Turmeric", "Leaf Blotch", "VERIFIED_SYNONYM", False),
    ("Dataset_2", "Turmeric_Rhizome Rot"): ("Turmeric", "Rhizome Rot", "VERIFIED_SYNONYM", False)
}

# Assign Canonical Class IDs (0 to N-1) for Approved Classes
approved_canonical_tuples = sorted(list(set(
    (c_crop, c_dis)
    for (ds_id, orig_lbl), (c_crop, c_dis, status, is_h) in EXPLICIT_MAPPINGS.items()
    if status in ["EXACT_MATCH", "VERIFIED_SYNONYM"]
)))

canonical_class_id_map = {
    (c_crop, c_dis): idx for idx, (c_crop, c_dis) in enumerate(approved_canonical_tuples)
}

print(f"\nTotal Approved Canonical Classes: {len(canonical_class_id_map)}")

# Create machine-readable label mapping JSON
unified_label_mapping = []
for (ds_id, orig_lbl), (c_crop, c_dis, status, is_h) in EXPLICIT_MAPPINGS.items():
    cls_id = canonical_class_id_map.get((c_crop, c_dis), -1)
    unified_label_mapping.append({
        "dataset_id": ds_id,
        "original_label": orig_lbl,
        "canonical_crop": c_crop,
        "canonical_disease": c_dis,
        "canonical_class_id": cls_id,
        "canonical_class_key": f"{c_crop}___{c_dis.replace(' ', '_')}",
        "is_healthy": is_h,
        "mapping_status": status,
        "mapping_version": "2.0.0"
    })

with open(os.path.join(EXPERIMENT_DIR, "unified_label_mapping.json"), "w") as f:
    json.dump(unified_label_mapping, f, indent=2)

# -------------------------------------------------------------------------
# STEP 7 & 8: COMBINED TRAINING MANIFEST & QUARANTINE MANIFEST
# -------------------------------------------------------------------------
print("\nBuilding Combined Training Manifest and Quarantine Manifest...")

# Build MD5 duplicate group map for leakage prevention
md5_group_map = {}
dup_id_counter = 1

# Map Dataset 2 intra-duplicates
d2_md5_dups = dup_report.get("d2_exact_duplicates_count", 0)

combined_manifest = []
quarantine_manifest = []

# Process Dataset 1 Records
for rec in d1_records:
    ds_id = rec["dataset_id"]
    orig_lbl = rec["original_class"]
    c_crop, c_dis, status, is_h = EXPLICIT_MAPPINGS[ (ds_id, orig_lbl) ]
    cls_id = canonical_class_id_map[(c_crop, c_dis)]
    
    rec_item = {
        "record_id": f"D1_{hashlib.md5(rec['relative_path'].encode()).hexdigest()[:8]}",
        "dataset_source": "Dataset_1",
        "image_path": rec["relative_path"],
        "md5_hash": rec["md5_hash"],
        "ahash": rec.get("ahash", ""),
        "original_label": orig_lbl,
        "canonical_crop": c_crop,
        "canonical_disease": c_dis,
        "canonical_class_id": cls_id,
        "canonical_class_key": f"{c_crop}___{c_dis.replace(' ', '_')}",
        "is_healthy": is_h,
        "quality_status": "VALID",
        "duplicate_group_id": rec["md5_hash"][:12]
    }
    combined_manifest.append(rec_item)

# Process Dataset 2 Records
for rec in d2_records:
    ds_id = rec["dataset_id"]
    orig_lbl = rec["original_class"]
    c_crop, c_dis, status, is_h = EXPLICIT_MAPPINGS[ (ds_id, orig_lbl) ]
    
    if status in ["NEEDS_REVIEW", "UNSUPPORTED", "INCOMPATIBLE"]:
        quarantine_manifest.append({
            "record_id": f"D2_Q_{hashlib.md5(rec['archive_path'].encode()).hexdigest()[:8]}",
            "dataset_source": "Dataset_2",
            "archive_path": rec["archive_path"],
            "original_label": orig_lbl,
            "proposed_crop": c_crop,
            "proposed_disease": c_dis,
            "quarantine_reason": f"Mapping status is {status} (Ambiguous/unsupported label)",
            "md5_hash": rec["md5_hash"]
        })
    else:
        cls_id = canonical_class_id_map[(c_crop, c_dis)]
        rec_item = {
            "record_id": f"D2_{hashlib.md5(rec['archive_path'].encode()).hexdigest()[:8]}",
            "dataset_source": "Dataset_2",
            "archive_path": rec["archive_path"],
            "md5_hash": rec["md5_hash"],
            "ahash": rec.get("ahash", ""),
            "original_label": orig_lbl,
            "canonical_crop": c_crop,
            "canonical_disease": c_dis,
            "canonical_class_id": cls_id,
            "canonical_class_key": f"{c_crop}___{c_dis.replace(' ', '_')}",
            "is_healthy": is_h,
            "quality_status": "VALID",
            "duplicate_group_id": rec["md5_hash"][:12]
        }
        combined_manifest.append(rec_item)

print(f"Combined Training Manifest Eligible Records: {len(combined_manifest)}")
print(f"Quarantine Manifest Excluded Records: {len(quarantine_manifest)}")

with open(os.path.join(EXPERIMENT_DIR, "combined_training_manifest.json"), "w") as f:
    json.dump(combined_manifest, f, indent=2)

with open(os.path.join(EXPERIMENT_DIR, "quarantine_manifest.json"), "w") as f:
    json.dump(quarantine_manifest, f, indent=2)

# -------------------------------------------------------------------------
# STEP 10: DATASET CONTRIBUTION & CLASS DISTRIBUTION REPORT
# -------------------------------------------------------------------------
class_contributions = defaultdict(lambda: {"d1": 0, "d2": 0, "unique_md5": set()})

for rec in combined_manifest:
    c_key = rec["canonical_class_key"]
    if rec["dataset_source"] == "Dataset_1":
        class_contributions[c_key]["d1"] += 1
    else:
        class_contributions[c_key]["d2"] += 1
    class_contributions[c_key]["unique_md5"].add(rec["md5_hash"])

contribution_report = []
for c_key, idx in sorted(canonical_class_id_map.items(), key=lambda x: x[1]):
    key_str = f"{c_key[0]}___{c_key[1].replace(' ', '_')}"
    data = class_contributions[key_str]
    contribution_report.append({
        "canonical_class_id": idx,
        "canonical_class_key": key_str,
        "canonical_crop": c_key[0],
        "canonical_disease": c_key[1],
        "dataset_1_images": data["d1"],
        "dataset_2_images": data["d2"],
        "total_eligible_images": data["d1"] + data["d2"],
        "unique_image_count": len(data["unique_md5"]),
        "duplicate_reduction": (data["d1"] + data["d2"]) - len(data["unique_md5"]),
        "review_status": "VERIFIED_ELIGIBLE"
    })

with open(os.path.join(EXPERIMENT_DIR, "class_contribution_report.json"), "w") as f:
    json.dump(contribution_report, f, indent=2)

print("\n[OK] Combined manifest, quarantine manifest, label mapping, and class contribution reports saved successfully!")
