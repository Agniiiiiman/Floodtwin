export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

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
  }>;
  corroboration_required: number;
}

export interface RouteRequest {
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
}

export interface RouteResponse {
  route?: any;
  safe_status?: string;
  safe_duration?: string;
  calibration_status?: string;
  error?: string;
  details?: string;
}

export interface DrainageFeature {
  type: string;
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon';
    coordinates: any;
  };
  properties: {
    id: string;
    type: 'manhole' | 'pipe' | 'sensor' | 'outfall';
    capacity: number;
    status?: 'normal' | 'congested' | 'overflow';
    current_load?: number;
  };
}

export interface DrainageGeoJSON {
  type: 'FeatureCollection';
  features: DrainageFeature[];
}
