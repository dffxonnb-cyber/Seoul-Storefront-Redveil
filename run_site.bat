@echo off
cd /d %~dp0
echo Starting local server on http://127.0.0.1:8030
start "RedTeamServer" powershell -NoExit -Command "Set-Location '%cd%'; & '.\\.venv\\Scripts\\python.exe' '.\\app\\server.py' --host 127.0.0.1 --port 8030"
timeout /t 2 > nul
start "" "http://127.0.0.1:8030"
