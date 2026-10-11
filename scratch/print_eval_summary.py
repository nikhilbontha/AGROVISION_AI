import json

with open("scratch/sample_images_evaluation_results.json", "r", encoding="utf-8") as f:
    records = json.load(f)

for r in records:
    sid = r["sample_id"]
    fn = r["filename"]
    spec = r["spec"]
    top1 = r["raw_top1"]
    status = r["final_diagnosis_status"]
    top1_corr = r["top1_correct"]
    print(f"=== {sid}: {fn} ===")
    print(f"  Provisional: Crop={spec['provisional_crop']}, Disease={spec['suspected_disease']}, LabelStatus={spec['label_status']}")
    print(f"  Raw Top-1: {top1['crop']} : {top1['disease']} (P={top1['probability']}, {top1['percentage']}%)")
    t3_str = ", ".join([f"{t['crop']} {t['disease']} ({t['percentage']}%)" for t in r["raw_top3"]])
    print(f"  Raw Top-3: {t3_str}")
    if r["crop_conditioned_top1"]:
        cc = r["crop_conditioned_top1"]
        print(f"  Conditioned on {r['farmer_crop']}: {cc['crop']} {cc['disease']} ({cc['percentage']}%)")
    print(f"  Leaf Validation: valid={r['leaf_validation']['is_valid_leaf']}, plant_ratio={r['leaf_validation']['plant_ratio']}")
    print(f"  Inference Decision: Status={status}, Abstained={r['abstained']}, CropMismatch={r['crop_mismatch']}, OrganMismatch={r['organ_mismatch']}")
    print(f"  Top-1 Correct?: {top1_corr}")
    print(f"  Analysis: {r['evaluation_analysis']}")
    print("-" * 75)
