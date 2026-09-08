'use client';

import React from 'react';
import { SectorWithRainfall } from '@/types';
import { Activity, Clock, Droplets, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';

interface RainfallStatusBarProps {
  sectors: SectorWithRainfall[];
  loading: boolean;
  lastUpdated: string;
  onRefresh: () => void;
  secondsRemaining: number;
}

export function RainfallStatusBar({
  sectors,
  loading,
  lastUpdated,
  onRefresh,
  secondsRemaining,
}: RainfallStatusBarProps) {
  const totalSectors = sectors.length;
  const maxRainfall = sectors.reduce((max, s) => Math.max(max, s.rainfall), 0);
  const avgRainfall =
    totalSectors > 0
      ? (sectors.reduce((sum, s) => sum + s.rainfall, 0) / totalSectors).toFixed(2)
      : '0.00';
  const highRiskCount = sectors.filter(
    (s) => s.risk === 'High' || s.risk === 'Critical'
  ).length;

  return (
    <div className="glass-panel p-4 rounded-2xl border border-sky-500/20 shadow-xl flex flex-wrap items-center justify-between gap-4">
      {/* Sector Count & Sync status */}
      <div className="flex items-center space-x-3">
        <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
        <div>
          <div className="text-xs text-slate-400">MONITORED SECTORS</div>
          <div className="text-base font-extrabold text-white">
            {totalSectors} <span className="text-xs font-normal text-sky-400">Global Cities</span>
          </div>
        </div>
      </div>

      {/* Max Rainfall */}
      <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
        <Droplets className="w-4 h-4 text-sky-400" />
        <div>
          <div className="text-xs text-slate-400">MAX PRECIPITATION</div>
          <div className="text-base font-extrabold text-white">
            {maxRainfall.toFixed(1)} <span className="text-xs font-normal text-sky-400">mm/hr</span>
          </div>
        </div>
      </div>

      {/* Avg Rainfall */}
      <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
        <TrendingUp className="w-4 h-4 text-blue-400" />
        <div>
          <div className="text-xs text-slate-400">AVERAGE GLOBAL RATE</div>
          <div className="text-base font-extrabold text-white">
            {avgRainfall} <span className="text-xs font-normal text-blue-400">mm/hr</span>
          </div>
        </div>
      </div>

      {/* High Risk Count */}
      <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
        <AlertTriangle className="w-4 h-4 text-rose-400" />
        <div>
          <div className="text-xs text-slate-400">HIGH-RISK SECTORS</div>
          <div className="text-base font-extrabold text-rose-400">
            {highRiskCount} <span className="text-xs font-normal text-slate-400">/ {totalSectors}</span>
          </div>
        </div>
      </div>

      {/* Auto Refresh & Last updated */}
      <div className="flex items-center space-x-3 ml-auto">
        <div className="text-right hidden sm:block">
          <div className="text-[10px] text-slate-400">AUTO-REFRESH IN</div>
          <div className="text-xs font-mono font-bold text-sky-400">
            {secondsRemaining}s
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh Rainfall Data"
          className="p-2.5 rounded-xl glass-panel text-sky-400 hover:text-white hover:border-sky-400/50 transition-colors disabled:opacity-50"
          title="Manual refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}
