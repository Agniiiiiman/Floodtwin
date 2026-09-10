'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/hero/HeroSection';
import { LiveMetrics } from '@/components/dashboard/LiveMetrics';
import { WhatIfSimulation } from '@/components/dashboard/WhatIfSimulation';
import { SafeRoutePlanner } from '@/components/dashboard/SafeRoutePlanner';
import { CitizenReportSection } from '@/components/dashboard/CitizenReportSection';
import { SolutionSection } from '@/components/sections/SolutionSection';
import { ArchitectureSection } from '@/components/sections/ArchitectureSection';
import { TeamSection } from '@/components/sections/TeamSection';
import { getFloodForecast, getHealthCheck, getWardDrainage } from '@/lib/api';
import { DataMode, ForecastResponse, DrainageGeoJSON } from '@/types';
import { Activity, RefreshCw } from 'lucide-react';
import { DataStatusBadge } from '@/components/dashboard/DataStatusBadge';
import { DrainageDigitalTwin } from '@/components/dashboard/DrainageDigitalTwin';

// Dynamic import for Digital Twin Map
const DigitalTwinMap = dynamic(
  () => import('@/components/dashboard/DigitalTwinMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[450px] lg:h-[500px] rounded-2xl glass-panel flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
        <span className="text-xs text-slate-300 font-mono uppercase tracking-wider">
          Initializing Digital Twin Mesh...
        </span>
      </div>
    ),
  }
);

export default function HomePage() {
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [drainage, setDrainage] = useState<DrainageGeoJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataMode, setDataMode] = useState<DataMode>('offline');
  const [lastUpdated, setLastUpdated] = useState<string>();

  const loadWardData = useCallback(async () => {
    setLoading(true);
    try {
      const [health, forecastData, drainageData] = await Promise.all([
        getHealthCheck(),
        getFloodForecast(18.96, 72.82),
        getWardDrainage('pilot_ward'),
      ]);
      setForecast(forecastData);
      setDrainage(drainageData);
      setDataMode(health.mode === 'offline' ? 'offline' : forecastData.data_mode ?? health.mode);
      setLastUpdated(forecastData.last_updated ?? health.last_checked);
    } catch (err) {
      console.error('Error fetching ward telemetry:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadWardData(), 0);

    // Poll live telemetry every 30 seconds
    const interval = setInterval(loadWardData, 30000);
    return () => {
      window.clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, [loadWardData]);

  return (
    <div className="space-y-16">
      {/* 1. Hero Section with Atmospheric Rain */}
      <HeroSection />

      {/* 2. Pilot Ward Digital Twin Command Center */}
      <section id="dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Activity className="w-3.5 h-3.5" />
              <span>Street-Level Flood Risk Operations</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              South Mumbai Pilot Ward Digital Twin
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl">
              Indicative risk classification for Ward A/B using rainfall, pilot drainage data, and a transparent runoff-capacity model.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <DataStatusBadge mode={dataMode} lastUpdated={lastUpdated} />
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
        <div className="space-y-6">
          <LiveMetrics
            data={forecast}
            loading={loading}
            onRefresh={loadWardData}
          />

          {/* Interactive Leaflet Digital Twin Map */}
          <DigitalTwinMap
            drainageData={drainage}
            pilotCoords={[18.96, 72.82]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="glass-panel rounded-xl p-3 border border-sky-500/15">
              <div className="text-slate-400">Rainfall</div>
              <div className="text-white font-semibold mt-1">{forecast?.data_source ?? 'Waiting for data'}</div>
            </div>
            <div className="glass-panel rounded-xl p-3 border border-sky-500/15">
              <div className="text-slate-400">Drainage network</div>
              <div className="text-amber-300 font-semibold mt-1">Synthetic pilot topology</div>
            </div>
            <div className="glass-panel rounded-xl p-3 border border-sky-500/15">
              <div className="text-slate-400">Flood risk</div>
              <div className="text-sky-300 font-semibold mt-1">Model-generated, indicative ranges</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. What-If Simulation & Safe Route Optimizer Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <WhatIfSimulation />
          <SafeRoutePlanner />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DrainageDigitalTwin />
      </section>

      {/* 4. Citizen Crowdsourced Reporting */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CitizenReportSection />
      </section>

      {/* 5. Solution Pillars */}
      <SolutionSection />

      {/* 6. Architecture & Tech Pipeline */}
      <ArchitectureSection />

      {/* 7. Team Section */}
      <TeamSection />
    </div>
  );
}
