# Google Sign-in on the server

## IP addresses are not allowed

Google OAuth **does not accept IP addresses** (e.g. `http://103.174.103.7/...`) as redirect URIs. You will see:

- *"Invalid redirect: Must end with a public top-level domain (such as .com or .org)"*
- *"Invalid Redirect: must use a domain that is a valid Top private domain"*

So you **cannot** add `http://103.174.103.7/api/auth/callback/google` in Google Cloud Console.

## What you can do

### Option 1: Use a domain (recommended for production)

1. Point a domain to your server (e.g. **rentsetu.com** or **app.rentsetu.com** → 103.174.103.7).
2. In **Google Cloud Console** → your OAuth client → **Authorized redirect URIs**, add:
   - `https://yourdomain.com/api/auth/callback/google`  
   (use `http://` only if you have no SSL.)
3. Serve the app on that domain and use the same URL in your app config (e.g. `NEXT_PUBLIC_SITE_URL`).

Then Google Sign-in will work on the server.

### Option 2: Keycloak only on server, Google on local

Until you have a domain:

- **Local (localhost):** Use **Google** sign-in (already works with `http://localhost:3000/api/auth/callback/google`).
- **Server (103.174.103.7):** Use **Keycloak** only. Do not add a Google redirect URI for the IP; the “Continue with Google” button will only work after you add a **domain** redirect URI and serve the app on that domain.

No code change needed: the app already supports Keycloak + Google on the server; Google will simply fail until a valid domain redirect URI is configured and used.
