# Next.js app — Docker using existing compose (version: "4.yaml)

Your **version: "4.yaml** already defines **nextjs-app**. Use the same file on the server; no separate YAML.

---

## Server layout (same as where version: "4.yaml runs)

```text
/path/on/server/   (directory where version: "4.yaml and .env already are)
  version: "4.yaml
  .env
  rental-platform/     ← add this folder (Next.js source)
    Dockerfile
    package.json
    app/
    components/
    lib/
    public/
    ...
```

---

## Step 1. Upload only the rental-platform folder

Upload the **rental-platform** folder into the **same directory** where **version: "4.yaml** and **.env** already are. Do not replace or move the YAML.

Example from your machine:

```bash
scp -r rental-platform user@YOUR_SERVER_IP:/path/on/server/
```

---

## Step 2. Add Next.js env vars to existing .env

On the server, edit the **existing .env** (next to version: "4.yaml) and add:

```env
NEXT_PUBLIC_KEYCLOAK_URL=http://YOUR_SERVER_IP:8081
NEXT_PUBLIC_KEYCLOAK_REALM=myrealm
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=nextjs-app
NEXT_PUBLIC_SITE_URL=http://YOUR_SERVER_IP:8082
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:8080
```

Port mode: UI on `:8082`, API on `:8080`, Keycloak on `:8081`. Save.

---

## Step 3. Keycloak client (redirect URIs)

In Keycloak Admin (already running), for client `nextjs-app` (or the one this app uses):

- **Valid redirect URIs:** `NEXT_PUBLIC_SITE_URL/auth/callback` (e.g. `http://YOUR_SERVER_IP:8082/auth/callback`)
- **Web origins:** `NEXT_PUBLIC_SITE_URL` (e.g. `http://YOUR_SERVER_IP:8082`)

Save.

---

## Step 4. Start only the Next.js app (same YAML)

From the directory that has **version: "4.yaml**:

```bash
cd /path/on/server
docker compose -f 'version: "4.yaml' up -d --build nextjs-app
```

This **only** builds and starts **nextjs-app**. Existing postgres, keycloak and Java app keep running; Compose will not recreate them.

First run: build may take a few minutes. Then open **http://YOUR_SERVER_IP:8082**

---

## Step 5. After code changes (rebuild nextjs-app)

```bash
cd /path/on/server
docker compose -f 'version: "4.yaml' up -d --build nextjs-app
```

---

## Step 6. Logs

```bash
docker compose -f 'version: "4.yaml' logs -f nextjs-app
```

---

## Summary

| What | Where |
|------|--------|
| YAML | Use existing **version: "4.yaml** only (no separate file) |
| Upload | Add **rental-platform/** next to that YAML |
| .env | Add NEXT_PUBLIC_* to existing .env |
| Run | `docker compose -f 'version: "4.yaml' up -d --build nextjs-app` |
| App URL | http://YOUR_SERVER_IP:8082 |
