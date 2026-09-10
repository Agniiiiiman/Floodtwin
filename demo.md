# StreetFlood 3-Minute Judge Demo

## 0:00-0:30: Problem

Say: "Existing flood systems can provide area-level warnings, but citizens need to know which streets are actually dangerous. StreetFlood translates rainfall and drainage information into actionable street-level risk."

Open `http://localhost:3000` and point out the `LIVE`, `DEMO MODE`, or `OFFLINE` badge. Explain that the badge identifies the provenance of the displayed data.

## 0:30-1:00: Dashboard

Scroll to the South Mumbai pilot ward. Show the risk banner, indicative depth range, rainfall source, synthetic drainage-network label, and interactive map. Open the What-If panel and change rainfall and blockage values.

Say: "These are indicative ranges, not centimeter-level predictions."

## 1:00-1:30: Explainability

Run the simulation and expand `Model assumptions and calculation`. Show the rainfall/inflow proxy, effective capacity, overflow proxy, and the calculation description. Explain that the MVP exposes its synthetic baseline instead of presenting it as calibrated hydrology.

## 1:30-2:00: Safe route

Open the safe-route panel, use one of the preset coordinate pairs, and submit the route. When OSRM is running, show the green returned route, origin, destination, distance, and ETA. If OSRM is unavailable, show the visible `Route service unavailable` state and explain that the system refuses to invent a route.

## 2:00-2:30: Citizen corroboration

Submit a report. The feed should show `Waiting (1/2)`. Submit a second report within 50 meters and 30 minutes using a separate client/IP when testing the backend. The feed then shows `Confirmed`.

Say: "A single report does not trigger a confirmed alert. Two nearby reports inside the time window are required."

## 2:30-3:00: Close

Say: "StreetFlood is a pilot decision-support layer built around open data, explainability, and honest uncertainty. It complements existing systems rather than replacing them."

Return to the dashboard and point to the provenance badge and last-updated timestamp.

## Demo limitations

- The pilot drainage topology is synthetic and labelled in the interface.
- The fallback forecast is demo data and labelled as such.
- Route visualization requires a reachable OSRM service.
- Citizen reports are stored in memory and reset when the backend restarts.
