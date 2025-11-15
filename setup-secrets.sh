#!/bin/bash

# Setup Cloudflare Workers Secrets
# This script adds all environment variables as secrets to Cloudflare Workers

set -e

echo "🔐 Setting up Cloudflare Workers secrets..."
echo ""

# Export Cloudflare API token
export CLOUDFLARE_API_TOKEN="VraMsRotGQgVQ0C6EjBRSSO1EG63jO-ADiOYGcjo"

# Read secrets from .env.production
if [ ! -f ".env.production" ]; then
  echo "❌ .env.production file not found!"
  exit 1
fi

# Function to add secret
add_secret() {
  local key=$1
  local value=$2
  
  if [ -z "$value" ] || [ "$value" == "<"* ]; then
    echo "⏭️  Skipping $key (not set or placeholder)"
    return
  fi
  
  echo "📝 Adding secret: $key"
  echo "$value" | pnpm wrangler secret put "$key" --env production 2>&1 | grep -v "Creating the secret"  || true
}

echo "📋 Reading secrets from .env.production..."
echo ""

# Database
add_secret "DATABASE_URL" "postgresql://postgres.whbkhcfxoaikpadmapny:Trading27100976-1@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"

# Supabase
add_secret "SUPABASE_URL" "https://whbkhcfxoaikpadmapny.supabase.co"
add_secret "SUPABASE_ANON_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoYmtoY2Z4b2Fpa3BhZG1hcG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzgzOTUsImV4cCI6MjA3ODQ1NDM5NX0.UP0DM_My2yOJBW2127abwwHFerk4nT1dy4IyRozWuh8"
add_secret "SUPABASE_SERVICE_ROLE_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoYmtoY2Z4b2Fpa3BhZG1hcG55Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg3ODM5NSwiZXhwIjoyMDc4NDU0Mzk1fQ.Qe3bk11YG3nrGwU-kEKVJ5HvN_OR3Wcm6GZYbzG4fs8"

# Redis
add_secret "UPSTASH_REDIS_REST_URL" "https://intent-catfish-31372.upstash.io"
add_secret "UPSTASH_REDIS_REST_TOKEN" "AXqMAAIncDJhZDY1YTk5MzNlZTM0OTk5YTU2YWU4ZmM3NGYwYmFhNXAyMzEzNzI"

# Email
add_secret "RESEND_API_KEY" "re_Yi2396AM_FUTrE1RhJD9pq4nGbmsfh91g"

# AI APIs
add_secret "QWEN_API_KEY" "sk-c14f9b9897434fc09000a0511855b722"
add_secret "DEEPSEEK_API_KEY" "sk-5a1ba42ef8c74d7f8202e481b5de5cf0"

# JWT
add_secret "JWT_SECRET" "LO1RJezZXh6a/wzWqyH4Z+zHA8bgG9GwghsVcNOlMxE="

echo ""
echo "✅ All secrets configured!"
echo ""
echo "📊 Summary:"
echo "  - Database: Supabase PostgreSQL"
echo "  - Cache: Upstash Redis"
echo "  - Email: Resend"
echo "  - AI: Qwen + DeepSeek"
echo "  - Auth: JWT"
echo ""
echo "🚀 Ready to deploy!"
