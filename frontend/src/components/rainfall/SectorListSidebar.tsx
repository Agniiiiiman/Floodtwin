'use client';

import React, { useState, useMemo } from 'react';
import { SectorWithRainfall } from '@/types';
import { getRainfallIntensityColor, getRiskColor } from '@/lib/openMeteo';
import { Search, Filter, Globe, MapPin, Wind, Droplet, Thermometer, ChevronRight } from 'lucide-react';

interface SectorListSidebarProps {
  sectors: SectorWithRainfall[];
  selectedSector: SectorWithRainfall | null;
  onSelectSector: (sector: SectorWithRainfall) => void;
}

export function SectorListSidebar({
  sectors,
  selectedSector,
  onSelectSector,
}: SectorListSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const regions = [
    'all',
    'South Asia',
    'East Asia',
    'Middle East',
    'Europe',
    'Africa',
    'North America',
    'South America',
    'Oceania',
    'Polar',
  ];

  const filteredSectors = useMemo(() => {
    return sectors.filter((sector) => {
      const matchesSearch =
        sector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sector.country.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRisk =
        selectedRisk === 'all' || sector.risk.toLowerCase() === selectedRisk.toLowerCase();

      const matchesRegion =
        selectedRegion === 'all' || sector.region === selectedRegion;

      return matchesSearch && matchesRisk && matchesRegion;
    });
  }, [sectors, searchQuery, selectedRisk, selectedRegion]);

  return (
    <div className="glass-panel p-5 rounded-2xl border border-sky-500/20 shadow-xl flex flex-col h-full max-h-[750px] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Sector Explorer ({filteredSectors.length})
          </h3>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search city or country code (e.g. Mumbai, US, Tokyo)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Risk Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
        {['all', 'critical', 'high', 'medium', 'low'].map((risk) => (
          <button
            key={risk}
            onClick={() => setSelectedRisk(risk)}
            className={`px-2.5 py-1 rounded-lg uppercase tracking-wider font-semibold transition-all whitespace-nowrap ${
              selectedRisk === risk
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {risk}
          </button>
        ))}
      </div>

      {/* Region Filter Dropdown */}
      <div>
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:border-sky-500 focus:outline-none"
        >
          {regions.map((reg) => (
            <option key={reg} value={reg}>
              {reg === 'all' ? 'All Global Regions' : reg}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Sector Card (if any) */}
      {selectedSector && (
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-sky-500/30 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <strong className="text-sm text-white">
                {selectedSector.name}, {selectedSector.country}
              </strong>
            </div>
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white"
              style={{ backgroundColor: getRiskColor(selectedSector.risk) }}
            >
              {selectedSector.risk} Risk
            </span>
          </div>

          <div className="text-lg font-black text-sky-400">
            {selectedSector.rainfall.toFixed(1)}{' '}
            <span className="text-xs font-normal text-slate-400">mm/hr precipitation</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
            <div className="flex items-center space-x-1">
              <Thermometer className="w-3 h-3 text-amber-400" />
              <span>{selectedSector.temperature ?? '--'}°C</span>
            </div>
            <div className="flex items-center space-x-1">
              <Droplet className="w-3 h-3 text-blue-400" />
              <span>{selectedSector.humidity ?? '--'}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <Wind className="w-3 h-3 text-teal-400" />
              <span>{selectedSector.windSpeed ?? '--'} km/h</span>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Sector List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredSectors.map((sector) => {
          const isSelected =
            selectedSector?.lat === sector.lat && selectedSector?.lon === sector.lon;
          return (
            <button
              key={`${sector.lat}_${sector.lon}`}
              onClick={() => onSelectSector(sector)}
              className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${
                isSelected
                  ? 'bg-sky-500/20 border-sky-500/60 shadow-md'
                  : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white group-hover:text-sky-300 flex items-center space-x-1.5">
                  <span>{sector.name}</span>
                  <span className="text-[10px] font-mono text-slate-400 font-normal">
                    ({sector.country})
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {sector.region} • {sector.lat.toFixed(1)}°, {sector.lon.toFixed(1)}°
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-sky-400">
                    {sector.rainfall.toFixed(1)} <span className="text-[9px]">mm/h</span>
                  </div>
                  <div
                    className="text-[9px] font-semibold uppercase"
                    style={{ color: getRiskColor(sector.risk) }}
                  >
                    {sector.risk}
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
