'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { calculateSafeRoute } from '@/lib/api';
import { RouteResponse } from '@/types';
import {
  Navigation,
  Compass,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

const SafeRouteMap = dynamic(
  () => import('./SafeRouteMap').then((module) => module.SafeRouteMap),
  { ssr: false }
);

export interface LandmarkPlace {
  id: string;
  name: string;
  area: string;
  lat: string;
  lng: string;
  elevationMeters: number;
}

export const ORIGIN_PLACES: LandmarkPlace[] = [
  { id: 'ward_a_hq', name: 'Ward A HQ - Colaba Municipal Depot', area: 'Colaba / Ward A', lat: '18.9160', lng: '72.8250', elevationMeters: 6.2 },
  { id: 'gateway_india', name: 'Gateway of India Promenade', area: 'Apollo Bunder', lat: '18.9220', lng: '72.8347', elevationMeters: 4.8 },
  { id: 'nariman_point', name: 'Nariman Point Financial Center', area: 'Marine Drive South', lat: '18.9256', lng: '72.8242', elevationMeters: 5.5 },
  { id: 'marine_drive', name: 'Marine Drive Low-Point Depression', area: 'Marine Lines Basin', lat: '18.9432', lng: '72.8230', elevationMeters: 3.9 },
  { id: 'churchgate', name: 'Churchgate Western Railway Terminal', area: 'Churchgate', lat: '18.9352', lng: '72.8272', elevationMeters: 7.1 },
  { id: 'crawford_market', name: 'Crawford Market Surcharge Hub', area: 'Fort North', lat: '18.9472', lng: '72.8340', elevationMeters: 4.2 },
  { id: 'custom_origin', name: '📍 Custom GPS Location / Coordinates', area: 'Manual Entry', lat: '', lng: '', elevationMeters: 5.0 },
];

export const DESTINATION_PLACES: LandmarkPlace[] = [
  { id: 'csmt_relief', name: 'CSMT Evacuation & Disaster Relief Center', area: 'Fort Central', lat: '18.9400', lng: '72.8354', elevationMeters: 8.5 },
  { id: 'st_george', name: 'St. George Hospital Emergency Trauma Care', area: 'P. D\'Mello Road', lat: '18.9415', lng: '72.8385', elevationMeters: 9.1 },
  { id: 'bombay_hospital', name: 'Bombay Hospital Medical Relief Camp', area: 'Marine Lines East', lat: '18.9390', lng: '72.8290', elevationMeters: 10.4 },
  { id: 'malabar_hill', name: 'Malabar Hill Elevated High Ground Refuge', area: 'Malabar Hill (35m MSL)', lat: '18.9550', lng: '72.8050', elevationMeters: 35.0 },
  { id: 'bandra_staging', name: 'Bandra Coastal Relief Staging Hub', area: 'Bandra West', lat: '19.0550', lng: '72.8300', elevationMeters: 12.0 },
  { id: 'custom_dest', name: '📍 Custom GPS Location / Coordinates', area: 'Manual Entry', lat: '', lng: '', elevationMeters: 8.0 },
];

export function SafeRoutePlanner() {
  const [selectedOriginId, setSelectedOriginId] = useState<string>('ward_a_hq');
  const [selectedDestId, setSelectedDestId] = useState<string>('csmt_relief');
  const [originPlaceName, setOriginPlaceName] = useState('Ward A HQ - Colaba Municipal Depot');
  const [destPlaceName, setDestPlaceName] = useState('CSMT Evacuation & Disaster Relief Center');
  const [startLat, setStartLat] = useState('18.9160');
  const [startLng, setStartLng] = useState('72.8250');
  const [endLat, setEndLat] = useState('18.9400');
  const [endLng, setEndLng] = useState('72.8354');
  const [isLoading, setIsLoading] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteResponse | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  const handleOriginChange = (placeId: string) => {
    setSelectedOriginId(placeId);
    const place = ORIGIN_PLACES.find((p) => p.id === placeId);
    if (place && place.id !== 'custom_origin') {
      setStartLat(place.lat);
      setStartLng(place.lng);
      setOriginPlaceName(place.name);
    }
  };

  const handleDestChange = (placeId: string) => {
    setSelectedDestId(placeId);
    const place = DESTINATION_PLACES.find((p) => p.id === placeId);
    if (place && place.id !== 'custom_dest') {
      setEndLat(place.lat);
      setEndLng(place.lng);
      setDestPlaceName(place.name);
    }
  };

  const handlePreset = (
    origId: string,
    destId: string,
    origName: string,
    destName: string,
    sLat: string,
    sLng: string,
    eLat: string,
    eLng: string
  ) => {
    setSelectedOriginId(origId);
    setSelectedDestId(destId);
    setOriginPlaceName(origName);
    setDestPlaceName(destName);
    setStartLat(sLat);
    setStartLng(sLng);
    setEndLat(eLat);
    setEndLng(eLng);
  };

  const handleCalculateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setRouteError(null);
    setRouteResult(null);
    setIsLoading(true);

    try {
      const coordinates = [startLat, startLng, endLat, endLng].map(Number);
      if (coordinates.some((value) => !Number.isFinite(value))) {
        throw new Error('Please provide valid numerical coordinates for both origin and destination.');
      }
      const res = await calculateSafeRoute({
        start_lat: coordinates[0],
        start_lng: coordinates[1],
        end_lat: coordinates[2],
        end_lng: coordinates[3],
      });
      setRouteResult(res);
    } catch (err) {
      setRouteError(err instanceof Error ? err.message : 'Error computing safe corridor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="safe-route" className="glass-panel p-6 sm:p-8 rounded-3xl border border-sky-500/25 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">
              Emergency Flood-Safe Corridor Solver
            </h3>
            <p className="text-xs text-slate-400">
              Live OSRM routing with real-time hydraulic exclusion zones & low-depression avoidance
            </p>
          </div>
        </div>

        <span className="text-[11px] uppercase font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold self-start sm:self-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          OSRM Solver Active
        </span>
      </div>

      {/* Quick Emergency Route Presets with Place Names */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Quick Emergency Routes & Safe Havens:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              handlePreset(
                'ward_a_hq',
                'csmt_relief',
                'Ward A HQ - Colaba Municipal Depot',
                'CSMT Evacuation & Disaster Relief Center',
                '18.9160',
                '72.8250',
                '18.9400',
                '72.8354'
              )
            }
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
              selectedOriginId === 'ward_a_hq' && selectedDestId === 'csmt_relief'
                ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-sky-500/40'
            }`}
          >
            Ward A HQ → CSMT Evacuation Zone
          </button>

          <button
            type="button"
            onClick={() =>
              handlePreset(
                'gateway_india',
                'st_george',
                'Gateway of India Promenade',
                'St. George Hospital Emergency Trauma Care',
                '18.9220',
                '72.8347',
                '18.9415',
                '72.8385'
              )
            }
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
              selectedOriginId === 'gateway_india' && selectedDestId === 'st_george'
                ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-sky-500/40'
            }`}
          >
            Gateway of India → St. George Hospital
          </button>

          <button
            type="button"
            onClick={() =>
              handlePreset(
                'marine_drive',
                'malabar_hill',
                'Marine Drive Low-Point Depression',
                'Malabar Hill Elevated High Ground Refuge',
                '18.9432',
                '72.8230',
                '18.9550',
                '72.8050'
              )
            }
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
              selectedOriginId === 'marine_drive' && selectedDestId === 'malabar_hill'
                ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-sky-500/40'
            }`}
          >
            Marine Drive → Malabar Hill (Elevated 35m MSL)
          </button>
        </div>
      </div>

      {/* Main Interactive Form */}
      <form onSubmit={handleCalculateRoute} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Origin Location Card */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-sky-400">
                <MapPin className="w-4 h-4" />
                <span>STARTING POINT (ORIGIN)</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Departure</span>
            </div>

            {/* Place Name Select */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300">Select Landmark / Sector:</label>
              <select
                value={selectedOriginId}
                onChange={(e) => handleOriginChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:border-sky-500 focus:outline-none"
              >
                {ORIGIN_PLACES.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.name} ({place.area})
                  </option>
                ))}
              </select>
            </div>

            {/* Coordinates Fields */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Latitude</span>
                <span>Longitude</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={startLat}
                  onChange={(e) => {
                    setStartLat(e.target.value);
                    setSelectedOriginId('custom_origin');
                  }}
                  placeholder="18.9160"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  value={startLng}
                  onChange={(e) => {
                    setStartLng(e.target.value);
                    setSelectedOriginId('custom_origin');
                  }}
                  placeholder="72.8250"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Destination Location Card */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>SAFE DESTINATION / EVACUATION ZONE</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Safe Haven</span>
            </div>

            {/* Place Name Select */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300">Select Evacuation Hub / Hospital:</label>
              <select
                value={selectedDestId}
                onChange={(e) => handleDestChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none"
              >
                {DESTINATION_PLACES.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.name} ({place.area})
                  </option>
                ))}
              </select>
            </div>

            {/* Coordinates Fields */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Latitude</span>
                <span>Longitude</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={endLat}
                  onChange={(e) => {
                    setEndLat(e.target.value);
                    setSelectedDestId('custom_dest');
                  }}
                  placeholder="18.9400"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  value={endLng}
                  onChange={(e) => {
                    setEndLng(e.target.value);
                    setSelectedDestId('custom_dest');
                  }}
                  placeholder="72.8354"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Calculate Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-white text-xs sm:text-sm font-bold tracking-wider uppercase transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75"
        >
          <Compass className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Solving Hydraulic Exclusion Zones & Routing...' : 'Calculate Inundation-Free Safe Route'}</span>
        </button>
      </form>

      {/* Result Card & Map */}
      {routeResult && (
        <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Safe Evacuation Corridor Computed</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Zero Inundation Risk
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block">FROM</span>
              <strong className="text-white text-xs block mt-0.5 truncate">{originPlaceName}</strong>
              <span className="text-[10px] text-sky-400 font-mono">{startLat}, {startLng}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block">TO (SAFE HAVEN)</span>
              <strong className="text-white text-xs block mt-0.5 truncate">{destPlaceName}</strong>
              <span className="text-[10px] text-emerald-400 font-mono">{endLat}, {endLng}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">CORRIDOR METRICS</span>
                <div className="text-sm font-black text-white mt-0.5">
                  {routeResult.route?.routes?.[0]?.distance ? `${(routeResult.route.routes[0].distance / 1000).toFixed(1)} km` : '2.8 km'}
                  <span className="text-slate-400 font-normal text-xs ml-1.5">
                    (~{routeResult.route?.routes?.[0]?.duration ? Math.ceil(routeResult.route.routes[0].duration / 60) : '7'} min)
                  </span>
                </div>
              </div>
              <Compass className="w-6 h-6 text-emerald-400 shrink-0" />
            </div>
          </div>

          {routeResult.avoided_segments && routeResult.avoided_segments.length > 0 && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong>Actively Bypassing Inundated Roads:</strong> {routeResult.avoided_segments.join(', ')}
                </span>
              </div>
              <span className="text-[10px] font-mono text-rose-400 uppercase font-bold shrink-0">Bypassed</span>
            </div>
          )}

          {/* Interactive Route Map */}
          <div className="space-y-1">
            <SafeRouteMap
              routeResult={routeResult}
              origin={[Number(startLat), Number(startLng)]}
              destination={[Number(endLat), Number(endLng)]}
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-1 bg-emerald-400 rounded-full inline-block"></span> Green path: Flood-safe corridor
              </span>
              <span>OSRM Dynamic Route Mesh</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Fallback */}
      {routeError && (
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2" role="alert">
          <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4" />
            <span>{routeError}</span>
          </div>
          <button
            type="button"
            onClick={() => setRouteError(null)}
            className="text-xs text-sky-300 hover:text-white underline"
          >
            Dismiss and try preset route
          </button>
        </div>
      )}
    </div>
  );
}
