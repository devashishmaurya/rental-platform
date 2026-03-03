# Keycloak: "Init failed" after entering username/password

After you log in on Keycloak and get redirected back, the app shows **"Keycloak initialization failed"**. That usually means the **token exchange** failed because Keycloak rejected the request (often **redirect_uri mismatch**).

---

## 1. Set these **exact** values in Keycloak Admin

**Where:** Keycloak Admin → Realm **rentsetu** → **Clients** → **rentsetu-client** → **Settings**.

| Setting | Value (copy exactly) |
|--------|----------------------|
| **Root URL** | `http://103.174.103.7:8082` |
| **Home URL** | `http://103.174.103.7:8082` |
| **Valid redirect URIs** | `http://103.174.103.7:8082/auth/callback` |
| **Valid post logout redirect URIs** | `http://103.174.103.7:8082` or `*` |
| **Web origins** | `http://103.174.103.7:8082` |

- **No trailing slash** on the callback URI: use `.../auth/callback`, not `.../auth/callback/`.
- **Same scheme and port**: `http` and `8082` as in the table.
- Click **Save**.

**Capability config (same client):**

- **Client authentication:** OFF (public client).
- **Standard flow:** ON.

---

## 2. Check the error shown on the login page

After the failed redirect, the login page may show **"Reason: ..."** with Keycloak’s error. Typical values:

- **redirect_uri_mismatch** or **invalid_redirect_uri** → Fix **Valid redirect URIs** as in the table above and Save.
- **invalid_client** → Check client ID is **rentsetu-client** and Client authentication is OFF.

---

## 3. Check the token request in the browser

1. Open DevTools → **Network**.
2. Sign in with Keycloak again and submit username/password.
3. When you’re back on the app and see "Init failed", in Network find the **POST** request to:
   - `.../api/keycloak/realms/rentsetu/protocol/openid-connect/token`
4. Click it → **Response**. Keycloak often returns JSON like:
   - `{"error":"invalid_grant","error_description":"Invalid redirect uri"}`  
   That confirms a **redirect URI** problem; fix it as in step 1.

---

## 4. Quick copy-paste for Valid redirect URIs

In Keycloak, in **Valid redirect URIs**, add this as a single line (no space, no slash at the end):

```
http://103.174.103.7:8082/auth/callback
```

**Web origins**, one line:

```
http://103.174.103.7:8082
```

Save and try logging in again.
