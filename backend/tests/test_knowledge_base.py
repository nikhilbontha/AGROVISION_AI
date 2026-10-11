import unittest
import json
import os
from app.utils.disease_info import (
    DISEASE_INFO,
    get_disease_info,
    get_diagnostic_followup_plan,
    validate_crop_disease_match,
    generate_14_day_plan
)

class TestAgriculturalKnowledgeBase(unittest.TestCase):
    """
    Phase 7 Verification Test Suite for Agricultural Knowledge Base,
    Schema Compliance, Crop-Disease Match Validation, 14-Day Plan Generator,
    and Pesticide Safety Disclaimers.
    """

    def setUp(self):
        # Load taxonomy class indices to verify coverage against all 39 model classes
        class_indices_path = "../ml_models/disease_detection/class_indices.json"
        if os.path.exists(class_indices_path):
            with open(class_indices_path, "r") as f:
                self.class_indices = json.load(f)
        else:
            self.class_indices = {}

    def test_schema_completeness_all_supported_classes(self):
        """Test that every deployable disease class returns a complete Phase 7 knowledge-base schema."""
        for class_name in list(self.class_indices.keys()):
            info = get_disease_info(class_name, lang='en')
            
            # 1. Canonical naming
            self.assertIn("canonical_crop", info)
            self.assertIn("canonical_disease", info)
            self.assertIn("synonyms", info)
            self.assertIsInstance(info["synonyms"], list)

            # 2. Pathogen science & symptoms
            self.assertIn("scientific_name", info)
            self.assertIn("known_cause", info)
            self.assertIn("characteristic_symptoms", info)
            self.assertIsInstance(info["characteristic_symptoms"], list)

            # 3. Environmental conditions
            self.assertIn("favorable_conditions", info)
            self.assertIn("temperature", info["favorable_conditions"])
            self.assertIn("humidity", info["favorable_conditions"])

            # 4. Management & IPM
            self.assertIn("prevention_measures", info)
            self.assertIn("cultural_management", info)
            self.assertIn("ipm_recommendations", info)

            # 5. Treatment options & disclaimers
            self.assertIn("treatment_options", info)
            self.assertIn("organic", info["treatment_options"])
            self.assertIn("chemical", info["treatment_options"])
            self.assertIn("pesticide_safety_disclaimer", info["treatment_options"])

            # 6. Sources & Metadata
            self.assertIn("authoritative_source", info)
            self.assertIn("authoritative_source_url", info)
            self.assertIn("review_date", info)
            self.assertIn("expert_confirmation_required", info)

            # 7. 14-day plan
            self.assertIn("plan_14_day", info)
            self.assertIn("cure_disclaimer", info["plan_14_day"])
            self.assertIn("expert_escalation_trigger", info["plan_14_day"])

    def test_crop_disease_match_and_rejection(self):
        """Test explicit crop-disease matching logic and species mismatch detection."""
        # Valid auto-detect match
        match_auto = validate_crop_disease_match("Auto-Detect", "Wheat___Stripe_rust")
        self.assertTrue(match_auto["is_valid_match"])

        # Valid explicit user match
        match_wheat = validate_crop_disease_match("Wheat", "Wheat___Stripe_rust")
        self.assertTrue(match_wheat["is_valid_match"])

        # Invalid crop species mismatch
        mismatch = validate_crop_disease_match("Tomato", "Wheat___Stripe_rust")
        self.assertFalse(mismatch["is_valid_match"])
        self.assertIn("mismatch", mismatch["reason"].lower())

    def test_healthy_crop_results(self):
        """Test healthy crop diagnoses receive non-chemical maintenance guidance."""
        healthy_info = get_disease_info("Wheat___healthy", lang='en')
        self.assertEqual(healthy_info["canonical_disease"].lower(), "healthy")
        self.assertIn("No chemical", healthy_info["treatment_options"]["chemical"])
        
        plan = healthy_info["plan_14_day"]
        self.assertIn("day_1_2", plan)
        self.assertIn("day_12_14", plan)

    def test_uncertain_diagnosis_returns_diagnostic_followup_plan(self):
        """Test that uncertain or non-crop scans return a diagnostic follow-up plan instead of fake disease remedies."""
        plan_en = get_diagnostic_followup_plan(lang='en')
        self.assertEqual(plan_en["status"], "DIAGNOSTIC_FOLLOWUP_REQUIRED")
        self.assertIn("No chemical pesticides are recommended", plan_en["disclaimer"])

        plan_te = get_diagnostic_followup_plan(lang='te')
        self.assertEqual(plan_te["status"], "DIAGNOSTIC_FOLLOWUP_REQUIRED")
        self.assertIn("వ్యాధి నిర్ధారణలో స్పష్టత లేదు", plan_te["disclaimer"])

    def test_14_day_plan_generator_and_disclaimer(self):
        """Test structured 14-day plan generator and cure disclaimer presence."""
        diseased_info = get_disease_info("Tomato___Late_blight", lang='en')
        plan = generate_14_day_plan(diseased_info, lang='en')

        self.assertIn("day_1_2", plan)
        self.assertIn("day_3_5", plan)
        self.assertIn("day_6_8", plan)
        self.assertIn("day_9_11", plan)
        self.assertIn("day_12_14", plan)
        self.assertIn("cure_disclaimer", plan)
        self.assertIn("does not guarantee complete pathogen eradication in 14 days", plan["cure_disclaimer"])
        self.assertIn("expert_escalation_trigger", plan)

    def test_regional_applicability_and_authoritative_sources(self):
        """Test that records cite credible agricultural extension sources and regional applicability."""
        info = get_disease_info("Rice___Blast", lang='en')
        self.assertIn("PJTSAU", info["authoritative_source"])
        self.assertTrue(info["authoritative_source_url"].startswith("http"))
        self.assertIn("Telangana", info["region_and_stage_applicability"])

    def test_pesticide_safety_disclaimers(self):
        """Test chemical recommendations carry safety disclaimers and PPE instructions."""
        info = get_disease_info("Corn___Common_rust", lang='en')
        treatment = info["treatment_options"]
        self.assertIn("pesticide_safety_disclaimer", treatment)
        self.assertIn("CIB&RC", treatment["pesticide_safety_disclaimer"])
        self.assertIn("ppe_requirements", treatment)

if __name__ == '__main__':
    unittest.main()
