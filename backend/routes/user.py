from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.user import UserProfile
from backend.services.calculator_service import (
    calculate_bmi,
    calculate_bmr,
    calculate_tdee,
    calorie_goal_for_target,
    default_macros,
)

router = APIRouter(prefix="/user", tags=["user"])


class OnboardingPayload(BaseModel):
    name: str
    age: int
    gender: str
    height_cm: float | None = None
    weight_kg: float | None = None
    heightCm: float | None = None
    weightKg: float | None = None
    goal: str
    activity_level: str | None = None
    activityLevel: str | None = None
    target_weight_kg: float | None = None
    targetWeightKg: float | None = None
    timeline_weeks: int | None = None
    timelineWeeks: int | None = None
    body_fat_pct: float | None = None
    muscle_mass_pct: float | None = None
    target_body_fat_pct: float | None = None
    target_muscle_mass_pct: float | None = None


@router.get("/profile")
def get_profile(db: Session = Depends(get_db)):
    profile = db.query(UserProfile).order_by(UserProfile.id.desc()).first()
    if not profile:
        return None
    return profile


@router.post("/onboarding")
def complete_onboarding(payload: OnboardingPayload, db: Session = Depends(get_db)):
    # Accept both camelCase and snake_case field names from frontend
    height = payload.height_cm or payload.heightCm or 170
    weight = payload.weight_kg or payload.weightKg or 70
    activity = payload.activity_level or payload.activityLevel or "Moderately Active"
    target_weight = payload.target_weight_kg or payload.targetWeightKg
    timeline = payload.timeline_weeks or payload.timelineWeeks

    bmi, bmi_category = calculate_bmi(weight, height)
    bmr = calculate_bmr(weight, height, payload.age, payload.gender)
    tdee = calculate_tdee(bmr, activity)
    calorie_goal = calorie_goal_for_target(tdee, payload.goal)
    macros = default_macros(payload.goal, calorie_goal)

    profile = db.query(UserProfile).order_by(UserProfile.id.desc()).first()
    if profile is None:
        profile = UserProfile(
            name=payload.name,
            age=payload.age,
            gender=payload.gender,
            height_cm=height,
            weight_kg=weight,
            target_weight_kg=target_weight,
            timeline_weeks=timeline,
            goal=payload.goal,
            activity_level=activity,
            calorie_goal=calorie_goal,
            protein_g=macros["protein_g"],
            carbs_g=macros["carbs_g"],
            fats_g=macros["fats_g"],
            body_fat_pct=payload.body_fat_pct,
            muscle_mass_pct=payload.muscle_mass_pct,
            target_body_fat_pct=payload.target_body_fat_pct,
            target_muscle_mass_pct=payload.target_muscle_mass_pct,
        )
        db.add(profile)
    else:
        profile.name = payload.name
        profile.age = payload.age
        profile.gender = payload.gender
        profile.height_cm = height
        profile.weight_kg = weight
        profile.target_weight_kg = target_weight
        profile.timeline_weeks = timeline
        profile.goal = payload.goal
        profile.activity_level = activity
        profile.calorie_goal = calorie_goal
        profile.protein_g = macros["protein_g"]
        profile.carbs_g = macros["carbs_g"]
        profile.fats_g = macros["fats_g"]
        if payload.body_fat_pct is not None:
            profile.body_fat_pct = payload.body_fat_pct
        if payload.muscle_mass_pct is not None:
            profile.muscle_mass_pct = payload.muscle_mass_pct
        if payload.target_body_fat_pct is not None:
            profile.target_body_fat_pct = payload.target_body_fat_pct
        if payload.target_muscle_mass_pct is not None:
            profile.target_muscle_mass_pct = payload.target_muscle_mass_pct

    db.commit()
    db.refresh(profile)

    return {
        "profile": profile,
        "calculations": {
            "bmi": bmi,
            "bmi_category": bmi_category,
            "bmr": round(bmr),
            "tdee": round(tdee),
            "daily_calorie_goal": calorie_goal,
            "macro_split": macros,
        },
    }


class SettingsPayload(BaseModel):
    name: str | None = None
    calorie_goal: int | None = None
    protein_g: int | None = None
    carbs_g: int | None = None
    fats_g: int | None = None
    units: str | None = None
    theme: str | None = None
    water_goal_glasses: int | None = None
    age: int | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    goal: str | None = None
    activity_level: str | None = None
    body_fat_pct: float | None = None
    muscle_mass_pct: float | None = None
    target_body_fat_pct: float | None = None
    target_muscle_mass_pct: float | None = None


@router.put("/settings")
def update_settings(payload: SettingsPayload, db: Session = Depends(get_db)):
    profile = db.query(UserProfile).order_by(UserProfile.id.desc()).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    for key, value in payload.model_dump(exclude_none=True).items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile


@router.post("/reset")
def reset_onboarding(db: Session = Depends(get_db)):
    """Delete all user profiles to allow re-onboarding."""
    db.query(UserProfile).delete()
    db.commit()
    return {"status": "reset"}
