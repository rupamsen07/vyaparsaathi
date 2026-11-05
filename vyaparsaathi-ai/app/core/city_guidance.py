import json
from pathlib import Path
from typing import Any, Sequence


SCHEMES_FILE = Path(__file__).resolve().parents[1] / "data" / "city_schemes.json"

LICENCE_TEMPLATES = (
    {
        "id": "fssai_basic",
        "name": "FSSAI basic registration",
        "applies_to": ["mobile", "fixed", "home", "food"],
        "where": "FoSCoS food licensing portal",
        "official_url": "https://foscos.fssai.gov.in/",
        "note": "For food businesses. Confirm the right registration for your activity.",
    },
    {
        "id": "street_vending_certificate",
        "name": "Street vending certificate / ID",
        "applies_to": ["mobile"],
        "where": "Town Vending Committee through the city office",
        "official_url": None,
        "note": "Vending is allowed only in notified vending zones. Confirm the zone with the city office.",
    },
    {
        "id": "shop_establishment",
        "name": "Shop and establishment registration",
        "applies_to": ["fixed"],
        "where": "State labour portal",
        "official_url": None,
        "note": "Check the rules for your state and business premises.",
    },
    {
        "id": "city_trade_licence",
        "name": "City trade licence",
        "applies_to": ["fixed"],
        "where": "Municipal corporation / city portal",
        "official_url": None,
        "note": "Requirements vary by trade and city. Confirm with the local authority.",
    },
    {
        "id": "udyam_registration",
        "name": "Udyam registration",
        "applies_to": ["mobile", "fixed", "home"],
        "where": "Government of India Udyam portal",
        "official_url": "https://udyamregistration.gov.in/",
        "note": "The official portal describes Udyam registration as free. Avoid third-party fee-charging sites.",
    },
)

FOOD_BUSINESS_IDS = {
    "momo_cart",
    "chai_snacks_cart",
    "vada_pav_cart",
    "fresh_juice_cart",
    "home_tiffin",
    "home_pickles_papad",
}


def match_city_schemes(
    *,
    business_model: str,
    funding_gap: float,
    wants_loan: bool,
    special_categories: Sequence[str] = (),
) -> list[dict[str, Any]]:
    gap = float(funding_gap)
    if gap < 0:
        raise ValueError("funding_gap must be non-negative")
    if not wants_loan or gap == 0:
        return []

    with SCHEMES_FILE.open("r", encoding="utf-8") as schemes_file:
        schemes = json.load(schemes_file)

    user_categories = set(special_categories)
    matches = []
    for scheme in schemes:
        if business_model not in scheme["business_models"]:
            continue
        if scheme["required_categories"] and not user_categories.intersection(
            scheme["required_categories"]
        ):
            continue
        minimum_amount = scheme.get("minimum_amount", 0)
        if gap < minimum_amount:
            continue

        maximum_amount = scheme["maximum_amount"]
        model_match = 1
        common_match = int(scheme["commonly_used"])
        covers_gap = maximum_amount >= gap
        partial_cover = 0 < maximum_amount < gap
        score = min(
            95,
            50 * model_match
            + 20 * common_match
            + 20 * int(covers_gap)
            + 5 * int(partial_cover)
            + 10,
        )
        if score < 50:
            continue
        reasons = [
            f"Supports the {business_model} business model.",
            "Commonly used for small-business financing." if common_match else "Check the scheme's business scope.",
        ]
        if covers_gap:
            reasons.append("The listed amount can cover this funding gap.")
        elif partial_cover:
            reasons.append("The listed amount can cover part of this funding gap.")
        matches.append({
            **scheme,
            "match_percent": score,
            "match_label": "Preliminary match",
            "reasons": reasons,
            "final_decision_by": "Bank or government office",
            "verify_before_applying": True,
        })
    return sorted(matches, key=lambda match: (-match["match_percent"], match["name"]))


def licence_checklist(business_id: str, business_model: str) -> list[dict[str, Any]]:
    if business_model not in {"mobile", "fixed", "home"}:
        raise ValueError("business_model must be mobile, fixed, or home")
    is_food_business = business_id in FOOD_BUSINESS_IDS
    return [
        {
            **licence,
            "required": (
                business_model in licence["applies_to"]
                and ("food" not in licence["applies_to"] or is_food_business)
            ),
        }
        for licence in LICENCE_TEMPLATES
        if business_model in licence["applies_to"]
        and ("food" not in licence["applies_to"] or is_food_business)
    ]
