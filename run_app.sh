#!/usr/bin/env bash
# FinSight 2.0 - One-Click Launcher for Linux / macOS
# Team Leader: Ammar Ayaz

set -e

echo "======================================================================"
echo "    SECURE ROLE-BASED AI ASSISTANT FOR ENTERPRISE FINANCE"
echo "              Team Leader: Ammar Ayaz (Cohort 11)"
echo "======================================================================"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[1/2] Starting FastAPI Backend on :8000..."
(cd "$ROOT_DIR/backend" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload) &
BACKEND_PID=$!

echo "[2/2] Starting Next.js Frontend on :3000..."
(cd "$ROOT_DIR/frontend" && npm run dev) &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit" SIGINT SIGTERM EXIT

echo "Both services started. Navigate to http://localhost:3000"
wait
