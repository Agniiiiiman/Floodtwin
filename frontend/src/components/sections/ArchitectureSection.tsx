import React from 'react';
import { Layers, Database, Activity, Cpu, ArrowRight, ShieldCheck, CloudLightning } from 'lucide-react';

export function ArchitectureSection() {
  const steps = [
    {
      num: '01',
      title: 'Real-Time Ingestion',
      desc: 'Open-Meteo API & IoT rain-gauge nodes sample precipitation, relative humidity, and barometric pressure.',
      badge: 'Open-Meteo API',
    },
    {
      num: '02',
      title: 'Hydraulic Digital Twin',
      desc: 'FastAPI core solves Manning’s equation against pilot ward pipe topology (pilot_drainage_graph.geojson).',
      badge: 'FastAPI + Python',
    },
    {
      num: '03',
      title: 'Dynamic Risk Engine',
      desc: 'Calculates inflow surplus, street water accumulation depth (m), and flags overwhelmed drainage outfalls.',
      badge: 'Deterministic AI',
    },
    {
      num: '04',
      title: 'OSRM Route Optimization',
      desc: 'Excludes flooded coordinates from OpenStreetMap road graph and routes emergency responders safely.',
      badge: 'OSRM Backend',
    },
    {
      num: '05',
      title: 'Next.js Interface',
      desc: 'Interactive Leaflet digital twin maps, what-if sliders, and crowdsourced reporting interface.',
      badge: 'Next.js 16 + React',
    },
  ];

  return (
    <section id="architecture" className="py-20 relative bg-slate-950/40 border-y border-sky-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>End-to-End System Pipeline</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            System Architecture & Flow
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
            A high-throughput reactive architecture connecting satellite data to edge hydraulic physics models and responsive web telemetry.
          </p>
        </div>

        {/* Steps Flow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="glass-panel p-5 rounded-2xl border border-sky-500/15 relative flex flex-col justify-between"
            >
              <div>
                <div className="text-2xl font-black text-sky-500/30 mb-2 font-mono">
                  {step.num}
                </div>
                <h4 className="text-sm font-bold text-white mb-2">{step.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {step.desc}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-sky-300 border border-slate-800">
                  {step.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
