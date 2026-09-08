'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { DrainageGeoJSON } from '@/types';
import { Layers, MapPin, Crosshair, RefreshCw, AlertCircle } from 'lucide-react';

interface DigitalTwinMapProps {
  drainageData?: DrainageGeoJSON | null;
  pilotCoords?: [number, number]; // [lat, lng]
}

export default function DigitalTwinMap({
  drainageData,
  pilotCoords = [18.96, 72.82],
}: DigitalTwinMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const drainageLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Initialize Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Guard against container already initialized
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    const map = L.map(mapContainerRef.current, {
      center: pilotCoords,
      zoom: 14,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add OpenStreetMap base tile layer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    // Add simulated flood risk radius zone
    const riskZone = L.circle(pilotCoords, {
      color: '#ef4444',
      fillColor: '#f43f5e',
      fillOpacity: 0.25,
      radius: 1200,
      weight: 1.5,
      dashArray: '4, 8',
    }).addTo(map);

    riskZone.bindPopup(`
      <div style="padding: 4px; font-family: sans-serif;">
        <h4 style="font-weight: bold; color: #ef4444; margin-bottom: 2px;">⚠️ High Inundation Risk Sector</h4>
        <p style="font-size: 11px; margin: 0; color: #cbd5e1;">South Mumbai Pilot Catchment Area. Manning overflow threshold: 50 mm/hr.</p>
      </div>
    `);

    // Add Pilot Ward Marker
    const pilotMarker = L.circleMarker(pilotCoords, {
      radius: 9,
      fillColor: '#38bdf8',
      color: '#ffffff',
      weight: 2.5,
      opacity: 1,
      fillOpacity: 0.9,
    }).addTo(map);

    pilotMarker.bindPopup(`
      <div style="padding: 4px; font-family: sans-serif;">
        <h4 style="font-weight: bold; color: #38bdf8; margin-bottom: 2px;">📍 Pilot Ward Sensor Node</h4>
        <p style="font-size: 11px; margin: 0; color: #cbd5e1;">Ward A/B • Lat: 18.96, Lon: 72.82</p>
        <p style="font-size: 10px; color: #38bdf8; margin-top: 4px;">Hydraulic digital twin telemetry active.</p>
      </div>
    `);

    // Create a LayerGroup for dynamic drainage features
    const drainageGroup = L.layerGroup().addTo(map);
    drainageLayerGroupRef.current = drainageGroup;

    mapInstanceRef.current = map;

    // Resize invalidate timer
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

  // Update Drainage Overlays when data changes without re-initializing the entire map
  useEffect(() => {
    if (!mapInstanceRef.current || !drainageLayerGroupRef.current) return;

    const group = drainageLayerGroupRef.current;
    group.clearLayers();

    if (drainageData?.features) {
      drainageData.features.forEach((feature) => {
        if (feature.geometry.type === 'LineString') {
          const coords = feature.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
          const polyline = L.polyline(coords, {
            color: '#0284c7',
            weight: 4,
            opacity: 0.85,
          }).bindPopup(`
            <div style="padding: 4px;">
              <b style="color:#38bdf8">Drainage Pipe: ${feature.properties.id}</b>
              <div style="font-size: 11px; color: #94a3b8">Capacity: ${feature.properties.capacity} m³/s</div>
            </div>
          `);
          group.addLayer(polyline);
        } else if (feature.geometry.type === 'Point') {
          const [lng, lat] = feature.geometry.coordinates;
          const marker = L.circleMarker([lat, lng], {
            radius: 6,
            fillColor: '#10b981',
            color: '#ffffff',
            weight: 1.5,
            fillOpacity: 0.8,
          }).bindPopup(`
            <div style="padding: 4px;">
              <b style="color:#10b981">Manhole Node: ${feature.properties.id}</b>
              <div style="font-size: 11px; color: #94a3b8">Capacity: ${feature.properties.capacity} L/s</div>
            </div>
          `);
          group.addLayer(marker);
        }
      });
    }
  }, [drainageData]);

  // Handle Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 15, { duration: 1.5 });

          const userMarker = L.circleMarker([latitude, longitude], {
            radius: 8,
            fillColor: '#f59e0b',
            color: '#ffffff',
            weight: 2,
            fillOpacity: 0.9,
          }).addTo(mapInstanceRef.current);

          userMarker.bindPopup(`
            <div style="padding: 4px;">
              <b style="color: #f59e0b">📍 Your Location</b>
              <p style="font-size: 11px; margin: 0; color: #cbd5e1;">Live monitoring zone.</p>
            </div>
          `).openPopup();
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation failed:', err.message);
      },
      { timeout: 8000 }
    );
  };

  const handleResetPilot = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(pilotCoords, 14, { duration: 1.2 });
    }
  };

  return (
    <div className="relative w-full h-[450px] lg:h-[500px] rounded-2xl overflow-hidden glass-panel border border-sky-500/20 shadow-2xl">
      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Map Action Bar */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex items-center justify-between pointer-events-none">
        <div className="glass-panel px-3.5 py-1.5 rounded-xl border border-sky-500/30 flex items-center space-x-2 pointer-events-auto shadow-md">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-white tracking-wide">
            Ward Digital Twin Mesh Active
          </span>
        </div>

        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="glass-panel hover:glass-panel-glow px-3 py-1.5 rounded-xl text-sky-400 hover:text-white border border-sky-500/30 text-xs font-medium flex items-center space-x-1.5 transition-all shadow-md"
            title="Center on My Location"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">My GPS</span>
          </button>

          <button
            onClick={handleResetPilot}
            className="glass-panel hover:glass-panel-glow px-3 py-1.5 rounded-xl text-slate-300 hover:text-white border border-sky-500/30 text-xs font-medium flex items-center space-x-1.5 transition-all shadow-md"
            title="Reset to Pilot Ward (South Mumbai)"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">South Mumbai</span>
          </button>
        </div>
      </div>

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-4 left-4 z-[400] pointer-events-auto glass-panel p-2.5 rounded-xl border border-sky-500/20 text-[11px] hidden sm:flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-sky-400" />
          <span className="text-slate-300">Sensor Nodes</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-1 bg-sky-500 rounded" />
          <span className="text-slate-300">Underground Trunk</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500/40 border border-rose-500" />
          <span className="text-slate-300">Surge Zone</span>
        </div>
      </div>
    </div>
  );
}
