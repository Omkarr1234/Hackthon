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

## Available integrations

The application uses provider credentials only on the backend:

- **Groq chat:** set `GROQ_API_KEY` and `GROQ_MODEL` in `backend/.env`.
- **Optional Groq vision:** set `GROQ_VISION_MODEL` as well. Without it,
  Plant Doctor accepts the image and returns a clearly labelled
  non-diagnostic fallback instead of inventing a result.
- **Live mandi prices:** set `DATA_GOV_IN_API_KEY` to enable the
  data.gov.in/AGMARKNET proxy.
- **Weather:** Farm Profile uses Open-Meteo directly from the browser with
  device location permission; no weather key is required.
- **Shops:** OpenStreetMap Nominatim provides opt-in place search.
- **News/products:** only official source links are shown until a licensed
  feed or merchant catalog is configured; the app does not invent prices or
  headlines.
- **Labour/equipment:** authenticated user-submitted records are stored in
  SQLite. Listings are explicitly marked unverified.
- **Demo mode:** set `FARMSENSE_DEMO_MODE=true` for the safe demo account and
  development-only reset-token flow. Disable it in production.

No frontend bundle contains provider credentials. The repository ignores
`backend/.env`; use the deployment platform's secret store in production.

## Run Backend

```bash
cd backend
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
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

The Vite development proxy sends `/api` requests to the local backend. For a
deployed backend, set `VITE_API_BASE_URL` in the frontend build environment.

### Deployment checklist

Backend root: `backend`
Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
Frontend root: `frontend`
Build command: `npm run build`
Publish directory: `frontend/dist`

Configure the variable names from [`backend/.env.example`](./backend/.env.example)
in the hosting provider's secret/configuration store. `backend/.env` must never
be committed. SQLite persistence requires a persistent disk or an external
database in production; ephemeral hosting storage will lose user listings on
redeploy.

## API Endpoints

- `GET /api/health`
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/demo`
- `GET /api/auth/me`, `PUT /api/auth/profile`
- `GET /api/crops?lang=en|kn`
- `GET /api/crops/{cropId}/guide?lang=en|kn`
- `GET /api/conditions/{conditionId}?lang=en|kn`
- `POST /api/screening?lang=en|kn` (form-data: `crop_id`, `file`)
- `POST /api/chat?lang=en|kn` (JSON: `crop_id`, `question`)
- `POST /api/plant/analyze` (multipart image upload; live vision is optional)
- `GET /api/mandi/prices?state=Karnataka` (requires `DATA_GOV_IN_API_KEY` for live data)
- `GET /api/shops?q=Mandya`, `GET /api/news`, `GET /api/products`
- Labour and equipment endpoints under `/api/labour` and `/api/equipment`

## Verification

From the repository root:

```bash
cd backend
python -m unittest discover -s tests -v
python -m compileall -q app
cd ../frontend
npm run build
```

## Troubleshooting

1. **CORS error in frontend**
   - Ensure backend is running on port `8000`.

2. **Upload rejected**
   - Use `.jpg`, `.jpeg`, or `.png` under 5MB.

3. **Backend import error**
   - Run from `/backend` and use `uvicorn app.main:app --reload --port 8000`.

4. **Port already in use**
   - Change frontend or backend port and update URL config if needed.
