'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { LiveMetrics } from '@/components/dashboard/LiveMetrics';
import { DataSourcesPanel } from '@/components/dashboard/DataSourcesPanel';
import { DataStatusBadge } from '@/components/dashboard/DataStatusBadge';
import { getFloodForecast, getWardDrainage, getHealthCheck } from '@/lib/api';
import { ForecastResponse, DrainageGeoJSON, DataMode } from '@/types';
import { Activity, RefreshCw, Layers, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Dynamic import for Digital Twin Map to avoid SSR leaflet issues
const DigitalTwinMap = dynamic(
  () => import('@/components/dashboard/DigitalTwinMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] lg:h-[600px] rounded-2xl glass-panel flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
        <span className="text-xs text-slate-300 font-mono uppercase tracking-wider">
          Initializing Digital Twin Mesh...
        </span>
      </div>
    ),
  }
);

export default function DigitalTwinPage() {
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [drainage, setDrainage] = useState<DrainageGeoJSON | null>(null);
  const [backendMode, setBackendMode] = useState<DataMode>('live');
  const [loading, setLoading] = useState(true);

  const loadWardData = useCallback(async () => {
    setLoading(true);
    try {
      const [forecastData, drainageData, health] = await Promise.all([
        getFloodForecast(18.96, 72.82),
        getWardDrainage('pilot_ward'),
        getHealthCheck(),
      ]);
      setForecast(forecastData);
      setDrainage(drainageData);
      setBackendMode(health.mode);
    } catch (err) {
      console.error('Error fetching ward telemetry:', err);
      setBackendMode('offline');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWardData();
    const interval = setInterval(loadWardData, 30000);
    return () => clearInterval(interval);
  }, [loadWardData]);

  return (
    <div className="min-h-screen pb-16 pt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5" />
              <span>Real-Time Hydraulic Operations</span>
            </div>
            <DataStatusBadge mode={backendMode} lastUpdated={forecast?.last_updated} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            South Mumbai Pilot Ward Digital Twin
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl">
            Live Manning equation solver simulating subterranean drainage flow, pipe saturation, and surface water inundation across Ward A/B.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-400 uppercase font-mono">PILOT COORDINATES</div>
            <div className="text-xs text-sky-400 font-mono font-semibold">18.96° N, 72.82° E</div>
          </div>
          <button
            onClick={loadWardData}
            disabled={loading}
            className="p-3 rounded-xl glass-panel text-sky-400 hover:text-white hover:border-sky-400/50 transition-colors disabled:opacity-50"
            title="Refresh telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Live Gauges & Telemetry */}
      <LiveMetrics
        data={forecast}
        loading={loading}
        onRefresh={loadWardData}
      />

      {/* Interactive Leaflet Digital Twin Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Drainage Network Mesh & Subterranean Pipe Inundation</span>
          </h2>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            Live Simulation Sync
          </span>
        </div>
        <DigitalTwinMap
          drainageData={drainage}
          pilotCoords={[18.96, 72.82]}
        />
      </div>

      {/* Data Sources & Provenance Panel */}
      <DataSourcesPanel
        rainfallMode={backendMode}
        lastUpdated={forecast?.last_updated}
      />

      {/* Quick Navigation Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-800">
        <Link
          href="/simulation"
          className="glass-panel p-5 rounded-xl hover:border-sky-500/40 transition-all group flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-mono uppercase text-sky-400">Next Subsystem</div>
            <div className="text-base font-bold text-white group-hover:text-sky-300">Run What-If Hydraulic Simulation</div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
        <Link
          href="/safe-route"
          className="glass-panel p-5 rounded-xl hover:border-emerald-500/40 transition-all group flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-mono uppercase text-emerald-400">Emergency Routing</div>
            <div className="text-base font-bold text-white group-hover:text-emerald-300">Plan Safe Evacuation Route</div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
