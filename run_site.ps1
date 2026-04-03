Set-Location $PSScriptRoot
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '.\.venv\Scripts\python.exe' '.\app\server.py' --host 127.0.0.1 --port 8030"
Start-Sleep -Seconds 2
Start-Process "http://127.0.0.1:8030"
