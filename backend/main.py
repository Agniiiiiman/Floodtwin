from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import json
import math
import os
from typing import List, Optional, Dict, Any
import time
import uuid
import asyncio
try:

    from dotenv import load_dotenv
    root_env = os.path.join(os.path.dirname(__file__), "..", ".env")
    if os.path.exists(root_env):
        load_dotenv(dotenv_path=root_env)
    load_dotenv()
except ImportError:
    # Manual .env parser fallback if python-dotenv is not installed
    def _parse_env_file(path):
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k, v = k.strip(), v.strip()
                        if k and not os.environ.get(k):
                            os.environ[k] = v
    _parse_env_file(os.path.join(os.path.dirname(__file__), "..", ".env"))
    _parse_env_file(os.path.join(os.path.dirname(__file__), ".env"))


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
    description: str = ""

# --- In-Memory Emergency Incident & Call Tracking Stores ---
INCIDENT_STORE: Dict[str, Dict[str, Any]] = {}
IDEMPOTENCY_STORE: Dict[str, Dict[str, Any]] = {}

def get_emergency_contacts() -> Dict[str, str]:
    """Retrieve configured emergency contact numbers from backend environment variables."""
    return {
        "police": os.getenv("POLICE_PHONE", "+917044277303"),
        "fire": os.getenv("FIRE_EMERGENCY_PHONE", "+918585045232"),
        "disaster": os.getenv("DISASTER_RESPONSE_PHONE", "+917439549556"),
        "electricity": os.getenv("ELECTRICITY_UTILITY_PHONE", "+918282019555"),
        "control_room": os.getenv("EMERGENCY_CONTROL_ROOM_PHONE", "+918900471168"),
    }

AGENCY_NAMES = {
    "police": "Police Department",
    "fire": "Fire & Emergency Services",
    "disaster": "Disaster Response Force",
    "electricity": "Electricity / Power Utility",
    "control_room": "Emergency Control Room",
}

# 🚨 FLOOD EMERGENCY ONE-CALL API ENDPOINT
class EmergencyIncidentRequest(BaseModel):
    incidentId: Optional[str] = None
    incidentType: str = "URBAN_FLOOD"
    latitude: float
    longitude: float
    locationName: Optional[str] = "High-Precision GIS Sector"
    preciseAddress: Optional[str] = None
    accuracyMeters: Optional[float] = 3.0
    sectorCode: Optional[str] = "GIS-KLK-SEC5-02"
    riskLevel: str = "HIGH"
    waterDepth: Optional[float] = 0.8
    rainfall: Optional[float] = 84.0
    timestamp: Optional[str] = None
    notes: Optional[str] = None

class EmergencyCallRequest(BaseModel):
    incidentId: Optional[str] = None
    selectedAgencies: List[str]  # e.g. ["police", "fire", "disaster", "electricity", "control_room"]
    isLiveMode: bool = False
    idempotencyKey: Optional[str] = None
    latitude: float
    longitude: float
    locationName: Optional[str] = "High-Precision GIS Sector"
    preciseAddress: Optional[str] = None
    riskLevel: str = "HIGH"
    waterDepth: Optional[float] = None
    rainfall: Optional[float] = None
    notes: Optional[str] = None

class RetryCallRequest(BaseModel):
    incidentId: str
    selectedAgencies: Optional[List[str]] = None
    isLiveMode: bool = False

@app.post("/api/emergency/incident")
def create_emergency_incident(req: EmergencyIncidentRequest):
    inc_id = req.incidentId or f"FLD-{time.strftime('%Y')}-{uuid.uuid4().hex[:4].upper()}"
    
    twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
    twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_phone = os.getenv("TWILIO_PHONE_NUMBER")
    is_real_mode_available = bool(twilio_sid and twilio_token and twilio_phone)

    agencies = [
        {"id": "disaster", "name": "🚨 Disaster Response Force", "status": "QUEUED"},
        {"id": "fire", "name": "🚒 Fire & Emergency Services", "status": "QUEUED"},
        {"id": "police", "name": "👮 Police Department", "status": "QUEUED"},
        {"id": "electricity", "name": "⚡ Electricity / Power Utility", "status": "QUEUED"},
        {"id": "control_room", "name": "🏢 Emergency Control Room", "status": "QUEUED"}
    ]

    incident_data = {
        "incidentId": inc_id,
        "status": "RECEIVED",
        "coordinates": {"lat": req.latitude, "lng": req.longitude, "accuracy_m": req.accuracyMeters},
        "location": {"name": req.locationName, "address": req.preciseAddress, "sectorCode": req.sectorCode},
        "live_mode_available": is_real_mode_available,
        "mode_label": "LIVE MODE READY" if is_real_mode_available else "DEMO MODE (Simulated)",
        "message": f"Emergency incident registered for target ({req.latitude:.6f}°, {req.longitude:.6f}°).",
        "incident": {
            "incidentType": req.incidentType,
            "latitude": req.latitude,
            "longitude": req.longitude,
            "riskLevel": req.riskLevel,
            "waterDepth": req.waterDepth,
            "rainfall": req.rainfall,
            "timestamp": req.timestamp or time.strftime("%Y-%m-%d %H:%M:%S"),
            "notes": req.notes,
        },
        "agencies": agencies,
    }
    
    INCIDENT_STORE[inc_id] = incident_data
    return incident_data


@app.get("/api/emergency/twiml/{incident_id}")
def generate_twiml_voice(incident_id: str):
    """Generate dynamic TwiML XML voice response for automated emergency calls.
    Omits unavailable details cleanly without fabricating info.
    """
    incident = INCIDENT_STORE.get(incident_id, {})
    inc_details = incident.get("incident", {})
    loc_details = incident.get("location", {})
    
    loc_name = loc_details.get("name") or incident.get("locationName") or "unspecified target location"
    precise_addr = loc_details.get("address") or incident.get("preciseAddress")
    
    lat = inc_details.get("latitude") or incident.get("latitude")
    lng = inc_details.get("longitude") or incident.get("longitude")
    
    risk_level = inc_details.get("riskLevel") or incident.get("riskLevel") or "HIGH"
    water_depth = inc_details.get("waterDepth") if inc_details.get("waterDepth") is not None else incident.get("waterDepth")
    rainfall = inc_details.get("rainfall") if inc_details.get("rainfall") is not None else incident.get("rainfall")
    notes = inc_details.get("notes") or incident.get("notes")

    # Build prompt speech strictly avoiding fabrication
    parts = [
        "Emergency alert from Flood Twin.",
        f"Incident ID: {incident_id}.",
        "An urban flood incident has been reported.",
        f"Location: {loc_name}."
    ]
    
    if precise_addr:
        parts.append(f"Street: {precise_addr}.")
        
    if lat is not None and lng is not None:
        parts.append(f"Coordinates: {lat:.6f} degrees north, {lng:.6f} degrees east.")
        
    parts.append(f"Risk level: {risk_level}.")
    
    if water_depth is not None:
        parts.append(f"Water depth: {water_depth} meters.")
        
    if rainfall is not None:
        parts.append(f"Rainfall: {rainfall} millimeters per hour.")
        
    if notes and notes.strip():
        parts.append(f"Additional incident information: {notes.strip()}.")
        
    parts.append("Please verify the incident and initiate the appropriate response.")
    parts.append("This message was generated by Flood Twin.")

    speech_text = " ".join(parts)
    
    twiml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice" language="en-US">{speech_text}</Say>
</Response>"""
    return Response(content=twiml_content, media_type="application/xml")

@app.post("/api/emergency/call")
async def initiate_emergency_calls(req: EmergencyCallRequest, request: Request):

    """Initiate emergency voice calling for selected agencies.
    Handles Live Mode via Twilio and Demo Mode via safe simulation.
    Includes request idempotency & duplicate protection.
    """
    # 1. Idempotency Check
    idem_key = req.idempotencyKey or f"{req.incidentId}_{','.join(sorted(req.selectedAgencies))}"
    now_ts = time.time()
    if idem_key in IDEMPOTENCY_STORE:
        existing = IDEMPOTENCY_STORE[idem_key]
        if now_ts - existing["timestamp"] < 30:  # 30s window
            return existing["response"]

    inc_id = req.incidentId or f"FT-{time.strftime('%Y')}-{uuid.uuid4().hex[:4].upper()}"
    
    # Store/update incident details
    INCIDENT_STORE[inc_id] = {
        "incidentId": inc_id,
        "latitude": req.latitude,
        "longitude": req.longitude,
        "locationName": req.locationName,
        "preciseAddress": req.preciseAddress,
        "riskLevel": req.riskLevel,
        "waterDepth": req.waterDepth,
        "rainfall": req.rainfall,
        "notes": req.notes,
        "location": {"name": req.locationName, "address": req.preciseAddress},
        "incident": {
            "latitude": req.latitude,
            "longitude": req.longitude,
            "riskLevel": req.riskLevel,
            "waterDepth": req.waterDepth,
            "rainfall": req.rainfall,
            "notes": req.notes,
        },
        "agency_calls": {}
    }

    contacts = get_emergency_contacts()
    twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
    twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_phone = os.getenv("TWILIO_PHONE_NUMBER")

    is_real_call = req.isLiveMode and bool(twilio_sid and twilio_token and twilio_phone)

    base_url = str(request.base_url).rstrip("/")
    twiml_url = f"{base_url}/api/emergency/twiml/{inc_id}"

    async def call_single_agency(http_client: httpx.AsyncClient, agency_id: str):
        agency_name = AGENCY_NAMES.get(agency_id, agency_id.capitalize())
        recipient_phone = contacts.get(agency_id)

        if not recipient_phone:
            return {
                "agencyId": agency_id,
                "name": agency_name,
                "status": "FAILED",
                "error": "No phone number configured for recipient",
                "callSid": None,
                "mode": "LIVE" if req.isLiveMode else "DEMO"
            }

        if req.isLiveMode:
            if not (twilio_sid and twilio_token):
                err_msg = "Twilio credentials missing in backend .env (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)"
                INCIDENT_STORE[inc_id]["agency_calls"][agency_id] = {
                    "callSid": None,
                    "status": "FAILED",
                    "to": recipient_phone,
                    "error": err_msg
                }
                return {
                    "agencyId": agency_id,
                    "name": agency_name,
                    "status": "FAILED",
                    "error": err_msg,
                    "callSid": None,
                    "mode": "LIVE"
                }

            if not twilio_phone:
                err_msg = "Twilio caller phone number missing in backend .env (TWILIO_PHONE_NUMBER). Add your Twilio number (e.g. TWILIO_PHONE_NUMBER=+1xxxxxxxxxx) from console.twilio.com"
                INCIDENT_STORE[inc_id]["agency_calls"][agency_id] = {
                    "callSid": None,
                    "status": "FAILED",
                    "to": recipient_phone,
                    "error": err_msg
                }
                return {
                    "agencyId": agency_id,
                    "name": agency_name,
                    "status": "FAILED",
                    "error": err_msg,
                    "callSid": None,
                    "mode": "LIVE"
                }

            # Place real Twilio outbound call
            try:
                twilio_url = f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Calls.json"
                auth = (twilio_sid, twilio_token)
                data = {
                    "From": twilio_phone,
                    "To": recipient_phone,
                    "Url": twiml_url,
                }
                resp = await http_client.post(twilio_url, auth=auth, data=data)
                    
                if resp.status_code in (200, 201):
                    call_data = resp.json()
                    call_sid = call_data.get("sid")
                    twilio_status = call_data.get("status", "queued").upper()
                    
                    status_map = {
                        "QUEUED": "QUEUED",
                        "INITIATED": "CALLING",
                        "RINGING": "RINGING",
                        "IN-PROGRESS": "CONNECTED",
                        "COMPLETED": "COMPLETED",
                        "BUSY": "BUSY",
                        "NO-ANSWER": "NO ANSWER",
                        "FAILED": "FAILED",
                        "CANCELED": "FAILED"
                    }
                    mapped_status = status_map.get(twilio_status, "CALLING")
                    
                    INCIDENT_STORE[inc_id]["agency_calls"][agency_id] = {
                        "callSid": call_sid,
                        "status": mapped_status,
                        "to": recipient_phone,
                    }

                    return {
                        "agencyId": agency_id,
                        "name": agency_name,
                        "status": mapped_status,
                        "callSid": call_sid,
                        "mode": "LIVE"
                    }
                else:
                    err_msg = resp.json().get("message", "Twilio API error")
                    INCIDENT_STORE[inc_id]["agency_calls"][agency_id] = {
                        "callSid": None,
                        "status": "FAILED",
                        "to": recipient_phone,
                        "error": err_msg
                    }
                    return {
                        "agencyId": agency_id,
                        "name": agency_name,
                        "status": "FAILED",
                        "error": err_msg,
                        "callSid": None,
                        "mode": "LIVE"
                    }
            except Exception as e:
                INCIDENT_STORE[inc_id]["agency_calls"][agency_id] = {
                    "callSid": None,
                    "status": "FAILED",
                    "to": recipient_phone,
                    "error": str(e)
                }
                return {
                    "agencyId": agency_id,
                    "name": agency_name,
                    "status": "FAILED",
                    "error": str(e),
                    "callSid": None,
                    "mode": "LIVE"
                }
        else:
            # DEMO Mode -> Simulated response
            INCIDENT_STORE[inc_id]["agency_calls"][agency_id] = {
                "callSid": f"SIM-{uuid.uuid4().hex[:8]}",
                "status": "QUEUED",
                "to": "CONFIGURED_CONTACT"
            }
            return {
                "agencyId": agency_id,
                "name": agency_name,
                "status": "QUEUED",
                "simulated": True,
                "mode": "DEMO"
            }

    async with httpx.AsyncClient(timeout=15.0) as http_client:
        tasks = [call_single_agency(http_client, agency_id) for agency_id in req.selectedAgencies]
        results = await asyncio.gather(*tasks)

    response_payload = {
        "incidentId": inc_id,
        "isLiveMode": is_real_call,
        "mode": "LIVE" if is_real_call else "DEMO",
        "results": results,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    # Store in idempotency cache
    return response_payload


@app.get("/api/emergency/status/{incident_id}")

def get_emergency_call_status(incident_id: str):
    """Fetch updated call statuses for an emergency incident."""
    incident = INCIDENT_STORE.get(incident_id)
    if not incident:
        # Return fallback if incident not found yet
        return {"incidentId": incident_id, "agencies": {}}

    agency_calls = incident.get("agency_calls", {})
    twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
    twilio_token = os.getenv("TWILIO_AUTH_TOKEN")

    updated_agencies = {}

    for agency_id, call_info in agency_calls.items():
        call_sid = call_info.get("callSid")
        curr_status = call_info.get("status", "QUEUED")

        # Query Twilio if live call Sid present
        if call_sid and not call_sid.startswith("SIM-") and twilio_sid and twilio_token:
            try:
                twilio_url = f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Calls/{call_sid}.json"
                auth = (twilio_sid, twilio_token)
                with httpx.Client(timeout=5.0) as client:
                    resp = client.get(twilio_url, auth=auth)
                if resp.status_code == 200:
                    tw_data = resp.json()
                    raw_status = tw_data.get("status", "").upper()
                    status_map = {
                        "QUEUED": "QUEUED",
                        "INITIATED": "CALLING",
                        "RINGING": "RINGING",
                        "IN-PROGRESS": "CONNECTED",
                        "COMPLETED": "COMPLETED",
                        "BUSY": "BUSY",
                        "NO-ANSWER": "NO ANSWER",
                        "FAILED": "FAILED",
                        "CANCELED": "FAILED"
                    }
                    curr_status = status_map.get(raw_status, curr_status)
                    call_info["status"] = curr_status
            except Exception:
                pass

        updated_agencies[agency_id] = {
            "status": curr_status,
            "callSid": call_sid,
            "name": AGENCY_NAMES.get(agency_id, agency_id)
        }

    return {
        "incidentId": incident_id,
        "agencies": updated_agencies
    }


@app.post("/api/emergency/retry")
def retry_failed_calls(req: RetryCallRequest, request: Request):
    """Retry failed or no-answer emergency calls for specified or automatically identified failed agencies."""
    incident = INCIDENT_STORE.get(req.incidentId)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    agency_calls = incident.get("agency_calls", {})
    agencies_to_retry = req.selectedAgencies

    if not agencies_to_retry:
        # Auto-detect failed or no-answer agencies
        agencies_to_retry = [
            a_id for a_id, info in agency_calls.items()
            if info.get("status") in ("FAILED", "NO ANSWER", "BUSY")
        ]

    if not agencies_to_retry:
        return {"message": "No failed agencies to retry.", "results": []}

    call_req = EmergencyCallRequest(
        incidentId=req.incidentId,
        selectedAgencies=agencies_to_retry,
        isLiveMode=req.isLiveMode,
        idempotencyKey=f"RETRY_{req.incidentId}_{time.time()}",
        latitude=incident.get("latitude", 22.572648),
        longitude=incident.get("longitude", 88.433912),
        locationName=incident.get("locationName"),
        preciseAddress=incident.get("preciseAddress"),
        riskLevel=incident.get("riskLevel", "HIGH"),
        waterDepth=incident.get("waterDepth"),
        rainfall=incident.get("rainfall"),
        notes=incident.get("notes")
    )

    return initiate_emergency_calls(call_req, request)

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


# 🚨 FLOOD EMERGENCY ONE-CALL API ENDPOINT
class EmergencyIncidentRequest(BaseModel):
    incidentId: Optional[str] = None
    incidentType: str = "URBAN_FLOOD"
    latitude: float
    longitude: float
    locationName: Optional[str] = "High-Precision GIS Sector"
    preciseAddress: Optional[str] = None
    accuracyMeters: Optional[float] = 3.0
    sectorCode: Optional[str] = "GIS-KLK-SEC5-02"
    riskLevel: str = "HIGH"
    waterDepth: float = 0.8
    rainfall: float = 84.0
    timestamp: Optional[str] = None
    notes: Optional[str] = None

@app.post("/api/emergency/incident")
def create_emergency_incident(req: EmergencyIncidentRequest):
    inc_id = req.incidentId or f"FLD-{time.strftime('%Y')}-{uuid.uuid4().hex[:4].upper()}"
    
    # Check if backend telephony environment credentials exist (e.g. Twilio / MSG91)
    twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
    twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
    is_real_mode = bool(twilio_sid and twilio_token)

    agencies = [
        {"id": "disaster", "name": "🚨 Disaster / Rapid Action Response", "status": "QUEUED"},
        {"id": "fire", "name": "🚒 Fire & Emergency Services", "status": "QUEUED"},
        {"id": "police", "name": "👮 Police Department", "status": "QUEUED"},
        {"id": "electricity", "name": "⚡ Electricity / Power Utility", "status": "QUEUED"},
        {"id": "control_room", "name": "🏢 Emergency Control Room (EOC)", "status": "QUEUED"}
    ]

    return {
        "incidentId": inc_id,
        "status": "RECEIVED",
        "coordinates": {"lat": req.latitude, "lng": req.longitude, "accuracy_m": req.accuracyMeters},
        "location": {"name": req.locationName, "address": req.preciseAddress, "sectorCode": req.sectorCode},
        "demo_mode": not is_real_mode,
        "mode_label": "REAL MODE" if is_real_mode else "DEMO MODE (Simulated)",
        "message": f"Emergency response dispatched for precision target ({req.latitude:.6f}°, {req.longitude:.6f}°).",
        "incident": {
            "incidentType": req.incidentType,
            "latitude": req.latitude,
            "longitude": req.longitude,
            "riskLevel": req.riskLevel,
            "waterDepth": req.waterDepth,
            "rainfall": req.rainfall,
            "timestamp": req.timestamp or time.strftime("%Y-%m-%d %H:%M:%S"),
            "notes": req.notes,
        },
        "agencies": agencies,
    }



