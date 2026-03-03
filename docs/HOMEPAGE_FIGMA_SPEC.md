# Homepage — Figma Design Spec (Match to Running App)

**Reference Figma:** [Rentals Platform prototype](https://www.figma.com/proto/lxooIESthGxh5bwUQrr5BN/Rentals-Platform?node-id=3311-1661) — Navbar, Hero, stats strip, For Landlords & Tenants section, and portal strip are implemented to match this design.

Use this spec to recreate or refine the RentalPlatform homepage in Figma so it matches the live site exactly.

---

## 0. Quick setup in Figma

- **Figma → Design → Variables:** Create a collection e.g. `RentalPlatform`.
- **Colors:** Add variables with hex values below (e.g. `primary/950` = `#0a3d5c`).
- **Typography:** Set text styles for Body (DM Sans 400 16px), H1 Hero (DM Sans 600 40px), H2 Section (DM Sans 600 30px), Button (DM Sans 600 18px).
- **Layout:** Create a 1440×… frame; add constraints so the main column is max 1280px centered.

---

## 1. Design tokens (Variables in Figma)

### Colors
| Name | Hex | Usage |
|------|-----|--------|
| **Primary 950** | `#0a3d5c` | Navbar, Hero background, stats strip |
| **Primary 600** | `#0284c7` | Buttons (Search, View all, CTAs), links hover |
| **Primary 700** | `#0369a1` | Button hover |
| **Primary 100** | `#e0f2fe` | Location pills hover, checkmark circles |
| **Primary 400** | `#38bdf8` | Input focus ring |
| **Accent Green** | `#10b981` | "Add Listing" button |
| **Accent Green Hover** | `#059669` | Add Listing hover |
| **White** | `#ffffff` | Cards, CTA button on primary |
| **Gray 50** | `#f9fafb` | Testimonial cards bg, section bg (For Landlords & Tenants) |
| **Gray 100** | `#f3f4f6` | Location pills, borders |
| **Gray 200** | `#e5e7eb` | Card borders |
| **Gray 500** | `#6b7280` | Secondary text |
| **Gray 600** | `#4b5563` | Body secondary |
| **Gray 700** | `#374151` | List text |
| **Gray 900** | `#111827` | Headings, footer dark bg |
| **Yellow 400** | `#facc15` | Star rating (testimonials) |
| **Green 600** | `#16a34a` | "Let Agreed" badge |

### Typography
- **Font family:** DM Sans (Google Font). Weights: 400, 500, 600, 700.
- **Hero title:** 40px (2.5rem) → 36px md, 48px lg · Weight 600 · Line height 1.15 · Tracking tight · Center.
- **Hero lead:** 20px (1.25rem) → 20px md · Weight 400 · Line height 1.5 · Color white 90% · Center, max-width 672px.
- **Section titles:** 30px (1.875rem) → 24px base, 30px md · Weight 600 · Gray 900 · Center where noted.
- **Body:** 16px · Weight 400 · Gray 900 default, Gray 600 for secondary.
- **Nav logo:** 20px (text-xl) · Weight 600 · White.
- **Nav links:** 14px · Weight 500 · White / white 90%.
- **Buttons (primary):** 18px · Weight 600.
- **Search placeholder:** 18px · Gray 900 in input.

### Spacing & layout
- **Container max width:** 1280px (80rem). Horizontal padding 16px (px-4).
- **Section padding Y:** Hero py-12 md:py-20; Stats py-6; Audience py-14 md:py-20 lg:py-24; Portal py-12 md:py-16; Testimonials py-16 md:py-24; Featured py-16 md:py-24; Locations py-16 md:py-20; CTA py-16 md:py-24.
- **Border radius:** lg = 8px, xl = 12px, 2xl = 16px. Pills = full (9999px).
- **Header height:** 64px (h-16).

---

## 2. Page structure (top to bottom)

### Frame: Homepage
- **Width:** 1440px (desktop). Use auto-layout vertical, fill container width.
- **Background:** White (#ffffff).

---

### 2.1 Navbar (sticky)
- **Height:** 64px.
- **Background:** #0a3d5c.
- **Container:** max 1280px, 16px padding. Flex row, space-between, items center.

**Left**
- Logo: House icon (24×24 stroke, white) + text "RentalPlatform" 20px semibold white. Link to "/".

**Center (desktop)**
- "About" — 14px medium, white/90, with chevron. Dropdown: Landlords, Tenants, About Us.
- "Pricing & Services" — same style. Mega dropdown: Packages (Packages, Property Advertising, Full Tenancy Creation, See All Pricing), Services (Tenant Referencing, Property Advertising, Full Tenancy Creation).

**Right**
- "Add Listing" — button: bg #10b981, white text, 14px medium, padding 10px 20px, radius 8px.
- "Sign In" — 14px medium white/90 (or disabled white/60 if not configured).

---

### 2.2 Hero
- **Background:** #0a3d5c.
- **Image:** Unsplash `photo-1600585154340-be6161a56a0c` 1560×400, object-cover, center, opacity 50% over section.
- **Min height:** 280px; content area py-12 md:py-20.
- **Content:** max-width 1024px (max-w-5xl) centered.

**Copy**
- H1: "Renting the way it should be" — hero title style, white, center.
- Lead: "The destination for finding, advertising, and managing rental property" — hero lead style, center.

**Search bar**
- Single row: search input + "Search" button.
- **Input:** flex-1, max-width 672px (max-w-2xl). Height 56px (py-4). Left padding 48px (icon 20×20 gray-400 left 16px). Border radius 8px. Background white. Text 18px gray-900. Placeholder: "Enter a location to search".
- **Icon:** Location pin SVG, 20×20, gray-400, absolute left 16px vertical center.
- **Button:** bg #0284c7, white, 18px semibold, padding 16px 32px, radius 8px, "Search".

**Social proof**
- "1 Lakh+ Tenants and Landlords" — 14px base, white 80%, center below search.

---

### 2.3 Stats strip
- **Background:** #0a3d5c.
- **Text:** White, 18px medium, center.
- **Copy:** "1 Lakh+ Tenants and Landlords · RentalPlatform"
- **Padding:** 24px vertical (py-6).

---

### 2.4 For Landlords & Tenants (HomeAudienceSection)
- **Background:** #f9fafb (gray-50).
- **Padding:** py-14 md:py-20 lg:py-24.

**Header**
- H2: "For Landlords & Tenants" — 24px md:30px semibold gray-900, center.
- Sub: "Whether you want to list your property or find your next home, we've got you covered." — gray-600, center, max-width 672px. Margin bottom 40px md:56px.

**Grid:** 2 columns (lg), gap 32px md:40px lg:48px. Max-width 1152px (max-w-6xl) centered.

**Card (×2)**
- **Container:** White bg, border 1px gray-200, radius 16px, shadow-sm. Overflow hidden. Hover shadow-md.
- **Image:** Aspect 16/10, object-cover. Gradient overlay: from black/60 (bottom) to transparent (top).
  - Landlords: Unsplash `photo-1516321318423-f06f85e504b3` 600×375.
  - Tenants: Unsplash `photo-1600585154526-990dced4db0d` 600×375.
- **Image caption (overlay):** Bottom, padding 20px. Title 20px md:24px semibold white. Subtitle 14px md:16px medium white/95.
- **Body padding:** 24px md:32px.
- **Description:** Gray-600, 16px, line height relaxed, margin bottom 24px.
- **Bullets:** List with 20×20 circle bg primary-100, checkmark primary-600 (12×12). Text gray-700. Spacing 12px between items.
  - Landlords: 100% Free Advertising Option, No Hidden Fees, No Renewal Fees, No Credit Card to Get Started.
  - Tenants: No Admin Fees, No Dead Listings, Rent & Deposit Protected.
- **Buttons row:** flex wrap gap 12px. Primary: bg #0284c7, white, 14px semibold, py-2.5 px-5, radius 8px. Secondary: border gray-300, gray-700 text, same padding.
  - Landlords: "Start Advertising" | "Learn more".
  - Tenants: "Search Properties" | "Learn more".

---

### 2.5 Portal logos
- **Background:** White. Border top and bottom 1px gray-200.
- **Padding:** py-12 md:py-16.

**Copy**
- "We advertise on Rightmove, OnTheMarket and many more" — gray-600, medium, center, mb-32px.

**Logos row**
- Flex wrap, justify center, gap 32px md:48px.
- Text only (no images in app): "Rightmove", "OnTheMarket", "RentalPlatform" — 20px md:24px semibold gray-400, hover gray-600.

---

### 2.6 Testimonials
- **Background:** White.
- **Padding:** py-16 md:py-24.

**Header**
- H2: "What people are saying" — 24px md:30px semibold gray-900, center, mb-16px.
- Sub: "1 Lakh+ Tenants and Landlords · Happy tenants and landlords" — gray-600, center, max-width 672px, mb-48px.

**Grid:** 3 columns (md), gap 32px. 1 column on mobile.

**Card (×4 from content)**
- **Container:** bg gray-50 (#f9fafb), padding 24px, radius 12px, border 1px gray-100.
- **Stars:** 5 × ★ (yellow-400 #facc15), 16px, mb-16px.
- **Quote:** "…" content in gray-700, italic, mb-16px.
- **Author:** Name in semibold gray-900; role "— Role" in gray-600 normal.

Content:
1. Rahul — "Happy to recommend - smart and seamless service." 5★
2. Vinod — "Got a contract signed and deposit sorted within 24 hours of listing." 5★
3. Devashish — "Rented out my house in a week! The reference service brings peace of mind." 5★
4. Pooja — "Easy and efficient service with great reach. Found my ideal tenant quickly." 5★

---

### 2.7 Featured Properties
- **Background:** White.
- **Padding:** py-16 md:py-24.

**Header**
- H2: "Featured Properties" — 24px md:30px semibold gray-900, mb-8px.
- Sub: "Some of our available and recently let properties" — gray-600, mb-40px.

**Grid:** 3 columns (lg), 2 (sm), 1 (default). Gap 24px.

**Property card (×6)**
- **Container:** White, border gray-200, radius 12px, overflow hidden. Hover: shadow-lg, border primary-200.
- **Image:** Aspect 4/3, object-cover. Hover scale 105%. Size 400×300.
- **Badge (if Let Agreed):** Top-left 12px. bg green-600, white, 12px semibold, px-8 py-4, radius 4px. "Let Agreed."
- **Price overlay:** Bottom 12px, left/right 12px. White, bold 18px, drop shadow. "/ month" 14px normal.
- **Body:** padding 16px. Title: semibold gray-900, hover primary-600. "Title, City". Meta: 14px gray-500 "X bed · Y bath".

**Data (in order):**
1. ₹15,000, 1 bed 1 bath, 1 BHK Flat Riverside, Mumbai — no badge
2. ₹28,000, 2 bed 2 bath, 2 BHK Flat Koramangala, Bangalore — Let Agreed
3. ₹18,000, 2 bed 1 bath, 2 BHK Flat Anna Nagar, Chennai — no badge
4. ₹35,000, 1 bed 1 bath, 1 BHK Flat Bandra, Mumbai — no badge
5. ₹22,000, 2 bed 2 bath, 2 BHK Flat Indiranagar, Bangalore — Let Agreed
6. ₹12,000, 2 bed 1 bath, 2 BHK Flat Salt Lake, Kolkata — no badge

**CTA**
- "View all properties" — center, mt-40px. Button: bg #0284c7, white, 16px semibold, py-12 px-24, radius 8px.

---

### 2.8 Popular Locations
- **Background:** White.
- **Padding:** py-16 md:py-20.

**Header**
- H2: "Popular Locations" — 24px md:30px semibold gray-900, center, mb-40px.

**Pills**
- Flex wrap, justify center, gap 12px.
- Each: padding 8px 16px, radius full, bg gray-100, gray-700 medium. Hover: bg primary-100, text primary-700.

**Cities (in order):** Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Kolkata, Pune, Ahmedabad, Jaipur, Surat, Lucknow, Kanpur, Nagpur, Indore, Thane, Bhopal.

---

### 2.9 CTA
- **Background:** #0284c7 (primary-600).
- **Text:** White.
- **Padding:** py-16 md:py-24.

**Content:** max-width 768px (max-w-3xl) centered, text center.

- H2: "Ready to get started?" — 30px (section-title) md:30px semibold, mb-16px.
- P: "Join thousands of happy tenants and landlords" — 20px md:20px, opacity 90%, mb-32px.
- **Buttons row:** flex col (mobile) / row (sm), gap 16px, justify center.
  - Primary: bg white, text primary-700, 18px semibold, py-16 px-32, radius 8px, shadow-lg.
  - Secondary: border 2px white, white text, same padding. "Get Started" | "Learn More".

---

### 2.10 Footer
- **Background:** #18181b (gray-900).
- **Text:** gray-300 default. Headings white semibold.
- **Padding:** py-48px, container 1280px, 16px padding.

**Layout:** Grid 1 col (default), 2 (md), 5 (lg). First column span 2 on lg.

**Column 1 (brand)**
- "RentalPlatform" — 24px bold white, mb-16px.
- "The destination for finding, advertising, and managing rental property." — gray-400, mb-16px.
- "© [Year] RentalPlatform. All rights reserved." — 14px gray-500.

**Column 2 — For Tenants**
- H3: "For Tenants". Links: Search Properties, How It Works, Help Center.

**Column 3 — For Landlords**
- H3: "For Landlords". Links: List Your Property, Pricing, Services.

**Column 4 — Company & Legal**
- H3: "Company". Links: About Us, Contact, Blog.
- H3: "Legal". Links: Privacy Policy, Terms & Conditions.

All links gray-300, hover white.

---

## 3. Assets / images

- Hero: `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1560&q=80`
- Landlords card: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80`
- Tenants card: `https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80`
- Featured properties: use 6 Unsplash URLs from `FeaturedProperties.tsx` (photo-1522708323590, photo-1600596542815, photo-1600607687939, photo-1600585154340, photo-1564013799919, photo-1600566753190).

---

## 4. Breakpoints (for variants in Figma)

- **Default:** &lt; 768px. Single column, smaller type.
- **md:** 768px+. 2-col grids where applicable, py values increase.
- **lg:** 1024px+. 3-col Featured, 2-col Audience, 5-col footer.

Use the tokens and section structure above to build frames and components in Figma so the design matches the running app pixel-accurate.
