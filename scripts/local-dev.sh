#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to run the Tailwind watcher. Please install Node.js/npm and try again."
  exit 1
fi

if ! command -v python >/dev/null 2>&1; then
  echo "python is required to run the Django development server. Please install Python and try again."
  exit 1
fi

echo "Starting Tailwind CSS watcher..."
npm run tailwind:watch &
TAILWIND_PID=$!

cleanup() {
  echo
  echo "Stopping Tailwind watcher..."
  kill "$TAILWIND_PID" >/dev/null 2>&1 || true
}

trap cleanup EXIT INT TERM

echo "Launching Django development server..."
echo "Visit http://127.0.0.1:8000 once the server boots."
python src/manage.py runserver 0.0.0.0:8000

