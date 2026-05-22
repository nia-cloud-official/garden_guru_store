#!/bin/bash

# Garden Guru Store Setup Script
# This script helps you set up the Next.js store quickly

echo "🌿 Garden Guru Store - Setup Script"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm --version) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found"
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.local and add your Supabase credentials!"
    echo ""
else
    echo "✅ .env.local already exists"
    echo ""
fi

# Create images directory if it doesn't exist
if [ ! -d "public/images/products" ]; then
    echo "📁 Creating images directory..."
    mkdir -p public/images/products
    echo "✅ Images directory created"
    echo ""
fi

echo "✨ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit .env.local with your Supabase credentials"
echo "   2. Run the SQL schema in Supabase (supabase-schema.sql)"
echo "   3. Add product images to public/images/products/"
echo "   4. Run: npm run dev"
echo "   5. Visit: http://localhost:3001"
echo ""
echo "📚 Documentation:"
echo "   - QUICKSTART.md - Quick start guide"
echo "   - README.md - Full documentation"
echo "   - MIGRATION_GUIDE.md - Migration from PHP"
echo ""
echo "Happy selling! 🌿"
