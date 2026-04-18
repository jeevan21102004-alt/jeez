from __future__ import annotations
import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import Base, SessionLocal, engine
from backend.routes import ai, ai_food, analytics, analyze_body, food, logs, user

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CalAI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    from backend.seed_data import seed_database

    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(user.router)
app.include_router(food.router)
app.include_router(logs.router)
app.include_router(ai.router)
app.include_router(analytics.router)
app.include_router(analyze_body.router, prefix="/api")
app.include_router(ai_food.router, prefix="/api")
