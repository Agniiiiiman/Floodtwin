import React from 'react';
import { Cpu, Droplets, Navigation, Users, ShieldAlert, Zap } from 'lucide-react';

export function SolutionSection() {
  const features = [
    {
      icon: Cpu,
      title: 'Manning Hydraulic Modeling',
      description:
        'Deterministic physical flow calculation using pipe dimensions, slope, and Manning roughness coefficients to detect subterranean drainage choking before street overflow.',
      tag: 'Physics Core',
      color: 'from-sky-500 to-blue-600',
    },
    {
      icon: Navigation,
      title: 'Dynamic Safe Evacuation Routing',
      description:
        'Integrated with Open Source Routing Machine (OSRM) to calculate turn-by-turn rescue paths that dynamically avoid flooded intersections and critical risk sectors.',
      tag: 'OSRM Routing',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Droplets,
      title: 'Hyperlocal Open-Meteo Mesh',
      description:
        'Continuous real-time satellite and radar precipitation data sampled across 130+ global cities and sub-ward meteorological stations every 60 seconds.',
      tag: 'Satellite Telemetry',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: Users,
      title: 'Crowdsourced Ground Corroboration',
      description:
        'Citizens and first responders report waterlogging incidents with GPS coordinates. Our spatial clustering algorithm validates reports with a 2-source corroboration threshold.',
      tag: 'Mesh Consensus',
      color: 'from-purple-500 to-pink-600',
    },
  ];

  return (
    <section id="solution" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            <span>Comprehensive Solution</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How Error 404 Flood Network Transforms Urban Resilience
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
            Combining deterministic physics simulation with real-time meteorological feeds to convert reactive flood management into proactive early-warning response.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                className="glass-panel p-8 rounded-2xl border border-sky-500/15 hover:border-sky-500/40 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-sky-400">
                    {feat.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-sky-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
