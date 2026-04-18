# CalAI

CalAI is a premium full-stack calorie tracking app with AI food image analysis.

## New: AI Calorie Estimation Agent
This repository now includes a plug-and-play AI nutrition agent for calorie estimation from text and optional food images.

- Input examples: `2 dosa and chutney`, `1 plate biryani`, or multipart image upload
- Indian food aware extraction and quantity parsing
- Normalization for common variants (`dosa -> masala dosa`, `roti -> chapati`, `sabzi -> mixed vegetable curry`)
- Structured calorie response with per-item totals and overall total calories

### Agent Module Files
- `ai-agent/foodExtractor.js`
- `ai-agent/calorieCalculator.js`
- `ai-agent/foodDatabase.json`
- `ai-agent/agentController.js`

### API Endpoint
- Method: `POST`
- Route: `/api/ai-calories`
- Content types: `application/json` or `multipart/form-data`

JSON request:
```json
{
	"text": "2 dosa and chutney"
}
```

Success response:
```json
{
	"items": [
		{
			"name": "masala dosa",
			"quantity": 2,
			"calories": 774
		}
	],
	"totalCalories": 774
}
```

Unknown food handling:
```json
{
	"name": "unknown dish",
	"quantity": 1,
	"calories": null,
	"message": "Food not found in database"
}
```

## Stack
- Frontend: React + Vite + Tailwind + Framer Motion + Recharts + Zustand + React Query
- Backend: FastAPI + SQLAlchemy + SQLite
- AI: Claude vision endpoint + OpenAI calorie extraction (configure keys via `.env`)
- Food data: Open Food Facts search API

## Environment Setup
1. Copy `.env.example` to `.env`
2. Fill API keys as needed:

```env
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

Notes:
- `/api/ai-calories` currently uses `OPENAI_API_KEY`.
- Existing image analysis route uses `ANTHROPIC_API_KEY`.
- `GEMINI_API_KEY` is included as a placeholder for optional future Gemini integration.

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
- AI calorie estimation endpoint requires `OPENAI_API_KEY` for extraction.
- Data persists locally via Zustand localStorage and backend SQLite.
