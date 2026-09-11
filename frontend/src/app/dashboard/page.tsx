'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Activity,
  RefreshCw,
  Layers,
  MapPin,
  ShieldAlert,
  Sliders,
  Navigation,
  CloudRain,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Send,
  Eye,
  ArrowUpRight,
  Sparkles,
  Cpu,
  BarChart3,
  BellRing,
  Share2
} from 'lucide-react';
import { LiveMetrics } from '@/components/dashboard/LiveMetrics';
import { DataSourcesPanel } from '@/components/dashboard/DataSourcesPanel';
import { DataStatusBadge } from '@/components/dashboard/DataStatusBadge';
import { getFloodForecast, getWardDrainage, getHealthCheck } from '@/lib/api';
import { ForecastResponse, DrainageGeoJSON, DataMode } from '@/types';

// Dynamic import for Digital Twin Map to avoid SSR leaflet issues
const DigitalTwinMap = dynamic(() => import('@/components/dashboard/DigitalTwinMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] rounded-2xl glass-panel flex flex-col items-center justify-center space-y-3">
      <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
      <span className="text-xs text-slate-300 font-mono uppercase tracking-wider">
        Loading Ward Drainage Network Mesh...
      </span>
    </div>
  ),
});

const WhatIfSimulation = dynamic(
  () => import('@/components/dashboard/WhatIfSimulation').then((mod) => mod.WhatIfSimulation),
  { ssr: false }
);

const SafeRoutePlanner = dynamic(
  () => import('@/components/dashboard/SafeRoutePlanner').then((mod) => mod.SafeRoutePlanner),
  { ssr: false }
);

const CitizenReportSection = dynamic(
  () => import('@/components/dashboard/CitizenReportSection').then((mod) => mod.CitizenReportSection),
  { ssr: false }
);

type DashboardTab = 'twin' | 'simulation' | 'routing' | 'reports' | 'telemetry';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('twin');
  const [selectedWard, setSelectedWard] = useState('Ward A/B - South Mumbai (Pilot Zone)');
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [drainage, setDrainage] = useState<DrainageGeoJSON | null>(null);
  const [backendMode, setBackendMode] = useState<DataMode>('live');
  const [loading, setLoading] = useState(true);
  const [broadcastAlertActive, setBroadcastAlertActive] = useState(false);
  const [alertSuccessMsg, setAlertSuccessMsg] = useState('');

  const loadWardTelemetry = useCallback(async () => {
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
      console.error('Error fetching dashboard telemetry:', err);
      setBackendMode('offline');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWardTelemetry();
    const interval = setInterval(loadWardTelemetry, 30000);
    return () => clearInterval(interval);
  }, [loadWardTelemetry]);

  const handleTriggerBroadcast = () => {
    setAlertSuccessMsg('Disaster Advisory Broadcast Dispatched to Ward A/B Mobile Sentry Network!');
    setTimeout(() => setAlertSuccessMsg(''), 4000);
  };

  return (
    <div className="min-h-screen pb-20 pt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* 1. Dashboard Command Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-sky-500/25 shadow-xl bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950/40">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase font-mono">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Municipal Operations Center</span>
            </div>
            <DataStatusBadge mode={backendMode} lastUpdated={forecast?.last_updated} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            StreetFlood Digital Twin Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time hydrodynamic monitoring, pipe flow physics, OSRM evacuation solver, and citizen ground truth.
          </p>
        </div>

        {/* Quick Ward Selector & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase font-mono block">Active Sector</label>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="Ward A/B - South Mumbai (Pilot Zone)">Ward A/B - South Mumbai (Pilot Zone)</option>
              <option value="Ward C/D - Marine Lines & Malabar Hill">Ward C/D - Marine Lines & Malabar Hill</option>
              <option value="Ward F/North - Matunga & Sion Basin">Ward F/North - Matunga & Sion Basin</option>
              <option value="Ward G/South - Worli Coastal Drainage">Ward G/South - Worli Coastal Drainage</option>
              <option value="Ward H/West - Bandra & Khar Corridor">Ward H/West - Bandra & Khar Corridor</option>
            </select>
          </div>

          <button
            onClick={loadWardTelemetry}
            disabled={loading}
            className="self-end p-2.5 rounded-xl glass-panel text-sky-400 hover:text-white hover:border-sky-400/50 transition-colors disabled:opacity-50"
            title="Refresh live telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleTriggerBroadcast}
            className="self-end px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Broadcast Alert</span>
          </button>
        </div>
      </div>

      {/* Broadcast Feedback Toast */}
      {alertSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{alertSuccessMsg}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">STATUS: BROADCASTED</span>
        </div>
      )}

      {/* 2. Top-level Live Gauges & Predictive Depth */}
      <LiveMetrics
        data={forecast}
        loading={loading}
        onRefresh={loadWardTelemetry}
      />

      {/* 3. Dashboard Multi-Module Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        <button
          onClick={() => setActiveTab('twin')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'twin'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Live Digital Twin Map</span>
        </button>

        <button
          onClick={() => setActiveTab('simulation')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'simulation'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>What-If Physics Sandbox</span>
        </button>

        <button
          onClick={() => setActiveTab('routing')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'routing'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Safe Route Solver</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'reports'
              ? 'bg-purple-500 text-white shadow-md shadow-purple-500/25'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Citizen Incident Triage</span>
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'telemetry'
              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Sensor Mesh & Provenance</span>
        </button>
      </div>

      {/* 4. Active Tab Content Area */}
      <div className="space-y-6">
        {/* TAB 1: Live Digital Twin Map */}
        {activeTab === 'twin' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-sky-400" />
                  <span>Ward A/B Subterranean Pipe Inundation Mesh</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visualizing pipe-flow load, manhole surcharge nodes, and street depression risk levels.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Active Leaflet Hydraulic Layer
                </span>
              </div>
            </div>

            <DigitalTwinMap
              drainageData={drainage}
              pilotCoords={[18.96, 72.82]}
            />

            {/* Quick Operational Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-mono">CRITICAL NODES</div>
                <div className="text-lg font-bold text-rose-400">Pilot Road Low Point (5.1m)</div>
                <p className="text-xs text-slate-400">Nearest outfall conduit 92m away</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-mono">PUMP DEWATERING CAPACITY</div>
                <div className="text-lg font-bold text-emerald-400">12,000 Liters / min</div>
                <p className="text-xs text-slate-400">2 Mobile pumping stations on standby</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-mono">DETOUR PROTOCOL</div>
                <div className="text-lg font-bold text-sky-400">Automated OSRM Active</div>
                <p className="text-xs text-slate-400">Rerouting commuters via High Street</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: What-If Hydraulic Simulation Sandbox */}
        {activeTab === 'simulation' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-400" />
                  <span>Hydraulic Stress Testing Sandbox</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Simulate severe cloudburst conditions, tidal surge backpressure, and drain debris choke points.
                </p>
              </div>
              <Link
                href="/simulation"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                <span>Dedicated Sandbox Page</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <WhatIfSimulation />
          </div>
        )}

        {/* TAB 3: Safe Route Evacuation Corridor */}
        {activeTab === 'routing' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-amber-400" />
                  <span>AI Dynamic Evacuation Corridor Solver</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Calculates emergency routes avoiding inundated low-points and flooded road segments.
                </p>
              </div>
              <Link
                href="/safe-route"
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <span>Dedicated Route Planner</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <SafeRoutePlanner />
          </div>
        )}

        {/* TAB 4: Citizen Incident Triage */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-purple-400" />
                  <span>Crowdsourced Ground Intelligence & Validation</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Citizen-submitted waterlogging incidents cross-referenced with hydrodynamic simulation math.
                </p>
              </div>
              <Link
                href="/reports"
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
              >
                <span>Full Reports Portal</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <CitizenReportSection />
          </div>
        )}

        {/* TAB 5: Sensor Mesh & Provenance */}
        {activeTab === 'telemetry' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-400" />
                <span>Open-Meteo & Hydrodynamic Architecture Provenance</span>
              </h2>
              <p className="text-xs text-slate-400">
                Detailed telemetry specifications, API sync timestamps, and sensor reliability parameters.
              </p>
            </div>
            <DataSourcesPanel
              rainfallMode={backendMode}
              lastUpdated={forecast?.last_updated}
            />
          </div>
        )}
      </div>
    </div>
  );
}
