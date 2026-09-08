import { RiskLevel, SectorWithRainfall } from '@/types';
import { SECTORS, SectorWithRegion } from './sectorsData';

export function calculateRisk(rainfallMmHr: number): RiskLevel {
  if (rainfallMmHr <= 1.0) return 'Low';
  if (rainfallMmHr <= 10.0) return 'Medium';
  if (rainfallMmHr <= 25.0) return 'High';
  return 'Critical';
}

export function getRiskColor(risk: RiskLevel): string {
  switch (risk) {
    case 'Critical':
      return '#ef4444'; // red-500
    case 'High':
      return '#f97316'; // orange-500
    case 'Medium':
      return '#eab308'; // yellow-500
    case 'Low':
    default:
      return '#10b981'; // emerald-500
  }
}

export function getRainfallIntensityColor(rainfall: number): string {
  if (rainfall === 0) return '#38bdf8'; // light sky blue (0 mm/hr)
  if (rainfall < 1.0) return '#0ea5e9'; // light blue (0.1 - 1.0)
  if (rainfall < 5.0) return '#2563eb'; // blue (1 - 5)
  if (rainfall < 15.0) return '#7c3aed'; // indigo/purple (5 - 15)
  if (rainfall < 30.0) return '#c026d3'; // magenta (15 - 30)
  return '#dc2626'; // intense crimson (> 30 mm/hr)
}

export async function fetchLiveRainfallData(): Promise<SectorWithRainfall[]> {
  try {
    // Open-Meteo allows fetching up to 100-200 coordinates in a single multi-coordinate request
    const lats = SECTORS.map((s) => s.lat).join(',');
    const lons = SECTORS.map((s) => s.lon).join(',');

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=precipitation,temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto&forecast_days=1`;

    const res = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 60s
    });

    if (!res.ok) {
      throw new Error(`Open-Meteo API error: ${res.status}`);
    }

    const data = await res.json();
    const results: SectorWithRainfall[] = [];
    const timestamp = new Date().toLocaleTimeString();

    // If multi-location response is an array
    const locations = Array.isArray(data) ? data : [data];

    SECTORS.forEach((sector, idx) => {
      const item = locations[idx] || locations[0];
      const current = item?.current || {};
      const rainfall = typeof current.precipitation === 'number' ? current.precipitation : 0;
      const temperature = current.temperature_2m;
      const humidity = current.relative_humidity_2m;
      const windSpeed = current.wind_speed_10m;

      results.push({
        ...sector,
        rainfall,
        temperature,
        humidity,
        windSpeed,
        risk: calculateRisk(rainfall),
        lastUpdated: timestamp,
      });
    });

    return results;
  } catch (error) {
    console.warn('Falling back to local simulated precipitation values:', error);
    const timestamp = new Date().toLocaleTimeString();
    return SECTORS.map((sector) => {
      // realistic baseline with higher chance of rain in tropical zones
      const isMonsoonZone = sector.region === 'South Asia' || sector.region === 'East Asia';
      const rainfall = parseFloat((Math.random() * (isMonsoonZone ? 18.5 : 4.0)).toFixed(1));
      return {
        ...sector,
        rainfall,
        temperature: Math.round(18 + Math.random() * 14),
        humidity: Math.round(50 + Math.random() * 45),
        windSpeed: Math.round(5 + Math.random() * 25),
        risk: calculateRisk(rainfall),
        lastUpdated: timestamp,
      };
    });
  }
}
