import unittest

from app.core.city_planner import (
    calculate_financial_plan,
    calculate_landed_cost,
    calculate_market_gap,
    calculate_opportunity_score,
    calculate_unit_cost,
    estimate_daily_sales,
    evaluate_pilot,
    find_best_sales_window,
    label_data_confidence,
)


class CityPlannerTests(unittest.TestCase):
    def test_momo_financial_example_matches_guide(self):
        plan = calculate_financial_plan(
            selling_price=60,
            unit_cost=16.58,
            fixed_monthly_cost=9000,
            startup_cost=42000,
            available_capital=30000,
            daily_units=45,
            annual_interest_rate=12,
            loan_term_months=12,
        )

        self.assertEqual(plan["margin_per_unit"], 43.42)
        self.assertEqual(plan["break_even_units_per_day"], 7)
        self.assertEqual(plan["estimated_monthly_profit"], 49617)
        self.assertEqual(plan["funding_gap"], 21000)
        self.assertAlmostEqual(plan["monthly_emi"], 1866, delta=1)

    def test_financial_plan_handles_zero_margin_and_fully_funded_project(self):
        plan = calculate_financial_plan(
            selling_price=10,
            unit_cost=10,
            fixed_monthly_cost=0,
            startup_cost=100,
            available_capital=100,
        )

        self.assertIsNone(plan["break_even_units_per_day"])
        self.assertFalse(plan["loan_required"])
        self.assertEqual(plan["monthly_emi"], 0)

    def test_mandi_recipe_cost_matches_guide(self):
        result = calculate_unit_cost([
            {"name": "Maida", "weight_g": 70, "retail_price_per_kg": 40},
            {"name": "Cabbage", "weight_g": 60, "mandi_price_per_quintal": 1400},
            {"name": "Onion", "weight_g": 25, "mandi_price_per_quintal": 3150},
            {"name": "Carrot", "weight_g": 15, "mandi_price_per_quintal": 3400},
            {"name": "Other fixed costs", "weight_g": 0, "fixed_cost": 11},
        ])

        self.assertEqual(result["unit_cost"], 16.58)

    def test_market_gap_uses_per_capita_rate_and_median(self):
        gap = calculate_market_gap(7, 16080, 5.42)

        self.assertEqual(gap["places_per_10000"], 4.35)
        self.assertEqual(gap["label"], "some gap")

    def test_opportunity_score_has_explainable_weighted_parts(self):
        result = calculate_opportunity_score({
            "demand": 32,
            "competition": 60,
            "skill": 100,
            "budget": 71,
            "supply": 59,
            "timing": 100,
        })

        self.assertEqual(result["score"], 67)
        self.assertEqual(result["verdict"], "good opportunity")
        self.assertEqual(sum(result["weights"].values()), 1)

    def test_best_sales_window_is_three_hours_within_working_hours(self):
        result = find_best_sales_window(
            {16: 40, 17: 70, 18: 96, 19: 88},
            "evening",
        )

        self.assertEqual(result["best_start_hour"], 17)
        self.assertEqual(result["best_end_hour"], 20)
        self.assertEqual(result["average_rush_index"], 85)

    def test_ground_truth_forecast_and_pilot_verdict(self):
        forecast = estimate_daily_sales(186, 10, 3)
        pilot = evaluate_pilot([35, 43, 50, 48], 45)

        self.assertEqual(forecast["people_per_hour"], 1116)
        self.assertEqual(forecast["estimated_units_per_day"], 50.22)
        self.assertEqual(pilot["forecast_ratio"], 0.98)
        self.assertEqual(pilot["verdict"], "slightly below forecast")

    def test_landed_cost_includes_transport_and_other_charges(self):
        self.assertEqual(calculate_landed_cost(520, 1, 20), 540)

    def test_sample_data_overrides_source_count_confidence(self):
        confidence = label_data_confidence(
            population=True,
            trade_licences=True,
            openstreetmap=True,
            ground_survey=True,
            sample_data=True,
        )

        self.assertEqual(confidence["label"], "Sample data")

    def test_invalid_inputs_are_rejected(self):
        with self.assertRaises(ValueError):
            calculate_landed_cost(10, 0)
        with self.assertRaises(ValueError):
            calculate_financial_plan(
                selling_price=5,
                unit_cost=7,
                fixed_monthly_cost=100,
                startup_cost=-100,
                available_capital=0,
            )


if __name__ == "__main__":
    unittest.main()
