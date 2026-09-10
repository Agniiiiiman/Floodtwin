export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type DataMode = 'live' | 'demo' | 'offline';

export interface Sector {
  name: string;
  country: string;
  lat: number;
  lon: number;
  region?: string;
}

export interface SectorWithRainfall extends Sector {
  rainfall: number; // mm/hr
  temperature?: number; // °C
  humidity?: number; // %
  windSpeed?: number; // km/h
  risk: RiskLevel;
  lastUpdated: string;
}

export interface ForecastResponse {
  risk: RiskLevel;
  depth_m: string;
  confidence: string;
  reason: string;
  rainfall_mm_hr: number;
  calibration_status?: string;
  data_source?: string;
  data_mode?: DataMode;
  last_updated?: string;
  ward_id?: string;
}

export interface ReportModel {
  lat: number;
  lng: number;
  status: string; // e.g. "Low", "Moderate", "Severe", "Inaccessible"
  desc: string;
  ip?: string;
  time?: number;
}

export interface CorroboratedReportsResponse {
  reports: Array<{
    lat: number;
    lng: number;
    status: string;
    desc: string;
    report_count?: number;
    corroborated?: boolean;
    reported_at?: number;
  }>;
  corroboration_required: number;
  radius_meters?: number;
  window_minutes?: number;
  data_mode?: DataMode;
  last_updated?: string;
}

export interface RouteRequest {
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
}

export interface RouteResponse {
  route?: {
    routes?: Array<{
      geometry?: {
        type: 'LineString';
        coordinates: Array<[number, number]>;
      };
      distance?: number;
      duration?: number;
    }>;
  };
  safe_status?: string;
  safe_duration?: string;
  calibration_status?: string;
  error?: string;
  details?: string;
  data_mode?: DataMode;
  distance_meters?: number;
  duration_seconds?: number;
  rainfall_mm_hr?: number;
  rainfall_mode?: DataMode;
  avoided_segments?: string[];
}

export interface DrainageFeature {
  type: string;
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon';
    coordinates: number[] | Array<[number, number]>;
  };
  properties: {
    id: string;
    type: 'manhole' | 'pipe' | 'sensor' | 'outfall';
    capacity: number;
    source?: 'synthetic' | 'real' | 'estimated';
    capacity_unit?: string;
    elevation_m?: number;
    slope_percent?: number;
    diameter_mm?: number;
    manning_n?: number;
    from_node?: string;
    to_node?: string;
    status?: 'normal' | 'congested' | 'overflow';
    current_load?: number;
  };
}

export interface DrainageGeoJSON {
  type: 'FeatureCollection';
  features: DrainageFeature[];
}

export interface DrainageWhatIfResult {
  node_id: string;
  scenario: string;
  rainfall_mm_hr: number;
  source: string;
  calibration_status: string;
  original_capacity_m3s: number;
  modified_capacity_m3s: number;
  inflow_m3s: number;
  utilization_percent: number;
  overflow_m3s: number;
  surcharge: boolean;
  downstream_streets_affected: string[];
  risk_changes: Array<{
    id: string;
    name: string;
    risk: RiskLevel;
    explanation: string;
    indicative_depth_range: string;
    modeled_inflow_m3s: number;
    estimated_capacity_m3s: number;
  }>;
}
