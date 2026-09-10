export interface SwmmHydraulicOutput {
  rainfallMmHr: number;
  catchmentAreaKm2: number;
  runoffCoefficient: number;
  runoffGeneratedM3s: number;
  drainCapacityM3s: number;
  effectiveCapacityM3s: number;
  utilizationPercent: number;
  surcharge: boolean;
  accumulatedWaterM3: number;
  floodPotential: boolean;
  indicativeDepthRange: string;
}

const PILOT_CATCHMENT_AREA_KM2 = 0.275;
const PILOT_DRAIN_CAPACITY_M3S = 4.0;
const RUNOFF_WINDOW_SECONDS = 15 * 60;

/**
 * SWMM-inspired rational runoff approximation for the synthetic pilot catchment.
 * This is a screening model, not a calibrated EPA SWMM project file.
 */
export function calculateSwmmOutput(rainfallMmHr: number, blockagePercent: number): SwmmHydraulicOutput {
  const safeRainfall = Math.max(0, rainfallMmHr);
  const safeBlockage = Math.min(90, Math.max(0, blockagePercent));
  const rainfallMPerSecond = safeRainfall / 1000 / 3600;
  const catchmentAreaM2 = PILOT_CATCHMENT_AREA_KM2 * 1_000_000;
  const runoffCoefficient = 0.85;
  const runoffGeneratedM3s = rainfallMPerSecond * catchmentAreaM2 * runoffCoefficient;
  const effectiveCapacityM3s = PILOT_DRAIN_CAPACITY_M3S * (1 - safeBlockage / 100);
  const utilizationPercent = effectiveCapacityM3s > 0
    ? (runoffGeneratedM3s / effectiveCapacityM3s) * 100
    : 0;
  const surcharge = utilizationPercent > 100;
  const accumulatedWaterM3 = Math.max(0, runoffGeneratedM3s - effectiveCapacityM3s) * RUNOFF_WINDOW_SECONDS;
  const floodPotential = surcharge && accumulatedWaterM3 > 0;
  const indicativeDepthRange = utilizationPercent <= 100
    ? '0.0–0.1 m'
    : utilizationPercent <= 150
      ? '0.1–0.3 m'
      : utilizationPercent <= 220
        ? '0.3–0.6 m'
        : '>0.6 m';

  return {
    rainfallMmHr: safeRainfall,
    catchmentAreaKm2: PILOT_CATCHMENT_AREA_KM2,
    runoffCoefficient,
    runoffGeneratedM3s,
    drainCapacityM3s: PILOT_DRAIN_CAPACITY_M3S,
    effectiveCapacityM3s,
    utilizationPercent,
    surcharge,
    accumulatedWaterM3,
    floodPotential,
    indicativeDepthRange,
  };
}
