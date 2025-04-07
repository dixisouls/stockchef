#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting API Documentation Generator...${NC}"
echo -e "${BLUE}=====================================${NC}"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python is not installed. Please install Python 3.8 or higher.${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 14 or higher.${NC}"
    exit 1
fi

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}Backend .env file not found. Please create one from the example.${NC}"
    exit 1
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${RED}Frontend .env file not found. Please create one from the example.${NC}"
    exit 1
fi

# Start backend server
echo -e "${GREEN}Starting backend server...${NC}"
cd backend || exit
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null
echo -e "${GREEN}Backend dependencies installed.${NC}"

# Start backend in the background
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo -e "${GREEN}Backend server started at http://localhost:8000${NC}"

# Start frontend server
echo -e "${GREEN}Starting frontend server...${NC}"
cd ../frontend || exit
echo -e "${GREEN}Frontend dependencies installed.${NC}"
npm start &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend server started at http://localhost:3000${NC}"

echo -e "${BLUE}=====================================${NC}"
echo -e "${GREEN}API Documentation Generator is running!${NC}"
echo -e "${BLUE}Backend:${NC} http://localhost:8000"
echo -e "${BLUE}Frontend:${NC} http://localhost:3000"
echo -e "${BLUE}=====================================${NC}"
echo -e "Press Ctrl+C to stop the servers"

# Wait for user to press Ctrl+C
trap 'kill $BACKEND_PID $FRONTEND_PID; echo -e "${GREEN}Servers stopped${NC}"; exit 0' INT
wait