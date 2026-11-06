@echo off
title Smart Krushi Bazar Launcher
echo ====================================================
echo   Starting Smart Krushi Bazar...
echo ====================================================

:: 1. Ensure MongoDB is running
net start MongoDB >nul 2>&1

:: 2. Clean up any previous processes on Port 5000 and 5173
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000 "') do (
    if not "%%a"=="0" taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 "') do (
    if not "%%a"=="0" taskkill /f /pid %%a >nul 2>&1
)

:: 3. Start Backend in background
start "SKB-Backend" /min cmd /c call "%~dp0run_backend.bat"

:: 4. Start Frontend in background
start "SKB-Frontend" /min cmd /c call "%~dp0run_frontend.bat"

:: 5. Wait for servers to prime (3 seconds sleep using ping)
ping 127.0.0.1 -n 4 >nul

:: 6. Launch browser
start http://localhost:5173
exit
