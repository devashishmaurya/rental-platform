# Keycloak Troubleshooting Guide

## Current Configuration

- **Keycloak URL**: use your Keycloak URL (e.g. NEXT_PUBLIC_KEYCLOAK_URL; no fixed port required)
- **Realm**: `rentsetu`
- **Client ID**: `rentsetu-client`
- **Client Secret**: `F5mq99yXegtLTnUYh8mCuMc4fIfn59Be` (not used for public clients)

## Common Issues and Solutions

### 1. Check Environment Variables Are Loaded

After updating `.env`, **restart your Next.js dev server**:
```bash
# Stop the server (Ctrl+C) and restart
npm run dev
```

Verify the variables are loaded by checking the browser console. You should see:
```
Keycloak Configuration Check: {
  url: "<your-keycloak-url>",
  realm: "rentsetu",
  clientId: "rentsetu-client",
  configured: true
}
```

### 2. Keycloak Client Configuration

In Keycloak Admin Console (your Keycloak URL):

1. **Select Realm**: `rentsetu` (top-left dropdown)
2. **Go to**: Clients → `rentsetu-client`
3. **Verify these settings**:

#### Client Settings Tab:
- **Client ID**: `rentsetu-client` ✓
- **Access Type**: `public` (CRITICAL - must be public, not confidential)
- **Standard Flow Enabled**: `ON` ✓
- **Direct Access Grants Enabled**: `ON` (optional, for testing)
- **Implicit Flow Enabled**: `OFF` (not needed)
- **Valid Redirect URIs**: 
  ```
  http://localhost:3000/auth/callback
  http://localhost:3000/*
  ```
  (Add your production URLs if deploying)
- **Web Origins**: 
  ```
  http://localhost:3000
  ```
  (Or use `+` to allow all origins in development)
- **Valid Post Logout Redirect URIs**:
  ```
  http://localhost:3000
  http://localhost:3000/
  ```

#### Advanced Settings Tab:
- **Proof Key for Code Exchange Code Challenge Method**: `S256` (or leave default)

### 3. Check Browser Console Errors

Open browser DevTools (F12) → Console tab and look for:
- Keycloak initialization errors
- CORS errors
- Network errors (check Network tab for failed requests)

Common errors:
- **"Invalid redirect uri"**: Fix Valid Redirect URIs in Keycloak client
- **CORS error**: Fix Web Origins in Keycloak client
- **"Token exchange failed"**: Usually CORS or redirect URI mismatch

### 4. Network Tab Debugging

1. Open DevTools → Network tab
2. Enable "Preserve log"
3. Click "Sign in"
4. Look for requests to:
   - `<KEYCLOAK_URL>/realms/rentsetu/protocol/openid-connect/auth` (authorization)
   - `<KEYCLOAK_URL>/realms/rentsetu/protocol/openid-connect/token` (token exchange)
5. Check the response status codes:
   - `200`: Success
   - `400`: Bad request (check redirect URI)
   - `401`: Unauthorized (check client configuration)
   - `403`: Forbidden (check CORS/Web Origins)

### 5. Test Keycloak Server Accessibility

Verify the Keycloak server is accessible:
```bash
# Test if Keycloak is reachable
curl <KEYCLOAK_URL>/realms/rentsetu/.well-known/openid-configuration

# Should return JSON with endpoints
```

### 6. Verify Realm Configuration

The realm `rentsetu` should exist and be active:
- Go to your Keycloak URL
- Login to Admin Console
- Check realm dropdown (top-left) - `rentsetu` should be listed

### 7. Test User Credentials

- **Username**: `admin`
- **Password**: `admin`
- **Group**: `admin_group` (should be assigned)

Try logging in directly at:
```
<KEYCLOAK_URL>/realms/rentsetu/protocol/openid-connect/auth?client_id=rentsetu-client&redirect_uri=http://localhost:3000/auth/callback&response_type=code&scope=openid
```

If this works, the issue is in the app configuration. If it doesn't, check Keycloak client settings.

### 8. Clear Browser Cache and Cookies

Sometimes cached tokens cause issues:
1. Clear browser cookies for `localhost:3000`
2. Clear localStorage
3. Try in incognito/private mode

### 9. Check Next.js Environment Variables

Ensure `.env` file is in the project root (same directory as `package.json`):
```bash
# Verify .env exists
ls -la .env

# Check contents (don't commit this file!)
cat .env
```

### 10. Production vs Development

If deploying to production:
- Update `NEXT_PUBLIC_SITE_URL` to your production URL
- Add production redirect URIs to Keycloak client
- Add production Web Origins to Keycloak client
- Ensure HTTPS is configured if using production domain

## Quick Verification Checklist

- [ ] `.env` file exists and has correct values
- [ ] Dev server restarted after `.env` changes
- [ ] Keycloak server is accessible (your Keycloak URL)
- [ ] Realm `rentsetu` exists and is active
- [ ] Client `rentsetu-client` exists
- [ ] Client Access Type is `public`
- [ ] Valid Redirect URIs include `http://localhost:3000/auth/callback`
- [ ] Web Origins include `http://localhost:3000`
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows successful token exchange

## Still Not Working?

Share these details:
1. Browser console errors (screenshot or copy-paste)
2. Network tab errors (especially token endpoint)
3. Keycloak client configuration (screenshot of Settings tab)
4. Output of browser console "Keycloak Configuration Check"
