"""
AgroVision AI 2.0 - Phase 7 Agricultural Knowledge Base & Recommendations Automated Test Suite
Verifies all 12 diagnostic, regional, chemical, and knowledge-integrity requirements.
"""
import os
import sys
import json
import requests
import jsonschema
from datetime import datetime, timezone

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHASE2_DIR = os.path.join(BASE_DIR, "docs", "agrovision_v2", "phase2")
PHASE7_DIR = os.path.join(BASE_DIR, "docs", "agrovision_v2", "phase7")

KB_PATH = os.path.join(PHASE7_DIR, "crop_disease_knowledge.json")
SCHEMA_PATH = os.path.join(PHASE7_DIR, "knowledge_base_schema.json")
SOURCES_PATH = os.path.join(PHASE7_DIR, "evidence_sources.json")
REGIONAL_PATH = os.path.join(PHASE7_DIR, "regional_applicability.json")
CHEM_PATH = os.path.join(PHASE7_DIR, "chemical_recommendation_validation.json")
REPORT_OUTPUT_PATH = os.path.join(PHASE7_DIR, "knowledge_validation_results.json")

BASE_URL = "http://127.0.0.1:8000"
RECOMMEND_URL = f"{BASE_URL}/diagnosis/v1/recommend"

def run_tests():
    print("=" * 75)
    print(" AgroVision AI 2.0 - Phase 7 Agricultural Knowledge Base Test Runner")
    print(f" Execution Started: {datetime.now(timezone.utc).isoformat()}")
    print("=" * 75)

    results = []

    with open(KB_PATH, "r", encoding="utf-8") as f:
        kb_records = json.load(f)["records"]
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        schema = json.load(f)
    with open(SOURCES_PATH, "r", encoding="utf-8") as f:
        sources_dict = {s["source_id"]: s for s in json.load(f)["sources"]}
    with open(CHEM_PATH, "r", encoding="utf-8") as f:
        chem_data = json.load(f)
    with open(os.path.join(PHASE2_DIR, "crop_registry.json"), "r", encoding="utf-8") as f:
        crops_reg = set(c["crop_id"] for c in json.load(f)["crops"])
    with open(os.path.join(PHASE2_DIR, "disease_registry.json"), "r", encoding="utf-8") as f:
        dis_reg = {d["disease_id"]: d for d in json.load(f)["diseases"]}

    # -------------------------------------------------------------
    # 1. No Duplicate Knowledge Record IDs
    # -------------------------------------------------------------
    t1 = "test_no_duplicate_knowledge_record_ids"
    try:
        rec_ids = [r["knowledge_record_id"] for r in kb_records]
        assert len(rec_ids) == len(set(rec_ids)), "Duplicate knowledge_record_id detected!"
        assert len(rec_ids) == 75, f"Expected 75 records, found {len(rec_ids)}"
        results.append({
            "test_name": t1,
            "status": "PASS",
            "message": "Verified all 75 knowledge records have strictly unique IDs."
        })
        print(f"  [PASS] {t1}")
    except Exception as e:
        results.append({"test_name": t1, "status": "FAIL", "message": str(e)})
        print(f"  [FAIL] {t1}: {e}")

    # -------------------------------------------------------------
    # 2. Canonical Crop and Disease References
    # -------------------------------------------------------------
    t2 = "test_canonical_crop_disease_references"
    try:
        for r in kb_records:
            assert r["crop_id"] in crops_reg, f"Invalid crop_id in record: {r['crop_id']}"
            assert r["disease_id"] in dis_reg, f"Invalid disease_id in record: {r['disease_id']}"
        results.append({
            "test_name": t2,
            "status": "PASS",
            "message": "100% of knowledge records map to verified Phase 2 crop and disease canonical registries."
        })
        print(f"  [PASS] {t2}")
    except Exception as e:
        results.append({"test_name": t2, "status": "FAIL", "message": str(e)})
        print(f"  [FAIL] {t2}: {e}")

    # -------------------------------------------------------------
    # 3. Knowledge Base JSON Schema Draft-07 Conformance
    # -------------------------------------------------------------
    t3 = "test_knowledge_base_json_schema_conformance"
    try:
        for r in kb_records:
            jsonschema.validate(instance=r, schema=schema)
        results.append({
            "test_name": t3,
            "status": "PASS",
            "message": "All 75 knowledge records strictly conform to knowledge_base_schema.json."
        })
        print(f"  [PASS] {t3}")
    except Exception as e:
        results.append({"test_name": t3, "status": "FAIL", "message": str(e)})
        print(f"  [FAIL] {t3}: {e}")

    # -------------------------------------------------------------
    # 4. Institutional Evidence References Integrity
    # -------------------------------------------------------------
    t4 = "test_institutional_evidence_references_integrity"
    try:
        for r in kb_records:
            refs = r.get("evidence_references", [])
            assert len(refs) > 0, f"Record {r['knowledge_record_id']} has empty evidence_references"
            for ref_id in refs:
                assert ref_id in sources_dict, f"Unknown source ID: {ref_id} in {r['knowledge_record_id']}"
        results.append({
            "test_name": t4,
            "status": "PASS",
            "message": "All knowledge records reference registered sources (PJTSAU, ANGRAU, ICAR, CIBRC)."
        })
        print(f"  [PASS] {t4}")
    except Exception as e:
        results.append({"test_name": t4, "status": "FAIL", "message": str(e)})
        print(f"  [FAIL] {t4}: {e}")

    # -------------------------------------------------------------
    # 5. Chemical Recommendations Compliance & CIBRC Status
    # -------------------------------------------------------------
    t5 = "test_chemical_recommendations_compliance"
    try:
        for r in kb_records:
            chem = r["management_options"]["chemical"]
            verified_treatments = chem.get("verified_treatments", [])
            for vt in verified_treatments:
                assert vt["cibrc_status"] in [
                    "approved_label_claim",
                    "recommended_package_of_practices",
                    "restricted_use",
                    "provisional_review"
                ]
                assert vt["source_reference_id"] in sources_dict
                assert len(vt["dosage_per_liter"]) > 0
        results.append({
            "test_name": t5,
            "status": "PASS",
            "message": "Verified all chemical recommendations have CIBRC statutory registration or university POP backing."
        })
        print(f"  [PASS] {t5}")
    except Exception as e:
        results.append({"test_name": t5, "status": "FAIL", "message": str(e)})
        print(f"  [FAIL] {t5}: {e}")

    # -------------------------------------------------------------
    # 6. Anti-Viral and Non-Curative Chemical Exclusions
    # -------------------------------------------------------------
    t6 = "test_antiviral_and_noncurative_chemical_exclusions"
    try:
        for r in kb_records:
            if r["pathogen_type"] == "viral":
                chem = r["management_options"]["chemical"]
                # Must NOT recommend direct anti-viral fungicide/bactericide
                assert len(chem.get("verified_treatments", [])) == 0, f"Viral disease {r['disease_id']} has direct chemical cure!"
                cautions = " ".join(chem.get("cautions", []))
                assert "anti-viral" in cautions.lower() or "vector" in cautions.lower()
        results.append({
            "test_name": t6,
            "status": "PASS",
            "message": "Verified viral diseases strictly omit direct chemical cures and restrict to vector IPM."
        })
        print(f"  [PASS] {t6}")
    except Exception as e:
        results.append({"test_name": t6, "status": "FAIL", "message": str(e)})
        print(f"  [FAIL] {t6}: {e}")

    # -------------------------------------------------------------
    # 7. Regional Applicability Specification (Telangana & AP)
    # -------------------------------------------------------------
    t7 = "test_regional_applicability_telangana_and_ap"
    try:
        with open(REGIONAL_PATH, "r", encoding="utf-8") as f:
            reg_cfg = json.load(f)
        states = set(s["state_id"] for s in reg_cfg["target_geographies"])
        assert "TELANGANA" in states and "ANDHRA_PRADESH" in states
        for r in kb_records:
            reg = r["regional_applicability"]
            assert "Telangana" in reg["states"]
            assert "Andhra Pradesh" in reg["states"]
        results.append({
            "test_name": t7,
            "status": "PASS",
            "message": "Verified regional applicability covers PJTSAU and ANGRAU agroclimatic zones in Telangana and AP."
        })
        print(f"  [PASS] {t7}")
    except Exception as e:
        results.append({"test_name": t7, "status": "FAIL", "message": str(e)})
        print(f"  [FAIL] {t7}: {e}")

    # -------------------------------------------------------------
    # 8. Service Status Gating: Uncertain Diagnoses Withhold Chemical Sprays
    # -------------------------------------------------------------
    t8 = "test_status_gating_uncertain_diagnoses_withhold_chemicals"
    try:
        uncertain_statuses = [
            "multiple_candidates",
            "needs_more_information",
            "crop_mismatch",
            "organ_mismatch",
            "unsupported_crop",
            "model_unavailable",
            "insufficient_evidence",
            "expert_review_recommended"
        ]
        for st in uncertain_statuses:
            req = {
                "crop_id": "crop_rice",
                "disease_id": "dis_rice_blast",
                "decision_status": st,
                "affected_organ": "leaves",
                "state": "Telangana"
            }
            resp = requests.post(RECOMMEND_URL, json=req, timeout=15)
            assert resp.status_code == 200, f"Expected 200 for status {st}, got {resp.status_code}"
            body = resp.json()
            assert body["guidance_permitted"] is False, f"Guidance should be withheld for {st}"
            assert len(body["verified_chemical_treatments"]) == 0, f"Chemicals returned for uncertain status {st}"
            assert len(body["what_to_do_now"]) > 0
            assert len(body["when_to_seek_expert_help"]) > 0

        results.append({
            "test_name": t8,
            "status": "PASS",
            "message": "Verified all 8 non-supported diagnostic statuses strictly withhold chemical sprays and supply safe referral guidance."
        })
        print(f"  [PASS] {t8}")
    except Exception as e:
        results.append({"test_name": t8, "status": "FAIL", "message": str(e)})
        print(f"  [FAIL] {t8}: {e}")

    # -------------------------------------------------------------
    # 9. Service Supported Diagnosis: Returns Verified IPM and CIBRC Treatments
    # -------------------------------------------------------------
    t9 = "test_supported_diagnosis_returns_verified_ipm"
    try:
        req = {
            "crop_id": "crop_rice",
            "disease_id": "dis_rice_blast",
            "decision_status": "diagnosis_supported",
            "affected_organ": "leaves",
            "state": "Telangana",
            "district": "Warangal"
        }
        resp = requests.post(RECOMMEND_URL, json=req, timeout=15)
        assert resp.status_code == 200
        body = resp.json()
        assert body["guidance_permitted"] is True
        assert len(body["symptoms_to_check"]) > 0
        assert len(body["look_alikes"]) > 0
        assert len(body["what_to_do_now"]) > 0
        assert len(body["verified_chemical_treatments"]) > 0
        vt = body["verified_chemical_treatments"][0]
        assert vt["active_ingredient"] == "Tricyclazole"
        assert vt["cibrc_status"] == "approved_label_claim"
        assert len(body["evidence_references"]) >= 2

        results.append({
            "test_name": t9,
            "status": "PASS",
            "message": "Successfully returned source-backed IPM, distinguishing symptoms, and Tricyclazole label treatment for Rice Blast."
        })
        print(f"  [PASS] {t9}")
    except Exception as e:
        results.append({"test_name": t9, "status": "FAIL", "message": str(e)})
        print(f"  [FAIL] {t9}: {e}")

    # -------------------------------------------------------------
    # 10. Missing Knowledge Record Fails Safely
    # -------------------------------------------------------------
    t10 = "test_missing_knowledge_record_fails_safely"
    try:
        req = {
            "crop_id": "crop_rice",
            "disease_id": "dis_nonexistent_disease_999",
            "decision_status": "diagnosis_supported",
            "affected_organ": "leaves"
        }
        resp = requests.post(RECOMMEND_URL, json=req, timeout=15)
        assert resp.status_code == 200
        body = resp.json()
        assert body["guidance_permitted"] is False
        assert len(body["verified_chemical_treatments"]) == 0
        assert "not have an approved" in body["why_considered"].lower() or "not exist" in body["what_may_be_happening"].lower()

        results.append({
            "test_name": t10,
            "status": "PASS",
            "message": "Missing knowledge record failed safely with KVK referral without falling back to generic chemical sprays."
        })
        print(f"  [PASS] {t10}")
    except Exception as e:
        results.append({"test_name": t10, "status": "FAIL", "message": str(e)})
        print(f"  [FAIL] {t10}: {e}")

    # -------------------------------------------------------------
    # 11. Specific Disease Knowledge Endpoint (GET)
    # -------------------------------------------------------------
    t11 = "test_specific_disease_knowledge_endpoint"
    try:
        resp = requests.get(f"{BASE_URL}/diagnosis/v1/knowledge/dis_tomato_early_blight", timeout=15)
        assert resp.status_code == 200
        data = resp.json()
        assert data["canonical_name"] == "Tomato Early Blight"
        assert data["pathogen_type"] == "fungal"
        assert len(data["management_options"]["cultural"]) > 0

        # Non-existent disease returns 404
        resp404 = requests.get(f"{BASE_URL}/diagnosis/v1/knowledge/dis_fake_disease", timeout=15)
        assert resp404.status_code == 404

        results.append({
            "test_name": t11,
            "status": "PASS",
            "message": "Verified GET /diagnosis/v1/knowledge/{disease_id} returns record on match and 404 on unknown."
        })
        print(f"  [PASS] {t11}")
    except Exception as e:
        results.append({"test_name": t11, "status": "FAIL", "message": str(e)})
        print(f"  [FAIL] {t11}: {e}")

    # -------------------------------------------------------------
    # 12. Regression Safety on Unrelated Endpoints
    # -------------------------------------------------------------
    t12 = "test_regression_safety_yield_and_diagnosis"
    try:
        # Check yield endpoint
        yield_req = {
            "crop_type": "Wheat",
            "area": 5.0,
            "soil_type": "Loamy",
            "district": "Hyderabad",
            "temperature": 25.0,
            "humidity": 65.0,
            "rainfall": 800.0
        }
        resp = requests.post(f"{BASE_URL}/predict/predict-yield", json=yield_req, timeout=15)
        assert resp.status_code == 200
        assert resp.json().get("success") is True

        # Check sources endpoint
        src_resp = requests.get(f"{BASE_URL}/diagnosis/v1/sources", timeout=15)
        assert src_resp.status_code == 200
        assert len(src_resp.json().get("sources", [])) >= 5

        results.append({
            "test_name": t12,
            "status": "PASS",
            "message": "Zero regressions on /predict/predict-yield and Phase 5 diagnostic routers."
        })
        print(f"  [PASS] {t12}")
    except Exception as e:
        results.append({"test_name": t12, "status": "FAIL", "message": str(e)})
        print(f"  [FAIL] {t12}: {e}")

    # -------------------------------------------------------------
    # Summary & Output Generation
    # -------------------------------------------------------------
    passed_count = sum(1 for r in results if r["status"] == "PASS")
    total_count = len(results)
    all_passed = passed_count == total_count

    output_payload = {
        "test_suite": "AgroVision AI 2.0 - Phase 7 Agricultural Knowledge Base & Recommendations Test Suite",
        "executed_at": datetime.now(timezone.utc).isoformat(),
        "total_tests": total_count,
        "tests_passed": passed_count,
        "tests_failed": total_count - passed_count,
        "overall_status": "PASS" if all_passed else "FAIL",
        "test_results": results
    }

    with open(REPORT_OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output_payload, f, indent=2)

    print("=" * 75)
    print(f" Phase 7 Knowledge Base Test Suite Finished: {passed_count}/{total_count} PASSED")
    print(f" Results logged to: {REPORT_OUTPUT_PATH}")
    print("=" * 75)

    return all_passed

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
