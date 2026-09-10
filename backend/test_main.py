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


def test_street_risk_features_produce_different_baseline_outputs():
    response = client.get("/api/street-risk/pilot_ward?rainfall_mm_hr=20")
    assert response.status_code == 200
    segments = {segment["id"]: segment for segment in response.json()["segments"]}
    assert segments["street_segment_01"]["source"] == "synthetic"
    assert segments["street_segment_01"]["risk"] != segments["street_segment_02"]["risk"]
    assert segments["street_segment_02"]["geometry_features"]["local_depression"] is True
    assert segments["street_segment_02"]["feature_penalty_points"] > segments["street_segment_01"]["feature_penalty_points"]

def test_report_corroboration():
    reports.clear()
    
    # 1 report
    first = client.post("/api/report", json={"lat": 18.96, "lng": 72.82, "severity": "Severe", "text": "1"})
    assert first.json()["report_id"]
    assert first.json()["message"] == "Waiting for corroboration (1/2)."
    
    # The first report is visible but not confirmed.
    response = client.get("/api/reports")
    assert response.json()["reports"][0]["report_count"] == 1
    assert response.json()["reports"][0]["corroborated"] is False
    assert response.json()["reports"][0]["severity"] == "Severe"
    
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


def test_nearby_second_report_confirms_with_actual_message():
    reports.clear()
    now = time.time()
    reports.extend([
        {"id": "r1", "lat": 18.96, "lng": 72.82, "severity": "Severe", "text": "1", "image_url": None, "status": "submitted", "ip": "a", "time": now},
        {"id": "r2", "lat": 18.9601, "lng": 72.82, "severity": "Severe", "text": "2", "image_url": None, "status": "submitted", "ip": "b", "time": now},
    ])
    response = client.get("/api/reports")
    assert all(report["report_count"] == 2 for report in response.json()["reports"])
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


def test_live_risk_changes_selected_route():
    request = {
        "start_lat": 18.9610,
        "start_lng": 72.8220,
        "end_lat": 18.9560,
        "end_lng": 72.8300,
    }
    clear_weather_route = client.post("/api/route", json={**request, "rainfall_mm_hr": 0})
    flood_event_route = client.post("/api/route", json={**request, "rainfall_mm_hr": 20})
    assert clear_weather_route.status_code == 200
    assert flood_event_route.status_code == 200
    clear_distance = clear_weather_route.json()["route"]["routes"][0]["distance"]
    flood_distance = flood_event_route.json()["route"]["routes"][0]["distance"]
    assert clear_distance != flood_distance
    assert "Pilot Road Junction Low Point" in flood_event_route.json()["avoided_segments"]


def test_drainage_what_if_changes_downstream_street_risk():
    normal = client.post(
        "/api/drainage/what-if",
        json={"node_id": "node_03", "scenario": "NORMAL", "rainfall_mm_hr": 10},
    )
    blocked = client.post(
        "/api/drainage/what-if",
        json={"node_id": "node_03", "scenario": "BLOCKED", "rainfall_mm_hr": 10},
    )
    assert normal.status_code == 200
    assert blocked.status_code == 200
    normal_data = normal.json()
    blocked_data = blocked.json()
    assert blocked_data["modified_capacity_m3s"] < normal_data["modified_capacity_m3s"]
    assert blocked_data["utilization_percent"] > normal_data["utilization_percent"]
    assert blocked_data["overflow_m3s"] > normal_data["overflow_m3s"]
    normal_risk = {item["id"]: item["risk"] for item in normal_data["risk_changes"]}
    blocked_risk = {item["id"]: item["risk"] for item in blocked_data["risk_changes"]}
    assert normal_risk["street_segment_02"] != blocked_risk["street_segment_02"]
    assert blocked_data["downstream_streets_affected"]


def test_rainfall_runoff_coupling_increases_inflow_utilization_and_overflow():
    outputs = {}
    for label, rainfall in (("low", 5), ("medium", 20), ("high", 80)):
        response = client.get(f"/api/street-risk/pilot_ward?rainfall_mm_hr={rainfall}")
        assert response.status_code == 200
        segment = next(item for item in response.json()["segments"] if item["id"] == "street_segment_02")
        outputs[label] = segment
        assert segment["runoff_coefficient"] == 0.85
        assert segment["contributing_area_km2"] == 0.16
        assert segment["modeled_inflow_m3s"] > 0
    assert outputs["low"]["modeled_inflow_m3s"] < outputs["medium"]["modeled_inflow_m3s"] < outputs["high"]["modeled_inflow_m3s"]
    assert outputs["low"]["hydraulic_utilization_percent"] < outputs["medium"]["hydraulic_utilization_percent"] < outputs["high"]["hydraulic_utilization_percent"]
    assert outputs["low"]["overflow_m3s"] == 0
    assert outputs["high"]["overflow_m3s"] > 0
    assert outputs["high"]["surcharge"] is True


def test_flagged_street_explanation_contains_model_values():
    response = client.get("/api/street-risk/pilot_ward?rainfall_mm_hr=20")
    flagged = next(item for item in response.json()["segments"] if item["risk"] in {"High", "Critical"})
    explanation = flagged["explanation"]
    assert f'{flagged["modeled_inflow_m3s"]:.2f}' in explanation
    assert f'{flagged["estimated_capacity_m3s"]:.2f}' in explanation
    assert "elevation" in explanation
    assert "slope" in explanation
    assert "contributing area" in explanation
    assert "node_03" in explanation
