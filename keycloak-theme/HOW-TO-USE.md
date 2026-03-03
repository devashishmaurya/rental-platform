# How to use the Rent Setu Keycloak theme (step by step)

Follow these steps in order.

---

## Step 1: Copy the theme into Keycloak

Open a terminal and run **one** of these commands.

**If you're in the rental-platform project folder:**

```bash
cp -r keycloak-theme/rentsetu "$HOME/Documents/Rent Setu/keycloak-24.0.3/themes/"
```

**If you're in any other folder (use the full path):**

```bash
cp -r "$HOME/Documents/Rent Setu/rental-platform/keycloak-theme/rentsetu" "$HOME/Documents/Rent Setu/keycloak-24.0.3/themes/"
```

**Check it worked:**

```bash
ls "$HOME/Documents/Rent Setu/keycloak-24.0.3/themes/rentsetu/login"
```

You should see `theme.properties` and `resources`.

---

## Step 2: Restart Keycloak

1. Go to the terminal where Keycloak is running (`bin/kc.sh start-dev`).
2. Press **Ctrl+C** to stop it.
3. Start it again:

```bash
cd "$HOME/Documents/Rent Setu/keycloak-24.0.3"
bin/kc.sh start-dev
```

4. Wait until you see something like "Running the server in development mode" or the server is ready.

---

## Step 3: Turn on the theme in Keycloak Admin

1. Open a browser and go to: **http://localhost:8080**
2. Log in to the **Admin Console** (e.g. username `admin`, password you set).
3. At the **top-left**, click the realm name (e.g. "master"). From the list, choose **myrealm**.
4. In the **left menu**, click **Realm settings**.
5. Open the **Themes** tab at the top.
6. Find **Login theme**. Click the dropdown and select **rentsetu**.
7. Click **Save** (bottom or top of the page).

---

## Step 4: See the theme

1. Open your app: **http://localhost:3000**
2. Click **Sign in** (or go to **Sign in with Keycloak**).
3. You will be sent to the Keycloak login page. It should now use the Rent Setu colours (blue button, light background, etc.).

That’s it. The theme is now in use for **myrealm**.

---

## If you don’t see "rentsetu" in the Login theme list

- Make sure you copied the **rentsetu** folder into Keycloak’s **themes** folder (Step 1).
- Make sure you **restarted** Keycloak after copying (Step 2).
- Check the path: Keycloak must be at `$HOME/Documents/Rent Setu/keycloak-24.0.3`. If your Keycloak is somewhere else, use that path in the `cp` command instead.

---

## If your Keycloak is in a different folder

Replace this part in the copy command:

`$HOME/Documents/Rent Setu/keycloak-24.0.3`

with the folder where your **bin/kc.sh** is. For example:

```bash
cp -r "$HOME/Documents/Rent Setu/rental-platform/keycloak-theme/rentsetu" /opt/keycloak/themes/
```

Then in Step 2, restart Keycloak from that same folder.
