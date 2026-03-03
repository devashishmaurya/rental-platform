# API Token Authentication via Cookies

## Overview

The access token from Keycloak is automatically passed to all API calls in two ways:
1. **Authorization Header**: `Authorization: Bearer <token>` (standard OAuth2)
2. **Cookies**: `keycloak-token` cookie is automatically sent with all requests

## How It Works

### 1. Token Storage

After successful Keycloak login, the access token is stored in:
- **Cookie**: `keycloak-token` (accessible to both client and server)
- **React State**: Available via `useKeycloak().token`

### 2. Automatic Token Inclusion

All API calls automatically include the token:

#### Client Components (Browser)

```typescript
import { useApiClient } from '@/lib/api/useApiClient'

function MyComponent() {
  const api = useApiClient()
  
  // Token is automatically included in:
  // 1. Authorization header: Authorization: Bearer <token>
  // 2. Cookies: keycloak-token cookie is sent automatically
  const data = await api.get('/api/properties')
  await api.post('/api/properties', { name: 'New Property' })
}
```

#### Server Components / API Routes

```typescript
import { getToken } from '@/lib/auth/token'
import { apiClient } from '@/lib/api/client'

// Server-side: token is read from cookies
const token = await getToken()
const data = await apiClient.get('/api/properties', {
  getToken: () => token,
  baseURL: process.env.NEXT_PUBLIC_API_URL
})
```

### 3. Cookie Configuration

The token cookie is set with:
- **Path**: `/` (available to all routes)
- **Max-Age**: 24 hours
- **SameSite**: 
  - `Lax` for same-origin APIs
  - `None; Secure` for cross-origin APIs (production)
- **Secure**: Enabled in production (HTTPS only)

### 4. Fetch Configuration

All API requests use `credentials: 'include'` which ensures:
- Cookies are automatically sent with requests
- Works for both same-origin and cross-origin APIs
- No manual cookie handling needed

## Token Format

The access token from Keycloak contains:

```json
{
  "access_token": "eyJhbGci...",
  "expires_in": 300,
  "refresh_token": "eyJhbGci...",
  "token_type": "Bearer",
  "scope": "openid profile email"
}
```

**Decoded Token Claims:**
- `sub`: User ID (`810ddd78-bdf7-4b66-89b4-6eed0431976d`)
- `email`: User email (`admin@gmail.com`)
- `name`: Full name (`admin admin`)
- `preferred_username`: Username (`admin`)
- `realm_access.roles`: User roles
- `resource_access.account.roles`: Account management roles

## API Request Headers

Every API request includes:

```http
GET /api/properties HTTP/1.1
Host: your-api-server.com
Authorization: Bearer eyJhbGci...
Cookie: keycloak-token=eyJhbGci...; keycloak-refresh-token=eyJhbGci...
Content-Type: application/json
```

## Backend API Requirements

Your backend API should:

1. **Accept tokens from both sources**:
   - Check `Authorization` header first (standard)
   - Fallback to `keycloak-token` cookie if header missing

2. **Validate the token**:
   ```javascript
   // Example: Extract token from header or cookie
   const token = req.headers.authorization?.replace('Bearer ', '') 
     || req.cookies['keycloak-token']
   
   // Validate with Keycloak
   const decoded = await keycloak.validateToken(token)
   ```

3. **Handle CORS** (if cross-origin):
   ```javascript
   // Allow credentials (cookies)
   res.header('Access-Control-Allow-Credentials', 'true')
   res.header('Access-Control-Allow-Origin', 'https://your-frontend.com')
   ```

4. **Read user info from token**:
   ```javascript
   const userId = decoded.sub
   const email = decoded.email
   const roles = decoded.realm_access?.roles || []
   ```

## Token Refresh

The API client automatically handles token refresh:
- Refresh token is stored in `keycloak-refresh-token` cookie
- When access token expires, it's automatically refreshed
- New tokens are updated in cookies automatically

## Testing

### Check Token in Browser

1. Open DevTools → Application → Cookies
2. Look for `keycloak-token` cookie
3. Verify it contains the JWT token

### Check Token in Network Tab

1. Open DevTools → Network
2. Make an API call
3. Check Request Headers:
   - `Authorization: Bearer <token>` ✅
   - `Cookie: keycloak-token=<token>` ✅

### Verify Token on Backend

```bash
# Decode JWT token (for testing)
echo "eyJhbGci..." | base64 -d

# Or use jwt.io to decode
```

## Troubleshooting

### Issue: Token not sent with API calls

**Solution**:
- Verify `credentials: 'include'` is set (already done in `lib/api/client.ts`)
- Check cookie domain/path matches API domain
- For cross-origin: Ensure `SameSite=None; Secure` is set

### Issue: CORS errors with cookies

**Solution**:
- Backend must set `Access-Control-Allow-Credentials: true`
- Backend must specify exact origin (not `*`)
- Cookies must have `SameSite=None; Secure` for cross-origin

### Issue: Token expired

**Solution**:
- Token auto-refreshes when expired
- Check `keycloak-refresh-token` cookie exists
- Verify refresh token hasn't expired (default: 30 minutes)

## Security Best Practices

1. ✅ **HTTPS in production**: Cookies with `Secure` flag
2. ✅ **SameSite protection**: Prevents CSRF attacks
3. ✅ **Token expiration**: Short-lived access tokens (5 minutes)
4. ✅ **Refresh tokens**: Longer-lived but revocable
5. ✅ **Automatic refresh**: Seamless user experience

## Example: Backend Token Validation

```javascript
// Express.js example
const jwt = require('jsonwebtoken')
const jwksClient = require('jwks-rsa')

const client = jwksClient({
  jwksUri: process.env.KEYCLOAK_URL + '/realms/rentsetu/protocol/openid-connect/certs'  // e.g. http://YOUR_VPS_IP:8081
})

async function validateToken(req, res, next) {
  // Get token from header or cookie
  const token = req.headers.authorization?.replace('Bearer ', '') 
    || req.cookies['keycloak-token']
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  try {
    // Decode token header
    const decoded = jwt.decode(token, { complete: true })
    const kid = decoded.header.kid
    
    // Get signing key from Keycloak
    const key = await client.getSigningKey(kid)
    const signingKey = key.getPublicKey()
    
    // Verify token
    const verified = jwt.verify(token, signingKey, {
      audience: 'account',
      issuer: process.env.KEYCLOAK_URL + '/realms/rentsetu'  // match NEXT_PUBLIC_KEYCLOAK_URL
    })
    
    // Attach user info to request
    req.user = {
      id: verified.sub,
      email: verified.email,
      name: verified.name,
      roles: verified.realm_access?.roles || []
    }
    
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// Use middleware
app.use('/api', validateToken)
```

## Summary

✅ Token is automatically stored in cookies after Keycloak login  
✅ All API calls include token via Authorization header AND cookies  
✅ Cookies are automatically sent with `credentials: 'include'`  
✅ Token refresh is handled automatically  
✅ Works for both same-origin and cross-origin APIs  

Your backend API will receive the token in both the `Authorization` header and the `keycloak-token` cookie with every request.
