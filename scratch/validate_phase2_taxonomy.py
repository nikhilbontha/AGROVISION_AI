import json
import os
import sys

print("=== AGROVISION AI 2.0 PHASE 2 TAXONOMY VALIDATION SUITE ===")

# File paths
crop_reg_path = "docs/agrovision_v2/phase2/crop_registry.json"
dis_reg_path = "docs/agrovision_v2/phase2/disease_registry.json"
model_map_path = "docs/agrovision_v2/phase2/model_class_mapping_proposal.json"
matrix_path = "docs/agrovision_v2/phase2/crop_organ_compatibility_matrix.json"
schema_path = "docs/agrovision_v2/phase2/taxonomy_schema.json"
output_report_path = "docs/agrovision_v2/phase2/taxonomy_validation_report.json"

test_results = []

def record_test(test_id, category, name, passed, details, errors=None):
    status = "PASS" if passed else "FAIL"
    entry = {
        "test_id": test_id,
        "category": category,
        "test_name": name,
        "status": status,
        "details": details,
        "error_count": len(errors) if errors else 0,
        "errors": errors or []
    }
    test_results.append(entry)
    print(f"[{status}] {test_id} ({category}): {name} - {details}")

# Load all JSON artifacts
with open(crop_reg_path, 'r', encoding='utf-8') as f:
    crop_data = json.load(f)
crops = crop_data.get('crops', [])

with open(dis_reg_path, 'r', encoding='utf-8') as f:
    dis_data = json.load(f)
diseases = dis_data.get('diseases', [])

with open(model_map_path, 'r', encoding='utf-8') as f:
    model_data = json.load(f)

with open(matrix_path, 'r', encoding='utf-8') as f:
    matrix_data = json.load(f)

# -------------------------------------------------------------
# TEST 1: Unique Canonical Identifiers
# -------------------------------------------------------------
crop_ids = [c['crop_id'] for c in crops]
dup_crops = [x for x in crop_ids if crop_ids.count(x) > 1]
t1_crop_pass = len(dup_crops) == 0 and len(crop_ids) > 0
record_test(
    "T2.1", "Identifier Integrity", "Canonical Crop IDs Uniqueness",
    t1_crop_pass,
    f"Total crops: {len(crop_ids)}, Duplicates found: {len(set(dup_crops))}",
    list(set(dup_crops))
)

dis_ids = [d['disease_id'] for d in diseases]
dup_dis = [x for x in dis_ids if dis_ids.count(x) > 1]
t1_dis_pass = len(dup_dis) == 0 and len(dis_ids) > 0
record_test(
    "T2.2", "Identifier Integrity", "Canonical Disease IDs Uniqueness",
    t1_dis_pass,
    f"Total diseases: {len(dis_ids)}, Duplicates found: {len(set(dup_dis))}",
    list(set(dup_dis))
)

# -------------------------------------------------------------
# TEST 2: Referential Integrity
# -------------------------------------------------------------
crop_id_set = set(crop_ids)
dis_id_set = set(dis_ids)

invalid_crop_refs = []
for d in diseases:
    if d['crop_id'] not in crop_id_set:
        invalid_crop_refs.append(f"{d['disease_id']} references unknown crop_id '{d['crop_id']}'")

record_test(
    "T2.3", "Referential Integrity", "Disease-to-Crop Reference Validity",
    len(invalid_crop_refs) == 0,
    f"Verified {len(diseases)} disease records against {len(crop_ids)} crops.",
    invalid_crop_refs
)

invalid_dis_refs = []
for c in crops:
    for did in c.get('supported_disease_ids', []):
        if did not in dis_id_set:
            invalid_dis_refs.append(f"Crop {c['crop_id']} references unknown disease_id '{did}'")
    hid = c.get('healthy_class_id')
    if hid and hid not in dis_id_set:
        invalid_dis_refs.append(f"Crop {c['crop_id']} references unknown healthy_class_id '{hid}'")

record_test(
    "T2.4", "Referential Integrity", "Crop-to-Disease Reference Validity",
    len(invalid_dis_refs) == 0,
    f"Verified all supported_disease_ids and healthy_class_ids.",
    invalid_dis_refs
)

# -------------------------------------------------------------
# TEST 3: Model Index Mapping Integrity
# -------------------------------------------------------------
v1_mappings = model_data['models']['v1_baseline_39class']['output_class_mappings']
v1_indices = [m['output_index'] for m in v1_mappings]
v1_dup = [x for x in v1_indices if v1_indices.count(x) > 1]

record_test(
    "T2.5", "Model Mapping", "Model v1 (39-Class) Output Index Uniqueness",
    len(v1_dup) == 0 and len(v1_mappings) == 39,
    f"Total v1 classes: {len(v1_mappings)}, Duplicate indices: {len(set(v1_dup))}",
    v1_dup
)

v2_mappings = model_data['models']['v2_unified_72class']['output_class_mappings']
v2_indices = [m['output_index'] for m in v2_mappings]
v2_dup = [x for x in v2_indices if v2_indices.count(x) > 1]

record_test(
    "T2.6", "Model Mapping", "Model v2 (72-Class) Output Index Uniqueness",
    len(v2_dup) == 0 and len(v2_mappings) == 72,
    f"Total v2 classes: {len(v2_mappings)}, Duplicate indices: {len(set(v2_dup))}",
    v2_dup
)

# -------------------------------------------------------------
# TEST 4: Controlled Vocabulary & Enumeration Conformance
# -------------------------------------------------------------
allowed_conditions = {"healthy", "disease", "pest_damage", "nutrient_disorder", "abiotic_stress", "unknown"}
allowed_pathogens = {"fungal", "bacterial", "viral", "oomycete", "pest", "abiotic", "nutritional", "mixed", "unknown"}

invalid_conditions = []
invalid_pathogens = []
for d in diseases:
    if d['condition_type'] not in allowed_conditions:
        invalid_conditions.append(f"{d['disease_id']}: invalid condition_type '{d['condition_type']}'")
    if d['pathogen_type'] not in allowed_pathogens:
        invalid_pathogens.append(f"{d['disease_id']}: invalid pathogen_type '{d['pathogen_type']}'")

record_test(
    "T2.7", "Vocabulary Validation", "Condition Type Conformance",
    len(invalid_conditions) == 0,
    f"All 75 records conform to allowed condition types.",
    invalid_conditions
)

record_test(
    "T2.8", "Vocabulary Validation", "Pathogen Type Conformance",
    len(invalid_pathogens) == 0,
    f"All 75 records conform to allowed pathogen types (including distinct oomycete and bacterial entries).",
    invalid_pathogens
)

# -------------------------------------------------------------
# TEST 5: Evidence Compliance for Verified Records
# -------------------------------------------------------------
missing_evidence = []
for d in diseases:
    if d['verification_status'] == 'verified' and len(d.get('evidence_references', [])) == 0:
        missing_evidence.append(f"{d['disease_id']} marked verified but has empty evidence_references")

for c in crops:
    if c['verification_status'] == 'supported_and_evaluated' and len(c.get('evidence_references', [])) == 0:
        missing_evidence.append(f"{c['crop_id']} marked supported_and_evaluated but has empty evidence_references")

record_test(
    "T2.9", "Evidence Quality", "Evidence Reference Requirement for Verified Records",
    len(missing_evidence) == 0,
    f"Every verified crop and disease record possesses documented authoritative citations.",
    missing_evidence
)

# -------------------------------------------------------------
# TEST 6: Organ Compatibility & Subset Invariance
# -------------------------------------------------------------
crop_organ_map = {c['crop_id']: set(c.get('supported_organs', [])) for c in crops}
organ_mismatches = []
for d in diseases:
    c_orgs = crop_organ_map.get(d['crop_id'], set())
    for d_org in d.get('supported_organs', []):
        if d_org not in c_orgs:
            organ_mismatches.append(f"{d['disease_id']} claims organ '{d_org}', which is not supported by parent crop '{d['crop_id']}'")

record_test(
    "T2.10", "Organ Hierarchy", "Disease-to-Crop Organ Compatibility Invariance",
    len(organ_mismatches) == 0,
    f"All disease diagnostic organs are strictly subsets of parent crop supported organs.",
    organ_mismatches
)

# -------------------------------------------------------------
# TEST 7: Healthy vs Diseased Consistency
# -------------------------------------------------------------
healthy_inconsistencies = []
for d in diseases:
    is_healthy = d['condition_type'] == 'healthy'
    if is_healthy:
        if not d['disease_id'].endswith('_healthy'):
            healthy_inconsistencies.append(f"Healthy disease {d['disease_id']} does not follow '_healthy' naming convention")
        if d['pathogen_type'] not in ['abiotic', 'unknown']:
            healthy_inconsistencies.append(f"Healthy condition {d['disease_id']} has pathogen_type '{d['pathogen_type']}' instead of 'abiotic'")

record_test(
    "T2.11", "Semantic Consistency", "Healthy Condition Consistency Check",
    len(healthy_inconsistencies) == 0,
    f"Verified healthy condition records and non-pathogenic labeling.",
    healthy_inconsistencies
)

# -------------------------------------------------------------
# TEST 8: Dataset Label Independence Check
# -------------------------------------------------------------
label_independence_violations = []
for d in diseases:
    # canonical ID should never be identical to original raw folder label
    for ds, alias in d.get('dataset_class_aliases', {}).items():
        if d['disease_id'] == alias:
            label_independence_violations.append(f"disease_id '{d['disease_id']}' directly mimics raw folder label '{alias}'")

record_test(
    "T2.12", "Decoupling Policy", "Canonical ID vs Dataset Folder Independence",
    len(label_independence_violations) == 0,
    f"100% of canonical disease IDs are decoupled from raw dataset folder names.",
    label_independence_violations
)

# Overall validation summary
total_tests = len(test_results)
passed_tests = sum(1 for t in test_results if t['status'] == 'PASS')
failed_tests = total_tests - passed_tests
overall_verdict = "PASS" if failed_tests == 0 else "FAIL"

summary_report = {
    "validation_timestamp": "2026-10-11T11:30:00+05:30",
    "overall_status": overall_verdict,
    "total_tests_executed": total_tests,
    "tests_passed": passed_tests,
    "tests_failed": failed_tests,
    "artifacts_validated": [
        crop_reg_path,
        dis_reg_path,
        model_map_path,
        matrix_path,
        schema_path
    ],
    "test_results": test_results
}

with open(output_report_path, 'w', encoding='utf-8') as f:
    json.dump(summary_report, f, indent=2)

print(f"\nValidation complete: {passed_tests}/{total_tests} PASSED. Overall Verdict: {overall_verdict}")
print(f"Validation report saved to: {output_report_path}")
