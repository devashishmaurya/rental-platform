# Server Deployment Guide

## Problem: 404 Errors After Deployment

If you're getting 404 errors for new routes after deploying, it's because **Next.js needs to be rebuilt inside Docker**. Simply restarting the container won't rebuild the app.

## Why This Happens

1. Next.js builds routes at **build time** (during `npm run build`)
2. The Dockerfile runs `npm run build` during **image build**, not container start
3. Copying new files and restarting doesn't rebuild - you need to rebuild the Docker image

## Solution: Rebuild Docker Image

### Option 1: Use the Deployment Script (Recommended)

```bash
./deploy-to-server.sh
```

This script will:
1. Package your code (excluding node_modules, .next, .git)
2. Transfer to server
3. Extract files
4. **Rebuild Docker image** with correct build args
5. Restart container

### Option 2: Manual Deployment

#### On Your Local Machine:

```bash
# 1. Create tar archive
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='frontend.tar.gz' \
    -czf frontend.tar.gz .

# 2. Transfer to server
scp frontend.tar.gz root@103.174.103.7:/opt/rentsetu/
```

#### On Server (SSH into server):

```bash
# SSH into server
ssh root@103.174.103.7

# Navigate to project directory
cd /opt/rentsetu

# Extract files
tar -xzf frontend.tar.gz -C frontend/
rm frontend.tar.gz

# IMPORTANT: Rebuild Docker image (not just restart!)
cd frontend
docker compose build --no-cache \
  --build-arg NEXT_PUBLIC_KEYCLOAK_URL=http://YOUR_VPS_IP:8081 \
  --build-arg NEXT_PUBLIC_KEYCLOAK_REALM=rentsetu \
  --build-arg NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rentsetu-client \
  --build-arg NEXT_PUBLIC_SITE_URL=http://YOUR_VPS_IP:8082 \
  --build-arg NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:8080 \
  nextjs-app

# Stop old container
docker compose stop nextjs-app
docker compose rm -f nextjs-app

# Start new container
docker compose up -d nextjs-app

# Check logs
docker compose logs -f nextjs-app
```

## Key Differences

### ❌ Wrong (Just Restarting):
```bash
docker compose down nextjs-app
docker compose up -d nextjs-app
```
This only restarts the container with the **old built code**.

### ✅ Correct (Rebuilding):
```bash
docker compose build --no-cache nextjs-app
docker compose up -d nextjs-app
```
This rebuilds the Next.js app with **new code**.

## Build Arguments Required

The Docker build needs these build arguments for Next.js environment variables:

- `NEXT_PUBLIC_KEYCLOAK_URL` (e.g. http://YOUR_VPS_IP:8081)
- `NEXT_PUBLIC_KEYCLOAK_REALM=rentsetu`
- `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rentsetu-client`
- `NEXT_PUBLIC_SITE_URL` (e.g. http://YOUR_VPS_IP)
- `NEXT_PUBLIC_API_URL` (e.g. http://YOUR_VPS_IP:8080)

No fixed ports required — use your public URLs.

These are embedded into the JavaScript bundle at **build time**, not runtime.

## Verify Deployment

After rebuilding, check:

1. **Container is running:**
   ```bash
   docker compose ps
   ```

2. **Check logs for errors:**
   ```bash
   docker compose logs -f nextjs-app
   ```

3. **Test the new route:**
   ```
   NEXT_PUBLIC_SITE_URL/pricing/property-advertising (e.g. http://YOUR_VPS_IP/pricing/property-advertising)
   ```

4. **Check if route exists in build:**
   ```bash
   docker compose exec nextjs-app ls -la .next/server/app/pricing/property-advertising/
   ```

## Troubleshooting

### Still Getting 404?

1. **Check if route exists in build:**
   ```bash
   docker compose exec nextjs-app find .next -name "property-advertising" -type d
   ```

2. **Verify files were extracted:**
   ```bash
   ls -la /opt/rentsetu/frontend/app/pricing/property-advertising/
   ```

3. **Check build logs for errors:**
   ```bash
   docker compose logs nextjs-app | grep -i error
   ```

4. **Force rebuild without cache:**
   ```bash
   docker compose build --no-cache nextjs-app
   ```

### Build Takes Too Long?

- Remove `--no-cache` flag (but first build should use it)
- Or use Docker layer caching by only copying changed files

## Quick Reference

```bash
# Full deployment (from local machine)
./deploy-to-server.sh

# Or manual steps:
# 1. Package and transfer
tar --exclude='node_modules' --exclude='.next' --exclude='.git' -czf frontend.tar.gz .
scp frontend.tar.gz root@103.174.103.7:/opt/rentsetu/

# 2. On server: extract, rebuild, restart
ssh root@103.174.103.7
cd /opt/rentsetu && tar -xzf frontend.tar.gz -C frontend/ && rm frontend.tar.gz
cd frontend && docker compose build --no-cache --build-arg NEXT_PUBLIC_KEYCLOAK_URL=http://YOUR_VPS_IP:8081 --build-arg NEXT_PUBLIC_KEYCLOAK_REALM=rentsetu --build-arg NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rentsetu-client --build-arg NEXT_PUBLIC_SITE_URL=http://YOUR_VPS_IP:8082 --build-arg NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:8080 nextjs-app
docker compose up -d nextjs-app
```
