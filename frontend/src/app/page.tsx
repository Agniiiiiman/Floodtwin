'use client';

import React, { useEffect } from 'react';
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
  Sparkles,
  Layers,
  Lock,
  ChevronRight
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
    tagline: 'Manning Physics Engine',
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
  const { user, isAuthenticated, loading, openAuthModal } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [loading, isAuthenticated, router]);

  const handleFeatureAccess = (targetUrl: string) => {
    if (isAuthenticated) {
      router.push(targetUrl);
    } else {
      openAuthModal('signin');
    }
  };

  // If resolving auth state or already authenticated (redirecting), render a clean loader to avoid flash
  if (loading || isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-xl shadow-sky-500/10">
          <Activity className="w-7 h-7 animate-spin text-sky-400" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-white tracking-wide">
            {isAuthenticated ? 'Redirecting to Command Dashboard...' : 'Connecting to UrbanFlood Mesh...'}
          </p>
          <p className="text-xs text-slate-400">
            {isAuthenticated ? 'Authenticated session detected' : 'Verifying local session clearance'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-24 pb-28 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden py-10 sm:py-16 lg:py-24">
        {/* Animated Rain Particles */}
        <RainEffect />

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[500px] lg:w-[700px] h-[320px] sm:h-[500px] lg:h-[700px] bg-sky-500/10 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-[280px] sm:w-[450px] h-[280px] sm:h-[450px] bg-blue-600/15 rounded-full blur-[90px] sm:blur-[130px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Top Platform Badge */}
          <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-6 sm:mb-8 backdrop-blur-md shadow-inner max-w-full text-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="truncate sm:whitespace-normal">Urban Flood Risk Digital Twin • Hydrodynamic Intelligence</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.15] sm:leading-[1.1] mb-5 sm:mb-6">
            Predict Flood Risks.{' '}
            <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Navigate Safely.
            </span>{' '}
            Protect Cities.
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed mb-8 sm:mb-10 px-2 sm:px-0">
            Real-time hydrodynamic digital twins powered by Manning&apos;s hydraulic equations, 
            instant OSRM emergency evacuation routing, and crowdsourced citizen ground verification.
          </p>

          {/* Main Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 w-full max-w-md sm:max-w-none mx-auto">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs sm:text-sm font-bold tracking-wide shadow-xl shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-[1.02] transition-all duration-200"
              >
                <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Go to Command Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal('signin')}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs sm:text-sm font-bold tracking-wide shadow-xl shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                >
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Login to Command Center</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => openAuthModal('signup')}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white border border-sky-500/40 text-xs sm:text-sm font-semibold tracking-wide hover:scale-[1.02] transition-all duration-200 shadow-md shadow-sky-500/10 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span>Create Account</span>
                </button>
              </>
            )}

            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl glass-panel text-sky-300 hover:text-white hover:border-sky-400/50 text-xs sm:text-sm font-semibold tracking-wide hover:scale-[1.02] transition-all duration-200"
            >
              <span>Explore Features</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. STATS & KEY CAPABILITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-sky-500/20 text-center relative overflow-hidden group hover:border-sky-500/40 transition-all">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-mono">&lt; 500ms</div>
            <div className="text-[10px] sm:text-xs text-sky-400 font-semibold mt-1 uppercase tracking-wider">Hydraulic Solve Time</div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1.5 sm:mt-2">Manning conduit flow & rational runoff</p>
          </div>

          <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-emerald-500/20 text-center relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-mono">100%</div>
            <div className="text-[10px] sm:text-xs text-emerald-400 font-semibold mt-1 uppercase tracking-wider">Street-Level Detail</div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1.5 sm:mt-2">Junction, slope, and culvert mapping</p>
          </div>

          <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-amber-500/20 text-center relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-mono">1,435m</div>
            <div className="text-[10px] sm:text-xs text-amber-400 font-semibold mt-1 uppercase tracking-wider">Zero-Flood Detour</div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1.5 sm:mt-2">Dynamic OSRM avoidance corridor</p>
          </div>

          <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-purple-500/20 text-center relative overflow-hidden group hover:border-purple-500/40 transition-all">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-mono">130+</div>
            <div className="text-[10px] sm:text-xs text-purple-400 font-semibold mt-1 uppercase tracking-wider">Global Radar Hubs</div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1.5 sm:mt-2">Open-Meteo precipitation mesh</p>
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

      {/* 4. HOW IT WORKS ARCHITECTURE WORKFLOW */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono uppercase tracking-wider mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>Architecture & Physics Pipeline</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How UrbanFlood Operates</h2>
          <p className="text-slate-400 text-sm mt-2">
            An end-to-end telemetry and hydrodynamic prediction engine for real-time municipal flood mitigation.
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

      {/* 5. CALL TO ACTION FOOTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-12 glass-panel border border-sky-500/30 overflow-hidden bg-gradient-to-r from-sky-950/60 via-slate-900 to-blue-950/60 text-center shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Municipal Disaster Resilience Network</span>
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
