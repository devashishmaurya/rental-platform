#!/bin/bash
# Run this script ON THE SERVER to debug deployment issues
# Usage: ssh root@103.174.103.7 'bash -s' < server-debug.sh

set -e

echo "🔍 Debugging Next.js deployment on server..."
echo ""

cd /opt/rentsetu/frontend || { echo "❌ Cannot find /opt/rentsetu/frontend"; exit 1; }

echo "1️⃣ Checking source files..."
if [ -d "app/pricing/property-advertising" ]; then
    echo "✅ Route source exists: app/pricing/property-advertising"
    ls -la app/pricing/property-advertising/
else
    echo "❌ Route source NOT found!"
    exit 1
fi

echo ""
echo "2️⃣ Checking Docker container..."
if docker compose ps nextjs-app | grep -q "Up"; then
    echo "✅ Container is running"
else
    echo "⚠️  Container is not running"
fi

echo ""
echo "3️⃣ Checking if route exists in running container..."
ROUTE_CHECK=$(docker compose exec -T nextjs-app find .next -name "property-advertising" -type d 2>/dev/null || echo "")
if [ -n "$ROUTE_CHECK" ]; then
    echo "✅ Route found in container: $ROUTE_CHECK"
    docker compose exec -T nextjs-app ls -la .next/server/app/pricing/property-advertising/ 2>/dev/null || echo "Cannot list route files"
else
    echo "❌ Route NOT found in container!"
    echo "This means the build didn't include the route."
fi

echo ""
echo "4️⃣ Checking build logs..."
if [ -f "/tmp/docker-build.log" ]; then
    echo "Build log found. Checking for errors..."
    if grep -i "error\|failed\|property-advertising" /tmp/docker-build.log | tail -20; then
        echo ""
    else
        echo "No obvious errors found in build log"
    fi
else
    echo "⚠️  Build log not found. Rebuilding to capture logs..."
fi

echo ""
echo "5️⃣ Testing route directly..."
CONTAINER_IP=$(docker compose exec -T nextjs-app hostname -i 2>/dev/null | tr -d '\r' || echo "localhost")
echo "Testing route inside container (internal): http://localhost:8080/pricing/property-advertising"
docker compose exec -T nextjs-app wget -q -O - http://localhost:8080/pricing/property-advertising 2>&1 | head -20 || echo "Cannot test route"

echo ""
echo "6️⃣ Checking Next.js server.js..."
docker compose exec -T nextjs-app grep -i "property-advertising\|pricing" server.js 2>/dev/null | head -5 || echo "Route not found in server.js (this might be normal for app router)"

echo ""
echo "7️⃣ Container logs (last 30 lines)..."
docker compose logs --tail=30 nextjs-app

echo ""
echo "📋 Summary:"
echo "If route is not found in container, rebuild with:"
echo "  cd /opt/rentsetu/frontend"
echo "  docker compose build --no-cache --build-arg NEXT_PUBLIC_KEYCLOAK_URL=http://103.174.103.7:8081 --build-arg NEXT_PUBLIC_SITE_URL=http://103.174.103.7:8082 --build-arg NEXT_PUBLIC_API_URL=http://103.174.103.7:8080 nextjs-app"
echo "  docker compose up -d nextjs-app"
