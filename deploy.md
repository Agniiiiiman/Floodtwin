# StreetFlood Deployment

## Requirements

- Node.js 20+
- Python 3.11+
- Docker Desktop (optional)
- OSRM is optional. Without it, route requests show an honest service-unavailable state.
- SUMO Traffic Simulation: **VERIFIED** (Runs natively via official `eclipse-sumo` / `sumolib` / `traci` packages; pilot baseline and flood evacuation scenarios tested).

## Local setup

```powershell
Copy-Item .env.example .env
Push-Location frontend
npm ci
Pop-Location
pip install -r backend/requirements.txt
```

## Run the backend

```powershell
python -m uvicorn backend.main:app --reload --port 8000
```

## Run the frontend

In a second terminal:

```powershell
Push-Location frontend
npm run dev
```

Open `http://localhost:3000`.

Set `NEXT_PUBLIC_API_URL` in `.env` when the FastAPI service is hosted elsewhere. The browser must be able to reach that URL.

## Docker Compose

```powershell
docker compose up --build
```

Open `http://localhost:3000`. Compose runs the Next.js frontend and FastAPI backend. PostgreSQL/PostGIS and OSRM are intentionally not bundled because this repository does not currently contain a persistent database model or a portable OSRM dataset.

## Troubleshooting

- `DEMO MODE` means the frontend could not obtain backend forecast/report data and is showing explicitly labelled fallback data.
- `OFFLINE` means the health check failed. Check that port 8000 is reachable from the browser.
- Route errors are expected when OSRM is not running. Start OSRM separately and set `OSRM_BACKEND_URL` for the backend.
- If Next.js reports multiple lockfiles, run commands from `frontend/`; the root legacy static app has no package manifest.
