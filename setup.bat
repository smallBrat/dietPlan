@echo off
REM MediDiet Backend - Setup Script for Windows
REM This script automates the backend setup process

setlocal enabledelayedexpansion

echo.
echo 🏥 MediDiet Backend - Automated Setup (Windows)
echo ======================================
echo.

REM Check if .env.local exists
if not exist ".env.local" (
    echo ⚠️  .env.local not found!
    echo.
    echo Creating .env.local with template values...
    echo ⚠️  IMPORTANT: You MUST update these values:
    echo    - GEMINI_API_KEY (from Google Cloud)
    echo    - JWT_SECRET (already has default for dev)
    echo.
    
    (
        echo # Backend Environment Variables
        echo MONGODB_URI=mongodb+srv://shubhamnayak1972_db_user:dTDW6o1nA0MhYkTZ@dietplan-cluster.zfkzayl.mongodb.net/dietplan?retryWrites=true^&w=majority
        echo JWT_SECRET=dev-secret-key-min-32-chars-prod-must-change-this
        echo GEMINI_API_KEY=INSERT_YOUR_GEMINI_API_KEY_HERE
        echo PORT=5000
        echo NODE_ENV=development
    ) > .env.local
    
    echo ✅ Created .env.local
    echo    📝 Edit .env.local and add your GEMINI_API_KEY
    echo.
)

REM Navigate to backend folder
if exist "backend" (
    cd backend
    echo 📁 Entered backend folder
) else (
    echo ❌ backend folder not found!
    echo    Make sure you run this script from the project root
    pause
    exit /b 1
)

REM Install dependencies
echo.
echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

REM Build TypeScript
echo.
echo 🔨 Building TypeScript...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)
echo ✅ Build successful

echo.
echo ======================================
echo ✅ Setup Complete!
echo ======================================
echo.
echo 📋 Next Steps:
echo    1. Edit ..\.env.local and add GEMINI_API_KEY
echo    2. Run: npm run dev
echo    3. Server will start at http://localhost:5000
echo.
echo 🧪 Test the API:
echo    curl http://localhost:5000/
echo.
echo 📚 Documentation:
echo    - START_HERE.md - Quick 2-minute overview
echo    - QUICK_START.md - 5-minute setup
echo    - README.md - Full documentation
echo    - TESTING_GUIDE.md - How to test
echo.
pause
