'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { fetchLiveRainfallData } from '@/lib/openMeteo';
import { SectorWithRainfall } from '@/types';
import { RainfallStatusBar } from '@/components/rainfall/RainfallStatusBar';
import { SectorListSidebar } from '@/components/rainfall/SectorListSidebar';
import { Globe, Layers, AlertCircle, RefreshCw } from 'lucide-react';

// Dynamic import for Leaflet map component to prevent SSR DOM errors
const RainfallMap = dynamic(
  () => import('@/components/rainfall/RainfallMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[550px] rounded-2xl glass-panel flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
        <span className="text-xs text-slate-300 tracking-wider uppercase font-mono">
          Mounting Global Leaflet Canvas...
        </span>
      </div>
    ),
  }
);

export default function RainfallMapPage() {
  const [sectors, setSectors] = useState<SectorWithRainfall[]>([]);
  const [selectedSector, setSelectedSector] = useState<SectorWithRainfall | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('--:--:--');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchLiveRainfallData();
      setSectors(data);
      setLastUpdated(new Date().toLocaleTimeString());
      setSecondsRemaining(60);
      if (!selectedSector && data.length > 0) {
        // Select Mumbai or first sector by default
        const defaultSec = data.find((s) => s.name === 'Mumbai') || data[0];
        setSelectedSector(defaultSec);
      }
    } catch (err) {
      console.error('Error fetching rainfall data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSector]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadData(), 0);

    // 60-second countdown interval
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          loadData();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearTimeout(initialLoad);
      clearInterval(timer);
    };
  }, [loadData]);

  return (
    <div className="min-h-screen pb-16 pt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span>Open-Meteo Real-Time Radar Mesh</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Global Rainfall & Flood Risk Monitor
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Live precipitation sampled continuously across 130+ global metropolitan hubs and high-monsoon sectors.
          </p>
        </div>
      </div>

      {/* Global Summary Status Bar */}
      <RainfallStatusBar
        sectors={sectors}
        loading={loading}
        lastUpdated={lastUpdated}
        onRefresh={loadData}
        secondsRemaining={secondsRemaining}
      />

      {/* Main Grid Layout: Sidebar + Leaflet Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Explorer Sidebar */}
        <div className="lg:col-span-4 h-[650px] lg:h-[720px]">
          <SectorListSidebar
            sectors={sectors}
            selectedSector={selectedSector}
            onSelectSector={(sector) => setSelectedSector(sector)}
          />
        </div>

        {/* Right Map Canvas */}
        <div className="lg:col-span-8 h-[650px] lg:h-[720px]">
          <RainfallMap
            sectors={sectors}
            selectedSector={selectedSector}
            onSelectSector={(sector) => setSelectedSector(sector)}
          />
        </div>
      </div>
    </div>
  );
}
