#!/bin/bash

# FTA Invoice Pro - Setup Script for Unix/Linux/Mac

echo "Installing FTA Invoice Pro..."
echo ""

# Check if Node.js and npm are installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install Node.js and npm first."
    exit 1
fi

echo "[1/4] Installing npm dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Error: Failed to install npm dependencies"
    exit 1
fi

echo ""
echo "[2/4] Generating Prisma client..."
npm run prisma:generate
if [ $? -ne 0 ]; then
    echo "Error: Failed to generate Prisma client"
    exit 1
fi

echo ""
echo "[3/4] Creating .env.local file..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✓ .env.local created. Please configure it with your database URL"
else
    echo "✓ .env.local already exists, skipping..."
fi

echo ""
echo "[4/4] Setup complete! ✓"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your PostgreSQL connection string"
echo "2. Run: npm run prisma:migrate"
echo "3. Start dev server: npm run dev"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "For more information, see README.md"
