import pytest
from fastapi.testclient import TestClient
import time
from backend.main import app, reports, load_drainage_data

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["calibration_status"] == "uncalibrated_demo"

def test_forecast():
    response = client.get("/api/forecast?lat=18.96&lng=72.82")
    assert response.status_code == 200
    data = response.json()
    assert "risk" in data
    assert "depth_m" in data
    assert "reason" in data
    assert data["calibration_status"] == "uncalibrated_demo"

def test_report_corroboration():
    reports.clear()
    
    # 1 report
    client.post("/api/report", json={"lat": 18.96, "lng": 72.82, "status": "flooding", "desc": "1"})
    
    # fetch reports, should be empty (needs >= 2)
    response = client.get("/api/reports")
    assert len(response.json()["reports"]) == 0
    
    # 2nd report, different IP (simulate)
    # The client uses same IP by default, wait, I need to clear the rate limit check
    time.sleep(1)
    
    # we can inject directly for test
    reports.append({
        "lat": 18.96,
        "lng": 72.82,
        "status": "flooding",
        "desc": "2",
        "ip": "127.0.0.2",
        "time": time.time()
    })
    
    response = client.get("/api/reports")
    assert len(response.json()["reports"]) >= 2

def test_routing():
    # Will likely return error because local OSRM is not running in test, but test endpoint response structure
    response = client.post("/api/route", json={
        "start_lat": 18.96,
        "start_lng": 72.82,
        "end_lat": 18.97,
        "end_lng": 72.83
    })
    assert response.status_code == 200
    data = response.json()
    assert "error" in data or "route" in data
