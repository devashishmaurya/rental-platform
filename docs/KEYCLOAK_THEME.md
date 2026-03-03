# Customize Keycloak Login Page (myrealm) with Your Branding

Two options: **quick branding** (logo + colors in Admin Console) or **full custom theme** (layout + CSS).

---

## Option 1: Quick branding (no theme files)

Use Realm settings to set logo and colors.

1. **Keycloak Admin** → select realm **myrealm** → **Realm settings** → **Themes**.
2. Set **Login theme** to the theme you want (e.g. **keycloak**), then **Save**.
3. Go to **Realm settings** → **Styles** (or **General** in older Keycloak).
4. Set:
   - **Logo URL**: URL of your logo (e.g. `https://yoursite.com/logo.png` or a direct link). Max ~150×150 recommended; SVG or PNG with transparent background works best.
   - **Favicon URL**: Your favicon.
   - **Primary color**: e.g. `#0284c7` (Rent Setu primary blue).
   - **Background / Secondary**: Optional background or secondary color.
5. **Save**.

If your Keycloak version has **Realm settings → Themes** and a **Styles** / **Appearance** section with Logo, Background image, and color pickers, use those for quick branding.

---

## Option 2: Full custom theme (layout + branding)

Use the **rentsetu** theme in this project so the login page matches your app (primary blue, accent green, layout).

### Step 1: Copy the theme into Keycloak

The theme files are in **`keycloak-theme/`** in this repo. Copy that folder into Keycloak’s **themes** directory:

**If Keycloak is running from a local install:**

```bash
# Example: Keycloak installed in /opt/keycloak
cp -r /path/to/rental-platform/keycloak-theme/rentsetu /opt/keycloak/themes/
```

**If Keycloak runs in Docker:**

```bash
# Copy theme into container (replace container name with yours)
docker cp keycloak-theme/rentsetu KEYCLOAK_CONTAINER:/opt/keycloak/themes/
# Restart container so theme is picked up
docker restart KEYCLOAK_CONTAINER
```

Or mount the theme when starting the container:

```bash
docker run -p 8080:8080 \
  -v $(pwd)/keycloak-theme/rentsetu:/opt/keycloak/themes/rentsetu \
  quay.io/keycloak/keycloak start
```

**Directory structure Keycloak expects:**

```
themes/
  rentsetu/
    login/
      theme.properties
      resources/
        css/
          theme.css
        img/
          logo.png   (optional – add your logo here)
```

### Step 2: Disable theme cache (development)

So changes to CSS/files apply without restarting:

```bash
bin/kc.sh start --spi-theme-static-max-age=-1 --spi-theme-cache-themes=false --spi-theme-cache-templates=false
```

(Docker: add the same args to your `start` command.)

### Step 3: Assign the theme to myrealm

1. **Admin Console** → realm **myrealm** → **Realm settings** → **Themes**.
2. **Login theme** → select **rentsetu**.
3. **Save**.
4. Open the login page (e.g. via your app’s Sign in) and refresh.

### Step 4: Add your logo

- Put your logo in `keycloak-theme/rentsetu/login/resources/img/logo.png` (or `.svg`).
- In `theme.css` the logo is referenced; adjust the path if you use another filename (e.g. `url('../img/logo.svg')`).

---

## Theme contents (rentsetu)

- **theme.properties**: Extends Keycloak’s default login theme (`parent=keycloak`) and loads `css/theme.css`. If your Keycloak version uses a different base theme and the page looks broken, try `parent=keycloak.v2` or `parent=base` in `theme.properties`.
- **resources/css/theme.css**: Uses your app colors (primary blue `#0284c7`, accent green `#10b981`) so the login box and buttons match Rent Setu.

To change colors or layout, edit `keycloak-theme/rentsetu/login/resources/css/theme.css` and refresh the login page (with theme cache disabled).

---

## Production

- Re-enable theme caching (remove the `--spi-theme-...` flags) for better performance.
- For versioned deployments, you can package the theme as a JAR and put it in Keycloak’s `providers/` directory; see [Keycloak: Deploying themes](https://www.keycloak.org/ui-customization/themes).
