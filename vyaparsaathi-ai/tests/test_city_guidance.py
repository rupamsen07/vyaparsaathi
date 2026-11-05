import unittest

from app.core.city_guidance import licence_checklist, match_city_schemes
from app.core.city_planner import calculate_landed_cost


class CityGuidanceTests(unittest.TestCase):
    def test_mobile_vendor_gets_preliminary_scheme_matches_not_eligibility(self):
        matches = match_city_schemes(
            business_model="mobile",
            funding_gap=21000,
            wants_loan=True,
        )
        by_id = {scheme["id"]: scheme for scheme in matches}

        self.assertEqual(by_id["mudra_shishu"]["match_percent"], 95)
        self.assertEqual(by_id["pm_svanidhi"]["match_percent"], 85)
        self.assertEqual(by_id["pm_svanidhi"]["match_label"], "Preliminary match")
        self.assertTrue(by_id["pm_svanidhi"]["verify_before_applying"])
        self.assertNotIn("stand_up_india", by_id)

    def test_special_category_scheme_only_appears_when_user_requests_it(self):
        without_category = match_city_schemes(
            business_model="fixed",
            funding_gap=1000000,
            wants_loan=True,
        )
        with_category = match_city_schemes(
            business_model="fixed",
            funding_gap=1000000,
            wants_loan=True,
            special_categories=["women"],
        )

        self.assertNotIn("stand_up_india", {scheme["id"] for scheme in without_category})
        self.assertIn("stand_up_india", {scheme["id"] for scheme in with_category})

    def test_no_loan_request_does_not_show_loan_schemes(self):
        self.assertEqual(
            match_city_schemes(
                business_model="mobile",
                funding_gap=21000,
                wants_loan=False,
            ),
            [],
        )

    def test_licence_checklist_matches_business_model_and_category(self):
        mobile_food = licence_checklist("momo_cart", "mobile")
        fixed_repair = licence_checklist("phone_repair_shop", "fixed")

        self.assertIn("fssai_basic", {licence["id"] for licence in mobile_food})
        self.assertIn("street_vending_certificate", {licence["id"] for licence in mobile_food})
        self.assertNotIn("fssai_basic", {licence["id"] for licence in fixed_repair})
        self.assertIn("shop_establishment", {licence["id"] for licence in fixed_repair})
        self.assertIn("udyam_registration", {licence["id"] for licence in fixed_repair})

    def test_landed_cost_accounts_for_transport(self):
        self.assertEqual(calculate_landed_cost(520, 1, 20), 540)
        self.assertEqual(calculate_landed_cost(500, 10, 80, 20), 510)


if __name__ == "__main__":
    unittest.main()
