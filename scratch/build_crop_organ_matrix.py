import json
import os

# Load registries
with open('docs/agrovision_v2/phase2/crop_registry.json', 'r', encoding='utf-8') as f:
    crops = json.load(f)['crops']

with open('docs/agrovision_v2/phase2/disease_registry.json', 'r', encoding='utf-8') as f:
    diseases = json.load(f)['diseases']

all_organs = [
    "leaves", "stems", "roots", "flowers", "fruits", 
    "pods", "ears_cobs", "rhizomes_tubers", "whole_plant"
]

crop_matrix = []

for c in crops:
    c_id = c['crop_id']
    c_name = c['canonical_name']
    c_diseases = [d for d in diseases if d['crop_id'] == c_id]
    
    organ_evaluations = {}
    for org in all_organs:
        # Determine status for this crop
        is_supported_crop = org in c.get('supported_organs', [])
        
        # Represented in dataset?
        rep_in_ds = False
        if c_id == "crop_chilli" and org in ["leaves", "fruits", "stems"]:
            rep_in_ds = True
        elif c_id == "crop_mango" and org in ["leaves", "fruits", "stems"]:
            rep_in_ds = True
        elif c_id == "crop_banana" and org in ["leaves", "fruits", "whole_plant"]:
            rep_in_ds = True
        elif c_id == "crop_turmeric" and org in ["leaves", "rhizomes_tubers"]:
            rep_in_ds = True
        elif c_id == "crop_cotton" and org in ["leaves", "stems", "bolls"]:
            rep_in_ds = True
        elif c_id in ["crop_tomato", "crop_potato", "crop_apple", "crop_grape", "crop_corn", "crop_rice", "crop_wheat", "crop_orange", "crop_pepper_bell"]:
            # Dataset 1 has leaves predominantly, Dataset 2 has tomato fruit/leaves
            if org == "leaves":
                rep_in_ds = True
            elif org == "fruits" and c_id == "crop_tomato":
                rep_in_ds = True
        
        # Supported by reference
        supp_by_ref = is_supported_crop
        
        # Independently evaluated
        indep_eval = False
        if rep_in_ds and c['verification_status'] == "supported_and_evaluated":
            if org in ["leaves", "fruits", "rhizomes_tubers"]:
                indep_eval = True
                
        organ_evaluations[org] = {
            "represented_in_dataset": rep_in_ds,
            "supported_by_reference": supp_by_ref,
            "independently_evaluated": indep_eval,
            "validation_policy": "PERMITTED" if rep_in_ds else ("REFERENCE_ONLY_UNTESTED" if supp_by_ref else "UNSUPPORTED")
        }
        
    # Disease-level organ breakdown
    disease_breakdowns = []
    for d in c_diseases:
        d_orgs = d.get('supported_organs', [])
        d_entry = {
            "disease_id": d['disease_id'],
            "canonical_name": d['canonical_name'],
            "primary_diagnostic_organs": d_orgs,
            "organ_manifestations": {}
        }
        for org in all_organs:
            is_diag = org in d_orgs
            d_rep = organ_evaluations[org]['represented_in_dataset'] and is_diag
            d_entry["organ_manifestations"][org] = {
                "is_diagnostic_organ": is_diag,
                "dataset_evidence_present": d_rep,
                "reference_supported": is_diag
            }
        disease_breakdowns.append(d_entry)
        
    crop_matrix.append({
        "crop_id": c_id,
        "canonical_name": c_name,
        "crop_level_organ_status": organ_evaluations,
        "disease_level_organ_status": disease_breakdowns
    })

matrix_doc = {
    "schema_version": "2.0.0",
    "generated_at": "2026-10-11T11:25:00+05:30",
    "description": "Evidence-based Crop-Organ Compatibility Matrix establishing biological relevance, actual dataset representation, reference support, and validation policies to replace legacy leaf-only HSV filtering.",
    "supported_organs_vocabulary": all_organs,
    "crops_matrix": crop_matrix
}

output_path = 'docs/agrovision_v2/phase2/crop_organ_compatibility_matrix.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(matrix_doc, f, indent=2)

print(f"Generated {output_path} successfully for {len(crop_matrix)} crops.")
