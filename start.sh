#!/bin/bash

# Diabetes Readmission Analysis Portfolio Startup Script
echo "🚀 Starting Diabetes Readmission Analysis Portfolio..."
echo "=================================================="

# Check if CSV files exist
if [ ! -f "diabetic_data.csv" ]; then
    echo "❌ Error: diabetic_data.csv not found in current directory"
    echo "Please ensure the CSV files are in the root directory"
    exit 1
fi

if [ ! -f "IDS_mapping.csv" ]; then
    echo "❌ Error: IDS_mapping.csv not found in current directory"
    echo "Please ensure the CSV files are in the root directory"
    exit 1
fi

echo "✅ CSV files found"

# Function to start Flask backend
start_backend() {
    echo "🐍 Starting Flask backend..."
    cd backend
    python3 app.py &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
    cd ..
    
    # Wait a moment for backend to start
    sleep 5
}

# Function to start Node.js frontend
start_frontend() {
    echo "🟢 Starting Node.js frontend..."
    cd frontend
    npm start &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
    cd ..
}

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend stopped"
    fi
    echo "👋 Goodbye!"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start services
start_backend
start_frontend

echo ""
echo "🎉 Services started successfully!"
echo "=================================================="
echo "📊 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "📈 Health Check: http://localhost:3000/health"
echo ""
echo "Press Ctrl+C to stop all services"
echo "=================================================="

# Wait for user to stop
wait
