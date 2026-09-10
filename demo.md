# StreetFlood Deterministic 3-Minute Judge Demo Flow

This document provides a step-by-step, 17-part deterministic walkthrough for judges and evaluators.

---

### Part 1: Open StreetFlood & System Overview (0:00 - 0:25)
1. **Open Platform**: Navigate to `http://localhost:3000`.
2. **Show Status**: Point out the live provenance badge (`LIVE` / `DEMO MODE` / `OFFLINE`) confirming real backend communication.
3. **10-Second Brief**: Highlight the executive briefing matrix answering Where, Why, Which road to avoid, Blockage impact, and Rainfall surge.

---

### Part 2: Rainfall & Street Flood Risk (0:25 - 0:50)
4. **Show Rainfall**: Navigate to `/rainfall-map` or inspect the live rainfall widget showing precipitation from Open-Meteo Satellite Sync.
5. **Show Street Risk**: Open `/digital-twin` to display the South Mumbai pilot network with classified segments (`Low`, `Medium`, `High`, `Critical`).
6. **Select Inundated Segment**: Click on `Pilot Road Junction Low Point` (flagged `Critical`/`High`).

---

### Part 3: Hydrodynamic Explainability (0:50 - 1:15)
7. **Show Model Explanation**: Inspect the generated physical explanation:
   - Modeled runoff inflow $Q = C \cdot i \cdot A$ ($0.89\,\text{m}^3/\text{s}$).
   - Estimated drain capacity ($0.55\,\text{m}^3/\text{s}$).
   - Exact hydraulic utilization ($162\%$), elevation ($5.1\,\text{m}$), slope ($0.2\%$), and distance to drainage node ($92\,\text{m}$).
   - Note: Explain that these metrics are computed dynamically from actual geometry rather than generic AI text.

---

### Part 4: Dynamic Safe Routing (1:15 - 1:45)
8. **Open Route Planner**: Navigate to `/safe-route`.
9. **Set Coordinates**: Use the pilot preset coordinates (`18.9610, 72.8220` to `18.9560, 72.8300`).
10. **Calculate Route**: Submit the route request.
11. **Show Safe Avoidance**: Demonstrate how the router excludes `Pilot Road Junction Low Point` and selects the flood-safe detour corridor.
12. **Show Validity Window**: Point out the live advisory badge: *"Safe for approximately 30 minutes under current conditions."*

---

### Part 5: Drainage Digital Twin & What-If Stress Testing (1:45 - 2:15)
13. **Open Digital Twin**: Navigate to `/simulation`.
14. **Drainage Blockage**: Select `node_03` and switch scenario from `NORMAL` to `BLOCKED`.
15. **Show Downstream Surcharge**: Observe capacity drop to $0.20\,\text{m}^3/\text{s}$, utilization surge above $100\%$, and downstream streets turning `Critical`.
16. **Rainfall Scaling**: Increase rainfall slider from $10\,\text{mm/hr}$ to $80\,\text{mm/hr}$ and observe the runoff and surcharge escalate across connected catchments.

---

### Part 6: Citizen Corroboration (2:15 - 2:35)
17. **Submit Report 1**: Submit a report at `18.9612, 72.8214` with severity `Severe`.
    - Feed displays: *"Waiting for corroboration (1/2)"*.
18. **Submit Report 2 (Nearby & Recent)**: Submit a second report within 50m and 30min window.
    - Feed updates to: *"Confirmed by 2 reports"*.
    - Note: Point out the honest `CITIZEN CORROBORATION` banner.

---

### Part 7: SUMO Traffic Simulation & Provenance (2:35 - 3:00)
19. **Show Real SUMO Results**:
    - Real native SUMO 1.27.1 simulation results on the pilot network:
      - **Travel Time**: Baseline `93.22 s` $\rightarrow$ Flooded Detour `132.63 s` (+42.3%).
      - **Congestion (Time Loss)**: `5.39 s` $\rightarrow$ `10.55 s` (+95.7%).
      - **Affected Edges**: `3` (`street_segment_02` closed; bypass edges active).
20. **Show Data Provenance**: Point to the Data Sources & Qualifiers table detailing every layer (`LIVE`, `ESTIMATED`, `SYNTHETIC`, `UNCALIBRATED`, `LOCAL`).
21. **Close**: Summarize StreetFlood as an open, honest, physics-grounded decision support platform.
