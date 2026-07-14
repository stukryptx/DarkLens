#!/bin/bash

# Source user profile to ensure Node/NPM are in PATH when run as a background daemon
if [ -f "$HOME/.bashrc" ]; then
    source "$HOME/.bashrc"
fi
if [ -f "$HOME/.nvm/nvm.sh" ]; then
    source "$HOME/.nvm/nvm.sh"
fi

echo -e "\e[34m[DarkLens]\e[0m Fetching latest updates from repository..."
git pull || echo -e "\e[33m[DarkLens]\e[0m Could not fetch updates. Starting anyway..."

echo -e "\e[34m[DarkLens]\e[0m Booting Command Center..."

# Function to handle cleanup on exit
cleanup() {
    echo -e "\n\e[33m[DarkLens]\e[0m Shutting down services..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit 0
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT SIGTERM

# Start Backend
echo -e "\e[34m[DarkLens]\e[0m Starting Backend API on port 5000..."
cd backend
node server.js &
BACKEND_PID=$!
cd ..

# Wait a second for backend to initialize
sleep 2

# Start Frontend
echo -e "\e[34m[DarkLens]\e[0m Starting Frontend Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "\e[32m[DarkLens]\e[0m Systems Online! Press Ctrl+C to stop."
echo -e "-> Frontend: http://localhost:5173"
echo -e "-> Backend: http://localhost:5000"

# Wait for both background processes
wait $BACKEND_PID $FRONTEND_PID
