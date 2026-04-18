# CalAI

CalAI is a premium full-stack calorie tracking app with AI food image analysis.

## Stack
- Frontend: React + Vite + Tailwind + Framer Motion + Recharts + Zustand + React Query
- Backend: FastAPI + SQLAlchemy + SQLite
- AI: Claude vision endpoint (set `ANTHROPIC_API_KEY` in `.env`)
- Food data: Open Food Facts search API

## Run Backend
```bash
cd backend
c:/python314/python.exe -m pip install -r requirements.txt
c:/python314/python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

## Run Frontend
```bash
cd frontend
npm install
npm run dev
```

## Features Included
- 5-step onboarding with BMI/BMR/TDEE/macro calculations
- Premium dashboard with calorie ring, macro bars, weekly chart, streak and BMI gauge
- Food search + manual logging + AI photo analysis with editable item logging
- Exercise logging API (cardio/strength), water tracking, history analytics
- Settings with profile and macro customization
- PWA manifest + service worker

## Notes
- Claude image analysis returns fallback estimates if no API key is configured.
- Data persists locally via Zustand localStorage and backend SQLite.
