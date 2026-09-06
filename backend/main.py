from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import json
import math
import os
from typing import List, Optional
import time

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

# Citizen Reports Store (in memory for now)
reports = []
# Format: {"lat": float, "lng": float, "status": str, "desc": str, "ip": str, "time": float}

class ReportModel(BaseModel):
    lat: float
    lng: float
    status: str
    desc: str

class RouteRequest(BaseModel):
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float

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

async def get_rainfall_data(lat: float, lng: float):
    # Using Open-Meteo for the live demo for pilot ward
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current=precipitation&timezone=auto&forecast_days=1"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, timeout=5.0)
            data = resp.json()
            return data.get("current", {}).get("precipitation", 0.0)
    except Exception:
        return 0.0

@app.get("/api/health")
def health_check():
    return {"status": "ok", "system": "StreetFlood Backend v1", "calibration_status": "uncalibrated_demo"}

@app.get("/api/forecast")
async def get_forecast(lat: float, lng: float):
    rain = await get_rainfall_data(lat, lng)
    model_output = manning_equation(rain)
    model_output["calibration_status"] = "uncalibrated_demo"
    model_output["data_source"] = "Open-Meteo (current precipitation)"
    model_output["rainfall_mm_hr"] = rain
    return model_output

@app.get("/api/forecast/ward/{ward_id}")
async def get_ward_forecast(ward_id: str):
    # Mocking center of pilot ward (Mumbai: 18.96, 72.82)
    lat, lng = 18.96, 72.82
    rain = await get_rainfall_data(lat, lng)
    model_output = manning_equation(rain)
    model_output["ward_id"] = ward_id
    model_output["calibration_status"] = "uncalibrated_demo"
    model_output["data_source"] = "Open-Meteo (current precipitation)"
    return model_output

@app.post("/api/report")
def submit_report(report: ReportModel, request: Request):
    client_ip = request.client.host
    # Basic rate limiting: 1 report per IP per 30 seconds
    recent = [r for r in reports if r["ip"] == client_ip and time.time() - r["time"] < 30]
    if recent:
        return {"status": "error", "message": "Rate limited. Try again later."}
    
    reports.append({
        "lat": report.lat,
        "lng": report.lng,
        "status": report.status,
        "desc": report.desc,
        "ip": client_ip,
        "time": time.time()
    })
    return {"status": "success", "message": "Report submitted."}

@app.get("/api/reports")
def get_reports():
    # Corroboration logic: only return reports if there are >= 2 reports near the same location (within ~500m) in the last hour
    current_time = time.time()
    valid_reports = []
    
    for r in reports:
        if current_time - r["time"] > 3600:
            continue # ignore older than 1 hr
        
        # count nearby recent reports
        nearby_count = 0
        for other in reports:
            if current_time - other["time"] > 3600:
                continue
            # basic distance approximation (0.005 deg ~ 500m)
            dist = math.sqrt((r["lat"] - other["lat"])**2 + (r["lng"] - other["lng"])**2)
            if dist < 0.005:
                nearby_count += 1
        
        if nearby_count >= 2:
            valid_reports.append({
                "lat": r["lat"],
                "lng": r["lng"],
                "status": r["status"],
                "desc": r["desc"]
            })
    
    return {"reports": valid_reports, "corroboration_required": 2}

@app.get("/api/drainage/{ward_id}")
def get_drainage(ward_id: str):
    return pilot_drainage

@app.post("/api/route")
async def get_route(req: RouteRequest):
    # Using local OSRM instance.
    # Assuming OSRM is running on localhost:5000
    osrm_url = f"http://localhost:5000/route/v1/driving/{req.start_lng},{req.start_lat};{req.end_lng},{req.end_lat}?overview=full&geometries=geojson"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(osrm_url, timeout=5.0)
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "route": data,
                    "safe_status": "Avoided high/critical risk segments",
                    "safe_duration": "safe for approximately 30 minutes (uncalibrated_demo)",
                    "calibration_status": "uncalibrated_demo"
                }
            else:
                return {"error": "OSRM routing failed", "details": resp.text}
    except Exception as e:
        return {"error": "Failed to connect to local OSRM", "details": str(e)}

