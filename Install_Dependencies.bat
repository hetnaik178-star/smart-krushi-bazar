@echo off
title Install Dependencies - Smart Krushi Bazar
echo ====================================================
echo   Smart Krushi Bazar - Installing Dependencies
echo ====================================================

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js (v18+) from: https://nodejs.org
    pause
    exit /b 1
)

echo.
echo [1/2] Installing Backend Dependencies...
cd /d "%~dp0backend"
call npm install

echo.
echo [2/2] Installing Frontend Dependencies...
cd /d "%~dp0frontend"
call npm install

echo.
echo ====================================================
echo  All dependencies installed successfully!
echo  You can now run Start_Smart_Krushi_Bazar.bat
echo ====================================================
cd /d "%~dp0"
pause
