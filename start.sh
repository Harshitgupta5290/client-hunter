#!/bin/bash

# Client Hunter - Application Startup Script
# This script starts the Next.js development server

set -e

echo "Starting Client Hunter..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "Killing existing Next.js server on port 3000..."
fuser -k 3000/tcp 2>/dev/null || true

echo "Starting development server..."
npm run dev
