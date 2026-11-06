@echo off
title Smart Krushi Bazar - Export Database
echo ====================================================
echo   Exporting Smart Krushi Bazar MongoDB Database...
echo ====================================================
echo.

cd /d "%~dp0backend"
node src/utils/exportDatabase.js

echo.
echo ====================================================
echo   Export completed! Check the 'database' folder.
echo ====================================================
pause
