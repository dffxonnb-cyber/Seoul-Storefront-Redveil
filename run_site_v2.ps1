Set-Location (Join-Path $PSScriptRoot "app\site")
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m http.server 8040"
Start-Sleep -Seconds 2
Start-Process "http://127.0.0.1:8040/v2/index.html"
