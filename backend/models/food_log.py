from __future__ import annotations

from sqlalchemy import Boolean, Column, Date, DateTime, Float, Integer, String
from sqlalchemy.sql import func

from backend.database import Base


class FoodLog(Base):
    __tablename__ = "food_logs"

    id = Column(Integer, primary_key=True, index=True)
    meal_type = Column(String, nullable=False, index=True)
    food_name = Column(String, nullable=False)
    serving_size = Column(Float, nullable=False, default=1)
    serving_unit = Column(String, nullable=False, default="g")
    calories = Column(Float, nullable=False)
    protein_g = Column(Float, nullable=False, default=0)
    carbs_g = Column(Float, nullable=False, default=0)
    fats_g = Column(Float, nullable=False, default=0)
    favorite = Column(Boolean, nullable=False, default=False)
    consumed_on = Column(Date, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class WeightLog(Base):
    __tablename__ = "weight_logs"

    id = Column(Integer, primary_key=True, index=True)
    weight_kg = Column(Float, nullable=False)
    logged_on = Column(Date, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class WaterLog(Base):
    __tablename__ = "water_logs"

    id = Column(Integer, primary_key=True, index=True)
    glasses = Column(Integer, nullable=False, default=0)
    logged_on = Column(Date, nullable=False, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
