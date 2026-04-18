from __future__ import annotations

import base64
import json
import os
from typing import Any

SYSTEM_PROMPT = """
You are CalAI Vision Nutrition Engine. Analyze food images and estimate nutrition.
Always return strict JSON with this schema:
{
  "food_items": [
    {
      "name": "string",
      "estimated_weight_g": number,
      "calories": number,
      "protein_g": number,
      "carbs_g": number,
      "fats_g": number
    }
  ],
  "total_calories": number,
  "confidence": "low|medium|high",
  "notes": "string"
}
No markdown, no extra text.
""".strip()


def analyze_food_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict[str, Any]:
    api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        return {
            "food_items": [
                {
                    "name": "Estimated Mixed Meal",
                    "estimated_weight_g": 300,
                    "calories": 520,
                    "protein_g": 25,
                    "carbs_g": 52,
                    "fats_g": 20,
                }
            ],
            "total_calories": 520,
            "confidence": "low",
            "notes": "Set ANTHROPIC_API_KEY to enable Claude vision analysis.",
        }

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1200,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": mime_type,
                                "data": image_b64,
                            },
                        },
                        {
                            "type": "text",
                            "text": "Analyze this meal photo and return nutrition estimate JSON.",
                        },
                    ],
                }
            ],
        )

        text_out = "".join(
            part.text for part in message.content if hasattr(part, "text")
        ).strip()
        return json.loads(text_out)
    except Exception as exc:
        return {
            "food_items": [],
            "total_calories": 0,
            "confidence": "low",
            "notes": f"Analysis failed: {exc}",
        }
