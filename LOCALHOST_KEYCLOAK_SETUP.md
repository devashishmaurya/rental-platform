# Accessing Remote Keycloak from Localhost

## Current Setup

- **Keycloak Server**: your Keycloak URL (e.g. `http://YOUR_VPS_IP:8081` if Keycloak is on port 8081)
- **Local App**: `http://localhost:3000` (your development environment)
- **Realm**: `rentsetu`
- **Client**: `rentsetu-client`

## Yes, You Can Access from Localhost!

You can access a remote Keycloak server from localhost, but you need to configure it correctly.

## Step-by-Step Fix

### 1. Verify Keycloak Server is Accessible

Open in your browser:
```
<KEYCLOAK_URL>/realms/rentsetu/.well-known/openid-configuration
```

You should see JSON with Keycloak endpoints. If you get an error, the server might not be accessible.

### 2. Configure Keycloak Client Settings

Go to Keycloak Admin Console (your Keycloak URL)

1. **Login** to Admin Console
2. **Select Realm**: `rentsetu` (top-left dropdown)
3. **Go to**: Clients → `rentsetu-client`
4. **Click**: Settings tab

#### Critical Settings:

**Access Type**: Must be `public` (not confidential)

**Valid Redirect URIs** (add these exactly):
```
http://localhost:3000/auth/callback
http://localhost:3000/*
```

**Web Origins** (add this):
```
http://localhost:3000
```
OR use `+` to allow all origins (easier for development)

**Valid Post Logout Redirect URIs**:
```
http://localhost:3000
http://localhost:3000/
```

5. **Click**: Save

### 3. Restart Your Dev Server

After updating `.env` or Keycloak settings:
```bash
# Stop server (Ctrl+C) and restart
npm run dev
```

### 4. Check Browser Console

Open browser DevTools (F12) → Console tab and look for:

**Good signs:**
- `Keycloak Configuration Check: { url: "<your-keycloak-url>", ... }`
- `Initializing Keycloak with config: { ... }`
- `Keycloak server is accessible`

**Error signs:**
- `Cannot reach Keycloak server` → Network/CORS issue
- `CORS error` → Fix Web Origins in Keycloak client
- `Invalid redirect uri` → Fix Valid Redirect URIs in Keycloak client
- `Keycloak initialization error` → Check the error message

### 5. Test Direct Access

Try accessing Keycloak login directly:
```
<KEYCLOAK_URL>/realms/rentsetu/protocol/openid-connect/auth?client_id=rentsetu-client&redirect_uri=http://localhost:3000/auth/callback&response_type=code&scope=openid
```

If this works, Keycloak is configured correctly. If not, check the error message.

## Common Issues

### Issue: "Sign in is not ready yet"

**Cause**: Keycloak initialization failed silently

**Solution**:
1. Check browser console for errors
2. Verify Keycloak client Web Origins includes `http://localhost:3000`
3. Verify Valid Redirect URIs includes `http://localhost:3000/auth/callback`
4. Restart dev server

### Issue: CORS Error

**Cause**: Web Origins not configured in Keycloak client

**Solution**: Add `http://localhost:3000` to Web Origins in Keycloak client settings

### Issue: "Invalid redirect uri"

**Cause**: Redirect URI not in Valid Redirect URIs list

**Solution**: Add `http://localhost:3000/auth/callback` to Valid Redirect URIs

### Issue: Cannot reach Keycloak server

**Cause**: Network/firewall blocking access to your Keycloak URL

**Solution**: 
- Check if you can access your Keycloak URL in browser
- Check firewall/VPN settings
- Verify server is running

## Quick Checklist

- [ ] Keycloak server accessible (your Keycloak URL)
- [ ] Realm `rentsetu` exists
- [ ] Client `rentsetu-client` exists
- [ ] Client Access Type = `public`
- [ ] Valid Redirect URIs includes `http://localhost:3000/auth/callback`
- [ ] Web Origins includes `http://localhost:3000`
- [ ] `.env` file has correct values
- [ ] Dev server restarted after `.env` changes
- [ ] Browser console shows no CORS errors

## Still Not Working?

1. **Open browser console** (F12) and check for errors
2. **Check Network tab** - look for failed requests to Keycloak
3. **Share the error message** from browser console
4. **Verify Keycloak client settings** match the checklist above
