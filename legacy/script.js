/* =====================================================
   THEME TOGGLE  (light / dark — FloodTwin)
   Default: dark.  Persisted via localStorage.
===================================================== */

let globalDashboardMap = null;
let currentTileLayer = null;

function updateMapTileForTheme(theme) {
    if (!globalDashboardMap) return;
    if (currentTileLayer) {
        globalDashboardMap.removeLayer(currentTileLayer);
    }
    
    // Clean OpenStreetMap tiles - 100% watermark-free
    currentTileLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(globalDashboardMap);
}

(function () {

    const STORAGE_KEY = "floodtwin-theme";
    const html        = document.documentElement;

    /* Apply saved or default theme immediately (defaulting to EOC dark theme) */
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

            updateMapTileForTheme(next);

            showToast(next === "dark"
                ? "🌙  Dark EOC Mode Enabled"
                : "☀️  Bright Municipal Command Mode Enabled"
            );

        });

    });

}());


/* =====================================================
   MOBILE NAVIGATION
===================================================== */

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("open");
    });

    document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("open");
        });
    });
}


/* =====================================================
   NAVBAR SCROLL
===================================================== */

window.addEventListener("scroll", () => {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;
    if (window.scrollY > 30) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});


/* =====================================================
   RAIN ANIMATION
===================================================== */

const rain = document.getElementById("rain");
if (rain) {
    for (let i = 0; i < 90; i++) {
        const drop = document.createElement("span");
        drop.className = "drop";
        drop.style.left = Math.random() * 100 + "%";
        drop.style.animationDelay = Math.random() * 2 + "s";
        drop.style.animationDuration = 0.7 + Math.random() * 1.2 + "s";
        rain.appendChild(drop);
    }
}


/* =====================================================
   SCROLL REVEAL
===================================================== */

const revealObserver = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach(element => {
    revealObserver.observe(element);
});


/* =====================================================
   LIVE FLOOD DATA & DEPTH TIER CALCULATOR
===================================================== */

function updateDepthTierUI(waterDepthM) {
    const badge = document.getElementById("currentRiskBadge");
    const meterFill = document.getElementById("depthMeterFill");
    const peakDepthEl = document.getElementById("peakDepth");

    if (peakDepthEl) peakDepthEl.textContent = waterDepthM.toFixed(2);

    if (!badge || !meterFill) return;

    // Remove old classes
    badge.className = "risk-badge";
    meterFill.className = "depth-bar-fill";

    // Tier logic: Safe 0-0.10m, Caution 0.10-0.20m, Warning 0.20-0.40m, Critical >0.40m
    if (waterDepthM <= 0.10) {
        badge.textContent = "SAFE";
        badge.classList.add("safe-bg");
        meterFill.classList.add("safe-fill");
        meterFill.style.width = `${Math.min(100, (waterDepthM / 0.5) * 100)}%`;
    } else if (waterDepthM <= 0.20) {
        badge.textContent = "CAUTION";
        badge.classList.add("caution-bg");
        meterFill.classList.add("caution-fill");
        meterFill.style.width = `${Math.min(100, (waterDepthM / 0.5) * 100)}%`;
    } else if (waterDepthM <= 0.40) {
        badge.textContent = "WARNING";
        badge.classList.add("warning-bg");
        meterFill.classList.add("warning-fill");
        meterFill.style.width = `${Math.min(100, (waterDepthM / 0.5) * 100)}%`;
    } else {
        badge.textContent = "CRITICAL";
        badge.classList.add("critical-bg");
        meterFill.classList.add("critical-fill");
        meterFill.style.width = "100%";
    }
}

/* =====================================================
   LIVE OPEN-METEO RAINFALL API (Kolkata, India)
===================================================== */
let latestSuccessfulRainfall = null;
let latestSuccessfulTime = null;

async function fetchLiveRainfall() {
    const rainfallEl = document.getElementById("rainfall");
    const rainfallUnitEl = document.getElementById("rainfallUnit");
    const lastUpdatedEl = document.getElementById("rainfallLastUpdated");
    const statusTagEl = document.getElementById("rainfallLiveTag");
    const meterFillEl = document.getElementById("rainfallMeterFill");

    const url = "https://api.open-meteo.com/v1/forecast?latitude=22.5726&longitude=88.3639&current=precipitation&timezone=Asia%2FKolkata";

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Open-Meteo HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !data.current || typeof data.current.precipitation !== "number") {
            throw new Error("Invalid or missing precipitation data field in Open-Meteo response");
        }

        const rainVal = data.current.precipitation;
        const unitVal = (data.current_units && data.current_units.precipitation) ? data.current_units.precipitation : "mm";
        const now = new Date();
        const timeStr = now.toLocaleTimeString();

        latestSuccessfulRainfall = rainVal;
        latestSuccessfulTime = timeStr;

        if (rainfallEl) rainfallEl.textContent = rainVal.toFixed(1);
        if (rainfallUnitEl) rainfallUnitEl.textContent = unitVal;
        if (lastUpdatedEl) lastUpdatedEl.textContent = `Last updated: ${timeStr}`;
        if (statusTagEl) {
            statusTagEl.textContent = "● LIVE";
            statusTagEl.className = "status-tag live-tag";
        }
        if (meterFillEl) {
            const pct = Math.min(100, Math.max(10, (rainVal / 50) * 100));
            meterFillEl.style.width = `${pct}%`;
        }

        return rainVal;

    } catch (error) {
        console.error("Open-Meteo live rainfall fetch failed:", error);

        if (latestSuccessfulRainfall !== null && latestSuccessfulTime !== null) {
            showToast("Unable to fetch live rainfall data.");
            if (rainfallEl) rainfallEl.textContent = latestSuccessfulRainfall.toFixed(1);
            if (lastUpdatedEl) lastUpdatedEl.textContent = `Last updated: ${latestSuccessfulTime} (Cached)`;
        } else {
            showToast("Unable to fetch live rainfall data.");
            if (rainfallEl) rainfallEl.textContent = "N/A";
            if (lastUpdatedEl) lastUpdatedEl.textContent = "Rainfall data unavailable";
            if (statusTagEl) {
                statusTagEl.textContent = "● OFFLINE";
                statusTagEl.className = "status-tag danger-tag";
            }
        }
        return null;
    }
}

async function updateLiveData() {
    try {
        const res = await fetch("http://localhost:8000/api/forecast?lat=22.5726&lng=88.3639");
        const data = await res.json();
        
        const water = data.depth_m || 0.34;
        const load = data.risk === "Critical" ? 95 : data.risk === "High" ? 80 : data.risk === "Medium" ? 60 : 30;
        
        const waterLevelEl = document.getElementById("waterLevel");
        if (waterLevelEl) waterLevelEl.innerHTML = `${water}<span> m</span>`;

        const netLoadEl = document.getElementById("networkLoad");
        if (netLoadEl) netLoadEl.innerHTML = `${load}<span>%</span>`;

        updateDepthTierUI(water);
        
    } catch (e) {
        // Fallback simulation for simulated backend metrics when backend server is offline
        console.warn("Live telemetry fallback mode active for simulated backend metrics.");
        updateDepthTierUI(0.34);
    }
}

// Automatic live rainfall refresh every 10 minutes (10 * 60 * 1000 ms)
setInterval(fetchLiveRainfall, 10 * 60 * 1000);
// Simulated metrics sync every 30 seconds
setInterval(updateLiveData, 30000);


/* =====================================================
   DASHBOARD MAP MODE TABS
===================================================== */

document.querySelectorAll(".map-mode-btn").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".map-mode-btn").forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        const mode = button.getAttribute("data-mode");
        const statusEl = document.getElementById("mapLayerStatus");
        if (statusEl) statusEl.innerHTML = `Layer: <strong>${button.textContent.trim()}</strong>`;
        showToast(`${button.textContent.trim()} layer activated`);
    });
});


/* =====================================================
   WHAT-IF SIMULATION ENGINE
===================================================== */

const simSlider = document.getElementById("blockageRange");
const blockageValEl = document.getElementById("blockageVal");

if (simSlider && blockageValEl) {
    simSlider.addEventListener("input", (e) => {
        blockageValEl.textContent = `${e.target.value}%`;
    });
}

function runWhatIfSimulation() {
    const nodeSelect = document.getElementById("simNodeSelect");
    const selectedNode = nodeSelect ? nodeSelect.value : "J-103";
    const blockagePct = simSlider ? parseInt(simSlider.value, 10) : 75;

    const baseDepth = 0.24;
    const additionalDepth = (blockagePct / 100) * 0.42;
    const finalDepth = baseDepth + additionalDepth;

    const beforeEl = document.getElementById("simBeforeDepth");
    const afterEl = document.getElementById("simAfterDepth");
    const resultsBox = document.getElementById("simResultsBox");
    const streetTagsEl = document.getElementById("simStreetTags");

    if (beforeEl) beforeEl.textContent = `${baseDepth.toFixed(2)} m`;
    if (afterEl) afterEl.textContent = `${finalDepth.toFixed(2)} m`;

    if (streetTagsEl) {
        if (blockagePct > 80) {
            streetTagsEl.textContent = `${selectedNode} Outflow · MG Road · Sector 4 Subway · Station Flyover · Underpass B`;
        } else if (blockagePct > 40) {
            streetTagsEl.textContent = `${selectedNode} Outflow · MG Road · Sector 4 Subway`;
        } else {
            streetTagsEl.textContent = `Minor ponding near ${selectedNode}`;
        }
    }

    if (resultsBox) resultsBox.classList.remove("hidden");

    // Update main depth metric to reflect simulated worst-case
    updateDepthTierUI(finalDepth);

    showToast(`⚡ Simulation executed: ${selectedNode} at ${blockagePct}% blockage.`);
}

const runSimBtn = document.getElementById("runSimulationBtn");
if (runSimBtn) {
    runSimBtn.addEventListener("click", runWhatIfSimulation);
}

const headerSimBtn = document.getElementById("simulateBtn");
if (headerSimBtn) {
    headerSimBtn.addEventListener("click", () => {
        const dashSec = document.getElementById("dashboard");
        if (dashSec) dashSec.scrollIntoView({ behavior: "smooth" });
        runWhatIfSimulation();
    });
}

/* =====================================================
   REFRESH BUTTON
===================================================== */

const refreshBtn = document.getElementById("refreshBtn");
if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
        showToast("Fetching live Open-Meteo rainfall telemetry...");
        await fetchLiveRainfall();
        updateLiveData();
        showToast("🔄 Live rainfall & network telemetry refreshed.");
    });
}

/* =====================================================
   EMERGENCY SAFE ROUTE CALCULATOR
===================================================== */

/* =====================================================
   EMERGENCY SAFE ROUTE CALCULATOR
===================================================== */

let currentRoutePolyline = null;
let currentRouteMarkers = [];

function drawRouteOnMap(startLat, startLng, endLat, endLng) {
    if (!globalDashboardMap) return;

    // Clear previous route graphics
    if (currentRoutePolyline) globalDashboardMap.removeLayer(currentRoutePolyline);
    currentRouteMarkers.forEach(m => globalDashboardMap.removeLayer(m));
    currentRouteMarkers = [];

    // Calculate a safe bypass route around J-103/J-104 risk zones
    const midLat = (startLat + endLat) / 2 + 0.008;
    const midLng = (startLng + endLng) / 2 - 0.010;

    const latlngs = [
        [startLat, startLng],
        [startLat + (midLat - startLat) * 0.5, startLng + 0.003],
        [midLat, midLng],
        [endLat - (endLat - midLat) * 0.5, endLng - 0.004],
        [endLat, endLng]
    ];

    currentRoutePolyline = L.polyline(latlngs, {
        color: '#10b981',
        weight: 5,
        opacity: 0.9,
        dashArray: '8, 8',
        lineCap: 'round'
    }).addTo(globalDashboardMap);

    const startMarker = L.circleMarker([startLat, startLng], {
        radius: 7, fillColor: '#10b981', color: '#ffffff', weight: 2, fillOpacity: 1
    }).addTo(globalDashboardMap).bindPopup("<b>Route Origin</b>");

    const endMarker = L.circleMarker([endLat, endLng], {
        radius: 7, fillColor: '#ef4444', color: '#ffffff', weight: 2, fillOpacity: 1
    }).addTo(globalDashboardMap).bindPopup("<b>Route Destination</b>");

    currentRouteMarkers.push(startMarker, endMarker);

    // Fit map bounds to show route
    globalDashboardMap.fitBounds(currentRoutePolyline.getBounds(), { padding: [40, 40] });
}

const routeBtn = document.getElementById("routeBtn");
if (routeBtn) {
    routeBtn.addEventListener("click", async () => {
        const startStr = document.getElementById("routeStart").value;
        const endStr = document.getElementById("routeEnd").value;
        const statusDiv = document.getElementById("routeStatus");

        if (!startStr || !endStr) {
            showToast("Please enter origin and destination coordinates.");
            return;
        }

        const start = startStr.split(',').map(Number);
        const end = endStr.split(',').map(Number);

        if (isNaN(start[0]) || isNaN(start[1]) || isNaN(end[0]) || isNaN(end[1])) {
            showToast("Invalid coordinate format. Use format: lat, lng");
            return;
        }

        drawRouteOnMap(start[0], start[1], end[0], end[1]);

        try {
            const res = await fetch("http://localhost:8000/api/route", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    start_lat: start[0], start_lng: start[1],
                    end_lat: end[0], end_lng: end[1]
                })
            });
            const data = await res.json();
            if (data.route) {
                if (statusDiv) statusDiv.textContent = `✅ ${data.safe_status}. Est: ${data.safe_duration}`;
                showToast("🛡️ Safest flood-free route generated on map.");
            } else {
                if (statusDiv) statusDiv.textContent = data.error || "Route generated on map.";
            }
        } catch (e) {
            if (statusDiv) {
                statusDiv.textContent = "🛡️ Safest Route Found: Via Ring Flyover (Bypasses J-103 & J-104 flooding). Est: 14 mins.";
            }
            showToast("🛡️ Safest flood-free route generated on map.");
        }
    });
}

/* =====================================================
   CITIZEN REPORTING
===================================================== */

const reportBtn = document.getElementById("reportBtn");
if (reportBtn) {
    reportBtn.addEventListener("click", async () => {
        const loc = document.getElementById("reportLocation").value;
        const status = document.getElementById("reportStatus").value;
        const desc = document.getElementById("reportDesc").value;
        const msgDiv = document.getElementById("reportMsg");

        if (!loc) {
            showToast("Please enter report location.");
            return;
        }
        try {
            const [lat, lng] = loc.split(',').map(Number);
            const res = await fetch("http://localhost:8000/api/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lat, lng, status, desc })
            });
            const data = await res.json();
            if (msgDiv) msgDiv.textContent = data.message;
            showToast(data.message);
        } catch (e) {
            if (msgDiv) msgDiv.textContent = "Incident report logged to local twin queue.";
            showToast("Incident report submitted successfully.");
        }
    });
}


/* =====================================================
   TOAST NOTIFICATION SYSTEM
===================================================== */

let toastTimer;

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3200);
}


/* =====================================================
   DASHBOARD LEAFLET MAP & LIVE GEOLOCATION PIPELINE
===================================================== */

let userLiveMarker = null;
let userRiskCircle = null;
let junctionOverlayGroup = null;

function renderJunctionOverlay(userLat, userLng) {
    if (!globalDashboardMap) return;

    if (junctionOverlayGroup) {
        globalDashboardMap.removeLayer(junctionOverlayGroup);
    }
    junctionOverlayGroup = L.layerGroup();

    // Define junction nodes around user location
    const junctions = [
        { id: "J-101", name: "J-101 (Central Arterial)", lat: userLat + 0.008, lng: userLng + 0.012, status: "Normal", load: "34%", color: "#10b981" },
        { id: "J-102", name: "J-102 (North Canal Sluice)", lat: userLat + 0.015, lng: userLng - 0.008, status: "High Load", load: "78%", color: "#f59e0b" },
        { id: "J-103", name: "J-103 (Harbor Main Outflow)", lat: userLat - 0.010, lng: userLng + 0.018, status: "Overloaded", load: "94%", color: "#f97316" },
        { id: "J-104", name: "J-104 (Subway Catchment)", lat: userLat - 0.006, lng: userLng - 0.014, status: "Failure Risk", load: "CRITICAL", color: "#ef4444" }
    ];

    junctions.forEach(j => {
        const marker = L.circleMarker([j.lat, j.lng], {
            radius: 8,
            fillColor: j.color,
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
        });
        marker.bindPopup(`<b>${j.name}</b><br>Status: <strong>${j.status}</strong><br>Capacity Load: <strong>${j.load}</strong>`);
        junctionOverlayGroup.addLayer(marker);

        // Add warning circle for overloaded junctions
        if (j.id === "J-103" || j.id === "J-104") {
            const riskCircle = L.circle([j.lat, j.lng], {
                color: j.color,
                fillColor: j.color,
                fillOpacity: 0.2,
                radius: 600
            });
            junctionOverlayGroup.addLayer(riskCircle);
        }
    });

    junctionOverlayGroup.addTo(globalDashboardMap);
}

function updateLiveMapLocation(lat, lon, labelText) {
    const loadingOverlay = document.getElementById("dashboardMapLoading");
    if (loadingOverlay) loadingOverlay.style.display = "none";

    const initialTheme = document.documentElement.getAttribute("data-theme") || "dark";

    if (!globalDashboardMap) {
        globalDashboardMap = L.map('dashboardMap', {
            zoomControl: false
        }).setView([lat, lon], 13);
        
        L.control.zoom({ position: 'bottomright' }).addTo(globalDashboardMap);
    } else {
        globalDashboardMap.setView([lat, lon], 13);
    }

    updateMapTileForTheme(initialTheme);

    // Render User Live Marker
    if (userLiveMarker) globalDashboardMap.removeLayer(userLiveMarker);
    if (userRiskCircle) globalDashboardMap.removeLayer(userRiskCircle);

    userLiveMarker = L.circleMarker([lat, lon], {
        radius: 10,
        fillColor: '#2563eb',
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.95
    }).addTo(globalDashboardMap);

    userRiskCircle = L.circle([lat, lon], {
        color: '#2563eb',
        fillColor: '#2563eb',
        fillOpacity: 0.1,
        radius: 1000
    }).addTo(globalDashboardMap);

    const popupHtml = `
        <div style="font-size:12px; padding:2px;">
            <b style="color:#2563eb;">📍 Live System Location</b><br>
            <span>${labelText}</span><br>
            <small style="color:#64748b;">Lat: ${lat.toFixed(4)}, Lng: ${lon.toFixed(4)}</small>
        </div>
    `;

    userLiveMarker.bindPopup(popupHtml).openPopup();

    // Auto update input coordinates
    const routeStartEl = document.getElementById("routeStart");
    const routeEndEl = document.getElementById("routeEnd");
    const reportLocEl = document.getElementById("reportLocation");

    if (routeStartEl) routeStartEl.value = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    if (routeEndEl) routeEndEl.value = `${(lat + 0.025).toFixed(4)}, ${(lon + 0.030).toFixed(4)}`;
    if (reportLocEl) reportLocEl.value = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;

    // Render drainage nodes around user position
    renderJunctionOverlay(lat, lon);

    setTimeout(() => {
        if (globalDashboardMap) globalDashboardMap.invalidateSize();
    }, 100);
}

// IP-based Location Fallback Engine
async function fetchIpLocation() {
    try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data && data.latitude && data.longitude) {
            const label = `${data.city || 'Detected Region'}, ${data.country_name || 'Live GIS'}`;
            updateLiveMapLocation(data.latitude, data.longitude, label);
            showToast(`📍 Live location detected: ${label}`);
            return true;
        }
    } catch (e) {
        console.warn("IP location fallback failed:", e);
    }
    return false;
}

// Primary Geolocation Trigger
function locateUserAndInitMap() {
    const defaultLocation = [18.96, 72.82]; // South Mumbai Pilot Ward fallback

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                updateLiveMapLocation(lat, lon, "GPS High Precision Mode");
                showToast("📍 Centered on your exact GPS live location.");
            },
            async (error) => {
                console.warn("GPS Geolocation error/permission denied, trying IP location...", error);
                const ipSuccess = await fetchIpLocation();
                if (!ipSuccess) {
                    updateLiveMapLocation(defaultLocation[0], defaultLocation[1], "FloodTwin Pilot Ward (South Mumbai)");
                    showToast("Centered on FloodTwin pilot ward.");
                }
            },
            { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
        );
    } else {
        fetchIpLocation().then(success => {
            if (!success) {
                updateLiveMapLocation(defaultLocation[0], defaultLocation[1], "FloodTwin Pilot Ward (South Mumbai)");
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Immediately fetch live Open-Meteo rainfall telemetry on page load
    fetchLiveRainfall();

    const mapContainer = document.getElementById("dashboardMap");
    if (!mapContainer) return;

    // Fetch simulated hydraulic telemetry data
    updateLiveData();

    locateUserAndInitMap();

    // Wire up Locate Me button in toolbar
    const locateBtn = document.getElementById("locateMeBtn");
    if (locateBtn) {
        locateBtn.addEventListener("click", () => {
            showToast("🔍 Locating device position...");
            locateUserAndInitMap();
        });
    }

    // Initialize 🚨 Emergency One-Call Rapid Response System
    initEmergencyResponseSystem();
});


/* =====================================================
   🚨 FLOOD EMERGENCY ONE-CALL / RAPID ACTION SYSTEM
===================================================== */

let activeEmergencyIncident = null;
let emergencyMapMarker = null;
let emergencyPulseCircle = null;
let agencyStatusTimers = [];

const EMERGENCY_AGENCIES = [
    { id: "disaster", name: "🚨 Disaster / Rapid Action Response", desc: "Rescue & evacuation units queued" },
    { id: "fire", name: "🚒 Fire & Emergency Services", desc: "Flood rescue & pumping units queued" },
    { id: "police", name: "👮 Police Department", desc: "Traffic diversion & perimeter safety queued" },
    { id: "electricity", name: "⚡ Electricity / Power Utility", desc: "Substation hazard isolation assessment queued" },
    { id: "control_room", name: "🏢 Emergency Control Room (EOC)", desc: "Municipal dispatch coordination queued" }
];

function generateIncidentId() {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `FLD-${year}-${rand}`;
}

function getEmergencyTelemetry() {
    // Get live water depth from DOM or default fallback
    const peakDepthEl = document.getElementById("peakDepth");
    const waterDepth = peakDepthEl ? parseFloat(peakDepthEl.textContent) || 0.8 : 0.8;

    // Get live risk level
    const riskBadge = document.getElementById("currentRiskBadge");
    const riskLevel = riskBadge ? riskBadge.textContent.trim() : "HIGH";

    // Get live rainfall
    const rainfallEl = document.getElementById("rainfall");
    const rainfall = rainfallEl && !isNaN(parseFloat(rainfallEl.textContent)) ? parseFloat(rainfallEl.textContent) : 84.0;

    // Get location/coordinates
    let lat = 22.5726;
    let lng = 88.3639;
    let locationName = "Kolkata, West Bengal";

    if (globalDashboardMap) {
        const center = globalDashboardMap.getCenter();
        lat = center.lat;
        lng = center.lng;
    }

    if (userLiveMarker) {
        const userLatLng = userLiveMarker.getLatLng();
        lat = userLatLng.lat;
        lng = userLatLng.lng;
        locationName = "Detected User Location (Live GPS)";
    }

    return {
        lat,
        lng,
        locationName,
        riskLevel,
        waterDepth,
        rainfall
    };
}

function openEmergencyConfirmationModal() {
    const modal = document.getElementById("emergencyModalOverlay");
    if (!modal) return;

    const telemetry = getEmergencyTelemetry();

    const locEl = document.getElementById("confirmLoc");
    const riskEl = document.getElementById("confirmRisk");
    const depthEl = document.getElementById("confirmDepth");
    const rainEl = document.getElementById("confirmRain");
    const coordsEl = document.getElementById("confirmCoords");

    if (locEl) locEl.textContent = telemetry.locationName;
    if (riskEl) {
        riskEl.textContent = telemetry.riskLevel;
        riskEl.className = telemetry.riskLevel === "CRITICAL" ? "badge-risk-high" : "badge-risk-high";
    }
    if (depthEl) depthEl.textContent = `${telemetry.waterDepth.toFixed(2)} m`;
    if (rainEl) rainEl.textContent = `${telemetry.rainfall.toFixed(1)} mm/hr`;
    if (coordsEl) coordsEl.textContent = `${telemetry.lat.toFixed(4)}, ${telemetry.lng.toFixed(4)}`;

    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden"; // Prevent scrolling behind modal
}

function closeEmergencyConfirmationModal() {
    const modal = document.getElementById("emergencyModalOverlay");
    if (!modal) return;
    modal.classList.add("hidden");
    document.body.style.overflow = "";
}

function renderAgencyStatuses(agencyStates) {
    const listContainer = document.getElementById("agencyResponseList");
    if (!listContainer) return;

    listContainer.innerHTML = "";

    agencyStates.forEach(agency => {
        const item = document.createElement("div");
        item.className = "agency-item";

        let statusClass = "status-queued";
        if (agency.status === "SENT") statusClass = "status-sent";
        if (agency.status === "ACKNOWLEDGED") statusClass = "status-acknowledged";
        if (agency.status === "RESPONDING") statusClass = "status-responding";
        if (agency.status === "RESOLVED") statusClass = "status-resolved";
        if (agency.status === "FAILED") statusClass = "status-failed";

        item.innerHTML = `
            <div class="agency-info">
                <strong>${agency.name}</strong>
            </div>
            <span class="agency-status-badge ${statusClass}" id="agencyState_${agency.id}">
                ${agency.status}
            </span>
        `;
        listContainer.appendChild(item);
    });
}

function addEmergencyIncidentToMap(incident) {
    if (!globalDashboardMap) return;

    // Clear previous emergency marker if exists
    if (emergencyMapMarker) globalDashboardMap.removeLayer(emergencyMapMarker);
    if (emergencyPulseCircle) globalDashboardMap.removeLayer(emergencyPulseCircle);

    const lat = incident.location.latitude;
    const lng = incident.location.longitude;

    // Create red pulse circle
    emergencyPulseCircle = L.circle([lat, lng], {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.25,
        radius: 800
    }).addTo(globalDashboardMap);

    // Create custom Emergency Icon Marker
    const emergencyIcon = L.divIcon({
        className: 'custom-emergency-icon',
        html: `
            <div style="
                background: #ef4444;
                color: #ffffff;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                box-shadow: 0 0 15px rgba(239, 68, 68, 0.9);
                border: 2px solid #ffffff;
                animation: pulseRed 1.5s infinite;
            ">🚨</div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
    });

    emergencyMapMarker = L.marker([lat, lng], { icon: emergencyIcon }).addTo(globalDashboardMap);

    const popupContent = `
        <div style="font-family: Inter, sans-serif; padding: 4px; min-width: 180px;">
            <div style="display:flex; align-items:center; gap:6px; color:#ef4444; font-weight:800; font-size:13px; margin-bottom:6px;">
                <span>🚨</span> FLOOD INCIDENT
            </div>
            <div style="font-size:11.5px; line-height:1.6; color:#0f172a;">
                <b>Incident ID:</b> <span style="font-family:monospace; font-weight:bold;">${incident.incidentId}</span><br>
                <b>Location:</b> ${incident.location.address}<br>
                <b>Risk Level:</b> <span style="color:#ef4444; font-weight:bold;">${incident.riskLevel}</span><br>
                <b>Water Depth:</b> ${incident.estimatedWaterDepth} m<br>
                <b>Status:</b> <span style="color:#2563eb; font-weight:bold;">${incident.status}</span><br>
                <small style="color:#64748b;">Dispatched: ${incident.timestamp}</small>
            </div>
        </div>
    `;

    emergencyMapMarker.bindPopup(popupContent).openPopup();
    globalDashboardMap.setView([lat, lng], 14, { animate: true });
}

async function initiateEmergencyResponse() {
    const telemetry = getEmergencyTelemetry();
    const notesInput = document.getElementById("emergencyNotes");
    const userNotes = notesInput ? notesInput.value.trim() : "";

    const incidentId = generateIncidentId();
    const now = new Date();
    const timeStr = `${now.toLocaleTimeString()} (${now.toLocaleDateString()})`;

    const incidentPayload = {
        incidentId: incidentId,
        incidentType: "Urban Flood Emergency",
        location: {
            latitude: telemetry.lat,
            longitude: telemetry.lng,
            address: telemetry.locationName
        },
        riskLevel: telemetry.riskLevel,
        estimatedWaterDepth: telemetry.waterDepth,
        rainfall: telemetry.rainfall,
        timestamp: timeStr,
        notes: userNotes,
        mode: "DEMO",
        status: "ACTIVE"
    };

    activeEmergencyIncident = incidentPayload;

    // Setup initial agency states as QUEUED
    const agencyStates = EMERGENCY_AGENCIES.map(a => ({
        id: a.id,
        name: a.name,
        status: "QUEUED"
    }));

    // Post to backend API if available
    try {
        await fetch("http://localhost:8000/api/emergency/incident", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                incidentId: incidentId,
                latitude: telemetry.lat,
                longitude: telemetry.lng,
                riskLevel: telemetry.riskLevel,
                waterDepth: telemetry.waterDepth,
                rainfall: telemetry.rainfall,
                timestamp: timeStr,
                notes: userNotes
            })
        });
    } catch (e) {
        console.warn("Backend emergency API offline; continuing in local DEMO mode.");
    }

    closeEmergencyConfirmationModal();

    // Show Incident Active summary card
    const summaryBox = document.getElementById("emergencyStatusSummary");
    const incidentIdEl = document.getElementById("summaryIncidentId");
    const locEl = document.getElementById("summaryLoc");
    const riskEl = document.getElementById("summaryRisk");
    const depthEl = document.getElementById("summaryDepth");
    const rainEl = document.getElementById("summaryRain");

    if (incidentIdEl) incidentIdEl.textContent = incidentId;
    if (locEl) locEl.textContent = telemetry.locationName;
    if (riskEl) riskEl.textContent = telemetry.riskLevel;
    if (depthEl) depthEl.textContent = `${telemetry.waterDepth.toFixed(2)} m`;
    if (rainEl) rainEl.textContent = `${telemetry.rainfall.toFixed(1)} mm`;

    renderAgencyStatuses(agencyStates);
    if (summaryBox) summaryBox.classList.remove("hidden");

    // Add marker & popup on GIS map
    addEmergencyIncidentToMap(incidentPayload);

    showToast(`🚨 FLOOD INCIDENT ${incidentId} CREATED IN DEMO MODE.`);

    // Simulate agency status progression in DEMO MODE
    agencyStatusTimers.forEach(t => clearTimeout(t));
    agencyStatusTimers = [];

    agencyStates.forEach((agency, index) => {
        // Step 1: SENT after 1.5s - 3s
        const timer1 = setTimeout(() => {
            agency.status = "SENT";
            renderAgencyStatuses(agencyStates);
        }, 1500 + index * 800);

        // Step 2: ACKNOWLEDGED after 3.5s - 6s
        const timer2 = setTimeout(() => {
            agency.status = "ACKNOWLEDGED";
            renderAgencyStatuses(agencyStates);
        }, 3500 + index * 1000);

        // Step 3: RESPONDING after 6.5s - 10s
        const timer3 = setTimeout(() => {
            agency.status = "RESPONDING";
            renderAgencyStatuses(agencyStates);
        }, 6500 + index * 1200);

        agencyStatusTimers.push(timer1, timer2, timer3);
    });
}

function resolveEmergencyIncident() {
    if (!activeEmergencyIncident) return;

    if (emergencyMapMarker && globalDashboardMap) globalDashboardMap.removeLayer(emergencyMapMarker);
    if (emergencyPulseCircle && globalDashboardMap) globalDashboardMap.removeLayer(emergencyPulseCircle);

    emergencyMapMarker = null;
    emergencyPulseCircle = null;

    agencyStatusTimers.forEach(t => clearTimeout(t));
    agencyStatusTimers = [];

    const summaryBox = document.getElementById("emergencyStatusSummary");
    if (summaryBox) summaryBox.classList.add("hidden");

    showToast(`✅ Incident ${activeEmergencyIncident.incidentId} cleared.`);
    activeEmergencyIncident = null;
}

function initEmergencyResponseSystem() {
    const triggerBtn = document.getElementById("emergencyTriggerBtn");
    const headerTriggerBtn = document.getElementById("headerEmergencyBtn");
    const closeBtn = document.getElementById("modalCloseBtn");
    const cancelBtn = document.getElementById("modalCancelBtn");
    const initiateBtn = document.getElementById("modalInitiateBtn");
    const viewMapBtn = document.getElementById("viewIncidentMapBtn");
    const cancelIncidentBtn = document.getElementById("cancelIncidentBtn");
    const modalOverlay = document.getElementById("emergencyModalOverlay");

    if (triggerBtn) {
        triggerBtn.addEventListener("click", openEmergencyConfirmationModal);
    }

    if (headerTriggerBtn) {
        headerTriggerBtn.addEventListener("click", () => {
            const dashSec = document.getElementById("dashboard");
            if (dashSec) dashSec.scrollIntoView({ behavior: "smooth" });
            openEmergencyConfirmationModal();
        });
    }

    if (closeBtn) closeBtn.addEventListener("click", closeEmergencyConfirmationModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeEmergencyConfirmationModal);
    if (initiateBtn) initiateBtn.addEventListener("click", initiateEmergencyResponse);

    if (viewMapBtn) {
        viewMapBtn.addEventListener("click", () => {
            const mapEl = document.getElementById("dashboardMap");
            if (mapEl) mapEl.scrollIntoView({ behavior: "smooth" });
            if (emergencyMapMarker) emergencyMapMarker.openPopup();
        });
    }

    if (cancelIncidentBtn) {
        cancelIncidentBtn.addEventListener("click", resolveEmergencyIncident);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) closeEmergencyConfirmationModal();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modalOverlay && !modalOverlay.classList.contains("hidden")) {
            closeEmergencyConfirmationModal();
        }
    });
}