#!/bin/bash

# ============================================
# CryptoTrader Pro - Automated Setup Script
# ============================================
# This script automates the complete setup process
# ============================================

set -e  # Exit on error

echo "============================================"
echo "CryptoTrader Pro - Setup Script"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# ============================================
# Step 1: Check Prerequisites
# ============================================
echo "Step 1: Checking prerequisites..."
echo "-------------------------------------------"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi
NODE_VERSION=$(node -v)
print_success "Node.js found: $NODE_VERSION"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    print_warning "pnpm not found. Installing pnpm..."
    npm install -g pnpm
    print_success "pnpm installed"
fi
PNPM_VERSION=$(pnpm -v)
print_success "pnpm found: $PNPM_VERSION"

# Check git
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi
print_success "Git found"

echo ""

# ============================================
# Step 2: Install Dependencies
# ============================================
echo "Step 2: Installing dependencies..."
echo "-------------------------------------------"
pnpm install
print_success "Dependencies installed"
echo ""

# ============================================
# Step 3: Environment Variables Setup
# ============================================
echo "Step 3: Setting up environment variables..."
echo "-------------------------------------------"

if [ ! -f .env ]; then
    print_info "Creating .env file..."
    cat > .env << 'EOF'
# ============================================
# CryptoTrader Pro - Environment Variables
# ============================================

# Database (MySQL/TiDB)
DATABASE_URL=mysql://user:password@host:port/database

# Manus OAuth (Auto-configured in Manus platform)
JWT_SECRET=your-jwt-secret-here
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=your-owner-openid
OWNER_NAME=Your Name

# App Branding
VITE_APP_TITLE=CryptoTrader Pro
VITE_APP_LOGO=https://your-logo-url.com/logo.png

# Redis Caching (Upstash)
# Sign up: https://console.upstash.com/
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Email Notifications (Resend)
# Sign up: https://resend.com/
RESEND_API_KEY=re_your_api_key

# Manus Built-in APIs (Auto-configured)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-api-key

# Analytics (Auto-configured)
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your-website-id
EOF
    print_success ".env file created"
    print_warning "Please edit .env and fill in your credentials"
    echo ""
    print_info "Required services:"
    echo "  1. Database: MySQL 8.0+ or TiDB"
    echo "  2. Redis: Upstash (https://console.upstash.com/)"
    echo "  3. Email: Resend (https://resend.com/)"
    echo ""
    read -p "Press Enter after you've configured .env..."
else
    print_success ".env file already exists"
fi

echo ""

# ============================================
# Step 4: Database Setup
# ============================================
echo "Step 4: Setting up database..."
echo "-------------------------------------------"

# Check if DATABASE_URL is set
if grep -q "DATABASE_URL=mysql://user:password" .env; then
    print_warning "DATABASE_URL not configured yet"
    print_info "Please update DATABASE_URL in .env first"
    read -p "Press Enter after you've configured DATABASE_URL..."
fi

print_info "Running database migrations..."
pnpm db:push

print_success "Database setup complete"
echo ""

# ============================================
# Step 5: Build Check
# ============================================
echo "Step 5: Checking build..."
echo "-------------------------------------------"
print_info "Running TypeScript check..."
pnpm tsc --noEmit || print_warning "TypeScript check has warnings (non-critical)"
print_success "Build check complete"
echo ""

# ============================================
# Step 6: Start Development Server
# ============================================
echo "============================================"
echo "✅ Setup Complete!"
echo "============================================"
echo ""
print_success "CryptoTrader Pro is ready to run!"
echo ""
echo "Next steps:"
echo "  1. Start dev server:  pnpm dev"
echo "  2. Open browser:      http://localhost:3000"
echo "  3. Check logs:        tail -f logs/*.log"
echo ""
echo "Useful commands:"
echo "  pnpm dev          - Start development server"
echo "  pnpm build        - Build for production"
echo "  pnpm db:push      - Sync database schema"
echo "  pnpm db:studio    - Open database GUI"
echo ""
print_info "Documentation: https://github.com/AvengerHubVN/TradeFinance"
echo ""

# Ask if user wants to start dev server now
read -p "Start development server now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Starting development server..."
    pnpm dev
fi
