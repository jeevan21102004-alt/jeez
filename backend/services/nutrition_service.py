from __future__ import annotations

from typing import Any

import requests


def search_foods(query: str) -> list[dict[str, Any]]:
    if not query.strip():
        return []

    url = "https://world.openfoodfacts.org/cgi/search.pl"
    params = {
        "search_terms": query,
        "search_simple": 1,
        "action": "process",
        "json": 1,
        "page_size": 15,
    }

    response = requests.get(url, params=params, timeout=3)
    response.raise_for_status()
    products = response.json().get("products", [])

    items: list[dict[str, Any]] = []
    for p in products:
        nutr = p.get("nutriments", {})
        items.append(
            {
                "name": p.get("product_name") or p.get("generic_name") or "Unknown",
                "brand": p.get("brands", ""),
                "calories": nutr.get("energy-kcal_100g", 0),
                "protein_g": nutr.get("proteins_100g", 0),
                "carbs_g": nutr.get("carbohydrates_100g", 0),
                "fats_g": nutr.get("fat_100g", 0),
                "serving_size": 100,
                "serving_unit": "g",
                "barcode": p.get("code"),
            }
        )
    return items
