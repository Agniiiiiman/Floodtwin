'use client';

import React, { useState, useEffect } from 'react';
import {
  Siren,
  ShieldAlert,
  Flame,
  ShieldCheck,
  Zap,
  Building,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  X,
  Radio,
  Send,
  Sparkles
} from 'lucide-react';

interface AgencyState {
  id: string;
  name: string;
  icon: any;
  status: 'QUEUED' | 'SENT' | 'ACKNOWLEDGED' | 'RESPONDING' | 'RESOLVED' | 'FAILED';
  role: string;
}

interface IncidentPayload {
  incidentId: string;
  locationName: string;
  lat: number;
  lng: number;
  riskLevel: string;
  waterDepth: number;
  rainfall: number;
  timestamp: string;
  notes: string;
}

export function EmergencyActionSystem() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userNotes, setUserNotes] = useState('');
  const [activeIncident, setActiveIncident] = useState<IncidentPayload | null>(null);

  const [agencies, setAgencies] = useState<AgencyState[]>([
    { id: 'disaster', name: '🚨 Disaster Response Force', icon: Siren, status: 'QUEUED', role: 'Flood rescue & rapid evacuation' },
    { id: 'fire', name: '🚒 Fire & Emergency Services', icon: Flame, status: 'QUEUED', role: 'Submersible water pumping & rescue' },
    { id: 'police', name: '👮 Police Department', icon: ShieldCheck, status: 'QUEUED', role: 'Road closure & perimeter safety' },
    { id: 'electricity', name: '⚡ Electricity / Power Utility', icon: Zap, status: 'QUEUED', role: 'Substation isolation assessment' },
    { id: 'control_room', name: '🏢 Emergency Control Room', icon: Building, status: 'QUEUED', role: 'Inter-agency dispatch coordination' },
  ]);

  // Demo Telemetry State
  const telemetry = {
    locationName: 'Kolkata, West Bengal (Live GIS Sector)',
    lat: 22.5726,
    lng: 88.3639,
    riskLevel: 'HIGH',
    waterDepth: 0.8,
    rainfall: 84.0,
  };

  const generateIncidentId = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `FLD-${year}-${rand}`;
  };

  const handleInitiateResponse = async () => {
    const incId = generateIncidentId();
    const now = new Date();
    const timeStr = `${now.toLocaleTimeString()} (${now.toLocaleDateString()})`;

    const incident: IncidentPayload = {
      incidentId: incId,
      locationName: telemetry.locationName,
      lat: telemetry.lat,
      lng: telemetry.lng,
      riskLevel: telemetry.riskLevel,
      waterDepth: telemetry.waterDepth,
      rainfall: telemetry.rainfall,
      timestamp: timeStr,
      notes: userNotes,
    };

    setActiveIncident(incident);
    setIsModalOpen(false);

    // Call backend API if running
    try {
      await fetch('http://localhost:8000/api/emergency/incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: incId,
          latitude: telemetry.lat,
          longitude: telemetry.lng,
          riskLevel: telemetry.riskLevel,
          waterDepth: telemetry.waterDepth,
          rainfall: telemetry.rainfall,
          timestamp: timeStr,
          notes: userNotes,
        }),
      });
    } catch (e) {
      // Backend offline fallback handled cleanly
    }

    // Reset agency statuses to QUEUED
    setAgencies((prev) => prev.map((a) => ({ ...a, status: 'QUEUED' })));

    // Simulate step-by-step agency dispatch queue in DEMO MODE
    const statuses: ('SENT' | 'ACKNOWLEDGED' | 'RESPONDING')[] = ['SENT', 'ACKNOWLEDGED', 'RESPONDING'];
    
    statuses.forEach((st, stepIdx) => {
      setTimeout(() => {
        setAgencies((prev) =>
          prev.map((agency, aIdx) => {
            if (stepIdx === 0) return { ...agency, status: 'SENT' };
            if (stepIdx === 1) return { ...agency, status: 'ACKNOWLEDGED' };
            return { ...agency, status: 'RESPONDING' };
          })
        );
      }, (stepIdx + 1) * 2200);
    });
  };

  const handleClearIncident = () => {
    setActiveIncident(null);
    setUserNotes('');
    setAgencies((prev) => prev.map((a) => ({ ...a, status: 'QUEUED' })));
  };

  return (
    <>
      {/* Floating Emergency Action Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 group">
        <button
          onClick={() => setIsModalOpen(true)}
          className="relative flex items-center space-x-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-2xl shadow-rose-600/50 hover:shadow-rose-600/80 transition-all duration-300 transform hover:scale-105 border border-rose-400/40"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-200 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          <Siren className="w-5 h-5 animate-pulse text-white shrink-0" />
          <span>🚨 ONE-CALL FLOOD EMERGENCY</span>
          {activeIncident ? (
            <span className="ml-1 px-2.5 py-0.5 rounded-full bg-rose-950/90 text-[10px] text-rose-300 font-mono font-bold border border-rose-500/50 animate-pulse">
              ACTIVE
            </span>
          ) : (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px] text-amber-300 font-mono font-bold border border-amber-500/30">
              DEMO
            </span>
          )}
        </button>
      </div>

      {/* Confirmation & Status Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-rose-500/40 bg-slate-900 shadow-2xl overflow-hidden p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <span className="p-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400">
                  <Siren className="w-6 h-6 animate-pulse" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">FLOOD EMERGENCY RESPONSE</h3>
                  <p className="text-xs text-slate-400">Single-action multi-agency rapid dispatch</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  DEMO MODE
                </span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {!activeIncident ? (
              <>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Coordinates rapid disaster response force, fire &amp; rescue, police traffic diversion, power utility isolation, and municipal control room in one click.
                </p>

                <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="text-white font-bold">{telemetry.locationName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Risk Level:</span>
                    <span className="text-rose-400 font-bold">{telemetry.riskLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Water Depth:</span>
                    <span className="text-white font-semibold">{telemetry.waterDepth} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rainfall Telemetry:</span>
                    <span className="text-white font-semibold">{telemetry.rainfall} mm/hr</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Additional Incident Details (Optional):
                  </label>
                  <textarea
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="e.g. Water rising rapidly near subway exit, 2 vehicles submerged..."
                    rows={2}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    Configured Emergency Agencies to be Notified (5):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {agencies.map((agency) => (
                      <div
                        key={agency.id}
                        className="flex items-center space-x-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300"
                      >
                        <agency.icon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="truncate text-[11px] font-medium">{agency.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>DEMO MODE:</strong> Notifications will be queued and simulated for evaluation. No real emergency call will be made.
                  </span>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleInitiateResponse}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-extrabold text-xs tracking-wide shadow-lg shadow-rose-600/30 transition-all border border-rose-400/30 flex items-center space-x-2"
                  >
                    <Siren className="w-4 h-4" />
                    <span>INITIATE RESPONSE</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {/* Active Incident Header */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-rose-500/30 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-xs font-mono font-bold text-rose-400">INCIDENT ACTIVE</span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white">
                    {activeIncident.incidentId}
                  </span>
                </div>

                {/* Incident Meta Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Location</span>
                    <span className="text-slate-200 font-semibold truncate block">{activeIncident.locationName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Risk Level</span>
                    <span className="text-rose-400 font-bold">{activeIncident.riskLevel}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Water Depth</span>
                    <span className="text-slate-200 font-semibold">{activeIncident.waterDepth} m</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Rainfall</span>
                    <span className="text-slate-200 font-semibold">{activeIncident.rainfall} mm</span>
                  </div>
                </div>

                {/* Agency List */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    Coordinated Agency Status (5):
                  </span>
                  {agencies.map((agency) => (
                    <div
                      key={agency.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <agency.icon className="w-3.5 h-3.5 text-rose-400" />
                        <span className="text-slate-200 font-medium">{agency.name}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          agency.status === 'QUEUED'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : agency.status === 'SENT'
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                            : agency.status === 'ACKNOWLEDGED'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                        }`}
                      >
                        {agency.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={handleClearIncident}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all"
                  >
                    🛑 Clear Active Incident
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
                  >
                    CLOSE
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-300/80 flex items-start space-x-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>DEMO MODE:</strong> Notifications are simulated. No real emergency call has been placed.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
