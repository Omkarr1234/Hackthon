# AgriSaathi AI (Hackathon MVP)

AgriSaathi AI is a mobile-first bilingual (English/Kannada) web MVP focused on one crop (Tomato) with:
- Crop guidance
- AI-assisted plant image screening (demo mode)
- Simple farming Q&A assistant

> Important: Screening output is a **possible condition**, not a confirmed diagnosis.

## Project Structure

```
/home/runner/work/Hackthon/Hackthon
├── backend
│   ├── app
│   │   ├── api
│   │   ├── data
│   │   └── services
│   └── requirements.txt
└── frontend
    └── src
        ├── i18n
        └── services
```

## Tech Stack

- Frontend: React + Vite
- Backend: FastAPI
- Data: JSON + SQLite (screening logs)

## Run Backend

```bash
cd /home/runner/work/Hackthon/Hackthon/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend URL: `http://localhost:8000`  
Docs: `http://localhost:8000/docs`

## Run Frontend

Open a new terminal:

```bash
cd /home/runner/work/Hackthon/Hackthon/frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## API Endpoints

- `GET /api/health`
- `GET /api/crops?lang=en|kn`
- `GET /api/crops/{cropId}/guide?lang=en|kn`
- `GET /api/conditions/{conditionId}?lang=en|kn`
- `POST /api/screening?lang=en|kn` (form-data: `crop_id`, `file`)
- `POST /api/chat?lang=en|kn` (JSON: `crop_id`, `question`)

## Troubleshooting

1. **CORS error in frontend**
   - Ensure backend is running on port `8000`.

2. **Upload rejected**
   - Use `.jpg`, `.jpeg`, or `.png` under 5MB.

3. **Backend import error**
   - Run from `/backend` and use `uvicorn app.main:app --reload --port 8000`.

4. **Port already in use**
   - Change frontend or backend port and update URL config if needed.
