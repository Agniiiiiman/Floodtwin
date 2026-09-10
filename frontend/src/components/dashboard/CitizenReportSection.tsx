'use client';

import React, { useState, useEffect } from 'react';
import { submitCitizenReport, getCorroboratedReports } from '@/lib/api';
import { CorroboratedReportsResponse } from '@/types';
import { Users, Send, AlertTriangle, ShieldCheck, MapPin, CheckCircle, Clock } from 'lucide-react';

export function CitizenReportSection() {
  const [lat, setLat] = useState('18.9612');
  const [lng, setLng] = useState('72.8214');
  const [status, setStatus] = useState('Moderate');
  const [desc, setDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [reportsData, setReportsData] = useState<CorroboratedReportsResponse | null>(null);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const fetchReports = async () => {
    setIsLoadingReports(true);
    setReportsError(null);
    try {
      const data = await getCorroboratedReports();
      setReportsData(data);
    } catch {
      setReportsError('Reports service unavailable. Retry to load recent incidents.');
    } finally {
      setIsLoadingReports(false);
    }
  };

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void fetchReports(), 0);
    return () => window.clearTimeout(initialLoad);
  }, []);

  const handleUseGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(4));
          setLng(pos.coords.longitude.toFixed(4));
        },
        () => setFeedback('Location permission was unavailable. Enter coordinates manually.')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await submitCitizenReport({
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        status,
        desc,
      });
      setFeedback(res.message);
      setDesc('');
      await fetchReports();
    } catch {
      setFeedback('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="reports" className="glass-panel p-6 rounded-2xl border border-sky-500/20 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Crowdsourced Flood Reporting Mesh
            </h3>
            <p className="text-xs text-slate-400">
              Citizen corroboration requires 2 reports within 50m and 30 minutes
            </p>
          </div>
        </div>

        <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
          CITIZEN CORROBORATION
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Report Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="incident-lat" className="text-xs font-semibold text-slate-300">
              INCIDENT LOCATION
            </label>
            <button
              type="button"
              onClick={handleUseGPS}
              className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center space-x-1"
            >
              <MapPin className="w-3 h-3" />
              <span>Use Current GPS</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              id="incident-lat"
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="Latitude"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
              required
            />
            <input
              id="incident-lng"
              type="number"
              step="any"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="Longitude"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="incident-status" className="text-xs font-semibold text-slate-300 block mb-1">
              OBSERVED WATERLOGGING SEVERITY
            </label>
            <select
              id="incident-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:border-sky-500 focus:outline-none"
            >
              <option value="Low">Low (Puddles / Minor accumulation &lt;10cm)</option>
              <option value="Moderate">Moderate (Knee-deep / Traffic slowed 10-30cm)</option>
              <option value="Severe">Severe (Vehicle submerged / Impassable &gt;30cm)</option>
              <option value="Inaccessible">Inaccessible / Structural collapse hazard</option>
            </select>
          </div>

          <div>
            <label htmlFor="incident-description" className="text-xs font-semibold text-slate-300 block mb-1">
              DESCRIPTION & LANDMARKS
            </label>
            <textarea
              id="incident-description"
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="e.g. Water accumulation near metro station exit 2, storm drain blocked by trash bags..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:border-sky-500 focus:outline-none resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md flex items-center justify-center space-x-2"
          >
            <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
            <span>{isSubmitting ? 'Transmitting Ground Report...' : 'Submit Crowdsourced Report'}</span>
          </button>

          {feedback && (
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-emerald-400 flex items-center space-x-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{feedback}</span>
            </div>
          )}
        </form>

        {/* Right: Live Corroborated Reports Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Citizen Corroboration
            </span>
            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified incidents (≥2 reports)</span>
            </span>
          </div>

          <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1" aria-live="polite">
            {isLoadingReports ? (
              <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl">Loading reports...</div>
            ) : reportsError ? (
              <div className="p-4 text-center text-rose-300 text-xs border border-dashed border-rose-500/30 rounded-xl space-y-2">
                <p>{reportsError}</p>
                <button type="button" onClick={fetchReports} className="text-sky-300 hover:text-white">Retry</button>
              </div>
            ) : reportsData?.reports && reportsData.reports.length > 0 ? (
              reportsData.reports.map((r, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl bg-slate-900/70 border ${r.corroborated ? 'border-rose-500/40' : 'border-amber-500/30'} hover:border-slate-700 transition-colors`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white flex items-center space-x-1.5">
                      <span className={`w-2 h-2 rounded-full ${r.status === 'Severe' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                      <span>{r.status} Severity</span>
                    </span>
                    <span className={`text-[10px] font-semibold ${r.corroborated ? 'text-rose-300' : 'text-amber-300'}`}>
                      {r.corroborated ? 'Confirmed by 2 reports' : `Waiting for corroboration (${r.report_count ?? 1}/2)`}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {r.lat.toFixed(3)}, {r.lng.toFixed(3)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {r.desc}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl">
                No active severe incidents corroborated in this sector.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
