'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { DrainageGeoJSON, StreetRiskResponse } from '@/types';
import { Layers, MapPin, Crosshair, RefreshCw, AlertCircle } from 'lucide-react';

interface DigitalTwinMapProps {
  drainageData?: DrainageGeoJSON | null;
  streetRiskData?: StreetRiskResponse | null;
  pilotCoords?: [number, number]; // [lat, lng]
}

const SEA_OUTFALL_COORDS: [number, number] = [72.8580, 18.9485];

const DEFAULT_DRAINAGE: DrainageGeoJSON = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [72.82, 18.96] }, properties: { id: 'node_01', type: 'manhole', capacity: 4.0, capacity_unit: 'm3/s', current_load: 1.8 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [72.822, 18.961] }, properties: { id: 'node_02', type: 'manhole', capacity: 3.5, capacity_unit: 'm3/s', current_load: 2.1 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [72.8245, 18.9595] }, properties: { id: 'node_03', type: 'manhole', capacity: 4.0, capacity_unit: 'm3/s', current_load: 3.8, status: 'congested' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [72.827, 18.958] }, properties: { id: 'node_04', type: 'manhole', capacity: 5.2, capacity_unit: 'm3/s', current_load: 2.7 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [72.83, 18.956] }, properties: { id: 'node_05', type: 'manhole', capacity: 6.0, capacity_unit: 'm3/s', current_load: 3.0 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [72.8355, 18.954] }, properties: { id: 'node_06', type: 'manhole', capacity: 7.5, capacity_unit: 'm3/s', current_load: 3.5 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [72.842, 18.9525] }, properties: { id: 'node_07', type: 'manhole', capacity: 9.0, capacity_unit: 'm3/s', current_load: 4.2 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [72.8485, 18.9515] }, properties: { id: 'node_08', type: 'manhole', capacity: 12.0, capacity_unit: 'm3/s', current_load: 4.8 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [72.8580, 18.9485] }, properties: { id: 'node_09', type: 'outfall', capacity: 16.0, capacity_unit: 'm3/s', current_load: 5.4, name: 'Arabian Sea Marine Outfall' } },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [72.82, 18.96],
          [72.822, 18.961],
          [72.8245, 18.9595],
          [72.827, 18.958],
          [72.83, 18.956],
          [72.8355, 18.954],
          [72.842, 18.9525],
          [72.8485, 18.9515],
          [72.8580, 18.9485],
        ],
      },
      properties: { id: 'pipe_trunk_sea_outfall', type: 'pipe', capacity: 16.0, capacity_unit: 'm3/s', current_load: 5.4 },
    },
  ],
};

export default function DigitalTwinMap({
  drainageData,
  streetRiskData,
  pilotCoords = [18.96, 72.82],
}: DigitalTwinMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const drainageLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const [isLocating, setIsLocating] = useState(false);

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

    // Centered to frame both the inland impact circle and the eastern sea outfall
    const map = L.map(mapContainerRef.current, {
      center: [18.9550, 72.8390],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add OpenStreetMap base tile layer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    // Add simulated flood risk radius zone (Impact Zone)
    const riskZone = L.circle(pilotCoords, {
      color: '#ef4444',
      fillColor: '#f43f5e',
      fillOpacity: 0.22,
      radius: 1200,
      weight: 1.8,
      dashArray: '5, 8',
    }).addTo(map);

    riskZone.bindPopup(`
      <div style="padding: 4px; font-family: inherit;">
        <h4 style="font-weight: bold; color: #ef4444; margin-bottom: 2px;">⚠️ High Inundation Impact Zone</h4>
        <p style="font-size: 11px; margin: 0; color: #cbd5e1;">South Mumbai Pilot Catchment. Water collects here and is actively drained via the blue trunk into the Arabian Sea.</p>
      </div>
    `);

    // Add Pilot Ward Sensor Marker at center
    const pilotMarker = L.circleMarker(pilotCoords, {
      radius: 8,
      fillColor: '#38bdf8',
      color: '#ffffff',
      weight: 2.5,
      opacity: 1,
      fillOpacity: 0.95,
    }).addTo(map);

    pilotMarker.bindPopup(`
      <div style="padding: 4px; font-family: inherit;">
        <h4 style="font-weight: bold; color: #38bdf8; margin-bottom: 2px;">📍 Pilot Ward Central Sensor</h4>
        <p style="font-size: 11px; margin: 0; color: #cbd5e1;">Ward A/B • Lat: 18.96, Lon: 72.82</p>
        <p style="font-size: 10px; color: #38bdf8; margin-top: 4px;">Hydraulic digital twin telemetry active.</p>
      </div>
    `);

    // Create a LayerGroup for dynamic drainage features
    const drainageGroup = L.layerGroup().addTo(map);
    drainageLayerGroupRef.current = drainageGroup;

    mapInstanceRef.current = map;

    // Fit bounds so entire path from impact zone to Arabian Sea is visible immediately
    const initialBounds = L.latLngBounds([
      [18.9630, 72.8160], // North-West (Impact Zone / Girgaon)
      [18.9460, 72.8620], // South-East (Arabian Sea Marine Outfall)
    ]);
    map.fitBounds(initialBounds, { padding: [30, 30] });

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

  // Update Drainage Overlays when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !drainageLayerGroupRef.current) return;

    const group = drainageLayerGroupRef.current;
    group.clearLayers();

    // Source features from prop or fallback
    let rawFeatures = (drainageData?.features?.length ? drainageData.features : DEFAULT_DRAINAGE.features);

    // Guarantee full conduit path: combine points to form the full continuous line to the sea
    const continuousLineCoords: Array<[number, number]> = [];
    const pointsToRender: Array<{ id: string; type: string; coords: [number, number]; capacity?: number; status?: string; name?: string }> = [];

    // Ensure our standard sequence of nodes is always represented up to Arabian Sea
    const requiredNodes: Array<{ id: string; type: string; coords: [number, number]; name: string; capacity: number; status?: string }> = [
      { id: 'node_01', type: 'manhole', coords: [72.8200, 18.9600], name: 'Girgaon Basin Inundation Collector', capacity: 4.0 },
      { id: 'node_02', type: 'manhole', coords: [72.8220, 18.9610], name: 'Grant Road Junction', capacity: 3.5 },
      { id: 'node_03', type: 'manhole', coords: [72.8245, 18.9595], name: 'Nagpada Siphon (Congested Relief)', capacity: 4.0, status: 'congested' },
      { id: 'node_04', type: 'manhole', coords: [72.8270, 18.9580], name: 'Chinch Bunder Conduit', capacity: 5.2 },
      { id: 'node_05', type: 'manhole', coords: [72.8300, 18.9560], name: 'Masjid Bunder Sluice', capacity: 6.0 },
      { id: 'node_06', type: 'manhole', coords: [72.8355, 18.9540], name: 'Dongri Coastal Conduit (Zone Boundary Exit)', capacity: 7.5 },
      { id: 'node_07', type: 'manhole', coords: [72.8420, 18.9525], name: 'Eastern Freeway & Seawall Gate', capacity: 9.0 },
      { id: 'node_08', type: 'manhole', coords: [72.8485, 18.9515], name: 'Victoria Dock Marine Interceptor', capacity: 12.0 },
      { id: 'node_09', type: 'outfall', coords: [72.8580, 18.9485], name: 'Arabian Sea Deepwater Marine Outfall', capacity: 16.0 },
    ];

    // Collect coordinates for the complete uninterrupted line
    requiredNodes.forEach((node) => {
      continuousLineCoords.push([node.coords[1], node.coords[0]]); // Leaflet uses [lat, lng]
      pointsToRender.push({
        id: node.id,
        type: node.type,
        coords: node.coords,
        capacity: node.capacity,
        status: node.status,
        name: node.name,
      });
    });

    // 1. Ambient outer cyan glow line
    const glowLine = L.polyline(continuousLineCoords, {
      color: '#38bdf8',
      weight: 9,
      opacity: 0.4,
      lineCap: 'round',
      lineJoin: 'round',
    });
    group.addLayer(glowLine);

    // 2. Solid deep blue underground conduit
    const solidLine = L.polyline(continuousLineCoords, {
      color: '#0284c7',
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).bindPopup(`
      <div style="padding: 6px; font-family: inherit;">
        <b style="color: #38bdf8; font-size: 13px;">🌊 Subterranean Gravity Outfall Trunk</b>
        <div style="font-size: 11px; color: #cbd5e1; margin-top: 3px;">
          Actively evacuates surface water accumulation from the 1.2km surge impact zone directly into the Arabian Sea.
        </div>
        <div style="font-size: 10px; color: #34d399; margin-top: 4px; font-weight: 600;">
          Status: Operational · Gravity Flushing directly into open marine waters
        </div>
      </div>
    `);
    group.addLayer(solidLine);

    // 3. Dynamic Animated Water Flow Dash Overlay (rushes forward out of the zone directly into the sea)
    const flowLine = L.polyline(continuousLineCoords, {
      color: '#ffffff',
      weight: 3,
      opacity: 0.95,
      dashArray: '8, 14',
      className: 'water-flow-line',
      lineCap: 'round',
      lineJoin: 'round',
    });
    group.addLayer(flowLine);

    // 4. Render Nodes and the special Marine Outfall marker
    pointsToRender.forEach((node) => {
      const [lng, lat] = node.coords;

      if (node.type === 'outfall' || node.id === 'node_09') {
        // Deep Sea Outfall with animated ripple waves and a permanent floating label
        const outfallIcon = L.divIcon({
          className: 'sea-outfall-marker-container',
          html: `
            <div style="position: relative; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; transform: translate(-25px, -25px);">
              <div class="sea-outfall-ripple"></div>
              <div class="sea-outfall-ripple-delayed"></div>
              <div style="width: 26px; height: 26px; border-radius: 50%; background: radial-gradient(circle, #38bdf8 0%, #0284c7 100%); border: 2.5px solid #ffffff; box-shadow: 0 0 16px rgba(56, 189, 248, 0.95); display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer;">
                🌊
              </div>
            </div>
          `,
          iconSize: [50, 50],
          iconAnchor: [25, 25],
        });

        const outfallMarker = L.marker([lat, lng], { icon: outfallIcon })
          .bindTooltip('🌊 Arabian Sea Outfall (Direct Discharge)', {
            permanent: true,
            direction: 'top',
            className: 'sea-outfall-label',
            offset: [0, -22],
          })
          .bindPopup(`
            <div style="padding: 6px; font-family: inherit; min-width: 220px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="font-size: 16px;">🌊</span>
                <b style="color: #38bdf8; font-size: 13px;">Arabian Sea Deepwater Outfall</b>
              </div>
              <div style="font-size: 11px; color: #34d399; font-weight: 700; margin-bottom: 4px;">
                ● Direct Marine Discharge Point
              </div>
              <div style="font-size: 11px; color: #cbd5e1; line-height: 1.4;">
                Floodwater from the 1.2km inundation impact zone is conveyed through the underground trunk and drops directly into the sea.
              </div>
              <div style="font-size: 10px; color: #94a3b8; margin-top: 5px; border-top: 1px solid rgba(148, 163, 184, 0.2); padding-top: 4px;">
                Outfall Peak Capacity: <b>${node.capacity || 16.0} m³/s</b> · Depth: <b>Deep Marine Sink (Sea Level)</b>
              </div>
            </div>
          `);
        group.addLayer(outfallMarker);
      } else {
        // Standard collector / sensor node along the route
        const isCongested = node.status === 'congested';
        const isOutsideImpact = lng > 72.831;

        const marker = L.circleMarker([lat, lng], {
          radius: 6,
          fillColor: isCongested ? '#f59e0b' : isOutsideImpact ? '#06b6d4' : '#38bdf8',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 0.95,
        }).bindPopup(`
          <div style="padding: 4px; font-family: inherit;">
            <b style="color: #38bdf8;">${node.name || node.id}</b>
            <div style="font-size: 11px; color: ${isOutsideImpact ? '#38bdf8' : '#94a3b8'}">
              ${isOutsideImpact ? '🌊 Coastal Exit Conduit (Flowing to Sea)' : '📍 Inundation Catchment Node'}
            </div>
            <div style="font-size: 11px; color: #cbd5e1; margin-top: 2px;">
              Capacity: <b>${node.capacity} m³/s</b>
            </div>
            <div style="font-size: 10px; color: #fbbf24; margin-top: 2px;">Status: ${node.status || 'normal'}</div>
          </div>
        `);
        group.addLayer(marker);
      }
    });

    // Ensure the map shows both the impact zone and the sea drop point
    const allBounds = L.latLngBounds([
      [18.9630, 72.8160], // North-West (Impact Zone / Girgaon)
      [18.9460, 72.8620], // South-East (Arabian Sea Marine Outfall)
    ]);
    mapInstanceRef.current.fitBounds(allBounds, { padding: [30, 30] });
  }, [drainageData]);

  useEffect(() => {
    if (!mapInstanceRef.current || !streetRiskData?.segments) return;
    const group = drainageLayerGroupRef.current;
    if (!group) return;
    streetRiskData.segments.forEach((segment) => {
      const coords = segment.geometry.coordinates.map(
        (coordinate): [number, number] => [coordinate[1], coordinate[0]]
      );
      const color = segment.risk === 'Critical' ? '#ef4444' : segment.risk === 'High' ? '#f97316' : segment.risk === 'Medium' ? '#f59e0b' : '#10b981';
      const streetLayer = L.polyline(coords, { color, weight: segment.risk === 'Critical' || segment.risk === 'High' ? 7 : 5, opacity: 0.95 })
        .bindPopup(`
          <div style="padding: 4px; max-width: 260px; font-family: inherit;">
            <b style="color:${color}">${segment.name}</b>
            <div style="font-size: 11px; color: #f8fafc; margin-top: 4px;">Risk: ${segment.risk} · Indicative depth: ${segment.indicative_depth_range}</div>
            <div style="font-size: 11px; color: #cbd5e1;">Confidence: ${segment.confidence}</div>
            <div style="font-size: 11px; color: #cbd5e1; margin-top: 5px;"><b>Why?</b> ${segment.explanation}</div>
            <div style="font-size: 10px; color: #fbbf24; margin-top: 5px;">Last updated from synthetic pilot model · uncalibrated_demo</div>
          </div>
        `);
      group.addLayer(streetLayer);
    });
  }, [streetRiskData]);

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
            <div style="padding: 4px; font-family: inherit;">
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
      const allBounds = L.latLngBounds([
        [18.9630, 72.8160], // North-West (Impact Zone / Girgaon)
        [18.9460, 72.8620], // South-East (Arabian Sea Marine Outfall)
      ]);
      mapInstanceRef.current.fitBounds(allBounds, { padding: [30, 30] });
    }
  };

  return (
    <div className="relative w-full h-[360px] sm:h-[450px] lg:h-[500px] rounded-2xl overflow-hidden glass-panel border border-sky-500/20 shadow-2xl">
      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Map Action Bar */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-[400] flex items-center justify-between pointer-events-none gap-2">
        <div className="glass-panel px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-sky-500/30 flex items-center space-x-1.5 sm:space-x-2 pointer-events-auto shadow-md">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-[11px] sm:text-xs font-semibold text-white tracking-wide truncate">
            Ward Twin Mesh
          </span>
          <span className="hidden md:inline-block text-[10px] text-sky-400 font-medium pl-1 border-l border-slate-700">
            Water Discharge ➔ Arabian Sea
          </span>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2 pointer-events-auto">
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="glass-panel hover:glass-panel-glow p-2 sm:px-3 sm:py-1.5 rounded-xl text-sky-400 hover:text-white border border-sky-500/30 text-xs font-medium flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
            title="Center on My Location"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">My GPS</span>
          </button>

          <button
            onClick={handleResetPilot}
            className="glass-panel hover:glass-panel-glow p-2 sm:px-3 sm:py-1.5 rounded-xl text-slate-300 hover:text-white border border-sky-500/30 text-xs font-medium flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
            title="Reset to Pilot Ward (South Mumbai)"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">South Mumbai</span>
          </button>
        </div>
      </div>

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-[400] pointer-events-auto glass-panel p-2 sm:p-2.5 rounded-xl border border-sky-500/20 text-[10px] sm:text-[11px] hidden sm:flex items-center space-x-3 sm:space-x-4">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
          <span className="text-slate-300">Sensor Nodes</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-5 h-1.5 bg-sky-500 rounded relative overflow-hidden flex items-center">
            <div className="w-2 h-full bg-white animate-pulse" />
          </div>
          <span className="text-slate-300">Underground Trunk (Flows to Sea)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-xs">🌊</span>
          <span className="text-sky-300 font-semibold">Arabian Sea Outfall</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/40 border border-rose-500" />
          <span className="text-slate-300">Surge Zone</span>
        </div>
        <div className="border-l border-slate-700 pl-3 text-amber-300 font-mono">Live Simulation</div>
      </div>
    </div>
  );
}
