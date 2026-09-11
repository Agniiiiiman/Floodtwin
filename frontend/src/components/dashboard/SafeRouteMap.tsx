'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RouteResponse } from '@/types';

interface SafeRouteMapProps {
  routeResult: RouteResponse;
  origin: [number, number];
  destination: [number, number];
}

export function SafeRouteMap({ routeResult, origin, destination }: SafeRouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: false }).setView(origin, 14);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    routeLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      routeLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = routeLayerRef.current;
    const coordinates = routeResult.route?.routes?.[0]?.geometry?.coordinates;
    if (!map || !layer || !coordinates?.length) return;

    layer.clearLayers();
    const latLngs = coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);

    // Outer glow line
    L.polyline(latLngs, { color: '#059669', weight: 8, opacity: 0.35 }).addTo(layer);
    // Inner vibrant line
    L.polyline(latLngs, { color: '#10b981', weight: 4.5, opacity: 1 }).addTo(layer);

    // Origin marker
    L.circleMarker(origin, { radius: 8, fillColor: '#0284c7', color: '#ffffff', weight: 2.5, fillOpacity: 1 })
      .bindPopup('<b>Starting Point (Origin)</b>')
      .bindTooltip('Origin (Departure)', { permanent: false })
      .addTo(layer);

    // Destination marker
    L.circleMarker(destination, { radius: 9, fillColor: '#10b981', color: '#ffffff', weight: 2.5, fillOpacity: 1 })
      .bindPopup('<b>Safe Haven / Evacuation Center</b>')
      .bindTooltip('Destination (Safe Haven)', { permanent: false })
      .addTo(layer);

    map.fitBounds(L.latLngBounds(latLngs), { padding: [32, 32] });
  }, [routeResult, origin, destination]);

  return <div ref={containerRef} className="h-72 sm:h-80 w-full overflow-hidden rounded-2xl border border-emerald-500/30 shadow-inner" />;
}
