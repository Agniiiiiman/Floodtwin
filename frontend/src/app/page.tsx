'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RainEffect } from '@/components/hero/RainEffect';
import {
  Activity,
  Cpu,
  Navigation,
  ShieldAlert,
  Globe2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Sliders,
  AlertTriangle,
  Layers,
  Users,
  Building2,
  Lock,
  ChevronRight,
  Shield,
  Award
} from 'lucide-react';

const subsystems = [
  {
    id: 'twin',
    title: 'Pilot Ward Digital Twin',
    tagline: 'Subterranean Hydraulic Mesh',
    description: 'Real-time South Mumbai Ward A/B drainage conduit mapping, pipe load saturation tracking, and live sensor telemetry.',
    targetUrl: '/digital-twin',
    icon: Activity,
    badge: 'Live Mesh',
    badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  },
  {
    id: 'sim',
    title: 'Hydraulic Simulation Suite',
    tagline: 'Manning Physics Sandbox',
    description: 'Stress-test extreme cloudbursts (up to 120mm/hr), high-tide sea surges, and pipe debris blockage impacts on drainage capacity.',
    targetUrl: '/simulation',
    icon: Cpu,
    badge: 'Physics Engine',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    id: 'route',
    title: 'Safe Evacuation Navigator',
    tagline: 'OSRM Dynamic Solver',
    description: 'AI-assisted turn-by-turn emergency routing that dynamically computes detour corridors around flooded streets and submerged junctions.',
    targetUrl: '/safe-route',
    icon: Navigation,
    badge: 'Detour AI',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    id: 'radar',
    title: 'Global Rainfall Radar',
    tagline: 'Open-Meteo Meteorological Mesh',
    description: 'Continuous precipitation sampling across 130+ global high-risk metropolitan sectors with automated 60-second live telemetry refresh.',
    targetUrl: '/rainfall-map',
    icon: Globe2,
    badge: '130+ Cities',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  {
    id: 'reports',
    title: 'Citizen Incident Portal',
    tagline: 'Crowdsourced Ground Intelligence',
    description: 'Community-powered photo geotagging and depth reporting that validates hydraulic model calculations in real time.',
    targetUrl: '/reports',
    icon: ShieldAlert,
    badge: 'Corroborated',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
];

const workflowSteps = [
  {
    step: '01',
    title: 'Precipitation & Catchment Sensing',
    description: 'High-resolution meteorological feeds continuously stream mm/hr rainfall rates into the rational method catchment formula.',
    icon: Globe2,
  },
  {
    step: '02',
    title: 'Manning Hydraulic Equation Solver',
    description: 'Calculates pipe discharge capacity vs surface runoff to pinpoint conduit pressurization and hydraulic surcharge points.',
    icon: Cpu,
  },
  {
    step: '03',
    title: 'Predictive Street-Level Inundation',
    description: 'Detects road depression depths before flooding occurs, classifying risk into Minor, Surcharge, or Inundated.',
    icon: Activity,
  },
  {
    step: '04',
    title: 'Dynamic OSRM Safe Route Corridor',
    description: 'Generates instant emergency evacuation paths that dynamically avoid flooded intersections and waterlogged corridors.',
    icon: Navigation,
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { user, isAuthenticated, openAuthModal, loginAsPreset } = useAuth();

  // Interactive Live Hydraulic Sandbox State
  const [rainIntensity, setRainIntensity] = useState(50); // mm/hr
  const [pipeBlockage, setPipeBlockage] = useState(25); // %

  // Computed Hydraulic Variables
  const runoffCoeff = 0.85;
  const catchmentArea = 45000; // m2
  const runoffQ = ((runoffCoeff * rainIntensity * catchmentArea) / 3600000).toFixed(2); // m3/s
  const rawCapacity = 0.65; // m3/s
  const effectiveCapacity = (rawCapacity * (1 - pipeBlockage / 100)).toFixed(2);
  const utilizationPercent = Math.min(Math.round((parseFloat(runoffQ) / parseFloat(effectiveCapacity)) * 100), 250);
  const estimatedWaterDepth = utilizationPercent > 100 ? ((utilizationPercent - 100) * 0.004 + 0.05).toFixed(2) : '0.00';
  const isFlooded = utilizationPercent > 100;

  const handleFeatureAccess = (targetUrl: string) => {
    if (isAuthenticated) {
      router.push(targetUrl);
    } else {
      openAuthModal('signin');
    }
  };

  const handleQuickDemoEnter = async (presetKey: 'commander' | 'engineer' | 'citizen') => {
    await loginAsPreset(presetKey);
    router.push('/dashboard');
  };

  return (
    <div className="space-y-24 pb-28 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-16 lg:py-24">
        {/* Animated Rain Particles */}
        <RainEffect />

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-sky-500/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-[450px] h-[450px] bg-blue-600/15 rounded-full blur-[130px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Top SIH Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-8 backdrop-blur-md shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Smart India Hackathon 2026 • Urban Flood Risk Digital Twin</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1] mb-6">
            Predict Flood Risks.{' '}
            <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Navigate Safely.
            </span>{' '}
            Protect Cities.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
            Real-time hydrodynamic digital twins powered by Manning&apos;s hydraulic equations, 
            instant OSRM emergency evacuation routing, and crowdsourced citizen ground verification.
          </p>

          {/* Main Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-sm font-bold tracking-wide shadow-xl shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-[1.02] transition-all duration-200"
              >
                <Activity className="w-5 h-5" />
                <span>Go to Command Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal('signin')}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-sm font-bold tracking-wide shadow-xl shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                >
                  <Activity className="w-5 h-5" />
                  <span>Login to Command Center</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => openAuthModal('signup')}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white border border-sky-500/40 text-sm font-semibold tracking-wide hover:scale-[1.02] transition-all duration-200 shadow-md shadow-sky-500/10 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span>Create Account</span>
                </button>
              </>
            )}

            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-4 rounded-2xl glass-panel text-sky-300 hover:text-white hover:border-sky-400/50 text-sm font-semibold tracking-wide hover:scale-[1.02] transition-all duration-200"
            >
              <span>Explore Features</span>
            </a>
          </div>

          {/* Quick 1-Click Persona Sandbox Access Banner */}
          <div className="max-w-3xl mx-auto p-4 rounded-2xl glass-panel border border-sky-500/25 backdrop-blur-md shadow-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-left">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-slate-300 font-medium">
                  <strong>Instant Demo Access:</strong> Test features with 1-click role logins:
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuickDemoEnter('commander')}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-sky-500/20 border border-slate-700 hover:border-sky-500 text-xs font-semibold text-sky-300 transition-all cursor-pointer flex items-center space-x-1"
                >
                  <span>👨‍✈️</span>
                  <span>Commander</span>
                </button>
                <button
                  onClick={() => handleQuickDemoEnter('engineer')}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500 text-xs font-semibold text-emerald-300 transition-all cursor-pointer flex items-center space-x-1"
                >
                  <span>👩‍🔬</span>
                  <span>Engineer</span>
                </button>
                <button
                  onClick={() => handleQuickDemoEnter('citizen')}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-purple-500/20 border border-slate-700 hover:border-purple-500 text-xs font-semibold text-purple-300 transition-all cursor-pointer flex items-center space-x-1"
                >
                  <span>🧑‍🚒</span>
                  <span>Citizen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS & KEY CAPABILITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-sky-500/20 text-center relative overflow-hidden group hover:border-sky-500/40 transition-all">
            <div className="text-3xl sm:text-4xl font-black text-white font-mono">&lt; 500ms</div>
            <div className="text-xs text-sky-400 font-semibold mt-1 uppercase tracking-wider">Hydraulic Solve Time</div>
            <p className="text-[11px] text-slate-400 mt-2">Manning conduit flow & rational runoff calculation</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-emerald-500/20 text-center relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="text-3xl sm:text-4xl font-black text-white font-mono">100%</div>
            <div className="text-xs text-emerald-400 font-semibold mt-1 uppercase tracking-wider">Street-Level Granularity</div>
            <p className="text-[11px] text-slate-400 mt-2">Precise junction, slope, and culvert mapping</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-amber-500/20 text-center relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="text-3xl sm:text-4xl font-black text-white font-mono">1,435m</div>
            <div className="text-xs text-amber-400 font-semibold mt-1 uppercase tracking-wider">Zero-Flood Detour</div>
            <p className="text-[11px] text-slate-400 mt-2">Dynamic OSRM flood-avoidance corridor</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 text-center relative overflow-hidden group hover:border-purple-500/40 transition-all">
            <div className="text-3xl sm:text-4xl font-black text-white font-mono">130+</div>
            <div className="text-xs text-purple-400 font-semibold mt-1 uppercase tracking-wider">Global Radar Hubs</div>
            <p className="text-[11px] text-slate-400 mt-2">Continuous Open-Meteo precipitation mesh</p>
          </div>
        </div>
      </section>

      {/* 3. CORE PLATFORM SUBSYSTEMS PREVIEW (REQUIRES LOGIN TO LAUNCH) */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Resilience Features</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Comprehensive Urban Flood Modules
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            Login or sign up to unlock full operational access to each specialized digital twin tool.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subsystems.map((sub) => {
            const Icon = sub.icon;
            return (
              <div
                key={sub.id}
                className="group glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 hover:border-sky-500/50 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center group-hover:border-sky-500 transition-colors">
                      <Icon className="w-6 h-6 text-sky-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${sub.badgeBg}`}>
                      {sub.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-sky-300 transition-colors">
                    {sub.title}
                  </h3>
                  <div className="text-xs font-mono text-sky-400/80 mb-3">{sub.tagline}</div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">{sub.description}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => handleFeatureAccess(sub.targetUrl)}
                    className="text-xs font-semibold text-slate-300 group-hover:text-sky-400 flex items-center space-x-1 cursor-pointer"
                  >
                    {!isAuthenticated && <Lock className="w-3.5 h-3.5 text-sky-400 mr-1" />}
                    <span>{isAuthenticated ? 'Open Module' : 'Login to Open'}</span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => handleFeatureAccess(sub.targetUrl)}
                    className="text-[11px] font-mono px-3 py-1 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/20 transition-colors cursor-pointer"
                  >
                    {isAuthenticated ? 'Launch' : 'Sign In'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. INTERACTIVE HYDRAULIC SANDBOX */}
      <section id="sandbox" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="relative rounded-3xl p-6 sm:p-10 glass-panel border border-sky-500/30 shadow-2xl overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-sky-950/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase font-mono tracking-wider mb-2">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>Interactive Live Sandbox</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Test the Hydraulic Manning Physics Engine
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                Tweak precipitation rate and drain blockage to see instantaneous physics calculation of conduit overload and flood water depth.
              </p>
            </div>

            <button
              onClick={() => {
                if (isAuthenticated) router.push('/dashboard');
                else openAuthModal('signin');
              }}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-sky-500/25 transition-all cursor-pointer shrink-0"
            >
              <span>{isAuthenticated ? 'Enter Dashboard' : 'Login for Full Suite'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Controls (5 cols) */}
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
                  <span>Monsoon (50)</span>
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
                  <span>Moderate (25%)</span>
                  <span>Heavy Choke (90%)</span>
                </div>
              </div>
            </div>

            {/* Live Outputs (7 cols) */}
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

                  <button
                    onClick={() => handleFeatureAccess(isFlooded ? '/safe-route' : '/digital-twin')}
                    className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-md transition-all cursor-pointer ${
                      isFlooded
                        ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20'
                        : 'bg-sky-600 hover:bg-sky-500 shadow-sky-500/20'
                    }`}
                  >
                    {isAuthenticated ? (isFlooded ? 'View Detour' : 'Open Twin') : 'Sign In to View'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS ARCHITECTURE WORKFLOW */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono uppercase tracking-wider mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>Architecture & Physics Pipeline</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How UrbanFlood Operates</h2>
          <p className="text-slate-400 text-sm mt-2">
            An end-to-end telemetry and hydrodynamic prediction engine built for Smart India Hackathon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((ws) => {
            const Icon = ws.icon;
            return (
              <div
                key={ws.step}
                className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-sky-500/40 transition-all relative group"
              >
                <div className="text-3xl font-black font-mono text-sky-500/30 group-hover:text-sky-400 transition-colors mb-4">
                  {ws.step}
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-sky-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{ws.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{ws.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. ABOUT SIH & CALL TO ACTION FOOTER */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="relative rounded-3xl p-8 sm:p-12 glass-panel border border-sky-500/30 overflow-hidden bg-gradient-to-r from-sky-950/60 via-slate-900 to-blue-950/60 text-center shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Smart India Hackathon 2026 Initiative</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to Access the Urban Flood Command Center?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
              Sign in with your municipal clearance or create a free account to experience real-time digital twins and automated safe evacuation routing.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={() => {
                  if (isAuthenticated) router.push('/dashboard');
                  else openAuthModal('signin');
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>{isAuthenticated ? 'Open Command Dashboard' : 'Sign In Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (isAuthenticated) router.push('/dashboard');
                  else openAuthModal('signup');
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-sky-500/40 font-semibold text-sm hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Create Free Account</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
