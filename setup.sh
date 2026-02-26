#!/bin/bash

# MediDiet Backend - Setup Script
# This script automates the backend setup process

set -e  # Exit on error

echo "🏥 MediDiet Backend - Automated Setup"
echo "======================================"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found!"
    echo ""
    echo "Creating .env.local with template values..."
    echo "⚠️  IMPORTANT: You MUST update these values:"
    echo "   - GEMINI_API_KEY (from Google Cloud)"
    echo "   - JWT_SECRET (already has default for dev)"
    echo ""
    
    cat > .env.local << 'EOF'
# Backend Environment Variables
MONGODB_URI=mongodb+srv://shubhamnayak1972_db_user:dTDW6o1nA0MhYkTZ@dietplan-cluster.zfkzayl.mongodb.net/dietplan?retryWrites=true&w=majority
JWT_SECRET=dev-secret-key-min-32-chars-prod-must-change-this
GEMINI_API_KEY=INSERT_YOUR_GEMINI_API_KEY_HERE
PORT=5000
NODE_ENV=development
EOF
    
    echo "✅ Created .env.local"
    echo "   📝 Edit .env.local and add your GEMINI_API_KEY"
    echo ""
fi

# Navigate to backend folder
if [ -d "backend" ]; then
    cd backend
    echo "📁 Entered backend folder"
else
    echo "❌ backend folder not found!"
    echo "   Make sure you run this script from the project root"
    exit 1
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
if npm install; then
    echo "✅ Dependencies installed"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build TypeScript
echo ""
echo "🔨 Building TypeScript..."
if npm run build; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "📋 Next Steps:"
echo "   1. Edit ../.env.local and add GEMINI_API_KEY"
echo "   2. Run: npm run dev"
echo "   3. Server will start at http://localhost:5000"
echo ""
echo "🧪 Test the API:"
echo "   curl http://localhost:5000/"
echo ""
echo "📚 Documentation:"
echo "   - START_HERE.md - Quick 2-minute overview"
echo "   - QUICK_START.md - 5-minute setup"
echo "   - README.md - Full documentation"
echo "   - TESTING_GUIDE.md - How to test"
echo ""
