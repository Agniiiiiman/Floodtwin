$ErrorActionPreference = "Stop"

Write-Host "Creating OSRM data directory..."
New-Item -ItemType Directory -Force -Path "osrm_data" | Out-Null

Write-Host "Downloading South Mumbai pilot ward OSM data via Overpass..."
$bbox = "18.89,72.77,19.03,72.85"
$query = "[out:xml][timeout:90];(node($bbox);<;);out body;"
$overpass_url = "https://overpass-api.de/api/interpreter"
Invoke-WebRequest -Uri $overpass_url -Method Post -Body $query -OutFile "osrm_data\mumbai.osm"

Write-Host "Extracting routing graph..."
docker run -t -v "$($PWD.Path)\osrm_data:/data" osrm/osrm-backend osrm-extract -p /opt/car.lua /data/mumbai.osm

Write-Host "Partitioning routing graph..."
docker run -t -v "$($PWD.Path)\osrm_data:/data" osrm/osrm-backend osrm-partition /data/mumbai.osrm

Write-Host "Customizing routing graph..."
docker run -t -v "$($PWD.Path)\osrm_data:/data" osrm/osrm-backend osrm-customize /data/mumbai.osrm

Write-Host "Done! You can run the server with:"
Write-Host "docker run -d -p 5000:5000 -v `"$($PWD.Path)\osrm_data:/data`" osrm/osrm-backend osrm-routed --algorithm mld /data/mumbai.osrm"
