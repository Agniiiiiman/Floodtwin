$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$dataPath = Join-Path $scriptRoot "osrm_data"
$osmPath = Join-Path $dataPath "mumbai_pilot.osm"
$image = "osrm/osrm-backend:latest"
$containerName = "streetflood-osrm"

Write-Host "Checking Docker Desktop Linux engine..."
docker info | Out-Null
if ($LASTEXITCODE -ne 0) {
	throw "Docker Desktop is installed but its Linux engine is not running. Start Docker Desktop and retry."
}

New-Item -ItemType Directory -Force -Path $dataPath | Out-Null
$volumePath = (Resolve-Path $dataPath).Path

if (-not (Test-Path $osmPath)) {
	Write-Host "Downloading the small South Mumbai pilot road extract from Overpass..."
	$bbox = "18.89,72.77,19.03,72.85"
	$query = "[out:xml][timeout:180];way[highway]($bbox);(._;>;);out body;"
	$overpassUrl = "https://overpass.kumi.systems/api/interpreter"
	$encodedQuery = [System.Uri]::EscapeDataString($query)
	Invoke-WebRequest -Uri "${overpassUrl}?data=$encodedQuery" -Method Get -OutFile $osmPath
}

if (-not (Test-Path $osmPath) -or (Get-Item $osmPath).Length -lt 1000) {
	throw "The pilot OSM extract was not downloaded correctly: $osmPath"
}

Write-Host "Pulling the self-hosted OSRM image..."
docker pull $image

Write-Host "Preparing OSRM routing graph..."
docker run --rm -v "${volumePath}:/data" $image osrm-extract -p /opt/car.lua /data/mumbai_pilot.osm
docker run --rm -v "${volumePath}:/data" $image osrm-partition /data/mumbai_pilot.osrm
docker run --rm -v "${volumePath}:/data" $image osrm-customize /data/mumbai_pilot.osrm

docker rm -f $containerName 2>$null | Out-Null
Write-Host "Starting local OSRM on Windows port 5000..."
docker run -d --name $containerName -p 5000:5000 -v "${volumePath}:/data" $image osrm-routed --algorithm mld /data/mumbai_pilot.osrm

Write-Host "OSRM is starting. Verify with:"
Write-Host "Invoke-WebRequest 'http://127.0.0.1:5000/route/v1/driving/72.82,18.96;72.835,18.975?overview=full&geometries=geojson'"
