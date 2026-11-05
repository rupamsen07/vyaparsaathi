import json
from pathlib import Path
from typing import Any

from app.core.city_planner import calculate_market_gap


CITY_DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "city_market_sample.json"


def load_city_market_data(city: str) -> dict[str, Any]:
    with CITY_DATA_FILE.open("r", encoding="utf-8") as data_file:
        cities = json.load(data_file)
    if city not in cities:
        raise ValueError(f"No city data is configured for {city}")

    data = cities[city]
    samples = []
    for sample in data["market_samples"]:
        samples.append({
            **sample,
            **calculate_market_gap(
                sample["places_found"],
                sample["population"],
                sample["city_median_places_per_10000"],
            ),
        })
    return {
        "city": city,
        "areas": data["areas"],
        "map_available": data["map_available"],
        "market_samples": samples,
        "rush_samples": data["rush_samples"],
        "confidence": "Sample data" if samples or data["rush_samples"] else "No city data loaded",
    }
