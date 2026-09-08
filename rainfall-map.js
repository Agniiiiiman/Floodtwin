/* =====================================================
   WORLD RAINFALL MAP — REAL-TIME DATA ENGINE
   Uses Open-Meteo API (free, no API key required)
   Fetches actual current precipitation for ~130 global sectors

   FIX (2026-09-08):
   - Wrapped in IIFE to avoid 'toastTimer already declared'
     SyntaxError caused by script.js declaring the same var
     at global scope.  Both files were loaded on rainfall-map.html.
   - Multi-location batched fetching (up to 50 coords/request)
     instead of 130 individual HTTP requests.
   - Request timeout handling (12 s per batch).
   - Retry button + error overlay state.
   - Data timestamp shown in popups and last-update bar.
===================================================== */

/* =====================================================
   THEME TOGGLE  (dark / light — rainfall map)
   Default: dark.  Synced via localStorage with main site.
===================================================== */

(function () {

    const STORAGE_KEY = "floodtwin-theme";
    const html        = document.documentElement;

    /* Apply saved or default theme immediately — no flash */
    const saved = localStorage.getItem(STORAGE_KEY) || "dark";
    html.setAttribute("data-theme", saved);

    document.addEventListener("DOMContentLoaded", () => {

        const btn = document.getElementById("themeToggle");
        if (!btn) return;

        btn.addEventListener("click", () => {

            const current = html.getAttribute("data-theme") || "dark";
            const next    = current === "dark" ? "light" : "dark";

            html.setAttribute("data-theme", next);
            localStorage.setItem(STORAGE_KEY, next);

            /* Invalidate tile sizes so Leaflet repaints correctly */
            if (window.RainfallMap && window.RainfallMap.map) {
                setTimeout(() => window.RainfallMap.map.invalidateSize(), 50);
            }

        });

    });

}());


"use strict";


/* =====================================================
   MAIN RAINFALL MAP MODULE
   Wrapped in an IIFE so private state (toastTimer, etc.)
   does not conflict with script.js globals.
===================================================== */

window.RainfallMap = (function () {


/* ---- GLOBAL SECTOR GRID ---- */
/* 130 cities / major geographic sectors across all continents */
const SECTORS = [
    /* SOUTH/SOUTHEAST ASIA - High monsoon activity */
    { name:"Mumbai",        country:"IN", lat:18.96,  lon:72.82  },
    { name:"Chennai",       country:"IN", lat:13.08,  lon:80.27  },
    { name:"Kolkata",       country:"IN", lat:22.57,  lon:88.36  },
    { name:"Delhi",         country:"IN", lat:28.67,  lon:77.22  },
    { name:"Bangalore",     country:"IN", lat:12.97,  lon:77.59  },
    { name:"Hyderabad",     country:"IN", lat:17.38,  lon:78.47  },
    { name:"Kochi",         country:"IN", lat:9.93,   lon:76.27  },
    { name:"Guwahati",      country:"IN", lat:26.18,  lon:91.74  },
    { name:"Bhubaneswar",   country:"IN", lat:20.27,  lon:85.84  },
    { name:"Thiruvananthapuram",country:"IN",lat:8.52, lon:76.94 },
    { name:"Dhaka",         country:"BD", lat:23.72,  lon:90.41  },
    { name:"Chittagong",    country:"BD", lat:22.34,  lon:91.83  },
    { name:"Colombo",       country:"LK", lat:6.93,   lon:79.85  },
    { name:"Kathmandu",     country:"NP", lat:27.72,  lon:85.32  },
    { name:"Karachi",       country:"PK", lat:24.86,  lon:67.01  },
    { name:"Lahore",        country:"PK", lat:31.55,  lon:74.35  },
    { name:"Bangkok",       country:"TH", lat:13.75,  lon:100.52 },
    { name:"Ho Chi Minh",   country:"VN", lat:10.82,  lon:106.63 },
    { name:"Hanoi",         country:"VN", lat:21.03,  lon:105.85 },
    { name:"Jakarta",       country:"ID", lat:-6.21,  lon:106.85 },
    { name:"Surabaya",      country:"ID", lat:-7.25,  lon:112.75 },
    { name:"Kuala Lumpur",  country:"MY", lat:3.14,   lon:101.69 },
    { name:"Manila",        country:"PH", lat:14.60,  lon:120.98 },
    { name:"Cebu",          country:"PH", lat:10.32,  lon:123.90 },
    { name:"Singapore",     country:"SG", lat:1.35,   lon:103.82 },
    { name:"Yangon",        country:"MM", lat:16.87,  lon:96.19  },
    { name:"Phnom Penh",    country:"KH", lat:11.55,  lon:104.92 },
    { name:"Vientiane",     country:"LA", lat:17.97,  lon:102.61 },

    /* EAST ASIA */
    { name:"Tokyo",         country:"JP", lat:35.69,  lon:139.69 },
    { name:"Osaka",         country:"JP", lat:34.69,  lon:135.50 },
    { name:"Seoul",         country:"KR", lat:37.57,  lon:126.98 },
    { name:"Busan",         country:"KR", lat:35.10,  lon:129.03 },
    { name:"Beijing",       country:"CN", lat:39.91,  lon:116.39 },
    { name:"Shanghai",      country:"CN", lat:31.23,  lon:121.47 },
    { name:"Guangzhou",     country:"CN", lat:23.13,  lon:113.26 },
    { name:"Chengdu",       country:"CN", lat:30.66,  lon:104.07 },
    { name:"Wuhan",         country:"CN", lat:30.58,  lon:114.27 },
    { name:"Hong Kong",     country:"HK", lat:22.32,  lon:114.17 },
    { name:"Taipei",        country:"TW", lat:25.04,  lon:121.57 },
    { name:"Ulaanbaatar",   country:"MN", lat:47.90,  lon:106.90 },

    /* CENTRAL ASIA & MIDDLE EAST */
    { name:"Dubai",         country:"AE", lat:25.20,  lon:55.27  },
    { name:"Riyadh",        country:"SA", lat:24.69,  lon:46.72  },
    { name:"Muscat",        country:"OM", lat:23.61,  lon:58.59  },
    { name:"Tehran",        country:"IR", lat:35.69,  lon:51.39  },
    { name:"Baghdad",       country:"IQ", lat:33.34,  lon:44.40  },
    { name:"Kabul",         country:"AF", lat:34.53,  lon:69.17  },
    { name:"Tashkent",      country:"UZ", lat:41.30,  lon:69.25  },
    { name:"Almaty",        country:"KZ", lat:43.26,  lon:76.95  },

    /* EUROPE */
    { name:"London",        country:"GB", lat:51.51,  lon:-0.13  },
    { name:"Manchester",    country:"GB", lat:53.48,  lon:-2.24  },
    { name:"Glasgow",       country:"GB", lat:55.86,  lon:-4.25  },
    { name:"Dublin",        country:"IE", lat:53.33,  lon:-6.25  },
    { name:"Paris",         country:"FR", lat:48.86,  lon:2.35   },
    { name:"Marseille",     country:"FR", lat:43.30,  lon:5.37   },
    { name:"Berlin",        country:"DE", lat:52.52,  lon:13.40  },
    { name:"Hamburg",       country:"DE", lat:53.55,  lon:10.00  },
    { name:"Munich",        country:"DE", lat:48.14,  lon:11.58  },
    { name:"Amsterdam",     country:"NL", lat:52.37,  lon:4.90   },
    { name:"Brussels",      country:"BE", lat:50.85,  lon:4.35   },
    { name:"Madrid",        country:"ES", lat:40.42,  lon:-3.70  },
    { name:"Barcelona",     country:"ES", lat:41.39,  lon:2.15   },
    { name:"Lisbon",        country:"PT", lat:38.72,  lon:-9.14  },
    { name:"Rome",          country:"IT", lat:41.90,  lon:12.50  },
    { name:"Milan",         country:"IT", lat:45.46,  lon:9.19   },
    { name:"Venice",        country:"IT", lat:45.44,  lon:12.33  },
    { name:"Vienna",        country:"AT", lat:48.21,  lon:16.37  },
    { name:"Zurich",        country:"CH", lat:47.38,  lon:8.54   },
    { name:"Warsaw",        country:"PL", lat:52.23,  lon:21.01  },
    { name:"Stockholm",     country:"SE", lat:59.33,  lon:18.07  },
    { name:"Oslo",          country:"NO", lat:59.91,  lon:10.75  },
    { name:"Bergen",        country:"NO", lat:60.39,  lon:5.32   },
    { name:"Copenhagen",    country:"DK", lat:55.68,  lon:12.57  },
    { name:"Helsinki",      country:"FI", lat:60.17,  lon:24.94  },
    { name:"Athens",        country:"GR", lat:37.98,  lon:23.73  },
    { name:"Istanbul",      country:"TR", lat:41.01,  lon:28.95  },
    { name:"Kyiv",          country:"UA", lat:50.45,  lon:30.52  },
    { name:"Moscow",        country:"RU", lat:55.75,  lon:37.62  },
    { name:"St. Petersburg",country:"RU", lat:59.95,  lon:30.32  },
    { name:"Vladivostok",   country:"RU", lat:43.10,  lon:131.87 },

    /* AFRICA */
    { name:"Lagos",         country:"NG", lat:6.46,   lon:3.38   },
    { name:"Abuja",         country:"NG", lat:9.06,   lon:7.50   },
    { name:"Accra",         country:"GH", lat:5.56,   lon:-0.21  },
    { name:"Nairobi",       country:"KE", lat:-1.29,  lon:36.82  },
    { name:"Mombasa",       country:"KE", lat:-4.05,  lon:39.67  },
    { name:"Dar es Salaam", country:"TZ", lat:-6.79,  lon:39.21  },
    { name:"Kampala",       country:"UG", lat:0.32,   lon:32.59  },
    { name:"Addis Ababa",   country:"ET", lat:9.03,   lon:38.74  },
    { name:"Kinshasa",      country:"CD", lat:-4.33,  lon:15.32  },
    { name:"Dakar",         country:"SN", lat:14.69,  lon:-17.45 },
    { name:"Abidjan",       country:"CI", lat:5.35,   lon:-4.00  },
    { name:"Douala",        country:"CM", lat:4.05,   lon:9.70   },
    { name:"Luanda",        country:"AO", lat:-8.84,  lon:13.23  },
    { name:"Johannesburg",  country:"ZA", lat:-26.20, lon:28.04  },
    { name:"Cape Town",     country:"ZA", lat:-33.92, lon:18.42  },
    { name:"Durban",        country:"ZA", lat:-29.85, lon:31.02  },
    { name:"Khartoum",      country:"SD", lat:15.55,  lon:32.53  },
    { name:"Cairo",         country:"EG", lat:30.06,  lon:31.25  },
    { name:"Casablanca",    country:"MA", lat:33.59,  lon:-7.62  },
    { name:"Tunis",         country:"TN", lat:36.82,  lon:10.18  },
    { name:"Antananarivo",  country:"MG", lat:-18.91, lon:47.54  },

    /* NORTH AMERICA */
    { name:"New York",      country:"US", lat:40.71,  lon:-74.01 },
    { name:"Los Angeles",   country:"US", lat:34.05,  lon:-118.24},
    { name:"Chicago",       country:"US", lat:41.88,  lon:-87.63 },
    { name:"Houston",       country:"US", lat:29.76,  lon:-95.37 },
    { name:"Miami",         country:"US", lat:25.77,  lon:-80.19 },
    { name:"Seattle",       country:"US", lat:47.61,  lon:-122.33},
    { name:"New Orleans",   country:"US", lat:29.95,  lon:-90.07 },
    { name:"Denver",        country:"US", lat:39.74,  lon:-104.98},
    { name:"Phoenix",       country:"US", lat:33.45,  lon:-112.07},
    { name:"Atlanta",       country:"US", lat:33.75,  lon:-84.39 },
    { name:"Boston",        country:"US", lat:42.36,  lon:-71.06 },
    { name:"Dallas",        country:"US", lat:32.79,  lon:-96.80 },
    { name:"Toronto",       country:"CA", lat:43.65,  lon:-79.38 },
    { name:"Vancouver",     country:"CA", lat:49.25,  lon:-123.12},
    { name:"Montreal",      country:"CA", lat:45.50,  lon:-73.57 },
    { name:"Mexico City",   country:"MX", lat:19.43,  lon:-99.13 },
    { name:"Guadalajara",   country:"MX", lat:20.66,  lon:-103.35},
    { name:"Havana",        country:"CU", lat:23.13,  lon:-82.38 },
    { name:"Guatemala City",country:"GT", lat:14.64,  lon:-90.51 },
    { name:"San José",      country:"CR", lat:9.93,   lon:-84.08 },
    { name:"Panama City",   country:"PA", lat:8.99,   lon:-79.52 },

    /* SOUTH AMERICA */
    { name:"São Paulo",     country:"BR", lat:-23.55, lon:-46.63 },
    { name:"Rio de Janeiro",country:"BR", lat:-22.91, lon:-43.17 },
    { name:"Manaus",        country:"BR", lat:-3.10,  lon:-60.02 },
    { name:"Belém",         country:"BR", lat:-1.46,  lon:-48.50 },
    { name:"Recife",        country:"BR", lat:-8.06,  lon:-34.88 },
    { name:"Buenos Aires",  country:"AR", lat:-34.60, lon:-58.38 },
    { name:"Lima",          country:"PE", lat:-12.05, lon:-77.04 },
    { name:"Bogotá",        country:"CO", lat:4.71,   lon:-74.07 },
    { name:"Medellín",      country:"CO", lat:6.22,   lon:-75.57 },
    { name:"Caracas",       country:"VE", lat:10.49,  lon:-66.88 },
    { name:"Quito",         country:"EC", lat:-0.23,  lon:-78.52 },
    { name:"La Paz",        country:"BO", lat:-16.50, lon:-68.15 },
    { name:"Santiago",      country:"CL", lat:-33.46, lon:-70.65 },
    { name:"Montevideo",    country:"UY", lat:-34.90, lon:-56.19 },

    /* OCEANIA */
    { name:"Sydney",        country:"AU", lat:-33.87, lon:151.21 },
    { name:"Melbourne",     country:"AU", lat:-37.81, lon:144.96 },
    { name:"Brisbane",      country:"AU", lat:-27.47, lon:153.03 },
    { name:"Darwin",        country:"AU", lat:-12.46, lon:130.84 },
    { name:"Auckland",      country:"NZ", lat:-36.87, lon:174.77 },
    { name:"Wellington",    country:"NZ", lat:-41.29, lon:174.78 },
    { name:"Port Moresby",  country:"PG", lat:-9.44,  lon:147.18 },
    { name:"Fiji (Suva)",   country:"FJ", lat:-18.14, lon:178.44 },

    /* POLAR / REMOTE */
    { name:"Reykjavik",     country:"IS", lat:64.13,  lon:-21.94 },
    { name:"Anchorage",     country:"US", lat:61.22,  lon:-149.90},
    { name:"Fairbanks",     country:"US", lat:64.84,  lon:-147.72},
    { name:"Tromsø",        country:"NO", lat:69.65,  lon:18.95  },
    { name:"Nuuk",          country:"GL", lat:64.18,  lon:-51.74 },
];

/* ---- STATE ---- */

let map;
let markers          = [];
let sectorData       = [];
let activeLayer      = "rainfall";
let currentFilter    = "all";
let tileLayers       = {};
let refreshTimer;
let isLoading        = false;
let toastTimer;          /* private — no conflict with script.js */


/* ---- MAP INIT ---- */

function initMap() {

    map = L.map("map", {
        center: [20, 10],
        zoom: 2,
        zoomControl: true,
        preferCanvas: true,
        worldCopyJump: false,
    });

    /* Tile layers */
    tileLayers.rainfall = L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution:"&copy; <a href='https://openstreetmap.org'>OpenStreetMap</a> contributors", maxZoom:19 }
    );

    tileLayers.satellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution:"Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community", maxZoom:19 }
    );

    tileLayers.topo = L.tileLayer(
        "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        { attribution:"Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap", maxZoom:17 }
    );

    tileLayers.rainfall.addTo(map);

    document.getElementById("sectorCount").textContent = SECTORS.length;
}


/* ---- RAINFALL COLOR / LABEL ---- */

function rainfallColor(mm) {
    if (mm <= 0)   return { color:"#c8eeff", label:"None",       badge:"#1a3a50", text:"#7dd8ff" };
    if (mm < 1)    return { color:"#7dd8ff", label:"Light",      badge:"#0a2a40", text:"#7dd8ff" };
    if (mm < 5)    return { color:"#29a8e8", label:"Moderate",   badge:"#0a2040", text:"#29a8e8" };
    if (mm < 15)   return { color:"#0055bb", label:"Heavy",      badge:"#0a1a40", text:"#5588ff" };
    if (mm < 30)   return { color:"#7700cc", label:"Very Heavy", badge:"#1a0a3a", text:"#aa55ff" };
    return             { color:"#cc0000",    label:"Extreme",    badge:"#3a0a0a", text:"#ff5555" };
}

function rainfallRadius(mm) {
    if (mm <= 0)  return 7;
    if (mm < 1)   return 10;
    if (mm < 5)   return 15;
    if (mm < 15)  return 22;
    if (mm < 30)  return 30;
    return 40;
}

function rainfallOpacity(mm) {
    if (mm <= 0) return 0.25;
    if (mm < 1)  return 0.45;
    if (mm < 5)  return 0.6;
    if (mm < 15) return 0.72;
    if (mm < 30) return 0.82;
    return 0.92;
}


/* ---- FETCH WITH TIMEOUT ---- */

/**
 * fetch() with a configurable AbortController timeout.
 * Throws if the server doesn't respond within timeoutMs.
 */
function fetchWithTimeout(url, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs || 12000);
    return fetch(url, { signal: controller.signal })
        .finally(() => clearTimeout(timer));
}


/* ---- MULTI-LOCATION BATCH FETCH ---- */
/**
 * Open-Meteo supports comma-separated lat/lon lists.
 * Batches of ≤50 keep the URL short and responses fast.
 * Returns array of { ...sector, rain, dataTime }.
 */
const MULTI_BATCH_SIZE = 50;

async function fetchBatchMulti(sectors) {
    if (sectors.length === 0) return [];

    const lats = sectors.map(s => s.lat).join(",");
    const lons = sectors.map(s => s.lon).join(",");

    const url =
        "https://api.open-meteo.com/v1/forecast" +
        "?latitude=" + lats +
        "&longitude=" + lons +
        "&current=precipitation" +
        "&timezone=auto" +
        "&forecast_days=1";

    try {
        const res  = await fetchWithTimeout(url, 12000);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = await res.json();

        /* Single location → plain object; multiple → array */
        const results = Array.isArray(json) ? json : [json];

        return sectors.map(function (sector, i) {
            const r    = results[i] || {};
            const rain = (r.current && r.current.precipitation != null)
                ? r.current.precipitation : 0;
            return Object.assign({}, sector, {
                rain:     parseFloat(rain.toFixed(2)),
                dataTime: (r.current && r.current.time) || null
            });
        });

    } catch (err) {
        console.warn("Batch fetch failed (" + sectors.length + " sectors):", err.message);
        return sectors.map(function (s) {
            return Object.assign({}, s, { rain: 0, dataTime: null });
        });
    }
}


/* ---- ORCHESTRATE ALL BATCHES ---- */

async function fetchAllSectors() {
    const total      = SECTORS.length;
    const allResults = [];
    let   completed  = 0;
    let   dataTime   = null;

    const progressEl   = document.getElementById("loadingProgress");
    const progressFill = document.querySelector(".progress-fill");

    for (let i = 0; i < total; i += MULTI_BATCH_SIZE) {

        const batch       = SECTORS.slice(i, i + MULTI_BATCH_SIZE);
        const batchResult = await fetchBatchMulti(batch);

        allResults.push.apply(allResults, batchResult);
        completed += batch.length;

        /* Track first real data timestamp */
        for (var j = 0; j < batchResult.length; j++) {
            if (batchResult[j].dataTime) { dataTime = batchResult[j].dataTime; break; }
        }

        const pct = Math.round((completed / total) * 100);
        if (progressEl)   progressEl.textContent = "Queried " + completed + " / " + total + " sectors (" + pct + "%)"; 
        if (progressFill) progressFill.style.width = pct + "%";
    }

    return { results: allResults, dataTime: dataTime };
}


/* ---- DRAW MARKERS ---- */

function clearMarkers() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
}

function drawMarkers(data) {

    clearMarkers();

    data.forEach(sector => {

        const { color, label, badge, text } = rainfallColor(sector.rain);
        const r   = rainfallRadius(sector.rain);
        const opc = rainfallOpacity(sector.rain);

        /* Skip in filter mode */
        if (!passesFilter(sector.rain)) return;

        const circle = L.circleMarker([sector.lat, sector.lon], {
            radius:      r,
            fillColor:   color,
            color:       color,
            weight:      1.5,
            opacity:     0.9,
            fillOpacity: opc,
        });

        const dataTimeRow = sector.dataTime
            ? `<div class="popup-row"><span class="popup-label">Data time</span><span class="popup-val">${sector.dataTime}</span></div>`
            : "";

        const popupHTML = `
            <div class="rain-popup">
                <strong>${sector.name}</strong>
                <div class="popup-row">
                    <span class="popup-label">Country</span>
                    <span class="popup-val">${sector.country}</span>
                </div>
                <div class="popup-row">
                    <span class="popup-label">Rainfall</span>
                    <span class="popup-val" style="color:${color}">${sector.rain} mm/hr</span>
                </div>
                <div class="popup-row">
                    <span class="popup-label">Coordinates</span>
                    <span class="popup-val">${sector.lat.toFixed(2)}°, ${sector.lon.toFixed(2)}°</span>
                </div>
                ${dataTimeRow}
                <span class="intensity-badge"
                      style="background:${badge};color:${text};">
                    ${label.toUpperCase()}
                </span>
            </div>`;

        circle.bindPopup(popupHTML, { maxWidth: 220 });

        circle.on("mouseover", function () { this.openPopup(); });

        circle.addTo(map);
        markers.push(circle);
    });
}


/* ---- FILTER ---- */

function passesFilter(mm) {
    switch (currentFilter) {
        case "light":    return mm > 0   && mm < 5;
        case "moderate": return mm >= 1  && mm < 15;
        case "heavy":    return mm >= 5;
        default:         return true;
    }
}

function applyFilter(filter, btn) {
    currentFilter = filter;

    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    if (sectorData.length > 0) drawMarkers(sectorData);

    showToast(`Filter: ${filter === "all" ? "Showing all intensities" : filter + " rainfall selected"}`);
}


/* ---- LAYER SWITCHER ---- */

function setLayer(layer) {
    activeLayer = layer;

    Object.values(tileLayers).forEach(t => map.removeLayer(t));
    tileLayers[layer].addTo(map);

    document.querySelectorAll(".layer-btn").forEach(b => b.classList.remove("active"));
    document.getElementById("btn" + layer.charAt(0).toUpperCase() + layer.slice(1))?.classList.add("active");

    showToast(`Layer switched to: ${layer}`);
}


/* ---- STATISTICS ---- */

function updateStats(data, dataTime) {

    const raining = data.filter(d => d.rain > 0);
    const heavy   = data.filter(d => d.rain >= 5);
    const values  = data.map(d => d.rain);
    const max     = values.length ? Math.max(...values) : 0;
    const avg     = values.length
        ? (values.reduce((a, b) => a + b, 0) / values.length)
        : 0;

    /* Header bar */
    setEl("maxRainfall",  `${max.toFixed(2)} mm/hr`);
    setEl("avgRainfall",  `${avg.toFixed(2)} mm/hr`);
    setEl("highRiskCount", heavy.length);

    /* Last-update label — prefer API data time over wall clock */
    const now = new Date();
    let updateLabel = now.toLocaleTimeString();
    if (dataTime) {
        try {
            const dt = new Date(dataTime.replace("T", " "));
            if (!isNaN(dt.getTime())) {
                updateLabel = dt.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }) + " (data)";
            }
        } catch(_) { /* use wall clock */ }
    }
    setEl("lastUpdate", updateLabel);

    /* Stats strip */
    setEl("statSectors", data.length);
    setEl("statRaining", raining.length);
    setEl("statHeavy",   heavy.length);
    setEl("statPeak",    `${max.toFixed(2)} mm/hr`);
    setEl("statAvg",     `${avg.toFixed(2)} mm/hr`);

    /* Top sectors list */
    const sorted = [...data].sort((a, b) => b.rain - a.rain).slice(0, 8);
    const list   = document.getElementById("sectorList");

    list.innerHTML = sorted.map((s, i) => {
        const { color, label, badge, text } = rainfallColor(s.rain);
        return `
            <div class="sector-item"
                 onclick="flyTo(${s.lat}, ${s.lon}, '${s.name}')">
                <span class="sector-rank">${i + 1}</span>
                <div class="sector-info">
                    <div class="sector-name">${s.name}</div>
                    <div class="sector-coords">${s.country} &middot; ${s.lat.toFixed(1)}°, ${s.lon.toFixed(1)}°</div>
                </div>
                <span class="sector-mm"
                      style="background:${badge};color:${text}">
                    ${s.rain} mm
                </span>
            </div>`;
    }).join("");
}


/* ---- FLY TO ---- */

function flyTo(lat, lon, name) {
    map.flyTo([lat, lon], 6, { duration: 1.5 });
    showToast(`Flying to ${name}`);
}


/* ---- STATUS INDICATOR ---- */

function setStatus(msg, dotClass) {
    const el  = document.getElementById("statusText");
    const dot = document.querySelector(".pulse-dot");
    if (el)  el.textContent = msg;
    if (dot) { dot.className = "pulse-dot " + (dotClass || "green"); }
}


/* ---- LOADING OVERLAY HELPERS ---- */

function showLoadingOverlay(msg, progress) {
    const overlay  = document.getElementById("mapLoading");
    const spinner  = document.getElementById("loadingSpinner");
    const msgEl    = document.getElementById("loadingMessage");
    const retryBtn = document.getElementById("retryBtn");
    const progressEl = document.getElementById("loadingProgress");

    if (!overlay) return;
    overlay.classList.remove("hidden");
    if (spinner)    spinner.style.display = "block";
    if (msgEl)      msgEl.textContent = msg || "Loading global rainfall data\u2026";
    if (progressEl) progressEl.textContent = progress || "Querying sectors\u2026";
    if (retryBtn)   retryBtn.style.display = "none";
}

function showErrorOverlay(msg) {
    const overlay  = document.getElementById("mapLoading");
    const spinner  = document.getElementById("loadingSpinner");
    const msgEl    = document.getElementById("loadingMessage");
    const retryBtn = document.getElementById("retryBtn");
    const progressEl = document.getElementById("loadingProgress");

    if (!overlay) return;
    overlay.classList.remove("hidden");
    if (spinner)    spinner.style.display = "none";
    if (msgEl)      msgEl.textContent = msg || "Rainfall data could not be loaded.";
    if (progressEl) progressEl.textContent = "Check your internet connection and try again.";
    if (retryBtn)   retryBtn.style.display = "inline-block";
}

function hideLoadingOverlay() {
    const overlay = document.getElementById("mapLoading");
    if (overlay) overlay.classList.add("hidden");
}


/* ---- MAIN FETCH FUNCTION ---- */

async function fetchAllData() {

    if (isLoading) return;
    isLoading = true;

    /* UI state */
    const btn = document.getElementById("refreshBtn");
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = "&#8635; Refreshing&hellip;";
    }

    setStatus("Fetching live data\u2026", "green");
    showLoadingOverlay("Loading global rainfall data\u2026", "Querying sectors\u2026");

    /* Inject progress bar if not already there */
    const loadingInner = document.querySelector(".loading-inner");
    if (loadingInner && !document.querySelector(".progress-track")) {
        const track = document.createElement("div");
        track.className = "progress-track";
        track.innerHTML = `<div class="progress-fill" style="width:0%"></div>`;
        /* Insert before retry button */
        const retryBtn = document.getElementById("retryBtn");
        if (retryBtn) {
            loadingInner.insertBefore(track, retryBtn);
        } else {
            loadingInner.appendChild(track);
        }
    }

    /* Reset progress bar */
    const progressFill = document.querySelector(".progress-fill");
    if (progressFill) progressFill.style.width = "0%";

    try {

        const { results, dataTime } = await fetchAllSectors();
        sectorData = results;

        drawMarkers(results);
        updateStats(results, dataTime);

        setStatus("Live \u2014 data up to date", "green");
        showToast(`Updated ${results.length} global sectors successfully`);
        hideLoadingOverlay();

    } catch (err) {

        console.error("Fetch error:", err);
        setStatus("Error fetching data", "red");
        showToast("Failed to fetch rainfall data \u2014 check connection");
        showErrorOverlay("Rainfall data could not be loaded.");

    } finally {

        if (btn) {
            btn.disabled = false;
            btn.innerHTML = "&#8635; Refresh Data";
        }

        isLoading = false;
    }
}


/* ---- AUTO REFRESH every 60 seconds ---- */

function startAutoRefresh() {
    clearInterval(refreshTimer);
    refreshTimer = setInterval(fetchAllData, 60000);
}


/* ---- HELPERS ---- */

function setEl(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function showToast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3500);
}


/* ---- BOOTSTRAP ---- */

document.addEventListener("DOMContentLoaded", () => {
    initMap();
    fetchAllData();
    startAutoRefresh();
});


/* ---- PUBLIC API (theme toggle + HTML onclick wrappers) ---- */
return {
    get map() { return map; },
    flyTo:       flyTo,
    setLayer:    setLayer,
    applyFilter: applyFilter,
    fetchAllData: fetchAllData,
};

}()); /* end RainfallMap IIFE */


/* ===========================================================
   GLOBAL WRAPPERS — HTML onclick="setLayer('rainfall')" etc.
   These must remain global functions on window.
=========================================================== */
function setLayer(layer)           { window.RainfallMap.setLayer(layer); }
function applyFilter(filter, btn)  { window.RainfallMap.applyFilter(filter, btn); }
function flyTo(lat, lon, name)     { window.RainfallMap.flyTo(lat, lon, name); }
function fetchAllData()            { window.RainfallMap.fetchAllData(); }
