import unittest

from app.core.chat_profile import localized_question, next_profile_field, rule_based_extraction
from app.models.state import BusinessContext, UserProfile, VyaparState


class ChatProfileTests(unittest.TestCase):
    def test_discover_mode_skips_business_question(self):
        state = VyaparState(
            user_profile=UserProfile(city="Pune"),
            business_context=BusinessContext(mode="discover"),
        )

        self.assertEqual(next_profile_field(state), "capital")

    def test_launch_mode_collects_business_before_budget(self):
        state = VyaparState(
            user_profile=UserProfile(),
            business_context=BusinessContext(mode="launch"),
        )

        self.assertEqual(next_profile_field(state), "business")

    def test_rule_extraction_understands_hinglish_and_preserves_language(self):
        state = VyaparState(
            user_profile=UserProfile(language="Hindi"),
            business_context=BusinessContext(mode="launch"),
        )

        updated = rule_based_extraction(
            state,
            "Momo cart lagana hai, tees hazaar hain, cooking aati hai, BTM mein shaam ko",
        )

        self.assertEqual(updated.user_profile.language, "Hindi")
        self.assertEqual(updated.user_profile.available_capital, 30000)
        self.assertIn("cooking", updated.user_profile.skills)
        self.assertEqual(updated.user_profile.working_hours, "evening")
        self.assertEqual(updated.business_context.business_name, "Momo cart")
        self.assertEqual(updated.business_context.candidate_zones, ["BTM Layout"])

    def test_numeric_capital_and_city_area_are_extracted_without_fabrication(self):
        state = VyaparState(
            user_profile=UserProfile(),
            business_context=BusinessContext(mode="discover"),
        )

        updated = rule_based_extraction(state, "I have 30,000 rupees and can cook in Yerawada")

        self.assertEqual(updated.user_profile.available_capital, 30000)
        self.assertEqual(updated.user_profile.city, "Pune")
        self.assertEqual(updated.business_context.candidate_zones, ["Yerawada"])
        self.assertIsNone(updated.business_context.business_name)

    def test_localized_fallback_uses_selected_language_and_city(self):
        state = VyaparState(
            user_profile=UserProfile(language="Hindi", city="Pune"),
            business_context=BusinessContext(mode="launch"),
        )

        question = localized_question("area", "Hindi", state)

        self.assertIn("Pune", question)
        self.assertIn("इलाके", question)


if __name__ == "__main__":
    unittest.main()
