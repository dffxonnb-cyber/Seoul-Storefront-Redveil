@echo off
cd /d %~dp0
set "PYTHON_EXE=.venv\Scripts\python.exe"
if not exist "%PYTHON_EXE%" set "PYTHON_EXE=python"
"%PYTHON_EXE%" -m streamlit run ".\app\streamlit_app.py" --server.headless true --server.port 8501
