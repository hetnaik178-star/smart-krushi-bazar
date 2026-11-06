@echo off
title Stop Smart Krushi Bazar
echo ====================================================
echo   Stopping Smart Krushi Bazar Services...
echo ====================================================

:: Stop processes on port 5000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000 "') do (
    if not "%%a"=="0" taskkill /f /pid %%a >nul 2>&1
)

:: Stop processes on port 5173
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 "') do (
    if not "%%a"=="0" taskkill /f /pid %%a >nul 2>&1
)

echo All services stopped successfully.
exit
