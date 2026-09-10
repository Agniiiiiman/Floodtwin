from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import json
import math
import os
from typing import List, Optional
import time
import uuid

app = FastAPI(title="StreetFlood API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mocked pilot drainage data
def load_drainage_data():
    path = os.path.join(os.path.dirname(__file__), "data", "pilot_drainage_graph.geojson")
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return {"type": "FeatureCollection", "features": []}

pilot_drainage = load_drainage_data()


def load_street_segments():
    path = os.path.join(os.path.dirname(__file__), "data", "pilot_street_segments.geojson")
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return {"type": "FeatureCollection", "features": []}


pilot_street_segments = load_street_segments()

# Citizen Reports Store (in memory for now)
reports = []
# Format: {"lat": float, "lng": float, "status": str, "desc": str, "ip": str, "time": float}

class ReportModel(BaseModel):
    lat: float
    lng: float
    severity: str = "Moderate"
    text: str = ""
    image_url: Optional[str] = None
    status: str = "submitted"
    desc: Optional[str] = None

class RouteRequest(BaseModel):
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    rainfall_mm_hr: Optional[float] = None


class DrainageWhatIfRequest(BaseModel):
    node_id: str
    scenario: str = "NORMAL"
    rainfall_mm_hr: float = 20.0


CORROBORATION_RADIUS_METERS = 50.0
CORROBORATION_WINDOW_SECONDS = 30 * 60


def distance_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Return the great-circle distance between two coordinates."""
    earth_radius = 6_371_000
    lat1_rad, lat2_rad = math.radians(lat1), math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lng = math.radians(lng2 - lng1)
    haversine = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng / 2) ** 2
    )
    return 2 * earth_radius * math.asin(math.sqrt(haversine))


def nearby_recent_reports(report: dict, current_time: float) -> list[dict]:
    return [
        other
        for other in reports
        if current_time - other["time"] <= CORROBORATION_WINDOW_SECONDS
        and distance_meters(report["lat"], report["lng"], other["lat"], other["lng"])
        <= CORROBORATION_RADIUS_METERS
    ]

def manning_equation(rainfall_mm_hr: float):
    # Deterministic capacity-overflow model utilizing Manning's equation for pipe flow 
    # and simple runoff coefficients.
    # rainfall_mm_hr to flow...
    # Mocking a simple logic: capacity exceeded when rainfall > 50 mm/hr
    base_capacity = 50.0 
    if rainfall_mm_hr <= 10:
        return {"risk": "Low", "depth_m": "0.0 - 0.1", "confidence": "High", "reason": f"Inflow is well within capacity (rainfall: {rainfall_mm_hr}mm/hr)"}
    elif rainfall_mm_hr <= 30:
        return {"risk": "Medium", "depth_m": "0.1 - 0.3", "confidence": "Medium", "reason": f"Inflow is nearing 60% capacity (rainfall: {rainfall_mm_hr}mm/hr)"}
    elif rainfall_mm_hr <= 50:
        return {"risk": "High", "depth_m": "0.3 - 0.6", "confidence": "Medium", "reason": f"Inflow is nearing capacity (rainfall: {rainfall_mm_hr}mm/hr)"}
    else:
        excess = ((rainfall_mm_hr - base_capacity) / base_capacity) * 100
        return {"risk": "Critical", "depth_m": "> 0.6", "confidence": "Low", "reason": f"Node 14: inflow exceeds capacity by {excess:.1f}%"}


def classify_segment_risk(rainfall_mm_hr: float, properties: dict, capacity_override: Optional[float] = None) -> dict:
    rainfall_m_per_second = max(0, rainfall_mm_hr) / 1000 / 3600
    area_m2 = properties["contributing_area_km2"] * 1_000_000
    runoff = properties["runoff_coefficient"] * rainfall_m_per_second * area_m2
    capacity = capacity_override if capacity_override is not None else {
        "street_segment_01": 0.9,
        "street_segment_02": 0.55,
        "street_segment_03": 1.1,
    }.get(properties["id"], 0.75)
    utilization = (runoff / capacity) * 100 if capacity else 0
    feature_penalty = 0
    reasons = []
    if properties["local_depression"]:
        feature_penalty += 30
        reasons.append("local depression")
    if properties["nearest_drainage_node_m"] > 75:
        feature_penalty += 20
        reasons.append(f"{properties['nearest_drainage_node_m']}m from nearest drainage node")
    if properties["road_width_m"] < 6:
        feature_penalty += 10
        reasons.append("narrow road cross-section")
    adjusted_utilization = utilization + feature_penalty
    if adjusted_utilization > 140:
        risk, depth, confidence = "Critical", ">0.6 m", "Low"
    elif adjusted_utilization > 100:
        risk, depth, confidence = "High", "0.3–0.6 m", "Medium"
    elif adjusted_utilization > 60:
        risk, depth, confidence = "Medium", "0.1–0.3 m", "Medium"
    else:
        risk, depth, confidence = "Low", "0.0–0.1 m", "High"
    if not reasons:
        reasons.append("elevated segment with nearby drainage connection")
    explanation = (
        f"Modeled inflow {runoff:.2f} m³/s versus estimated capacity {capacity:.2f} m³/s "
        f"({utilization:.0f}% hydraulic utilization); elevation {properties['elevation_m']:.1f} m, "
        f"slope {properties['slope_percent']:.1f}%, contributing area {properties['contributing_area_km2']:.2f} km², "
        f"{properties['nearest_drainage_node_m']}m from node {STREET_NODE_MAP.get(properties['id'], 'unknown')}; {', '.join(reasons)}."
    )
    return {
        "risk": risk,
        "indicative_depth_range": depth,
        "confidence": confidence,
        "rainfall_mm_hr": rainfall_mm_hr,
        "runoff_coefficient": properties["runoff_coefficient"],
        "contributing_area_km2": properties["contributing_area_km2"],
        "modeled_inflow_m3s": round(runoff, 3),
        "estimated_capacity_m3s": capacity,
        "overflow_m3s": round(max(0.0, runoff - capacity), 3),
        "surcharge": runoff > capacity,
        "hydraulic_utilization_percent": round(utilization, 1),
        "feature_penalty_points": feature_penalty,
        "explanation": explanation,
        "geometry_features": {
            "road_width_m": properties["road_width_m"],
            "elevation_m": properties["elevation_m"],
            "slope_percent": properties["slope_percent"],
            "nearest_drainage_node_m": properties["nearest_drainage_node_m"],
            "local_depression": properties["local_depression"],
            "relevant_node_id": STREET_NODE_MAP.get(properties["id"]),
        },
    }


STREET_NODE_MAP = {
    "street_segment_01": "node_02",
    "street_segment_02": "node_03",
    "street_segment_03": "node_04",
}


def get_drainage_node(node_id: str) -> dict:
    for feature in pilot_drainage["features"]:
        if feature["geometry"]["type"] == "Point" and feature["properties"]["id"] == node_id:
            return feature["properties"]
    raise HTTPException(status_code=404, detail=f"Drainage node not found: {node_id}")


def drainage_what_if(request: DrainageWhatIfRequest) -> dict:
    node = get_drainage_node(request.node_id)
    scenario = request.scenario.upper()
    scenario_factors = {"NORMAL": 1.0, "BLOCKED": 0.05, "50% CAPACITY": 0.5, "SEVERE RAINFALL": 1.0}
    if scenario not in scenario_factors:
        raise HTTPException(status_code=400, detail="Scenario must be NORMAL, BLOCKED, 50% CAPACITY, or SEVERE RAINFALL")
    rainfall = 80.0 if scenario == "SEVERE RAINFALL" else max(0, request.rainfall_mm_hr)
    original_capacity = float(node["capacity"])
    modified_capacity = original_capacity * scenario_factors[scenario]
    connected_segments = [
        feature for feature in pilot_street_segments["features"]
        if STREET_NODE_MAP.get(feature["properties"]["id"]) == request.node_id
    ]
    segment_outputs = []
    node_inflow = 0.0
    for feature in connected_segments:
        base_output = classify_segment_risk(rainfall, feature["properties"])
        node_inflow += base_output["modeled_inflow_m3s"]
        base_capacity = base_output["estimated_capacity_m3s"]
        ratio = modified_capacity / original_capacity if original_capacity else 0
        output = classify_segment_risk(rainfall, feature["properties"], base_capacity * ratio)
        output["id"] = feature["properties"]["id"]
        output["name"] = feature["properties"]["name"]
        output["node_id"] = request.node_id
        segment_outputs.append(output)
    overflow = max(0.0, node_inflow - modified_capacity)
    utilization = (node_inflow / modified_capacity * 100) if modified_capacity else 0
    return {
        "node_id": request.node_id,
        "scenario": scenario,
        "rainfall_mm_hr": rainfall,
        "source": "synthetic pilot drainage graph",
        "calibration_status": "uncalibrated_demo",
        "original_capacity_m3s": original_capacity,
        "modified_capacity_m3s": round(modified_capacity, 3),
        "inflow_m3s": round(node_inflow, 3),
        "utilization_percent": round(utilization, 1),
        "overflow_m3s": round(overflow, 3),
        "surcharge": overflow > 0,
        "downstream_streets_affected": [output["name"] for output in segment_outputs],
        "risk_changes": segment_outputs,
    }


def route_near_segment(route_coordinates: list, segment_coordinates: list, threshold_meters: float = 80) -> bool:
    """Use a local equirectangular distance check to identify avoided street segments."""
    for route_lng, route_lat in route_coordinates:
        for segment_lng, segment_lat in segment_coordinates:
            distance = math.sqrt(
                ((route_lng - segment_lng) * 105_000) ** 2
                + ((route_lat - segment_lat) * 111_000) ** 2
            )
            if distance <= threshold_meters:
                return True
    return False


def live_segment_risks(rainfall_mm_hr: float) -> list[dict]:
    return [
        {
            "id": feature["properties"]["id"],
            "name": feature["properties"]["name"],
            "risk": classify_segment_risk(rainfall_mm_hr, feature["properties"])["risk"],
            "geometry": feature["geometry"],
        }
        for feature in pilot_street_segments["features"]
    ]

async def get_rainfall_data(lat: float, lng: float):
    # Using Open-Meteo for the live demo for pilot ward
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current=precipitation&timezone=auto&forecast_days=1"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, timeout=5.0)
            data = resp.json()
            return data.get("current", {}).get("precipitation", 0.0), "live"
    except Exception:
        return 0.0, "demo"

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "mode": "live",
        "system": "StreetFlood Backend v1",
        "calibration_status": "uncalibrated_demo",
    }

@app.get("/api/forecast")
async def get_forecast(lat: float, lng: float):
    rain, data_mode = await get_rainfall_data(lat, lng)
    model_output = manning_equation(rain)
    model_output["calibration_status"] = "uncalibrated_demo"
    model_output["data_mode"] = data_mode
    model_output["data_source"] = (
        "Open-Meteo (current precipitation)"
        if data_mode == "live"
        else "Synthetic fallback precipitation"
    )
    model_output["rainfall_mm_hr"] = rain
    return model_output

@app.get("/api/forecast/ward/{ward_id}")
async def get_ward_forecast(ward_id: str):
    # Mocking center of pilot ward (Mumbai: 18.96, 72.82)
    lat, lng = 18.96, 72.82
    rain, data_mode = await get_rainfall_data(lat, lng)
    model_output = manning_equation(rain)
    model_output["ward_id"] = ward_id
    model_output["calibration_status"] = "uncalibrated_demo"
    model_output["data_mode"] = data_mode
    model_output["data_source"] = (
        "Open-Meteo (current precipitation)"
        if data_mode == "live"
        else "Synthetic fallback precipitation"
    )
    return model_output

@app.post("/api/report")
def submit_report(report: ReportModel, request: Request):
    client_ip = request.client.host
    # Basic rate limiting: 1 report per IP per 30 seconds
    recent = [r for r in reports if r["ip"] == client_ip and time.time() - r["time"] < 30]
    if recent:
        return {"status": "error", "message": "Rate limited. Try again later."}
    
    report_time = time.time()
    reports.append({
        "id": str(uuid.uuid4()),
        "lat": report.lat,
        "lng": report.lng,
        "severity": report.severity,
        "text": report.text or report.desc or "",
        "image_url": report.image_url,
        "status": report.status,
        "ip": client_ip,
        "time": report_time,
    })
    nearby_count = len(nearby_recent_reports(reports[-1], time.time()))
    corroborated = nearby_count >= 2
    return {
        "status": "success",
        "message": (
            "Flooding confirmed at this location."
            if corroborated
            else f"Waiting for corroboration ({nearby_count}/2)."
        ),
        "report_count": nearby_count,
        "corroborated": corroborated,
        "report_id": reports[-1]["id"],
        "reported_at": report_time,
    }

@app.get("/api/reports")
def get_reports():
    current_time = time.time()
    recent_reports = [
        report
        for report in reports
        if current_time - report["time"] <= CORROBORATION_WINDOW_SECONDS
    ]
    report_view = []
    for report in recent_reports:
        nearby_count = len(nearby_recent_reports(report, current_time))
        report_view.append(
            {
                "lat": report["lat"],
                "lng": report["lng"],
                    "id": report.get("id", "legacy-" + str(report["time"])),
                    "severity": report.get("severity", report.get("status", "Moderate")),
                    "text": report.get("text", report.get("desc", "")),
                    "image_url": report.get("image_url"),
                    "status": report.get("status", "submitted"),
                "report_count": nearby_count,
                "corroborated": nearby_count >= 2,
                "reported_at": report["time"],
            }
        )

    return {
        "reports": report_view,
        "corroboration_required": 2,
        "radius_meters": CORROBORATION_RADIUS_METERS,
        "window_minutes": 30,
    }

@app.get("/api/drainage/{ward_id}")
def get_drainage(ward_id: str):
    return pilot_drainage


@app.get("/api/street-risk/{ward_id}")
def get_street_risk(ward_id: str, rainfall_mm_hr: float = 20.0):
    return {
        "ward_id": ward_id,
        "data_mode": "demo",
        "source": "synthetic pilot street features",
        "calibration_status": "uncalibrated_demo",
        "rainfall_mm_hr": rainfall_mm_hr,
        "segments": [
            {
                "id": feature["properties"]["id"],
                "name": feature["properties"]["name"],
                "source": feature["properties"]["source"],
                "geometry": feature["geometry"],
                **classify_segment_risk(rainfall_mm_hr, feature["properties"]),
            }
            for feature in pilot_street_segments["features"]
        ],
    }


@app.post("/api/drainage/what-if")
def drainage_what_if_endpoint(request: DrainageWhatIfRequest):
    return drainage_what_if(request)

@app.post("/api/route")
async def get_route(req: RouteRequest):
    osrm_base_url = os.getenv("OSRM_BACKEND_URL", "http://localhost:5000").rstrip("/")
    if req.rainfall_mm_hr is None:
        rainfall_mm_hr, rainfall_mode = await get_rainfall_data(req.start_lat, req.start_lng)
    else:
        rainfall_mm_hr, rainfall_mode = req.rainfall_mm_hr, "demo"
    high_risk_segments = [
        segment for segment in live_segment_risks(rainfall_mm_hr)
        if segment["risk"] in {"High", "Critical"}
    ]
    osrm_url = f"{osrm_base_url}/route/v1/driving/{req.start_lng},{req.start_lat};{req.end_lng},{req.end_lat}?overview=full&geometries=geojson&alternatives=true"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(osrm_url, timeout=5.0)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("routes", [])
                safe_candidates = [
                    route for route in candidates
                    if not any(
                        route_near_segment(route.get("geometry", {}).get("coordinates", []), segment["geometry"]["coordinates"])
                        for segment in high_risk_segments
                    )
                ]
                if not safe_candidates:
                    raise HTTPException(status_code=503, detail="No flood-safe local OSRM route available")
                selected_route = min(safe_candidates, key=lambda route: route.get("duration", float("inf")))
                avoided = [segment["name"] for segment in high_risk_segments]
                return {
                    "route": {**data, "routes": [selected_route]},
                    "safe_status": "Route calculated with live flood-risk exclusions; verify conditions before departure.",
                    "safe_duration": "Safe for approximately 30 minutes under current conditions; conditions can change as rainfall evolves.",
                    "calibration_status": "uncalibrated_demo",
                    "rainfall_mm_hr": rainfall_mm_hr,
                    "rainfall_mode": rainfall_mode,
                    "avoided_segments": avoided,
                }
            raise HTTPException(status_code=503, detail="Route service unavailable")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=503, detail="Route service unavailable")

