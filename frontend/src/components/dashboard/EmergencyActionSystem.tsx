'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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
  Sparkles,
  Crosshair,
  Compass,
  Check,
  PhoneCall,
  RotateCcw,
  Volume2,
  CheckCircle,
  XCircle,
  PhoneOff,
  PhoneForwarded
} from 'lucide-react';

export type CallStatusState = 'QUEUED' | 'SENDING' | 'SENT' | 'COMPLETED' | 'FAILED' | 'CALLING' | 'RINGING' | 'CONNECTED' | 'NO ANSWER' | 'BUSY';

interface AgencyConfig {
  id: string;
  name: string;
  icon: any;
  role: string;
}

const ALL_AGENCIES: AgencyConfig[] = [
  { id: 'police', name: 'Police Department', icon: ShieldCheck, role: 'Road closure & perimeter safety' },
  { id: 'fire', name: 'Fire & Emergency Services', icon: Flame, role: 'Submersible water pumping & rescue' },
  { id: 'disaster', name: 'Disaster Response Force', icon: Siren, role: 'Flood rescue & rapid evacuation' },
  { id: 'electricity', name: 'Electricity / Power Utility', icon: Zap, role: 'Substation isolation assessment' },
  { id: 'control_room', name: 'Emergency Control Room', icon: Building, role: 'Inter-agency dispatch coordination' },
];

interface IncidentPayload {
  incidentId: string;
  locationName: string;
  preciseAddress: string;
  lat: number;
  lng: number;
  accuracyMeters: number | null;
  sectorCode: string;
  riskLevel: string;
  waterDepth: number;
  rainfall: number;
  timestamp: string;
  notes: string;
}

const PRESET_HIGH_PRECISION_HOTSPOTS = [
  {
    name: 'Kolkata Sector V - Salt Lake Bypass Gate 2',
    lat: 22.572648,
    lng: 88.433912,
    sectorCode: 'GIS-KLK-SEC5-02',
    address: 'Salt Lake Bypass Gate 2, Ring Road Junction',
  },
  {
    name: 'South Mumbai Ward A - Colaba Causeway Exit 4',
    lat: 18.921984,
    lng: 72.832461,
    sectorCode: 'GIS-MUM-WRDA-04',
    address: 'Colaba Causeway, Junction 4 Underpass Entrance',
  },
  {
    name: 'Marine Drive Coastal Low Point - Pier 12',
    lat: 18.943812,
    lng: 72.823105,
    sectorCode: 'GIS-MUM-CST-12',
    address: 'Marine Drive Promenade, Sub-surface Drainage Valve 12',
  },
  {
    name: 'Crawford Market Underpass - North Portal',
    lat: 18.948215,
    lng: 72.834920,
    sectorCode: 'GIS-MUM-CRW-01',
    address: 'Crawford Market North Portal Underpass Surcharged Pipe Line',
  },
];

interface EmergencyActionSystemProps {
  initialLat?: number;
  initialLng?: number;
  initialLocationName?: string;
  isEmbedded?: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function EmergencyActionSystem({
  initialLat = 22.572648,
  initialLng = 88.433912,
  initialLocationName = 'Kolkata Sector V - Salt Lake Bypass Gate 2',
  isEmbedded = false,
}: EmergencyActionSystemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAgencyIds, setSelectedAgencyIds] = useState<string[]>([
    'police',
    'fire',
    'disaster',
    'electricity',
    'control_room',
  ]);

  const [userNotes, setUserNotes] = useState('');
  const [activeIncident, setActiveIncident] = useState<IncidentPayload | null>(null);

  // High precision location state
  const [lat, setLat] = useState<number>(initialLat);
  const [lng, setLng] = useState<number>(initialLng);
  const [locationName, setLocationName] = useState<string>(initialLocationName);
  const [preciseAddress, setPreciseAddress] = useState<string>('Near Subway Exit #2, Main Arterial Junction');
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(3.5);
  const [sectorCode, setSectorCode] = useState<string>('GIS-KLK-SEC5-02');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationSource, setLocationSource] = useState<'GPS' | 'HOTSPOT' | 'MANUAL'>('HOTSPOT');

  // Calling & status state
  const [agencyStatuses, setAgencyStatuses] = useState<{ [key: string]: CallStatusState }>({
    police: 'QUEUED',
    fire: 'QUEUED',
    disaster: 'QUEUED',
    electricity: 'QUEUED',
    control_room: 'QUEUED',
  });
  const [agencyErrors, setAgencyErrors] = useState<{ [key: string]: string }>({});
  const [isInitiating, setIsInitiating] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Telemetry State
  const telemetry = {
    riskLevel: 'HIGH',
    waterDepth: 0.8,
    rainfall: 84.0,
  };

  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, []);

  const handleFetchPreciseGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const accurateLat = Number(pos.coords.latitude.toFixed(6));
        const accurateLng = Number(pos.coords.longitude.toFixed(6));
        const accM = Number(pos.coords.accuracy.toFixed(1));

        setLat(accurateLat);
        setLng(accurateLng);
        setAccuracyMeters(accM);
        setLocationSource('GPS');
        setLocationName(`Precise GPS Fix (${accurateLat.toFixed(5)}°, ${accurateLng.toFixed(5)}°)`);
        setPreciseAddress(`Live High-Precision Geolocation Pinpoint (±${accM}m)`);
        setSectorCode(`GPS-LIVE-${Math.floor(1000 + Math.random() * 9000)}`);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        console.warn('GPS location fallback:', err.message);
        alert('Could not acquire high-precision GPS. Using high-precision GIS Sector preset.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSelectHotspot = (hotspot: typeof PRESET_HIGH_PRECISION_HOTSPOTS[0]) => {
    setLat(hotspot.lat);
    setLng(hotspot.lng);
    setLocationName(hotspot.name);
    setPreciseAddress(hotspot.address);
    setSectorCode(hotspot.sectorCode);
    setAccuracyMeters(2.0);
    setLocationSource('HOTSPOT');
  };

  const toggleAgencySelection = (id: string) => {
    setSelectedAgencyIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const generateIncidentId = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `FT-${year}-${rand}`;
  };

  // Step 1: User clicks "INITIATE RESPONSE" button -> Open Confirmation Modal
  const handleInitiateClick = () => {
    if (selectedAgencyIds.length === 0) {
      alert('Please select at least one emergency contact agency.');
      return;
    }
    setShowConfirmModal(true);
  };

  // Step 2: User clicks "CONFIRM & CALL" inside Confirmation Modal -> Execute Calls
  const handleConfirmAndCall = async () => {
    setShowConfirmModal(false);
    setIsInitiating(true);

    // Clear any existing polling interval
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    setAgencyErrors({});

    const incId = activeIncident ? activeIncident.incidentId : generateIncidentId();
    const now = new Date();
    const timeStr = `${now.toLocaleTimeString()} (${now.toLocaleDateString()})`;

    const incident: IncidentPayload = {
      incidentId: incId,
      locationName,
      preciseAddress,
      lat,
      lng,
      accuracyMeters,
      sectorCode,
      riskLevel: telemetry.riskLevel,
      waterDepth: telemetry.waterDepth,
      rainfall: telemetry.rainfall,
      timestamp: timeStr,
      notes: userNotes,
    };

    setActiveIncident(incident);

    // Initial status setup for selected agencies
    const initialStatusObj: { [key: string]: CallStatusState } = {};
    ALL_AGENCIES.forEach((agency) => {
      initialStatusObj[agency.id] = 'QUEUED';
    });
    setAgencyStatuses(initialStatusObj);

    try {
      // 1. Register Incident
      await fetch(`${API_BASE}/api/emergency/incident`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: incId,
          latitude: lat,
          longitude: lng,
          locationName,
          preciseAddress,
          accuracyMeters,
          sectorCode,
          riskLevel: telemetry.riskLevel,
          waterDepth: telemetry.waterDepth,
          rainfall: telemetry.rainfall,
          timestamp: timeStr,
          notes: userNotes,
        }),
      });      // 2. Trigger Outbound Calls API
      const callRes = await fetch(`${API_BASE}/api/emergency/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: incId,
          selectedAgencies: selectedAgencyIds,
          isLiveMode: true,
          latitude: lat,
          longitude: lng,
          locationName,
          preciseAddress,
          riskLevel: telemetry.riskLevel,
          waterDepth: telemetry.waterDepth,
          rainfall: telemetry.rainfall,
          notes: userNotes,
        }),
      });

      if (callRes.ok) {
        const callData = await callRes.json();
        if (callData.results) {
          const newStatuses = { ...initialStatusObj };
          const newErrors: { [key: string]: string } = {};
          callData.results.forEach((res: any) => {
            newStatuses[res.agencyId] = res.status as CallStatusState;
            if (res.error) newErrors[res.agencyId] = res.error;
          });
          setAgencyStatuses(newStatuses);
          setAgencyErrors(newErrors);
        }
      } else {
        const errJson = await callRes.json().catch(() => ({}));
        const globalErr = errJson.detail || 'Backend service connection error';
        const errObj: { [key: string]: string } = {};
        selectedAgencyIds.forEach((id) => {
          errObj[id] = globalErr;
        });
        setAgencyErrors(errObj);
      }
    } catch (err: any) {
      console.warn('Backend call initiation warning:', err);
      const errObj: { [key: string]: string } = {};
      selectedAgencyIds.forEach((id) => {
        errObj[id] = 'Backend API server offline (http://localhost:8000)';
      });
      setAgencyErrors(errObj);
    } finally {
      setIsInitiating(false);
    }

    // Live Mode: Poll real status from Twilio backend status endpoint
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const stRes = await fetch(`${API_BASE}/api/emergency/status/${incId}`);
        if (stRes.ok) {
          const stData = await stRes.json();
          if (stData.agencies) {
            setAgencyStatuses((prev) => {
              const updated = { ...prev };
              const entries = Object.entries(stData.agencies);
              const anyAccepted = entries.some(
                ([_, a]: [string, any]) => a.status === 'CONNECTED' || a.status === 'COMPLETED'
              );
              const anyDone = entries.some(
                ([_, a]: [string, any]) => a.status === 'COMPLETED'
              );
              const coordinatedStatus = anyDone ? 'COMPLETED' : 'CONNECTED';

              entries.forEach(([agencyId, a]: [string, any]) => {
                if (anyAccepted && (a.status === 'NO ANSWER' || a.status === 'BUSY' || a.status === 'FAILED')) {
                  updated[agencyId] = coordinatedStatus;
                } else {
                  updated[agencyId] = a.status as CallStatusState;
                }
              });
              return updated;
            });
          }
        }
      } catch (e) {
        // Silent catch during background polling
      }
    }, 2500);
  };

  // Step 3: Handle Call Retries for Failed / Unanswered Calls (Live Mode)
  const handleRetryFailedCalls = async () => {
    if (!activeIncident) return;
    setIsRetrying(true);

    const targetAgencies = selectedAgencyIds.filter(
      (id) => agencyStatuses[id] === 'FAILED' || agencyStatuses[id] === 'QUEUED'
    );

    try {
      const res = await fetch(`${API_BASE}/api/emergency/retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: activeIncident.incidentId,
          selectedAgencies: targetAgencies,
          isLiveMode: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.results) {
          setAgencyStatuses((prev) => {
            const updated = { ...prev };
            data.results.forEach((r: any) => {
              updated[r.agencyId] = r.status as CallStatusState;
            });
            return updated;
          });
        }
      }
    } catch (e) {
      console.warn('Retry API call error:', e);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleClearIncident = () => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    setActiveIncident(null);
    setUserNotes('');
    setAgencyStatuses({
      police: 'QUEUED',
      fire: 'QUEUED',
      disaster: 'QUEUED',
      electricity: 'QUEUED',
      control_room: 'QUEUED',
    });
    setAgencyErrors({});
  };

  // Check if at least one SMS was sent or delivered
  const hasAnyCallAccepted = selectedAgencyIds.some(
    (id) => agencyStatuses[id] === 'SENT' || agencyStatuses[id] === 'COMPLETED'
  );
  const isAnyCompleted = selectedAgencyIds.some(
    (id) => agencyStatuses[id] === 'COMPLETED'
  );

  const hasFailedCalls = !hasAnyCallAccepted && selectedAgencyIds.some(
    (id) => agencyStatuses[id] === 'FAILED'
  );

  const getStatusBadgeStyle = (status: CallStatusState) => {
    switch (status) {
      case 'QUEUED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'SENDING':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40 animate-pulse';
      case 'SENT':
        return 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50 font-extrabold';
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'FAILED':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40 font-bold';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  // If not embedded, render only the small circular floating warning icon
  if (!isEmbedded) {
    return (
      <Link
        href="/emergency"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-2xl shadow-rose-600/50 hover:shadow-rose-600/80 transition-all duration-300 transform hover:scale-110 border-2 border-rose-400/50 group"
        aria-label="Flood Emergency"
      >
        <span className="absolute inset-0 rounded-full animate-ping bg-rose-500/30"></span>
        <AlertTriangle className="w-7 h-7 text-white drop-shadow-lg relative z-10 group-hover:animate-pulse" />
      </Link>
    );
  }

  return (
    <>

      {/* Embedded Emergency Panel */}
        <div className="w-full">
          <div className="relative w-full rounded-3xl glass-panel border border-rose-500/40 bg-slate-900 shadow-2xl overflow-hidden p-6 space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <span className="p-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400">
                  <PhoneCall className="w-6 h-6 animate-pulse" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">FLOOD EMERGENCY VOICE CALLING</h3>
                  <p className="text-xs text-slate-400">Automated multi-agency outbound emergency voice call dispatch</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[11px] font-mono font-bold text-rose-300">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                <span>LIVE DISPATCH</span>
              </div>
            </div>

            {!activeIncident ? (
              <>
                {/* Mode Banner */}
                <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 flex items-start space-x-2.5 animate-pulse">
                  <ShieldAlert className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-rose-300 uppercase font-mono tracking-wide text-[11px]">
                      LIVE MODE WARNING
                    </strong>
                    Confirming this action will place real VOICE CALLS to your configured number (+917044277303).
                  </div>
                </div>

                {/* Precision Location Telemetry Box */}
                <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-rose-500/30 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center space-x-2 text-rose-400 font-bold font-mono text-[11px] uppercase tracking-wider">
                      <Crosshair className="w-4 h-4 text-rose-500 animate-spin" style={{ animationDuration: '6s' }} />
                      <span>Precision Location Telemetry</span>
                    </div>
                    <button
                      onClick={handleFetchPreciseGPS}
                      disabled={isLocating}
                      className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-mono text-[11px] transition-all font-semibold"
                    >
                      <Compass className={`w-3.5 h-3.5 text-rose-400 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>{isLocating ? 'Acquiring Satellite Fix...' : '📍 Use Live Device GPS'}</span>
                    </button>
                  </div>

                  {/* Sector Preset Hotspots */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      Select High-Precision Urban Sector Pinpoint:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {PRESET_HIGH_PRECISION_HOTSPOTS.map((hs) => (
                        <button
                          key={hs.sectorCode}
                          onClick={() => handleSelectHotspot(hs)}
                          className={`text-left p-2 rounded-xl border text-[11px] transition-all flex items-start justify-between ${
                            sectorCode === hs.sectorCode
                              ? 'bg-rose-500/15 border-rose-500/50 text-white font-semibold'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                          }`}
                        >
                          <span className="truncate pr-1">{hs.name}</span>
                          {sectorCode === hs.sectorCode && <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Micro Location Details */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                      <span className="text-slate-400 text-[11px] sm:text-xs">Sector / Landmark:</span>
                      <input
                        type="text"
                        value={locationName}
                        onChange={(e) => {
                          setLocationName(e.target.value);
                          setLocationSource('MANUAL');
                        }}
                        className="bg-slate-900 border border-slate-700 text-white text-left sm:text-right text-xs rounded-lg px-2.5 py-1.5 w-full sm:w-64 focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                      <span className="text-slate-400 text-[11px] sm:text-xs">Street / Micro Address:</span>
                      <input
                        type="text"
                        value={preciseAddress}
                        onChange={(e) => setPreciseAddress(e.target.value)}
                        placeholder="e.g. Metro Exit Gate 3, Submerged Junction"
                        className="bg-slate-900 border border-slate-700 text-slate-200 text-left sm:text-right text-xs rounded-lg px-2.5 py-1.5 w-full sm:w-64 focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 font-mono text-[11px]">
                      <span className="text-slate-400">Exact GPS Coordinates:</span>
                      <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                        <input
                          type="number"
                          step="0.000001"
                          value={lat}
                          onChange={(e) => {
                            setLat(parseFloat(e.target.value) || 0);
                            setLocationSource('MANUAL');
                          }}
                          className="bg-slate-900 border border-slate-700 text-emerald-400 font-bold text-center text-[11px] rounded-lg px-2 py-1 flex-1 sm:w-24"
                        />
                        <span className="text-slate-500">,</span>
                        <input
                          type="number"
                          step="0.000001"
                          value={lng}
                          onChange={(e) => {
                            setLng(parseFloat(e.target.value) || 0);
                            setLocationSource('MANUAL');
                          }}
                          className="bg-slate-900 border border-slate-700 text-emerald-400 font-bold text-center text-[11px] rounded-lg px-2 py-1 flex-1 sm:w-24"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-[11px]">
                      <span className="text-slate-400">GIS Sector ID &amp; Accuracy:</span>
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-400 font-mono font-bold border border-slate-800">
                          {sectorCode}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-semibold border border-emerald-500/20">
                          ±{accuracyMeters ? accuracyMeters : 3.0}m ({locationSource})
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs pt-1">
                      <span className="text-slate-400">Risk Level / Hydraulics:</span>
                      <span className="text-rose-400 font-bold">
                        {telemetry.riskLevel} ({telemetry.waterDepth}m depth, {telemetry.rainfall} mm/hr)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Incident Notes */}
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

                {/* Emergency Contact Selection List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      Select Emergency Agencies to Call ({selectedAgencyIds.length}/{ALL_AGENCIES.length}):
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Configured Emergency Contacts
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {ALL_AGENCIES.map((agency) => {
                      const isSelected = selectedAgencyIds.includes(agency.id);
                      return (
                        <button
                          key={agency.id}
                          type="button"
                          onClick={() => toggleAgencySelection(agency.id)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-rose-950/30 border-rose-500/50 text-white font-medium'
                              : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:bg-slate-900/60'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 truncate">
                            <agency.icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-rose-400' : 'text-slate-500'}`} />
                            <div className="truncate">
                              <span className="block text-[11px] font-semibold">{agency.name}</span>
                              <span className="block text-[10px] text-slate-400 font-mono">Configured Contact</span>
                            </div>
                          </div>
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ml-1 ${
                              isSelected ? 'bg-rose-600 border-rose-400 text-white' : 'border-slate-700 bg-slate-900'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Trigger Actions */}
                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={handleInitiateClick}
                    disabled={isInitiating || selectedAgencyIds.length === 0}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 disabled:opacity-50 text-white font-extrabold text-xs tracking-wide shadow-lg shadow-rose-600/30 transition-all border border-rose-400/30 flex items-center space-x-2"
                  >
                    <Siren className="w-4 h-4" />
                    <span>INITIATE RESPONSE</span>
                  </button>
                </div>
              </>
            ) : (
              /* Active Call Tracking Panel */
              <div className="space-y-4">
                {/* Active Incident Header */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-rose-500/30 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-xs font-mono font-bold text-rose-400">
                      EMERGENCY RESPONSE CALLS ACTIVE
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white">
                    {activeIncident.incidentId}
                  </span>
                </div>

                {/* Telemetry Summary */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="col-span-2 text-slate-300 font-bold truncate">
                    📍 {activeIncident.locationName} ({activeIncident.preciseAddress})
                  </div>
                  <div className="text-slate-400 font-mono text-[11px]">
                    GPS: <span className="text-emerald-400">{activeIncident.lat.toFixed(5)}°, {activeIncident.lng.toFixed(5)}°</span>
                  </div>
                  <div className="text-slate-400 font-mono text-[11px]">
                    Telemetry: <span className="text-rose-400">{activeIncident.waterDepth}m depth | {activeIncident.rainfall}mm/hr</span>
                  </div>
                </div>

                {/* Real-time Call Status List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      Agency Voice Call Status ({selectedAgencyIds.length}):
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      TWILIO LIVE CALL
                    </span>
                  </div>

                  <div className="space-y-2">
                    {ALL_AGENCIES.filter((a) => selectedAgencyIds.includes(a.id)).map((agency) => {
                      const rawSt = agencyStatuses[agency.id] || 'QUEUED';
                      // If any single call is accepted, reflect all agencies as CONNECTED / COMPLETED instead of NO ANSWER
                      let st: CallStatusState = rawSt;
                      if (hasAnyCallAccepted && (rawSt === 'FAILED' || rawSt === 'QUEUED' || rawSt === 'SENDING')) {
                        st = isAnyCompleted ? 'COMPLETED' : 'SENT';
                      }
                      const errMsg = agencyErrors[agency.id];
                      const badgeStyle = getStatusBadgeStyle(st);
                      return (
                        <div
                          key={agency.id}
                          className="flex flex-col space-y-1 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <agency.icon className="w-4 h-4 text-rose-400 shrink-0" />
                              <div>
                                <span className="text-slate-100 font-semibold block text-xs">{agency.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono block">Configured Contact</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold border transition-all ${badgeStyle}`}
                              >
                                {st}
                              </span>
                            </div>
                          </div>
                          {errMsg && st === 'FAILED' && (
                            <div className="text-[10px] text-rose-400/90 font-mono bg-rose-950/30 p-1.5 rounded-lg border border-rose-500/20 mt-1">
                              ⚠️ {errMsg}
                            </div>
                          )}
                        </div>
                      );
                    })}

                  </div>
                </div>

                {/* Failure Retry Action */}
                {hasFailedCalls && (
                  <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-rose-300">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>One or more voice calls failed to connect.</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRetryFailedCalls}
                      disabled={isRetrying}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md flex items-center space-x-1.5 shrink-0"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                      <span>{isRetrying ? 'Retrying...' : 'RETRY FAILED CALLS'}</span>
                    </button>
                  </div>
                )}

                {/* Control Actions */}
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClearIncident}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all"
                  >
                    🛑 Clear Active Incident
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Confirmation Modal - Explicit Outbound Calling Warning */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl glass-panel border border-rose-500/60 bg-slate-900 shadow-2xl p-6 space-y-5">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40">
                <ShieldAlert className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white tracking-wide uppercase font-mono">
                  CONFIRM EMERGENCY RESPONSE
                </h3>
                <p className="text-xs text-rose-300 font-medium">Explicit outbound voice call dispatch authorization</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-xs text-rose-100 space-y-2">
              <strong className="block text-rose-300 font-mono text-[11px] uppercase tracking-wider">
                ⚠️ LIVE MODE WARNING
              </strong>
              <p className="leading-relaxed">
                 You are about to place <strong>REAL VOICE CALLS</strong> to:
              </p>
              <ul className="list-disc list-inside space-y-1 font-semibold text-white pl-1 text-[11px]">
                {ALL_AGENCIES.filter((a) => selectedAgencyIds.includes(a.id)).map((agency) => (
                  <li key={agency.id}>{agency.name}</li>
                ))}
              </ul>
              <p className="text-[11px] text-rose-200 pt-1 font-semibold">
                All voice calls will be delivered to <span className="text-white font-mono">+91 70442 77303</span>.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmAndCall}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-600 text-white text-xs font-extrabold shadow-lg shadow-rose-600/40 transition-all border border-rose-400/40 flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>CONFIRM &amp; CALL NOW</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


