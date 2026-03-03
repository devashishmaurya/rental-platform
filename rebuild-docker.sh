#!/bin/bash
# Rebuild Docker image. Port mode (as earlier): Frontend :8082, Keycloak :8081, API :8080.

if ! command -v docker &>/dev/null; then
  echo "Error: docker not found. Install Docker and ensure it is in your PATH."
  echo "  Ubuntu/Debian: https://docs.docker.com/engine/install/ubuntu/"
  exit 1
fi

SITE_URL="${NEXT_PUBLIC_SITE_URL:-http://103.174.103.7:8082}"
# Keycloak runs on 8081 – app uses this URL to talk to Keycloak
KEYCLOAK_URL="${NEXT_PUBLIC_KEYCLOAK_URL:-http://103.174.103.7:8081}"
KEYCLOAK_ADMIN_URL="${NEXT_PUBLIC_KEYCLOAK_ADMIN_URL:-http://103.174.103.7:8081}"
API_URL="${NEXT_PUBLIC_API_URL:-http://103.174.103.7:8080}"

echo "Rebuilding Docker image (Keycloak: $KEYCLOAK_URL, Site: $SITE_URL)..."

if [ -f "docker-compose.yml" ] || [ -f 'version: "4.yaml' ]; then
    echo "Using docker-compose..."
    docker compose build --no-cache \
      --build-arg NEXT_PUBLIC_KEYCLOAK_URL="$KEYCLOAK_URL" \
      --build-arg NEXT_PUBLIC_KEYCLOAK_ADMIN_URL="$KEYCLOAK_ADMIN_URL" \
      --build-arg NEXT_PUBLIC_KEYCLOAK_REALM="${NEXT_PUBLIC_KEYCLOAK_REALM:-rentsetu}" \
      --build-arg NEXT_PUBLIC_KEYCLOAK_CLIENT_ID="${NEXT_PUBLIC_KEYCLOAK_CLIENT_ID:-rentsetu-client}" \
      --build-arg NEXT_PUBLIC_SITE_URL="$SITE_URL" \
      --build-arg NEXT_PUBLIC_API_URL="$API_URL" \
      nextjs-app
    docker compose up -d nextjs-app
    echo "Done! Check logs with: docker compose logs -f nextjs-app"
else
    echo "Building standalone Docker image..."
    docker build --no-cache \
        --build-arg NEXT_PUBLIC_KEYCLOAK_URL="$KEYCLOAK_URL" \
        --build-arg NEXT_PUBLIC_KEYCLOAK_ADMIN_URL="$KEYCLOAK_ADMIN_URL" \
        --build-arg NEXT_PUBLIC_KEYCLOAK_REALM="${NEXT_PUBLIC_KEYCLOAK_REALM:-rentsetu}" \
        --build-arg NEXT_PUBLIC_KEYCLOAK_CLIENT_ID="${NEXT_PUBLIC_KEYCLOAK_CLIENT_ID:-rentsetu-client}" \
        --build-arg NEXT_PUBLIC_SITE_URL="$SITE_URL" \
        --build-arg NEXT_PUBLIC_API_URL="$API_URL" \
        -t rental-platform .
    echo "Done! Start container with: docker run -d -p 8082:8080 rental-platform"
fi
