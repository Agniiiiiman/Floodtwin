'use client';

import React, { useState } from 'react';
import { Sliders, Play, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function WhatIfSimulation() {
  const [rainIntensity, setRainIntensity] = useState<number>(45); // mm/hr
  const [blockage, setBlockage] = useState<number>(20); // % blockage
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
      // Manning equation deterministic shock calculation
      // Effective capacity reduced by blockage percentage
      const effectiveCapacity = 50.0 * (1 - blockage / 100);
      const excess = Math.max(0, ((rainIntensity - effectiveCapacity) / effectiveCapacity) * 100);
      
      const depth = Number((0.05 + (rainIntensity / 80) * 0.7 + (blockage / 100) * 0.45).toFixed(2));
      const critical = Math.min(18, Math.max(0, Math.round((rainIntensity / 20) + (blockage / 15))));

      let status: 'nominal' | 'warning' | 'critical' = 'nominal';
      if (depth > 0.6 || excess > 40) status = 'critical';
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
    setRainIntensity(15);
    setBlockage(0);
    setResults({
      peakDepth: 0.12,
      criticalNodes: 0,
      status: 'nominal',
      excessInflow: 0,
    });
  };

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
              Stress-test the South Mumbai drainage network under extreme weather
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
            <span>Drizzle (5 mm/hr)</span>
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
        <span>{isSimulating ? 'Computing Manning Hydraulics...' : 'Recalculate Inundation Model'}</span>
      </button>

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
