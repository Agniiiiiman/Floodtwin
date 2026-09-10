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
    L.polyline(latLngs, { color: '#10b981', weight: 5, opacity: 0.9 }).addTo(layer);
    L.circleMarker(origin, { radius: 7, fillColor: '#38bdf8', color: '#fff', weight: 2, fillOpacity: 1 })
      .bindTooltip('Origin')
      .addTo(layer);
    L.circleMarker(destination, { radius: 7, fillColor: '#ef4444', color: '#fff', weight: 2, fillOpacity: 1 })
      .bindTooltip('Destination')
      .addTo(layer);
    map.fitBounds(L.latLngBounds(latLngs), { padding: [24, 24] });
  }, [routeResult, origin, destination]);

  return <div ref={containerRef} className="h-56 w-full overflow-hidden rounded-xl border border-emerald-500/25" />;
}
