'use client';

import React from 'react';
import { ForecastResponse } from '@/types';
import { 
  Droplets, 
  Gauge, 
  CloudRain, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCw,
  TrendingUp 
} from 'lucide-react';

interface LiveMetricsProps {
  data: ForecastResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

export function LiveMetrics({ data, loading, onRefresh }: LiveMetricsProps) {
  const risk = data?.risk || 'Low';
  const rainfall = data?.rainfall_mm_hr ?? 0;
  const depth = data?.depth_m || '0.0 - 0.1';
  
  // Calculate simulated capacity utilization from risk
  const networkLoad = 
    risk === 'Critical' ? 95 : 
    risk === 'High' ? 82 : 
    risk === 'Medium' ? 64 : 28;

  const getRiskColorClasses = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Critical':
        return {
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/40',
          text: 'text-rose-400',
          dot: 'bg-rose-500 shadow-[0_0_12px_#f43f5e]',
        };
      case 'High':
        return {
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/40',
          text: 'text-orange-400',
          dot: 'bg-orange-500 shadow-[0_0_12px_#f97316]',
        };
      case 'Medium':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/40',
          text: 'text-amber-400',
          dot: 'bg-amber-500 shadow-[0_0_12px_#f59e0b]',
        };
      case 'Low':
      default:
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/40',
          text: 'text-emerald-400',
          dot: 'bg-emerald-500 shadow-[0_0_12px_#10b981]',
        };
    }
  };

  const riskClasses = getRiskColorClasses(risk);

  return (
    <div className="space-y-4">
      {/* Top Banner Alert */}
      <div className={`p-4 rounded-2xl border ${riskClasses.bg} ${riskClasses.border} flex items-center justify-between backdrop-blur-md`}>
        <div className="flex items-center space-x-3">
          <div className={`w-3.5 h-3.5 rounded-full ${riskClasses.dot} animate-pulse`} />
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-bold uppercase tracking-wider ${riskClasses.text}`}>
                {risk} Flood Risk Warning
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900/60 text-slate-300 border border-slate-700/50">
                Confidence: {data?.confidence || 'High'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {data?.reason || 'Hydraulic inflow within baseline ward drainage specs.'}
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh telemetry"
          className="p-2.5 rounded-xl glass-panel text-sky-400 hover:text-white hover:border-sky-400/50 transition-colors disabled:opacity-50"
          title="Refresh forecast data"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Grid of 3 Telemetry Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Water Level Depth */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>PREDICTED WATER DEPTH</span>
            <Droplets className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {depth}
            </span>
            <span className="text-sm font-medium text-sky-400">m</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-sky-400" />
              <span>Manning street inundation estimate</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">UNCALIBRATED</span>
          </div>
        </div>

        {/* Metric 2: Network Pipe Load */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>DRAINAGE LOAD UTILIZATION</span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {networkLoad}
            </span>
            <span className="text-sm font-medium text-emerald-400">%</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                networkLoad > 80 ? 'bg-rose-500' : networkLoad > 60 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${networkLoad}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Synthetic drainage load</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono">ESTIMATED</span>
          </div>
        </div>

        {/* Metric 3: Live Rainfall Intensity */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>CURRENT PRECIPITATION</span>
            <CloudRain className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {rainfall.toFixed(1)}
            </span>
            <span className="text-sm font-medium text-blue-400">mm/hr</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Open-Meteo Satellite Sync</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono">LIVE / DEMO</span>
          </div>
        </div>
      </div>
    </div>
  );
}
