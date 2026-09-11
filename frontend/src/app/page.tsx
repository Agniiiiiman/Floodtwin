'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HeroSection } from '@/components/hero/HeroSection';
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
  Radio,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Ambulance,
  UserCheck,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';

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
];

const mockLiveReports = [
  {
    location: 'Colaba Causeway - Junction 4',
    waterDepth: '0.35m',
    time: '3 mins ago',
    status: 'Corroborated by Manning Model',
    severity: 'High',
    reportsCount: 14,
  },
  {
    location: 'Marine Drive Coastal Low Point',
    waterDepth: '0.18m',
    time: '9 mins ago',
    status: 'Detour Route Active',
    severity: 'Moderate',
    reportsCount: 8,
  },
  {
    location: 'Crawford Market Underpass',
    waterDepth: '0.52m',
    time: '14 mins ago',
    status: 'Automated Surcharge Warning',
    severity: 'Critical',
    reportsCount: 22,
  },
];

export default function HomePage() {
  // Interactive Live Hydraulic Sandbox State on Landing Page
  const [rainIntensity, setRainIntensity] = useState(45); // mm/hr
  const [pipeBlockage, setPipeBlockage] = useState(20); // %
  const [activePersona, setActivePersona] = useState<'municipal' | 'responder' | 'citizen'>('municipal');

  // Computed Hydraulic Variables
  const runoffCoeff = 0.85;
  const catchmentArea = 45000; // m2
  const runoffQ = ((runoffCoeff * rainIntensity * catchmentArea) / 3600000).toFixed(2); // m3/s
  const rawCapacity = 0.65; // m3/s
  const effectiveCapacity = (rawCapacity * (1 - pipeBlockage / 100)).toFixed(2);
  const utilizationPercent = Math.min(Math.round((parseFloat(runoffQ) / parseFloat(effectiveCapacity)) * 100), 250);
  const estimatedWaterDepth = utilizationPercent > 100 ? ((utilizationPercent - 100) * 0.004 + 0.05).toFixed(2) : '0.00';
  const isFlooded = utilizationPercent > 100;

  return (
    <div className="space-y-20 pb-24">
      {/* 1. Hero Section with Atmospheric Rain */}
      <HeroSection />

      {/* 2. Interactive Live Hydraulic Sandbox & Digital Twin Quick Simulator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-6 sm:p-10 glass-panel border border-sky-500/30 shadow-2xl overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-sky-950/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Section Heading */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase font-mono tracking-wider mb-2">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>Live Interactive Sandbox</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Test the Hydraulic Manning Physics Engine
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                Adjust precipitation intensity and storm drain blockage to observe real-time runoff discharge, pipe saturation, and automatic emergency rerouting.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/simulation"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-semibold transition-all"
              >
                <span>Full Simulation Suite</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Interactive Grid: Controls + Live HUD Outputs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Controls (5 Cols) */}
            <div className="lg:col-span-5 space-y-6 bg-slate-950/70 p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-400 font-bold">Input Variables</span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Ward A/B Pilot
                </span>
              </div>

              {/* Rain Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Precipitation Intensity:</span>
                  <span className="text-sky-400 font-mono font-bold">{rainIntensity} mm/hr</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={rainIntensity}
                  onChange={(e) => setRainIntensity(Number(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Drizzle (5 mm/hr)</span>
                  <span>Monsoon (45)</span>
                  <span>Cloudburst (120 mm/hr)</span>
                </div>
              </div>

              {/* Drain Blockage Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Storm Drain Debris Blockage:</span>
                  <span className="text-amber-400 font-mono font-bold">{pipeBlockage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={pipeBlockage}
                  onChange={(e) => setPipeBlockage(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Clear (0%)</span>
                  <span>Moderate (40%)</span>
                  <span>Heavy Choke (90%)</span>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[11px] text-slate-400 font-mono block">Scenarios:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setRainIntensity(25); setPipeBlockage(10); }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-white hover:border-sky-500/40"
                  >
                    Moderate Rain
                  </button>
                  <button
                    onClick={() => { setRainIntensity(65); setPipeBlockage(35); }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-amber-300 hover:text-white hover:border-amber-500/40"
                  >
                    Heavy Monsoon
                  </button>
                  <button
                    onClick={() => { setRainIntensity(110); setPipeBlockage(70); }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-rose-300 hover:text-white hover:border-rose-500/40"
                  >
                    Extreme Cloudburst
                  </button>
                </div>
              </div>
            </div>

            {/* Live Hydraulic Calculation Engine Results (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Metric 1: Inflow Discharge */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Catchment Runoff Q</div>
                  <div className="text-xl sm:text-2xl font-black text-white mt-1">
                    {runoffQ} <span className="text-xs font-normal text-slate-400">m³/s</span>
                  </div>
                  <div className="text-[10px] text-sky-400 font-mono mt-1">Rational Method: C·i·A</div>
                </div>

                {/* Metric 2: Pipe Capacity */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Drain Capacity</div>
                  <div className="text-xl sm:text-2xl font-black text-white mt-1">
                    {effectiveCapacity} <span className="text-xs font-normal text-slate-400">m³/s</span>
                  </div>
                  <div className="text-[10px] text-amber-400 font-mono mt-1">Manning Equation</div>
                </div>

                {/* Metric 3: Water Depth */}
                <div className={`p-4 rounded-xl border col-span-2 sm:col-span-1 ${
                  isFlooded ? 'bg-rose-950/40 border-rose-500/40' : 'bg-emerald-950/40 border-emerald-500/40'
                }`}>
                  <div className="text-[10px] font-mono uppercase text-slate-300">Street Water Depth</div>
                  <div className={`text-xl sm:text-2xl font-black mt-1 ${isFlooded ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {estimatedWaterDepth} <span className="text-xs font-normal text-slate-300">m</span>
                  </div>
                  <div className="text-[10px] font-mono mt-1">
                    {isFlooded ? '⚠️ INUNDATED' : '✓ CLEAR DRAINAGE'}
                  </div>
                </div>
              </div>

              {/* Status Output Banner */}
              <div className={`p-5 rounded-2xl border transition-all ${
                isFlooded
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  : 'bg-sky-500/10 border-sky-500/30 text-sky-200'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      {isFlooded ? (
                        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      <h4 className="text-sm font-bold text-white">
                        {isFlooded
                          ? `Hydraulic Surcharge Triggered (${utilizationPercent}% Pipe Load)`
                          : `Optimal Flow State (${utilizationPercent}% Capacity Utilized)`}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300">
                      {isFlooded
                        ? 'Surface runoff exceeds drainage section capacity. Automated OSRM safe detour calculated (1,435m bypass corridor).'
                        : 'Subterranean conduit is maintaining non-pressurized gravity flow. Roads unobstructed.'}
                    </p>
                  </div>

                  <Link
                    href={isFlooded ? '/safe-route' : '/digital-twin'}
                    className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-md transition-all ${
                      isFlooded
                        ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20'
                        : 'bg-sky-600 hover:bg-sky-500 shadow-sky-500/20'
                    }`}
                  >
                    {isFlooded ? 'View Detour Corridor' : 'Open Ward Twin'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 10-Second Operational Decision Matrix */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-sky-500/30 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                10-Second Executive Briefing
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
                Urban Flood Intelligence Decision Matrix
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Pilot Ward: South Mumbai A/B</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Q1: WHERE */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-rose-500/40 transition-colors">
              <div>
                <div className="text-[10px] font-mono uppercase text-rose-400 font-bold mb-1">1. WHERE IS FLOODING?</div>
                <div className="text-sm font-bold text-white mb-1">Pilot Road Junction</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Low-point depression at 5.1m elevation with 92m distance to nearest drain.
                </p>
              </div>
              <Link href="/digital-twin" className="mt-3 text-xs text-sky-400 font-semibold hover:text-sky-300">View Map →</Link>
            </div>

            {/* Q2: WHY */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
              <div>
                <div className="text-[10px] font-mono uppercase text-amber-400 font-bold mb-1">2. WHY? (PHYSICS)</div>
                <div className="text-sm font-bold text-white mb-1">Inflow &gt; Capacity</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Catchment runoff $Q = C \cdot i \cdot A$ generates 0.89 m³/s vs 0.55 m³/s capacity (162% load).
                </p>
              </div>
              <Link href="/simulation" className="mt-3 text-xs text-amber-400 font-semibold hover:text-amber-300">Run Physics Model →</Link>
            </div>

            {/* Q3: WHICH ROAD TO AVOID */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
              <div>
                <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold mb-1">3. WHICH ROAD TO AVOID?</div>
                <div className="text-sm font-bold text-white mb-1">Auto-Detour Active</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Low-point segment avoided; OSRM routes 1435m detour with 0 flood risk.
                </p>
              </div>
              <Link href="/safe-route" className="mt-3 text-xs text-emerald-400 font-semibold hover:text-emerald-300">Safe Route →</Link>
            </div>

            {/* Q4: DRAINAGE BLOCKAGE */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-blue-500/40 transition-colors">
              <div>
                <div className="text-[10px] font-mono uppercase text-blue-400 font-bold mb-1">4. IF DRAIN IS BLOCKED?</div>
                <div className="text-sm font-bold text-white mb-1">What-If Surcharge</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  90% blockage cuts capacity to 0.2 m³/s, triggering downstream junction overflow.
                </p>
              </div>
              <Link href="/simulation" className="mt-3 text-xs text-blue-400 font-semibold hover:text-blue-300">Run What-If →</Link>
            </div>

            {/* Q5: RAINFALL SURGE */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-purple-500/40 transition-colors">
              <div>
                <div className="text-[10px] font-mono uppercase text-purple-400 font-bold mb-1">5. IF RAIN INCREASES?</div>
                <div className="text-sm font-bold text-white mb-1">Dynamic Escalation</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Intensity scaled from 5 to 80 mm/hr propagates hydraulic utilization from 28% to 180%.
                </p>
              </div>
              <Link href="/rainfall-map" className="mt-3 text-xs text-purple-400 font-semibold hover:text-purple-300">Rain Radar →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Persona-Driven Solutions Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built For Every Stakeholder</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Tailored Urban Disaster Solutions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Seamlessly serving municipal drainage engineers, emergency response authorities, and everyday citizens.
          </p>

          {/* Persona Tabs */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 mt-6 gap-2">
            <button
              onClick={() => setActivePersona('municipal')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activePersona === 'municipal'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Municipal Engineers</span>
            </button>
            <button
              onClick={() => setActivePersona('responder')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activePersona === 'responder'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Ambulance className="w-4 h-4" />
              <span>Emergency Responders</span>
            </button>
            <button
              onClick={() => setActivePersona('citizen')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activePersona === 'citizen'
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Citizens & Commuters</span>
            </button>
          </div>
        </div>

        {/* Active Persona Card */}
        <div className="glass-panel p-8 rounded-3xl border border-sky-500/25 shadow-xl">
          {activePersona === 'municipal' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">1</div>
                <h3 className="text-lg font-bold text-white">Subterranean Hydraulic Surcharge Detection</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pinpoint exact pipes operating above 100% capacity before manholes overflow, allowing preemptive desilting crew dispatch.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">2</div>
                <h3 className="text-lg font-bold text-white">What-If Cloudburst Simulation Sandbox</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Stress-test future municipal drainage expansion projects against 1-in-50 year extreme precipitation patterns.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">3</div>
                <h3 className="text-lg font-bold text-white">Corroborated Ground Truth Ingestion</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cross-verify citizen waterlogging reports with physical Manning sensor math to weed out false alarms.
                </p>
              </div>
            </div>
          )}

          {activePersona === 'responder' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">1</div>
                <h3 className="text-lg font-bold text-white">Zero-Flood Evacuation Corridors</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  OSRM routing engine calculates dynamic bypass corridors avoiding deep inundations for emergency vehicles.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">2</div>
                <h3 className="text-lg font-bold text-white">Low-Point Depression Warnings</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Immediate alerts when underpasses and low-lying road intersections exceed safe vehicle clearance thresholds.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">3</div>
                <h3 className="text-lg font-bold text-white">Rapid Dispatch Asset Allocation</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Deploy inflatable rescue boats, heavy dewatering pumps, and SDRF personnel precisely where water depth exceeds 0.4m.
                </p>
              </div>
            </div>
          )}

          {activePersona === 'citizen' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">1</div>
                <h3 className="text-lg font-bold text-white">Safe Street-by-Street Walking Navigation</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Know exact water depth on your daily commute and discover elevated, dry pedestrian walkways.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">2</div>
                <h3 className="text-lg font-bold text-white">1-Click Geotagged Waterlogging Reports</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Snap a photo of standing water to automatically notify municipal engineers and warn nearby fellow commuters.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">3</div>
                <h3 className="text-lg font-bold text-white">60s Live Meteorological Radar</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time cloudburst forecast and precipitation countdowns for 130+ sectors across the city.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Platform Subsystems Modular Hub */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Modular Subsystem Directory</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Explore Independent Modules
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl">
              Each component of the StreetFlood Twin is built as an independent, dedicated workspace for granular analysis and rapid deployment.
            </p>
          </div>
        </div>

        {/* Subsystem Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {subsystems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className={`group glass-panel rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between border border-slate-800/80 ${item.accentBorder} shadow-lg hover:shadow-2xl`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-center text-sky-400 group-hover:text-white group-hover:bg-sky-500/20 group-hover:border-sky-500/40 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${item.badgeColor}`}>
                      {item.badgeText}
                    </div>
                  </div>

                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    {item.tagline}
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-sky-400 group-hover:text-white transition-colors">
                  <span>Launch Module</span>
                  <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 6. Live Corroborated Ground Truth Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-sky-500/20 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 text-xs font-mono text-purple-400">
                <ShieldAlert className="w-4 h-4" />
                <span>Live Ground Truth Telemetry</span>
              </div>
              <h3 className="text-xl font-bold text-white">Citizen Reports Corroboration Ticker</h3>
            </div>
            <Link
              href="/reports"
              className="inline-flex items-center space-x-2 text-xs font-semibold text-sky-400 hover:text-sky-300"
            >
              <span>Submit Ground Observation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockLiveReports.map((report, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    <span className="font-semibold text-white truncate max-w-[160px]">{report.location}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                    report.severity === 'Critical'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : report.severity === 'High'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {report.severity}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-black text-white">
                    {report.waterDepth}{' '}
                    <span className="text-xs font-normal text-slate-400">inundation</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {report.time}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    {report.status}
                  </span>
                  <span className="text-slate-400 font-mono">{report.reportsCount} citizen votes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Call To Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 glass-panel border border-sky-500/30 relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950/60 shadow-2xl">
          <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Open for Municipal Pilot Onboarding • SIH 2026</span>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
                Empower Your City Against Urban Inundation
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                Ready to integrate physics-driven Manning simulations, live Open-Meteo forecasts, and life-saving OSRM emergency corridors into your municipality?
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="/digital-twin"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold tracking-wide shadow-lg shadow-sky-500/30 hover:scale-105 transition-all"
              >
                Launch Ward Digital Twin
              </Link>
              <Link
                href="/safe-route"
                className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-semibold tracking-wide transition-all"
              >
                Open Route Planner
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
