'use client';

import React from 'react';
import Link from 'next/link';
import { HeroSection } from '@/components/hero/HeroSection';
<<<<<<< HEAD
import { 
  Activity, 
  Cpu, 
  Navigation, 
  ShieldAlert, 
  Globe2, 
  Layers, 
  Layers2,
  Users, 
  ArrowUpRight, 
  ChevronRight, 
  Radio, 
  Droplets,
  ShieldCheck
} from 'lucide-react';
=======
import { LiveMetrics } from '@/components/dashboard/LiveMetrics';
import { WhatIfSimulation } from '@/components/dashboard/WhatIfSimulation';
import { SafeRoutePlanner } from '@/components/dashboard/SafeRoutePlanner';
import { CitizenReportSection } from '@/components/dashboard/CitizenReportSection';
import { SolutionSection } from '@/components/sections/SolutionSection';
import { ArchitectureSection } from '@/components/sections/ArchitectureSection';
import { TeamSection } from '@/components/sections/TeamSection';
import { getFloodForecast, getHealthCheck, getStreetRisk, getWardDrainage } from '@/lib/api';
import { DataMode, ForecastResponse, DrainageGeoJSON, StreetRiskResponse } from '@/types';
import { Activity, RefreshCw } from 'lucide-react';
import { DataStatusBadge } from '@/components/dashboard/DataStatusBadge';
import { DrainageDigitalTwin } from '@/components/dashboard/DrainageDigitalTwin';
import { DataSourcesPanel } from '@/components/dashboard/DataSourcesPanel';
>>>>>>> 7e9b764f922502b7affb67b799c7cfcad7d2a3a8

const subsystems = [
  {
    title: 'Pilot Ward Digital Twin',
    tagline: 'Hydraulic Command Center',
    description: 'Real-time South Mumbai Ward A/B subterranean drainage network mesh, pipe saturation monitoring, and live Manning equation telemetry.',
    href: '/digital-twin',
    icon: Activity,
    color: 'sky',
    accentBorder: 'hover:border-sky-500/50',
    badgeText: 'Live Sensor Mesh',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  },
  {
    title: 'What-If Simulation',
    tagline: 'Hydraulic Stress Testing Sandbox',
    description: 'Interactive sandbox to test extreme cloudbursts, tidal surges, and pipe debris blockage impacts on urban drainage capacity.',
    href: '/simulation',
    icon: Cpu,
    color: 'emerald',
    accentBorder: 'hover:border-emerald-500/50',
    badgeText: 'Manning Physics Engine',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    title: 'Safe Route Planner',
    tagline: 'AI Emergency Evacuation Corridor',
    description: 'Dynamic OSRM-based navigation that calculates safe evacuation paths while actively steering around inundated streets and flooded junctions.',
    href: '/safe-route',
    icon: Navigation,
    color: 'amber',
    accentBorder: 'hover:border-amber-500/50',
    badgeText: 'OSRM Route Solver',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    title: 'Global Rainfall Radar',
    tagline: 'Open-Meteo Meteorological Mesh',
    description: 'Continuous precipitation sampling across 130+ global metropolitan hubs and high-monsoon sectors with automated 60s live countdown.',
    href: '/rainfall-map',
    icon: Globe2,
    color: 'blue',
    accentBorder: 'hover:border-blue-500/50',
    badgeText: '130+ Global Sectors',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  {
    title: 'Citizen Incident Portal',
    tagline: 'Crowdsourced Ground Intelligence',
    description: 'Community-assisted flood reporting with photo geotagging and real-time corroboration to validate hydraulic simulations.',
    href: '/reports',
    icon: ShieldAlert,
    color: 'purple',
    accentBorder: 'hover:border-purple-500/50',
    badgeText: 'Corroborated Reports',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  {
    title: 'Hydraulic Methodology',
    tagline: 'Scientific Formulation & Pillars',
    description: 'In-depth breakdown of the 3-layer architecture, open-channel flow mathematical principles, and municipal urban resilience framework.',
    href: '/solution',
    icon: Layers,
    color: 'teal',
    accentBorder: 'hover:border-teal-500/50',
    badgeText: 'Hydraulic Principles',
    badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  },
  {
    title: 'System Architecture',
    tagline: 'Distributed Data Flow Pipeline',
    description: 'Detailed technical diagram and stack overview spanning Open-Meteo feeds, FastAPI asynchronous computing, and Leaflet rendering.',
    href: '/architecture',
    icon: Layers2,
    color: 'cyan',
    accentBorder: 'hover:border-cyan-500/50',
    badgeText: 'Full-Stack Pipeline',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
  {
    title: 'Team Error 404',
    tagline: 'SIH 2024 Innovators',
    description: 'Meet the engineering and research team behind the Error 404 Urban Flood Digital Twin & Emergency Routing platform.',
    href: '/team',
    icon: Users,
    color: 'indigo',
    accentBorder: 'hover:border-indigo-500/50',
    badgeText: 'Smart India Hackathon',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
];

export default function HomePage() {
<<<<<<< HEAD
=======
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [drainage, setDrainage] = useState<DrainageGeoJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataMode, setDataMode] = useState<DataMode>('offline');
  const [lastUpdated, setLastUpdated] = useState<string>();
  const [streetRisk, setStreetRisk] = useState<StreetRiskResponse | null>(null);

  const loadWardData = useCallback(async () => {
    setLoading(true);
    try {
      const [health, forecastData, drainageData, streetRiskData] = await Promise.all([
        getHealthCheck(),
        getFloodForecast(18.96, 72.82),
        getWardDrainage('pilot_ward'),
        getStreetRisk('pilot_ward', 20),
      ]);
      setForecast(forecastData);
      setDrainage(drainageData);
      setStreetRisk(streetRiskData);
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

>>>>>>> 7e9b764f922502b7affb67b799c7cfcad7d2a3a8
  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Section with Atmospheric Rain */}
      <HeroSection />

      {/* 2. Platform Subsystems Modular Hub */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-3">
<<<<<<< HEAD
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Modular Subsystem Directory</span>
=======
              <Activity className="w-3.5 h-3.5" />
              <span>Street-Level Flood Risk Operations</span>
>>>>>>> 7e9b764f922502b7affb67b799c7cfcad7d2a3a8
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Explore Independent Modules
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl">
<<<<<<< HEAD
              Each component of the Error 404 Flood Twin is built as an independent, dedicated workspace for granular analysis and rapid deployment.
=======
              Indicative risk classification for Ward A/B using rainfall, pilot drainage data, and a transparent runoff-capacity model.
>>>>>>> 7e9b764f922502b7affb67b799c7cfcad7d2a3a8
            </p>
          </div>
        </div>

<<<<<<< HEAD
        {/* Subsystem Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subsystems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className={`group glass-panel rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between border border-slate-800/80 ${item.accentBorder} shadow-lg hover:shadow-2xl`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-center text-sky-400 group-hover:text-white group-hover:bg-sky-500/20 group-hover:border-sky-500/40 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-[11px] font-mono border ${item.badgeColor}`}>
                      {item.badgeText}
                    </div>
                  </div>

                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    {item.tagline}
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-sky-300 transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-sky-400 group-hover:text-white transition-colors">
                  <span>Launch Module</span>
                  <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. System Highlights Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-10 glass-panel border border-sky-500/20 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Engine Ready • SIH 2024</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Ready for Live Urban Deployment
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                Combining hydrodynamic modeling, real-time sensor integration, crowdsourced verification, and life-saving routing algorithms.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/digital-twin"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold tracking-wide shadow-lg shadow-sky-500/30 transition-all"
              >
                Launch Ward Digital Twin
              </Link>
              <Link
                href="/safe-route"
                className="px-6 py-3 rounded-xl glass-panel text-slate-300 hover:text-white hover:border-sky-400/50 text-xs sm:text-sm font-semibold tracking-wide transition-all"
              >
                Open Route Planner
              </Link>
=======
          <div className="flex items-center space-x-3">
            <DataStatusBadge mode={dataMode} lastUpdated={lastUpdated} />
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-slate-400 uppercase font-mono">PILOT COORDINATES</div>
              <div className="text-xs text-sky-400 font-mono font-semibold">18.96° N, 72.82° E</div>
>>>>>>> 7e9b764f922502b7affb67b799c7cfcad7d2a3a8
            </div>
          </div>
        </div>
<<<<<<< HEAD
      </section>
=======

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
                        streetRiskData={streetRisk}
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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DataSourcesPanel rainfallMode={dataMode} lastUpdated={lastUpdated} />
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
>>>>>>> 7e9b764f922502b7affb67b799c7cfcad7d2a3a8
    </div>
  );
}
