# Local OSRM on Windows

This project uses a self-hosted OSRM instance for the South Mumbai pilot ward. The router is not the public OSRM demo service.

## Prerequisites

- Docker Desktop for Windows
- Docker Desktop set to Linux containers
- PowerShell
- Internet access for the small Overpass road extract and OSRM image download

## Prepare and start OSRM

From the repository root:

```powershell
.\backend\setup_osrm.ps1
```

The script downloads a road-only OSM XML extract for the existing South Mumbai pilot bbox (`18.89,72.77,19.03,72.85`) when it is missing, prepares the graph with `osrm-extract`, `osrm-partition`, and `osrm-customize`, and starts the `streetflood-osrm` container.

Generated graph files are stored in `backend/osrm_data/` and are ignored by Git because they are reproducible generated artifacts.

## Verify Docker and OSRM

```powershell
docker info
docker ps
Test-NetConnection 127.0.0.1 -Port 5000
Invoke-WebRequest 'http://127.0.0.1:5000/route/v1/driving/72.8200,18.9600;72.8350,18.9750?overview=full&geometries=geojson'
```

The final request must return HTTP 200 and a response containing `routes[0].geometry`.

## Start the application

Start FastAPI from the repository root:

```powershell
python -m uvicorn backend.main:app --reload --port 8000
```

Start the frontend in a second terminal:

```powershell
Push-Location frontend
npm run dev
Pop-Location
```

Open `http://localhost:3000`, scroll to Safe Route, and submit a pilot route.

## Troubleshooting

- **Docker daemon unavailable:** Open Docker Desktop, wait for Docker to report running, ensure Linux containers are selected, then retry `docker info`.
- **Port 5000 occupied:** Stop the process using port 5000 or remove the existing `streetflood-osrm` container before rerunning the script.
- **Missing PBF:** This setup uses a small Overpass XML extract rather than a large PBF. Delete `backend/osrm_data/mumbai_pilot.osm` and rerun the script to download it again.
- **OSRM extraction failure:** Check `docker logs` is not relevant for the one-shot preparation commands; rerun the script and inspect the first failing Docker command.
- **Container exits:** Run `docker logs streetflood-osrm`; verify all `mumbai_pilot.osrm*` files exist in `backend/osrm_data`.
- **FastAPI returns 503:** Test port 5000 directly first. FastAPI intentionally reports route service unavailable when local OSRM cannot be reached.
- **Frontend cannot reach FastAPI:** Confirm `NEXT_PUBLIC_API_URL` points to the browser-reachable FastAPI URL and that port 8000 is open.

## Flood-Aware Routing Status

- **Normal Local OSRM**: Verified with local OSM pilot bbox.
- **Flood-Aware Avoidance**: Active (`/api/route`). When rainfall generates High or Critical flood risk on street segments (such as the Pilot Road Junction Low Point), the router actively filters candidate paths to avoid inundated segments and returns a verified flood-safe alternative route.
