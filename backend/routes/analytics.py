from __future__ import annotations

from collections import defaultdict
from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.exercise_log import ExerciseLog
from backend.models.food_log import FoodLog, WaterLog

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/weekly")
def weekly_summary(db: Session = Depends(get_db)):
    today = date.today()
    start = today - timedelta(days=6)

    food_rows = db.query(FoodLog).filter(FoodLog.consumed_on >= start).all()
    ex_rows = db.query(ExerciseLog).filter(ExerciseLog.logged_on >= start).all()

    by_day = defaultdict(lambda: {"calories_in": 0.0, "calories_out": 0.0, "protein": 0.0, "carbs": 0.0, "fats": 0.0})
    for row in food_rows:
        d = row.consumed_on.isoformat()
        by_day[d]["calories_in"] += row.calories
        by_day[d]["protein"] += row.protein_g
        by_day[d]["carbs"] += row.carbs_g
        by_day[d]["fats"] += row.fats_g

    for row in ex_rows:
        d = row.logged_on.isoformat()
        by_day[d]["calories_out"] += row.calories_burned

    out = []
    for i in range(7):
        day = (start + timedelta(days=i)).isoformat()
        obj = by_day[day]
        obj["date"] = day
        obj["net"] = obj["calories_in"] - obj["calories_out"]
        out.append(obj)

    return out


@router.get("/monthly")
def monthly_summary(db: Session = Depends(get_db)):
    """Get 30-day summary data."""
    today = date.today()
    start = today - timedelta(days=29)

    food_rows = db.query(FoodLog).filter(FoodLog.consumed_on >= start).all()
    ex_rows = db.query(ExerciseLog).filter(ExerciseLog.logged_on >= start).all()

    by_day = defaultdict(lambda: {"calories_in": 0.0, "calories_out": 0.0, "protein": 0.0, "carbs": 0.0, "fats": 0.0})
    for row in food_rows:
        d = row.consumed_on.isoformat()
        by_day[d]["calories_in"] += row.calories
        by_day[d]["protein"] += row.protein_g
        by_day[d]["carbs"] += row.carbs_g
        by_day[d]["fats"] += row.fats_g

    for row in ex_rows:
        d = row.logged_on.isoformat()
        by_day[d]["calories_out"] += row.calories_burned

    out = []
    for i in range(30):
        day = (start + timedelta(days=i)).isoformat()
        obj = by_day[day]
        obj["date"] = day
        obj["net"] = obj["calories_in"] - obj["calories_out"]
        out.append(obj)

    return out


@router.get("/streak")
def get_streak(db: Session = Depends(get_db)):
    """Calculate logging streak — consecutive days with food logs ending today or yesterday."""
    today = date.today()
    # Get all dates with food logs, ordered descending
    food_rows = (
        db.query(FoodLog.consumed_on)
        .distinct()
        .order_by(FoodLog.consumed_on.desc())
        .all()
    )
    logged_dates = {row[0] for row in food_rows}

    streak = 0
    # Start from today, or yesterday if no logs today yet
    check = today if today in logged_dates else today - timedelta(days=1)

    while check in logged_dates:
        streak += 1
        check -= timedelta(days=1)

    return {"streak": streak}


@router.get("/insights")
def nutrition_insights(db: Session = Depends(get_db)):
    """Get nutrition insights: averages, best/worst days, meal distribution."""
    today = date.today()
    start = today - timedelta(days=29)

    food_rows = db.query(FoodLog).filter(FoodLog.consumed_on >= start).all()
    ex_rows = db.query(ExerciseLog).filter(ExerciseLog.logged_on >= start).all()

    # Daily calorie totals
    daily_cals = defaultdict(float)
    daily_protein = defaultdict(float)
    daily_carbs = defaultdict(float)
    daily_fats = defaultdict(float)
    meal_cals = defaultdict(float)

    for row in food_rows:
        d = row.consumed_on.isoformat()
        daily_cals[d] += row.calories
        daily_protein[d] += row.protein_g
        daily_carbs[d] += row.carbs_g
        daily_fats[d] += row.fats_g
        meal_cals[row.meal_type] += row.calories

    daily_burned = defaultdict(float)
    for row in ex_rows:
        d = row.logged_on.isoformat()
        daily_burned[d] += row.calories_burned

    # Compute averages
    days_with_data = len(daily_cals)
    if days_with_data == 0:
        return {
            "avg_calories": 0,
            "avg_protein": 0,
            "avg_carbs": 0,
            "avg_fats": 0,
            "avg_burned": 0,
            "best_day": None,
            "worst_day": None,
            "total_entries": 0,
            "total_days_logged": 0,
            "meal_distribution": [],
        }

    avg_cal = sum(daily_cals.values()) / days_with_data
    avg_protein = sum(daily_protein.values()) / days_with_data
    avg_carbs = sum(daily_carbs.values()) / days_with_data
    avg_fats = sum(daily_fats.values()) / days_with_data
    avg_burned = sum(daily_burned.values()) / max(len(daily_burned), 1)

    sorted_days = sorted(daily_cals.items(), key=lambda x: x[1])
    best = sorted_days[0]  # Lowest calorie day
    worst = sorted_days[-1]  # Highest calorie day

    # Meal distribution
    total_meal_cals = sum(meal_cals.values()) or 1
    meal_dist = [
        {"meal": meal, "calories": round(cals, 1), "percentage": round(cals / total_meal_cals * 100, 1)}
        for meal, cals in sorted(meal_cals.items(), key=lambda x: -x[1])
    ]

    # Water stats
    water_rows = db.query(WaterLog).filter(WaterLog.logged_on >= start).all()
    avg_water = sum(r.glasses for r in water_rows) / max(len(water_rows), 1)

    return {
        "avg_calories": round(avg_cal, 1),
        "avg_protein": round(avg_protein, 1),
        "avg_carbs": round(avg_carbs, 1),
        "avg_fats": round(avg_fats, 1),
        "avg_burned": round(avg_burned, 1),
        "avg_water": round(avg_water, 1),
        "best_day": {"date": best[0], "calories": round(best[1], 1)},
        "worst_day": {"date": worst[0], "calories": round(worst[1], 1)},
        "total_entries": len(food_rows),
        "total_days_logged": days_with_data,
        "meal_distribution": meal_dist,
    }


@router.get("/history")
def history(db: Session = Depends(get_db)):
    food_rows = db.query(FoodLog).order_by(FoodLog.consumed_on.desc()).all()
    daily = defaultdict(float)
    for row in food_rows:
        daily[row.consumed_on.isoformat()] += row.calories

    ordered = sorted(daily.items())
    values = [v for _, v in ordered]
    avg = sum(values) / len(values) if values else 0

    best = min(ordered, key=lambda x: x[1]) if ordered else None
    worst = max(ordered, key=lambda x: x[1]) if ordered else None

    return {
        "daily": [{"date": k, "calories": v} for k, v in ordered],
        "average_calories": round(avg, 1),
        "best_day": {"date": best[0], "calories": best[1]} if best else None,
        "worst_day": {"date": worst[0], "calories": worst[1]} if worst else None,
    }


@router.get("/day/{day}")
def day_detail(day: date, db: Session = Depends(get_db)):
    """Get detailed breakdown for a specific day."""
    food_rows = db.query(FoodLog).filter(FoodLog.consumed_on == day).order_by(FoodLog.created_at.desc()).all()
    ex_rows = db.query(ExerciseLog).filter(ExerciseLog.logged_on == day).order_by(ExerciseLog.created_at.desc()).all()
    water = db.query(WaterLog).filter(WaterLog.logged_on == day).first()

    total_cal = sum(r.calories for r in food_rows)
    total_protein = sum(r.protein_g for r in food_rows)
    total_carbs = sum(r.carbs_g for r in food_rows)
    total_fats = sum(r.fats_g for r in food_rows)
    total_burned = sum(r.calories_burned for r in ex_rows)

    # Group by meal type
    by_meal = defaultdict(list)
    for row in food_rows:
        by_meal[row.meal_type].append({
            "id": row.id,
            "food_name": row.food_name,
            "serving_size": row.serving_size,
            "serving_unit": row.serving_unit,
            "calories": row.calories,
            "protein_g": row.protein_g,
            "carbs_g": row.carbs_g,
            "fats_g": row.fats_g,
            "favorite": row.favorite,
        })

    exercises = [
        {
            "id": r.id,
            "exercise_type": r.exercise_type,
            "name": r.name,
            "duration_min": r.duration_min,
            "calories_burned": r.calories_burned,
            "sets": r.sets,
            "reps": r.reps,
            "weight_kg": r.weight_kg,
        }
        for r in ex_rows
    ]

    return {
        "date": day.isoformat(),
        "totals": {
            "calories": round(total_cal, 1),
            "protein": round(total_protein, 1),
            "carbs": round(total_carbs, 1),
            "fats": round(total_fats, 1),
            "burned": round(total_burned, 1),
            "net": round(total_cal - total_burned, 1),
        },
        "meals": dict(by_meal),
        "exercises": exercises,
        "water": water.glasses if water else 0,
    }

@router.delete("/day/{day}")
def reset_day(day: date, db: Session = Depends(get_db)):
    """Clear all data for a specific day without affecting other days."""
    # 1. Delete FoodLogs
    db.query(FoodLog).filter(FoodLog.consumed_on == day).delete()
    
    # 2. Delete ExerciseLogs
    db.query(ExerciseLog).filter(ExerciseLog.logged_on == day).delete()
    
    # 3. Reset WaterLog
    db.query(WaterLog).filter(WaterLog.logged_on == day).delete()
    
    db.commit()
    return {"status": "success", "message": f"Data for {day.isoformat()} has been reset."}
