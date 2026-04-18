from __future__ import annotations

from sqlalchemy import Column, DateTime, Float, Integer, String
from sqlalchemy.sql import func

from backend.database import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    height_cm = Column(Float, nullable=False)
    weight_kg = Column(Float, nullable=False)
    target_weight_kg = Column(Float, nullable=True)
    timeline_weeks = Column(Integer, nullable=True)
    goal = Column(String, nullable=False)
    activity_level = Column(String, nullable=False)
    calorie_goal = Column(Integer, nullable=False, default=2000)
    protein_g = Column(Integer, nullable=False, default=120)
    carbs_g = Column(Integer, nullable=False, default=220)
    fats_g = Column(Integer, nullable=False, default=70)
    water_goal_glasses = Column(Integer, nullable=False, default=8)
    units = Column(String, nullable=False, default="metric")
    theme = Column(String, nullable=False, default="dark")
    body_fat_pct = Column(Float, nullable=True)
    muscle_mass_pct = Column(Float, nullable=True)
    target_body_fat_pct = Column(Float, nullable=True)
    target_muscle_mass_pct = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
