from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.exercise_log import ExerciseLog
from backend.models.food_log import WaterLog, WeightLog

router = APIRouter(prefix="/logs", tags=["logs"])


MET_VALUES = {
    "Walking": 3.5,
    "Running": 9.8,
    "Cycling": 7.5,
    "HIIT": 10.5,
    "Yoga": 2.8,
    "Swimming": 8.0,
    "Jump Rope": 11.0,
    "Rowing": 7.0,
    "Elliptical": 5.0,
    "Stair Climbing": 9.0,
    "Dancing": 5.5,
    "Hiking": 6.0,
    "Boxing": 9.5,
    "Pilates": 3.0,
    "Tennis": 7.3,
    "Basketball": 6.5,
    "Soccer": 7.0,
}


class CardioPayload(BaseModel):
    name: str
    duration_min: int
    weight_kg: float
    logged_on: date


class StrengthPayload(BaseModel):
    name: str
    sets: int
    reps: int
    weight_kg: float
    estimated_minutes: int
    logged_on: date


class WeightPayload(BaseModel):
    weight_kg: float
    logged_on: date


class WaterPayload(BaseModel):
    glasses: int
    logged_on: date


@router.post("/exercise/cardio")
def log_cardio(payload: CardioPayload, db: Session = Depends(get_db)):
    met = MET_VALUES.get(payload.name, 6.0)
    calories = (met * 3.5 * payload.weight_kg / 200) * payload.duration_min
    row = ExerciseLog(
        exercise_type="cardio",
        name=payload.name,
        duration_min=payload.duration_min,
        calories_burned=round(calories, 1),
        met=met,
        logged_on=payload.logged_on,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.post("/exercise/strength")
def log_strength(payload: StrengthPayload, db: Session = Depends(get_db)):
    calories = max(50, payload.estimated_minutes * 6)
    row = ExerciseLog(
        exercise_type="strength",
        name=payload.name,
        sets=payload.sets,
        reps=payload.reps,
        weight_kg=payload.weight_kg,
        duration_min=payload.estimated_minutes,
        calories_burned=float(calories),
        logged_on=payload.logged_on,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/exercise")
def get_exercise_logs(on: date | None = None, db: Session = Depends(get_db)):
    q = db.query(ExerciseLog)
    if on:
        q = q.filter(ExerciseLog.logged_on == on)
    return q.order_by(ExerciseLog.created_at.desc()).all()


@router.delete("/exercise/{log_id}")
def delete_exercise(log_id: int, db: Session = Depends(get_db)):
    entry = db.query(ExerciseLog).filter(ExerciseLog.id == log_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Exercise log not found")
    db.delete(entry)
    db.commit()
    return {"deleted": log_id}


@router.get("/exercise/types")
def exercise_types():
    """Return available exercise types with MET values."""
    cardio = [{"name": name, "met": met} for name, met in MET_VALUES.items()]
    strength = [
        "Bench Press", "Squats", "Deadlift", "Overhead Press",
        "Barbell Row", "Bicep Curls", "Tricep Dips", "Leg Press",
        "Lat Pulldown", "Lunges", "Pull-ups", "Cable Flyes",
        "Calf Raises", "Plank", "Shoulder Press", "Chest Fly",
        "Hammer Curls", "Leg Curls", "Leg Extensions", "Hip Thrusts",
    ]
    return {"cardio": cardio, "strength": strength}


@router.post("/weight")
def log_weight(payload: WeightPayload, db: Session = Depends(get_db)):
    # Upsert: update if same date exists
    existing = db.query(WeightLog).filter(WeightLog.logged_on == payload.logged_on).first()
    if existing:
        existing.weight_kg = payload.weight_kg
        db.commit()
        db.refresh(existing)
        return existing
    row = WeightLog(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/weight")
def get_weight_logs(db: Session = Depends(get_db)):
    return db.query(WeightLog).order_by(WeightLog.logged_on.asc()).all()


@router.post("/water")
def set_water(payload: WaterPayload, db: Session = Depends(get_db)):
    row = db.query(WaterLog).filter(WaterLog.logged_on == payload.logged_on).first()
    if row is None:
        row = WaterLog(**payload.model_dump())
        db.add(row)
    else:
        row.glasses = payload.glasses
    db.commit()
    db.refresh(row)
    return row


@router.get("/water")
def get_water(on: date | None = None, db: Session = Depends(get_db)):
    if on:
        row = db.query(WaterLog).filter(WaterLog.logged_on == on).first()
        if row is None:
            return {"glasses": 0, "logged_on": on.isoformat()}
        return row
    return db.query(WaterLog).order_by(WaterLog.logged_on.desc()).all()
