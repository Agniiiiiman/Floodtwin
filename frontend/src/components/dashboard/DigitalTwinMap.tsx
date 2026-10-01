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

export interface ManholeNode {
  id: string;
  name: string;
  coords: [number, number]; // [lat, lng]
  waterLevelPercent: number;
  waterLevelMeters: number;
  maxDepthMeters: number;
  flowRate: number; // m³/s
  connectedPipe: string;
  status: 'Normal' | 'Warning' | 'Overflow';
  pathway: Array<[number, number]>; // [lat, lng] branch conduit
  trunkNodeId: string;
}

const SURGE_ZONE_MANHOLES: ManholeNode[] = [
  {
    id: 'MH-01',
    name: 'Nana Chowk Junction',
    coords: [18.9635, 72.8152],
    waterLevelPercent: 45,
    waterLevelMeters: 0.90,
    maxDepthMeters: 2.0,
    flowRate: 0.72,
    connectedPipe: 'PIPE-NC-SEC-01',
    status: 'Normal',
    pathway: [
      [18.9635, 72.8152],
      [18.9622, 72.8188],
      [18.9600, 72.8200],
    ],
    trunkNodeId: 'Node 01 (Girgaon Basin)',
  },
  {
    id: 'MH-02',
    name: 'Tardeo Central Crossing',
    coords: [18.9668, 72.8168],
    waterLevelPercent: 76,
    waterLevelMeters: 1.52,
    maxDepthMeters: 2.0,
    flowRate: 1.45,
    connectedPipe: 'PIPE-TD-SEC-02',
    status: 'Warning',
    pathway: [
      [18.9668, 72.8168],
      [18.9635, 72.8152],
    ],
    trunkNodeId: 'Node 01 via Nana Chowk',
  },
  {
    id: 'MH-03',
    name: 'Lamington Road North',
    coords: [18.9652, 72.8202],
    waterLevelPercent: 52,
    waterLevelMeters: 1.04,
    maxDepthMeters: 2.0,
    flowRate: 0.88,
    connectedPipe: 'PIPE-LM-SEC-03',
    status: 'Normal',
    pathway: [
      [18.9652, 72.8202],
      [18.9622, 72.8188],
      [18.9610, 72.8220],
    ],
    trunkNodeId: 'Node 02 (Grant Road)',
  },
  {
    id: 'MH-04',
    name: 'Grant Road West Branch',
    coords: [18.9622, 72.8188],
    waterLevelPercent: 79,
    waterLevelMeters: 1.58,
    maxDepthMeters: 2.0,
    flowRate: 1.62,
    connectedPipe: 'PIPE-GR-SEC-04',
    status: 'Warning',
    pathway: [
      [18.9622, 72.8188],
      [18.9600, 72.8200],
    ],
    trunkNodeId: 'Node 01 (Girgaon Basin)',
  },
  {
    id: 'MH-05',
    name: 'Opera House Feeder',
    coords: [18.9532, 72.8162],
    waterLevelPercent: 38,
    waterLevelMeters: 0.76,
    maxDepthMeters: 2.0,
    flowRate: 0.58,
    connectedPipe: 'PIPE-OH-SEC-05',
    status: 'Normal',
    pathway: [
      [18.9532, 72.8162],
      [18.9558, 72.8175],
    ],
    trunkNodeId: 'Node 01 via Gaiwadi',
  },
  {
    id: 'MH-06',
    name: 'Charni Road Station Link',
    coords: [18.9518, 72.8190],
    waterLevelPercent: 74,
    waterLevelMeters: 1.48,
    maxDepthMeters: 2.0,
    flowRate: 1.34,
    connectedPipe: 'PIPE-CR-SEC-06',
    status: 'Warning',
    pathway: [
      [18.9518, 72.8190],
      [18.9558, 72.8175],
    ],
    trunkNodeId: 'Node 01 via Gaiwadi',
  },
  {
    id: 'MH-07',
    name: 'Girgaon Gaiwadi Cross',
    coords: [18.9558, 72.8175],
    waterLevelPercent: 58,
    waterLevelMeters: 1.16,
    maxDepthMeters: 2.0,
    flowRate: 1.05,
    connectedPipe: 'PIPE-GG-SEC-07',
    status: 'Normal',
    pathway: [
      [18.9558, 72.8175],
      [18.9576, 72.8188],
    ],
    trunkNodeId: 'Node 01 via Khetwadi',
  },
  {
    id: 'MH-08',
    name: 'Khetwadi 4th Lane Junction',
    coords: [18.9576, 72.8188],
    waterLevelPercent: 92,
    waterLevelMeters: 1.84,
    maxDepthMeters: 2.0,
    flowRate: 2.18,
    connectedPipe: 'PIPE-KW-SEC-08',
    status: 'Overflow',
    pathway: [
      [18.9576, 72.8188],
      [18.9600, 72.8200],
    ],
    trunkNodeId: 'Node 01 (Girgaon Basin)',
  },
  {
    id: 'MH-09',
    name: 'Bellasis Road Central',
    coords: [18.9678, 72.8232],
    waterLevelPercent: 48,
    waterLevelMeters: 0.96,
    maxDepthMeters: 2.0,
    flowRate: 0.82,
    connectedPipe: 'PIPE-BL-SEC-09',
    status: 'Normal',
    pathway: [
      [18.9678, 72.8232],
      [18.9642, 72.8258],
    ],
    trunkNodeId: 'Node 03 via Kamathipura',
  },
  {
    id: 'MH-10',
    name: 'Kamathipura 12th Lane',
    coords: [18.9642, 72.8258],
    waterLevelPercent: 71,
    waterLevelMeters: 1.42,
    maxDepthMeters: 2.0,
    flowRate: 1.28,
    connectedPipe: 'PIPE-KP-SEC-10',
    status: 'Warning',
    pathway: [
      [18.9642, 72.8258],
      [18.9618, 72.8248],
    ],
    trunkNodeId: 'Node 03 via Alexandria',
  },
  {
    id: 'MH-11',
    name: 'Alexandria Road Confluence',
    coords: [18.9618, 72.8248],
    waterLevelPercent: 62,
    waterLevelMeters: 1.24,
    maxDepthMeters: 2.0,
    flowRate: 1.15,
    connectedPipe: 'PIPE-AL-SEC-11',
    status: 'Normal',
    pathway: [
      [18.9618, 72.8248],
      [18.9595, 72.8245],
    ],
    trunkNodeId: 'Node 03 (Nagpada Siphon)',
  },
  {
    id: 'MH-12',
    name: 'Two Tanks (Do Taki) Junction',
    coords: [18.9572, 72.8252],
    waterLevelPercent: 94,
    waterLevelMeters: 1.88,
    maxDepthMeters: 2.0,
    flowRate: 2.35,
    connectedPipe: 'PIPE-DT-SEC-12',
    status: 'Overflow',
    pathway: [
      [18.9572, 72.8252],
      [18.9595, 72.8245],
    ],
    trunkNodeId: 'Node 03 (Nagpada Siphon)',
  },
  {
    id: 'MH-13',
    name: 'Null Bazar Market Cross',
    coords: [18.9538, 72.8236],
    waterLevelPercent: 78,
    waterLevelMeters: 1.56,
    maxDepthMeters: 2.0,
    flowRate: 1.48,
    connectedPipe: 'PIPE-NB-SEC-13',
    status: 'Warning',
    pathway: [
      [18.9538, 72.8236],
      [18.9572, 72.8252],
    ],
    trunkNodeId: 'Node 03 via Do Taki',
  },
  {
    id: 'MH-14',
    name: 'Bapu Khote Street Branch',
    coords: [18.9530, 72.8275],
    waterLevelPercent: 36,
    waterLevelMeters: 0.72,
    maxDepthMeters: 2.0,
    flowRate: 0.62,
    connectedPipe: 'PIPE-BK-SEC-14',
    status: 'Normal',
    pathway: [
      [18.9530, 72.8275],
      [18.9552, 72.8288],
    ],
    trunkNodeId: 'Node 05 via Pydhonie',
  },
  {
    id: 'MH-15',
    name: 'Pydhonie Connector',
    coords: [18.9552, 72.8288],
    waterLevelPercent: 60,
    waterLevelMeters: 1.20,
    maxDepthMeters: 2.0,
    flowRate: 1.10,
    connectedPipe: 'PIPE-PY-SEC-15',
    status: 'Normal',
    pathway: [
      [18.9552, 72.8288],
      [18.9560, 72.8300],
    ],
    trunkNodeId: 'Node 05 (Masjid Bunder)',
  },
  {
    id: 'MH-16',
    name: 'J.J. Hospital South Corridor',
    coords: [18.9632, 72.8288],
    waterLevelPercent: 55,
    waterLevelMeters: 1.10,
    maxDepthMeters: 2.0,
    flowRate: 0.95,
    connectedPipe: 'PIPE-JJ-SEC-16',
    status: 'Normal',
    pathway: [
      [18.9632, 72.8288],
      [18.9608, 72.8278],
    ],
    trunkNodeId: 'Node 04 via Nagpada North',
  },
  {
    id: 'MH-17',
    name: 'Nagpada Junction North',
    coords: [18.9608, 72.8278],
    waterLevelPercent: 81,
    waterLevelMeters: 1.62,
    maxDepthMeters: 2.0,
    flowRate: 1.74,
    connectedPipe: 'PIPE-NN-SEC-17',
    status: 'Warning',
    pathway: [
      [18.9608, 72.8278],
      [18.9580, 72.8270],
    ],
    trunkNodeId: 'Node 04 (Chinch Bunder)',
  },
  {
    id: 'MH-18',
    name: 'Sandhurst Road West Feeder',
    coords: [18.9586, 72.8302],
    waterLevelPercent: 44,
    waterLevelMeters: 0.88,
    maxDepthMeters: 2.0,
    flowRate: 0.70,
    connectedPipe: 'PIPE-SR-SEC-18',
    status: 'Normal',
    pathway: [
      [18.9586, 72.8302],
      [18.9560, 72.8300],
    ],
    trunkNodeId: 'Node 05 (Masjid Bunder)',
  },
];

export default function DigitalTwinMap({
  drainageData,
  streetRiskData,
  pilotCoords = [18.96, 72.82],
}: DigitalTwinMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const drainageLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const manholesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const [showManholes, setShowManholes] = useState(true);
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

    // Create a LayerGroup for manholes and secondary pipelines
    const manholeGroup = L.layerGroup().addTo(map);
    manholesLayerGroupRef.current = manholeGroup;

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

  // Render Manholes & Secondary Branch Pipelines conditionally inside Surge Zone
  useEffect(() => {
    if (!mapInstanceRef.current || !manholesLayerGroupRef.current) return;
    const group = manholesLayerGroupRef.current;
    group.clearLayers();

    if (!showManholes) return;

    // 1. Render Secondary Underground Connection Pipes (thin cyan lines leading to nearest main pipeline branch)
    SURGE_ZONE_MANHOLES.forEach((mh) => {
      // Ambient cyan glow along the underground secondary branch
      const pipeGlow = L.polyline(mh.pathway, {
        color: '#06b6d4',
        weight: 4.5,
        opacity: 0.3,
        lineCap: 'round',
        lineJoin: 'round',
      });
      group.addLayer(pipeGlow);

      // Thinner active cyan pipe line with animated dash
      const pipeLine = L.polyline(mh.pathway, {
        color: '#22d3ee',
        weight: 2.2,
        opacity: 0.95,
        dashArray: '4, 6',
        className: 'secondary-drainage-pipe',
        lineCap: 'round',
        lineJoin: 'round',
      }).bindPopup(`
        <div style="padding: 6px 8px; font-family: inherit; font-size: 11px; min-width: 190px;">
          <div style="color: #22d3ee; font-weight: 700; display: flex; align-items: center; gap: 5px;">
            <span>⚡</span>
            <span>Secondary Lateral Pipe</span>
          </div>
          <div style="color: #f1f5f9; margin-top: 4px;">Conduit ID: <b style="font-family: monospace; color: #38bdf8;">${mh.connectedPipe}</b></div>
          <div style="color: #94a3b8; font-size: 10px; margin-top: 3px;">
            Routing: <b style="color: #cbd5e1;">${mh.id}</b> ➔ <b style="color: #38bdf8;">${mh.trunkNodeId}</b>
          </div>
        </div>
      `);
      group.addLayer(pipeLine);
    });

    // 2. Render Circular Glowing Manhole Markers
    SURGE_ZONE_MANHOLES.forEach((mh) => {
      const statusClass =
        mh.status === 'Overflow'
          ? 'status-overflow'
          : mh.status === 'Warning'
          ? 'status-warning'
          : 'status-normal';

      const manholeIcon = L.divIcon({
        className: 'manhole-marker-wrap',
        html: `
          <div class="manhole-icon-circle ${statusClass}" title="${mh.id} · ${mh.name}">
            <div class="manhole-halo"></div>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2v20" />
              <path d="M2 12h20" />
              <path d="M4.93 4.93l14.14 14.14" />
              <path d="M4.93 19.07l14.14-14.14" />
            </svg>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      });

      const badge =
        mh.status === 'Overflow'
          ? { bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: 'rgba(239, 68, 68, 0.5)', barColor: '#ef4444' }
          : mh.status === 'Warning'
          ? { bg: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.5)', barColor: '#f59e0b' }
          : { bg: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: 'rgba(16, 185, 129, 0.5)', barColor: '#10b981' };

      const marker = L.marker(mh.coords, { icon: manholeIcon }).bindPopup(`
        <div style="padding: 6px 8px; font-family: inherit; min-width: 220px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(56, 189, 248, 0.25); padding-bottom: 5px; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 13px;">🌀</span>
              <b style="color: #38bdf8; font-size: 13px; font-family: monospace;">${mh.id}</b>
            </div>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 9999px; text-transform: uppercase; background: ${badge.bg}; color: ${badge.color}; border: 1px solid ${badge.border};">
              ${mh.status}
            </span>
          </div>
          
          <div style="font-size: 11px; color: #f1f5f9; font-weight: 600; margin-bottom: 6px;">
            ${mh.name}
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px;">
            <div>
              <div style="display: flex; justify-content: space-between; color: #94a3b8; font-size: 10px; margin-bottom: 2px;">
                <span>Water level:</span>
                <b style="color: #ffffff;">${mh.waterLevelPercent}% (${mh.waterLevelMeters.toFixed(2)}m / ${mh.maxDepthMeters}m)</b>
              </div>
              <div style="width: 100%; height: 5px; background: rgba(15, 23, 42, 0.8); border-radius: 3px; overflow: hidden; border: 0.5px solid rgba(255,255,255,0.1);">
                <div style="width: ${mh.waterLevelPercent}%; height: 100%; background: ${badge.barColor}; border-radius: 3px;"></div>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; margin-top: 2px;">
              <span style="color: #94a3b8;">Flow rate:</span>
              <b style="color: #38bdf8; font-family: monospace;">${mh.flowRate.toFixed(2)} m³/s</b>
            </div>

            <div style="display: flex; justify-content: space-between;">
              <span style="color: #94a3b8;">Connected pipe:</span>
              <b style="color: #e2e8f0; font-family: monospace; font-size: 10px;">${mh.connectedPipe}</b>
            </div>

            <div style="display: flex; justify-content: space-between; border-top: 1px solid rgba(148, 163, 184, 0.15); padding-top: 4px; margin-top: 3px;">
              <span style="color: #94a3b8; font-size: 10px;">Feeds into:</span>
              <span style="color: #67e8f9; font-size: 10px; font-weight: 600;">${mh.trunkNodeId}</span>
            </div>
          </div>
        </div>
      `);
      group.addLayer(marker);
    });
  }, [showManholes]);

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
          {/* Manholes Network Layer Toggle Button */}
          <button
            onClick={() => setShowManholes((prev) => !prev)}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all shadow-md cursor-pointer ${
              showManholes
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.35)]'
                : 'glass-panel text-slate-400 hover:text-slate-200 border border-slate-700/60'
            }`}
            title="Toggle Drainage Manholes & Secondary Underground Network"
          >
            <svg
              className={`w-3.5 h-3.5 shrink-0 ${showManholes ? 'text-cyan-400' : 'text-slate-400'}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              <line x1="4.93" y1="19.07" x2="19.07" y2="4.93" />
            </svg>
            <span className="hidden sm:inline font-semibold">Manholes</span>
            <span
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                showManholes ? 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]' : 'bg-slate-500'
              }`}
            />
          </button>

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
        {showManholes && (
          <>
            <div className="flex items-center space-x-1.5 border-l border-slate-700 pl-3">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-white shadow-[0_0_6px_#22d3ee]" />
              <span className="text-cyan-300 font-medium">Manholes</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-4 h-0.5 border-t-2 border-dashed border-cyan-400" />
              <span className="text-slate-300">Secondary Pipes</span>
            </div>
          </>
        )}
        <div className="border-l border-slate-700 pl-3 text-amber-300 font-mono">Live Simulation</div>
      </div>
    </div>
  );
}
