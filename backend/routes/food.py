from __future__ import annotations

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.food_database import FoodItem
from backend.models.food_log import FoodLog
from backend.services.nutrition_service import search_foods

router = APIRouter(prefix="/food", tags=["food"])


class FoodLogPayload(BaseModel):
    meal_type: str
    food_name: str
    serving_size: float = 1
    serving_unit: str = "g"
    calories: float
    protein_g: float = 0
    carbs_g: float = 0
    fats_g: float = 0
    favorite: bool = False
    consumed_on: date


@router.get("/search")
def food_search(q: str = Query("", min_length=1), db: Session = Depends(get_db)):
    """Search local food database first, then Open Food Facts, then fall back to AI."""
    import json
    import os
    import re

    # Search local database
    pattern = f"%{q}%"
    local_results = (
        db.query(FoodItem)
        .filter(
            or_(
                FoodItem.name.ilike(pattern),
                FoodItem.brand.ilike(pattern),
                FoodItem.category.ilike(pattern),
            )
        )
        .limit(20)
        .all()
    )

    if local_results:
        items = []
        for r in local_results:
            items.append({
                "name": r.name,
                "brand": r.brand or "",
                "category": r.category,
                "calories": r.calories,
                "protein_g": r.protein_g,
                "carbs_g": r.carbs_g,
                "fats_g": r.fats_g,
                "fiber_g": r.fiber_g,
                "sugar_g": r.sugar_g,
                "sodium_mg": r.sodium_mg,
                "serving_size": r.serving_size,
                "serving_unit": r.serving_unit,
                "source": getattr(r, 'source', 'database') or "database",
            })
        return items

    # Fall back to Open Food Facts
    try:
        off_results = search_foods(q)
        if off_results:
            return off_results
    except Exception:
        pass

    # Final fallback: AI lookup via Anthropic
    try:
        from anthropic import Anthropic

        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            return []

        client = Anthropic(api_key=api_key)
        system_prompt = (
            "You are a nutrition database expert specializing in global cuisines, especially Indian regional dishes. "
            "Given a dish name, return ONLY valid JSON with keys: name, calories_per_100g, protein_per_100g, "
            "carbs_per_100g, fat_per_100g, fiber_per_100g, common_serving_g, cuisine, description, "
            'confidence ("high"|"medium"|"low"). Base values on authentic traditional recipes. '
            "Return only JSON, no markdown."
        )
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=400,
            system=system_prompt,
            messages=[{"role": "user", "content": f"Dish: {q}"}],
        )
        text = response.content[0].text.strip()
        match = re.search(r"```(?:json)?\s*({.*})\s*```", text, re.DOTALL)
        if match:
            text = match.group(1)

        ai_data = json.loads(text)
        serving = ai_data.get("common_serving_g", 100)
        factor = serving / 100

        # Cache into food_items table
        cached = FoodItem(
            name=ai_data.get("name", q),
            brand="",
            category=ai_data.get("cuisine", "AI Generated"),
            calories=round(ai_data["calories_per_100g"] * factor, 1),
            protein_g=round(ai_data["protein_per_100g"] * factor, 1),
            carbs_g=round(ai_data["carbs_per_100g"] * factor, 1),
            fats_g=round(ai_data.get("fat_per_100g", 0) * factor, 1),
            fiber_g=round(ai_data.get("fiber_per_100g", 0) * factor, 1),
            sugar_g=0,
            sodium_mg=0,
            serving_size=serving,
            serving_unit="g",
            source="ai_generated",
        )
        db.add(cached)
        db.commit()

        return [{
            "name": cached.name,
            "brand": "",
            "category": cached.category,
            "calories": cached.calories,
            "protein_g": cached.protein_g,
            "carbs_g": cached.carbs_g,
            "fats_g": cached.fats_g,
            "fiber_g": cached.fiber_g,
            "sugar_g": 0,
            "sodium_mg": 0,
            "serving_size": cached.serving_size,
            "serving_unit": "g",
            "source": "ai",
            "confidence": ai_data.get("confidence", "medium"),
            "description": ai_data.get("description", ""),
        }]
    except Exception:
        return []


@router.get("/categories")
def food_categories(db: Session = Depends(get_db)):
    """Get all food categories with counts."""
    from sqlalchemy import func

    rows = db.query(FoodItem.category, func.count(FoodItem.id)).group_by(FoodItem.category).all()
    return [{"category": cat, "count": cnt} for cat, cnt in rows]


@router.get("/by-category")
def foods_by_category(category: str = Query(...), db: Session = Depends(get_db)):
    """Get all foods in a specific category."""
    items = db.query(FoodItem).filter(FoodItem.category == category).order_by(FoodItem.name).all()
    return [
        {
            "name": r.name,
            "brand": r.brand or "",
            "category": r.category,
            "calories": r.calories,
            "protein_g": r.protein_g,
            "carbs_g": r.carbs_g,
            "fats_g": r.fats_g,
            "serving_size": r.serving_size,
            "serving_unit": r.serving_unit,
        }
        for r in items
    ]


@router.post("/log")
def create_food_log(payload: FoodLogPayload, db: Session = Depends(get_db)):
    entry = FoodLog(**payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/logs")
def get_food_logs(on: date | None = None, db: Session = Depends(get_db)):
    query = db.query(FoodLog)
    if on:
        query = query.filter(FoodLog.consumed_on == on)
    return query.order_by(FoodLog.created_at.desc()).all()


@router.delete("/log/{log_id}")
def delete_food_log(log_id: int, db: Session = Depends(get_db)):
    entry = db.query(FoodLog).filter(FoodLog.id == log_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Food log not found")
    db.delete(entry)
    db.commit()
    return {"deleted": log_id}


@router.patch("/log/{log_id}/favorite")
def toggle_favorite(log_id: int, db: Session = Depends(get_db)):
    entry = db.query(FoodLog).filter(FoodLog.id == log_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Food log not found")
    entry.favorite = not entry.favorite
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/recent")
def recent_foods(db: Session = Depends(get_db)):
    rows = db.query(FoodLog).order_by(FoodLog.created_at.desc()).limit(10).all()
    return rows


@router.get("/favorites")
def favorite_foods(db: Session = Depends(get_db)):
    rows = db.query(FoodLog).filter(FoodLog.favorite.is_(True)).order_by(FoodLog.created_at.desc()).all()
    return rows
