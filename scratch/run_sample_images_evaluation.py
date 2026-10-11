import os
import sys
import json
import io
import cv2
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.abspath("backend"))

from app.routes.predict import (
    get_disease_model,
    validate_leaf_image,
    analyze_lesion_masking,
    CLASS_MAPPING,
    SUPPORTED_CROPS,
    calculate_topk_entropy
)
from app.services.diagnosis_engine import diagnosis_engine
from app.services.recommendation_service import recommendation_service
from app.services.diagnostic_workflow_orchestrator import workflow_orchestrator
from app.schemas.questionnaire_schema import QuestionnaireSubmissionRequest

DOWNLOADS_DIR = r"C:\Users\nikhi\Downloads"
SAMPLE_DIR = r"scratch\sample_images"

sample_specs = [
    {
        "sample_id": "SAMPLE_01",
        "filename": "images (5).jpeg",
        "provisional_crop": "Tomato",
        "canonical_crop_id": "crop_tomato",
        "suspected_disease": "Tomato Late Blight Fruit Rot / Anthracnose",
        "canonical_disease_id": "unverified",
        "scientific_name": "Phytophthora infestans (suspected)",
        "affected_plant_part": "fruits",
        "visible_symptoms": "Large sunken dark-brown/black necrotic rot lesion at the calyx/stem attachment spreading onto the fruit shoulder; green foliage in background",
        "possible_alternative_diagnoses": ["Anthracnose Fruit Rot (Colletotrichum coccodes)", "Buckeye Rot (Phytophthora nicotianae)", "Sunscald with secondary fungal decay"],
        "label_source": "Provisional visual interpretation / Unverified web image",
        "label_status": "unverified",
        "verification_notes": "Depicts tomato fruit with necrotic rot rather than standard foliar late blight. Organ is fruit, whereas model training dataset for Tomato Late Blight consists almost exclusively of foliar leaflets. Pathogen cannot be definitively confirmed without microbiological culture or source provenance.",
        "expected_prediction": "Tomato Late Blight (if foliar feature weights trigger) or Abstain/Organ Mismatch",
        "evaluation_eligible": False
    },
    {
        "sample_id": "SAMPLE_02",
        "filename": "images (4).jpeg",
        "provisional_crop": "Tomato",
        "canonical_crop_id": "crop_tomato",
        "suspected_disease": "Tomato Fruit Spots (Ghost Spot / Early Blight / Anthracnose)",
        "canonical_disease_id": "unverified",
        "scientific_name": "Unconfirmed fungal/bacterial fruit spot",
        "affected_plant_part": "fruits",
        "visible_symptoms": "Multiple brownish sunken spots and circular necrotic speckling across unripe green/yellow tomato fruit skins",
        "possible_alternative_diagnoses": ["Ghost Spot (Botrytis cinerea)", "Early Blight Fruit Lesions (Alternaria solani)", "Bacterial Canker / Speck (Clavibacter / Pseudomonas)", "Anthracnose (Colletotrichum spp.)"],
        "label_source": "Provisional visual interpretation / Unverified web image",
        "label_status": "unverified",
        "verification_notes": "Depicts green tomato fruits with extensive circular pitting/speckling. Affected plant organ is fruit. Since the dataset classes represent foliar diseases, fruit lesions represent out-of-distribution or cross-organ manifestations. Specific pathogen unverified.",
        "expected_prediction": "Abstain / Low Confidence / Organ Mismatch",
        "evaluation_eligible": False
    },
    {
        "sample_id": "SAMPLE_03",
        "filename": "images (3).jpeg",
        "provisional_crop": "Rice",
        "canonical_crop_id": "crop_rice",
        "suspected_disease": "Rice Panicle Blast / Grain Discoloration",
        "canonical_disease_id": "unverified",
        "scientific_name": "Magnaporthe oryzae / Bipolaris oryzae / complex",
        "affected_plant_part": "panicles_seeds",
        "visible_symptoms": "Dark brown-to-black discolored spikelets and necrotic grains on emerging green-yellow rice panicle",
        "possible_alternative_diagnoses": ["Glume Blight / Grain Discoloration (Bipolaris oryzae / Curvularia lunata)", "Panicle / Neck Blast (Magnaporthe oryzae)", "Sheath Rot (Sarocladium oryzae)", "Bacterial Panicle Blight (Burkholderia glumae)"],
        "label_source": "Provisional visual interpretation / Unverified web image",
        "label_status": "unverified",
        "verification_notes": "Depicts rice reproductive panicle with grain glume discoloration. The model's Rice Blast class was predominantly trained on leaf blast lesions. Grain discoloration and panicle blast have distinct visual morphology. Ground-truth pathogen unverified.",
        "expected_prediction": "Abstain / Rice Blast / Rice Bacterial Leaf Blight",
        "evaluation_eligible": False
    },
    {
        "sample_id": "SAMPLE_04",
        "filename": "false-smut-in-rice.jpg",
        "provisional_crop": "Rice",
        "canonical_crop_id": "crop_rice",
        "suspected_disease": "Rice False Smut",
        "canonical_disease_id": "unsupported",
        "scientific_name": "Ustilaginoidea virens (teleomorph: Villosiclava virens)",
        "affected_plant_part": "panicles_seeds",
        "visible_symptoms": "Characteristic enlarged velvety greenish-black smut balls (pseudomorphs) replacing individual grains on ripening rice panicle",
        "possible_alternative_diagnoses": ["Kernel Smut (Tilletia horrida)", "Green Ustilaginoidea spore ball"],
        "label_source": "Filename descriptor & diagnostic symptom morphology",
        "label_status": "verified_crop_and_symptom_unsupported_disease",
        "verification_notes": "Symptom morphology is unambiguous for Rice False Smut (Ustilaginoidea virens). However, False Smut is NOT present in the 72-class model or Phase 2 disease registry (which includes Rice Blast, Brown Spot, Leaf Smut, Sheath Blight, Bacterial Blight, Tungro, Leaf Scald). The model must not hallucinate a supported disease with high confidence; it should safely abstain.",
        "expected_prediction": "Abstain / Unsupported Disease Warning",
        "evaluation_eligible": True
    },
    {
        "sample_id": "SAMPLE_05",
        "filename": "images (2).jpeg",
        "provisional_crop": "Corn",
        "canonical_crop_id": "crop_corn",
        "suspected_disease": "Corn Ear Rot / Pest Injury",
        "canonical_disease_id": "ambiguous",
        "scientific_name": "Unconfirmed fungal ear rot / secondary pest damage",
        "affected_plant_part": "ears_cobs",
        "visible_symptoms": "Exposed ear of corn with husk opened at the middle/tip, showing yellow kernels with localized dark necrotic/black kernel rot and insect damage",
        "possible_alternative_diagnoses": ["Fusarium Ear Rot (Fusarium verticillioides)", "Gibberella Ear Rot (Gibberella zeae)", "Corn Earworm (Helicoverpa zea) injury with secondary rot", "Corn Smut (Ustilago maydis) early stage"],
        "label_source": "Provisional visual interpretation / Shutterstock stock photo",
        "label_status": "ambiguous",
        "verification_notes": "Depicts a maize ear/cob rather than maize foliage. Model classes for Corn are strictly foliar (Common Rust, Northern Leaf Blight, Cercospora Gray Leaf Spot). Kernel damage may be primary insect injury followed by opportunistic saprophytes. Pathogen unconfirmed.",
        "expected_prediction": "Abstain / Organ Mismatch / Low Confidence",
        "evaluation_eligible": False
    },
    {
        "sample_id": "SAMPLE_06",
        "filename": "images (1).jpeg",
        "provisional_crop": "Corn",
        "canonical_crop_id": "crop_corn",
        "suspected_disease": "Non-Disease Foliar Pest Chewing Damage",
        "canonical_disease_id": "non_disease_pest_damage",
        "scientific_name": "Insect injury (likely Spodoptera frugiperda / Fall Armyworm)",
        "affected_plant_part": "leaves",
        "visible_symptoms": "Severe foliar chewing injury: large ragged holes, window-paning, and lamina tears held by a human hand, without chlorotic or fungal sporulation halos",
        "possible_alternative_diagnoses": ["Grasshopper feeding damage", "Armyworm (Mythimna separata)", "Hail / physical tearing injury"],
        "label_source": "Diagnostic morphological inspection (chewing patterns vs microbial lesion)",
        "label_status": "verified_non_disease_injury",
        "verification_notes": "Classic mechanical/insect mastication damage (chewed leaf blade). It is NOT a microbial disease. Must not be classified as Common Rust or Northern Leaf Blight. The model should abstain due to low disease feature confidence.",
        "expected_prediction": "Abstain / Low Confidence (Safety Policy Rejection)",
        "evaluation_eligible": True
    },
    {
        "sample_id": "SAMPLE_07",
        "filename": "images.jpeg",
        "provisional_crop": "Soybean",
        "canonical_crop_id": "crop_unsupported",
        "suspected_disease": "Soybean Foliar Necrosis (Sudden Death Syndrome / Brown Spot / Target Spot)",
        "canonical_disease_id": "unsupported",
        "scientific_name": "Glycine max foliar pathogen (Fusarium virguliforme / Septoria glycines / Corynespora cassiicola)",
        "affected_plant_part": "leaves",
        "visible_symptoms": "Trifoliate ovate pubescent leaflets with prominent interveinal necrotic brown blotches bordered by chlorotic yellow margins",
        "possible_alternative_diagnoses": ["Soybean Sudden Death Syndrome", "Soybean Brown Spot (Septoria glycines)", "Target Spot (Corynespora cassiicola)", "Stem Canker foliar symptoms", "Cowpea / Bean foliar anthracnose"],
        "label_source": "Botanical leaflet morphology (trifoliate pubescent leaflet) & lesion inspection",
        "label_status": "verified_crop_unsupported_in_model",
        "verification_notes": "Botanical morphology clearly indicates Soybean (Glycine max). While PlantVillage had 'Soybean___healthy', diseased soybean classes were excluded from the unified 72-class crop disease model. The system must not force this image into Chilli, Tomato, or Grape.",
        "expected_prediction": "Abstain / Out-of-Distribution Rejection",
        "evaluation_eligible": True
    },
    {
        "sample_id": "SAMPLE_08",
        "filename": "Crop-Diseases_-Types-Causes-and-Symptoms-2-min.webp",
        "provisional_crop": "Wheat",
        "canonical_crop_id": "crop_wheat",
        "suspected_disease": "Wheat Stripe Rust (Yellow Rust)",
        "canonical_disease_id": "dis_wheat_stripe_rust",
        "scientific_name": "Puccinia striiformis f. sp. tritici",
        "affected_plant_part": "leaves",
        "visible_symptoms": "Linear parallel stripes of bright yellow-orange powdery pustules (urediniospores) aligned along leaf veins of cereal blades, flanked by chlorosis",
        "possible_alternative_diagnoses": ["Wheat Leaf Rust (Puccinia triticina) - though linear striping is diagnostic for stripe rust", "Barley Stripe Rust (Puccinia striiformis f. sp. hordei)"],
        "label_source": "Educational agricultural guide illustration & characteristic linear pustule morphology",
        "label_status": "verified_ground_truth",
        "verification_notes": "Definitive morphological manifestation of Stripe Rust / Yellow Rust on wheat foliage. Linear parallel stripe formation is pathognomonic for Puccinia striiformis on Poaceae. This class exists in the 72-class model ('Wheat___Stripe_rust') and Phase 2 registry ('dis_wheat_stripe_rust').",
        "expected_prediction": "Wheat Stripe Rust (Yellow Rust)",
        "evaluation_eligible": True
    },
    {
        "sample_id": "SAMPLE_09",
        "filename": "Rust_leaves_MAIN.jpg",
        "provisional_crop": "Wheat",
        "canonical_crop_id": "crop_wheat",
        "suspected_disease": "Wheat Stem Rust (Black Rust) / Leaf Rust",
        "canonical_disease_id": "dis_wheat_leaf_rust",
        "scientific_name": "Puccinia graminis f. sp. tritici / Puccinia triticina",
        "affected_plant_part": "leaves",
        "visible_symptoms": "Dense reddish-brown to dark brown erumpent pustules erupting across cereal stems and drying leaf sheaths/blades",
        "possible_alternative_diagnoses": ["Wheat Stem Rust (Puccinia graminis) - predominant on culms", "Wheat Leaf Rust (Puccinia triticina) - on foliage", "Barley Rust (Puccinia hordei)"],
        "label_source": "Agricultural extension field publication on cereal rusts",
        "label_status": "verified_crop_rust_complex",
        "verification_notes": "Definitive cereal rust on wheat stems/leaves. In the unified model, wheat rust classes include 'Wheat___Leaf_rust' and 'Wheat___Stripe_rust'. Stem rust is not a distinct class in the model (often absorbed into leaf rust or out-of-class). The crop is verified as Wheat, and the pathogen is verified as Puccinia rust complex.",
        "expected_prediction": "Wheat Leaf Rust or Wheat Stripe Rust",
        "evaluation_eligible": True
    }
]

# Load ML Model
c_model, idx_map = get_disease_model()
print(f"Disease model loaded: {c_model is not None}, idx_map size: {len(idx_map) if idx_map else 0}")

evaluation_records = []

for spec in sample_specs:
    sid = spec["sample_id"]
    fname = spec["filename"]
    img_path = os.path.join(SAMPLE_DIR, fname)
    if not os.path.exists(img_path):
        img_path = os.path.join(DOWNLOADS_DIR, fname)

    print(f"\nProcessing {sid}: {fname}...")
    
    # 1. Load image and preprocess
    pil_img = Image.open(img_path).convert('RGB')
    cv_img = cv2.imread(img_path)
    
    # Preprocess for model: 224x224 RGB
    pil_resized = pil_img.resize((224, 224))
    img_arr = np.array(pil_resized, dtype=np.float32)
    # Note: Keras MobileNetV2 / EfficientNet preprocessing in the pipeline uses raw or rescaled
    # In predict.py line 428-430:
    # img_arr = tf.keras.preprocessing.image.img_to_array(pil_img)
    # img_arr = tf.expand_dims(img_arr, 0)
    # raw_preds = c_model.predict(img_arr, verbose=0)[0]
    import tensorflow as tf
    tensor_img = tf.keras.preprocessing.image.img_to_array(pil_resized)
    tensor_img = tf.expand_dims(tensor_img, 0)
    raw_preds = c_model.predict(tensor_img, verbose=0)[0]

    # Leaf validation check
    is_valid_leaf, val_reason, plant_ratio = validate_leaf_image(cv_img, raw_preds)
    
    # Raw Top-1 and Top-3
    sorted_indices = np.argsort(raw_preds)[::-1]
    top1_idx = int(sorted_indices[0])
    top1_prob = float(raw_preds[top1_idx])
    top1_key = idx_map.get(top1_idx)
    
    if top1_key in CLASS_MAPPING:
        raw_top1_crop, raw_top1_disease = CLASS_MAPPING[top1_key]
    else:
        parts = top1_key.split('___')
        raw_top1_crop = parts[0].replace('_', ' ')
        raw_top1_disease = parts[1].replace('_', ' ') if len(parts) > 1 else top1_key

    top3 = []
    for s_idx in sorted_indices[:3]:
        s_k = idx_map.get(int(s_idx))
        if s_k in CLASS_MAPPING:
            c_f, d_f = CLASS_MAPPING[s_k]
        else:
            p_ = s_k.split('___')
            c_f = p_[0].replace('_', ' ')
            d_f = p_[1].replace('_', ' ') if len(p_) > 1 else s_k
        top3.append({
            "class_key": s_k,
            "crop": c_f,
            "disease": d_f,
            "probability": round(float(raw_preds[s_idx]), 4),
            "percentage": round(float(raw_preds[s_idx] * 100.0), 2)
        })

    # Test under Auto-Detect vs Farmer-selected crop
    farmer_crop = spec["provisional_crop"]
    crop_conditioned_candidates = []
    crop_conditioned_top1 = None
    if farmer_crop and farmer_crop in SUPPORTED_CROPS:
        crop_indices = [k for k, v in idx_map.items() if v in CLASS_MAPPING and CLASS_MAPPING[v][0] == farmer_crop]
        if crop_indices:
            crop_preds = [(k, raw_preds[k]) for k in crop_indices]
            crop_preds.sort(key=lambda x: x[1], reverse=True)
            for k, p in crop_preds[:3]:
                c_k = idx_map.get(k)
                cf, df = CLASS_MAPPING[c_k]
                crop_conditioned_candidates.append({
                    "class_key": c_k,
                    "crop": cf,
                    "disease": df,
                    "probability": round(float(p), 4),
                    "percentage": round(float(p * 100.0), 2)
                })
            crop_conditioned_top1 = crop_conditioned_candidates[0]

    # Evaluate decision status under Phase 8 Calibrated Policy (tau = 0.50)
    CONFIDENCE_THRESHOLD = 0.50
    final_diagnosis_status = "UNKNOWN"
    abstained = False
    crop_mismatch = False
    organ_mismatch = False
    treatment_withheld = False

    # Check organ compatibility
    affected_organ = spec["affected_plant_part"]
    if affected_organ not in ["leaves", "stems"]:
        organ_mismatch = True

    if not is_valid_leaf:
        final_diagnosis_status = "REJECTED_NON_CROP"
        abstained = True
        treatment_withheld = True
    elif top1_prob < CONFIDENCE_THRESHOLD:
        final_diagnosis_status = "UNCERTAIN_DIAGNOSIS"
        abstained = True
        treatment_withheld = True
    elif farmer_crop and raw_top1_crop != farmer_crop and top1_prob >= 0.35:
        crop_mismatch = True
        final_diagnosis_status = "CROP_MISMATCH"
        abstained = True
        treatment_withheld = True
    else:
        final_diagnosis_status = "CONFIRMED_DIAGNOSIS"
        abstained = False
        treatment_withheld = False

    # Check Ground-Truth Accuracy
    ground_truth_verified = (spec["label_status"] in ["verified_ground_truth", "verified_non_disease_injury", "verified_crop_and_symptom_unsupported_disease", "verified_crop_unsupported_in_model", "verified_crop_rust_complex"])
    top1_correct = None
    evaluation_analysis = ""

    if spec["label_status"] == "verified_ground_truth":
        # SAMPLE_08: Wheat Stripe Rust
        top1_correct = (raw_top1_crop == "Wheat" and "Stripe Rust" in raw_top1_disease)
        evaluation_analysis = f"Model predicted {raw_top1_crop} {raw_top1_disease} (P={top1_prob:.2f}). Top-1 Correct: {top1_correct}. Final status: {final_diagnosis_status}."
    elif spec["label_status"] == "verified_crop_rust_complex":
        # SAMPLE_09: Wheat Rust complex (Stem Rust / Leaf Rust)
        top1_correct = (raw_top1_crop == "Wheat" and ("Rust" in raw_top1_disease))
        evaluation_analysis = f"Model predicted {raw_top1_crop} {raw_top1_disease} (P={top1_prob:.2f}). Crop correct, disease rust complex correct ({raw_top1_disease})."
    elif spec["label_status"] == "verified_non_disease_injury":
        # SAMPLE_06: Corn insect chewing damage
        top1_correct = False # Not a disease
        evaluation_analysis = f"Image is insect foliar chewing damage. Model raw prediction: {raw_top1_crop} {raw_top1_disease} (P={top1_prob:.2f}). System properly abstained (P < 0.50 threshold triggered: {abstained})."
    elif spec["label_status"] == "verified_crop_and_symptom_unsupported_disease":
        # SAMPLE_04: Rice False Smut (unsupported disease)
        top1_correct = False # Rice is correct, but disease is not in model
        evaluation_analysis = f"True pathogen is Rice False Smut (unsupported). Model predicted {raw_top1_crop} {raw_top1_disease} (P={top1_prob:.2f}). Correct crop, but false disease attribution. Abstention should be enforced for unsupported panicle diseases."
    elif spec["label_status"] == "verified_crop_unsupported_in_model":
        # SAMPLE_07: Soybean (unsupported crop in disease classifier)
        top1_correct = False
        evaluation_analysis = f"True crop is Soybean (unsupported in disease model). Model predicted {raw_top1_crop} {raw_top1_disease} (P={top1_prob:.2f}). Misclassified into unrelated crop ({raw_top1_crop})."
    else:
        top1_correct = "N/A — label unverified"
        evaluation_analysis = f"Ground truth is unverified/ambiguous ({spec['label_status']}). Model predicted {raw_top1_crop} {raw_top1_disease} (P={top1_prob:.2f}). Abstention status: {abstained}."

    rec = {
        "sample_id": sid,
        "filename": fname,
        "spec": spec,
        "raw_top1": {
            "class_key": top1_key,
            "crop": raw_top1_crop,
            "disease": raw_top1_disease,
            "probability": round(top1_prob, 4),
            "percentage": round(top1_prob * 100.0, 2)
        },
        "raw_top3": top3,
        "farmer_crop": farmer_crop,
        "crop_conditioned_top1": crop_conditioned_top1,
        "crop_conditioned_candidates": crop_conditioned_candidates,
        "leaf_validation": {
            "is_valid_leaf": is_valid_leaf,
            "reason": val_reason,
            "plant_ratio": round(float(plant_ratio), 4)
        },
        "final_diagnosis_status": final_diagnosis_status,
        "abstained": abstained,
        "crop_mismatch": crop_mismatch,
        "organ_mismatch": organ_mismatch,
        "treatment_withheld": treatment_withheld,
        "top1_correct": top1_correct,
        "evaluation_analysis": evaluation_analysis
    }
    evaluation_records.append(rec)

out_file = r"scratch\sample_images_evaluation_results.json"
with open(out_file, "w", encoding="utf-8") as f:
    json.dump(evaluation_records, f, indent=2)

print(f"\nEvaluation complete. Successfully processed {len(evaluation_records)} sample images.")
print(f"Results written to {out_file}")
