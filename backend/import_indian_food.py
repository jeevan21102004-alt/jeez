import csv
import os
import sys

from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Add parent dir to path to import backend correctly if needed
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(current_dir))

from backend.database import SessionLocal, get_db
from backend.models.food_database import FoodItem

def import_csv_to_db(csv_path: str):
    db_gen = get_db()
    db: Session = next(db_gen)

    try:
        with open(csv_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                name = row.get("name", "").strip()
                if not name:
                    continue
                
                # Check if it already exists
                existing = db.query(FoodItem).filter(FoodItem.name == name).first()
                if existing:
                    continue

                diet = row.get("diet", "").strip()
                course = row.get("course", "").strip()
                region = row.get("region", "").strip()
                state = row.get("state", "").strip()
                
                category = f"{course} / {diet}" if course and diet else (course or diet or "Indian Food")
                
                brand_parts = []
                if region and region != "-1": brand_parts.append(region)
                if state and state != "-1": brand_parts.append(state)
                brand = ", ".join(brand_parts) if brand_parts else "Indian"

                new_item = FoodItem(
                    name=name,
                    brand=brand,
                    category=category,
                    calories=200,      # Default fallback
                    protein_g=10,
                    carbs_g=25,
                    fats_g=8,
                    fiber_g=0,
                    sugar_g=0,
                    sodium_mg=0,
                    serving_size=100,
                    serving_unit="g",
                    source="indian_food.csv"
                )
                db.add(new_item)
                count += 1
            
            db.commit()
            print(f"Successfully imported {count} new Indian foods into the database.")
    except Exception as e:
        db.rollback()
        print(f"Error importing CSV: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    csv_file_path = os.path.join(current_dir, "indian_food.csv")
    print(f"Starting import from {csv_file_path}...")
    import_csv_to_db(csv_file_path)
