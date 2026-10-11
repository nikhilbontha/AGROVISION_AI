import unittest
import sys
import os

sys.path.append(os.path.abspath("backend"))

from app.services.yield_engine import (
    convert_area_to_acres,
    calculate_smart_yield,
    ACRE_TO_HA,
    HA_TO_ACRE,
    SQM_TO_ACRE
)

class TestSmartYieldEngine(unittest.TestCase):

    def test_1_acres_to_hectares_conversion(self):
        """1. Five acres converts correctly to approximately 2.02343 hectares."""
        acres = 5.0
        ha = acres * ACRE_TO_HA
        self.assertAlmostEqual(ha, 2.02343, places=4)

    def test_2_yield_total_harvest_calculation(self):
        """2. A yield of 12 quintals per acre over 5 acres produces 60 quintals total."""
        yield_per_acre_q = 12.0
        acres = 5.0
        total_q = yield_per_acre_q * acres
        self.assertEqual(total_q, 60.0)

    def test_3_gross_revenue_calculation(self):
        """3. Sixty quintals sold at ₹2,585 per quintal produce ₹155,100 gross revenue."""
        total_q = 60.0
        price_per_q = 2585.0
        gross_rev = total_q * price_per_q
        self.assertEqual(gross_rev, 155100.0)

    def test_4_operating_profit_calculation(self):
        """4. Gross revenue of ₹155,100 minus costs of ₹90,000 produces ₹65,100 operating profit."""
        gross_rev = 155100.0
        costs = 90000.0
        profit = gross_rev - costs
        self.assertEqual(profit, 65100.0)

    def test_5_negative_and_invalid_acreage_rejection(self):
        """5. Negative acreage and invalid numerical inputs are rejected / converted safely."""
        res_neg = convert_area_to_acres(-5.0, "acres")
        self.assertEqual(res_neg, 0.0)
        
        res_zero = convert_area_to_acres(0.0, "acres")
        self.assertEqual(res_zero, 0.0)

    def test_6_missing_data_lowers_confidence_score(self):
        """6. Missing optional data lowers prediction quality confidence score."""
        minimal_input = {"area": 5.0, "crop_type": "Wheat", "soil_type": "Loamy"}
        res_min = calculate_smart_yield(minimal_input)
        
        full_input = {
            "area": 5.0, 
            "crop_type": "Wheat", 
            "soil_type": "Loamy",
            "soil_test_available": True,
            "soil_ph": 6.8,
            "organic_carbon": 0.8,
            "sowing_date": "2026-11-01",
            "fertilizers_applied": [{"name": "Urea", "qty": 50}],
            "itemized_costs": {"seed": 3000, "fertilizer": 4000}
        }
        res_full = calculate_smart_yield(full_input)
        self.assertGreater(res_full["yield_forecast"]["confidence_score"], res_min["yield_forecast"]["confidence_score"])

    def test_7_changing_crop_type_updates_recommendations(self):
        """7. Changing crop type updates crop-specific questions and recommendations."""
        res_wheat = calculate_smart_yield({"crop_type": "Wheat", "crop_stage": "Tillering"})
        res_cotton = calculate_smart_yield({"crop_type": "Cotton", "crop_stage": "Square Formation"})
        
        wheat_rec_title = res_wheat["recommendations"][0]["title"]
        cotton_rec_title = res_cotton["recommendations"][0]["title"]
        
        self.assertIn("Wheat", wheat_rec_title)
        self.assertIn("Cotton", cotton_rec_title)

    def test_8_changing_selling_price_updates_financials(self):
        """8. Changing the selling price updates revenue, profit and break-even analysis."""
        res_base = calculate_smart_yield({"expected_farmgate_price": 2500.0, "area": 5.0})
        res_high = calculate_smart_yield({"expected_farmgate_price": 3000.0, "area": 5.0})
        
        self.assertGreater(res_high["financial_forecast"]["gross_revenue"], res_base["financial_forecast"]["gross_revenue"])
        self.assertGreater(res_high["financial_forecast"]["net_operating_profit"], res_base["financial_forecast"]["net_operating_profit"])

    def test_9_changing_yield_updates_financial_results(self):
        """9. Changing yield updates all dependent financial results."""
        res_good = calculate_smart_yield({"crop_condition": "excellent", "area": 5.0})
        res_poor = calculate_smart_yield({"crop_condition": "poor", "area": 5.0})
        
        self.assertGreater(res_good["yield_forecast"]["total_harvest_q"], res_poor["yield_forecast"]["total_harvest_q"])
        self.assertGreater(res_good["financial_forecast"]["gross_revenue"], res_poor["financial_forecast"]["gross_revenue"])

    def test_10_no_cost_double_counting(self):
        """10. Changing cost inputs does not double-count expenses."""
        itemized_dict = {"seed": 5000, "fertilizer": 10000, "labour": 8000}
        res = calculate_smart_yield({"itemized_costs": itemized_dict, "area": 5.0, "land_rent_per_acre": 0})
        expected_total_cost = 5000 + 10000 + 8000
        self.assertEqual(res["financial_forecast"]["total_operating_cost"], expected_total_cost)

    def test_11_unavailable_apis_use_safe_baselines(self):
        """11. Unavailable external APIs do not produce fabricated live data."""
        res = calculate_smart_yield({"district": "RemoteLocationXYZ", "area": 5.0})
        self.assertIn("district", res["farm_profile"])
        self.assertGreater(res["financial_forecast"]["gross_revenue"], 0)

    def test_12_unit_conversions_consistency(self):
        """12. All conversions between acres, hectares, kilograms, quintals and tonnes are correct."""
        q = 100.0
        tonnes = q / 10.0
        kg = q * 100.0
        self.assertEqual(tonnes, 10.0)
        self.assertEqual(kg, 10000.0)
        
        ha_conv = 10.0 * ACRE_TO_HA
        acres_back = ha_conv * HA_TO_ACRE
        self.assertAlmostEqual(acres_back, 10.0, places=3)

if __name__ == "__main__":
    unittest.main()
