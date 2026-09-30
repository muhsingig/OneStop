@echo off
rem Serves the OneStop website at http://localhost:5173 and opens it in your browser.
rem Close this window to stop the server.
cd /d "%~dp0onestop-site"
python build.py
cd dist
start "" http://localhost:5173
python -m http.server 5173
