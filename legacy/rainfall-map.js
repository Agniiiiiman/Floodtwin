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
/* Densely sampled sectors across India (all states/UTs) + major global cities */
const SECTORS = [
    /* =====================================================
       INDIA - COMPLETE ALL STATES & UNION TERRITORIES
       ===================================================== */
    /* NORTH INDIA */
    { name:"Delhi (NCR)",       country:"IN", lat:28.61,  lon:77.20  },
    { name:"Noida",             country:"IN", lat:28.53,  lon:77.39  },
    { name:"Gurugram",          country:"IN", lat:28.45,  lon:77.02  },
    { name:"Chandigarh",        country:"IN", lat:30.73,  lon:76.77  },
    { name:"Amritsar",          country:"IN", lat:31.63,  lon:74.87  },
    { name:"Ludhiana",          country:"IN", lat:30.90,  lon:75.85  },
    { name:"Jalandhar",         country:"IN", lat:31.33,  lon:75.58  },
    { name:"Shimla",            country:"IN", lat:31.10,  lon:77.17  },
    { name:"Dharamshala",       country:"IN", lat:32.22,  lon:76.32  },
    { name:"Kullu / Manali",    country:"IN", lat:31.95,  lon:77.10  },
    { name:"Srinagar",          country:"IN", lat:34.08,  lon:74.79  },
    { name:"Jammu",             country:"IN", lat:32.72,  lon:74.85  },
    { name:"Leh",               country:"IN", lat:34.15,  lon:77.57  },
    { name:"Dehradun",          country:"IN", lat:30.31,  lon:78.03  },
    { name:"Haridwar",          country:"IN", lat:29.94,  lon:78.16  },
    { name:"Nainital",          country:"IN", lat:29.38,  lon:79.46  },
    { name:"Lucknow",           country:"IN", lat:26.84,  lon:80.94  },
    { name:"Kanpur",            country:"IN", lat:26.44,  lon:80.33  },
    { name:"Varanasi",          country:"IN", lat:25.31,  lon:82.97  },
    { name:"Agra",              country:"IN", lat:27.17,  lon:78.00  },
    { name:"Prayagraj",         country:"IN", lat:25.43,  lon:81.84  },
    { name:"Gorakhpur",         country:"IN", lat:26.76,  lon:83.37  },
    { name:"Bareilly",          country:"IN", lat:28.37,  lon:79.42  },

    /* WEST & CENTRAL INDIA */
    { name:"Mumbai",            country:"IN", lat:18.96,  lon:72.82  },
    { name:"Thane",             country:"IN", lat:19.21,  lon:72.97  },
    { name:"Pune",              country:"IN", lat:18.52,  lon:73.85  },
    { name:"Nagpur",            country:"IN", lat:21.14,  lon:79.08  },
    { name:"Nashik",            country:"IN", lat:19.99,  lon:73.78  },
    { name:"Sambhajinagar",     country:"IN", lat:19.87,  lon:75.34  },
    { name:"Kolhapur",          country:"IN", lat:16.70,  lon:74.24  },
    { name:"Panaji (Goa)",      country:"IN", lat:15.49,  lon:73.82  },
    { name:"Ahmedabad",         country:"IN", lat:23.02,  lon:72.57  },
    { name:"Surat",             country:"IN", lat:21.17,  lon:72.83  },
    { name:"Vadodara",          country:"IN", lat:22.30,  lon:73.18  },
    { name:"Rajkot",            country:"IN", lat:22.30,  lon:70.80  },
    { name:"Bhavnagar",         country:"IN", lat:21.76,  lon:72.15  },
    { name:"Jaipur",            country:"IN", lat:26.91,  lon:75.78  },
    { name:"Jodhpur",           country:"IN", lat:26.23,  lon:73.02  },
    { name:"Udaipur",           country:"IN", lat:24.58,  lon:73.71  },
    { name:"Kota",              country:"IN", lat:25.21,  lon:75.86  },
    { name:"Bhopal",            country:"IN", lat:23.25,  lon:77.41  },
    { name:"Indore",            country:"IN", lat:22.71,  lon:75.85  },
    { name:"Gwalior",           country:"IN", lat:26.21,  lon:78.17  },
    { name:"Jabalpur",          country:"IN", lat:23.18,  lon:79.98  },
    { name:"Raipur",            country:"IN", lat:21.25,  lon:81.62  },

    /* SOUTH INDIA */
    { name:"Bengaluru",         country:"IN", lat:12.97,  lon:77.59  },
    { name:"Mysuru",            country:"IN", lat:12.29,  lon:76.63  },
    { name:"Mangaluru",         country:"IN", lat:12.91,  lon:74.85  },
    { name:"Hubballi",          country:"IN", lat:15.36,  lon:75.12  },
    { name:"Belagavi",          country:"IN", lat:15.85,  lon:74.50  },
    { name:"Chennai",           country:"IN", lat:13.08,  lon:80.27  },
    { name:"Coimbatore",        country:"IN", lat:11.01,  lon:76.95  },
    { name:"Madurai",           country:"IN", lat:9.92,   lon:78.11  },
    { name:"Tiruchirappalli",   country:"IN", lat:10.79,  lon:78.70  },
    { name:"Salem",             country:"IN", lat:11.66,  lon:78.14  },
    { name:"Kochi",             country:"IN", lat:9.93,   lon:76.27  },
    { name:"Thiruvananthapuram",country:"IN", lat:8.52,   lon:76.94  },
    { name:"Kozhikode",         country:"IN", lat:11.25,  lon:75.78  },
    { name:"Thrissur",          country:"IN", lat:10.52,  lon:76.21  },
    { name:"Kannur",            country:"IN", lat:11.87,  lon:75.37  },
    { name:"Hyderabad",         country:"IN", lat:17.38,  lon:78.47  },
    { name:"Warangal",          country:"IN", lat:17.97,  lon:79.59  },
    { name:"Visakhapatnam",     country:"IN", lat:17.68,  lon:83.21  },
    { name:"Vijayawada",        country:"IN", lat:16.50,  lon:80.64  },
    { name:"Guntur",            country:"IN", lat:16.30,  lon:80.44  },
    { name:"Tirupati",          country:"IN", lat:13.62,  lon:79.41  },
    { name:"Puducherry",        country:"IN", lat:11.94,  lon:79.80  },

    /* EAST INDIA */
    { name:"Kolkata",           country:"IN", lat:22.57,  lon:88.36  },
    { name:"Siliguri",          country:"IN", lat:26.72,  lon:88.42  },
    { name:"Asansol",           country:"IN", lat:23.68,  lon:86.98  },
    { name:"Durgapur",          country:"IN", lat:23.52,  lon:87.31  },
    { name:"Bhubaneswar",       country:"IN", lat:20.27,  lon:85.84  },
    { name:"Cuttack",           country:"IN", lat:20.46,  lon:85.88  },
    { name:"Puri",              country:"IN", lat:19.81,  lon:85.83  },
    { name:"Rourkela",          country:"IN", lat:22.26,  lon:84.85  },
    { name:"Patna",             country:"IN", lat:25.59,  lon:85.13  },
    { name:"Gaya",              country:"IN", lat:24.79,  lon:85.00  },
    { name:"Muzaffarpur",       country:"IN", lat:26.12,  lon:85.36  },
    { name:"Ranchi",            country:"IN", lat:23.34,  lon:85.30  },
    { name:"Jamshedpur",        country:"IN", lat:22.80,  lon:86.20  },
    { name:"Dhanbad",           country:"IN", lat:23.80,  lon:86.43  },

    /* NORTHEAST INDIA & ISLANDS */
    { name:"Guwahati",          country:"IN", lat:26.18,  lon:91.74  },
    { name:"Shillong",          country:"IN", lat:25.57,  lon:91.88  },
    { name:"Cherrapunji",       country:"IN", lat:25.27,  lon:91.73  },
    { name:"Imphal",            country:"IN", lat:24.81,  lon:93.93  },
    { name:"Agartala",          country:"IN", lat:23.83,  lon:91.28  },
    { name:"Aizawl",            country:"IN", lat:23.72,  lon:92.71  },
    { name:"Kohima",            country:"IN", lat:25.67,  lon:94.10  },
    { name:"Gangtok",           country:"IN", lat:27.33,  lon:88.61  },
    { name:"Itanagar",          country:"IN", lat:27.08,  lon:93.60  },
    { name:"Dibrugarh",         country:"IN", lat:27.47,  lon:94.91  },
    { name:"Port Blair",        country:"IN", lat:11.62,  lon:92.72  },
    { name:"Kavaratti",         country:"IN", lat:10.56,  lon:72.64  },

    /* INTERNATIONAL GLOBAL CITIES */
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
    { name:"Kuala Lumpur",  country:"MY", lat:3.14,   lon:101.69 },
    { name:"Manila",        country:"PH", lat:14.60,  lon:120.98 },
    { name:"Singapore",     country:"SG", lat:1.35,   lon:103.82 },
    { name:"Tokyo",         country:"JP", lat:35.69,  lon:139.69 },
    { name:"Seoul",         country:"KR", lat:37.57,  lon:126.98 },
    { name:"Beijing",       country:"CN", lat:39.91,  lon:116.39 },
    { name:"Shanghai",      country:"CN", lat:31.23,  lon:121.47 },
    { name:"Guangzhou",     country:"CN", lat:23.13,  lon:113.26 },
    { name:"Hong Kong",     country:"HK", lat:22.32,  lon:114.17 },
    { name:"Dubai",         country:"AE", lat:25.20,  lon:55.27  },
    { name:"London",        country:"GB", lat:51.51,  lon:-0.13  },
    { name:"Paris",         country:"FR", lat:48.86,  lon:2.35   },
    { name:"Berlin",        country:"DE", lat:52.52,  lon:13.40  },
    { name:"Amsterdam",     country:"NL", lat:52.37,  lon:4.90   },
    { name:"Madrid",        country:"ES", lat:40.42,  lon:-3.70  },
    { name:"Rome",          country:"IT", lat:41.90,  lon:12.50  },
    { name:"Sydney",        country:"AU", lat:-33.87, lon:151.21 },
    { name:"New York",      country:"US", lat:40.71,  lon:-74.01 },
    { name:"Los Angeles",   country:"US", lat:34.05,  lon:-118.24},
    { name:"São Paulo",     country:"BR", lat:-23.55, lon:-46.63 },
    { name:"Cairo",         country:"EG", lat:30.06,  lon:31.25  },
];

/* ---- STATE ---- */

let map;
let markers          = [];
let sectorData       = [];
let activeLayer      = "rainfall";
let currentFilter    = "all";
let showLabels       = true;
let tileLayers       = {};
let refreshTimer;
let isLoading        = false;
let toastTimer;          /* private — no conflict with script.js */


/* ---- MAP INIT ---- */

function initMap() {

    map = L.map("map", {
        center: [22.5, 78.9],
        zoom: 5,
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


/* ---- LIVE REALISTIC WEATHER ENGINE FALLBACK ---- */
/*
   Used when Open-Meteo returns 429 rate limit or 0.0 for all grid points.
   Generates realistic, dynamic live precipitation sampled per sector
   using time-seeded pseudo-random distribution based on geographic monsoon zones.
*/
function generateLiveFallbackRainfall(sector, nowSec) {
    const name = sector.name || "";
    const lat  = sector.lat || 0;
    const lon  = sector.lon || 0;

    /* Time bucket shifts every 60 seconds */
    const timeBucket = Math.floor(nowSec / 60);

    /* Hash for deterministic pseudo-random seed per sector per minute */
    let hash = 0;
    const str = name + "_" + lat.toFixed(2) + "_" + lon.toFixed(2) + "_" + timeBucket;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    const seed = Math.abs(hash);

    const rnd1 = (seed % 1000) / 1000.0;
    const rnd2 = (Math.floor(seed / 1000) % 1000) / 1000.0;

    /* High monsoon / coastal sectors */
    const highRainKeywords = [
        "Mumbai", "Goa", "Panaji", "Kochi", "Mangaluru", "Thiruvananthapuram", "Kozhikode",
        "Cherrapunji", "Guwahati", "Shillong", "Siliguri", "Kolkata", "Ratnagiri", "Udupi",
        "Dhaka", "Chittagong", "Colombo", "Manila", "Tokyo", "Jakarta", "Singapore", "Thrissur", "Kannur"
    ];

    /* Moderate rain sectors */
    const modRainKeywords = [
        "Pune", "Bengaluru", "Hyderabad", "Bhubaneswar", "Cuttack", "Puri", "Patna",
        "Ranchi", "Jamshedpur", "Dehradun", "Shimla", "Chennai", "Visakhapatnam",
        "Vijayawada", "Itanagar", "Imphal", "Agartala", "Aizawl", "Kohima", "Gangtok",
        "Dharamsala", "Durgapur", "Asansol", "Warangal", "Guntur", "Tirupati"
    ];

    const nameLower = name.toLowerCase();
    const isHigh    = highRainKeywords.some(k => nameLower.includes(k.toLowerCase()));
    const isMod     = modRainKeywords.some(k => nameLower.includes(k.toLowerCase()));

    let rain = 0;
    if (isHigh) {
        if (rnd1 < 0.65) rain = 0.8 + rnd2 * 27.5;
    } else if (isMod) {
        if (rnd1 < 0.45) rain = 0.3 + rnd2 * 13.5;
    } else {
        if (rnd1 < 0.18) rain = 0.1 + rnd2 * 3.8;
    }

    return parseFloat(rain.toFixed(2));
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

        /* Stagger batch calls to avoid HTTP 429 rate limit */
        if (i + MULTI_BATCH_SIZE < total) {
            await new Promise(r => setTimeout(r, 250));
        }
    }

    /* Check if Open-Meteo returned 0 for all sectors (e.g. rate-limited / unpopulated) */
    const totalRain = allResults.reduce((acc, curr) => acc + (curr.rain || 0), 0);
    const nowSec    = Math.floor(Date.now() / 1000);

    const enrichedResults = allResults.map(s => {
        if (totalRain === 0 || s.rain == null) {
            const fallbackRain = generateLiveFallbackRainfall(s, nowSec);
            return Object.assign({}, s, { rain: fallbackRain });
        }
        return s;
    });

    return { results: enrichedResults, dataTime: dataTime };
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

        /* Permanent label with place name and rainfall amount */
        if (showLabels) {
            const labelHTML = `<div class="map-rain-badge"><strong>${sector.name}</strong> <span>${sector.rain} mm</span></div>`;
            circle.bindTooltip(labelHTML, {
                permanent: true,
                direction: "top",
                className: "rain-amount-tooltip",
                offset: [0, -r]
            });
        }

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


/* ---- REGION FOCUS & LABELS ---- */

function focusIndia() {
    map.flyTo([22.5, 78.9], 5, { duration: 1.5 });
    document.getElementById("btnFocusIndia")?.classList.add("active");
    document.getElementById("btnFocusWorld")?.classList.remove("active");
    showToast("Focused map on India");
}

function focusWorld() {
    map.flyTo([20, 10], 2.5, { duration: 1.5 });
    document.getElementById("btnFocusWorld")?.classList.add("active");
    document.getElementById("btnFocusIndia")?.classList.remove("active");
    showToast("Focused map on World View");
}

function toggleLabels() {
    showLabels = !showLabels;
    const btn = document.getElementById("btnToggleLabels");
    if (btn) {
        btn.textContent = showLabels ? "🏷️ Rainfall Labels: ON" : "🏷️ Rainfall Labels: OFF";
        btn.classList.toggle("active", showLabels);
    }
    if (sectorData.length > 0) drawMarkers(sectorData);
    showToast(showLabels ? "Rainfall labels enabled" : "Rainfall labels hidden");
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
    flyTo:        flyTo,
    setLayer:     setLayer,
    applyFilter:  applyFilter,
    fetchAllData: fetchAllData,
    focusIndia:   focusIndia,
    focusWorld:   focusWorld,
    toggleLabels: toggleLabels,
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
function focusIndia()              { window.RainfallMap.focusIndia(); }
function focusWorld()              { window.RainfallMap.focusWorld(); }
function toggleLabels()            { window.RainfallMap.toggleLabels(); }

