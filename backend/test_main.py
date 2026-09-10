import pytest
from fastapi.testclient import TestClient
import time
from backend.main import app, reports, load_drainage_data

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["calibration_status"] == "uncalibrated_demo"
    assert response.json()["mode"] == "live"

def test_forecast():
    response = client.get("/api/forecast?lat=18.96&lng=72.82")
    assert response.status_code == 200
    data = response.json()
    assert "risk" in data
    assert "depth_m" in data
    assert "reason" in data
    assert data["calibration_status"] == "uncalibrated_demo"


def test_pilot_drainage_graph_is_synthetic_and_has_nodes_and_edges():
    response = client.get("/api/drainage/pilot_ward")
    assert response.status_code == 200
    data = response.json()
    assert len(data["features"]) >= 5
    assert all(feature["properties"]["source"] == "synthetic" for feature in data["features"])
    assert any(feature["geometry"]["type"] == "Point" for feature in data["features"])
    assert any(feature["geometry"]["type"] == "LineString" for feature in data["features"])

def test_report_corroboration():
    reports.clear()
    
    # 1 report
    client.post("/api/report", json={"lat": 18.96, "lng": 72.82, "status": "flooding", "desc": "1"})
    
    # The first report is visible but not confirmed.
    response = client.get("/api/reports")
    assert response.json()["reports"][0]["report_count"] == 1
    assert response.json()["reports"][0]["corroborated"] is False
    
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
    assert all(report["corroborated"] for report in response.json()["reports"])

def test_routing():
    # With the local OSRM container running, the API returns real geometry.
    response = client.post("/api/route", json={
        "start_lat": 18.96,
        "start_lng": 72.82,
        "end_lat": 18.97,
        "end_lng": 72.83
    })
    assert response.status_code == 200
    data = response.json()
    assert data["route"]["routes"][0]["geometry"]["type"] == "LineString"
    assert data["route"]["routes"][0]["distance"] > 0


def test_reports_outside_50_meters_are_not_corroborated():
    reports.clear()
    now = time.time()
    reports.extend([
        {"lat": 18.96, "lng": 72.82, "status": "flooding", "desc": "1", "ip": "a", "time": now},
        {"lat": 18.9606, "lng": 72.82, "status": "flooding", "desc": "2", "ip": "b", "time": now},
    ])

    response = client.get("/api/reports")
    assert all(report["report_count"] == 1 for report in response.json()["reports"])


def test_reports_older_than_30_minutes_are_not_corroborated():
    reports.clear()
    now = time.time()
    reports.extend([
        {"lat": 18.96, "lng": 72.82, "status": "flooding", "desc": "1", "ip": "a", "time": now - 31 * 60},
        {"lat": 18.96, "lng": 72.82, "status": "flooding", "desc": "2", "ip": "b", "time": now},
    ])

    response = client.get("/api/reports")
    assert all(report["report_count"] == 1 for report in response.json()["reports"])
