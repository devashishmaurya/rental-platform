#!/bin/bash
# Deployment script for server deployment
# This script packages, transfers, and rebuilds the Docker container

set -e  # Exit on error

SERVER="root@103.174.103.7"
SERVER_PATH="/opt/rentsetu"
CONTAINER_NAME="nextjs-app"

echo "🚀 Starting deployment process..."

# Step 1: Create tar archive (excluding node_modules, .next, .git)
echo "📦 Creating deployment package..."
echo "🔍 Verifying LoginModal exists before packaging..."
if [ ! -f "components/ui/LoginModal.tsx" ]; then
    echo "❌ ERROR: components/ui/LoginModal.tsx not found!"
    exit 1
fi
echo "✅ LoginModal.tsx found"

tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='frontend.tar.gz' \
    --exclude='*.log' \
    -czf frontend.tar.gz .

# Verify LoginModal is in tar
if ! tar -tzf frontend.tar.gz | grep -q "components/ui/LoginModal.tsx"; then
    echo "❌ ERROR: LoginModal.tsx not included in tar archive!"
    exit 1
fi
echo "✅ LoginModal.tsx included in archive"

# Step 2: Transfer to server
echo "📤 Transferring files to server..."
scp frontend.tar.gz ${SERVER}:${SERVER_PATH}/

# Step 3: Extract and rebuild on server
echo "🔨 Extracting and rebuilding on server..."
ssh ${SERVER} << 'ENDSSH'
cd /opt/rentsetu

# Port mode: Frontend :8082, Keycloak :8081, API :8080
# Keycloak runs on 8081 – app talks to Keycloak at this URL
SITE_URL="${NEXT_PUBLIC_SITE_URL:-http://103.174.103.7:8082}"
KEYCLOAK_URL="${NEXT_PUBLIC_KEYCLOAK_URL:-http://103.174.103.7:8081}"
API_URL="${NEXT_PUBLIC_API_URL:-http://103.174.103.7:8080}"
KEYCLOAK_SERVER_URL="${KEYCLOAK_SERVER_URL:-http://103.174.103.7:8081}"
KEYCLOAK_ADMIN_URL="${NEXT_PUBLIC_KEYCLOAK_ADMIN_URL:-http://103.174.103.7:8081}"

# Extract files
echo "📂 Extracting files..."
tar -xzf frontend.tar.gz -C frontend/
rm frontend.tar.gz

# Verify route exists
echo "🔍 Verifying route exists..."
if [ ! -d "frontend/app/pricing/property-advertising" ]; then
    echo "❌ ERROR: Route not found: app/pricing/property-advertising"
    exit 1
fi
echo "✅ Route found: app/pricing/property-advertising"

# Verify LoginModal exists
echo "🔍 Verifying LoginModal exists..."
if [ ! -f "frontend/components/ui/LoginModal.tsx" ]; then
    echo "❌ ERROR: LoginModal.tsx not found!"
    echo "Files in components/ui/:"
    ls -la frontend/components/ui/ || echo "components/ui directory not found"
    exit 1
fi
echo "✅ LoginModal.tsx found"

# Rebuild Docker image with build args (KEYCLOAK_URL, SITE_URL, API_URL set above in heredoc from server .env)
echo "🔨 Rebuilding Docker image (this will take a few minutes)..."
cd frontend

# Build with verbose output to catch errors
docker compose build --progress=plain --no-cache \
  --build-arg NEXT_PUBLIC_KEYCLOAK_URL="$KEYCLOAK_URL" \
  --build-arg NEXT_PUBLIC_KEYCLOAK_ADMIN_URL="$KEYCLOAK_ADMIN_URL" \
  --build-arg NEXT_PUBLIC_KEYCLOAK_REALM=rentsetu \
  --build-arg NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rentsetu-client \
  --build-arg NEXT_PUBLIC_SITE_URL="$SITE_URL" \
  --build-arg NEXT_PUBLIC_API_URL="$API_URL" \
  ${CONTAINER_NAME} 2>&1 | tee /tmp/docker-build.log

# Check if build succeeded
if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo "❌ Docker build failed! Check /tmp/docker-build.log"
    exit 1
fi

# Verify route was built
echo "🔍 Checking if route was built in Docker image..."
BUILD_OUTPUT=$(docker compose run --rm ${CONTAINER_NAME} find .next -name "property-advertising" -type d 2>/dev/null || echo "")
if [ -z "$BUILD_OUTPUT" ]; then
    echo "⚠️  WARNING: Route not found in build output"
    echo "Checking build structure..."
    docker compose run --rm ${CONTAINER_NAME} ls -la .next/server/app/pricing/ 2>/dev/null || echo "Cannot check build structure"
else
    echo "✅ Route found in build: $BUILD_OUTPUT"
fi

# Stop and remove old container
echo "🛑 Stopping old container..."
docker compose stop ${CONTAINER_NAME} || true
docker compose rm -f ${CONTAINER_NAME} || true

# Start new container
echo "▶️  Starting new container..."
docker compose up -d ${CONTAINER_NAME}

# Wait for container to start
sleep 5

# Show logs
echo "📋 Container logs (last 50 lines):"
docker compose logs --tail=50 ${CONTAINER_NAME}

# Check if container is running
if docker compose ps ${CONTAINER_NAME} | grep -q "Up"; then
    echo "✅ Container is running"
else
    echo "❌ Container failed to start!"
    docker compose logs ${CONTAINER_NAME}
    exit 1
fi

echo "✅ Deployment complete!"
echo "🌐 Check your app at: ${SITE_URL}/pricing/property-advertising"
echo ""
echo "Keycloak: app uses proxy ${KEYCLOAK_URL} (browser → same origin). Set KEYCLOAK_SERVER_URL=${KEYCLOAK_SERVER_URL} in your container env so /api/keycloak can forward to Keycloak."
ENDSSH

# Cleanup local tar
rm -f frontend.tar.gz

echo "✨ Deployment finished successfully!"
echo ""
echo "To check logs on server, run:"
echo "  ssh ${SERVER} 'cd ${SERVER_PATH}/frontend && docker compose logs -f ${CONTAINER_NAME}'"
echo ""
echo "To check if route exists in container:"
echo "  ssh ${SERVER} 'cd ${SERVER_PATH}/frontend && docker compose exec ${CONTAINER_NAME} find .next -name \"property-advertising\" -type d'"
