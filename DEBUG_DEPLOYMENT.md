# Debugging 404 Errors After Deployment

## Problem
Route `/pricing/property-advertising` returns 404 on server even after deployment.

## Root Cause
Docker rebuilds Next.js during image build. Even if you build locally, Docker will rebuild.

## Step-by-Step Debugging

### 1. Verify Route Exists in Source Code

```bash
# On your local machine
ls -la app/pricing/property-advertising/
```

Should show:
- `page.tsx`
- `layout.tsx`

### 2. Check for Build Errors

**On Server (SSH):**
```bash
cd /opt/rentsetu/frontend

# Rebuild with verbose output
docker compose build --progress=plain --no-cache \
  --build-arg NEXT_PUBLIC_KEYCLOAK_URL=http://YOUR_VPS_IP:8081 \
  --build-arg NEXT_PUBLIC_KEYCLOAK_REALM=rentsetu \
  --build-arg NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rentsetu-client \
  --build-arg NEXT_PUBLIC_SITE_URL=http://YOUR_VPS_IP:8082 \
  --build-arg NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:8080 \
  nextjs-app 2>&1 | tee /tmp/build.log
```

**Check for errors:**
```bash
grep -i error /tmp/build.log
grep -i "property-advertising" /tmp/build.log
```

### 3. Verify Route Was Built in Docker Image

```bash
# Check if route exists in built image
docker compose run --rm nextjs-app find .next -name "property-advertising" -type d

# Check standalone output structure
docker compose run --rm nextjs-app ls -la .next/server/app/pricing/

# Check if page.js exists
docker compose run --rm nextjs-app find .next -name "page.js" -path "*/property-advertising/*"
```

### 4. Check Container Logs

```bash
docker compose logs -f nextjs-app
```

Look for:
- Route registration errors
- Build errors
- Runtime errors

### 5. Test Route Directly in Container

```bash
# Enter container
docker compose exec nextjs-app sh

# Check if route files exist
ls -la .next/server/app/pricing/property-advertising/

# Check server.js routes
grep -i "property-advertising" server.js || echo "Route not found in server.js"
```

### 6. Verify Next.js Configuration

Check `next.config.mjs`:
- `output: 'standalone'` is set (required for Docker)
- No route exclusions

### 7. Common Issues

#### Issue: Route Not Found in Build
**Cause:** Build error or route not recognized
**Fix:** Check build logs for errors

#### Issue: Route Exists But Returns 404
**Cause:** Server.js routing issue or middleware blocking
**Fix:** Check middleware.ts for route exclusions

#### Issue: Build Succeeds But Route Missing
**Cause:** Route might be dynamic or not properly exported
**Fix:** Ensure `page.tsx` has default export

### 8. Quick Fix Commands

```bash
# Full rebuild on server
cd /opt/rentsetu/frontend
docker compose build --no-cache --build-arg NEXT_PUBLIC_KEYCLOAK_URL=http://YOUR_VPS_IP:8081 --build-arg NEXT_PUBLIC_SITE_URL=http://YOUR_VPS_IP:8082 --build-arg NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:8080 nextjs-app
docker compose up -d nextjs-app

# Check route in running container
docker compose exec nextjs-app find .next -name "property-advertising"

# Test route
curl http://localhost:8080/pricing/property-advertising   # if frontend is mapped to host 8080; or use your public URL
```

### 9. Verify Route Structure

The route should be:
```
app/
  pricing/
    property-advertising/
      page.tsx      (required - main page component)
      layout.tsx    (optional - layout component)
```

Both files must exist and `page.tsx` must have a default export.

### 10. Check Middleware

Verify `middleware.ts` doesn't block the route:

```typescript
// Should include /pricing in public routes or allow it
const publicRoutes = [
  '/pricing',  // Should allow /pricing/*
  // ...
]
```

## Expected Build Output

After successful build, you should see in Docker logs:
```
✓ Compiled /pricing/property-advertising
✓ Compiled successfully
```

And in container:
```
.next/server/app/pricing/property-advertising/page.js
.next/static/chunks/[hash].js (contains route code)
```

## Still Not Working?

1. **Check build logs** for compilation errors
2. **Verify route syntax** - ensure no TypeScript/import errors
3. **Check Next.js version** - ensure compatibility
4. **Try accessing directly** - Your app URL + `/pricing/property-advertising` (e.g. http://YOUR_VPS_IP/pricing/property-advertising); avoid trailing slash.
