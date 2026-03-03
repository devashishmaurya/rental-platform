# Keycloak client setup

**Behaviour:** On **localhost** the app uses **Google-only** login (Keycloak is disabled). On the **server** (e.g. `http://103.174.103.7`) the app uses **Keycloak + Google**. Configure Keycloak for the server URL only.

---

## Why can't I log in? (Not a code bug)

Login fails on the server usually because of **configuration or deployment**, not application code:

1. **App not rebuilt after setting .env**  
   `NEXT_PUBLIC_KEYCLOAK_URL` is fixed at **build time**. If you only change `.env` and restart, the browser still gets the old (or empty) URL, so Keycloak never initializes and you see "Keycloak initialization failed".  
   **Fix:** On the server, set `.env`, then run `npm run build`, then restart the app.

2. **Keycloak client URIs**  
   Using only `*` for Valid redirect URIs or Web origins can break login on some Keycloak versions.  
   **Fix:** In Keycloak Admin → Clients → rentsetu-client → Settings, add **exactly** `http://103.174.103.7:8082/auth/callback` under Valid redirect URIs and `http://103.174.103.7:8082` under Web origins, then Save.

3. **Email/password in the app**  
   The "Log in" modal says "Email login coming soon. Please use Keycloak or Google to sign in." So you must use **Continue with Keycloak** or **Continue with Google**; the email/password fields are not implemented yet.

**Quick check:** Open DevTools → Console on `http://103.174.103.7:8082/auth/login`. If you see `[Keycloak] Init URL: (empty)` or no Init URL line, the app was not built with `NEXT_PUBLIC_KEYCLOAK_URL` — rebuild on the server.

---

## 1. Open Keycloak Admin

- Open **http://103.174.103.7:8081** (Keycloak server; or your `KEYCLOAK_SERVER_URL`) in your browser.
- Click **Administration Console** (or go to `/admin`) and log in as admin.
- Do not use a direct link to `/admin/realms/.../clients` before logging in — it can return “internal server error”.

## 2. Open the client

1. In the left sidebar: **Realm** → choose **rentsetu** (or your `NEXT_PUBLIC_KEYCLOAK_REALM`).
2. Go to **Clients**.
3. Click the client **rentsetu-client** (or your `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID`).
4. Open the **Settings** tab.

## 3. Set these values (for server on port 8082)

Use **exact** values; some Keycloak versions reject wildcard `*` for redirect validation.

| Setting | Value |
|--------|--------|
| **Access Type** | `public` |
| **Root URL** | `http://103.174.103.7:8082` |
| **Home URL** | `http://103.174.103.7:8082` |
| **Valid Redirect URIs** | Add **exactly** `http://103.174.103.7:8082/auth/callback` (one per line; do not rely on `*` alone) |
| **Web Origins** | Add **exactly** `http://103.174.103.7:8082` (or `+`; explicit origin is more reliable than `*`) |

Notes:

- **Do not use only `*`** for Valid redirect URIs — add the explicit callback URL above. You can keep `*` as an extra line if you want, but the exact URL must be present.
- **No trailing slash:** Use `http://103.174.103.7:8082/auth/callback` (not `.../auth/callback/`). Keycloak matches redirect_uri exactly.
- **Root URL / Home URL:** Must include port if your app uses 8082 (e.g. `http://103.174.103.7:8082`).
- **Access Type:** **public**. In **Capability config**, turn **Client authentication** **OFF**.

## 4. Save

Click **Save** at the bottom of the Settings tab.

## 5. Save and try again

Click **Save**, then refresh your app and click **Sign in with Keycloak**.

## 6. Deployment with proxy (recommended)

The **deploy script** now builds with `NEXT_PUBLIC_KEYCLOAK_URL=<SITE_URL>/api/keycloak` so the browser talks to your app (same origin) instead of Keycloak directly. That avoids CORS and "no API call" after login:

- **Build:** Browser uses `http://103.174.103.7:8082/api/keycloak` (requests show in Network tab under 8082).
- **Runtime:** The Next.js API route `/api/keycloak/[...path]` forwards to Keycloak. Set **`KEYCLOAK_SERVER_URL=http://103.174.103.7:8081`** in your **container environment** (e.g. in `docker-compose.yml` under `environment:` for the Next.js service). Without it, the proxy returns 500 and login will fail.

**“Open Keycloak” link:** The login error page shows **App proxy (browser)** = `.../api/keycloak` and **Keycloak server** = where the real Keycloak runs (e.g. `http://103.174.103.7:8081`). The **Open Keycloak** button uses **`NEXT_PUBLIC_KEYCLOAK_ADMIN_URL`** if set (so it opens the Admin UI on 8081); otherwise it falls back to the proxy URL. Set `NEXT_PUBLIC_KEYCLOAK_ADMIN_URL=http://103.174.103.7:8081` at build time (or in deploy/rebuild scripts) so the link opens Keycloak Admin directly.

## 7. If it still fails (or no Keycloak requests in Network tab)

- **Init URL on login page:** When Keycloak init fails, the login page now shows **Init URL:** (the value the client has). If it says **(empty)**, the app was not built with `NEXT_PUBLIC_KEYCLOAK_URL` — rebuild on the server.
- **Rebuild after changing .env:** `NEXT_PUBLIC_KEYCLOAK_URL` and other `NEXT_PUBLIC_*` are baked in at **build time**. Change .env, then run `npm run build` and restart the app. Restart alone is not enough.
- **Use the proxy:** In .env set `NEXT_PUBLIC_KEYCLOAK_URL=http://103.174.103.7:8082/api/keycloak` and `KEYCLOAK_SERVER_URL=http://103.174.103.7:8081`, rebuild and restart. Then in Network tab you should see requests to `/api/keycloak/realms/...`.
- **Console:** You should see `[Keycloak] Init URL: ... (proxy)` or `(direct)`. If the URL is wrong, rebuild with the correct .env.
- **Web origins:** Set to **`+`** or exactly your app origin including port (e.g. `http://103.174.103.7:8082`).
