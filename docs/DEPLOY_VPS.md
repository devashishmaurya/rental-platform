# Deploy rental-platform to VPS (Docker Compose)

This guide deploys the **rental-platform** Next.js app alongside your existing stack. The compose file has two app services: **app** (Java backend) and **nextjs-app** (this Next.js app). Port mode (as earlier): **Frontend** on `:8082`, **Keycloak** on `:8081`, **Java API** on `:8080`.

## What to upload (no JAR or dist)

- **Next.js app:** Upload **source code** only (the `rental-platform/` folder with `package.json`, `app/`, `components/`, `lib/`, `Dockerfile`, etc.). Do **not** build a JAR or dist; Docker builds the app on the server when you run `docker compose up --build`.
- **Java app:** Stays as before — `app` service uses `build: .` (same directory as the compose file). Use your existing setup (e.g. Dockerfile or jar in that directory).

## Prerequisites on VPS

- Docker and Docker Compose
- Git (optional; or upload files via SCP/SFTP)

## 1. Get the project on the VPS

**Option A – Git (recommended)**  
Clone the repo on the VPS so the layout is:

```text
/path/on/vps/
  version: "4.yaml      # your compose file (rename if you like, e.g. docker-compose.yaml)
  .env                  # created in step 2
  rental-platform/      # this app (clone or copy)
    Dockerfile
    package.json
    app/
    components/
    lib/
    ...
```

Example:

```bash
cd /path/on/vps
git clone <your-repo-url> temp && mv temp/rental-platform . && rm -rf temp
# Then copy or symlink your compose file to this directory
```

**Option B – Upload**  
Upload the whole **Rent Setu** folder (containing `rental-platform/` and `version: "4.yaml`) to the VPS so the same structure exists.

## 2. Create `.env` next to the compose file

Create a `.env` file in the **same directory as** `version: "4.yaml` (e.g. `/path/on/vps/.env`).

**Postgres & Keycloak** (you likely have these already):

```env
# Postgres
POSTGRES_USER=keycloak
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DB=keycloak_db

# Keycloak
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=your_keycloak_admin_password
```

**Rental-platform (Next.js) – required for login and correct URLs:**

```env
# Keycloak (must match Keycloak client and realm)
NEXT_PUBLIC_KEYCLOAK_URL=http://YOUR_VPS_IP:8081  # Keycloak base URL
NEXT_PUBLIC_KEYCLOAK_REALM=myrealm
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=nextjs-app

# Site and API URLs (port mode)
NEXT_PUBLIC_SITE_URL=http://YOUR_VPS_IP:8082
NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:8080
```

Replace `YOUR_VPS_IP` with your server IP (e.g. `103.174.103.7`). In port mode, UI/API/Keycloak use `:8082 / :8080 / :8081`.

**Keycloak client setup:**  
In Keycloak admin (your Keycloak URL), for the client used by this app set:

- **Valid redirect URIs:** `NEXT_PUBLIC_SITE_URL/auth/callback` (e.g. `http://YOUR_VPS_IP:8082/auth/callback`)
- **Web origins:** `NEXT_PUBLIC_SITE_URL` (e.g. `http://YOUR_VPS_IP:8082`)

## 3. Run the stack

From the directory that contains `version: "4.yaml` and `.env`:

```bash
# If the compose file has a special name, use -f
docker compose -f 'version: "4.yaml' up -d --build
```

Or rename the file to `docker-compose.yaml` and run:

```bash
docker compose up -d --build
```

- **Postgres:** internal only  
- **Keycloak:** reachable at `NEXT_PUBLIC_KEYCLOAK_URL`  
- **Java app (API):** reachable at `NEXT_PUBLIC_API_URL`  
- **Next.js rental-platform:** reachable at `NEXT_PUBLIC_SITE_URL`

## 4. Rebuild only the Next.js app after code changes

```bash
docker compose -f 'version: "4.yaml' up -d --build nextjs-app
```

## 5. Troubleshooting

- **Login redirect / CORS:** Fix Keycloak client **Valid redirect URIs** and **Web origins** (step 2).
- **App shows “Keycloak not configured”:** Ensure `NEXT_PUBLIC_KEYCLOAK_URL` and `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` are in `.env` and you ran `--build` so they are baked into the image.
- **502 / connection refused:** Wait for Keycloak to finish starting, then restart the Next.js app:  
  `docker compose -f 'version: "4.yaml' restart nextjs-app`
