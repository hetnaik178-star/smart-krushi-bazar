@echo off
title Smart Krushi Bazar - Restore Database
echo ====================================================
echo   Restoring Smart Krushi Bazar Database from JSON...
echo ====================================================
echo.

:: Ensure MongoDB service is running
net start MongoDB >nul 2>&1

cd /d "%~dp0backend"
node src/utils/restoreDatabase.js

echo.
echo ====================================================
echo   Database restored successfully into MongoDB!
echo ====================================================
pause
