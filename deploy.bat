@echo off
echo 🚀 United Internship Deployment Script
echo ======================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if MySQL is installed
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ❌ MySQL is not installed. Please install MySQL first.
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Setup database
echo 🗄️  Setting up database...
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS united_internship;"
mysql -u root -p united_internship < database_setup.sql

REM Start the application
echo 🚀 Starting the application...
npm start

echo ✅ Deployment complete! Your app is running on http://localhost:3000
pause 