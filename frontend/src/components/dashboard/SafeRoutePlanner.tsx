'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { calculateSafeRoute } from '@/lib/api';
import { RouteResponse } from '@/types';
import { Navigation, Compass, AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

const SafeRouteMap = dynamic(
  () => import('./SafeRouteMap').then((module) => module.SafeRouteMap),
  { ssr: false }
);

export function SafeRoutePlanner() {
  const [startLat, setStartLat] = useState('18.9600');
  const [startLng, setStartLng] = useState('72.8200');
  const [endLat, setEndLat] = useState('18.9750');
  const [endLng, setEndLng] = useState('72.8350');
  const [isLoading, setIsLoading] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteResponse | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  const handleCalculateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setRouteError(null);
    setRouteResult(null);
    setIsLoading(true);
    try {
      const coordinates = [startLat, startLng, endLat, endLng].map(Number);
      if (coordinates.some((value) => !Number.isFinite(value))) {
        throw new Error('Enter valid numeric coordinates for both locations.');
      }
      const res = await calculateSafeRoute({
        start_lat: coordinates[0],
        start_lng: coordinates[1],
        end_lat: coordinates[2],
        end_lng: coordinates[3],
      });
      setRouteResult(res);
    } catch (err) {
      setRouteError(err instanceof Error ? err.message : 'Route service unavailable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreset = (sLat: string, sLng: string, eLat: string, eLng: string) => {
    setStartLat(sLat);
    setStartLng(sLng);
    setEndLat(eLat);
    setEndLng(eLng);
  };

  return (
    <div id="safe-route" className="glass-panel p-6 rounded-2xl border border-sky-500/20 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Emergency Flood-Safe Corridor Routing
            </h3>
            <p className="text-xs text-slate-400">
              Powered by OSRM graph search with real-time hydraulic exclusion zones
            </p>
          </div>
        </div>

        {/* SIH Tag */}
        <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
          OSRM Engine
        </span>
      </div>

      {/* Preset Quick Select Buttons */}
      <div>
        <span className="text-xs text-slate-400 block mb-2 font-medium">Quick Emergency Routes:</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handlePreset('18.9600', '72.8200', '18.9750', '72.8350')}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-sky-500/40 text-slate-300 hover:text-white transition-all"
          >
            Ward A HQ → CSMT Evacuation Zone
          </button>
          <button
            type="button"
            onClick={() => handlePreset('18.9220', '72.8340', '18.9500', '72.8280')}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-sky-500/40 text-slate-300 hover:text-white transition-all"
          >
            Colaba Causeways → St. George Hospital
          </button>
        </div>
      </div>

      <form onSubmit={handleCalculateRoute} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Origin */}
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>ORIGIN COORDINATES (LAT, LNG)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={startLat}
                onChange={(e) => setStartLat(e.target.value)}
                placeholder="Lat"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
                required
              />
              <input
                type="text"
                value={startLng}
                onChange={(e) => setStartLng(e.target.value)}
                placeholder="Lng"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Destination */}
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>DESTINATION COORDINATES (LAT, LNG)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={endLat}
                onChange={(e) => setEndLat(e.target.value)}
                placeholder="Lat"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
                required
              />
              <input
                type="text"
                value={endLng}
                onChange={(e) => setEndLng(e.target.value)}
                placeholder="Lng"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md flex items-center justify-center space-x-2"
        >
          <Compass className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Querying OSRM Dynamic Engine...' : 'Calculate Inundation-Free Safe Route'}</span>
        </button>
      </form>

      {/* Result Card */}
      {routeResult && (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2 animate-fadeIn">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>SAFE ROUTE COMPUTED</span>
          </div>
          <p className="text-xs text-slate-200">
            {routeResult.safe_status}
          </p>
          <div className="text-[11px] text-emerald-400/90 font-mono">
            {routeResult.safe_duration}
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
            <span>Distance: {routeResult.route?.routes?.[0]?.distance ? `${(routeResult.route.routes[0].distance / 1000).toFixed(1)} km` : 'Unavailable'}</span>
            <span>ETA: {routeResult.route?.routes?.[0]?.duration ? `${Math.ceil(routeResult.route.routes[0].duration / 60)} min` : 'Unavailable'}</span>
          </div>
          {routeResult.avoided_segments && routeResult.avoided_segments.length > 0 && (
            <div className="rounded-lg border border-rose-500/25 bg-rose-950/20 p-2 text-[11px] text-rose-200">
              Avoided live high-risk segments: {routeResult.avoided_segments.join(', ')}
            </div>
          )}
          <SafeRouteMap
            routeResult={routeResult}
            origin={[Number(startLat), Number(startLng)]}
            destination={[Number(endLat), Number(endLng)]}
          />
          <p className="text-[10px] text-slate-400">
            Green line shows the returned route. Flood-segment avoidance is only available when the backend supplies risk overlays.
          </p>
        </div>
      )}

      {routeError && (
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-3" role="alert">
          <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4" />
            <span>{routeError}</span>
          </div>
          <button
            type="button"
            onClick={() => setRouteError(null)}
            className="text-xs text-sky-300 hover:text-white"
          >
            Dismiss and retry
          </button>
        </div>
      )}
    </div>
  );
}
