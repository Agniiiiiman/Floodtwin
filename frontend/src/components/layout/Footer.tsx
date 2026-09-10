import React from 'react';
import Link from 'next/link';
import { Waves, Shield, Activity, Globe, Terminal } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-sky-500/15 bg-slate-950/80 backdrop-blur-md pt-14 pb-10 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          {/* Col 1: Brand & SIH */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Waves className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1 font-extrabold tracking-wider text-base">
                  <span className="text-sky-400">STREET</span>
                  <span className="text-white font-black">FLOOD</span>
                </div>
                <span className="text-[9px] tracking-widest uppercase font-semibold text-sky-300/80 -mt-0.5">
                  Urban Risk Layer
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              A real-time Urban Flood Digital Twin & Early Warning System built for Smart India Hackathon. 
              Powered by Manning&apos;s hydraulic equations, Open-Meteo precipitation mesh, OSRM safe corridor routing, and citizen-assisted flood reporting.
            </p>
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs text-sky-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Backend Core: FastAPI v1.0 • OSRM Active</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4 text-sky-400">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/#dashboard" className="hover:text-sky-300 transition-colors">
                  Digital Twin Ward Map
                </Link>
              </li>
              <li>
                <Link href="/rainfall-map" className="hover:text-sky-300 transition-colors">
                  Global Rainfall Monitor
                </Link>
              </li>
              <li>
                <Link href="/#safe-route" className="hover:text-sky-300 transition-colors">
                  Safe Route Navigator
                </Link>
              </li>
              <li>
                <Link href="/#reports" className="hover:text-sky-300 transition-colors">
                  Community Flood Reporting
                </Link>
              </li>
              <li>
                <Link href="/#solution" className="hover:text-sky-300 transition-colors">
                  Hydraulic Manning Modeling
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Team & Hackathon */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4 text-sky-400">
              Smart India Hackathon
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              StreetFlood • Smart India Hackathon 2026 • Street-level flood risk translation.
            </p>
            <div className="flex items-center space-x-3 pt-1">
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono">
                SIH 2026
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-mono">
                Prototype v2.0
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} StreetFlood. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span>Built with Next.js 16, Leaflet & FastAPI</span>
            <span className="text-slate-400">|</span>
            <span className="text-sky-400/90 font-medium">Urban Disaster Resilience Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
