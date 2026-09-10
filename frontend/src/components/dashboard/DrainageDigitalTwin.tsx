'use client';

import React, { useState } from 'react';
import { GitCompareArrows, LoaderCircle, AlertTriangle } from 'lucide-react';
import { calculateDrainageWhatIf } from '@/lib/api';
import { DrainageWhatIfResult } from '@/types';

const scenarios = ['BLOCKED', '50% CAPACITY', 'SEVERE RAINFALL'];

export function DrainageDigitalTwin() {
  const [nodeId, setNodeId] = useState('node_03');
  const [scenario, setScenario] = useState('BLOCKED');
  const [rainfall, setRainfall] = useState(10);
  const [normal, setNormal] = useState<DrainageWhatIfResult | null>(null);
  const [comparison, setComparison] = useState<DrainageWhatIfResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const [normalResult, scenarioResult] = await Promise.all([
        calculateDrainageWhatIf(nodeId, 'NORMAL', rainfall),
        calculateDrainageWhatIf(nodeId, scenario, rainfall),
      ]);
      setNormal(normalResult);
      setComparison(scenarioResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Drainage digital twin unavailable. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="glass-panel rounded-2xl border border-amber-500/20 p-6 shadow-xl" aria-labelledby="drainage-twin-title">
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 text-amber-300"><GitCompareArrows className="h-4 w-4" /></div>
          <div>
            <h3 id="drainage-twin-title" className="text-base font-bold text-white">Drainage Digital Twin</h3>
            <p className="text-xs text-slate-400">Compare node capacity changes and downstream street risk.</p>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-amber-300">Synthetic pilot state</span>
      </div>

      <div className="grid gap-3 py-5 sm:grid-cols-3">
        <label className="text-xs text-slate-300">Drainage node
          <select value={nodeId} onChange={(event) => setNodeId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white">
            <option value="node_02">node_02 · 3.5 m³/s</option>
            <option value="node_03">node_03 · 4.0 m³/s</option>
            <option value="node_04">node_04 · 5.2 m³/s</option>
          </select>
        </label>
        <label className="text-xs text-slate-300">Scenario
          <select value={scenario} onChange={(event) => setScenario(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white">
            {scenarios.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-300">Rainfall
          <input type="number" min="0" max="200" value={rainfall} onChange={(event) => setRainfall(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white" />
        </label>
      </div>

      <button type="button" onClick={runComparison} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500/90 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 transition hover:bg-amber-300 disabled:opacity-60">
        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <GitCompareArrows className="h-4 w-4" />}
        {loading ? 'Recomputing downstream state...' : 'Compare node state'}
      </button>

      {error && <div role="alert" className="mt-4 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-200"><AlertTriangle className="h-4 w-4" />{error}</div>}

      {normal && comparison && (
        <div className="mt-5 space-y-4" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-2">
            {[normal, comparison].map((result) => (
              <div key={result.scenario} className={`rounded-xl border p-4 ${result.surcharge ? 'border-rose-500/40 bg-rose-950/20' : 'border-emerald-500/30 bg-emerald-950/20'}`}>
                <div className="mb-3 text-xs font-bold uppercase tracking-wider text-white">{result.scenario === 'NORMAL' ? 'Normal' : result.scenario}</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <span>Capacity <strong className="text-white">{result.modified_capacity_m3s.toFixed(2)} m³/s</strong></span>
                  <span>Inflow <strong className="text-sky-300">{result.inflow_m3s.toFixed(2)} m³/s</strong></span>
                  <span>Utilization <strong className={result.utilization_percent > 100 ? 'text-rose-300' : 'text-emerald-300'}>{result.utilization_percent.toFixed(0)}%</strong></span>
                  <span>Overflow <strong className="text-rose-300">{result.overflow_m3s.toFixed(2)} m³/s</strong></span>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-sky-500/20 bg-slate-950/40 p-4 text-xs text-slate-300">
            <div className="font-semibold text-white">Downstream impact: {comparison.downstream_streets_affected.join(', ')}</div>
            {comparison.risk_changes.map((street) => <div key={street.id} className="mt-2"><span className="text-amber-300">{street.name}: {street.risk}</span> · {street.explanation}</div>)}
          </div>
        </div>
      )}
    </section>
  );
}
