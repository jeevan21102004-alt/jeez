from __future__ import annotations

from sqlalchemy import Column, Date, DateTime, Float, Integer, String
from sqlalchemy.sql import func

from backend.database import Base


class ExerciseLog(Base):
    __tablename__ = "exercise_logs"

    id = Column(Integer, primary_key=True, index=True)
    exercise_type = Column(String, nullable=False)  # cardio | strength
    name = Column(String, nullable=False)
    duration_min = Column(Integer, nullable=True)
    calories_burned = Column(Float, nullable=False, default=0)
    sets = Column(Integer, nullable=True)
    reps = Column(Integer, nullable=True)
    weight_kg = Column(Float, nullable=True)
    met = Column(Float, nullable=True)
    logged_on = Column(Date, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
