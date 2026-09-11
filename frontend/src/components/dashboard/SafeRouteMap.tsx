'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RouteResponse } from '@/types';

interface SafeRouteMapProps {
  routeResult: RouteResponse;
  origin: [number, number];
  destination: [number, number];
  fromPlaceName?: string;
  toPlaceName?: string;
}

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

  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy existing instance safely if any
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const container = containerRef.current as HTMLDivElement & { _leaflet_id?: number };
    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    try {
      const map = L.map(containerRef.current, { zoomControl: false }).setView(origin, 14);
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      routeLayerRef.current = L.layerGroup().addTo(map);

      // Render coordinates
      const coordinates = routeResult.route?.routes?.[0]?.geometry?.coordinates;
      if (coordinates?.length && routeLayerRef.current) {
        const latLngs = coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);

        // Outer glow halo line
        L.polyline(latLngs, { color: '#059669', weight: 8, opacity: 0.4 }).addTo(routeLayerRef.current);
        // Inner vibrant line
        L.polyline(latLngs, { color: '#10b981', weight: 4.5, opacity: 1 }).addTo(routeLayerRef.current);

        // Departure marker
        L.circleMarker(origin, {
          radius: 9,
          fillColor: '#0284c7',
          color: '#ffffff',
          weight: 3,
          fillOpacity: 1,
        })
          .bindPopup(`<div style="font-size: 12px; font-family: sans-serif;"><b>📍 FROM (Departure)</b><br/>${fromPlaceName}</div>`)
          .bindTooltip(`📍 FROM: ${fromPlaceName}`, { permanent: false, direction: 'top' })
          .addTo(routeLayerRef.current);

        // Destination marker
        L.circleMarker(destination, {
          radius: 10,
          fillColor: '#10b981',
          color: '#ffffff',
          weight: 3,
          fillOpacity: 1,
        })
          .bindPopup(`<div style="font-size: 12px; font-family: sans-serif;"><b>🛡️ TO (Safe Haven)</b><br/>${toPlaceName}</div>`)
          .bindTooltip(`🛡️ TO: ${toPlaceName}`, { permanent: false, direction: 'top' })
          .addTo(routeLayerRef.current);

        map.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40] });
      }
    } catch (err) {
      console.warn('Map rendering note:', err);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      routeLayerRef.current = null;
    };
  }, [routeResult, origin, destination, fromPlaceName, toPlaceName]);

  return (
    <div
      ref={containerRef}
      className="h-72 sm:h-96 w-full overflow-hidden rounded-2xl border border-emerald-500/30 shadow-inner relative z-0 bg-slate-100 dark:bg-slate-950"
    />
  );
}
