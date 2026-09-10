import pytest
from pathlib import Path
from backend.sumo.run_sumo_simulation import run_scenario

def test_sumo_baseline_and_flooded_scenarios_produce_real_metrics():
    baseline = run_scenario("pilot_baseline.sumocfg", "baseline")
    flooded = run_scenario("pilot_flooded.sumocfg", "flooded")
    
    assert baseline["vehicles"] == 60
    assert flooded["vehicles"] == 60
    
    # Flooded scenario forces detour: longer route length and higher travel time
    assert flooded["travel_time_s"] > baseline["travel_time_s"]
    assert flooded["time_loss_s"] > baseline["time_loss_s"]
    assert flooded["route_length_m"] > baseline["route_length_m"]
    
    # Assert exact model outputs from SUMO
    assert baseline["travel_time_s"] > 80.0
    assert flooded["travel_time_s"] > 120.0
