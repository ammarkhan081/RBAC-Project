@echo off
TITLE Secure Role-Based AI Assistant for Enterprise Finance
COLOR 0A

echo ======================================================================
echo    SECURE ROLE-BASED AI ASSISTANT FOR ENTERPRISE FINANCE
echo              Team Leader: Ammar Ayaz (Cohort 11)
echo ======================================================================
echo.

REM 1. Verify Prerequisites
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH!
    pause
    exit /b 1
)

node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    pause
    exit /b 1
)

echo [1/3] Launching FastAPI Backend (Port 8000)...
start "FinSight 2.0 Backend (FastAPI :8000)" cmd /k "cd /d ""%~dp0backend"" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/3] Launching Next.js Frontend (Port 3000)...
start "FinSight 2.0 Frontend (Next.js :3000)" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 4 /nobreak >nul

echo Opening FinSight 2.0 in your default browser...
start http://localhost:3000

echo.
echo ======================================================================
echo   FinSight 2.0 is LIVE!
echo   Frontend UI:  http://localhost:3000
echo   Backend API:  http://localhost:8000/docs
echo.
echo   Demo Personas:
echo   - Admin (C-Level):    admin / admin123
echo   - Natasha (HR):       Natasha / hr123
echo   - Bruce (Marketing):  Bruce / mkt123
echo   - Alex (Finance):     Alex / fin123
echo   - Nolan (General):    Nolan / gen123
echo ======================================================================
echo.
