# Rental Platform - Production-Grade Next.js Application

A production-ready, SEO-optimized rental platform built with Next.js 14, TypeScript, and Tailwind CSS. Similar to OpenRent, this platform provides a comprehensive solution for property rentals with a focus on transparency, user experience, and performance.

## 🏗️ Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Keycloak (redirect-based)
- **Deployment**: Static Site Generation (SSG)
- **Architecture**: Microfrontend-ready

### Key Features
- ✅ **SEO Optimized**: Full metadata, OpenGraph, Twitter cards, structured data
- ✅ **Content-Driven**: All content from centralized config files
- ✅ **Static Generation**: All public pages are statically generated
- ✅ **Keycloak Integration**: Enterprise-grade authentication
- ✅ **Microfrontend Ready**: Modular architecture for independent deployments
- ✅ **Performance**: Lighthouse score target 95+
- ✅ **Responsive**: Mobile-first design

## 📁 Project Structure

```
rental-platform/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page
│   ├── what-we-are/        # About pages
│   ├── what-we-do/
│   ├── about-tenants/
│   ├── about-landlords/
│   ├── help-center/
│   ├── contact/
│   ├── privacy-policy/
│   ├── terms/
│   ├── sitemap.ts          # Dynamic sitemap
│   └── robots.ts           # Robots.txt
├── components/
│   ├── layout/             # Layout components
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── ui/                 # Reusable UI components
│       ├── Hero.tsx
│       ├── FeatureGrid.tsx
│       ├── CTA.tsx
│       └── FAQ.tsx
├── config/
│   └── content.ts          # Centralized content configuration
├── lib/
│   ├── auth/               # Authentication
│   │   └── keycloak.tsx    # Keycloak integration
│   └── seo/                # SEO utilities
│       └── metadata.tsx    # Metadata generation
├── middleware.ts           # Route protection middleware
└── public/                 # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- **Keycloak is optional** - the app works without it for development!

### Installation

1. **Clone and install dependencies:**
```bash
cd rental-platform
npm install
```

2. **Set up environment variables:** Create a `.env` file in the project root. Keycloak is optional — leave `NEXT_PUBLIC_KEYCLOAK_URL` and `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` empty to run without auth:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Keycloak (optional – leave URL and CLIENT_ID empty to run without auth)
# NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
# NEXT_PUBLIC_KEYCLOAK_REALM=myrealm
# NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=nextjs-app
```

**Note**: The application works without Keycloak. See `SETUP_WITHOUT_KEYCLOAK.md` and `KEYCLOAK_SETUP.md` for auth setup.

3. **Run development server:**
```bash
npm run dev
```

4. **Build for production:**
```bash
npm run build
npm start
```

## 📤 Host on GitHub

To put this project on GitHub and push your code:

### 1. Install Git (if needed)

- Download: [git-scm.com](https://git-scm.com/download/win)
- Run the installer and use default options. Restart your terminal/IDE after installing.

### 2. Create a new repository on GitHub

- Go to [github.com](https://github.com) and sign in.
- Click **New** (or **+** → **New repository**).
- Choose a name (e.g. `rental-platform`), set visibility (Public/Private), **do not** add a README or .gitignore (you already have them).
- Click **Create repository**.

### 3. Initialize Git and push from your machine

In a terminal, from your project folder:

```bash
cd c:\Users\DEll\rental-platform

# Initialize Git (if not already)
git init

# Add all files (respects .gitignore: skips node_modules, .env, .next, etc.)
git add .

# First commit
git commit -m "Initial commit: rental platform"

# Add your GitHub repo as remote (replace YOUR_USERNAME and YOUR_REPO with your GitHub username and repo name)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Rename branch to main (if needed) and push
git branch -M main
git push -u origin main
```

Use your GitHub repo URL from the “Quick setup” page (e.g. `https://github.com/DEll/rental-platform.git`).

**Note:** Your `.gitignore` already excludes `node_modules`, `.env`, `.next`, and other generated files, so secrets and build artifacts are not pushed.

## 📝 Content Management

All page content is managed through `config/content.ts`. This centralized approach allows:

- **Easy Updates**: Change content without touching components
- **CMS Ready**: Structure supports future CMS integration
- **Type Safety**: Full TypeScript support
- **SEO Integration**: SEO metadata included in content config

### Example: Adding a New Page

1. Add content to `config/content.ts`:
```typescript
export const pageContent: Record<string, PageContent> = {
  'new-page': {
    seo: {
      title: 'New Page | Rental Platform',
      description: 'Page description',
    },
    hero: {
      title: 'Page Title',
      description: 'Page description',
    },
  },
}
```

2. Create page file `app/new-page/page.tsx`:
```typescript
import { getPageContent } from '@/config/content'
import { generateMetadata } from '@/lib/seo/metadata'
import Hero from '@/components/ui/Hero'

const pageContent = getPageContent('new-page')

export const metadata = generateMetadata(pageContent.seo)

export default function NewPage() {
  return <Hero content={pageContent.hero} />
}
```

## 🔐 Authentication (Keycloak)

### Setup (Optional)

**The app works without Keycloak!** Skip this section to develop without authentication.

For full steps (env vars, Keycloak Admin client settings, redirect URIs), see **[KEYCLOAK_SETUP.md](./KEYCLOAK_SETUP.md)**.

1. **Install Keycloak JS:** `npm install keycloak-js`
2. **Configure Keycloak:** Realm (e.g. `myrealm`), client (e.g. `nextjs-app`), redirect URIs `http://localhost:3000/auth/callback` and `http://localhost:3000/*`, Web origins `http://localhost:3000`, access type **public**, PKCE.
3. **Set `.env`:** `NEXT_PUBLIC_KEYCLOAK_URL`, `NEXT_PUBLIC_KEYCLOAK_REALM`, `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID`
4. Restart dev server.

See `SETUP_WITHOUT_KEYCLOAK.md` for running without Keycloak.

### Usage

The authentication is handled via the `KeycloakProvider` in the root layout. Components can use the `useKeycloak` hook:

```typescript
import { useKeycloak } from '@/lib/auth/keycloak'

function MyComponent() {
  const { isAuthenticated, login, logout } = useKeycloak()
  
  if (!isAuthenticated) {
    return <button onClick={login}>Login</button>
  }
  
  return <button onClick={logout}>Logout</button>
}
```

## 🎨 Styling

The project uses Tailwind CSS with a custom design system:

- **Primary Colors**: Blue palette (primary-50 to primary-900)
- **Secondary Colors**: Gray palette (secondary-50 to secondary-900)
- **Typography**: Inter font family
- **Responsive**: Mobile-first breakpoints

### Customization

Edit `tailwind.config.ts` to customize colors, fonts, and spacing.

## 🔍 SEO Implementation

### Features
- ✅ Dynamic metadata generation
- ✅ OpenGraph tags
- ✅ Twitter cards
- ✅ Structured data (JSON-LD)
- ✅ Sitemap generation
- ✅ Robots.txt
- ✅ Canonical URLs

### Metadata Structure

Each page uses the `generateMetadata` function with content from `config/content.ts`:

```typescript
export const metadata: Metadata = generateMetadata(pageContent.seo)
```

## 🏗️ Microfrontend Architecture

The project is structured to support microfrontend architecture:

### Current Structure
- **Core Layout**: Shared Navbar and Footer
- **Shared Components**: Reusable UI components
- **Isolated Pages**: Each page can be independently deployed
- **Content Config**: Centralized but replaceable

### Future Microfrontend Strategy

1. **Module Federation** (if needed):
   - Core shell application
   - Independent feature modules
   - Shared component library

2. **Independent Deployment**:
   - Each page route can be a separate microfrontend
   - Shared layout components
   - Centralized authentication

3. **Content Management**:
   - Current: TypeScript config files
   - Future: Headless CMS integration
   - API-driven content

## 📊 Performance Optimization

### Implemented
- ✅ Static Site Generation (SSG)
- ✅ Image optimization (Next.js Image component)
- ✅ Code splitting (automatic with Next.js)
- ✅ Minimal client-side JavaScript
- ✅ Optimized CSS (Tailwind purging)

### Lighthouse Targets
- Performance: 95+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

### Code Quality

- TypeScript for type safety
- ESLint for code quality
- Prettier (recommended) for formatting

## 📄 Pages

All required pages are implemented:

1. **Home** (`/`) - Landing page with hero, features, testimonials
2. **What We Are** (`/what-we-are`) - About the platform
3. **What We Do** (`/what-we-do`) - Services overview
4. **For Tenants** (`/about-tenants`) - Tenant-focused content
5. **For Landlords** (`/about-landlords`) - Landlord-focused content
6. **Help Center** (`/help-center`) - FAQ and support
7. **Contact** (`/contact`) - Contact information
8. **Privacy Policy** (`/privacy-policy`) - Privacy policy
9. **Terms** (`/terms`) - Terms and conditions

## 🔄 Future Enhancements

### Phase 2 (Planned)
- [ ] Property search functionality
- [ ] Property listing pages
- [ ] User dashboard
- [ ] Property management tools
- [ ] Payment integration
- [ ] Real-time messaging
- [ ] Advanced filtering

### Phase 3 (Planned)
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] AI-powered recommendations
- [ ] Multi-language support
- [ ] Advanced property management

## 📚 Documentation

### Architecture Decisions

1. **Content Config System**: Centralized content allows for easy CMS migration
2. **SSG for Public Pages**: Maximum performance and SEO
3. **Keycloak for Auth**: Enterprise-grade authentication
4. **Component-Based**: Reusable components for consistency
5. **TypeScript**: Type safety throughout

### Best Practices

- All content comes from config files
- Components are reusable and composable
- SEO metadata is generated automatically
- Authentication is isolated and modular
- Performance is prioritized

## 🤝 Contributing

This is a production-ready starter template. To extend:

1. Add new pages to `app/` directory
2. Add content to `config/content.ts`
3. Create reusable components in `components/`
4. Extend SEO metadata as needed

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For questions or issues:
- Check the Help Center (`/help-center`)
- Contact support (`/contact`)
- Review documentation in this README

---

**Built with ❤️ for production-grade rental platforms**
# dev-ui-openrent
