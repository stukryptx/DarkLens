#!/bin/bash

echo -e "\e[34m[DarkLens]\e[0m Starting Setup..."

# Backend Setup
echo -e "\e[34m[DarkLens]\e[0m Installing Backend Dependencies..."
cd backend
npm install

echo -e "\e[34m[DarkLens]\e[0m Installing Playwright Browsers..."
npx playwright install chromium
cd ..

# Frontend Setup
echo -e "\e[34m[DarkLens]\e[0m Installing Frontend Dependencies..."
cd frontend
npm install
cd ..

echo -e "\e[32m[DarkLens]\e[0m Setup Complete! You can now run ./start.sh"
