'use client';

import React, { useState } from 'react';
import { Sliders, Play, RotateCcw, AlertTriangle } from 'lucide-react';
import { calculateSwmmOutput } from '@/lib/swmmModel';

export function WhatIfSimulation() {
  const [rainIntensity, setRainIntensity] = useState<number>(80); // mm/hr
  const [blockage, setBlockage] = useState<number>(0); // % blockage
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<{
    peakDepth: number;
    criticalNodes: number;
    status: 'nominal' | 'warning' | 'critical';
    excessInflow: number;
  }>({
    peakDepth: 0.35,
    criticalNodes: 3,
    status: 'warning',
    excessInflow: 12,
  });

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const hydraulicOutput = calculateSwmmOutput(rainIntensity, blockage);
      const excess = Math.max(0, hydraulicOutput.utilizationPercent - 100);
      const depth = Number((0.05 + (hydraulicOutput.utilizationPercent / 100) * 0.45).toFixed(2));
      const critical = Math.min(18, Math.max(0, Math.round(hydraulicOutput.utilizationPercent / 35)));

      let status: 'nominal' | 'warning' | 'critical' = 'nominal';
      if (hydraulicOutput.floodPotential || excess > 40) status = 'critical';
      else if (depth > 0.25 || excess > 10) status = 'warning';

      setResults({
        peakDepth: depth,
        criticalNodes: critical,
        status,
        excessInflow: Number(excess.toFixed(1)),
      });
      setIsSimulating(false);
    }, 400);
  };

  const handleReset = () => {
    setRainIntensity(80);
    setBlockage(0);
    setResults({
      peakDepth: 0.12,
      criticalNodes: 0,
      status: 'nominal',
      excessInflow: 0,
    });
  };

  const hydraulicOutput = calculateSwmmOutput(rainIntensity, blockage);
  const chartMax = Math.max(
    hydraulicOutput.runoffGeneratedM3s,
    hydraulicOutput.effectiveCapacityM3s,
    6
  );

  return (
    <div className="glass-panel p-6 rounded-2xl border border-sky-500/20 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              What-If Hydraulic Simulation
            </h3>
            <p className="text-xs text-slate-400">
              SWMM-inspired pilot drainage response under extreme weather
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="space-y-5">
        {/* Slider 1: Rain Intensity */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-2">
            <span className="text-slate-300">Simulated Rainfall Intensity</span>
            <span className="text-sky-400 font-mono">{rainIntensity} mm/hr</span>
          </div>
          <input
            type="range"
            min="0"
            max="120"
            step="5"
            value={rainIntensity}
            onChange={(e) => setRainIntensity(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Light rain (5 mm/hr)</span>
            <span>Monsoon Cloudburst (120 mm/hr)</span>
          </div>
        </div>

        {/* Slider 2: Debris Blockage */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-2">
            <span className="text-slate-300">Drainage Silt / Debris Blockage</span>
            <span className="text-amber-400 font-mono">{blockage}% blocked</span>
          </div>
          <input
            type="range"
            min="0"
            max="90"
            step="5"
            value={blockage}
            onChange={(e) => setBlockage(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Clean Trunks (0%)</span>
            <span>Severe Choking (90%)</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={runSimulation}
        disabled={isSimulating}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md flex items-center justify-center space-x-2"
      >
        <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
        <span>{isSimulating ? 'Routing runoff through drainage model...' : 'Run Hydraulic Model'}</span>
      </button>

      <details className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-300">
        <summary className="cursor-pointer font-semibold text-sky-300">Model assumptions and calculation</summary>
        <div className="mt-3 space-y-2 leading-relaxed">
          <p>This is a synthetic SWMM-inspired screening model, not a calibrated EPA SWMM project file.</p>
          <p>
            Runoff = rainfall × catchment area × runoff coefficient; drain capacity is reduced by blockage.
          </p>
          <p>
            Pilot assumptions: {hydraulicOutput.catchmentAreaKm2} km² catchment, runoff coefficient {hydraulicOutput.runoffCoefficient}, and a {hydraulicOutput.drainCapacityM3s.toFixed(1)} m³/s synthetic drain.
          </p>
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between"><span>Runoff generated</span><span>{hydraulicOutput.runoffGeneratedM3s.toFixed(1)} m³/s</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-sky-400" style={{ width: `${(hydraulicOutput.runoffGeneratedM3s / chartMax) * 100}%` }} /></div>
            <div className="flex items-center justify-between"><span>Effective drain capacity</span><span>{hydraulicOutput.effectiveCapacityM3s.toFixed(1)} m³/s</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-emerald-400" style={{ width: `${(hydraulicOutput.effectiveCapacityM3s / chartMax) * 100}%` }} /></div>
            <div className="flex items-center justify-between"><span>Excess inflow</span><span>{Math.max(0, hydraulicOutput.runoffGeneratedM3s - hydraulicOutput.effectiveCapacityM3s).toFixed(1)} m³/s</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-rose-400" style={{ width: `${(Math.max(0, hydraulicOutput.runoffGeneratedM3s - hydraulicOutput.effectiveCapacityM3s) / chartMax) * 100}%` }} /></div>
          </div>
        </div>
      </details>

      <div className={`rounded-xl border p-4 ${hydraulicOutput.floodPotential ? 'border-rose-500/40 bg-rose-950/20' : 'border-emerald-500/30 bg-emerald-950/20'}`}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
            {hydraulicOutput.floodPotential ? <AlertTriangle className="h-4 w-4 text-rose-400" /> : <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />}
            <span>Hydraulic output chain</span>
          </div>
          <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-[10px] text-sky-300">EPA SWMM-inspired</span>
        </div>
        <div className="grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
          <div>Rainfall <strong className="text-white">{hydraulicOutput.rainfallMmHr} mm/hr</strong></div>
          <div>Runoff generated <strong className="text-sky-300">{hydraulicOutput.runoffGeneratedM3s.toFixed(1)} m³/s</strong></div>
          <div>Drain receives <strong className="text-sky-300">{hydraulicOutput.runoffGeneratedM3s.toFixed(1)} m³/s</strong></div>
          <div>Drain capacity <strong className="text-emerald-300">{hydraulicOutput.effectiveCapacityM3s.toFixed(1)} m³/s</strong></div>
          <div>Utilization <strong className={hydraulicOutput.surcharge ? 'text-rose-300' : 'text-emerald-300'}>{hydraulicOutput.utilizationPercent.toFixed(0)}%</strong></div>
          <div>Indicative depth <strong className="text-amber-300">{hydraulicOutput.indicativeDepthRange}</strong></div>
        </div>
        <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-xs">
          <div className={hydraulicOutput.surcharge ? 'text-rose-300' : 'text-emerald-300'}>{hydraulicOutput.surcharge ? '⚠ Drain surcharge' : '✓ Drain remains within capacity'}</div>
          <div className="text-slate-300">{hydraulicOutput.surcharge ? `Water accumulates at junction: ${hydraulicOutput.accumulatedWaterM3.toFixed(0)} m³ over 15 minutes` : 'No junction accumulation in this scenario'}</div>
          <div className={hydraulicOutput.floodPotential ? 'font-semibold text-rose-300' : 'text-emerald-300'}>{hydraulicOutput.floodPotential ? '🌊 Potential flooding' : '✓ No flood potential at this screening threshold'}</div>
        </div>
      </div>

      {/* Simulation Output Cards */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-[11px] text-slate-400 font-medium">SIMULATED PEAK DEPTH</div>
          <div className="text-xl font-black text-white mt-1">
            {results.peakDepth} <span className="text-xs font-normal text-sky-400">m</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {results.peakDepth > 0.5 ? '🔴 Vehicle submersion risk' : '🟢 Ankle depth accumulation'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-[11px] text-slate-400 font-medium">OVERFLOW NODES</div>
          <div className="text-xl font-black text-rose-400 mt-1">
            {String(results.criticalNodes).padStart(2, '0')} <span className="text-xs font-normal text-slate-400">/ 18</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {results.excessInflow > 0 ? `+${results.excessInflow}% above pipe capacity` : 'Flow within limits'}
          </div>
        </div>
      </div>
    </div>
  );
}
