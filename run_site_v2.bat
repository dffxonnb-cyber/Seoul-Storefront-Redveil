@echo off
cd /d "%~dp0app\site"
start powershell -NoExit -Command "python -m http.server 8040"
timeout /t 2 >nul
start http://127.0.0.1:8040/v2/index.html
