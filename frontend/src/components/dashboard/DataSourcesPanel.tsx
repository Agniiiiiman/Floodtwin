'use client';

import React from 'react';
import { Database, ExternalLink } from 'lucide-react';
import { DataMode } from '@/types';

interface DataSourcesPanelProps {
  rainfallMode: DataMode;
  lastUpdated?: string;
}

export function DataSourcesPanel({ rainfallMode, lastUpdated }: DataSourcesPanelProps) {
  const timestamp = lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Not available';
  const rows = [
    { source: 'Rainfall', value: rainfallMode === 'live' ? 'Open-Meteo current precipitation' : 'Synthetic fallback precipitation', status: rainfallMode === 'live' ? 'LIVE' : 'DEMO', qualifier: timestamp },
    { source: 'Elevation / terrain', value: 'Synthetic pilot elevations', status: 'ESTIMATED', qualifier: 'DEM unavailable' },
    { source: 'Road network', value: 'OpenStreetMap pilot extract', status: 'LOCAL', qualifier: 'South Mumbai bbox' },
    { source: 'Drainage network', value: 'Synthetic pilot graph', status: 'SYNTHETIC', qualifier: 'Unverified municipal topology' },
    { source: 'Flood model', value: 'StreetFlood deterministic runoff-capacity model', status: 'UNCALIBRATED', qualifier: 'Indicative risk ranges' },
    { source: 'Citizen reports', value: 'User-generated reports', status: 'USER-GENERATED', qualifier: '2-report corroboration' },
    { source: 'SUMO traffic', value: 'Traffic simulation extension', status: 'BLOCKED', qualifier: 'Runtime unavailable' },
  ];

  return (
    <section className="glass-panel rounded-2xl border border-slate-700/70 p-6" aria-labelledby="data-sources-title">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-2 text-sky-300"><Database className="h-4 w-4" /></div>
        <div>
          <h3 id="data-sources-title" className="text-base font-bold text-white">Data Sources & Qualifiers</h3>
          <p className="text-xs text-slate-400">Every layer is labelled by provenance, freshness, and confidence.</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-xs">
          <thead className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="pb-2">Layer</th><th className="pb-2">Source</th><th className="pb-2">Status</th><th className="pb-2">Timestamp / qualifier</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row.source} className="border-b border-slate-900 text-slate-300"><td className="py-3 font-semibold text-white">{row.source}</td><td className="py-3">{row.value}</td><td className="py-3"><span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${row.status === 'LIVE' || row.status === 'LOCAL' ? 'border-emerald-500/30 text-emerald-300' : row.status === 'BLOCKED' ? 'border-rose-500/30 text-rose-300' : 'border-amber-500/30 text-amber-300'}`}>{row.status}</span></td><td className="py-3 text-slate-400">{row.qualifier}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-500"><ExternalLink className="h-3 w-3" /> External services are reported as connected only after a successful request.</div>
    </section>
  );
}
