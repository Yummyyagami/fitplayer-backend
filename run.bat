@echo off
echo Starting local offline server...
echo.

:: Check if Node.js is installed
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/ to run this server.
    pause
    exit /b
)

:: Open the browser automatically
start http://localhost:3000

:: Run the server
node server.js
pause
