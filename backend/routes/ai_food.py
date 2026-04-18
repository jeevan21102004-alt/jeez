from __future__ import annotations

import json
import os
import re

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from anthropic import Anthropic

router = APIRouter(tags=["ai", "food"])

SYSTEM_PROMPT = """You are a nutrition database expert specializing in global cuisines, especially Indian regional dishes.
Given a dish name and serving weight in grams, return ONLY valid JSON with this exact structure:
{
  "name": string,
  "calories_per_100g": number,
  "protein_per_100g": number,
  "carbs_per_100g": number,
  "fat_per_100g": number,
  "fiber_per_100g": number,
  "common_serving_g": number,
  "cuisine": string,
  "description": string,
  "confidence": "high" | "medium" | "low"
}

Base values on authentic traditional recipes. For Indian dishes use standard South Indian / North Indian preparation methods as appropriate.

You must be especially accurate for these dishes: sambar, rasam, puliyogare, bisibelebath, curd rice, idli, dosa, uttapam, appam, puttu, avial, kootu, pongal, poha, upma, khichdi, dal tadka, rajma, chole, roti, paratha, biryani, korma, pav bhaji, vada pav, dhokla, thepla, undhiyu, pesarattu, gongura, and all other common South and North Indian dishes with region-accurate macro values.

Never guess wildly — if confidence is low, say so in the confidence field. Return only JSON, no markdown, no explanation."""


class AIFoodLookupPayload(BaseModel):
    dish_name: str
    weight_grams: float = 100


@router.post("/food/ai-lookup")
def ai_food_lookup(payload: AIFoodLookupPayload):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Server missing Anthropic API key")

    client = Anthropic(api_key=api_key)

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=500,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": f"Dish: {payload.dish_name}\nServing weight: {payload.weight_grams}g",
                }
            ],
        )

        text = response.content[0].text.strip()
        # Strip markdown fences if present
        match = re.search(r"```(?:json)?\s*({.*})\s*```", text, re.DOTALL)
        if match:
            text = match.group(1)

        ai_data = json.loads(text)

        # Compute actual macros for the requested weight
        factor = payload.weight_grams / 100
        computed = {
            "name": ai_data.get("name", payload.dish_name),
            "calories": round(ai_data["calories_per_100g"] * factor, 1),
            "protein_g": round(ai_data["protein_per_100g"] * factor, 1),
            "carbs_g": round(ai_data["carbs_per_100g"] * factor, 1),
            "fats_g": round(ai_data["fat_per_100g"] * factor, 1),
            "fiber_g": round(ai_data.get("fiber_per_100g", 0) * factor, 1),
            "serving_size": payload.weight_grams,
            "serving_unit": "g",
            "cuisine": ai_data.get("cuisine", ""),
            "description": ai_data.get("description", ""),
            "confidence": ai_data.get("confidence", "medium"),
            "source": "ai",
            # Keep per-100g values for caching
            "calories_per_100g": ai_data["calories_per_100g"],
            "protein_per_100g": ai_data["protein_per_100g"],
            "carbs_per_100g": ai_data["carbs_per_100g"],
            "fat_per_100g": ai_data["fat_per_100g"],
            "fiber_per_100g": ai_data.get("fiber_per_100g", 0),
            "common_serving_g": ai_data.get("common_serving_g", 100),
        }

        return {"status": "success", "data": computed}

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI did not return valid JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
