import json
import os
import re

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from anthropic import Anthropic

router = APIRouter(prefix="/analyze-body", tags=["ai", "vision"])

class BodyImagePayload(BaseModel):
    image_base64: str
    media_type: str

@router.post("")
def analyze_body(payload: BodyImagePayload):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Server missing Anthropic API key")

    client = Anthropic(api_key=api_key)
    
    # Strip any potential data URL prefix if sent from frontend
    base64_data = payload.image_base64
    if "," in base64_data:
        base64_data = base64_data.split(",")[1]

    prompt_text = (
        "You are a fitness assessment AI. Analyze the photo and return ONLY valid JSON with keys: "
        "bf_estimate_low, bf_estimate_high, muscle_estimate, physique_type (Ectomorph/Mesomorph/Endomorph/Mixed), "
        "visible_definition (None/Slight/Moderate/High/Very high), confidence (Low/Medium/High), "
        "notes (2-3 sentence honest assessment). Give realistic ranges not exact numbers. Never claim medical accuracy."
    )

    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=400,
            system=prompt_text,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": payload.media_type,
                                "data": base64_data,
                            },
                        },
                        {
                            "type": "text",
                            "text": "Analyze this photo and provide the strictly requested JSON."
                        }
                    ],
                }
            ],
        )

        # Extract text and strip markdown fences if present
        text = response.content[0].text
        json_str = text.strip()
        # Regex to pull JSON from markdown codeblock if the model accidentally included it
        match = re.search(r"```(?:json)?\s*({.*})\s*```", json_str, re.DOTALL)
        if match:
            json_str = match.group(1)
        
        parsed_data = json.loads(json_str)
        return {"status": "success", "data": parsed_data}

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail="AI did not return valid JSON format.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
