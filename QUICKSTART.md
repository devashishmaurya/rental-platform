# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- **Keycloak is optional** - the app works without it for development!

## Installation

1. **Navigate to project directory:**
```bash
cd rental-platform
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:** Create a `.env` file. Keycloak is optional — leave URL and CLIENT_ID empty to run without auth:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Keycloak (optional)
# NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
# NEXT_PUBLIC_KEYCLOAK_REALM=myrealm
# NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=nextjs-app
```

## Running the Application

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Keycloak Setup (Optional)

**You can run the app without Keycloak!** All pages and features work except authentication.

When you're ready: see **[KEYCLOAK_SETUP.md](./KEYCLOAK_SETUP.md)** for env vars, Keycloak Admin client (realm `myrealm`, client `nextjs-app`, redirect URIs `http://localhost:3000/auth/callback` and `http://localhost:3000/*`), and verification. See `SETUP_WITHOUT_KEYCLOAK.md` for running without Keycloak.

## Project Structure Overview

```
rental-platform/
├── app/                    # Pages (Next.js App Router)
│   ├── page.tsx           # Home page
│   ├── what-we-are/       # About pages
│   └── ...
├── components/            # React components
│   ├── layout/           # Navbar, Footer
│   └── ui/               # Reusable UI components
├── config/               # Configuration
│   └── content.ts        # All page content
├── lib/                  # Utilities
│   ├── auth/             # Keycloak integration
│   └── seo/              # SEO utilities
└── public/               # Static assets
```

## Adding a New Page

1. **Add content to `config/content.ts`:**
```typescript
export const pageContent: Record<string, PageContent> = {
  'my-new-page': {
    seo: {
      title: 'My New Page | Rental Platform',
      description: 'Page description',
    },
    hero: {
      title: 'Page Title',
      description: 'Page description',
    },
  },
}
```

2. **Create page file `app/my-new-page/page.tsx`:**
```typescript
import { getPageContent } from '@/config/content'
import { generateMetadata } from '@/lib/seo/metadata'
import Hero from '@/components/ui/Hero'
import type { Metadata } from 'next'

const pageContent = getPageContent('my-new-page')

if (!pageContent) {
  throw new Error('Page content not found')
}

export const metadata: Metadata = generateMetadata(pageContent.seo)

export default function MyNewPage() {
  return (
    <>
      {pageContent.hero && <Hero content={pageContent.hero} />}
    </>
  )
}
```

## Customizing Content

All content is in `config/content.ts`. Edit this file to update:

- Page titles and descriptions
- Hero sections
- Features
- FAQs
- CTAs
- SEO metadata

## Customizing Styles

Edit `tailwind.config.ts` to customize:

- Colors (primary, secondary)
- Fonts
- Spacing
- Breakpoints

## Common Tasks

### Update Navigation

Edit `components/layout/Navbar.tsx`:
```typescript
const navigation = [
  { name: 'Home', href: '/' },
  { name: 'New Page', href: '/new-page' },
  // ...
]
```

### Update Footer Links

Edit `components/layout/Footer.tsx`:
```typescript
const footerLinks = {
  tenants: [
    { name: 'New Link', href: '/new-link' },
    // ...
  ],
}
```

### Add New Component

1. Create component in `components/ui/` or `components/layout/`
2. Export from component file
3. Import and use in pages

## Troubleshooting

### Keycloak Not Working

- Check `.env` has `NEXT_PUBLIC_KEYCLOAK_URL`, `NEXT_PUBLIC_KEYCLOAK_REALM`, `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID`
- Verify Keycloak server is running
- In Keycloak client: set Valid Redirect URIs (`http://localhost:3000/auth/callback`, `http://localhost:3000/*`) and Web Origins (`http://localhost:3000`)
- See [KEYCLOAK_SETUP.md](./KEYCLOAK_SETUP.md)

### Build Errors

- Run `npm run type-check` to check TypeScript errors
- Run `npm run lint` to check linting errors
- Clear `.next` folder and rebuild

### Content Not Updating

- Ensure content is in `config/content.ts`
- Check page is using `getPageContent()` correctly
- Restart dev server after content changes

## Next Steps

1. **Customize Content**: Update `config/content.ts` with your content
2. **Configure Keycloak**: Set up authentication
3. **Add Pages**: Create additional pages as needed
4. **Customize Styles**: Update Tailwind config
5. **Deploy**: Follow deployment guide in README.md

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## Support

For issues or questions:
- Check README.md for detailed documentation
- Review ARCHITECTURE.md for architecture details
- Check MICROFRONTEND.md for microfrontend strategy
