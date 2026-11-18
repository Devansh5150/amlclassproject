@echo off
REM ============================================================
REM  Double-click this file to start the whole app.
REM  It opens 2 windows (backend + frontend) and then the browser.
REM  To stop the app: close the two black windows.
REM ============================================================
cd /d "%~dp0"

echo Starting backend (FastAPI) on http://127.0.0.1:8000 ...
start "Backend - FastAPI" cmd /k "venv\Scripts\python -m uvicorn backend.app.main:app --port 8000"

echo Starting frontend (React) on http://127.0.0.1:5173 ...
start "Frontend - React" cmd /k "cd frontend && npm run dev"

REM Give both servers a few seconds to start, then open the website
ping 127.0.0.1 -n 7 >nul
start "" http://127.0.0.1:5173
