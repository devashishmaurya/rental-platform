# Keycloak Server Configuration

## Port mode (as earlier)

No domain required. Use VPS IP with ports:

- **App URL (UI)**: `NEXT_PUBLIC_SITE_URL` (e.g. `http://YOUR_VPS_IP:8082`)
- **API URL**: `NEXT_PUBLIC_API_URL` (e.g. `http://YOUR_VPS_IP:8080`)
- **Keycloak URL**: `NEXT_PUBLIC_KEYCLOAK_URL` (e.g. `http://YOUR_VPS_IP:8081`)
- **Realm**: `rentsetu`
- **Client ID**: `rentsetu-client`

## Required Keycloak Client Configuration

### Step 1: Access Keycloak Admin Console

1. Open your Keycloak URL (e.g. `NEXT_PUBLIC_KEYCLOAK_URL` or Keycloak admin URL)
2. Login with admin credentials
3. Select realm: **`rentsetu`** (top-left dropdown)

### Step 2: Configure the Client

1. Go to: **Clients** → Click on **`rentsetu-client`**
2. Click: **Settings** tab

### Step 3: Update These Settings

#### Client Settings Tab:

| Setting | Value |
|---------|-------|
| **Client ID** | `rentsetu-client` |
| **Access Type** | `public` ⚠️ **CRITICAL** |
| **Client Authentication** | `OFF` ⚠️ **CRITICAL** (browser apps cannot use secrets) |
| **Standard Flow Enabled** | `ON` ✅ |
| **Direct Access Grants Enabled** | `ON` (optional) |
| **Implicit Flow Enabled** | `OFF` |
| **Valid Redirect URIs** | See below ⬇️ |
| **Web Origins** | See below ⬇️ |
| **Valid Post Logout Redirect URIs** | See below ⬇️ |

#### Valid Redirect URIs (must match how users open the app; one per line):

Use the **exact URL** users use to open the app (no port if you use 80/443):

```
NEXT_PUBLIC_SITE_URL/auth/callback
NEXT_PUBLIC_SITE_URL/*
```
Example: `http://YOUR_VPS_IP:8082/auth/callback`, `http://YOUR_VPS_IP:8082/*`.

#### Web Origins:

```
NEXT_PUBLIC_SITE_URL
```
Example: `http://YOUR_VPS_IP:8082`

**OR** use `+` to allow all origins (easier for development/testing)

#### Valid Post Logout Redirect URIs:

```
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SITE_URL/
```

#### Advanced Settings Tab:

- **Proof Key for Code Exchange Code Challenge Method**: `S256` (or leave default)

### Step 4: Save

Click **Save** at the bottom of the Settings tab.

## If you see "Keycloak initialization failed" after login

1. **Open the app from the URL you want to use** (e.g. `http://YOUR_VPS_IP:8082`).
2. On the login error box, the app shows the **exact** Valid redirect URI and Web origin to set. Copy those into Keycloak (realm **rentsetu** → Clients → **rentsetu-client** → Settings).
3. **Valid redirect URIs**: add exactly the callback URL shown (e.g. `http://YOUR_VPS_IP:8082/auth/callback`).
4. **Web origins**: add exactly the origin shown (e.g. `http://YOUR_VPS_IP:8082`).
5. Click **Save** in Keycloak, then try "Sign in with Keycloak" again.

## Verification

After saving:

1. Go to your app: `NEXT_PUBLIC_SITE_URL` (e.g. http://YOUR_VPS_IP)
2. Click **Sign in**
3. You should be redirected to Keycloak login page
4. After login, you should be redirected back to your app

## Common Issues

### Issue: "Invalid redirect uri"

**Cause**: The redirect URI in the request doesn't match what's configured in Keycloak.

**Solution**: 
- Check that `NEXT_PUBLIC_SITE_URL/auth/callback` is in **Valid Redirect URIs**
- Make sure there are no typos or extra spaces
- Save the client settings

### Issue: CORS Error

**Cause**: Web Origins not configured correctly.

**Solution**:
- Add `NEXT_PUBLIC_SITE_URL` to **Web Origins**
- Or use `+` to allow all origins
- Save the client settings

### Issue: "Access denied" or "Unauthorized"

**Cause**: Client Access Type might be set to `confidential` instead of `public`, OR Client Authentication is ON.

**Solution**:
- Set **Access Type** to `public`
- Set **Client Authentication** to `OFF` (required for browser apps)
- Save the client settings
- Rebuild your Docker image if needed

**Why?** Browser apps cannot securely store client secrets. They use PKCE instead. See `WHY_PUBLIC_CLIENT.md` for details.

## Quick Checklist

- [ ] Keycloak server accessible (your Keycloak URL)
- [ ] Realm `rentsetu` exists and is selected
- [ ] Client `rentsetu-client` exists
- [ ] Access Type = `public`
- [ ] Valid Redirect URIs includes: `NEXT_PUBLIC_SITE_URL/auth/callback`
- [ ] Web Origins includes: `NEXT_PUBLIC_SITE_URL`
- [ ] Settings saved
- [ ] App rebuilt with correct environment variables

## Testing

Test the configuration:

1. **Direct Keycloak URL test**:
   ```
   <KEYCLOAK_URL>/realms/rentsetu/protocol/openid-connect/auth?client_id=rentsetu-client&redirect_uri=<SITE_URL>/auth/callback&response_type=code&scope=openid
   ```
   Replace `<KEYCLOAK_URL>` and `<SITE_URL>` with your actual URLs. If this redirects properly, Keycloak is configured correctly.

2. **App test**:
   - Go to your app URL (NEXT_PUBLIC_SITE_URL)
   - Click "Sign in"
   - Should redirect to Keycloak login
   - After login, should redirect back to app

## Still Having Issues?

1. Check browser console (F12) for specific error messages
2. Check Network tab for failed requests to Keycloak
3. Verify Docker image was rebuilt with correct environment variables
4. Check Keycloak server logs: `docker compose logs keycloak`
