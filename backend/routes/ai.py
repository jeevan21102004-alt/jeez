from __future__ import annotations

from fastapi import APIRouter, File, UploadFile

from backend.services.claude_service import analyze_food_image

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/analyze-food-image")
async def analyze_image(file: UploadFile = File(...)):
    image = await file.read()
    result = analyze_food_image(image, mime_type=file.content_type or "image/jpeg")
    return result
