'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { SectorWithRainfall } from '@/types';
import { getRainfallIntensityColor, getRiskColor } from '@/lib/openMeteo';

interface RainfallMapProps {
  sectors: SectorWithRainfall[];
  selectedSector: SectorWithRainfall | null;
  onSelectSector: (sector: SectorWithRainfall) => void;
}

export default function RainfallMap({
  sectors,
  selectedSector,
  onSelectSector,
}: RainfallMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.CircleMarker>>(new Map());

  // Initialize Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const leafletContainer = mapContainerRef.current as HTMLDivElement & { _leaflet_id?: number };
    if (leafletContainer._leaflet_id) {
      delete leafletContainer._leaflet_id;
    }

    const map = L.map(mapContainerRef.current, {
      center: [20, 10],
      zoom: 3,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: true,
    });

    // Default OpenStreetMap tiles
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors • Open-Meteo',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run once on mount

  // Update Markers dynamically whenever sectors list changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerGroupRef.current) return;

    const group = markersLayerGroupRef.current;
    group.clearLayers();
    markersMapRef.current.clear();

    sectors.forEach((sector) => {
      const color = getRainfallIntensityColor(sector.rainfall);
      const radius = Math.max(6, Math.min(18, 6 + sector.rainfall * 0.6));

      const marker = L.circleMarker([sector.lat, sector.lon], {
        radius,
        fillColor: color,
        color: '#ffffff',
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.85,
      });

      const popupContent = `
        <div style="padding: 6px; font-family: sans-serif; min-width: 170px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
            <strong style="font-size: 14px; color: #f8fafc;">${sector.name}</strong>
            <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${getRiskColor(
              sector.risk
            )}; color: #ffffff;">${sector.risk}</span>
          </div>
          <div style="font-size: 12px; color: #38bdf8; font-weight: bold; margin-bottom: 6px;">
            ${sector.rainfall.toFixed(1)} mm/hr precipitation
          </div>
          <div style="font-size: 10px; color: #94a3b8; line-height: 1.5; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px;">
            <div>🌡️ Temp: ${sector.temperature ?? '--'}°C</div>
            <div>💧 Humidity: ${sector.humidity ?? '--'}%</div>
            <div>💨 Wind: ${sector.windSpeed ?? '--'} km/h</div>
            <div>📍 Country: ${sector.country}</div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        onSelectSector(sector);
      });

      group.addLayer(marker);
      markersMapRef.current.set(`${sector.lat}_${sector.lon}`, marker);
    });
  }, [sectors, onSelectSector]);

  // Fly to selected sector
  useEffect(() => {
    if (!selectedSector || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([selectedSector.lat, selectedSector.lon], 7, {
      duration: 1.5,
    });
    const key = `${selectedSector.lat}_${selectedSector.lon}`;
    const marker = markersMapRef.current.get(key);
    if (marker) {
      marker.openPopup();
    }
  }, [selectedSector]);

  return (
    <div className="relative w-full h-full min-h-[550px] lg:min-h-[680px] rounded-2xl overflow-hidden glass-panel border border-sky-500/20 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 right-4 z-[400] glass-panel p-3.5 rounded-xl border border-sky-500/20 text-xs hidden sm:block">
        <div className="font-bold text-white mb-2 tracking-wide uppercase text-[10px]">
          Precipitation Legend
        </div>
        <div className="space-y-1 text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#38bdf8]" />
            <span className="text-slate-300">Dry (0 mm/hr)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#0ea5e9]" />
            <span className="text-slate-300">Light (&lt;1 mm/hr)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#2563eb]" />
            <span className="text-slate-300">Moderate (1 - 5 mm/hr)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#7c3aed]" />
            <span className="text-slate-300">Heavy (5 - 15 mm/hr)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#c026d3]" />
            <span className="text-slate-300">Very Heavy (15 - 30 mm/hr)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#dc2626]" />
            <span className="text-slate-300 font-bold">Extreme (&gt;30 mm/hr)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
