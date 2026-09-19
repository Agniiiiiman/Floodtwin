# 🌊 FloodTwin

### Real-Time Urban Flood Intelligence, Drainage Digital Twin & AI Emergency Operations Engine

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat-square&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900?style=flat-square&logo=leaflet)](https://leafletjs.com/)
[![SUMO](https://img.shields.io/badge/SUMO-1.27.1-orange?style=flat-square)](https://eclipse.dev/sumo/)
[![Twilio Voice](https://img.shields.io/badge/Twilio-Automated_Voice_API-red?style=flat-square&logo=twilio)](https://www.twilio.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

> **"Predict floods before streets submerge. Protect cities through real-time drainage physics, automated multi-agency emergency dispatch, and AI safe evacuation routing."**

**FloodTwin** is an end-to-end urban flood intelligence and emergency decision-support platform. It bridges environmental meteorological telemetry, subterranean drainage network physics (Manning open channel equations), street-level inundation risk, automated multi-agency voice emergency dispatch, and real-time safe routing navigation into a unified operational command interface.

---

## 📌 Table of Contents

- [🚨 Why FloodTwin?](#-why-floodtwin)
- [🧠 System Architecture & Data Flow](#-system-architecture--data-flow)
- [✨ 8 Core Operational Modules](#-8-core-operational-modules)
  - [1. 🌐 Executive Operations Command (`/dashboard` & `/`)](#1--executive-operations-command-dashboard--)
  - [2. 🚰 Subterranean Drainage Digital Twin (`/digital-twin`)](#2--subterranean-drainage-digital-twin-digital-twin)
  - [3. ⚡ What-If Hydraulic Sandbox (`/simulation`)](#3--what-if-hydraulic-sandbox-simulation)
  - [4. 🛡️ AI Emergency Safe Route Planner (`/safe-route`)](#4-️-ai-emergency-safe-route-planner-safe-route)
  - [5. 🌧️ Global Rainfall Radar & Sector Monitor (`/rainfall-map`)](#5-️-global-rainfall-radar--sector-monitor-rainfall-map)
  - [6. 📡 Citizen Incident Verification Portal (`/reports`)](#6--citizen-incident-verification-portal-reports)
  - [7. 🚨 Automated Multi-Agency Emergency One-Call Dispatch (`/emergency`)](#7--automated-multi-agency-emergency-one-call-dispatch-emergency)
  - [8. 🚗 SUMO Microscopic Traffic Evacuation Engine (`backend/sumo`)](#8--sumo-microscopic-traffic-evacuation-engine-backendsumo)
- [⚖️ Data Provenance & Qualifier Matrix](#️-data-provenance--qualifier-matrix)
- [🛠️ Technology Stack](#️-technology-stack)
- [🔌 REST API Specification](#-rest-api-specification)
- [🚀 Quickstart & Local Setup](#-quickstart--local-setup)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup (FastAPI)](#1-backend-setup-fastapi)
  - [2. Frontend Setup (Next.js 16)](#2-frontend-setup-nextjs-16)
  - [3. Docker Compose (Full Stack)](#3-docker-compose-full-stack)
  - [4. OSRM Local Routing Engine (Optional)](#4-osrm-local-routing-engine-optional)
  - [5. SUMO Traffic Simulation Execution](#5-sumo-traffic-simulation-execution)
- [⚙️ Environment Variables](#️-environment-variables)
- [🧪 Automated Testing & Validation](#-automated-testing--validation)
- [🌓 High-Contrast Dual Theme System](#-high-contrast-dual-theme-system)
- [📄 License & Disclaimer](#-license--disclaimer)

---

## 🌧️ LIVE METEOROLOGICAL TELEMETRY

- **Provider**: Open-Meteo Public API (`https://api.open-meteo.com/v1/forecast`)
- **Primary Pilot Ward**: South Mumbai Wards A/B (Lat: `18.96`, Lng: `72.82`)
- **Global Sector Coverage**: 130+ pre-calibrated major metropolitan sectors
- **Refresh Frequency**: Polled every 60 seconds with live visual countdown timer
- **API Key**: Not required (Public Open Hydrology & Weather Data)
- **Data Field**: `current.precipitation` ($mm/hr$)

---

## 🔄 End-to-End Processing Pipeline

Live precipitation serves as the foundational trigger for the complete urban hydrology and emergency response pipeline:

```text
Rainfall (Open-Meteo Live API)
   ↓
Runoff Inflow Calculation (Q = C · i · A)
   ↓
Subterranean Drainage Engine (Manning's Equation Q = (1/n) · A · R^(2/3) · S^(1/2))
   ↓
Surcharge & Street Inundation Overtopping Model
   ↓
Street-Level Hazard Tier Classification (Low / Medium / High / Critical)
   ↓
AI Safe Routing (OSRM Dynamic Hazard Polygon Exclusion)
   ↓
Citizen Crowd-Report Corroboration Engine (2-Report Spatiotemporal Consensus)
   ↓
Emergency Dispatch Engine (Automated Twilio Multi-Agency Voice Alert Calls)
   ↓
SUMO Microscopic Traffic Simulation (Detour Congestion & Evacuation Flow)
```

---

## 🚨 Why FloodTwin?

Urban flooding is not merely a heavy-rainfall problem—it is a **cascading infrastructure failure**:

```
🌧️ Heavy Precipitation (Cloudburst / Extreme Monsoon Burst)
    └── 💧 Surface runoff exceeds absorption capacity
         └── 🚰 Subterranean conduits and junction nodes surcharge & backflow
              └── 🌊 Street-level water depth crosses critical thresholds (>0.35m)
                   ├── 🚗 Arterial transit & evacuation corridors become impassable
                   └── 🚨 Emergency services cannot reach trapped citizens in time
```

Traditional municipal systems monitor rain gauges and dispatch rescue teams **reactively**. FloodTwin provides **proactive decision support**:

1. **Hydraulic Physics Modeling**: Computes pipe conduit capacity and nodal surcharge via Manning's formula and Rational runoff equations.
2. **Predictive Street Inundation**: Computes localized depression penalties, slope factors, and distance to subterranean nodes.
3. **Dynamic Hazard Exclusion Routing**: Calculates OSRM driving paths that actively steer around submerged segments and provide validity windows.
4. **Automated Multi-Agency Voice Dispatch**: Triggers concurrent, automated outbound phone calls with synthesized TwiML voice briefings to Police, Fire, Disaster Response, Electricity, and Control Rooms.
5. **Multi-Source Corroboration**: Pairs live satellite rainfall telemetry with ground-truth citizen incident reports verified by 2-party consensus.
6. **Microscopic Traffic Validation**: Evaluates evacuation corridor performance using native SUMO 1.27.1 traffic modeling.

---

## 🧠 System Architecture & Data Flow

```text
                                  ┌──────────────────────────────┐
                                  │      Open-Meteo Weather      │
                                  │    Real-Time Precipitation   │
                                  └──────────────┬───────────────┘
                                                 │
                                                 ▼
┌─────────────────────────┐       ┌──────────────────────────────┐       ┌─────────────────────────┐
│  Citizen Ground Reports │ ────► │       FastAPI Backend        │ ◄──── │ Municipal Drainage SWMM │
│  (Crowdsourced Incidents)│       │  Hydraulic Calculation Engine│       │ (GeoJSON Node Topologies)│
└─────────────────────────┘       └──────────────┬───────────────┘       └─────────────────────────┘
                                                 │
    ┌─────────────────────────┬──────────────────┼──────────────────┬─────────────────────────┐
    ▼                         ▼                  ▼                  ▼                         ▼
┌───────────────────────┐ ┌───────────────┐ ┌────────────────┐ ┌────────────────────────┐ ┌──────────────────────┐
│  Manning's Equation   │ │  OSRM Safe    │ │ Corroboration  │ │ Automated Emergency    │ │ SUMO Traffic         │
│  Capacity & Surcharge │ │  Routing API  │ │ Consensus (2x) │ │ Multi-Agency Voice Call│ │ Evacuation Simulation│
└───────────┬───────────┘ └───────┬───────┘ └───────┬────────┘ └───────────┬────────────┘ └──────────┬───────────┘
            │                     │                 │                      │                         │
            └─────────────────────┴─────────────────┼──────────────────────┴─────────────────────────┘
                                                    │
                                                    ▼
                                     ┌──────────────────────────────┐
                                     │   Next.js 16 App Router UI   │
                                     │   Tailwind CSS v4 + Leaflet  │
                                     └──────────────────────────────┘
                                                    │
        ┌───────────────┬───────────────┬───────────┴───┬───────────────┬───────────────┬───────────────┐
        ▼               ▼               ▼               ▼               ▼               ▼               ▼
   /dashboard     /digital-twin    /simulation     /safe-route    /rainfall-map     /reports       /emergency
  (Executive      (Pipe Mesh &     (What-If Node  (Hazard-Free    (130+ Global     (Verified Ground (Automated Voice
   Overview)       Surcharge)       Blockages)     Corridors)      Radar Grid)      Incident Feed)   Dispatch Console)
```

---

## ✨ 8 Core Operational Modules

### 1. 🌐 Executive Operations Command (`/dashboard` & `/`)
- **Real-Time Operational Briefing**: High-contrast summary answering: *Where is the risk? Why is it occurring? Which roads to avoid? What is the blockage impact?*
- **Live System Mode Indicators**: Provenance badges (`LIVE`, `SYNTHETIC FALLBACK`, `OFFLINE`) ensuring transparency.
- **Subsystem Hub**: Direct navigation gateways to all simulation, dispatch, and monitoring subsystems.

### 2. 🚰 Subterranean Drainage Digital Twin (`/digital-twin`)
- **Interactive Pipe & Node Mesh**: Visualizes subterranean stormwater conduits, junction depths, and invert elevations.
- **Hydraulic Load Utilization**: Dynamic calculation of conduit capacity load ($Q / Q_{\text{capacity}} \times 100\%$) with surcharge warnings.
- **Critical Node Profiling**: Pinpoints vulnerable junctions under heavy stormwater influx.

### 3. ⚡ What-If Hydraulic Sandbox (`/simulation`)
- **Interactive Failure Scenarios**:
  - `NORMAL`: Standard design conduit capacity.
  - `50% CAPACITY`: Partial conduit blockage due to silt or debris buildup.
  - `BLOCKED`: Conduit failure (95% capacity reduction).
  - `SEVERE RAINFALL`: Extreme monsoon cloudburst ($80\,\text{mm/hr}$).
- **Instant Recalculation**: Live recalculation of upstream backflow and surface overtopping risk.

### 4. 🛡️ AI Emergency Safe Route Planner (`/safe-route`)
- **Dynamic Hazard Avoidance**: Excludes submerged road segments and junction overflow zones from navigation solutions.
- **Preset Landmarks & Custom Coordinates**: Navigate between prominent hubs (Gateway of India, Colaba, Nariman Point, Marine Drive, CST, Dadar) or pinpoint custom origin/destination markers.
- **Route Comparison Metrics**: Side-by-side comparison of standard shortest paths versus flood-safe detour corridors, including travel time deltas and route validity time windows.
- **Graceful OSRM Fallback**: Honest HTTP 503 handling when local routing containers are offline.

### 5. 🌧️ Global Rainfall Radar & Sector Monitor (`/rainfall-map`)
- **130+ Metropolitan Sectors**: Real-time precipitation monitoring sampled every 60 seconds with an active countdown ticker.
- **Precipitation Intensity Tiers**:
  - 🟢 **None**: `0.0 mm/hr`
  - 🔵 **Light**: `0.1 – 1.0 mm/hr`
  - 🟡 **Moderate**: `1.0 – 5.0 mm/hr`
  - 🟠 **Heavy**: `5.0 – 15.0 mm/hr`
  - 🔴 **Very Heavy**: `15.0 – 30.0 mm/hr`
  - 🟣 **Extreme**: `> 30.0 mm/hr`
- **Multi-Layer Map Controls**: Toggle between standard OpenStreetMap, Satellite imagery, and Topographic terrain layers.

### 6. 📡 Citizen Incident Verification Portal (`/reports`)
- **Crowdsourced Incident Submission**: Citizens report street flooding, estimated depth, severity, and photo URLs.
- **2-Report Consensus Engine**: Automatically corroborates reports when $\ge 2$ independent submissions occur within a **50-meter radius** and **30-minute time window**.
- **Rate-Limiting & Deduplication**: Built-in IP rate limiting (1 report per 30 seconds per client).

### 7. 🚨 Automated Multi-Agency Emergency One-Call Dispatch (`/emergency`)
- **Automated Outbound Voice Dispatch**: Integrates with Twilio Voice API to initiate automated phone calls to emergency response agencies.
- **Agency Matrix**:
  - 👮 **Police Department**: Traffic diversion and perimeter control.
  - 🚒 **Fire & Emergency Services**: High-capacity dewatering pumps and swift water rescue.
  - 🛡️ **Disaster Response Force (NDRF / SDRF)**: Mass citizen evacuation and disaster mobilization.
  - ⚡ **Electricity Utility**: Power grid shutdown in waterlogged sectors to prevent electrocution hazards.
  - 🏢 **Emergency Control Room**: Central coordination and municipal escalation.
- **TwiML Voice Briefing**: Generates structured voice synthesis reciting severity, affected ward, coordinates, estimated water depth, and action directives.
- **Idempotency & Automatic Retries**: Full call status callback handling (`queued`, `initiated`, `ringing`, `in-progress`, `completed`, `busy`, `failed`, `no-answer`) with one-click automatic retries.

### 8. 🚗 SUMO Microscopic Traffic Evacuation Engine (`backend/sumo`)
- **Microscopic Traffic Simulation**: Simulates vehicular movement, deceleration, and route re-planning using Eclipse SUMO 1.27.1 on the pilot road network.
- **Empirical Flood Impact Metrics**:
  - **Travel Time**: Baseline `93.22 s` $\rightarrow$ Flooded Detour `132.63 s` (+42.3%).
  - **Congestion Time Loss**: Baseline `5.39 s` $\rightarrow$ Flooded Detour `10.55 s` (+95.7%).
  - **Affected Edges**: `3` (`street_segment_02` closed; dynamic bypass activated).

---

## ⚖️ Data Provenance & Qualifier Matrix

FloodTwin maintains absolute transparency regarding live telemetry vs. calibrated simulations:

| Layer / Feature | Data Source | Provenance Status | Calibration Note |
| :--- | :--- | :--- | :--- |
| **Precipitation** | Open-Meteo REST API | 🟢 **LIVE** | Real-time global satellite/radar precipitation telemetry. |
| **Drainage Network** | GeoJSON Subterranean Graph | 🟡 **LOCAL PILOT** | South Mumbai Ward A/B pilot conduits and junctions. |
| **Hydraulic Flow ($Q$)** | Manning's Open Channel Formula | 🟡 **PHYSICS MODEL** | $Q = \frac{1}{n} A R^{2/3} S^{1/2}$ computed on conduit geometry. |
| **Street Risk Tiers** | Elevation + Drainage Proximity | 🟡 **RULE-BASED MODEL** | Local depression penalties and surcharge propagation. |
| **Safe Routing** | OSRM Container / Fallback | 🟢 **ROUTING ENGINE** | Real graph routing with hazard polygon exclusion. |
| **Citizen Reports** | In-Memory & REST Store | 🟢 **LIVE USER INPUT** | Rate-limited with 2-party spatiotemporal consensus. |
| **Emergency Voice** | Twilio REST Voice API | 🟢 **LIVE DISPATCH** | Real outbound voice calls with dynamic TwiML synthesis. |
| **Traffic Dynamics** | Eclipse SUMO 1.27.1 | 🟢 **NATIVE SIMULATION** | Microscopic vehicular evacuation and detour metrics. |

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [Next.js 16.3.4](https://nextjs.org/) (App Router, Turbopack) & [React 19.2.8](https://react.dev/) |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com/), CSS Custom Properties (Dual Theme Engine), Lucide React |
| **Geospatial Mapping** | [Leaflet.js 1.9.4](https://leafletjs.com/), OpenStreetMap, React Leaflet wrappers |
| **Authentication** | [Firebase Authentication](https://firebase.google.com/) (Auth Context & Guards) |
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11+), [Uvicorn](https://www.uvicorn.org/), [Pydantic v2](https://docs.pydantic.dev/) |
| **HTTP & Async I/O** | [HTTPX](https://www.python-httpx.org/) (Async Open-Meteo & OSRM requests) |
| **Telephony & Voice Dispatch** | [Twilio Python SDK](https://www.twilio.com/) (Voice Calls, TwiML Audio Briefings, Status Callbacks) |
| **Traffic Simulation** | [Eclipse SUMO 1.27.1](https://eclipse.dev/sumo/) (`sumolib`, `traci`) |
| **Routing Engine** | [OSRM](http://project-osrm.org/) (Open Source Routing Machine) / Dockerized local instance |
| **Containerization** | Docker & Docker Compose |

---

## 🔌 REST API Specification

Default Backend URL: `http://localhost:8000` (Interactive Swagger Docs: `http://localhost:8000/docs`)

### Core Hydrology & Routing Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Returns backend health status and system calibration mode. |
| `GET` | `/api/forecast?lat={lat}&lng={lng}` | Fetches live precipitation and calculates hydraulic depth risk. |
| `GET` | `/api/forecast/ward/{ward_id}` | Returns hydrological forecast for a designated municipal ward. |
| `GET` | `/api/drainage/{ward_id}` | Returns GeoJSON subterranean drainage network (pipes & junctions). |
| `GET` | `/api/street-risk/{ward_id}` | Computes hydraulic utilization, slope, and elevation risk for streets. |
| `POST` | `/api/drainage/what-if` | Simulates pipe blockage scenarios and returns surcharge propagation. |
| `POST` | `/api/route` | Computes flood-safe driving routes with live hazardous street avoidance. |
| `POST` | `/api/report` | Submits a citizen flood incident and evaluates local corroboration consensus. |
| `GET` | `/api/reports` | Returns all active citizen incident reports with corroboration status. |

### Emergency Dispatch & Telephony Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/emergency/incident` | Creates a tracked emergency incident and generates agency call records. |
| `POST` | `/api/emergency/call` | Triggers live Twilio outbound calls to selected response agencies. |
| `GET` | `/api/emergency/status/{incident_id}` | Fetches real-time status of all dispatched calls for an incident. |
| `POST` | `/api/emergency/call-status` | Twilio webhook receiver updating call state (`ringing`, `in-progress`, `completed`, `failed`). |
| `POST` | `/api/emergency/retry` | Re-initiates failed or busy agency calls for an existing incident. |
| `GET` | `/api/emergency/twiml/{incident_id}` | Generates dynamic TwiML XML voice briefing for audio synthesis. |

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js**: `v20.x` or higher
- **Python**: `v3.11` or higher
- **Git**
- *(Optional)* **Docker Desktop**: For running local OSRM routing containers.
- *(Optional)* **Eclipse SUMO**: For running native microscopic traffic simulations.

---

### 1. Backend Setup (FastAPI)

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS / Linux:
# source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Run the FastAPI development server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000` and interactive docs at `http://localhost:8000/docs`.

---

### 2. Frontend Setup (Next.js 16)

```bash
# In a new terminal, navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Next.js development server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

### 3. Docker Compose (Full Stack)

To spin up both the FastAPI backend and Next.js frontend with Docker:

```bash
docker compose up --build
```

---

### 4. OSRM Local Routing Engine (Optional)

To enable live OSRM routing in Docker:

```powershell
.\backend\setup_osrm.ps1
```

*If OSRM is not running, the safe-route interface gracefully displays the service status.*

---

### 5. SUMO Traffic Simulation Execution

To run the microscopic evacuation simulation and extract baseline vs. flooded performance:

```powershell
python backend/sumo/run_sumo_simulation.py
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` in the project root:

```env
# ==========================================
# Frontend Configuration
# ==========================================
NEXT_PUBLIC_API_URL=http://localhost:8000

# ==========================================
# Backend & Routing Configuration
# ==========================================
FRONTEND_URL=http://localhost:3000
BACKEND_PORT=8000
OSRM_BACKEND_URL=http://localhost:5000

# ==========================================
# Twilio Emergency Voice Dispatch (Optional)
# ==========================================
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_PHONE=+1234567890

# Pre-configured Emergency Contact Numbers (E.164 format)
POLICE_PHONE=+917044277303
FIRE_EMERGENCY_PHONE=+918585045232
DISASTER_RESPONSE_PHONE=+917439549556
ELECTRICITY_UTILITY_PHONE=+918282019555
EMERGENCY_CONTROL_ROOM_PHONE=+918900471168
```

---

## 🧪 Automated Testing & Validation

Run the test suite across backend hydrology physics, emergency endpoints, and SUMO models:

```bash
# Run backend pytest suite
python -m pytest backend/test_main.py backend/test_sumo.py -v

# Run frontend build verification
cd frontend
npm run build
```

---

## 🌓 High-Contrast Dual Theme System

FloodTwin supports dual operational display modes calibrated for emergency decision-making:

| Mode | Visual Palette | Intended Context |
| :--- | :--- | :--- |
| 🌙 **Dark EOC Mode** | Deep navy `#0a0f1d`, glowing cyan accents, high-contrast badges | Emergency Operations Centers, low-light dispatch rooms |
| ☀️ **Light Municipal Mode** | Slate white `#ffffff`, deep `#0f172a` text, crisp high-contrast borders | Municipal offices, desktop management, daylight field operations |

---

## 📄 License & Disclaimer

### Academic & Research Disclaimer
FloodTwin is an urban flood intelligence research and decision-support prototype. Live predictions, Manning simulations, and routing advice are calibrated on pilot ward topologies and public meteorological data. It should be used in conjunction with official municipal alerts and disaster management protocols during active emergencies.

### License
This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
