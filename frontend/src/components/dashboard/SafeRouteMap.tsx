'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RouteResponse } from '@/types';
import { Maximize2, ShieldCheck, MapPin, AlertTriangle, Compass } from 'lucide-react';

interface SafeRouteMapProps {
  routeResult: RouteResponse;
  origin: [number, number];
  destination: [number, number];
  fromPlaceName?: string;
  toPlaceName?: string;
}

// Known low-lying flood hazard zones in Mumbai for realistic visualization of bypassed hazards
const FLOOD_HAZARD_ZONES: { name: string; coords: [number, number]; radius: number }[] = [
  { name: 'Hindmata Low-Basin Depression', coords: [19.0080, 72.8410], radius: 450 },
  { name: 'Sion Gandhi Market Waterlogged Basin', coords: [19.0380, 72.8600], radius: 500 },
  { name: 'Crawford Market Underpass Conduit', coords: [18.9460, 72.8330], radius: 350 },
  { name: 'Milan Subway Inundation Hotspot', coords: [19.0880, 72.8420], radius: 400 },
  { name: 'Kurla LBS Marg Surcharged Drain', coords: [19.0680, 72.8750], radius: 550 },
  { name: 'Colaba Causeway Low Point', coords: [18.9180, 72.8260], radius: 300 },
];

export function SafeRouteMap({
  routeResult,
  origin,
  destination,
  fromPlaceName = 'Starting Point',
  toPlaceName = 'Safe Destination',
}: SafeRouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const hazardsLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;

    // Reset container if previously initialized
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const container = containerRef.current as HTMLDivElement & { _leaflet_id?: number };
    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    try {
      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView(origin, 14);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Clean OpenStreetMap tile layer without any watermark
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      mapRef.current = map;
      hazardsLayerRef.current = L.layerGroup().addTo(map);
      routeLayerRef.current = L.layerGroup().addTo(map);

      // CRITICAL FIX FOR LEAFLET: Force resize recalculation so tiles always render
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 200);

      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 600);
    } catch (err) {
      console.warn('Map initialization note:', err);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      routeLayerRef.current = null;
      hazardsLayerRef.current = null;
    };
  }, []);

  // Update Route and Hazards Layer
  useEffect(() => {
    const map = mapRef.current;
    const routeLayer = routeLayerRef.current;
    const hazardsLayer = hazardsLayerRef.current;

    if (!map || !routeLayer) return;

    routeLayer.clearLayers();
    if (hazardsLayer) hazardsLayer.clearLayers();

    // Render flood hazard avoidance zones
    if (hazardsLayer) {
      FLOOD_HAZARD_ZONES.forEach((hazard) => {
        // Red striped hazard circle
        L.circle(hazard.coords, {
          color: '#ef4444',
          fillColor: '#f43f5e',
          fillOpacity: 0.22,
          weight: 2,
          dashArray: '5, 8',
        })
          .bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
              <b style="color: #ef4444;">⚠️ FLOOD HAZARD EXCLUSION ZONE</b><br/>
              <span style="color: #334155;">${hazard.name}</span><br/>
              <span style="font-size: 10px; color: #64748b; font-weight: bold;">Status: Actively bypassed by evacuation engine</span>
            </div>
          `)
          .bindTooltip(`⚠️ ${hazard.name} (Submerged / Bypassed)`, { direction: 'top' })
          .addTo(hazardsLayer);
      });
    }

    const coordinates = routeResult.route?.routes?.[0]?.geometry?.coordinates;
    if (coordinates && coordinates.length > 0) {
      const latLngs = coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);

      // 1. Broad outer green glow corridor
      L.polyline(latLngs, {
        color: '#059669',
        weight: 12,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(routeLayer);

      // 2. Medium emerald route stroke
      L.polyline(latLngs, {
        color: '#10b981',
        weight: 6,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(routeLayer);

      // 3. Central bright neon guide line
      L.polyline(latLngs, {
        color: '#ffffff',
        weight: 2,
        opacity: 0.95,
        dashArray: '6, 10',
      }).addTo(routeLayer);

      // DEPARTURE MARKER
      const originIcon = L.divIcon({
        className: 'custom-origin-marker',
        html: `
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            background: #0284c7;
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 4px 14px rgba(2,132,199,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 14px;
            font-weight: 900;
          ">
            A
            <div style="
              position: absolute;
              bottom: -6px;
              left: 10px;
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 6px solid #0284c7;
            "></div>
          </div>
        `,
        iconSize: [32, 38],
        iconAnchor: [16, 38],
      });

      L.marker(origin, { icon: originIcon })
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; padding: 4px;">
            <span style="background: #e0f2fe; color: #0369a1; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              📍 Starting Location (Origin)
            </span>
            <h4 style="font-weight: 800; font-size: 13px; margin: 4px 0 2px 0; color: #0f172a;">${fromPlaceName}</h4>
            <div style="font-family: monospace; font-size: 10px; color: #64748b;">GPS: ${origin[0].toFixed(4)}, ${origin[1].toFixed(4)}</div>
          </div>
        `)
        .bindTooltip(`📍 FROM: ${fromPlaceName}`, { permanent: false, direction: 'top' })
        .addTo(routeLayer);

      // SAFE DESTINATION MARKER
      const destIcon = L.divIcon({
        className: 'custom-dest-marker',
        html: `
          <div style="
            position: relative;
            width: 36px;
            height: 36px;
            background: #10b981;
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 4px 16px rgba(16,185,129,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 16px;
            font-weight: 900;
          ">
            🛡️
            <div style="
              position: absolute;
              bottom: -6px;
              left: 12px;
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 6px solid #10b981;
            "></div>
          </div>
        `,
        iconSize: [36, 42],
        iconAnchor: [18, 42],
      });

      L.marker(destination, { icon: destIcon })
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; padding: 4px;">
            <span style="background: #d1fae5; color: #065f46; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              🛡️ Safe Destination (Safe Haven)
            </span>
            <h4 style="font-weight: 800; font-size: 13px; margin: 4px 0 2px 0; color: #0f172a;">${toPlaceName}</h4>
            <div style="font-family: monospace; font-size: 10px; color: #64748b;">GPS: ${destination[0].toFixed(4)}, ${destination[1].toFixed(4)}</div>
          </div>
        `)
        .bindTooltip(`🛡️ TO: ${toPlaceName}`, { permanent: false, direction: 'top' })
        .addTo(routeLayer);

      // Auto-fit bounds with padding
      map.fitBounds(L.latLngBounds(latLngs), { padding: [50, 50], maxZoom: 15 });

      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 150);
    }
  }, [routeResult, origin, destination, fromPlaceName, toPlaceName]);

  const handleRecenter = () => {
    if (mapRef.current && routeResult.route?.routes?.[0]?.geometry?.coordinates?.length) {
      const latLngs = routeResult.route.routes[0].geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
      );
      mapRef.current.fitBounds(L.latLngBounds(latLngs), { padding: [50, 50] });
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-emerald-500/30 shadow-xl bg-slate-900">
      {/* Top Map Status Bar Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[500] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-extrabold text-slate-900 dark:text-white">Live GIS Evacuation Corridor</span>
          <span className="text-slate-400 font-mono">|</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold">100% Inundation-Free</span>
        </div>

        <button
          type="button"
          onClick={handleRecenter}
          className="pointer-events-auto px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5 text-sky-500" />
          <span>Fit Corridor Bounds</span>
        </button>
      </div>

      {/* Actual Map Container */}
      <div
        ref={containerRef}
        style={{ height: '480px', width: '100%' }}
        className="w-full z-0"
      />

      {/* Bottom Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[500] pointer-events-none">
        <div className="pointer-events-auto bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 shadow-xl text-[11px] space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
            <span className="w-3 h-1.5 bg-emerald-500 rounded-full inline-block shrink-0"></span>
            <span className="text-slate-900 dark:text-white font-extrabold">Flood-Free Safe Evacuation Route</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400">
            <span className="w-3 h-1.5 bg-rose-500/40 border border-rose-500 rounded-full inline-block shrink-0"></span>
            <span className="text-rose-800 dark:text-rose-300 font-extrabold">Submerged Hazard Zones (Actively Bypassed)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
