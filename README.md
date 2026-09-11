# 🌊 FloodTwin

### Real-Time Urban Flood Intelligence, Drainage Digital Twin & AI Safe Route Engine

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat-square&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900?style=flat-square&logo=leaflet)](https://leafletjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

> **"Predict floods before streets submerge. Protect cities through real-time drainage physics and emergency navigation."**

**FloodTwin** is an end-to-end urban flood intelligence and emergency decision-support platform. It bridges the gap between environmental weather telemetry, subterranean drainage network physics, street-level inundation risk, and real-time emergency routing into a unified, high-contrast operational command interface.

---

## 📌 Table of Contents

- [🚨 Why FloodTwin?](#-why-floodtwin)
- [🧠 System Architecture & Data Flow](#-system-architecture--data-flow)
- [✨ 6 Core Operational Modules](#-6-core-operational-modules)
  - [1. 🌐 Unified Operations Command (`/`)](#1--unified-operations-command-)
  - [2. 🚰 Subterranean Drainage Digital Twin (`/digital-twin`)](#2--subterranean-drainage-digital-twin-digital-twin)
  - [3. ⚡ What-If Hydraulic Sandbox (`/simulation`)](#3--what-if-hydraulic-sandbox-simulation)
  - [4. 🛡️ AI Emergency Safe Route Planner (`/safe-route`)](#4-️-ai-emergency-safe-route-planner-safe-route)
  - [5. 🌧️ Global Rainfall Radar & Sector Monitor (`/rainfall-map`)](#5-️-global-rainfall-radar--sector-monitor-rainfall-map)
  - [6. 📡 Citizen Incident Verification Portal (`/reports`)](#6--citizen-incident-verification-portal-reports)
- [🛠️ Technology Stack](#️-technology-stack)
- [🔌 REST API Specification](#-rest-api-specification)
- [🚀 Quickstart & Local Setup](#-quickstart--local-setup)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup (FastAPI)](#1-backend-setup-fastapi)
  - [2. Frontend Setup (Next.js 16)](#2-frontend-setup-nextjs-16)
  - [3. Docker Compose (Full Stack)](#3-docker-compose-full-stack)
- [⚙️ Environment Variables](#️-environment-variables)
- [🌓 High-Contrast Dual Theme System](#-high-contrast-dual-theme-system)
- [📄 License & Disclaimer](#-license--disclaimer)

---

## 🚨 Why FloodTwin?

Urban flooding is not merely a heavy-rainfall problem—it is a **cascading infrastructure failure**:

```
🌧️ Heavy Precipitation (Open-Meteo Radar)
    └── 💧 Runoff exceeds surface absorption capacity
         └── 🚰 Subterranean drainage nodes surcharge & backflow
              └── 🌊 Street-level water depth rises to critical thresholds (>0.40m)
                   └── 🚗 Essential transit & emergency corridors become impassable
```

Traditional municipal systems monitor rain gauges and dispatch rescue teams **reactively**. FloodTwin provides **proactive decision support**:
1. **Hydraulic Physics Modeling**: Computes pipe capacities and nodal overflow via Manning's formula.
2. **Predictive Street Inundation**: Identifies localized depressions and drainage proximity penalties before water ponds.
3. **Dynamic Hazard Exclusion Routing**: Computes OSRM driving paths that proactively bypass submerged segments.
4. **Multi-Source Corroboration**: Pairs live satellite rainfall telemetry with ground-truth citizen incident reports.

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
                   ┌─────────────────────────────┼─────────────────────────────┐
                   ▼                             ▼                             ▼
       ┌───────────────────────┐     ┌───────────────────────┐     ┌───────────────────────┐
       │   Manning's Equation  │     │   OSRM Safe Routing   │     │ Spatial Corroboration │
       │ Pipe Capacity/Overflow│     │ Hazard Area Exclusion │     │  2-Report Consensus   │
       └───────────┬───────────┘     └───────────┬───────────┘     └───────────┬───────────┘
                   │                             │                             │
                   └─────────────────────────────┼─────────────────────────────┘
                                                 │
                                                 ▼
                                  ┌──────────────────────────────┐
                                  │   Next.js 16 App Router UI   │
                                  │   Tailwind CSS v4 + Leaflet  │
                                  └──────────────────────────────┘
                                                 │
         ┌───────────────┬───────────────────────┼───────────────────────┬───────────────┐
         ▼               ▼                       ▼                       ▼               ▼
   /digital-twin    /simulation             /safe-route            /rainfall-map     /reports
  (Pipe Mesh &     (What-If Node          (Landmark Navigation     (130+ Global     (Verified Ground
   Surcharge)       Blockages)             & Avoidance Engine)      Radar Grid)      Incident Feed)
```

---

## ✨ 6 Core Operational Modules

### 1. 🌐 Unified Operations Command (`/`)
- Real-time sensor mesh status summary across active pilot wards (e.g. South Mumbai Wards A/B).
- Immediate telemetry indicators for average precipitation, high-risk junction alerts, and flood depth tier.
- Quick navigation gateways to all simulation and operational dispatch subsystems.

### 2. 🚰 Subterranean Drainage Digital Twin (`/digital-twin`)
- High-density subterranean pipe and junction node interactive network graph.
- Real-time hydraulic load utilization percentages ($Q / Q_{\text{capacity}}$).
- Identifies critical bottleneck junctions (`J-103 Harbor Basin`, `J-104 Subway Outflow`) under surcharge stress.

### 3. ⚡ What-If Hydraulic Sandbox (`/simulation`)
- Stress-test urban resilience by simulating single or multi-point infrastructure failures:
  - `NORMAL`: Standard operating capacity.
  - `50% CAPACITY`: Partial blockage (silt/debris accumulation).
  - `BLOCKED`: Complete conduit failure (95% capacity reduction).
  - `SEVERE RAINFALL`: Extreme storm event (80 mm/hr burst).
- Live recalculation of upstream backflow and street surcharge using Manning's equation.

### 4. 🛡️ AI Emergency Safe Route Planner (`/safe-route`)
- **Place-to-Place Navigation**: Choose from preset prominent Mumbai landmarks (Gateway of India, Colaba Causeway, Nariman Point, Marine Drive, Chhatrapati Shivaji Terminus, Dadar, etc.) or select custom coordinates.
- **Submerged Hazard Avoidance**: Automatically calculates high-risk and critical flood segments and excludes them from the OSRM path solver.
- **Route Comparison Metrics**: Side-by-side comparison of standard shortest routes versus flood-safe detour corridors, including travel time, safety validity window (e.g., safe for 30 mins), and avoided hazard zones.
- **Clean Interactive Map**: Crisp OpenStreetMap Leaflet visualization with custom start/end pins, detour polyline geometry, and hazard radius overlays.

### 5. 🌧️ Global Rainfall Radar & Sector Monitor (`/rainfall-map`)
- Live precipitation tracking across 130+ global sectors sampled every 60 seconds with an active countdown ticker.
- Categorized intensity tiers:
  - 🟢 **None**: `0.0 mm/hr`
  - 🔵 **Light**: `0.1 – 1.0 mm/hr`
  - 🟡 **Moderate**: `1.0 – 5.0 mm/hr`
  - 🟠 **Heavy**: `5.0 – 15.0 mm/hr`
  - 🔴 **Very Heavy**: `15.0 – 30.0 mm/hr`
  - 🟣 **Extreme**: `> 30.0 mm/hr`
- Multi-layer map visualizer (Standard OSM, Satellite view, Topographic terrain) with instant sector search and filter sidebar.

### 6. 📡 Citizen Incident Verification Portal (`/reports`)
- Crowdsourced flood incident submission portal allowing citizens to report ground-level water logging, severity, and photo verification.
- **Consensus Corroboration Engine**: Automatically corroborates reports when $\ge 2$ independent reports are filed within a **50-meter radius** and **30-minute time window**.
- Built-in client rate limiting and deduplication.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) & [React 19](https://react.dev/) |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com/), CSS Custom Properties (Theme Engine), Lucide React |
| **Geospatial Mapping** | [Leaflet.js 1.9.4](https://leafletjs.com/), OpenStreetMap, React Leaflet wrapper patterns |
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11+), [Uvicorn](https://www.uvicorn.org/), [Pydantic v2](https://docs.pydantic.dev/) |
| **HTTP & Async I/O** | [HTTPX](https://www.python-httpx.org/) (Async Open-Meteo & OSRM requests) |
| **Hydraulic Physics** | Manning's Open Channel Flow Formula ($Q = \frac{1}{n} A R^{2/3} S^{1/2}$) |
| **Routing Engine** | [OSRM](http://project-osrm.org/) (Open Source Routing Machine) / Dockerized local instance |
| **Containerization** | Docker & Docker Compose |

---

## 🔌 REST API Specification

The FastAPI backend exposes the following endpoints (default base URL: `http://localhost:8000`):

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Returns backend health status and system calibration metadata. |
| `GET` | `/api/forecast?lat={lat}&lng={lng}` | Fetches real-time precipitation from Open-Meteo and computes water depth risk. |
| `GET` | `/api/forecast/ward/{ward_id}` | Returns hydrological forecast for a designated municipal ward. |
| `GET` | `/api/drainage/{ward_id}` | Returns the GeoJSON network of subterranean drainage conduits and junctions. |
| `GET` | `/api/street-risk/{ward_id}` | Computes hydraulic utilization, slope, and elevation risk for street segments. |
| `POST` | `/api/drainage/what-if` | Simulates node blockage scenarios and returns surcharge propagation. |
| `POST` | `/api/route` | Computes flood-safe driving routes with live hazardous street avoidance. |
| `POST` | `/api/report` | Submits a citizen flood report and evaluates local corroboration consensus. |
| `GET` | `/api/reports` | Returns all active incident reports with corroboration status. |

### Example Safe Route Request

```bash
curl -X POST "http://localhost:8000/api/route" \
     -H "Content-Type: application/json" \
     -d '{
       "start_lat": 18.9220,
       "start_lng": 72.8347,
       "end_lat": 18.9400,
       "end_lng": 72.8350,
       "rainfall_mm_hr": 25.0
     }'
```

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js**: `v20.x` or higher
- **Python**: `v3.11` or higher
- **Git**

---

### 1. Backend Setup (FastAPI)

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS / Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI development server
uvicorn main:app --reload --port 8000
```

The API will be accessible at `http://localhost:8000` and the interactive OpenAPI documentation at `http://localhost:8000/docs`.

---

### 2. Frontend Setup (Next.js 16)

```bash
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install Node modules
npm install

# Start the Next.js development server with Turbopack
npm run dev
```

The web application will be accessible at `http://localhost:3000`.

---

### 3. Docker Compose (Full Stack)

To spin up both the FastAPI backend and Next.js frontend with a single command:

```bash
docker-compose up --build
```

---

## ⚙️ Environment Variables

Copy `.env.example` to create your local `.env` files if required:

```env
# Frontend Environment
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend Environment
FRONTEND_URL=http://localhost:3000
BACKEND_PORT=8000
OSRM_BACKEND_URL=http://localhost:5000
```

> **Note**: Open-Meteo weather requests work out-of-the-box without requiring an API key.

---

## 🌓 High-Contrast Dual Theme System

FloodTwin is designed for maximum legibility under high-stress emergency operational scenarios:

| Mode | Theme Aesthetic | Intended Context |
| :--- | :--- | :--- |
| 🌙 **Dark EOC Mode** | Deep navy `#0a0f1d`, glowing cyan accents, high-contrast badges | Emergency Operations Centers, low-light control rooms |
| ☀️ **Light Municipal Mode** | Clean slate white `#ffffff`, deep `#0f172a` text, high-contrast borders | Municipal offices, desktop management, daylight field operations |

Theme preferences are persisted in `localStorage` and synchronized across all operational pages.

---

## 📄 License & Disclaimer

### Academic & Research Disclaimer
FloodTwin is an urban flood intelligence research and decision-support prototype. Live predictions, Manning simulations, and routing advice are calibrated on pilot ward topologies and public meteorological data. It should be used in conjunction with official municipal alerts and disaster management protocols during active emergencies.

### License
This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
