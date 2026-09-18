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
    <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-sky-500/20 shadow-xl space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
      {/* 4 Telemetry Items in Responsive Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full sm:w-auto flex-1">
        {/* Sector Count & Sync status */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <div className="truncate">
            <div className="text-[10px] sm:text-xs text-slate-400">MONITORED</div>
            <div className="text-sm sm:text-base font-extrabold text-white truncate">
              {totalSectors} <span className="text-[10px] sm:text-xs font-normal text-sky-400">Hubs</span>
            </div>
          </div>
        </div>

        {/* Max Rainfall */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 sm:border-l sm:border-slate-800 sm:pl-3">
          <Droplets className="w-4 h-4 text-sky-400 shrink-0" />
          <div className="truncate">
            <div className="text-[10px] sm:text-xs text-slate-400">MAX PRECIP</div>
            <div className="text-sm sm:text-base font-extrabold text-white truncate">
              {maxRainfall.toFixed(1)} <span className="text-[10px] sm:text-xs font-normal text-sky-400">mm/h</span>
            </div>
          </div>
        </div>

        {/* Avg Rainfall */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 sm:border-l sm:border-slate-800 sm:pl-3">
          <TrendingUp className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="truncate">
            <div className="text-[10px] sm:text-xs text-slate-400">AVG RATE</div>
            <div className="text-sm sm:text-base font-extrabold text-white truncate">
              {avgRainfall} <span className="text-[10px] sm:text-xs font-normal text-blue-400">mm/h</span>
            </div>
          </div>
        </div>

        {/* High Risk Count */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 sm:border-l sm:border-slate-800 sm:pl-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <div className="truncate">
            <div className="text-[10px] sm:text-xs text-slate-400">HIGH-RISK</div>
            <div className="text-sm sm:text-base font-extrabold text-rose-400 truncate">
              {highRiskCount} <span className="text-[10px] sm:text-xs font-normal text-slate-400">/ {totalSectors}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auto Refresh & Last updated */}
      <div className="flex items-center justify-between sm:justify-end space-x-3 pt-2 sm:pt-0 border-t border-slate-800/80 sm:border-t-0 shrink-0">
        <div className="text-left sm:text-right">
          <div className="text-[9px] sm:text-[10px] text-slate-400">AUTO-REFRESH</div>
          <div className="text-xs font-mono font-bold text-sky-400">
            {secondsRemaining}s
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh Rainfall Data"
          className="p-2 sm:p-2.5 rounded-xl glass-panel text-sky-400 hover:text-white hover:border-sky-400/50 transition-colors disabled:opacity-50 cursor-pointer"
          title="Manual refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}
