#!/bin/bash
# Script to check if the route is being built correctly

echo "🔍 Checking Next.js build for /pricing/property-advertising route..."
echo ""

# Check if .next folder exists
if [ ! -d ".next" ]; then
    echo "❌ .next folder not found. Run 'npm run build' first."
    exit 1
fi

echo "✅ .next folder exists"
echo ""

# Check standalone output
if [ -d ".next/standalone" ]; then
    echo "✅ Standalone output found"
    
    # Check if route exists in standalone
    if [ -d ".next/standalone/app/pricing/property-advertising" ]; then
        echo "✅ Route found in standalone: .next/standalone/app/pricing/property-advertising"
        ls -la .next/standalone/app/pricing/property-advertising/
    else
        echo "❌ Route NOT found in standalone output"
        echo "Checking standalone structure:"
        find .next/standalone/app -type d -name "pricing" 2>/dev/null || echo "No pricing folder found"
    fi
else
    echo "❌ Standalone output not found"
fi

echo ""
echo "Checking static output:"
if [ -d ".next/static" ]; then
    echo "✅ Static output found"
else
    echo "❌ Static output not found"
fi

echo ""
echo "Checking build manifest:"
if [ -f ".next/BUILD_ID" ]; then
    echo "✅ Build ID: $(cat .next/BUILD_ID)"
else
    echo "❌ Build ID not found"
fi

echo ""
echo "Checking route manifest:"
if [ -f ".next/routes-manifest.json" ]; then
    echo "✅ Routes manifest found"
    if grep -q "property-advertising" .next/routes-manifest.json 2>/dev/null; then
        echo "✅ Route found in routes manifest"
    else
        echo "⚠️  Route not found in routes manifest (might be dynamic)"
    fi
else
    echo "⚠️  Routes manifest not found"
fi

echo ""
echo "Checking app directory structure:"
if [ -d "app/pricing/property-advertising" ]; then
    echo "✅ Source route exists: app/pricing/property-advertising"
    ls -la app/pricing/property-advertising/
else
    echo "❌ Source route NOT found: app/pricing/property-advertising"
fi

echo ""
echo "📋 Build summary:"
echo "To rebuild: npm run build"
echo "To check build logs: npm run build 2>&1 | tee build.log"
