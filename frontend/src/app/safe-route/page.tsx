'use client';

import React from 'react';
import { SafeRoutePlanner } from '@/components/dashboard/SafeRoutePlanner';
import { Navigation, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function SafeRoutePage() {
  return (
    <div className="min-h-screen pb-16 pt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Navigation className="w-3.5 h-3.5" />
            <span>Dynamic Corridor Routing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI Safe Route & Evacuation Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl">
            OSRM-powered emergency navigation calculating safe rescue corridors while dynamically avoiding inundated roads and high-risk junctions.
          </p>
        </div>
      </div>

      {/* Main Safe Route Component */}
      <div className="max-w-4xl mx-auto">
        <SafeRoutePlanner />
      </div>

      {/* Quick Navigation Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-800 max-w-4xl mx-auto">
        <Link
          href="/reports"
          className="glass-panel p-5 rounded-xl hover:border-purple-500/40 transition-all group flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-mono uppercase text-purple-400">Citizen Intelligence</div>
            <div className="text-base font-bold text-white group-hover:text-purple-300">View Community Flood Reports</div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
        <Link
          href="/rainfall-map"
          className="glass-panel p-5 rounded-xl hover:border-sky-500/40 transition-all group flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-mono uppercase text-sky-400">Meteorological Radar</div>
            <div className="text-base font-bold text-white group-hover:text-sky-300">Global Precipitation Map</div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
