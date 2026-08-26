# Smart Krushi Bazar - Background Service Launcher
$ErrorActionPreference = "SilentlyContinue"

$projectRoot = "d:\vc.het naik\smart-krushi-bazar"
$backendDir = "$projectRoot\backend"
$frontendDir = "$projectRoot\frontend"

# 1. Ensure MongoDB Service is running
$mongoSvc = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoSvc -and $mongoSvc.Status -ne "Running") {
    Start-Service -Name "MongoDB" -ErrorAction SilentlyContinue
}

# 2. Clean up any previous processes on Port 5000 and 5173
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    foreach ($p in $port5000.OwningProcess) {
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
}

$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    foreach ($p in $port5173.OwningProcess) {
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
}

Start-Sleep -Milliseconds 500

# 3. Start Backend in completely hidden background process using node src/server.js
Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d ""$backendDir"" && node src/server.js" -WindowStyle Hidden

Start-Sleep -Seconds 2

# 4. Start Frontend in completely hidden background process
Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d ""$frontendDir"" && npm run dev -- --host 127.0.0.1 --port 5173" -WindowStyle Hidden

# 5. Wait for Frontend & Backend to become ready (max 10 seconds)
$ready = $false
for ($i = 0; $i -lt 20; $i++) {
    try {
        $resF = Invoke-WebRequest -Uri "http://127.0.0.1:5173" -UseBasicParsing -TimeoutSec 1
        $resB = Invoke-RestMethod -Uri "http://localhost:5000" -Method Get -TimeoutSec 1
        if ($resF.StatusCode -eq 200 -and $resB) {
            $ready = $true
            break
        }
    } catch {
        Start-Sleep -Milliseconds 500
    }
}

# 6. Open in Google Chrome if installed, otherwise default browser
$chromePaths = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)

$chromeExe = $null
foreach ($cp in $chromePaths) {
    if (Test-Path $cp) {
        $chromeExe = $cp
        break
    }
}

if ($chromeExe) {
    Start-Process $chromeExe -ArgumentList "http://localhost:5173"
} else {
    Start-Process "http://localhost:5173"
}
