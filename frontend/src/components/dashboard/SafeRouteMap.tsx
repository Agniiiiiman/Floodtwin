'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RouteResponse } from '@/types';
import { Maximize2 } from 'lucide-react';
import L from 'leaflet';

interface SafeRouteMapProps {
  routeResult: RouteResponse;
  origin: [number, number];
  destination: [number, number];
  fromPlaceName?: string;
  toPlaceName?: string;
}

export default function SafeRouteMap({
  routeResult,
  origin,
  destination,
  fromPlaceName = 'Starting Point',
  toPlaceName = 'Safe Destination',
}: SafeRouteMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const coords: [number, number][] =
    routeResult.route?.routes?.[0]?.geometry?.coordinates?.map(
      ([lng, lat]: [number, number]) => [lat, lng]
    ) ?? [];

  // Flood hazard zones for the map overlay
  const HAZARD_ZONES: { name: string; coords: [number, number]; radius: number }[] = [
    { name: 'Hindmata Depression', coords: [19.008, 72.841], radius: 180 },
    { name: 'Sion Basin', coords: [19.038, 72.86], radius: 200 },
    { name: 'Crawford Underpass', coords: [18.946, 72.833], radius: 140 },
    { name: 'Milan Subway', coords: [19.088, 72.842], radius: 160 },
    { name: 'Kurla LBS Drain', coords: [19.068, 72.875], radius: 220 },
    { name: 'Colaba Low Point', coords: [18.918, 72.826], radius: 120 },
  ];

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

    let center = [18.93, 72.83] as L.LatLngExpression;
    if (coords.length > 0) {
      center = coords[Math.floor(coords.length / 2)];
    } else {
      center = [(origin[0] + destination[0]) / 2, (origin[1] + destination[1]) / 2];
    }

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: 14,
      zoomControl: false,
    });
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      className: 'map-tiles'
    }).addTo(map);

    // Hazard Zones
    HAZARD_ZONES.forEach(hz => {
      L.circle(hz.coords, {
        color: '#ef4444',
        fillColor: '#f43f5e',
        fillOpacity: 0.15,
        radius: hz.radius,
        weight: 1.5,
        dashArray: '5, 5'
      }).addTo(map).bindPopup(`
        <div style="padding: 2px;">
          <b style="color:#ef4444">⚠ ${hz.name}</b>
        </div>
      `);
    });

    if (coords.length > 0) {
      // Background glow
      L.polyline(coords, {
        color: '#059669',
        weight: 18,
        opacity: 0.25,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Mid stroke
      L.polyline(coords, {
        color: '#10b981',
        weight: 7,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Center dashed
      L.polyline(coords, {
        color: 'white',
        weight: 2,
        opacity: 0.9,
        dashArray: '8 12',
        lineCap: 'round'
      }).addTo(map);

      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [40, 40] });
    } else {
      const bounds = L.latLngBounds([origin, destination]);
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    // Origin marker
    const originIcon = L.divIcon({
      html: `
        <div style="position:relative; width:36px; height:36px; pointer-events: none;">
          <div style="position:absolute; width:100%; height:100%; border-radius:50%; background: radial-gradient(circle, #38bdf8 0%, #0284c7 100%); border:3px solid white; display:flex; align-items:center; justify-content:center; color:white; font-weight:900; font-size:16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">A</div>
          <div style="position:absolute; bottom:-8px; left:12px; width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:8px solid #0284c7;"></div>
          <div style="position:absolute; top:-35px; left:50%; transform:translateX(-50%); background:rgba(15, 23, 42, 0.85); color:#7dd3fc; font-size:10px; font-weight:bold; padding:2px 8px; border-radius:4px; white-space:nowrap; border: 1px solid rgba(56, 189, 248, 0.2);">
            📍 ${fromPlaceName.length > 22 ? fromPlaceName.slice(0, 22) + '…' : fromPlaceName}
          </div>
        </div>
      `,
      className: '',
      iconSize: [36, 42],
      iconAnchor: [18, 42],
    });
    L.marker(origin, { icon: originIcon }).addTo(map);

    // Dest marker
    const destIcon = L.divIcon({
      html: `
        <div style="position:relative; width:40px; height:40px; pointer-events: none;">
          <div style="position:absolute; width:100%; height:100%; border-radius:50%; background: radial-gradient(circle, #34d399 0%, #059669 100%); border:3px solid white; display:flex; align-items:center; justify-content:center; color:white; font-size:18px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">🛡️</div>
          <div style="position:absolute; bottom:-8px; left:14px; width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:8px solid #059669;"></div>
          <div style="position:absolute; top:-38px; left:50%; transform:translateX(-50%); background:rgba(15, 23, 42, 0.85); color:#6ee7b7; font-size:10px; font-weight:bold; padding:2px 8px; border-radius:4px; white-space:nowrap; border: 1px solid rgba(52, 211, 153, 0.2);">
            🛡️ ${toPlaceName.length > 24 ? toPlaceName.slice(0, 24) + '…' : toPlaceName}
          </div>
        </div>
      `,
      className: '',
      iconSize: [40, 48],
      iconAnchor: [20, 48],
    });
    L.marker(destination, { icon: destIcon }).addTo(map);

    mapInstanceRef.current = map;
    setMapLoaded(true);

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
  }, [routeResult, origin, destination, fromPlaceName, toPlaceName]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-emerald-500/30 shadow-2xl bg-slate-900"
         style={{ height: '480px' }}>
         
      <style dangerouslySetInnerHTML={{__html: `
        .map-tiles { filter: saturate(0.7) brightness(0.9); }
      `}} />

      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />

      {/* Top status bar */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none" style={{ zIndex: 400 }}>
        <div className="flex items-center gap-2 pointer-events-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className="font-extrabold text-slate-900 dark:text-white">Evacuation Corridor</span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold hidden sm:inline">100% Inundation-Free</span>
        </div>
        <a
          href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${origin[0]},${origin[1]};${destination[0]},${destination[1]}`}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5 text-sky-500" />
          <span>Open Full Map</span>
        </a>
      </div>

      {/* Bottom legend */}
      <div className="absolute bottom-3 left-3 pointer-events-none" style={{ zIndex: 400 }}>
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 shadow-xl text-[10px] sm:text-[11px] space-y-1">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
            <span className="w-5 h-1.5 bg-emerald-500 rounded-full inline-block shrink-0"></span>
            <span>Safe Route (Flood-Free)</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400">
            <span className="w-4 h-4 bg-rose-500/25 border border-rose-500 rounded-full inline-block shrink-0"></span>
            <span>Bypassed Hazard Zone</span>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center" style={{ zIndex: 500 }}>
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
            <p className="text-emerald-400 font-bold text-sm animate-pulse">Loading Evacuation Map...</p>
          </div>
        </div>
      )}
    </div>
  );
}

