'use client';

import React from 'react';
import { SolutionSection } from '@/components/sections/SolutionSection';
import { Layers, ArrowRight, Activity, Cpu } from 'lucide-react';
import Link from 'next/link';

export default function SolutionPage() {
  return (
    <div className="min-h-screen pb-16 pt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Methodology & Scientific Framework</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Our Solution & Hydraulic Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl">
            Mathematical modeling combining Manning&apos;s open channel flow equation with terrain slope elevation profiles and storm runoff computation.
          </p>
        </div>
      </div>

      {/* Main Solution Component */}
      <SolutionSection />

      {/* Quick Navigation Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-800">
        <Link
          href="/architecture"
          className="glass-panel p-5 rounded-xl hover:border-sky-500/40 transition-all group flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-mono uppercase text-sky-400">Technical Deep Dive</div>
            <div className="text-base font-bold text-white group-hover:text-sky-300">View System Architecture</div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
        <Link
          href="/digital-twin"
          className="glass-panel p-5 rounded-xl hover:border-emerald-500/40 transition-all group flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-mono uppercase text-emerald-400">Live Platform</div>
            <div className="text-base font-bold text-white group-hover:text-emerald-300">Explore South Mumbai Ward Twin</div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
