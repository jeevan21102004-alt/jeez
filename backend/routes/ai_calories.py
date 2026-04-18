from __future__ import annotations

import base64
import json
import os
import re
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException, Request
from openai import OpenAI

router = APIRouter(tags=["ai", "calories"])

EXTRACTION_PROMPT = """Extract food items and quantities from the input. Recognize Indian dishes. Return JSON in this format:
{
items: [
{ name: string, quantity: number }
]
}"""

NORMALIZATION_MAP = {
    "dosa": "masala dosa",
    "roti": "chapati",
    "sabzi": "mixed vegetable curry",
}

FOOD_DB_PATH = Path(__file__).resolve().parents[2] / "ai-agent" / "foodDatabase.json"


def _load_food_database() -> dict[str, float]:
    if not FOOD_DB_PATH.exists():
        return {}

    with FOOD_DB_PATH.open("r", encoding="utf-8") as fp:
        data = json.load(fp)

    return {str(k).strip().lower(): float(v) for k, v in data.items()}


def _normalize_name(name: str) -> str:
    normalized = str(name or "").strip().lower()
    return NORMALIZATION_MAP.get(normalized, normalized)


def _parse_ai_json(raw_text: str) -> dict[str, Any]:
    if not raw_text:
        return {"items": []}

    fenced = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw_text, re.IGNORECASE)
    candidate = fenced.group(1) if fenced else raw_text

    try:
        parsed = json.loads(candidate)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=500, detail="AI did not return valid JSON") from exc

    items = parsed.get("items", [])
    if not isinstance(items, list):
        return {"items": []}

    normalized_items = []
    for item in items:
        if not isinstance(item, dict):
            continue

        raw_name = str(item.get("name", "")).strip().lower()
        if not raw_name:
            continue

        try:
            quantity = float(item.get("quantity", 1))
        except (TypeError, ValueError):
            quantity = 1

        if quantity <= 0:
            quantity = 1

        normalized_items.append({"name": raw_name, "quantity": quantity})

    return {"items": normalized_items}


def _extract_food_items(text: str | None, image_bytes: bytes | None, mime_type: str) -> dict[str, Any]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Server missing OpenAI API key")

    if not text and not image_bytes:
        raise HTTPException(status_code=400, detail="Provide either text input or an image")

    client = OpenAI(api_key=api_key)

    user_content: list[dict[str, Any]] = [
        {
            "type": "text",
            "text": f"{EXTRACTION_PROMPT}\nDefault quantity = 1 when not specified.",
        }
    ]

    if text:
        user_content.append({"type": "text", "text": f"Input text: {text}"})

    if image_bytes:
        encoded = base64.b64encode(image_bytes).decode("utf-8")
        user_content.append(
            {
                "type": "image_url",
                "image_url": {"url": f"data:{mime_type};base64,{encoded}"},
            }
        )

    try:
        completion = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "user", "content": user_content}],
            temperature=0.2,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"OpenAI request failed: {str(exc)}") from exc

    content = completion.choices[0].message.content if completion.choices else ""
    return _parse_ai_json(content or "")


def _calculate_calories(items: list[dict[str, Any]]) -> dict[str, Any]:
    db = _load_food_database()
    result_items: list[dict[str, Any]] = []
    total = 0

    for item in items:
        quantity = item.get("quantity", 1)
        if isinstance(quantity, float) and quantity.is_integer():
            quantity = int(quantity)

        normalized_name = _normalize_name(str(item.get("name", "")))
        per_item_calories = db.get(normalized_name)

        if per_item_calories is None:
            result_items.append(
                {
                    "name": normalized_name,
                    "quantity": quantity,
                    "calories": None,
                    "message": "Food not found in database",
                }
            )
            continue

        calories = round(per_item_calories * float(item.get("quantity", 1)))
        total += calories

        result_items.append(
            {
                "name": normalized_name,
                "quantity": quantity,
                "calories": calories,
            }
        )

    return {
        "items": result_items,
        "totalCalories": total,
    }


@router.post("/ai-calories")
async def analyze_food(request: Request):
    content_type = request.headers.get("content-type", "")

    text_input: str | None = None
    image_bytes: bytes | None = None
    mime_type = "image/jpeg"

    if "application/json" in content_type:
        payload = await request.json()
        if not isinstance(payload, dict):
            raise HTTPException(status_code=400, detail="Invalid JSON payload")
        text_input = payload.get("text") or payload.get("input") or payload.get("message")
    elif "multipart/form-data" in content_type:
        form = await request.form()
        text_input = form.get("text") or form.get("input") or form.get("message")
        uploaded_file = form.get("file")
        if uploaded_file is not None and hasattr(uploaded_file, "read"):
            image_bytes = await uploaded_file.read()
            mime_type = getattr(uploaded_file, "content_type", "image/jpeg") or "image/jpeg"
    else:
        raise HTTPException(status_code=415, detail="Use application/json or multipart/form-data")

    extracted = _extract_food_items(
        text=str(text_input).strip() if text_input else None,
        image_bytes=image_bytes,
        mime_type=mime_type,
    )

    return _calculate_calories(extracted.get("items", []))
