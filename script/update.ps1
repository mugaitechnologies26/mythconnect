# Myth Connect.ai - Windows Deployment & Auto-Start Script
# Repository: https://github.com/mugaitechnologies26/mythconnect.git

$ErrorActionPreference = "Stop"

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "          MYTH CONNECT.AI - WINDOWS LIVE STARTUP & RUNNER                       " -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan

$ROOT_DIR = (Resolve-Path "$PSScriptRoot\..").Path
Set-Location $ROOT_DIR

Write-Host "[1/5] Working Directory: $ROOT_DIR" -ForegroundColor Green

# 2. Check Node
Write-Host "`n[2/5] Checking Node.js and npm..." -ForegroundColor Blue
node -v
npm -v

# 3. Environment
Write-Host "`n[3/5] Checking environment..." -ForegroundColor Blue
if (-not (Test-Path "$ROOT_DIR\backend-node\.env")) {
    if (Test-Path "$ROOT_DIR\backend-node\.env.example") {
        Copy-Item "$ROOT_DIR\backend-node\.env.example" "$ROOT_DIR\backend-node\.env"
        Write-Host "  ✔ Created backend-node\.env from .env.example" -ForegroundColor Green
    }
}

# 4. Build Frontend if dist doesn't exist
Write-Host "`n[4/5] Checking frontend build..." -ForegroundColor Blue
if (-not (Test-Path "$ROOT_DIR\frontend\dist\index.html")) {
    Write-Host "  Building frontend..." -ForegroundColor Yellow
    Set-Location "$ROOT_DIR\frontend"
    npm run build
    Set-Location $ROOT_DIR
} else {
    Write-Host "  ✔ Frontend build dist is ready." -ForegroundColor Green
}

# 5. Start Server
Write-Host "`n[5/5] Starting Myth Connect.ai Unified Server..." -ForegroundColor Blue
Write-Host "  Web App & API available at: http://localhost:5000" -ForegroundColor Green
Write-Host "  Press Ctrl+C to stop.`n" -ForegroundColor Yellow

Set-Location "$ROOT_DIR\backend-node"
node server.js
