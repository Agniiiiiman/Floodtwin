import React from 'react';
import { Users, Award, Code, Compass, Database, Shield } from 'lucide-react';

export function TeamSection() {
  const members = [
    {
      name: 'Team Lead & Full-Stack',
      role: 'Next.js Frontend & System Architecture',
      focus: 'Digital Twin UI & Hydraulic Visualization',
      badge: 'Team Error 404',
    },
    {
      name: 'Hydraulic Modeling Lead',
      role: 'Physics & Manning Equation Modeling',
      focus: 'Drainage Topology & Capacity Stress Engines',
      badge: 'FastAPI Backend',
    },
    {
      name: 'GIS & Routing Specialist',
      role: 'OSRM Dynamic Graph Optimization',
      focus: 'Multi-Modal Safe Rescue Corridors',
      badge: 'OpenStreetMap',
    },
    {
      name: 'Data & Telemetry Engineer',
      role: 'Open-Meteo Mesh & Sensor Ingestion',
      focus: 'Real-Time Global Precipitation Radar',
      badge: 'Satellite API',
    },
  ];

  return (
    <section id="team" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>Innovators & Creators</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Team Error 404
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
            Smart India Hackathon 2024 • Developing cutting-edge civic disaster resilience technology.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {members.map((m, idx) => (
            <div
              key={idx}
              className="glass-panel p-6 rounded-2xl border border-sky-500/15 hover:border-sky-500/40 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-blue-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-black text-base mb-4 group-hover:scale-105 transition-transform">
                0{idx + 1}
              </div>
              <h3 className="text-base font-bold text-white mb-1 group-hover:text-sky-300 transition-colors">
                {m.name}
              </h3>
              <p className="text-xs font-medium text-sky-400 mb-2">{m.role}</p>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {m.focus}
              </p>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">
                  {m.badge}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
