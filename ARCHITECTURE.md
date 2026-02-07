# Architecture Documentation

## Overview

This document describes the architecture of the Rental Platform, a production-grade Next.js application designed for scalability, SEO optimization, and maintainability.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (Browser)                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Static     │  │   Dynamic    │  │  Protected   │       │
│  │   Pages      │  │   Pages      │  │   Routes     │       │
│  │  (SSG)       │  │  (SSR/CSR)   │  │  (Auth)      │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Content    │  │   Component  │  │   Auth       │       │
│  │   Config     │  │   Library    │  │   Module     │       │
│  │              │  │              │  │              │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Keycloak   │  │   CMS        │  │   Analytics   │       │
│  │   (Auth)     │  │   (Future)   │  │   (Future)    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Folder Structure

### Directory Organization

```
rental-platform/
├── app/                          # Next.js App Router
│   ├── (routes)/                 # Route groups (future)
│   ├── [dynamic]/                # Dynamic routes (future)
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   ├── sitemap.ts                # Dynamic sitemap
│   └── robots.ts                 # Robots.txt
│
├── components/                   # React components
│   ├── layout/                   # Layout components
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── ui/                       # Reusable UI components
│       ├── Hero.tsx
│       ├── FeatureGrid.tsx
│       ├── CTA.tsx
│       └── FAQ.tsx
│
├── config/                       # Configuration files
│   └── content.ts                # Centralized content
│
├── lib/                          # Utility libraries
│   ├── auth/                     # Authentication
│   │   └── keycloak.tsx
│   └── seo/                      # SEO utilities
│       └── metadata.tsx
│
├── public/                       # Static assets
│   ├── images/
│   └── favicon.ico
│
├── middleware.ts                 # Next.js middleware
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

## Component Architecture

### Component Hierarchy

```
RootLayout
├── KeycloakProvider (Auth Context)
│   └── App
│       ├── Navbar
│       │   └── Navigation Links
│       │   └── Auth Buttons
│       │
│       ├── Page Content
│       │   ├── Hero
│       │   ├── FeatureGrid
│       │   ├── CTA
│       │   └── FAQ
│       │
│       └── Footer
│           └── Footer Links
```

### Component Types

1. **Layout Components** (`components/layout/`)
   - Navbar: Navigation and authentication
   - Footer: Site footer with links

2. **UI Components** (`components/ui/`)
   - Hero: Hero sections with CTAs
   - FeatureGrid: Grid of features
   - CTA: Call-to-action sections
   - FAQ: Accordion FAQ component

3. **Page Components** (`app/*/page.tsx`)
   - Server components (default)
   - Use content from config
   - Generate metadata for SEO

## Content Management Architecture

### Content Flow

```
config/content.ts
    │
    ├── Page Content Definitions
    │   ├── SEO Metadata
    │   ├── Hero Sections
    │   ├── Features
    │   ├── CTAs
    │   └── FAQs
    │
    └── Helper Functions
        ├── getPageContent()
        └── getSEOConfig()
```

### Content Structure

```typescript
PageContent {
  seo: SEOConfig
  hero?: HeroSection
  features?: Feature[]
  cta?: CTASection
  faq?: FAQItem[]
  content?: {
    sections?: Section[]
  }
}
```

### Benefits

1. **Centralized**: All content in one place
2. **Type-Safe**: TypeScript interfaces
3. **CMS-Ready**: Structure supports CMS integration
4. **SEO-Integrated**: Metadata included
5. **Maintainable**: Easy to update

## Authentication Architecture

### Keycloak Integration

```
User Action
    │
    ▼
KeycloakProvider (Client Component)
    │
    ├── Initialize Keycloak
    ├── Handle Login Redirect
    ├── Manage Token
    └── Provide Context
    │
    ▼
useKeycloak Hook
    │
    ├── isAuthenticated
    ├── login()
    ├── logout()
    └── token
```

### Authentication Flow

1. **Initialization**
   - Keycloak client initialized on mount
   - Checks SSO status
   - Updates token on expiration

2. **Login**
   - Redirects to Keycloak login page
   - User authenticates
   - Redirects back with token

3. **Token Management**
   - Token stored in memory
   - Auto-refresh on expiration
   - Logout clears session

### Protected Routes

- **Middleware**: Checks authentication for protected routes (`middleware.ts`). Public routes (home, search, about, pricing, services, help, contact, legal, `/auth/login`, `/auth/callback`, `/error/403`) are allowed; `/dashboard` and `/admin` require Keycloak when configured.
- **Auth guard**: When Keycloak is enabled and the token cookie is missing on a protected path, middleware redirects to `/auth/login?redirect=<pathname>`. After login, the user is sent to `/auth/callback` then to the `redirect` URL.
- **Route guard (menu-based)**: Placeholder in middleware for `hasMenuAccess(pathname, userMenuItems)`; can be wired once menu/roles come from the API.
- **Client-Side**: Components check auth status via `useKeycloak()`.
- **Server-Side**: Token and user are available via `lib/auth/token.ts` (`getToken()`, `getUser()`) using cookies set by the client after Keycloak login.

### Interceptors and API client

Aligned with the High-Level and Next.js auth docs:

- **Request interceptor (AuthInterceptor equivalent)**: `lib/api/client.ts` attaches `Authorization: Bearer <token>` when a `getToken` option is provided.
- **Response interceptor (ErrorInterceptor equivalent)**: On 401 → redirect to `/auth/login` (or `/auth/otp` for code `NCAUTH0027`); on 403 → redirect to `/error/403`; on 5xx/4xx → throw with message.
- **Common API methods**: `apiClient.get`, `apiClient.post`, `apiClient.put`, `apiClient.delete` with optional `getToken` and `baseURL`. Use from client via `useApiClient()` which injects the Keycloak token and `NEXT_PUBLIC_API_URL` as base.

Example:

```ts
const api = useApiClient()
const data = await api.get<MyType>('/my-endpoint')
await api.post('/my-endpoint', body)
```

### Design alignment (reference docs)

This project’s auth implements the behavior described in the design docs, adapted for Next.js and Keycloak:

- **High-Level Software Design Authentication**: AuthInterceptor (token attachment) and ErrorInterceptor (401/403 handling) in `lib/api/client.ts`; AuthGuard via middleware redirect to `/auth/login`; RouteGuard stub in middleware; common GET/POST/PUT/DELETE API layer.
- **Next.js Authentication System**: Middleware for public vs protected routes and redirect with `?redirect=`; React context for auth state; token and user in cookies for server/middleware; Keycloak as identity provider; login at `/auth/login`, callback at `/auth/callback`.

## SEO Architecture

### SEO Implementation

```
Page Component
    │
    ├── Import Content Config
    ├── Generate Metadata
    │   ├── Title
    │   ├── Description
    │   ├── OpenGraph
    │   ├── Twitter Cards
    │   └── Structured Data
    │
    └── Render Page
```

### SEO Features

1. **Metadata API**: Next.js 14 metadata API
2. **OpenGraph**: Social media sharing
3. **Twitter Cards**: Twitter-specific metadata
4. **Structured Data**: JSON-LD for search engines
5. **Sitemap**: Dynamic sitemap generation
6. **Robots.txt**: Search engine directives

## Microfrontend Strategy

### Current Architecture

The application is structured to support microfrontend architecture:

1. **Modular Pages**: Each page is independent
2. **Shared Components**: Reusable component library
3. **Content Config**: Centralized but replaceable
4. **Isolated Auth**: Authentication module is separate

### Future Microfrontend Implementation

#### Option 1: Module Federation

```
Shell Application
├── Core Layout (Navbar, Footer)
├── Auth Module (Keycloak)
└── Feature Modules
    ├── Property Search
    ├── Property Listing
    ├── User Dashboard
    └── Property Management
```

#### Option 2: Independent Deployments

- Each route can be a separate microfrontend
- Shared layout components
- Centralized authentication
- Independent versioning

#### Option 3: Monorepo Approach

- Shared component library
- Independent applications
- Shared utilities
- Centralized configuration

## Performance Architecture

### Optimization Strategy

1. **Static Generation**
   - All public pages are SSG
   - Pre-rendered at build time
   - Maximum performance

2. **Code Splitting**
   - Automatic with Next.js
   - Route-based splitting
   - Component lazy loading

3. **Image Optimization**
   - Next.js Image component
   - Automatic optimization
   - Lazy loading

4. **CSS Optimization**
   - Tailwind CSS purging
   - Minimal CSS output
   - Critical CSS extraction

## CSS & Styling Architecture

### Guidelines

1. **Prefer Tailwind** for component-level styles. Use utility classes first; add custom CSS only when reused or when design tokens are needed.
2. **Design tokens live in variables** – use `app/styles/variables.css` for layout (e.g. hero dimensions), typography, colors, and spacing. Reference them in components and in Tailwind via `var(--name)`.
3. **Helpers live in helpers** – use `app/styles/helpers.css` for shared utility classes (a11y, layout, line-clamp, etc.). Keep helpers minimal; prefer Tailwind where possible.
4. **One global entry** – `app/globals.css` imports Tailwind, then `variables.css`, then `helpers.css`, then base/component layers. Page- or route-specific CSS should be co-located or imported from `app/styles/` if shared.
5. **Naming** – Use BEM-like names for component-specific classes (e.g. `.hero`, `.hero__image`). Use kebab-case for variables (`--hero-height`).

### File Structure

```
app/
├── globals.css          # Tailwind + imports; base & component layers
└── styles/
    ├── variables.css   # Design tokens (CSS custom properties)
    └── helpers.css      # Reusable utility / helper classes
```

### Variables (`app/styles/variables.css`)

- **Hero**: `--hero-width`, `--hero-height` (1560px × 400px), `--hero-min-height`, `--hero-aspect-ratio`
- **Layout**: `--container-max`, `--header-height`, `--section-padding-y`
- **Typography**: `--font-sans`, `--text-hero-title`, `--text-hero-lead`, `--text-section-title`
- **Colors**: Optional semantic overrides (e.g. `--color-primary-950`)
- **Spacing**: `--space-section`, `--radius-lg`, etc.

### Helpers (`app/styles/helpers.css`)

- **A11y**: `.sr-only`, `.not-sr-only`, `.focus-ring`
- **Layout**: `.container-tight`, `.section-pad`, `.hero-image-wrap`, `.hero-aspect`
- **Text**: `.text-balance`, `.line-clamp-2`, `.line-clamp-3`
- **Interaction**: `.transition-base`

### Hero Dimensions

- **Reference size**: 1560px × 400px (width × height).
- Use `var(--hero-width)` and `var(--hero-height)` for hero images; `.hero` and `.hero__image` apply min-height and max dimensions so the hero section and any background/foreground image stay consistent.

### Performance Targets

- **Lighthouse Score**: 95+
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s

## Security Architecture

### Security Measures

1. **Authentication**
   - Keycloak for enterprise auth
   - Token-based authentication
   - Secure token storage

2. **Route Protection**
   - Middleware for route guards
   - Server-side verification
   - Client-side checks

3. **Content Security**
   - Input validation
   - XSS protection
   - CSRF protection (via Keycloak)

4. **Data Protection**
   - HTTPS enforcement
   - Secure cookies
   - Token encryption

## Deployment Architecture

### Build Process

```
Source Code
    │
    ├── TypeScript Compilation
    ├── Content Config Processing
    ├── Static Page Generation
    ├── Asset Optimization
    └── Bundle Creation
    │
    ▼
Static Export
    │
    ├── HTML Files
    ├── JavaScript Bundles
    ├── CSS Files
    └── Static Assets
```

### Deployment Options

1. **Static Hosting**
   - Vercel (recommended)
   - Netlify
   - AWS S3 + CloudFront
   - GitHub Pages

2. **Server Deployment**
   - Node.js server
   - Docker container
   - Kubernetes

3. **CDN Distribution**
   - CloudFlare
   - AWS CloudFront
   - Fastly

## Scalability Considerations

### Horizontal Scaling

- Stateless application
- CDN for static assets
- Load balancing ready
- Database-independent (for static pages)

### Vertical Scaling

- Optimized bundle sizes
- Efficient rendering
- Minimal server resources
- Fast build times

### Future Scalability

1. **API Integration**: Add API routes for dynamic content
2. **Database**: Add database for user data
3. **Caching**: Implement caching strategies
4. **CDN**: Use CDN for global distribution

## Monitoring & Analytics

### Recommended Tools

1. **Performance Monitoring**
   - Vercel Analytics
   - Google Analytics
   - Lighthouse CI

2. **Error Tracking**
   - Sentry
   - LogRocket

3. **User Analytics**
   - Google Analytics
   - Mixpanel
   - Amplitude

## Conclusion

This architecture provides:

- ✅ **Scalability**: Modular, microfrontend-ready
- ✅ **Performance**: SSG, optimized bundles
- ✅ **SEO**: Comprehensive SEO implementation
- ✅ **Maintainability**: Clear structure, type safety
- ✅ **Security**: Enterprise authentication
- ✅ **Flexibility**: Content-driven, CMS-ready

The architecture is designed to grow with your needs while maintaining performance and developer experience.
