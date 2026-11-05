import math
from collections.abc import Mapping, Sequence


OPPORTUNITY_WEIGHTS = {
    "demand": 0.25,
    "competition": 0.20,
    "skill": 0.20,
    "budget": 0.15,
    "supply": 0.10,
    "timing": 0.10,
}

WORKING_HOURS = {
    "morning": (6, 12),
    "lunch": (11, 16),
    "evening": (16, 23),
    "full_day": (6, 23),
}


def _nonnegative(value: float, name: str) -> float:
    number = float(value)
    if not math.isfinite(number) or number < 0:
        raise ValueError(f"{name} must be a finite, non-negative number")
    return number


def calculate_unit_cost(
    ingredients: Sequence[Mapping[str, float | str]],
) -> dict[str, float]:
    total = 0.0
    item_costs = []
    for ingredient in ingredients:
        weight = _nonnegative(ingredient["weight_g"], "weight_g")
        if "mandi_price_per_quintal" in ingredient:
            price_per_kg = _nonnegative(
                ingredient["mandi_price_per_quintal"], "mandi_price_per_quintal"
            ) / 100
            item_cost = weight / 1000 * price_per_kg * 1.3
        elif "retail_price_per_kg" in ingredient:
            price_per_kg = _nonnegative(
                ingredient["retail_price_per_kg"], "retail_price_per_kg"
            )
            item_cost = weight / 1000 * price_per_kg
        elif "fixed_cost" in ingredient:
            item_cost = _nonnegative(ingredient["fixed_cost"], "fixed_cost")
        else:
            raise ValueError("Each ingredient needs a mandi, retail, or fixed price")
        total += item_cost
        item_costs.append({
            "name": str(ingredient.get("name", "Ingredient")),
            "cost": round(item_cost, 2),
        })

    return {"unit_cost": round(total, 2), "items": item_costs}


def calculate_financial_plan(
    *,
    selling_price: float,
    unit_cost: float,
    fixed_monthly_cost: float,
    startup_cost: float,
    available_capital: float,
    daily_units: float = 0,
    annual_interest_rate: float = 12,
    loan_term_months: int = 12,
) -> dict[str, float | int | bool | None]:
    selling_price = _nonnegative(selling_price, "selling_price")
    unit_cost = _nonnegative(unit_cost, "unit_cost")
    fixed_monthly_cost = _nonnegative(fixed_monthly_cost, "fixed_monthly_cost")
    startup_cost = _nonnegative(startup_cost, "startup_cost")
    available_capital = _nonnegative(available_capital, "available_capital")
    daily_units = _nonnegative(daily_units, "daily_units")
    annual_interest_rate = _nonnegative(annual_interest_rate, "annual_interest_rate")
    if loan_term_months < 0:
        raise ValueError("loan_term_months must be non-negative")

    margin = selling_price - unit_cost
    break_even_daily_units = (
        math.ceil(fixed_monthly_cost / (margin * 30))
        if margin > 0 and fixed_monthly_cost > 0
        else 0 if margin > 0 else None
    )
    monthly_profit = margin * daily_units * 30 - fixed_monthly_cost
    project_need = startup_cost + fixed_monthly_cost
    funding_gap = max(0.0, project_need - available_capital)
    monthly_rate = annual_interest_rate / 1200
    if funding_gap == 0 or loan_term_months == 0:
        monthly_emi = 0.0
    elif monthly_rate == 0:
        monthly_emi = funding_gap / loan_term_months
    else:
        factor = (1 + monthly_rate) ** loan_term_months
        monthly_emi = funding_gap * monthly_rate * factor / (factor - 1)

    return {
        "selling_price": round(selling_price, 2),
        "unit_cost": round(unit_cost, 2),
        "margin_per_unit": round(margin, 2),
        "margin_percent": round(margin / selling_price * 100, 2) if selling_price else 0.0,
        "break_even_units_per_day": break_even_daily_units,
        "estimated_monthly_profit": round(monthly_profit, 2),
        "startup_cost": round(startup_cost, 2),
        "working_capital": round(fixed_monthly_cost, 2),
        "total_project_need": round(project_need, 2),
        "available_capital": round(available_capital, 2),
        "funding_gap": round(funding_gap, 2),
        "loan_required": funding_gap > 0,
        "annual_interest_rate": round(annual_interest_rate, 2),
        "loan_term_months": loan_term_months,
        "monthly_emi": round(monthly_emi, 2),
    }


def calculate_landed_cost(
    unit_price: float,
    quantity: float,
    transport_cost: float = 0,
    other_charges: float = 0,
) -> float:
    unit_price = _nonnegative(unit_price, "unit_price")
    quantity = _nonnegative(quantity, "quantity")
    transport_cost = _nonnegative(transport_cost, "transport_cost")
    other_charges = _nonnegative(other_charges, "other_charges")
    if quantity == 0:
        raise ValueError("quantity must be greater than zero")
    return round((unit_price * quantity + transport_cost + other_charges) / quantity, 2)


def calculate_market_gap(
    place_count: int,
    population: int,
    city_median_places_per_10000: float,
) -> dict[str, float | str]:
    if place_count < 0 or population <= 0:
        raise ValueError("place_count must be non-negative and population must be positive")
    median = _nonnegative(city_median_places_per_10000, "city_median_places_per_10000")
    places_per_10000 = place_count / population * 10000
    if median == 0:
        gap = 0.0
        label = "insufficient data"
    elif places_per_10000 > median * 1.5:
        gap = 0.0
        label = "crowded"
    else:
        gap = min(1.0, max(0.0, (median - places_per_10000) / median))
        rounded_gap = round(gap * 100)
        label = "big gap" if rounded_gap >= 50 else "some gap" if rounded_gap >= 20 else "normal"
    return {
        "places_per_10000": round(places_per_10000, 2),
        "city_median_places_per_10000": round(median, 2),
        "gap_fraction": round(gap, 3),
        "label": label,
    }


def calculate_opportunity_score(components: Mapping[str, float]) -> dict[str, object]:
    missing = set(OPPORTUNITY_WEIGHTS) - components.keys()
    if missing:
        raise ValueError(f"Missing opportunity score components: {', '.join(sorted(missing))}")
    parts = {
        name: min(100.0, _nonnegative(components[name], name))
        for name in OPPORTUNITY_WEIGHTS
    }
    if any(float(components[name]) > 100 for name in OPPORTUNITY_WEIGHTS):
        raise ValueError("Opportunity score components must be between 0 and 100")
    weighted_parts = {
        name: round(parts[name] * weight, 2)
        for name, weight in OPPORTUNITY_WEIGHTS.items()
    }
    score = round(sum(weighted_parts.values()))
    verdict = "good opportunity" if score >= 65 else "verify first" if score >= 50 else "risky"
    return {
        "score": score,
        "verdict": verdict,
        "components": parts,
        "weights": OPPORTUNITY_WEIGHTS.copy(),
        "weighted_points": weighted_parts,
    }


def find_best_sales_window(
    hourly_rush_index: Mapping[int | str, float],
    working_hours: str,
) -> dict[str, object]:
    if working_hours not in WORKING_HOURS:
        raise ValueError(f"Unsupported working_hours: {working_hours}")
    start_hour, end_hour = WORKING_HOURS[working_hours]
    hourly_index = {
        int(str(hour).split(":", maxsplit=1)[0]): _nonnegative(index, "hourly_rush_index")
        for hour, index in hourly_rush_index.items()
    }
    if not hourly_index:
        raise ValueError("hourly_rush_index cannot be empty")
    if any(index > 100 for index in hourly_index.values()):
        raise ValueError("hourly_rush_index values must be between 0 and 100")
    windows = [
        (hour, [hourly_index.get(candidate) for candidate in range(hour, hour + 3)])
        for hour in range(start_hour, end_hour - 2)
    ]
    complete_windows = [
        (hour, values)
        for hour, values in windows
        if all(value is not None for value in values)
    ]
    if not complete_windows:
        raise ValueError("At least three consecutive hours of rush data are required")
    best_start, best_values = max(complete_windows, key=lambda window: sum(window[1]))
    return {
        "hourly_index": hourly_index,
        "best_start_hour": best_start,
        "best_end_hour": best_start + 3,
        "average_rush_index": round(sum(best_values) / 3),
    }


def estimate_daily_sales(
    people_count: float,
    minutes_counted: float,
    selling_hours: float,
    buying_rate: float = 0.015,
) -> dict[str, float]:
    people_count = _nonnegative(people_count, "people_count")
    minutes_counted = _nonnegative(minutes_counted, "minutes_counted")
    selling_hours = _nonnegative(selling_hours, "selling_hours")
    buying_rate = _nonnegative(buying_rate, "buying_rate")
    if minutes_counted == 0:
        raise ValueError("minutes_counted must be greater than zero")
    if buying_rate > 1:
        raise ValueError("buying_rate must be between 0 and 1")
    people_per_hour = people_count / minutes_counted * 60
    return {
        "people_per_hour": round(people_per_hour, 2),
        "estimated_units_per_day": round(people_per_hour * selling_hours * buying_rate, 2),
        "buying_rate": buying_rate,
    }


def estimate_rent_burden(
    monthly_rent: float,
    estimated_daily_units: float,
    selling_price: float,
) -> dict[str, float | None]:
    rent = _nonnegative(monthly_rent, "monthly_rent")
    daily_units = _nonnegative(estimated_daily_units, "estimated_daily_units")
    price = _nonnegative(selling_price, "selling_price")
    monthly_sales = daily_units * price * 30
    return {
        "monthly_rent": round(rent, 2),
        "estimated_monthly_sales": round(monthly_sales, 2),
        "rent_share_percent": round(rent / monthly_sales * 100, 2) if monthly_sales else None,
    }


def weather_advice(temperature_celsius: float, precipitation_probability: float) -> str:
    temperature = float(temperature_celsius)
    if not math.isfinite(temperature):
        raise ValueError("temperature_celsius must be finite")
    rain_probability = _nonnegative(precipitation_probability, "precipitation_probability")
    if rain_probability > 100:
        raise ValueError("precipitation_probability must be between 0 and 100")
    if rain_probability >= 60:
        return "rain"
    if temperature >= 34:
        return "heat"
    return "normal"


def evaluate_pilot(
    sales_by_day: Sequence[float],
    forecast_units_per_day: float,
    *,
    selling_price: float | None = None,
    unit_cost: float | None = None,
    daily_expenses: Sequence[float] | None = None,
) -> dict[str, float | str | int]:
    if not sales_by_day:
        raise ValueError("At least one pilot day is required")
    sales = [_nonnegative(units, "sales_by_day") for units in sales_by_day]
    forecast = _nonnegative(forecast_units_per_day, "forecast_units_per_day")
    if forecast == 0:
        raise ValueError("forecast_units_per_day must be greater than zero")
    if (selling_price is None) != (unit_cost is None):
        raise ValueError("selling_price and unit_cost must be provided together")
    average = sum(sales) / len(sales)
    ratio = average / forecast
    verdict = "good sign" if ratio >= 1 else "slightly below forecast" if ratio >= 0.7 else "try another spot"
    other_expense_total = 0.0
    if daily_expenses is not None:
        expenses = [_nonnegative(amount, "daily_expenses") for amount in daily_expenses]
        if len(expenses) != len(sales):
            raise ValueError("daily_expenses must match the recorded sales days")
        other_expense_total = sum(expenses)
    result: dict[str, float | str | int] = {
        "days_recorded": len(sales),
        "average_units_per_day": round(average, 2),
        "forecast_units_per_day": round(forecast, 2),
        "forecast_ratio": round(ratio, 2),
        "verdict": verdict,
    }
    if daily_expenses is not None:
        result["other_expenses"] = round(other_expense_total, 2)
    if selling_price is not None and unit_cost is not None:
        price = _nonnegative(selling_price, "selling_price")
        cost = _nonnegative(unit_cost, "unit_cost")
        revenue = sum(sales) * price
        item_cost = sum(sales) * cost
        result["gross_revenue"] = round(revenue, 2)
        result["item_cost"] = round(item_cost, 2)
        result["gross_profit"] = round(revenue - item_cost, 2)
        if daily_expenses is not None:
            result["net_profit"] = round(revenue - item_cost - other_expense_total, 2)
    return result


def label_data_confidence(
    *,
    population: bool,
    trade_licences: bool,
    openstreetmap: bool,
    ground_survey: bool,
    sample_data: bool = False,
) -> dict[str, object]:
    sources = {
        "population": population,
        "trade_licences": trade_licences,
        "openstreetmap": openstreetmap,
        "ground_survey": ground_survey,
    }
    source_count = sum(sources.values())
    label = "Sample data" if sample_data else "High" if source_count >= 3 else "Medium" if source_count == 2 else "Low"
    return {"label": label, "source_count": source_count, "sources": sources}
