#!/bin/bash

# Ownzo Marketplace - Automated Setup Script
# This script helps you set up the development environment

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     🚀 Ownzo Marketplace - Automated Setup v1.0           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "📦 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "   Please install Node.js 20+ from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version is too old (need v18+)${NC}"
    echo "   Current version: $(node -v)"
    echo "   Please update Node.js: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js $(node -v) installed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} npm $(npm -v) installed"

# Check if Firebase CLI is installed
echo ""
echo "🔥 Checking Firebase CLI..."
if ! command -v firebase &> /dev/null; then
    echo -e "${YELLOW}⚠${NC}  Firebase CLI is not installed"
    read -p "   Would you like to install it now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm install -g firebase-tools
        echo -e "${GREEN}✓${NC} Firebase CLI installed"
    else
        echo -e "${YELLOW}⚠${NC}  Skipping Firebase CLI installation"
        echo "   You can install it later with: npm install -g firebase-tools"
    fi
else
    echo -e "${GREEN}✓${NC} Firebase CLI installed"
fi

# Check if .env.local exists
echo ""
echo "⚙️  Checking environment configuration..."
if [ -f ".env.local" ]; then
    echo -e "${YELLOW}⚠${NC}  .env.local already exists"
    read -p "   Do you want to overwrite it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp .env.local.example .env.local
        echo -e "${GREEN}✓${NC} Created new .env.local from template"
    else
        echo -e "${YELLOW}⚠${NC}  Keeping existing .env.local"
    fi
else
    if [ -f ".env.local.example" ]; then
        cp .env.local.example .env.local
        echo -e "${GREEN}✓${NC} Created .env.local from template"
    else
        echo -e "${RED}❌ .env.local.example not found${NC}"
        exit 1
    fi
fi

# Generate CSRF secret if not set
echo ""
echo "🔐 Generating CSRF secret..."
if grep -q "your_development_csrf_secret" .env.local 2>/dev/null; then
    CSRF_SECRET=$(openssl rand -base64 32)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your_development_csrf_secret_min_32_chars_long_random_string/$CSRF_SECRET/" .env.local
    else
        # Linux
        sed -i "s/your_development_csrf_secret_min_32_chars_long_random_string/$CSRF_SECRET/" .env.local
    fi
    echo -e "${GREEN}✓${NC} CSRF secret generated"
else
    echo -e "${GREEN}✓${NC} CSRF secret already set"
fi

# Check if node_modules exists
echo ""
echo "📚 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies (this may take 2-3 minutes)..."
    npm install
    echo -e "${GREEN}✓${NC} Dependencies installed"
else
    echo -e "${GREEN}✓${NC} Dependencies already installed"
    read -p "   Would you like to reinstall them? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "   Reinstalling dependencies..."
        rm -rf node_modules package-lock.json
        npm install
        echo -e "${GREEN}✓${NC} Dependencies reinstalled"
    fi
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  ✅ Setup Complete!                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📝 Next Steps:"
echo ""
echo "   1. Configure Firebase:"
echo "      • Create project: https://console.firebase.google.com/"
echo "      • Enable Authentication, Firestore, Storage"
echo "      • Get your Firebase config and service account key"
echo ""
echo "   2. Configure Cloudinary:"
echo "      • Sign up: https://cloudinary.com/"
echo "      • Get your cloud name, API key, and secret"
echo ""
echo "   3. Update .env.local with your credentials:"
echo "      nano .env.local"
echo ""
echo "   4. Deploy Firestore rules and indexes:"
echo "      firebase login"
echo "      firebase use your-project-id"
echo "      firebase deploy --only firestore:rules"
echo ""
echo "   5. Start the development server:"
echo "      npm run dev"
echo ""
echo "   6. Open in browser:"
echo "      http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "   • Quick Start:  QUICKSTART.md"
echo "   • Full Guide:   SETUP_AND_TEST_GUIDE.md"
echo "   • Deploy Guide: DEPLOYMENT_GUIDE.md"
echo ""
echo "🎉 Happy coding!"
echo ""
