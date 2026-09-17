'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth, PRESET_PERSONAS } from '@/context/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { EmergencyActionSystem } from '@/components/dashboard/EmergencyActionSystem';
import {
  Activity,
  Cpu,
  Navigation,
  ShieldAlert,
  Globe2,
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
  Sparkles,
  Zap,
  Radio,
  Layers,
  LogOut,
  User,
  ExternalLink
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

export default function DashboardPage() {
  const { user, isAuthenticated, logout, openAuthModal, loginAsPreset } = useAuth();

  // Interactive Live Hydraulic Sandbox State
  const [rainIntensity, setRainIntensity] = useState(45); // mm/hr
  const [pipeBlockage, setPipeBlockage] = useState(20); // %

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
    <AuthGuard moduleName="Command Center Dashboard">
      <div className="space-y-12 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      {/* 1. Personalized Operational Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 glass-panel border border-sky-500/30 overflow-hidden bg-gradient-to-r from-slate-900/90 via-slate-900/95 to-sky-950/40 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Operational Command Active</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-mono">
                {user ? user.agency : 'Municipal Disaster Management Grid'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {user ? (
                <>Welcome back, <span className="text-sky-400">{user.name}</span></>
              ) : (
                <>UrbanFlood <span className="text-sky-400">Command Center</span></>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              {user ? (
                <span>
                  Role: <strong className="text-white">{user.roleTitle}</strong> • Assigned Sector: <strong className="text-sky-300">{user.ward}</strong> • {user.clearanceLevel}
                </span>
              ) : (
                <span>
                  Real-time municipal digital twin telemetry, hydrodynamic Manning physics engine, automated safe corridors, and emergency broadcast console.
                </span>
              )}
            </p>
          </div>

          {/* User Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800">
                <div className="flex items-center space-x-2 px-3 py-1.5">
                  <span className="text-xl">{user.avatar}</span>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white leading-tight">{user.name}</div>
                    <div className="text-[10px] text-sky-400 font-mono leading-tight">{user.roleTitle}</div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 hover:text-rose-400 text-slate-400 text-xs font-medium border border-slate-800 transition-colors flex items-center space-x-1.5 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('signin')}
                  className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Persona Switcher for Evaluation */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <User className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[11px] font-mono uppercase">Quick Switch Persona:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['commander', 'engineer', 'citizen'] as const).map((roleKey) => {
              const p = PRESET_PERSONAS[roleKey];
              const isCurrent = user?.role === roleKey;
              return (
                <button
                  key={roleKey}
                  onClick={() => loginAsPreset(roleKey)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center space-x-1.5 ${
                    isCurrent
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span>{p.avatar}</span>
                  <span>{p.roleTitle}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Key Live Telemetry Metric Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/digital-twin" className="glass-panel p-4 rounded-2xl text-left border-l-4 border-l-sky-500 hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>PILOT WARD</span>
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-lg font-bold text-white">South Mumbai</div>
          <div className="text-[11px] text-sky-400 font-mono mt-0.5">Ward A/B • 18.96° N</div>
        </Link>

        <Link href="/simulation" className="glass-panel p-4 rounded-2xl text-left border-l-4 border-l-emerald-500 hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>PHYSICS ENGINE</span>
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white">Manning Eq.</div>
          <div className="text-[11px] text-emerald-400 font-mono mt-0.5">Live Hydraulic Pipe-Flow</div>
        </Link>

        <Link href="/safe-route" className="glass-panel p-4 rounded-2xl text-left border-l-4 border-l-amber-500 hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>SAFE ROUTING</span>
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white">OSRM Dynamic</div>
          <div className="text-[11px] text-amber-400 font-mono mt-0.5">Flood-Avoidance Reroute</div>
        </Link>

        <Link href="/rainfall-map" className="glass-panel p-4 rounded-2xl text-left border-l-4 border-l-blue-500 hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>PRECIPITATION RADAR</span>
            <Globe2 className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-lg font-bold text-white">130+ Global Hubs</div>
          <div className="text-[11px] text-blue-400 font-mono mt-0.5">Open-Meteo Mesh</div>
        </Link>
      </div>

      {/* 3. Subsystem Command Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-sky-400 font-bold tracking-wider">
              Platform Modules
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Operational Subsystems</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">All Nodes Online</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subsystems.map((sub) => {
            const Icon = sub.icon;
            return (
              <Link
                key={sub.title}
                href={sub.href}
                className={`group glass-panel p-6 rounded-3xl border border-slate-800 transition-all duration-300 ${sub.accentBorder} hover:scale-[1.02] flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center group-hover:border-sky-500 transition-colors">
                      <Icon className="w-6 h-6 text-sky-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${sub.badgeColor}`}>
                      {sub.badgeText}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                    {sub.title}
                  </h3>
                  <div className="text-xs font-mono text-sky-400/80 mb-2">{sub.tagline}</div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">{sub.description}</p>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-sky-400 pt-4 border-t border-slate-800/80">
                  <span>Open Console</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Live Interactive Manning Hydraulic Sandbox */}
      <section>
        <div className="relative rounded-3xl p-6 sm:p-8 glass-panel border border-sky-500/30 shadow-2xl overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-sky-950/30">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase font-mono tracking-wider mb-2">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>Live Interactive Telemetry Sandbox</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Hydraulic Manning Physics Stress Tester
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                Real-time calculation of catchment runoff Rational Method (Q = C · i · A) against Manning storm drain capacity.
              </p>
            </div>

            <Link
              href="/simulation"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-semibold transition-all shrink-0"
            >
              <span>Full Simulation Suite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Controls (5 Cols) */}
            <div className="lg:col-span-5 space-y-6 bg-slate-950/70 p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-400 font-bold">Input Variables</span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Ward A/B Pilot Conduit
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
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-white hover:border-sky-500/40 cursor-pointer"
                  >
                    Moderate Rain
                  </button>
                  <button
                    onClick={() => { setRainIntensity(65); setPipeBlockage(35); }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-amber-300 hover:text-white hover:border-amber-500/40 cursor-pointer"
                  >
                    Heavy Monsoon
                  </button>
                  <button
                    onClick={() => { setRainIntensity(110); setPipeBlockage(70); }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-rose-300 hover:text-white hover:border-rose-500/40 cursor-pointer"
                  >
                    Extreme Cloudburst
                  </button>
                </div>
              </div>
            </div>

            {/* Calculations Output HUD (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Catchment Runoff Q</div>
                  <div className="text-xl sm:text-2xl font-black text-white mt-1">
                    {runoffQ} <span className="text-xs font-normal text-slate-400">m³/s</span>
                  </div>
                  <div className="text-[10px] text-sky-400 font-mono mt-1">Rational Method: C·i·A</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Drain Capacity</div>
                  <div className="text-xl sm:text-2xl font-black text-white mt-1">
                    {effectiveCapacity} <span className="text-xs font-normal text-slate-400">m³/s</span>
                  </div>
                  <div className="text-[10px] text-amber-400 font-mono mt-1">Manning Formula</div>
                </div>

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

      {/* 5. FLOOD EMERGENCY FLOATING ACTION SYSTEM */}
      <EmergencyActionSystem />

      {/* 6. 10-Second Executive Operational Briefing */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-sky-500/30 shadow-xl space-y-6">
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
              <div className="text-[10px] font-mono uppercase text-purple-400 font-bold mb-1">5. IF RAIN TRIPLES?</div>
              <div className="text-sm font-bold text-white mb-1">Depth: 0.18m → 0.45m</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Runoff jumps from 0.89 to 2.67 m³/s; all pilot segments inundated.
              </p>
            </div>
            <Link href="/rainfall-map" className="mt-3 text-xs text-purple-400 font-semibold hover:text-purple-300">Radar Alert →</Link>
          </div>
        </div>
      </section>

      {/* 7. Live Reports & Incident Stream */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h3 className="text-base font-bold text-white">Live Corroborated Incident Feed</h3>
            </div>
            <Link href="/reports" className="text-xs text-sky-400 hover:text-sky-300 font-semibold">
              View All Reports →
            </Link>
          </div>

          <div className="space-y-3">
            {mockLiveReports.map((report, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between hover:border-sky-500/30 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{report.location}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      report.severity === 'Critical'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : report.severity === 'High'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    }`}>
                      {report.severity}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center space-x-3">
                    <span>Depth: <strong className="text-white">{report.waterDepth}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-400">{report.status}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-mono text-slate-400">{report.time}</div>
                  <div className="text-[10px] text-sky-400 font-mono mt-0.5">{report.reportsCount} citizen pings</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Help & Emergency Hotlines */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-rose-400 mb-3">
              <Ambulance className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Emergency Dispatch Lines</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Direct municipal integration for disaster response, emergency flood mitigation, and boat rescue units.
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Disaster Mgmt Control</div>
                  <div className="text-[10px] text-slate-400">MCGM Ward A Helpline</div>
                </div>
                <span className="text-xs font-mono font-bold text-sky-400">1916</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">National Emergency</div>
                  <div className="text-[10px] text-slate-400">Police & Ambulance</div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">112</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">NDRF Quick Response</div>
                  <div className="text-[10px] text-slate-400">Flood Rescue Unit</div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">011-24363260</span>
              </div>
            </div>
          </div>

          <Link
            href="/safe-route"
            className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-1.5 transition-all"
          >
            <Navigation className="w-4 h-4" />
            <span>Generate Safe Route Detour</span>
          </Link>
        </div>
      </section>
      </div>
    </AuthGuard>
  );
}
