# Docker Build Guide

## Important: Environment Variables at Build Time

Next.js embeds `NEXT_PUBLIC_*` environment variables into the JavaScript bundle **at build time**. This means:

- ✅ **Build args must be passed** during `docker build`
- ❌ **Setting env vars at runtime** (docker run) won't work for `NEXT_PUBLIC_*` variables
- ✅ **Rebuild required** whenever these values change

## Building the Docker Image

### Option 1: Using docker-compose (Recommended)

Create or update `.env` file next to your `docker-compose.yml`:

```env
NEXT_PUBLIC_KEYCLOAK_URL=http://YOUR_VPS_IP:8081
NEXT_PUBLIC_KEYCLOAK_REALM=rentsetu
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rentsetu-client
NEXT_PUBLIC_SITE_URL=http://YOUR_VPS_IP:8082
NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:8080
```

Port mode: UI on `:8082`, API on `:8080`, Keycloak on `:8081`. Then build:
```bash
docker compose build --no-cache nextjs-app
docker compose up -d nextjs-app
```

### Option 2: Manual Build with Build Args

```bash
docker build --no-cache \
  --build-arg NEXT_PUBLIC_KEYCLOAK_URL=http://YOUR_VPS_IP:8081 \
  --build-arg NEXT_PUBLIC_KEYCLOAK_REALM=rentsetu \
  --build-arg NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rentsetu-client \
  --build-arg NEXT_PUBLIC_SITE_URL=http://YOUR_VPS_IP:8082 \
  --build-arg NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:8080 \
  -t rental-platform .
```

### Option 3: Using the Rebuild Script

```bash
chmod +x rebuild-docker.sh
./rebuild-docker.sh
```

## Default Values

The Dockerfile provides defaults for:
- `NEXT_PUBLIC_KEYCLOAK_REALM=rentsetu`
- `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rentsetu-client`

**However**, `NEXT_PUBLIC_KEYCLOAK_URL` and `NEXT_PUBLIC_SITE_URL` **must be provided** as build args - they have no defaults.

## Code Fallbacks

The application code (`lib/auth/keycloak.tsx`) has fallback defaults:
- Realm: `rentsetu` (if env var not set)
- Client ID: `rentsetu-client` (if env var not set)

But these only work if the environment variable is `undefined`. If it's set to an empty string or wrong value, the fallback won't help.

## Best Practices

1. **Always pass build args** explicitly during build
2. **Use `--no-cache`** when changing environment variables
3. **Store build args in `.env`** file (for docker-compose) or CI/CD secrets
4. **Never hardcode** production URLs in Dockerfile (they're removed)
5. **Document** your environment-specific values

## Troubleshooting

### Issue: Still seeing old Keycloak settings after rebuild

**Solution**: 
- Ensure you used `--no-cache` flag
- Verify build args were passed correctly
- Check browser console for "Keycloak Configuration Check" log

### Issue: Build fails with missing NEXT_PUBLIC_KEYCLOAK_URL

**Solution**: 
- Pass `--build-arg NEXT_PUBLIC_KEYCLOAK_URL=<your-url>` during build
- Or set it in `.env` file if using docker-compose

### Issue: Different environments need different values

**Solution**:
- Use separate `.env` files per environment (`.env.production`, `.env.staging`)
- Pass build args from CI/CD pipeline
- Use docker-compose override files (`docker-compose.override.yml`)

## Example: Multi-Environment Setup

**Production** (`.env.production`):
```env
NEXT_PUBLIC_KEYCLOAK_URL=http://YOUR_VPS_IP:8081
NEXT_PUBLIC_KEYCLOAK_REALM=rentsetu
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rentsetu-client
NEXT_PUBLIC_SITE_URL=http://YOUR_VPS_IP:8082
NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:8080
```

**Staging** (`.env.staging`):
```env
NEXT_PUBLIC_KEYCLOAK_URL=http://staging.example.com:8081
NEXT_PUBLIC_KEYCLOAK_REALM=rentsetu-staging
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rentsetu-client-staging
NEXT_PUBLIC_SITE_URL=http://staging.example.com:8082
NEXT_PUBLIC_API_URL=http://staging.example.com:8080
```

Build with:
```bash
# Production
docker compose --env-file .env.production build --no-cache nextjs-app

# Staging
docker compose --env-file .env.staging build --no-cache nextjs-app
```
