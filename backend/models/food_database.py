from __future__ import annotations

from sqlalchemy import Column, Float, Integer, String

from backend.database import Base


class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    brand = Column(String, nullable=True, default="")
    category = Column(String, nullable=False, index=True)
    calories = Column(Float, nullable=False, default=0)
    protein_g = Column(Float, nullable=False, default=0)
    carbs_g = Column(Float, nullable=False, default=0)
    fats_g = Column(Float, nullable=False, default=0)
    fiber_g = Column(Float, nullable=False, default=0)
    sugar_g = Column(Float, nullable=False, default=0)
    sodium_mg = Column(Float, nullable=False, default=0)
    serving_size = Column(Float, nullable=False, default=100)
    serving_unit = Column(String, nullable=False, default="g")
    barcode = Column(String, nullable=True)
    source = Column(String, nullable=False, default="database")
