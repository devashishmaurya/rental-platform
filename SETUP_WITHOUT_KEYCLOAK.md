# Running Without Keycloak

The application is designed to work **without Keycloak configured**. This allows you to develop and test the platform before setting up authentication.

## Quick Start (No Keycloak)

1. **Install dependencies:**
```bash
npm install
```

2. **Create `.env.local` file:**
```bash
cp .env.example .env.local
```

3. **Leave Keycloak variables empty** (or don't create them):
```env
# .env.local
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Keycloak Configuration - LEAVE EMPTY for now
# NEXT_PUBLIC_KEYCLOAK_URL=
# NEXT_PUBLIC_KEYCLOAK_REALM=
# NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open your browser:**
```
http://localhost:3000
```

## What Works Without Keycloak

✅ **All Pages**: All 9 pages work perfectly  
✅ **Navigation**: Full navigation works  
✅ **Content**: All content from config files  
✅ **SEO**: Full SEO implementation  
✅ **Components**: All UI components work  
✅ **Styling**: Full Tailwind CSS styling  

## What's Different Without Keycloak

⚠️ **Login Button**: Shows as disabled/grayed out  
⚠️ **Authentication**: No real authentication (development mode)  
⚠️ **Protected Routes**: Dashboard/admin routes are accessible (no protection)  

## Development Mode Behavior

When Keycloak is not configured:

1. **Navbar Login Button**: 
   - Shows as disabled/grayed out
   - Displays "Auth (dev mode)" text
   - Clicking shows a message about Keycloak setup

2. **Console Messages**:
   - You'll see: `"Keycloak not configured. Running in development mode without authentication."`

3. **No Errors**:
   - Application runs without errors
   - All features work except authentication

## When You're Ready for Keycloak

1. **Install Keycloak** (if not already installed):
   - Download from https://www.keycloak.org/downloads
   - Or use Docker: `docker run -p 8080:8080 quay.io/keycloak/keycloak`

2. **Configure Keycloak Realm**:
   - Create a realm (e.g., `rental-platform`)
   - Create a client (e.g., `rental-platform-client`)
   - Set redirect URIs: `http://localhost:3000/*`
   - Enable PKCE

3. **Install Keycloak JS package**:
```bash
npm install keycloak-js
```

4. **Update `.env.local`**:
```env
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=rental-platform
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rental-platform-client
```

5. **Restart the dev server**:
```bash
npm run dev
```

6. **Login button will now work** and redirect to Keycloak!

## Testing Without Keycloak

You can fully develop and test:

- ✅ Page layouts
- ✅ Content management
- ✅ Component functionality
- ✅ Styling and responsive design
- ✅ SEO metadata
- ✅ Navigation flows

The only thing you can't test without Keycloak is the actual authentication flow, but you can build everything else first.

## Production Deployment

For production:

1. **Option 1**: Set up Keycloak before deploying
2. **Option 2**: Deploy without Keycloak and add it later
3. **Option 3**: Use a different authentication provider

The application gracefully handles all scenarios.

## Troubleshooting

### "Keycloak package not installed" warning

This is normal when Keycloak is not configured. The app works fine without it.

### Login button doesn't work

This is expected when Keycloak is not configured. The button is intentionally disabled.

### Want to test protected routes?

You can temporarily add your own protection logic in `middleware.ts` or create mock authentication for development.

## Summary

✅ **You can start developing immediately** without Keycloak  
✅ **All features work** except authentication  
✅ **Easy to add Keycloak later** when ready  
✅ **No breaking changes** when you enable Keycloak  

Just run `npm install && npm run dev` and start building! 🚀
