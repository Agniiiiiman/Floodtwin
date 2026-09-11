'use client';

import React from 'react';
import Link from 'next/link';
import { RainEffect } from './RainEffect';
import { 
  Waves, 
  ArrowRight, 
  MapPin, 
  ShieldCheck, 
  Cpu, 
  Activity, 
  Zap,
  Globe2
} from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden py-16 lg:py-24">
      {/* Animated Rain Particles */}
      <RainEffect />

      {/* Atmospheric Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-8 backdrop-blur-md shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Smart India Hackathon 2026 • Urban Flood Risk MVP</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1] mb-6">
          Street-Level{' '}
          <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Flood Risk
          </span>{' '}
          & Safe Routing
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
          Real-time precipitation forecasting powered by Open-Meteo, Manning hydraulic pipe-flow simulations, 
          OSRM emergency rescue corridors, and corroborated citizen ground reporting.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-14">
          <Link
            href="/digital-twin"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-sm font-semibold tracking-wide shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-[1.02] transition-all duration-200"
          >
            <Activity className="w-4 h-4" />
            <span>Launch Ward Twin</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-sky-500/40 text-sm font-semibold tracking-wide hover:scale-[1.02] transition-all duration-200 shadow-md shadow-sky-500/10"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Create Free Account</span>
          </Link>

          <Link
            href="/rainfall-map"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl glass-panel text-sky-400 hover:text-white hover:border-sky-400/50 text-sm font-semibold tracking-wide hover:scale-[1.02] transition-all duration-200"
          >
            <Globe2 className="w-4 h-4" />
            <span>130+ Radar Sectors</span>
          </Link>
        </div>

        {/* Key Live Metric Highlights Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <Link href="/digital-twin" className="glass-panel p-4 rounded-2xl text-left border-l-4 border-l-sky-500 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>PILOT WARD</span>
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-lg font-bold text-white">South Mumbai</div>
            <div className="text-[11px] text-sky-400/80 font-mono mt-0.5">Ward A/B • 18.96° N</div>
          </Link>

          <Link href="/simulation" className="glass-panel p-4 rounded-2xl text-left border-l-4 border-l-emerald-500 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>PHYSICS MODEL</span>
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-white">Manning Eq.</div>
            <div className="text-[11px] text-emerald-400/80 font-mono mt-0.5">Hydraulic Pipe-Flow</div>
          </Link>

          <Link href="/safe-route" className="glass-panel p-4 rounded-2xl text-left border-l-4 border-l-amber-500 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>SAFE ROUTING</span>
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg font-bold text-white">OSRM Dynamic</div>
            <div className="text-[11px] text-amber-400/80 font-mono mt-0.5">Flood Avoidance AI</div>
          </Link>

          <Link href="/rainfall-map" className="glass-panel p-4 rounded-2xl text-left border-l-4 border-l-purple-500 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>SENSING MESH</span>
              <Zap className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-lg font-bold text-white">Open-Meteo</div>
            <div className="text-[11px] text-purple-400/80 font-mono mt-0.5">60s Live Sync</div>
          </Link>
        </div>
      </div>
    </section>
  );
}
