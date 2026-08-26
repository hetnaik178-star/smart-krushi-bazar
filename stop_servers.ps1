# Smart Krushi Bazar - Background Service Stopper
$ErrorActionPreference = "SilentlyContinue"

# Kill any processes on Port 5000 (Backend)
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    foreach ($p in $port5000.OwningProcess) {
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
}

# Kill any processes on Port 5173 (Frontend)
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    foreach ($p in $port5173.OwningProcess) {
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
}

# Also kill stray node processes running out of project folder
Get-WmiObject Win32_Process -Filter "name = 'node.exe'" | Where-Object { $_.CommandLine -like "*smart-krushi-bazar*" } | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}
