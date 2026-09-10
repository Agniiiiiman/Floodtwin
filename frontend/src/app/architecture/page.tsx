'use client';

import React from 'react';
import { ArchitectureSection } from '@/components/sections/ArchitectureSection';
import { Cpu, ArrowRight, Layers, Users } from 'lucide-react';
import Link from 'next/link';

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen pb-16 pt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>High-Throughput Distributed Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            System Architecture & Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl">
            From atmospheric Open-Meteo polling to asynchronous FastAPI hydraulic solvers, Leaflet rendering, and OSRM corridor generation.
          </p>
        </div>
      </div>

      {/* Main Architecture Component */}
      <ArchitectureSection />

      {/* Quick Navigation Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-800">
        <Link
          href="/team"
          className="glass-panel p-5 rounded-xl hover:border-sky-500/40 transition-all group flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-mono uppercase text-sky-400">SIH 2024 Innovators</div>
            <div className="text-base font-bold text-white group-hover:text-sky-300">Meet Team Error 404</div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
        <Link
          href="/solution"
          className="glass-panel p-5 rounded-xl hover:border-blue-500/40 transition-all group flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-mono uppercase text-blue-400">Scientific Modeling</div>
            <div className="text-base font-bold text-white group-hover:text-blue-300">View Solution & Formulation</div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
