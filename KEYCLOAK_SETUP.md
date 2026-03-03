# Keycloak Login Setup

This guide configures Keycloak so the **Sign in** button works on the rental platform.

## 1. Environment variables

Create a `.env` file in the project root (or copy from another env template) with:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Keycloak – required for Sign in
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=myrealm
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=nextjs-app

NODE_ENV=development
```

- **NEXT_PUBLIC_KEYCLOAK_URL** – Keycloak server (e.g. `http://localhost:8080` or your cloud URL).
- **NEXT_PUBLIC_KEYCLOAK_REALM** – Realm name (e.g. `myrealm`).
- **NEXT_PUBLIC_KEYCLOAK_CLIENT_ID** – Client ID (e.g. `nextjs-app`).

Restart the dev server after changing `.env`: `npm run dev`.

---

## 2. Keycloak Admin configuration

In Keycloak Admin Console (e.g. http://localhost:8080):

1. Select the **realm** that matches `NEXT_PUBLIC_KEYCLOAK_REALM` (e.g. `myrealm`).
2. Go to **Clients** → open the client that matches `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` (e.g. `nextjs-app`). Create it if needed.

Configure the client as follows.

### Client settings

| Setting | Value |
|--------|--------|
| **Client ID** | Same as `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` (e.g. `nextjs-app`) |
| **Access Type** | `public` |
| **Standard Flow Enabled** | ON |
| **Direct Access Grants Enabled** | Optional (ON if you need it) |
| **Valid Redirect URIs** | See below |
| **Web Origins** | See below |

### Valid Redirect URIs

Add these **exact** values (one per line) for local development:

- `http://localhost:3000/auth/callback`
- `http://localhost:3000/*`

Include the callback URL so Sign in works; `/*` covers other app paths. Do **not** rely on a single entry without the path.

For production, add your production URLs, e.g.:

- `https://yourdomain.com/auth/callback`
- `https://yourdomain.com/*`

### Web Origins

Add the origin of your app (no path):

- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`

You can use `+` in development to allow all redirect URIs’ origins (Keycloak 23+).

### Post logout redirect URIs (for Sign Out)

So **Sign Out** can redirect back to your app after Keycloak logout, add:

- **Valid post logout redirect URIs**: `http://localhost:3000`, `http://localhost:3000/`

(In Keycloak client → **Advanced** or the **Settings** tab, depending on version.)

### PKCE

The app uses PKCE (S256). In Keycloak:

- **Advanced** → **Proof Key for Code Exchange Code Challenge Method**: `S256` (or leave default if your Keycloak version enables it for public clients).

Save the client.

---

## 3. Verify

1. Keycloak server is running (e.g. http://localhost:8080).
2. `.env` has `NEXT_PUBLIC_KEYCLOAK_URL`, `NEXT_PUBLIC_KEYCLOAK_REALM`, and `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` set.
3. Dev server restarted: `npm run dev`.
4. Open the app (e.g. http://localhost:3000), click **Sign in** → you should be redirected to Keycloak login, then back to the app after login.

---

## 4. Optional: details to provide if you need help

If something still doesn’t work, you can share (with secrets removed):

- Keycloak version and how you run it (Docker, standalone, etc.).
- The **exact** `NEXT_PUBLIC_KEYCLOAK_*` values you use (realm name, client ID).
- For the client in Keycloak: **Valid Redirect URIs** and **Web Origins** (screenshot or copy-paste).
- Any error message from the browser (console or on-screen) or from Keycloak (e.g. “Invalid redirect uri”).

---

## 5. Running without Keycloak

To run the app without Keycloak (no real login), leave `NEXT_PUBLIC_KEYCLOAK_URL` and `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` empty (or omit them). See `SETUP_WITHOUT_KEYCLOAK.md`.
