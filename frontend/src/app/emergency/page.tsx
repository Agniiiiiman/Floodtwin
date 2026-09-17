'use client';

import React from 'react';
import { EmergencyActionSystem } from '@/components/dashboard/EmergencyActionSystem';
import { Siren, ArrowRight, ShieldAlert, Radio } from 'lucide-react';
import Link from 'next/link';

export default function EmergencyPage() {
  return (
    <div className="min-h-screen pb-16 pt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Siren className="w-3.5 h-3.5" />
            <span>Emergency Response System</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Flood Emergency One-Call
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl">
            Automated multi-agency outbound emergency voice calling system. Select agencies, confirm location telemetry, and initiate coordinated flood response calls.
          </p>
        </div>
      </div>

      {/* Main Emergency Component (inline, not modal) */}
      <EmergencyActionSystem isEmbedded={true} />

      {/* Quick Navigation Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-800">
        <Link
          href="/reports"
          className="glass-panel p-5 rounded-xl hover:border-purple-500/40 transition-all group flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-mono uppercase text-purple-400">Crowdsourced Intel</div>
            <div className="text-base font-bold text-white group-hover:text-purple-300">Citizen Flood Reports</div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
        <Link
          href="/digital-twin"
          className="glass-panel p-5 rounded-xl hover:border-sky-500/40 transition-all group flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-mono uppercase text-sky-400">Hydraulic Operations</div>
            <div className="text-base font-bold text-white group-hover:text-sky-300">South Mumbai Ward Twin</div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
