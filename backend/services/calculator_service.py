from __future__ import annotations

from typing import Literal


def calculate_bmi(weight_kg: float, height_cm: float) -> tuple[float, str]:
    m = height_cm / 100.0
    bmi = weight_kg / (m * m)
    if bmi < 18.5:
        cat = "Underweight"
    elif bmi < 25:
        cat = "Normal"
    elif bmi < 30:
        cat = "Overweight"
    else:
        cat = "Obese"
    return round(bmi, 1), cat


def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> float:
    base = (10 * weight_kg) + (6.25 * height_cm) - (5 * age)
    return base + 5 if gender.lower() == "male" else base - 161


ACTIVITY_MAP = {
    "Sedentary": 1.2,
    "Lightly Active": 1.375,
    "Moderately Active": 1.55,
    "Very Active": 1.725,
    "Athlete": 1.9,
}


def calculate_tdee(bmr: float, activity_level: str) -> float:
    return bmr * ACTIVITY_MAP.get(activity_level, 1.2)


def calorie_goal_for_target(tdee: float, goal: str) -> int:
    if goal == "Lose Weight":
        return int(tdee - 500)
    if goal == "Gain Muscle":
        return int(tdee + 250)
    if goal == "Bulk":
        return int(tdee + 450)
    return int(tdee)


def default_macros(goal: str, calories: int) -> dict[str, int]:
    if goal == "Lose Weight":
        p, c, f = 0.35, 0.35, 0.30
    elif goal == "Gain Muscle":
        p, c, f = 0.30, 0.45, 0.25
    elif goal == "Bulk":
        p, c, f = 0.25, 0.50, 0.25
    else:
        p, c, f = 0.30, 0.40, 0.30

    protein_g = int((calories * p) / 4)
    carbs_g = int((calories * c) / 4)
    fats_g = int((calories * f) / 9)
    return {"protein_g": protein_g, "carbs_g": carbs_g, "fats_g": fats_g}
