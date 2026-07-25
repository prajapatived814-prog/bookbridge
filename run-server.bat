@echo off
title Book Bridge Server Starter
echo ==================================================
echo   📚 BOOK BRIDGE BACKEND SERVER STARTER 📚
echo ==================================================
echo.

:: Check Node.js
echo Checking Node.js installation...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ❌ [ERROR] Node.js was not found on your system!
    echo.
    echo Opening fallback static launcher or starting PowerShell web server...
    powershell -NoProfile -ExecutionPolicy Bypass -File server.ps1
    pause
    exit /b
)

echo.
echo ✅ Node.js detected!
echo Starting backend server on port 8000...
echo Opening http://localhost:8000 in your default browser...
echo.

:: Open default browser to the running web page
start http://localhost:8000

:: Start Node server
node server.js

pause
