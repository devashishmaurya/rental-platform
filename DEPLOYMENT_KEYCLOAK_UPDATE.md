# Updating Keycloak Configuration on Server

## Problem
The app is using old Keycloak settings (`myrealm` and `nextjs-app`) instead of new ones (`rentsetu` and `rentsetu-client`).

## Solution

### Option 1: Update Dockerfile Defaults (Already Done)
The Dockerfile defaults have been updated to:
- `NEXT_PUBLIC_KEYCLOAK_REALM=rentsetu`
- `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rentsetu-client`

### Option 2: Pass Build Args During Docker Build

If you're building manually, pass the build args:

```bash
docker build \
  --build-arg NEXT_PUBLIC_KEYCLOAK_URL=http://YOUR_VPS_IP:8081 \
  --build-arg NEXT_PUBLIC_KEYCLOAK_REALM=rentsetu \
  --build-arg NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rentsetu-client \
  --build-arg NEXT_PUBLIC_SITE_URL=http://YOUR_VPS_IP:8082 \
  --build-arg NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:8080 \
  -t rental-platform .
```

### Option 3: Update docker-compose Environment Variables

If you're using docker-compose, update the `.env` file on your server (next to your compose file):

```env
NEXT_PUBLIC_KEYCLOAK_URL=http://YOUR_VPS_IP:8081
NEXT_PUBLIC_KEYCLOAK_REALM=rentsetu
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rentsetu-client
NEXT_PUBLIC_SITE_URL=http://YOUR_VPS_IP:8082
NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:8080
```
(UI+API can be served without ports via reverse proxy; keep Keycloak on `:8081` unless reverse-proxied.)

Then rebuild and restart:

```bash
docker compose build --no-cache nextjs-app
docker compose up -d nextjs-app
```

## Important Notes

1. **Next.js requires `NEXT_PUBLIC_*` variables at BUILD TIME**, not just runtime
2. You MUST rebuild the Docker image after changing these variables
3. Just restarting the container won't work - the values are baked into the build

## Steps to Fix Your Current Deployment

1. **SSH into your server** (`103.174.103.7`)

2. **Navigate to your project directory** (where docker-compose.yml or Dockerfile is)

3. **Update the `.env` file** (if using docker-compose):
   ```bash
   nano .env
   ```
   Update to:
   ```env
   NEXT_PUBLIC_KEYCLOAK_URL=http://YOUR_VPS_IP:8081
   NEXT_PUBLIC_KEYCLOAK_REALM=rentsetu
   NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rentsetu-client
   NEXT_PUBLIC_SITE_URL=http://YOUR_VPS_IP:8082
   NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:8080
   ```

4. **Rebuild the Docker image** (with no cache to ensure fresh build):
   ```bash
   # If using docker-compose:
   docker compose build --no-cache nextjs-app
   docker compose up -d nextjs-app
   
   # OR if building manually:
   docker build --no-cache \
     --build-arg NEXT_PUBLIC_KEYCLOAK_URL=http://YOUR_VPS_IP:8081 \
     --build-arg NEXT_PUBLIC_KEYCLOAK_REALM=rentsetu \
     --build-arg NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rentsetu-client \
     --build-arg NEXT_PUBLIC_SITE_URL=http://YOUR_VPS_IP:8082 \
     --build-arg NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:8080 \
     -t rental-platform .
   ```

5. **Restart the container**:
   ```bash
   docker compose restart nextjs-app
   # OR
   docker restart <container-name>
   ```

6. **Verify** by checking the browser console at your app URL (NEXT_PUBLIC_SITE_URL):
   - Open DevTools (F12) → Console
   - Look for "Keycloak Configuration Check"
   - Should show: `realm: "rentsetu"`, `clientId: "rentsetu-client"`

## Why This Happened

Next.js embeds `NEXT_PUBLIC_*` environment variables into the JavaScript bundle at **build time**. When you:
- Changed `.env` locally ✅
- Pushed code ✅
- Restarted server ❌ (not enough!)

The old values were still baked into the built JavaScript. You need to **rebuild** the Docker image so Next.js can embed the new values.

## Quick Verification

After rebuilding, when you click "Sign in", the redirect URL should show:
```
<KEYCLOAK_URL>/realms/rentsetu/protocol/openid-connect/auth?client_id=rentsetu-client&...
```

Instead of:
```
<KEYCLOAK_URL>/realms/myrealm/protocol/openid-connect/auth?client_id=nextjs-app&...
```
