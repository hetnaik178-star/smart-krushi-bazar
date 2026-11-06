# Smart Krushi Bazar - High-Reliability Background Service Launcher
$ErrorActionPreference = "SilentlyContinue"

$projectRoot = $PSScriptRoot
$backendDir = "$projectRoot\backend"
$frontendDir = "$projectRoot\frontend"

# 1. Ensure MongoDB Service is running
$mongoSvc = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoSvc -and $mongoSvc.Status -ne "Running") {
    Start-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

# 2. Clean up any existing stale processes on Port 5000 and 5173
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    foreach ($p in $port5000.OwningProcess) {
        if ($p -and $p -gt 0) { Stop-Process -Id $p -Force -ErrorAction SilentlyContinue }
    }
}

$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    foreach ($p in $port5173.OwningProcess) {
        if ($p -and $p -gt 0) { Stop-Process -Id $p -Force -ErrorAction SilentlyContinue }
    }
}

Start-Sleep -Milliseconds 600

# 3. Launch Backend with node.exe directly in working directory
Start-Process -FilePath "node.exe" -ArgumentList "src/server.js" -WorkingDirectory "$backendDir" -WindowStyle Hidden

# 4. Launch Frontend Vite Dev Server with cmd.exe in working directory
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev -- --port 5173" -WorkingDirectory "$frontendDir" -WindowStyle Hidden

# 5. Wait for both servers to be actively listening (max 15 seconds)
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Milliseconds 500
    try {
        $conn5000 = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue
        $conn5173 = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
        if ($conn5000 -and $conn5173) {
            $ready = $true
            break
        }
    } catch {}
}

# Extra safety pause so Vite HMR / index bundle is fully primed
Start-Sleep -Milliseconds 600

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

$targetUrl = "http://localhost:5173"
if ($chromeExe) {
    Start-Process $chromeExe -ArgumentList $targetUrl
} else {
    Start-Process $targetUrl
}
