# Rent Setu – Full custom Keycloak login theme

This folder contains the **rentsetu** login theme. Use it so the Keycloak login page matches your app (primary blue, accent green).

---

## Where the theme lives (in this repo)

```
keycloak-theme/
  rentsetu/           ← this is the theme name Keycloak will show
    login/
      theme.properties
      resources/
        css/
          theme.css
        img/
          (optional: add logo.png or logo.svg here)
```

---

## Where to use it (in Keycloak)

Keycloak loads themes from its **themes** directory. You must **copy** `rentsetu` into that directory.

### A. Keycloak running locally with `bin/kc.sh start-dev`

1. Go to your **Keycloak installation** directory (the folder that contains `bin/kc.sh`).
2. Copy the **rentsetu** theme into Keycloak’s **themes** folder.

   From your **rental-platform** project root:

   ```bash
   cp -r keycloak-theme/rentsetu /path/to/keycloak/themes/
   ```

   Replace `/path/to/keycloak` with the real path. Examples:

   - If Keycloak is at `~/Documents/Rent Setu/keycloak-24.0.3` and you're in **rental-platform**:
     ```bash
     cp -r keycloak-theme/rentsetu "/home/$USER/Documents/Rent Setu/keycloak-24.0.3/themes/"
     ```
   - Or run from the **Keycloak** directory (then the theme path must point to rental-platform):
     ```bash
     cp -r "/home/$USER/Documents/Rent Setu/rental-platform/keycloak-theme/rentsetu" ./themes/
     ```

3. **Restart** Keycloak (stop with Ctrl+C, then run again):
   ```bash
   bin/kc.sh start-dev
   ```

4. In Admin Console → **myrealm** → **Realm settings** → **Themes**, set **Login theme** to **rentsetu** and **Save**.

`start-dev` usually has theme caching relaxed, so after the first copy you can edit `themes/rentsetu/login/resources/css/theme.css` and refresh the login page to see changes (no restart needed for CSS).

### B. Keycloak running in Docker

**Option 1 – Copy into existing container**

```bash
# From project root: rental-platform
docker cp keycloak-theme/rentsetu <KEYCLOAK_CONTAINER_NAME>:/opt/keycloak/themes/
docker restart <KEYCLOAK_CONTAINER_NAME>
```

Find the container name: `docker ps` (look for keycloak).

**Option 2 – Mount theme when starting the container (recommended)**

```bash
# From project root: rental-platform
docker run -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -v "$(pwd)/keycloak-theme/rentsetu:/opt/keycloak/themes/rentsetu" \
  quay.io/keycloak/keycloak start
```

Then any change in `keycloak-theme/rentsetu` is visible in Keycloak (with theme cache disabled).

---

## How to turn the theme on in Keycloak

1. Open **Keycloak Admin**: http://localhost:8080 (or your Keycloak URL).
2. Log in as admin.
3. Select realm **myrealm** (top-left dropdown).
4. Go to **Realm settings** → **Themes** tab.
5. Set **Login theme** to **rentsetu**.
6. Click **Save**.
7. Open the login page (e.g. click Sign in in your app, or go to  
   `http://localhost:8080/realms/myrealm/protocol/openid-connect/auth?client_id=nextjs-app&redirect_uri=...`).  
   You should see the Rent Setu–styled login.

---

## Summary

| What | Where / How |
|------|---------------------|
| Theme files (in repo) | `keycloak-theme/rentsetu/` |
| Where Keycloak expects it | Inside Keycloak: `themes/rentsetu/` (copy or mount `rentsetu` there) |
| Where you enable it | Admin Console → myrealm → Realm settings → Themes → Login theme = **rentsetu** |
| Result | Login page uses your branding (colors, card, buttons) |

For more (logo, development cache, production), see **docs/KEYCLOAK_THEME.md**.
