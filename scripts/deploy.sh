#!/bin/bash

# Event Manager Deployment Script

echo "🚀 Event Manager Deployment Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if git remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  No GitHub remote found. Please set up GitHub first:"
    echo "   1. Create repository at https://github.com/new"
    echo "   2. Run: git remote add origin https://github.com/YOUR_USERNAME/event-manager.git"
    echo "   3. Run this script again"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🧪 Running build test..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

echo "✅ Build successful!"

echo "📤 Pushing to GitHub..."
git add .
git commit -m "🔄 Update before deployment $(date)"
git push origin main

echo "🎯 Ready for Vercel deployment!"
echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com"
echo "2. Import your GitHub repository"
echo "3. Add environment variable:"
echo "   NEXT_PUBLIC_API_ENDPOINT=https://xsg0riey7e.execute-api.us-east-1.amazonaws.com/prod/eventcalendar"
echo "4. Deploy!"
echo ""
echo "🎉 Done! Your app will be live shortly."