# URGENT: Fix Keycloak Configuration on Server

## The Problem
Your app is still using old Keycloak settings (`myrealm` and `nextjs-app`) because the Docker image was built with old environment variables.

## The Solution - Do This NOW on Your Server

### Step 1: SSH into your server
```bash
ssh user@103.174.103.7
```

### Step 2: Navigate to your project directory
```bash
cd /path/to/your/project  # Where your docker-compose.yml or Dockerfile is
```

### Step 3: Update the `.env` file (if using docker-compose)
```bash
nano .env
```

Make sure these lines are set (port mode as earlier: UI `:8082`, API `:8080`, Keycloak `:8081`):
```env
NEXT_PUBLIC_KEYCLOAK_URL=http://YOUR_VPS_IP:8081
NEXT_PUBLIC_KEYCLOAK_REALM=rentsetu
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rentsetu-client
NEXT_PUBLIC_SITE_URL=http://YOUR_VPS_IP:8082
NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:8080
```

Save and exit (Ctrl+X, then Y, then Enter)

### Step 4: Rebuild the Docker image (REQUIRED!)

**Option A: If using docker-compose:**
```bash
docker compose build --no-cache --build-arg NEXT_PUBLIC_KEYCLOAK_URL=http://YOUR_VPS_IP:8081 --build-arg NEXT_PUBLIC_KEYCLOAK_REALM=rentsetu --build-arg NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rentsetu-client --build-arg NEXT_PUBLIC_SITE_URL=http://YOUR_VPS_IP:8082 --build-arg NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:8080 nextjs-app
docker compose up -d nextjs-app
```

**Option B: If building manually:**
```bash
cd rental-platform  # or wherever your Dockerfile is
docker build --no-cache \
  --build-arg NEXT_PUBLIC_KEYCLOAK_URL=http://YOUR_VPS_IP:8081 \
  --build-arg NEXT_PUBLIC_KEYCLOAK_REALM=rentsetu \
  --build-arg NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rentsetu-client \
  --build-arg NEXT_PUBLIC_SITE_URL=http://YOUR_VPS_IP:8082 \
  --build-arg NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:8080 \
  -t rental-platform .
docker restart <container-name>
```

### Step 5: Verify it worked
1. Open browser: your app URL (NEXT_PUBLIC_SITE_URL)
2. Open DevTools (F12) → Console
3. Look for: `Keycloak Configuration Check` - should show `realm: "rentsetu"` and `clientId: "rentsetu-client"`
4. Click "Sign in" - the redirect URL should show:
   - ✅ `realms/rentsetu` (not `realms/myrealm`)
   - ✅ `client_id=rentsetu-client` (not `client_id=nextjs-app`)

## Why This Happened

Next.js embeds `NEXT_PUBLIC_*` environment variables into the JavaScript bundle **at build time**. When you:
- ✅ Changed `.env` locally
- ✅ Pushed code
- ❌ Restarted server (NOT ENOUGH!)

The old values were still baked into the JavaScript. You **MUST rebuild** the Docker image.

## Quick One-Liner (if using docker-compose)

```bash
docker compose build --no-cache --build-arg NEXT_PUBLIC_KEYCLOAK_URL=http://YOUR_VPS_IP:8081 --build-arg NEXT_PUBLIC_SITE_URL=http://YOUR_VPS_IP:8082 --build-arg NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:8080 nextjs-app && docker compose up -d nextjs-app
```

## Still Not Working?

Check logs:
```bash
docker compose logs -f nextjs-app
```

Look for the "Keycloak Configuration Check" log message to see what values are being used.
