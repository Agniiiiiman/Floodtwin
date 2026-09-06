/* =====================================================
   THEME TOGGLE  (light / dark — main site)
   Default: light.  Persisted via localStorage.
===================================================== */

(function () {

    const STORAGE_KEY = "e404-theme";
    const html        = document.documentElement;

    /* Apply saved or default theme immediately (no flash) */
    const saved = localStorage.getItem(STORAGE_KEY) || "light";
    html.setAttribute("data-theme", saved);


    document.addEventListener("DOMContentLoaded", () => {

        const btn = document.getElementById("themeToggle");
        if (!btn) return;


        btn.addEventListener("click", () => {

            const current = html.getAttribute("data-theme") || "light";
            const next    = current === "light" ? "dark" : "light";

            html.setAttribute("data-theme", next);
            localStorage.setItem(STORAGE_KEY, next);

            showToast(next === "dark"
                ? "🌙  Dark mode enabled"
                : "☀️  Light mode enabled"
            );

        });

    });

}());


/* =====================================================
   MOBILE NAVIGATION
===================================================== */


const menuToggle =
    document.getElementById("menuToggle");

const navLinks =
    document.getElementById("navLinks");


menuToggle.addEventListener("click", () => {

    navLinks.classList.toggle("open");

});


document
    .querySelectorAll(".nav-links a")
    .forEach(link => {

        link.addEventListener("click", () => {

            navLinks.classList.remove("open");

        });

    });



/* =====================================================
   NAVBAR SCROLL
===================================================== */

window.addEventListener("scroll", () => {

    const navbar =
        document.getElementById("navbar");

    if (window.scrollY > 30) {

        navbar.classList.add("scrolled");

    } else {

        navbar.classList.remove("scrolled");

    }

});



/* =====================================================
   RAIN ANIMATION
===================================================== */

const rain =
    document.getElementById("rain");


for (let i = 0; i < 90; i++) {

    const drop =
        document.createElement("span");

    drop.className = "drop";

    drop.style.left =
        Math.random() * 100 + "%";

    drop.style.animationDelay =
        Math.random() * 2 + "s";

    drop.style.animationDuration =
        0.7 +
        Math.random() * 1.2 +
        "s";

    rain.appendChild(drop);

}



/* =====================================================
   SCROLL REVEAL
===================================================== */

const revealObserver =
    new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add(
                        "visible"
                    );

                    revealObserver.unobserve(
                        entry.target
                    );

                }

            });

        },

        {
            threshold: 0.12
        }

    );


document
    .querySelectorAll(".reveal")
    .forEach(element => {

        revealObserver.observe(element);

    });



/* =====================================================
   LIVE FLOOD DATA
===================================================== */

async function updateLiveData() {
    try {
        // Pilot ward: South Mumbai (lat: 18.96, lon: 72.82)
        const res = await fetch("http://localhost:8000/api/forecast?lat=18.96&lng=72.82");
        const data = await res.json();
        
        const water = data.depth_m;
        const load = data.risk === "Critical" ? 95 : data.risk === "High" ? 80 : data.risk === "Medium" ? 60 : 30;
        const rainfall = data.rainfall_mm_hr;
        
        document.getElementById("waterLevel").innerHTML = `${water}<span> m</span>`;
        document.getElementById("networkLoad").innerHTML = `${load}<span>%</span>`;
        document.getElementById("rainfall").textContent = rainfall;
        
        const riskText = document.getElementById("riskText");
        const riskDot = document.querySelector(".risk-dot");
        
        if (data.risk === "Critical" || data.risk === "High") {
            riskText.textContent = "High flood risk - " + (data.reason || "");
            riskDot.style.background = "#ef4141";
            riskDot.style.boxShadow = "0 0 12px #ef4141";
        } else if (data.risk === "Medium") {
            riskText.textContent = "Moderate flood risk - " + (data.reason || "");
            riskDot.style.background = "#f4ad21";
            riskDot.style.boxShadow = "0 0 12px #f4ad21";
        } else {
            riskText.textContent = "Low flood risk - " + (data.reason || "");
            riskDot.style.background = "#55e5a3";
            riskDot.style.boxShadow = "0 0 12px #55e5a3";
        }
    } catch (e) {
        console.error("Failed to fetch live data:", e);
    }
}

setInterval(updateLiveData, 30000); // poll every 30s instead of 2.5s for real backend

/* =====================================================
   DASHBOARD MAP TABS
===================================================== */
document.querySelectorAll(".map-toolbar button").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".map-toolbar button").forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        showToast(`${button.textContent.trim()} layer selected`);
        // Actual layer toggling logic would go here
    });
});

/* =====================================================
   WHAT-IF SIMULATION
===================================================== */
document.getElementById("simulateBtn").addEventListener("click", () => {
    // keeping as mock as per instructions, or maybe could trigger an API
    document.getElementById("peakDepth").textContent = (0.8 + Math.random() * 0.45).toFixed(1);
    document.getElementById("criticalNodes").textContent = String(Math.floor(4 + Math.random() * 5)).padStart(2, "0");
    showToast("What-if simulation complete: drainage blockage scenario recalculated.");
});

/* =====================================================
   REFRESH BUTTON
===================================================== */
document.getElementById("refreshBtn").addEventListener("click", () => {
    updateLiveData();
    showToast("Flood network data refreshed.");
});

/* =====================================================
   SAFE ROUTE
===================================================== */
const routeBtn = document.getElementById("routeBtn");
if (routeBtn) {
    routeBtn.addEventListener("click", async () => {
        const startStr = document.getElementById("routeStart").value;
        const endStr = document.getElementById("routeEnd").value;
        if (!startStr || !endStr) {
            showToast("Please enter start and end coordinates");
            return;
        }
        
        try {
            const start = startStr.split(',').map(Number);
            const end = endStr.split(',').map(Number);
            const res = await fetch("http://localhost:8000/api/route", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    start_lat: start[0], start_lng: start[1],
                    end_lat: end[0], end_lng: end[1]
                })
            });
            const data = await res.json();
            const statusDiv = document.getElementById("routeStatus");
            if (data.route) {
                statusDiv.textContent = data.safe_status + ". " + data.safe_duration;
                showToast("Safe route calculated.");
            } else {
                statusDiv.textContent = data.error || "Failed";
            }
        } catch (e) {
            console.error(e);
            document.getElementById("routeStatus").textContent = "Error connecting to server";
        }
    });
}

/* =====================================================
   CITIZEN REPORT
===================================================== */
const reportBtn = document.getElementById("reportBtn");
if (reportBtn) {
    reportBtn.addEventListener("click", async () => {
        const loc = document.getElementById("reportLocation").value;
        const status = document.getElementById("reportStatus").value;
        const desc = document.getElementById("reportDesc").value;
        if (!loc) {
            showToast("Please enter location");
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
            document.getElementById("reportMsg").textContent = data.message;
            showToast(data.message);
        } catch (e) {
            document.getElementById("reportMsg").textContent = "Error submitting report";
        }
    });
}



/* =====================================================
   TOAST
===================================================== */

let toastTimer;


function showToast(message) {

    const toast =
        document.getElementById("toast");


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 3200);

}


/* =====================================================
   DASHBOARD LEAFLET MAP & GEOLOCATION
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const mapContainer = document.getElementById("dashboardMap");
    const loadingOverlay = document.getElementById("dashboardMapLoading");
    if (!mapContainer) return; // Only run if the dashboard map exists on this page

    // Default location (e.g., New Delhi) if geolocation fails or is denied
    const defaultLocation = [28.6139, 77.2090];
    let dashboardMap;
    let userMarker;
    let riskCircle;

    function initDashboardMap(lat, lon, isExactLocation) {
        if (loadingOverlay) loadingOverlay.style.display = "none";

        dashboardMap = L.map('dashboardMap', {
            zoomControl: false // Keep it clean for the dashboard, or true if preferred
        }).setView([lat, lon], 13);
        
        // Add zoom control manually to position it nicely if wanted
        L.control.zoom({ position: 'bottomright' }).addTo(dashboardMap);

        // Dark theme OSM tiles (reusing the styling from the rainfall map via CSS)
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(dashboardMap);

        // Add a marker for the location
        userMarker = L.circleMarker([lat, lon], {
            radius: 8,
            fillColor: '#17bdf5',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(dashboardMap);

        // Simulate a "risk zone" around the user for the dashboard aesthetic
        riskCircle = L.circle([lat, lon], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.2,
            radius: 1500 // 1.5km radius
        }).addTo(dashboardMap);

        const popupText = isExactLocation ? "<b>Your Location</b><br>Monitoring active" : "<b>Default Location</b><br>Location access denied";
        userMarker.bindPopup(popupText).openPopup();

        // Optional: Force a resize after a short delay in case the container size changed
        setTimeout(() => {
            dashboardMap.invalidateSize();
        }, 100);
    }

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                initDashboardMap(lat, lon, true);
                showToast("Map centered on your location.");
            },
            (error) => {
                console.warn("Geolocation error:", error);
                initDashboardMap(defaultLocation[0], defaultLocation[1], false);
                showToast("Using default location (access denied).");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        // Geolocation not supported
        initDashboardMap(defaultLocation[0], defaultLocation[1], false);
        showToast("Geolocation not supported by browser.");
    }
});