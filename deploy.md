# StreetFlood Deployment & Reproducibility Guide

## 1. System Requirements

- **Operating System**: Windows 10/11 (PowerShell 5.1+ or PowerShell 7+)
- **Runtime Dependencies**:
  - Node.js 20+ and npm 10+
  - Python 3.11+
  - Docker Desktop for Windows (with WSL2 Linux engine enabled)

---

## 2. Environment Configuration

Copy the example environment file:

```powershell
Copy-Item .env.example .env
```

Key environment variables:
- `NEXT_PUBLIC_API_URL`: URL where the browser connects to FastAPI (default: `http://localhost:8000`).
- `FRONTEND_URL`: URL of the Next.js web application (default: `http://localhost:3000`).
- `BACKEND_PORT`: Port for FastAPI backend service (default: `8000`).
- `OSRM_BACKEND_URL`: URL for local OSRM routing container (default: `http://localhost:5000`).

---

## 3. Local Installation

### A. Frontend Setup
```powershell
Push-Location frontend
npm ci
Pop-Location
```

### B. Backend Setup
```powershell
pip install -r backend/requirements.txt
pip install eclipse-sumo sumolib traci
```

---

## 4. Running Services

### A. Start the Backend Service
In Terminal 1:
```powershell
python -m uvicorn backend.main:app --reload --port 8000
```
Verify health: `http://localhost:8000/api/health`

### B. Start the Frontend Application
In Terminal 2:
```powershell
Push-Location frontend
npm run dev
Pop-Location
```
Open `http://localhost:3000` in your browser.

### C. (Optional) Start Local OSRM Routing
If Docker Desktop is running:
```powershell
.\backend\setup_osrm.ps1
```
*Note: If OSRM is not running, `/api/route` returns an honest HTTP 503 Service Unavailable state and does not hallucinate fake routes.*

### D. Run SUMO Traffic Simulation
Run the native SUMO simulation pipeline on the pilot network:
```powershell
python backend/sumo/run_sumo_simulation.py
```
This executes both normal baseline and flood-detour scenarios, extracting real travel time and congestion metrics.

---

## 5. Docker Compose Deployment

To spin up the multi-container stack:
```powershell
docker compose up --build
```
Compose runs the Next.js frontend on port `3000` and the FastAPI backend on port `8000`.

---

## 6. Testing & Quality Verification

Run all automated unit tests:
```powershell
# Run backend tests
python -m pytest backend/test_main.py backend/test_sumo.py -v

# Run frontend build validation
Push-Location frontend
npm run build
Pop-Location
```

---

## 7. Troubleshooting

- **DEMO MODE badge**: The frontend is displaying synthetic demo fallback data because the backend is reachable but in fallback mode.
- **OFFLINE badge**: FastAPI is unreachable on port 8000. Check backend terminal logs and CORS settings.
- **Route Service Unavailable**: Local OSRM container is not started. Start it via `.\backend\setup_osrm.ps1` or view the honest unavailable state in the UI.
- **SUMO PATH warning**: Ensure `AppData\Roaming\Python\Python313\Scripts` is on your PATH or run simulations via the provided `run_sumo_simulation.py` runner which resolves the path automatically.
