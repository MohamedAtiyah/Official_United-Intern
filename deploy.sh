#!/bin/bash

echo "🚀 United Internship Deployment Script"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup database
echo "🗄️  Setting up database..."
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS united_internship;"
mysql -u root -p united_internship < database_setup.sql

# Start the application
echo "🚀 Starting the application..."
npm start

echo "✅ Deployment complete! Your app is running on http://localhost:3000" 