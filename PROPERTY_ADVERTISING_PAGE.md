# Property Advertising Page

## Overview

A premium property advertising page similar to OpenRent, adapted for the Indian market with unique UX and modern design.

**Route**: `/pricing/property-advertising`

## Features

### ✅ Completed

1. **Premium Hero Section**
   - Gradient background with clear CTA
   - "Advertise Now for Free" button
   - Professional typography

2. **Statistics Bar**
   - Average days to let (7 days)
   - Total active listings (125,000+)
   - Success rate (98%)
   - Ready for API integration

3. **Pricing Packages** (Indian Market)
   - **Free Package**: ₹0 - Rent Setu only
   - **Portal Advertising**: ₹999 - MagicBricks, 99acres, Housing.com, CommonFloor + 100+ sites
   - **Complete Package**: ₹1,999 (was ₹3,999) - Full tenancy services

4. **Premium Pricing Cards**
   - Hover effects
   - "Most Popular" badge
   - Feature lists with checkmarks
   - Portal listings
   - Clear CTAs

5. **Portal Logos Section**
   - MagicBricks
   - 99acres
   - Housing.com
   - CommonFloor
   - Rent Setu

6. **Features Section**
   - 6 key benefits
   - Icon-based design
   - Hover effects

7. **FAQ Section**
   - Accordion-style
   - 6 common questions
   - Indian market specific

8. **Testimonials**
   - 3 landlord testimonials
   - Star ratings
   - Indian names and locations

9. **Final CTA Section**
   - Dark background
   - Clear call-to-action
   - Additional trust text

## API Integration

### Current Status

The page uses **dummy data** but is prepared for API integration.

### Files

- **Page Component**: `app/pricing/property-advertising/page.tsx`
- **API Utilities**: `lib/api/propertyAdvertising.ts`
- **Layout/Metadata**: `app/pricing/property-advertising/layout.tsx`

### When API is Ready

1. **Update `lib/api/propertyAdvertising.ts`**:

```typescript
export async function getPropertyStats(): Promise<PropertyStats> {
  const api = useApiClient()
  return await api.get<PropertyStats>('/api/property-advertising/stats')
}

export async function getPricingPackages(): Promise<PricingPackage[]> {
  const api = useApiClient()
  return await api.get<PricingPackage[]>('/api/pricing/packages')
}
```

2. **Update the page component**:

```typescript
// Replace dummy data with API calls
const stats = await getPropertyStats()
const packages = await getPricingPackages()
```

### API Endpoints Expected

#### GET `/api/property-advertising/stats`

Response:
```json
{
  "averageDaysToLet": 7,
  "totalListings": 125000,
  "successRate": 98,
  "totalTenantsFound": 500000,
  "averageResponseTime": "2-4 hours"
}
```

#### GET `/api/pricing/packages`

Response:
```json
[
  {
    "id": "free",
    "name": "Rent Setu Advertising",
    "price": 0,
    "currency": "₹",
    "period": "Free Forever",
    "features": [...],
    "portals": ["Rent Setu"],
    "ctaText": "Get Started Free",
    "ctaHref": "/landlords/add-listing"
  },
  ...
]
```

## Indian Market Adaptations

1. **Currency**: ₹ (INR) instead of £ (GBP)
2. **Portals**: 
   - MagicBricks (instead of Rightmove)
   - 99acres (instead of OnTheMarket)
   - Housing.com
   - CommonFloor
3. **Pricing**: Adapted for Indian market (₹999, ₹1,999)
4. **Content**: Indian context, cities, names
5. **Legal**: References to Indian rental laws

## Design Highlights

- **Premium UX**: Clean, modern, professional
- **Responsive**: Mobile-first design
- **Animations**: Smooth hover effects and transitions
- **Typography**: Clear hierarchy and readability
- **Colors**: Consistent with brand (primary-950, accent-green)
- **Spacing**: Generous whitespace for premium feel

## Navigation

The page is accessible via:
- Navbar → Pricing & Services → Property Advertising
- Direct URL: `/pricing/property-advertising`
- Footer → Landlords → Pricing

## Next Steps

1. ✅ Page created and styled
2. ⏳ Wait for API endpoints
3. ⏳ Replace dummy data with API calls
4. ⏳ Add real portal logos/images
5. ⏳ Add more testimonials from real users
6. ⏳ A/B test pricing packages

## Testing

Test the page at: `http://localhost:3000/pricing/property-advertising`

Check:
- ✅ All sections render correctly
- ✅ Pricing cards display properly
- ✅ FAQ accordion works
- ✅ CTAs link correctly
- ✅ Mobile responsiveness
- ✅ Loading states (when API is added)
