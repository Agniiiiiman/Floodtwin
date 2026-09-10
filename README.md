# 🌊 FloodTwin

### Real-Time Urban Flood Intelligence & Drainage Digital Twin

> **Predict floods. Protect cities.**

FloodTwin is an urban flood intelligence and decision-support platform designed to connect **rainfall monitoring, flood-risk assessment, drainage-network intelligence, street-level prediction, emergency routing, and what-if analysis** into a unified operational interface.

The project is designed around the idea that urban flood response should begin **before water reaches critical levels** — by combining environmental data with infrastructure and location intelligence.

---

## 🚨 Why FloodTwin?

Urban flooding is not an isolated rainfall problem.

Rainfall affects runoff.
Runoff puts pressure on drainage infrastructure.
Overloaded drainage systems create hazardous streets.
Hazardous streets affect how citizens and emergency responders should move.

FloodTwin attempts to bring these connected layers into a single system so that flood conditions can be **observed, interpreted, and acted upon from one interface**.

---

# ✨ Core Capabilities

FloodTwin currently contains several connected interface and data components.

| Capability                         | Description                                                                 |
| ---------------------------------- | --------------------------------------------------------------------------- |
| 🌧️ **Rainfall Monitoring**        | Real-time precipitation visualization across a global sector grid           |
| 🗺️ **Interactive Maps**           | Leaflet-based geographic visualization                                      |
| 🚰 **Drainage Digital Twin UI**    | Visualization of drainage nodes, loads, capacities and failure-risk states  |
| 🌊 **Flood Risk Monitoring**       | Water-depth monitoring with risk tiers                                      |
| 🔮 **Flood Forecasting Interface** | 0–3 hour flood prediction workflow                                          |
| ⚡ **What-If Simulation**           | Interface for modelling critical drainage blockage scenarios                |
| 🛡️ **Emergency Routing**          | Flood-aware routing concept for safer movement                              |
| 📡 **Incident Intelligence**       | Citizen incident-feed concept for combining ground reports with system data |
| 🔐 **Authentication UI**           | Sign-in and account creation interfaces                                     |
| 🌓 **Theme System**                | Persistent dark/light operational themes                                    |
| 📱 **Responsive UI**               | Mobile navigation and responsive layouts                                    |

The landing page describes the platform as five connected core modules, while the broader interface also includes a citizen incident-feed component.

---

# 🧠 System Concept

FloodTwin follows a connected flood-intelligence pipeline:

```text
                ┌─────────────────────┐
                │   Rainfall / Weather │
                │        Data          │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │ Rainfall → Runoff    │
                │     Analysis         │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │ Drainage Digital Twin│
                │ Pipes / Nodes / Load │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │ Flood Risk & Water   │
                │ Depth Assessment      │
                └──────────┬──────────┘
                           │
                 ┌─────────┴─────────┐
                 ▼                   ▼
        ┌─────────────────┐  ┌─────────────────┐
        │ Emergency Safe  │  │ What-If          │
        │ Routing         │  │ Simulation       │
        └─────────────────┘  └─────────────────┘
```

The project interface explicitly presents a pipeline from rainfall sensing through runoff, drainage, prediction and emergency decision-making.

---

# 🌧️ 1. Real-Time Rainfall Monitoring

FloodTwin includes a dedicated **World Rainfall Monitor**.

The rainfall page uses:

* **Leaflet.js**
* **Open-Meteo API**
* Geographic sector sampling
* Rainfall intensity classification
* Interactive map markers
* Rainfall labels
* Last-update information
* Maximum rainfall
* Average rainfall
* High-risk sector counts
* Rainfall filters
* Multiple map layers

The rainfall monitor describes precipitation data being sampled across global sectors at 60-second intervals through Open-Meteo.

### Rainfall intensity

The interface classifies rainfall into:

```text
None          0 mm/hr
Light         0.1–1 mm/hr
Moderate      1–5 mm/hr
Heavy         5–15 mm/hr
Very Heavy    15–30 mm/hr
Extreme       >30 mm/hr
```

These categories are represented directly in the rainfall map UI.

---

# 🗺️ 2. Interactive Geographic Intelligence

The project uses **Leaflet** for geographic visualization.

The main dashboard uses OpenStreetMap tiles, while the rainfall monitor provides multiple map-layer controls including:

* 🌧️ Rainfall
* 🛰️ Satellite
* 🏔️ Topographic

The rainfall engine also uses batched requests rather than making one HTTP request per sector, with batches of up to 50 coordinates and request timeout handling.

---

# 🚰 3. Drainage Digital Twin

One of FloodTwin's central concepts is a digital representation of an urban drainage network.

The dashboard represents:

```text
Drainage Pipes
      ↓
Junction Nodes
      ↓
Network Load
      ↓
Capacity
      ↓
Overflow / Failure Risk
```

The interface includes drainage nodes such as:

```text
J-103 — Harbor Basin
94% OVERLOAD

J-104 — Subway Outflow
FAILURE RISK
```

It also presents drainage capacity and load information directly within the dashboard.

---

# 🌊 4. Water Depth & Flood Risk

FloodTwin uses a water-depth-based risk tier system.

The current UI defines:

|   Water Depth | Risk Tier   |
| ------------: | ----------- |
|    `0–0.10 m` | 🟢 SAFE     |
| `0.10–0.20 m` | 🟡 CAUTION  |
| `0.20–0.40 m` | 🟠 WARNING  |
|     `>0.40 m` | 🔴 CRITICAL |

This logic is implemented in the dashboard JavaScript.

The dashboard displays:

* Current water depth
* Current risk tier
* Depth meter
* Peak depth
* Rainfall rate
* Critical junction nodes

For example, the dashboard contains a water-depth/risk card and rainfall-rate card connected to live UI elements.

---

# 🔮 5. Street-Level Flood Prediction

FloodTwin is designed around a **0–3 hour prediction window**.

The intended workflow is:

```text
Current Rainfall
      +
Weather Forecast
      +
Drainage State
      ↓
Flood Prediction
      ↓
Street-Level Water Depth
      ↓
Risk Classification
```

The interface describes this module as predicting water depth and street risk within a 0–3 hour window.

> **Implementation note:** The repository currently contains the prediction interface and frontend integration. Production-grade city-scale hydrological/ML forecasting should be treated as an ongoing development area rather than assumed to be fully implemented.

---

# ⚡ 6. What-If Flood Simulation

FloodTwin includes a **What-If Simulation** interface for testing drainage failures.

Example scenario:

> **What if a critical drain becomes blocked?**

The dashboard provides a simulation section specifically for modelling critical drain blockage and upstream flood propagation.

Conceptually:

```text
Normal Drainage
       │
       ▼
 Block Critical Node
       │
       ▼
Recalculate Network
       │
       ▼
Flood Propagation
       │
       ▼
Identify Affected Areas
```

This provides a foundation for future infrastructure-risk and disaster-response simulation.

---

# 🛡️ 7. Emergency Safe Routing

FloodTwin incorporates the concept of **flood-aware navigation**.

Instead of treating a road network as static:

```text
Road A ───────────── Road B
```

the system can conceptually treat roads as dynamic assets whose safety changes with flood conditions:

```text
Road A ── SAFE ── Road B
             │
             ├── Flooded
             │
             └── REROUTE
```

The platform describes emergency routing as continuously rerouting citizens and first responders around hazardous roads.

This is particularly important for future expansion into **street-by-street rescue planning**.

---

# 📡 8. Citizen Incident Intelligence

The platform also defines a citizen incident-feed concept.

Ground-level reports can provide information that fixed infrastructure may not immediately capture:

```text
Citizen Report
      +
Sensor / Weather Data
      +
Map Location
      ↓
Unified Situational Picture
```

The landing interface describes crowdsourced flood reports being merged with sensor information.

---

# 🔐 9. Authentication Interface

The project includes dedicated:

* `login.html`
* `signup.html`

pages.

The login interface is branded as access to FloodTwin's municipal decision-support environment.

The signup interface similarly provides account creation for the FloodTwin platform.

> Authentication backend implementation should be considered separately from the frontend authentication screens.

---

# 🌓 10. Dark / Light Operational Modes

FloodTwin supports two visual modes:

### 🌙 Dark EOC Mode

Designed around an Emergency Operations Center aesthetic.

### ☀️ Light Municipal Command Mode

Designed around a cleaner municipal dashboard presentation.

The selected theme is persisted using `localStorage`, allowing the user's preference to remain across page loads.

The same theme state is also used by the rainfall-map interface.

---

# 🏗️ Project Structure

```text
FloodTwin/
│
├── index.html
│       └── Main flood intelligence dashboard
│
├── landing.html
│       └── Product / project landing page
│
├── login.html
│       └── Sign-in interface
│
├── signup.html
│       └── Account creation interface
│
├── rainfall-map.html
│       └── Global rainfall monitoring interface
│
├── style.css
│       └── Main FloodTwin design system
│
├── script.js
│       └── Main dashboard interactions and live-data UI
│
├── rainfall-map.css
│       └── Rainfall monitor styling
│
├── rainfall-map.js
│       └── Rainfall data engine and map interactions
│
├── .env.example
│       └── Environment configuration template
│
└── .gitignore
        └── Git exclusions
```

The repository's `.gitignore` excludes items such as Python environments, Node modules, `.env`, and OSRM data caches.

---

# 🧰 Technology Stack

## Frontend

* HTML5
* CSS3
* JavaScript
* Responsive CSS
* CSS animations
* Intersection Observer API
* Browser Local Storage

## Mapping

* [Leaflet.js](https://leafletjs.com/)
* [OpenStreetMap](https://www.openstreetmap.org/)
* Satellite / topographic map layers

Leaflet 1.9.4 is loaded by the mapping interfaces.

## Weather Data

* [Open-Meteo](https://open-meteo.com/)

The rainfall engine is explicitly implemented around Open-Meteo and does not require an API key for its weather-data requests.

## Backend Integration

The dashboard currently contains frontend integration with a local forecast endpoint:

```text
GET /api/forecast?lat=18.96&lng=72.82
```

The frontend consumes returned fields including:

```text
depth_m
risk
rainfall_mm_hr
```

and maps them into the dashboard's water-depth, network-load and rainfall displays.

---

# 🔄 Data Flow

The current architecture can be represented as:

```text
             WEATHER DATA
                  │
                  ▼
        ┌───────────────────┐
        │  Rainfall Engine  │
        └─────────┬─────────┘
                  │
          ┌───────┴────────┐
          ▼                ▼
   Rainfall Map      Flood Dashboard
          │                │
          │        ┌───────┴────────┐
          │        ▼                ▼
          │   Water Depth      Drainage State
          │        │                │
          │        └───────┬────────┘
          │                ▼
          │        Risk Assessment
          │                │
          └────────┬───────┘
                   ▼
          Decision Support
             /         \
            ▼           ▼
       Safe Routing   What-If
                     Simulation
```

---

# 🌍 Rainfall Data Engine

The rainfall map samples predefined geographic sectors.

The JavaScript implementation includes extensive coverage across India and major global locations.

Instead of sending an individual HTTP request for every location, the system batches coordinates:

```text
Sector Grid
    ↓
Batch locations
    ↓
Open-Meteo request
    ↓
Receive precipitation
    ↓
Process rainfall intensity
    ↓
Render map markers
```

The implementation also includes request staggering to reduce the possibility of HTTP rate limiting.

---

# 🧪 Fallback Weather Behaviour

The rainfall engine contains fallback logic for cases where Open-Meteo returns no usable precipitation data or is rate-limited.

In that situation, the frontend generates dynamically changing rainfall values based on:

* Geographic location
* Time bucket
* Deterministic pseudo-random values
* Regional rainfall classifications

The implementation explicitly identifies this as a fallback mechanism.

> **Important:** These fallback values should not be interpreted as authoritative meteorological measurements.

---

# 📊 Dashboard

The main dashboard acts as the operational control surface.

It brings together:

```text
┌─────────────────────────────────────────────┐
│              FLOODTWIN EOC                  │
├───────────────────────┬─────────────────────┤
│                       │                     │
│   Interactive Map     │  Water Depth       │
│                       │  Rainfall          │
│   Flood / Drainage    │  Risk Tier         │
│   Visualization       │  Critical Nodes    │
│                       │  Simulation        │
│                       │                     │
└───────────────────────┴─────────────────────┘
```

The dashboard contains dedicated metric cards for water depth, rainfall rate, critical drainage junctions and the blockage simulation suite.

---

# 🚀 Running the Project

## 1. Clone the repository

```bash
git clone https://github.com/Agniiiiiman/Floodtwin.git
cd Floodtwin
```

## 2. Open the frontend

For the static frontend pages, you can serve the repository using a local HTTP server.

For example:

```bash
python -m http.server 5500
```

Then open:

```text
http://localhost:5500/
```

---

## 3. Dashboard backend

The main dashboard currently expects a local forecast service at:

```text
http://localhost:8000/api/forecast
```

If the backend is not running, portions of the dashboard that depend on this endpoint will not receive live backend forecast data.

---

# ⚙️ Configuration

A `.env.example` file is included in the repository.

Do **not** commit actual secrets:

```text
.env
```

is explicitly excluded through `.gitignore`.

---

# 📍 Current Implementation Status

The project is actively evolving. To avoid overstating the system, capabilities should be viewed in the following categories.

## ✅ Currently Implemented

* Main FloodTwin dashboard UI
* Flood-risk visualization
* Water-depth risk tiers
* Rainfall monitoring interface
* Interactive Leaflet maps
* Open-Meteo rainfall integration
* Global rainfall sector grid
* Batched rainfall requests
* Rainfall classification
* Rainfall map layers
* Dark/light theme switching
* Persistent theme preference
* Responsive navigation
* Landing page
* Login UI
* Signup UI
* What-if simulation interface
* Drainage digital-twin visualization
* Backend forecast API integration from the dashboard

---

## 🟡 In Development / Requires Backend & Model Integration

* Production-grade hydrological modelling
* City-scale rainfall → runoff modelling
* Real municipal drainage-network ingestion
* Production street-level flood forecasting
* Robust sensor integration
* Production authentication
* Persistent user/account backend
* Real-time municipal data pipelines
* Operational emergency routing
* Production-grade rescue planning

---

## 🔭 Planned / Future Direction

### Street-by-Street Rescue Planning

One of the major directions for FloodTwin is moving beyond simply showing flooded locations.

The objective is to generate an actionable rescue plan for:

```text
Every street
Every junction
Every affected location
Every evacuation corridor
```

A future system could combine:

```text
Flood Depth
     +
Road Accessibility
     +
Drainage Condition
     +
Population / Critical Locations
     +
Emergency Vehicle Access
     +
Safe Corridors
     ↓
Dynamic Rescue Plan
```

This would transform FloodTwin from a **flood monitoring interface** into a more comprehensive **urban flood response planning system**.

---

# 🧩 Design Philosophy

FloodTwin follows an **Emergency Operations Center (EOC)** visual language.

The interface uses:

* Dark navy operational dashboards
* High-contrast risk indicators
* Blue/cyan system accents
* Clear metric cards
* Map-centric visualization
* Persistent system status
* Animated rainfall effects
* Responsive layouts

The shared design system defines explicit semantic states for:

```text
SAFE
CAUTION
WARNING
CRITICAL
EMERGENCY
```

alongside system colors for interactive and neutral states.

---

# 🎯 Project Goals

FloodTwin aims to help answer five critical questions during an urban flood:

### 01 — What is happening?

Monitor rainfall, water depth and infrastructure conditions.

### 02 — Where is the risk?

Locate dangerous streets, junctions and flood-prone areas.

### 03 — What happens next?

Use forecasting and simulation to anticipate flood progression.

### 04 — What should we do?

Support safer routing and emergency decision-making.

### 05 — What if something fails?

Simulate infrastructure failures before they become real emergencies.

---

# 🏙️ Potential Users

FloodTwin is primarily designed around municipal and emergency-response use cases, including:

* Municipal authorities
* Emergency Operations Centers
* Disaster-management teams
* Urban planners
* Drainage departments
* First responders
* Infrastructure operators
* Researchers
* Smart-city programs

---

# 🔬 Hackathon Context

FloodTwin was developed in the context of **Smart India Hackathon** and is presented as an urban flood intelligence / drainage digital-twin solution.

The interface identifies the project with the Smart India Hackathon context and the “Error 404 / Flood Network” branding.

---

# 🛣️ Roadmap

```text
                    FLOODTWIN ROADMAP

                         CURRENT
                            │
                            ▼
                 ┌────────────────────┐
                 │ Flood Intelligence  │
                 │ Dashboard           │
                 └─────────┬──────────┘
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
        Rainfall       Drainage       Flood Risk
        Monitoring     Digital Twin   Prediction
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                    WHAT-IF ENGINE
                           │
                           ▼
                  SAFE ROUTING ENGINE
                           │
                           ▼
                 STREET-LEVEL RESPONSE
                           │
                           ▼
                 🚨 RESCUE PLANNING
                           │
                           ▼
              CITY-SCALE DIGITAL TWIN
```

---

# 🤝 Contributing

Contributions are welcome.

If you want to contribute:

```bash
# Fork the repository

# Create a feature branch
git checkout -b feature/your-feature

# Make your changes

# Commit
git commit -m "Add your feature"

# Push
git push origin feature/your-feature
```

Then open a Pull Request.

---

# ⚠️ Important Disclaimer

FloodTwin is a research / development project and should **not be treated as a certified emergency-warning or life-safety system**.

Weather data, simulated values, predictions and routing recommendations may contain errors or uncertainty.

Any real-world deployment should include:

* Validated hydrological models
* Official meteorological data
* Verified drainage-network data
* Field sensors
* Disaster-management protocols
* Human emergency-operator oversight
* Extensive validation and testing

---

# 📜 License

Add the project's intended open-source license here.

For example:

```text
MIT License
```

if the repository is intended to be released under MIT.

---

# 👥 Team

**FloodTwin — Error 404 / Flood Network**

Built for intelligent, proactive and data-driven urban flood management.

---

## 🌊 FloodTwin

> **Don't wait for the flood to arrive.
> Understand it before it happens.**

**Rainfall → Runoff → Drainage → Flood Risk → Routing → Response**

---
