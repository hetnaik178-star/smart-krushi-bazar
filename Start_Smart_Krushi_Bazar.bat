@echo off
title Smart Krushi Bazar Launcher
echo ====================================================
echo   Starting Smart Krushi Bazar...
echo ====================================================

:: 1. Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please download and install Node.js (v18+) from: https://nodejs.org
    pause
    exit /b 1
)

:: 2. Auto-create .env files from .env.example if missing
if not exist "%~dp0backend\.env" (
    if exist "%~dp0backend\.env.example" (
        echo [SETUP] Creating backend/.env from .env.example...
        copy "%~dp0backend\.env.example" "%~dp0backend\.env" >nul
    )
)
if not exist "%~dp0frontend\.env" (
    if exist "%~dp0frontend\.env.example" (
        echo [SETUP] Creating frontend/.env from .env.example...
        copy "%~dp0frontend\.env.example" "%~dp0frontend\.env" >nul
    )
)

:: 3. Auto-install dependencies if fresh ZIP download
if not exist "%~dp0backend\node_modules" (
    echo [SETUP] Installing backend packages (npm install)...
    cd /d "%~dp0backend"
    call npm install
)

if not exist "%~dp0frontend\node_modules" (
    echo [SETUP] Installing frontend packages (npm install)...
    cd /d "%~dp0frontend"
    call npm install
)

cd /d "%~dp0"

:: 4. Ensure MongoDB is running
net start MongoDB >nul 2>&1

:: 5. Clean up any previous processes on Port 5000 and 5173
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000 "') do (
    if not "%%a"=="0" taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 "') do (
    if not "%%a"=="0" taskkill /f /pid %%a >nul 2>&1
)

:: 6. Start Backend in background
start "SKB-Backend" /min cmd /c call "%~dp0run_backend.bat"

:: 7. Start Frontend in background
start "SKB-Frontend" /min cmd /c call "%~dp0run_frontend.bat"

:: 8. Wait for servers to prime (3 seconds sleep using ping)
ping 127.0.0.1 -n 4 >nul

:: 9. Launch browser
start http://localhost:5173
exit
