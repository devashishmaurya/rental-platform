# Software Development Document  
## RentSetu (OpenRent-Style) — Full-Stack Technical Specification

**Document Type:** Technical / Software Development Document (Full-Stack)  
**Reference Product:** [OpenRent](https://www.openrent.co.uk/) — Property to rent from private landlords  
**Product Name:** RentSetu  
**Version:** 1.1  
**Last Updated:** February 2025  

This document covers the **entire system**: **Frontend** (Next.js), **Backend** (Java APIs), **Database** (PostgreSQL), **Docker**, and **VPS hosting**.

### Does this document cover everything?

| Area | Covered? | Where |
|------|----------|--------|
| **Objective & scope** | Yes | §1 Objective, §2 Scope (in / out / planned / boundaries) |
| **Stakeholders & users** | Yes | §3 |
| **Functional requirements** | Yes | §4 (public site, search, add listing, pricing, auth, dashboard) |
| **Non-functional requirements** | Yes | §5 (performance, security, availability, maintainability, accessibility) |
| **Full-stack architecture** | Yes | §6 System context, §7 Tech stack, §8 Frontend, §9 Backend, §10 Database |
| **APIs & data model** | Yes | §11 Data model & API contracts |
| **User flows** | Yes | §12 (tenant, landlord, package, auth) |
| **Soft launch (OpenRent-style)** | Yes | §13 (post-login UX, dashboard, account, landlord services, property advertising, tenancy creation, tenant referencing, **tenant section**, past orders/renewals, open questions) |
| **Security & compliance** | Yes | §14 |
| **Deployment (Docker & VPS)** | Yes | §15 |
| **Glossary & references** | Yes | §16 |
| **WBS & timeline** | Yes (separate doc) | **docs/SOFT_LAUNCH_WBS_TIMELINE.md** and **SOFT_LAUNCH_WBS_TIMELINE.csv** — project start 7 Feb, Phase 1 skipped; **all APIs** mapped to WBS; **no buffer**; target launch ~31 Mar 2025. |
| **All APIs** | Yes | **§9.3** — complete list (17 endpoints); §11.2 summary. Every API is in the timeline/WBS. |

**Working hours (timeline):** RentSetu is done **alongside office work**. Weekdays 2–4 h, weekends 8–10+ h (~30 h/week). **No buffer**; client asked for **shorter timeline** and to use **Cursor / ChatGPT** to deliver faster.

**Not in this doc (by design):** Detailed test cases (unit/integration/e2e), step-by-step runbooks, India-specific legal deep-dive (only called out in §13.10 open questions). For day-to-day tasks and dates, use the WBS/timeline docs.

---

## Table of Contents

1. [Objective](#1-objective)
2. [Scope](#2-scope)
3. [Stakeholders & Users](#3-stakeholders--users)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [System Context & Architecture](#6-system-context--architecture)
7. [Technology Stack (Full-Stack)](#7-technology-stack-full-stack)
8. [Frontend (Next.js)](#8-frontend-nextjs)
9. [Backend (Java)](#9-backend-java)
10. [Database (PostgreSQL)](#10-database-postgresql)
11. [Data Model & API Contracts](#11-data-model--api-contracts)
12. [User Flows (End-to-End)](#12-user-flows-end-to-end)
13. [Soft Launch — Low-Level Specification (OpenRent Reference)](#13-soft-launch--low-level-specification-openrent-reference)
14. [Security & Compliance](#14-security--compliance)
15. [Deployment: Docker & VPS](#15-deployment-docker--vps)
16. [Glossary & References](#16-glossary--references)
17. [Appendix: Converting this document to Word (.docx)](#17-appendix-converting-this-document-to-word-docx)

---

## 1. Objective

### 1.1 Business Objective

Build a **rental property platform** that:

- **For tenants:** Provides a single destination to search, view, and secure rental properties with **no admin fees**, transparent listings, and deposit/rent protection.
- **For landlords:** Enables **advertising of rental properties** (including a free option), optional listing on major property portals, and optional tenancy services (referencing, contracts, rent collection, etc.).
- **For the business:** Generates revenue through **premium advertising packages** (portal syndication) and **paid tenancy services** while keeping core listing free.

The product is inspired by [OpenRent](https://www.openrent.co.uk/) and adapted for the target market (e.g. India: MagicBricks, 99acres, Housing.com, CommonFloor; UK: Rightmove, OnTheMarket).

### 1.2 Technical Objective

- Deliver a **production-grade**, **SEO-optimized** web application.
- Support **static generation** for public pages and **dynamic/authenticated** flows for search, add listing, and dashboard.
- Integrate **enterprise authentication** (e.g. Keycloak) and a **backend API** for listings, search, and user actions.
- Design for **scalability** (microfrontend-ready, API-first) and **maintainability** (centralized content, type-safe stack).

### 1.3 Success Criteria

- Tenants can search and view listings; landlords can add and manage listings.
- Core landlord journey: **Add Listing** → **Choose package** (free / portal / full) → **Publish**.
- Core tenant journey: **Search** → **View listing** → **Enquire / Apply**.
- Performance: Lighthouse targets (e.g. Performance 95+, SEO 100).
- Security: Auth, HTTPS, no sensitive data in client; API token handling as per policy.

---

## 2. Scope

### 2.1 In Scope

| Area | Description |
|------|-------------|
| **Public website** | Home, About (Landlords/Tenants/OpenRent-style), What We Are/Do, Help Centre, Contact, Privacy, Terms. |
| **Search** | Location-based and filters (beds, baths, rent range, furnishing, property type). Results from backend API. |
| **Property listing (landlord)** | Multi-step Add Listing form: address, property details, rent & tenancy, description & options, review & submit. Integration with backend `POST /api/listing/add` (or equivalent). |
| **Pricing & packages** | Property Advertising page: free vs portal vs complete package; stats (days to let, listings, success rate); FAQ, testimonials. |
| **Authentication** | Login/sign-up with **two options:** (1) **Keycloak** (already implemented), (2) **Google login**. Callback handling, protected routes (dashboard, add listing when required). |
| **Dashboard (landlord)** | View/manage own listings (when implemented). |
| **API integration** | Client wrapper, proxy/backend for listing add, listing view/search. |
| **SEO & metadata** | Per-page metadata, OpenGraph, Twitter cards, sitemap, robots.txt, structured data where applicable. |
| **Content management** | Centralized config (`config/content.ts`) for copy and SEO; CMS-ready structure. |
| **Deployment** | Next.js build, Docker option, deployment to VPS/cloud; environment-based config. |

### 2.2 Out of Scope (Current Phase)

- Native mobile apps (future phase).
- Tenant referencing, contract generation, rent collection back-office (backend services).
- Integration with external portals (Rightmove, MagicBricks, etc.) — backend/partner scope.
- Multi-language/localisation beyond structure readiness.
- Advanced analytics and A/B testing implementation details.

### 2.3 Planned / Future Scope (Including Payment & Gaps)

The following are **not in current implementation** but are **documented here** as planned or optional scope so nothing is left out:

| Area | Description | Notes |
|------|-------------|--------|
| **Payment gateway** | Accept payments for **portal packages**, **complete package**, and (future) **rent/deposit**. | **Options:** Stripe, Razorpay, PayU, etc. Backend handles PCI; frontend: redirect or embedded checkout, webhooks for status. To be scoped in a separate Payment Integration SDD. |
| **Listing detail page** | Single-property view: full description, gallery, map, contact/enquire CTA. | Required for tenant journey; currently search results link to detail (to be implemented). |
| **Enquiries / messaging** | Tenant sends enquiry to landlord; optional in-app messaging or email-based. | Backend: store enquiries, optional real-time; frontend: enquiry form, inbox (future). |
| **Notifications** | Email and/or in-app: new enquiry, listing approved, viewing confirmed. | Backend + optional push/SSE; frontend: notification UI, preferences. |
| **Document & media upload** | Landlord uploads photos, EPC, gas safety, floor plans. | Backend storage (e.g. S3); frontend: multi-file upload in Add Listing or dashboard. |
| **Rent & deposit payments** | Tenant pays rent/deposit via platform; landlord payouts. | Depends on payment gateway; compliance (e.g. deposit protection schemes). |
| **User profile & settings** | Profile (name, phone, email), saved/favourite listings, notification preferences. | Requires backend user profile API; frontend: profile page, favourites list. |
| **Admin / support panel** | Platform operator: moderate listings, support tickets, basic analytics. | Separate app or protected routes; out of current frontend scope. |
| **Analytics & reporting** | Listing views, enquiry conversion, revenue by package. | Backend + dashboard widgets or external (e.g. GA, Mixpanel). |

### 2.4 Boundaries

- **Frontend:** Next.js application (React, TypeScript, Tailwind). UI, client-side validation, calls Java backend APIs. Deployed in Docker on VPS.
- **Backend:** Java application (e.g. Spring Boot). REST APIs for listings, search, user operations; integrates with Keycloak for auth and PostgreSQL for persistence. Deployed in Docker on VPS.
- **Database:** PostgreSQL. Persistent storage for users, listings, packages, and related data. Runs in Docker on VPS or as managed DB.
- **Auth:** Two login options: **Keycloak** (IdP, already implemented) and **Google login**. Frontend and Java backend integrate with Keycloak for tokens and validation; Google can be integrated via Keycloak identity broker or separate OAuth flow.

---

## 3. Stakeholders & Users

| Role | Description | Main Actions |
|------|-------------|--------------|
| **Tenant** | Person seeking a rental property | Search, view listings, enquire, (future) apply/references. |
| **Landlord** | Owner/agent advertising a property | Add listing, choose package, manage listing, (future) view enquiries. |
| **Platform operator** | Business running the product | Content, pricing, support, compliance. |
| **Developer** | Engineering team | Build, deploy, integrate APIs, maintain docs. |

---

## 4. Functional Requirements

### 4.1 Public Site

- **FR-P1** Home page: hero, search (location), social proof, “For Landlords” / “For Tenants” sections, featured properties (if API available), testimonials, popular locations, footer.
- **FR-P2** About/audience pages: What We Are, What We Do, About Landlords, About Tenants, with consistent layout and CTAs.
- **FR-P3** Help Centre: FAQ and support content.
- **FR-P4** Contact: contact information and/or form.
- **FR-P5** Legal: Privacy Policy, Terms & Conditions.
- **FR-P6** Navigation: Navbar (with Add Listing, Sign In), Footer with sitemap-style links.
- **FR-P7** SEO: Unique metadata per page, OpenGraph, Twitter cards, sitemap.xml, robots.txt.

### 4.2 Search

- **FR-S1** Search page: location (e.g. from query params), optional filters (beds, baths, min/max rent, furnishing, property type).
- **FR-S2** Results: list/grid of listings from backend (e.g. `POST /api/listing/v1.0/view` or equivalent); each row: image, title, location, price, beds/baths, key features.
- **FR-S3** Listing link: each result links to a listing detail page (or modal) when implemented.
- **FR-S4** Empty/error states: “No results”, “Try advanced search” or similar when API returns none or errors.

### 4.3 Add Listing (Landlord)

- **FR-L1** Multi-step form: Address → Property details → Rent & tenancy → Description & options → Review & submit.
- **FR-L2** Address: postcode, house number, address lines, town (validated, sent to backend).
- **FR-L3** Property details: property type, bedrooms, bathrooms, max tenants, furnishing, EPC (if applicable).
- **FR-L4** Rent & tenancy: monthly rent, deposit, min/max tenancy, earliest move-in, bills included, remote viewing.
- **FR-L5** Description & options: description text, features (garden, parking, etc.), tenant preferences (pets, students, etc.), terms acceptance.
- **FR-L6** Submit: POST to backend (e.g. `/api/listing/add`); success/error handling and redirect or confirmation.
- **FR-L7** Optional: gating Add Listing behind login when required by business rules.

### 4.4 Pricing & Property Advertising

- **FR-PR1** Property Advertising page: hero, value proposition, “Advertise now for free” CTA.
- **FR-PR2** Stats bar: average days to let, total listings, success rate (from config or API).
- **FR-PR3** Pricing packages: Free (RentSetu only), Portal (e.g. MagicBricks, 99acres, etc.), Complete (full tenancy services); price, features, CTAs.
- **FR-PR4** Portal logos, features section, FAQ, testimonials, final CTA.
- **FR-PR5** Package CTAs link to Add Listing or sign-up as appropriate.

### 4.5 Authentication

- **FR-A1** Login — **two options:** (1) **Keycloak** (already implemented): redirect to IdP; support PKCE, public client. (2) **Google login**: sign in with Google (OAuth); optional: integrate via Keycloak Google identity broker, or frontend Google OAuth + backend token validation.
- **FR-A2** Callback: handle redirect from Keycloak or Google, store tokens, redirect back to app (e.g. `/auth/callback`).
- **FR-A3** Logout: clear session and redirect to IdP logout if configured (Keycloak); for Google, clear local session.
- **FR-A4** Protected routes: redirect unauthenticated users to login for dashboard/add listing when required.
- **FR-A5** Optional: Login modal or inline sign-in for public pages (show both Keycloak and Google options).

### 4.6 Dashboard (Landlord)

- **FR-D1** Dashboard entry: post-login landing for landlords (when implemented).
- **FR-D2** Listings list: show landlord’s listings (from API); status, edit, view (future).
- **FR-D3** Add Listing CTA: prominent link to Add Listing flow.

---

## 5. Non-Functional Requirements

### 5.1 Performance

- **NFR-P1** Public pages: statically generated where possible (SSG).
- **NFR-P2** Core Web Vitals and Lighthouse targets: e.g. Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, SEO 100.
- **NFR-P3** Images: use Next.js Image component; optimize formats and sizes.
- **NFR-P4** JS/CSS: code splitting, minimal client JS for above-the-fold.

### 5.2 Security

- **NFR-S1** HTTPS in production.
- **NFR-S2** No secrets in client bundle; env vars for public config only (e.g. `NEXT_PUBLIC_*`).
- **NFR-S3** API tokens: use httpOnly cookies or secure server-side handling; document in API_TOKEN_COOKIES.md.
- **NFR-S4** Auth: Keycloak with PKCE (implemented); Google login (OAuth); token refresh and secure storage per best practices.

### 5.3 Availability & Scalability

- **NFR-A1** Frontend: deployable as static + Node server (Next.js) in Docker on VPS.
- **NFR-A2** Backend: Java service deployable in Docker on VPS; frontend handles API errors and retries.
- **NFR-A3** Database: PostgreSQL in Docker or managed; migrations via Java (Flyway/Liquibase).
- **NFR-A4** Architecture: microfrontend-ready frontend; API-first Java backend.

### 5.4 Maintainability

- **NFR-M1** TypeScript throughout; strict types for API payloads and content.
- **NFR-M2** Content: centralized in `config/content.ts`; CMS-ready.
- **NFR-M3** Linting and type-check scripts; consistent code style.

### 5.5 Accessibility

- **NFR-A11y** Semantic HTML, ARIA where needed, keyboard navigation, focus management in modals/forms.

---

## 6. System Context & Architecture

### 6.1 High-Level Context (Full-Stack)

```
                         +------------------+
                         |   Tenant /       |
                         |   Landlord       |
                         |   (Browser)      |
                         +--------+---------+
                                  |
                                  | HTTPS
                                  v
                         +------------------+
                         |   Next.js App    |  ← Frontend (Docker on VPS)
                         |   (RentSetu)    |    SSG, API client, Keycloak redirect
                         +--------+---------+
                                  |
              +-------------------+-------------------+
              |                   |                   |
              v                   v                   v
     +-------------+     +----------------+     +-------------+
     | Keycloak   |     | Java Backend   |     | CMS /       |
     | (IdP)      |     | (REST APIs)    |     | Content     |
     | (VPS/Docker|     | (Docker on VPS) |     | (future)    |
     | or separate)     +--------+-------+     +-------------+
     +-------------+              |
                                  | JDBC / JPA
                                  v
                         +------------------+
                         |   PostgreSQL     |  ← Database (Docker on VPS
                         |   (Database)     |     or managed)
                         +------------------+
```

### 6.2 Frontend Application Structure (Next.js)

- **app/**  
  - **layout.tsx** — Root layout, providers (Keycloak, etc.).  
  - **page.tsx** — Home.  
  - **what-we-are/, what-we-do/, about-landlords/, about-tenants/** — About/audience.  
  - **help-center/, contact/, privacy-policy/, terms/** — Support and legal.  
  - **search/** — Search page and layout.  
  - **landlords/add-listing/** — Add listing flow.  
  - **pricing/property-advertising/** — Property Advertising page.  
  - **dashboard/** — Landlord dashboard (when implemented).  
  - **auth/login/, auth/callback/** — Login and OAuth callback.  
  - **api/** — Optional API routes (proxy to backend, token handling).  
  - **sitemap.ts, robots.ts** — SEO.

- **components/**  
  - **layout/** — Navbar, Footer.  
  - **ui/** — Hero, CTA, FeatureGrid, FAQ, PropertyCard, SearchListingRow, LoginModal, etc.

- **config/content.ts** — Centralized copy and SEO config.

- **lib/**  
  - **auth/** — Keycloak provider, constants.  
  - **api/** — useApiClient, propertyAdvertising, etc.  
  - **seo/** — metadata helpers.

- **middleware.ts** — Protected routes, redirects.

### 6.3 Data Flow (Conceptual)

- **Public pages:** Content from `config/content.ts`; metadata from same config → SSG (frontend only).
- **Search:** Query params → Frontend API client → **Java backend** `POST /api/listing/v1.0/view` → **PostgreSQL** query → JSON response → UI.
- **Add Listing:** Form state → validation → Frontend API client → **Java backend** `POST /api/listing/add` → **PostgreSQL** insert → success/error.
- **Auth:** User clicks Login → **Keycloak** (redirect) or **Google** (OAuth) → Callback → Tokens stored in frontend; frontend sends JWT to Java; **Java** validates JWT (Keycloak or Google) for protected APIs.

---

## 7. Technology Stack (Full-Stack)

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS. Auth: Keycloak (redirect, PKCE) + Google login. Docker on VPS. |
| **Backend** | **Java** (e.g. Spring Boot). REST APIs, JWT validation (Keycloak/Google), JPA/Hibernate. Docker on VPS. |
| **Database** | **PostgreSQL**. Persistent store for users, listings, packages. Docker on VPS or managed. |
| **Auth** | **Two options:** (1) Keycloak (OIDC/OAuth 2.0, implemented). (2) Google login (OAuth). Frontend: redirect or popup; Java: validate JWT on API requests (Keycloak issuer or Google). |
| **Deployment** | **Docker** (images for frontend, Java backend, optionally Postgres). **VPS** hosting (e.g. Nginx reverse proxy). |

Details for each layer are in sections 8 (Frontend), 9 (Backend), 10 (Database), and 14 (Deployment).

---

## 8. Frontend (Next.js)

- **Framework:** Next.js 14 (App Router). **Language:** TypeScript. **Styling:** Tailwind CSS.
- **Auth:** Two login options: Keycloak (redirect, implemented) and Google login. Tokens used for API calls (cookies or headers per API_TOKEN_COOKIES.md).
- **API client:** `useApiClient` (fetch wrapper, base URL from `NEXT_PUBLIC_API_URL`); calls Java backend.
- **Build:** `npm run build` (SSG + server). **Run:** Node `server.js` (listens on `PORT`; no fixed host port required — use `NEXT_PUBLIC_SITE_URL` and reverse proxy).
- **SEO:** Metadata API, OpenGraph, Twitter cards, sitemap, robots.txt.
- **Deployment:** Docker image built from `Dockerfile`; run on VPS; build args for `NEXT_PUBLIC_*` (see DOCKER_BUILD.md).

---

## 9. Backend (Java)

APIs are implemented in **Java** and consumed by the Next.js frontend.

### 9.1 Recommended Stack

| Component | Technology |
|-----------|------------|
| **Framework** | Spring Boot 3.x (or 2.x) |
| **Language** | Java 17+ |
| **API style** | REST (JSON); Spring Web / WebFlux |
| **Persistence** | Spring Data JPA / Hibernate; PostgreSQL driver |
| **Auth** | Keycloak JWT validation (implemented); optional Google JWT or Keycloak Google identity broker for Google login. |
| **Build** | Maven or Gradle |
| **Deployment** | JAR; run in Docker on VPS (e.g. `openjdk:17-slim`) |

### 9.2 Responsibilities

- Expose REST endpoints for: **add listing**, **view/search listings**, **property-advertising stats**, **pricing packages** (and future: user profile, enquiries).
- Validate **JWT** from Keycloak or Google for protected endpoints; extract user/landlord id.
- Persist and query data via **PostgreSQL** (JPA entities).
- Return consistent JSON shapes (e.g. `responseMessage.responseData` for listing view) so frontend contracts in section 11 are satisfied.
- Optional: Next.js can proxy to Java via `app/api/*` to hide backend URL or attach cookies; or frontend calls Java directly (CORS configured on Java).

### 9.3 API Endpoints (Implemented by Java) — Complete List

All backend APIs that the frontend and timeline depend on. One row per endpoint; implement in Java and track in WBS/timeline.

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 1 | POST | `/api/listing/add` or `/api/listing/v1.0/add` | Protected (JWT) | Create listing. Body: AddListingBody. Returns: listing id. |
| 2 | POST | `/api/listing/v1.0/view` | Public | Search/view listings. Body: filters (location, beds, rent range, etc.). Returns: `{ responseMessage: { responseData: ViewListingItem[] } }`. |
| 3 | GET | `/api/listings/{id}` | Public | Get single listing detail (for property detail page). |
| 4 | GET | `/api/property-advertising/stats` | Public | Aggregate stats: days to let, total listings, success rate. |
| 5 | GET | `/api/pricing/packages` | Public | List pricing packages (free, portal, complete). |
| 6 | GET | `/api/account/profile` or `/api/users/me` | Protected | Get current user profile (edit details). |
| 7 | PUT | `/api/account/profile` or `/api/users/me` | Protected | Update profile (password, email, first/last name, phone). |
| 8 | POST | `/api/enquiries` or `/api/messages` | Protected (or public + captcha) | Message landlord. Body: listingId, message (tenant email/name from token or body). |
| 9 | GET | `/api/enquiries` or `/api/messages` | Protected | List enquiries/messages for current user (landlord or tenant). |
| 10 | GET | `/api/tenancies/mine` | Protected | List tenancies for current tenant. |
| 11 | GET | `/api/tenancies/{id}` | Protected | Get single tenancy (Rent Now info, status). |
| 12 | GET | `/api/tenancies/{id}/documents` | Protected | List documents for tenancy (upload/view). |
| 13 | GET | `/api/tenancies/{id}/certificates` | Protected | List certificates (EPC, etc.) for tenancy. |
| 14 | POST | `/api/tenancies/{id}/documents` | Protected | Landlord uploads document/certificate. |
| 15 | GET | `/api/referencing/complete/{token}` | Public (token) | Tenant gets referencing form (by link). |
| 16 | POST | `/api/referencing/complete/{token}` | Public (token) | Tenant submits referencing form + file upload. |
| 17 | — | Payment gateway (Razorpay/Stripe) | Backend webhooks | Pay for referencing, Tenancy Creation, Portal package; webhooks for status. |

*Path prefix may be `/api` or context path like `/backend-api`; frontend base URL must match. All above are covered in the WBS/timeline (docs/SOFT_LAUNCH_WBS_TIMELINE.md).*

### 9.4 Auth Integration (Java)

- **Public endpoints:** e.g. `POST /api/listing/v1.0/view`, `GET /api/property-advertising/stats`, `GET /api/pricing/packages` — may allow anonymous or optional token.
- **Protected endpoints:** e.g. `POST /api/listing/add` — require valid JWT (Keycloak or Google); extract `sub` or custom claim for `landlordId` if not in body.
- Configure CORS to allow requests from frontend origin (e.g. `NEXT_PUBLIC_SITE_URL`).

### 9.5 Deployment (Java on VPS)

- Build: `mvn clean package` (or Gradle equivalent); produce runnable JAR.
- Docker: Use a Java base image; copy JAR; `ENTRYPOINT ["java","-jar","/app.jar"]`; container listens on its configured port internally. Connect to PostgreSQL via env. No fixed host port required — use `NEXT_PUBLIC_API_URL` and reverse proxy.
- VPS: Run Java container on same host as Next.js; Nginx reverse-proxies `/api` (or backend subdomain) to Java container.

---

## 10. Database (PostgreSQL)

All persistent data for the rental platform is stored in **PostgreSQL**.

### 10.1 Schema Overview

- **users** (or **landlords**): id, keycloak_sub, email, name, phone, created_at, updated_at. (Optional: tenants table if tenant accounts are stored.)
- **listings**: id, landlord_id (FK), postcode, house_number, address_line2, address_line3, town, advert_type, property_type, bedrooms, bathrooms, max_tenants, furnishing, epc_rating, description, monthly_rent, deposit_amount, min_tenancy_months, max_tenancy_months, earliest_move_in, bills_included, remote_video_viewing, terms_accepted, status, image_url, thumbnail_url, garden, parking, fireplace, live_in_landlord, students_allowed, families_allowed, dss_income_accepted, pets_allowed, smokers_allowed, students_only, tenant_notes, created_at, updated_at.
- **pricing_packages** (optional): id, slug (free/portal/complete), name, price, currency, period, features (JSON or relation), sort_order.
- **enquiries** (future): id, listing_id, tenant_email, message, created_at.

Table and column names may follow Java entity naming (e.g. snake_case in DB if using default Hibernate naming).

### 10.2 Migrations

- Use **Flyway** or **Liquibase** (or Spring Boot Flyway) in the Java project to version schema changes.
- Initial script: create `users`, `listings`, and any lookup/enum tables; add indexes on listing search fields (postcode, town, monthly_rent, bedrooms, status).
- Keep migrations in the Java repo (or shared DB repo) and run on application startup or in CI.

### 10.3 Connection (Docker / VPS)

- PostgreSQL runs in a **Docker container** on the VPS, or as a **managed** instance (e.g. cloud RDS).
- Java backend connects via JDBC URL: `jdbc:postgresql://host:5432/rentsetu` (or DB name of choice). Credentials via env (e.g. `SPRING_DATASOURCE_*`).
- Ensure DB is in same Docker network as Java (if both in Docker) or reachable from Java container (network/host).

---

## 11. Data Model & API Contracts

### 11.1 Listing (Core Entity)

Conceptual fields used by the frontend (align with backend):

- **Identity:** id, landlordId, status.  
- **Address:** postcode, houseNumber, addressLine2, addressLine3, town.  
- **Property:** propertyType, bedrooms, bathrooms, maxTenants, furnishing, epcRating, description.  
- **Rent & tenancy:** monthlyRent, depositAmount, minTenancyMonths, maxTenancyMonths, earliestMoveIn, billsIncluded, remoteVideoViewing.  
- **Features:** garden, parking, fireplace, liveInLandlord.  
- **Tenant preferences:** studentsAllowed, familiesAllowed, dssIncomeAccepted, petsAllowed, smokersAllowed, studentsOnly, additionalNotes.  
- **Media:** imageUrl, thumbnailUrl (and any gallery).  
- **Legal:** termsAccepted.

### 11.2 API Contracts (Frontend ↔ Java Backend)

See **§9.3** for the full readable list (all 17 endpoints). Summary:

| API | Method | Path | Purpose |
|-----|--------|------|---------|
| Add listing | POST | `/api/listing/add` | Body: AddListingBody. Response: listing id. |
| Search listings | POST | `/api/listing/v1.0/view` | Body: filters. Response: `{ responseMessage: { responseData: ViewListingItem[] } }`. |
| Listing detail | GET | `/api/listings/{id}` | Single listing for property page. |
| Property advertising stats | GET | `/api/property-advertising/stats` | averageDaysToLet, totalListings, successRate, etc. |
| Pricing packages | GET | `/api/pricing/packages` | Array of { id, name, price, currency, period, features, portals, ctaText, ctaHref, popular }. |
| Account profile | GET / PUT | `/api/account/profile` or `/api/users/me` | Get/update user (password, email, name, phone). |
| Enquiries / messages | POST / GET | `/api/enquiries` or `/api/messages` | Message landlord; list enquiries. |
| Tenancies (tenant) | GET | `/api/tenancies/mine`, `/api/tenancies/{id}` | List my tenancies; get one (Rent Now info). |
| Tenancy documents & certificates | GET / POST | `/api/tenancies/{id}/documents`, `/api/tenancies/{id}/certificates` | List/upload documents and certificates. |
| Referencing (tenant) | GET / POST | `/api/referencing/complete/{token}` | Tenant form by link; submit form + upload. |
| Payment | Webhooks | (Razorpay/Stripe) | Backend handles payment events. |

All API access from the frontend must follow the project’s token/cookie policy (see API_TOKEN_COOKIES.md).

---

## 12. User Flows (End-to-End)

### 12.1 Tenant: Search and View

1. Land on **Home** → use hero search or navigate to **Search**.  
2. **Search:** Enter location (and optional filters) → submit → results from API.  
3. Click a listing → **Listing detail** (when implemented).  
4. Enquire / Apply (future).

### 12.2 Landlord: Add Listing

1. Land on **Home** or **Property Advertising** → click **Add Listing** (or “Get started free”).  
2. Optionally **Sign In** if route is protected.  
3. **Add Listing:** Step 1 Address → Step 2 Property details → Step 3 Rent & tenancy → Step 4 Description & options → Step 5 Review & submit.  
4. Submit → API success → confirmation (or error message).  
5. Optional: redirect to **Dashboard** or **Pricing** to choose portal package.

### 12.3 Landlord: Choose Package

1. From **Pricing & Services** → **Property Advertising**.  
2. View **Free / Portal / Complete** packages.  
3. Click CTA → **Add Listing** or sign-up.

### 12.4 Authentication

1. User clicks **Sign In** → **two options:** (1) redirect to Keycloak, or (2) **Sign in with Google**.  
2. After login (Keycloak or Google) → redirect to `/auth/callback`, tokens stored, then back to app (e.g. my-dashboard).  
3. App stores tokens, redirects to intended page or home.  
4. **Sign Out** → clear session, redirect to IdP logout if configured.

---

## 13. Soft Launch — Low-Level Specification (OpenRent Reference)

This section provides **low-level, screen-by-screen** specification for the RentSetu soft launch, based on the [OpenRent UK](https://www.openrent.co.uk/) portal. All flows and sections are adapted for the Indian context where applicable (e.g. portals: MagicBricks, 99acres, Housing.com; currency ₹; local regulations).

### 13.1 Post-Login UX (Navbar & User Menu)

| Element | Behaviour | Reference (OpenRent) |
|--------|-----------|----------------------|
| **Logged-in name + avatar** | Shown in top-right of navbar (e.g. "Devashish" or truncated "Deva...") with dropdown chevron. | Screenshot 1 |
| **On hover** | Dropdown menu appears with: **Edit Profile**, **Switch Account**, **Log out**. | Screenshot 1 |
| **On click** (name + image) | User is navigated to **My Dashboard** (e.g. `/my-dashboard` or `/dashboard`). | OpenRent: [my-dashboard](https://www.openrent.co.uk/my-dashboard) |
| **Add Listing button** | Prominent green CTA in navbar; links to Add Listing flow. | All screenshots |
| **About dropdown** | **Landlords** \| **Tenants** \| **OpenRent** (or RentSetu). **Tenants** = entry to tenant section (see 13.8). | OpenRent navbar |

**Implementation notes (Frontend):** Navbar component must show user display name and avatar when authenticated; dropdown with the three actions; "Edit Profile" → `/account/edit`, "Log out" → Keycloak logout + clear session. Protected routes redirect unauthenticated users to login, then back to intended URL (e.g. my-dashboard).

---

### 13.2 My Dashboard

**URL (target):** `/my-dashboard` (or `/dashboard`).

**Layout (OpenRent reference — Screenshot 2):**

- **Secondary tabs (below main nav):** Dashboard | Account | Landlord Services | Share & Earn (optional for soft launch).
- **Left sidebar (user-specific):**
  - User name + **Log out** at top.
  - **Dashboard** (active when on this page).
  - **Favourites** (saved listings — tenant).
  - **Saved Searches** (tenant).
  - **Your Enquiries** (tenant/landlord).
  - **Verified Tenant** (tenant referencing outcome; optional for soft launch).
- **Main content:**
  - Welcome text: e.g. "Welcome to your management dashboard. As you use RentSetu's services your dashboard will serve relevant content here."
  - **Search Listings** card (tenant): "Search listings" button → `/search`; short line about booking viewings.
  - **Ready to list a property?** card (landlord): "Create a new listing" button → `/landlords/add-listing`.
- **Bottom:** "Need more information or help?" with links: Help Centre, Community, Blog; optional floating **Need Help?** button.

**Backend/API:** Dashboard may need APIs for: user display name/avatar, counts (listings, enquiries, saved), or dashboard-specific content. For soft launch, static welcome + CTAs are enough; data-driven widgets can follow.

---

### 13.3 Account Section

**URL (target):** `/account/edit` (edit details).

**Tabs:** Same secondary tabs as dashboard; **Account** tab active. Sidebar within Account:

- **Edit Details** (current page).
- **My Photo** (profile picture upload).
- **Credits** (if prepaid credits model exists).
- **Delete Account**.

**Edit your details (main content — OpenRent Screenshot 3):**

| Field | Type | Visibility / Notes |
|-------|------|--------------------|
| **Password** | Click to change (modal or inline) | — |
| **Email address** | Text; show **Verified** badge if verified | — |
| **First/Given Name(s)** | Text; tag **Public** | Shown to landlords/tenants where relevant |
| **Last/Family Name** | Text; tag **Private** | Not shown publicly (or per policy) |
| **Primary phone** | Optional; with country/region | India: +91, validation |

**Implementation:** Java backend: `GET/PUT /api/account/profile` (or `/api/users/me`). PostgreSQL: `users` table (email, first_name, last_name, phone, email_verified, etc.). Frontend: form with validation; optional profile photo upload (multipart to backend or S3).

---

### 13.4 Landlord Services — Overview & Sections (Full USP List)

**Reference:** [OpenRent Services Overview](https://www.openrent.co.uk/services-overview). **Client note:** These services are RentSetu’s USP; no one in India is providing this full set today. **All services below must be included — no skip.**

**URL (target):** `/services-overview` or `/landlord-services` (under Landlord Services tab).

**Layout — two panels, interconnected:**

- **Left panel (sidebar):** Full list of 17 services. User **clicks a service** in the left list.
- **Right panel (main content):** Shows that service’s content, OR user is taken to a **dedicated page** for that service. **Left and right are interconnected:** selecting an item in the left either updates the right panel in place or navigates to the service’s page (see click behavior below).

**Click behaviour (client-confirmed):**

| Left item | Behaviour | RentSetu target |
|-----------|------------|------------------|
| **Property Advertising** | **Open existing page** (new page / navigate) | `/pricing/property-advertising` — page already live (e.g. site URL + `/pricing/property-advertising`): hero, packages, “Start Advertising Free”, “View Pricing & Packages”, portal logos, Why Choose, FAQ, testimonials. |
| Other services (2–17) | Per design: dedicated page or right-panel content | TBD; right-side sections to be provided by client (see below). |

---

#### Left sidebar — full list (all 17 items; include without skip)

OpenRent reference screenshots (client-provided PDFs) map left-side items to these OpenRent pages for design reference:

| # | Left sidebar label | OpenRent reference (for design) | RentSetu behaviour |
|---|---------------------|-----------------------------------|----------------------|
| 1 | Property Advertising | [Advertise property (Rightmove/Zoopla)](https://www.openrent.co.uk/landlords-advertise-property-for-rent-on-rightmove-and-zoopla) | **Navigate to** `/pricing/property-advertising` (existing page) |
| 2 | Tenancy Creation | [Tenancy Creation - Rent Now](https://www.openrent.co.uk/rent/tenancycreation) | Dedicated page or right panel (see 13.6) |
| 3 | Referencing | [Referencing](https://www.openrent.co.uk/referencing) | Dedicated page or right panel (see 13.7) |
| 4 | Management Plus | [Management Plus order](https://www.openrent.co.uk/management-plus-order) | Content + CTA or Coming soon |
| 5 | Rent Collection | [Rent Collection order](https://www.openrent.co.uk/rentcollection-order) | Content + CTA or Coming soon |
| 6 | Rent Insurance | [RGI info](https://www.openrent.co.uk/rgi-info) (Rent Guarantee Insurance) | Content + CTA or Coming soon |
| 7 | Inventory | [Inventory order](https://www.openrent.co.uk/inventory-inventoryorder) | Content + CTA or Coming soon |
| 8 | Gas Safety | [Gas Safety pay form](https://www.openrent.co.uk/gassafety-gassafetypayform) | Content + CTA or Coming soon (India: adapt) |
| 9 | Electrical Safety | [Electrical Safety order](https://www.openrent.co.uk/electricalsafety-electricalsafetyorder) | Content + CTA or Coming soon |
| 10 | EPC | [EPC order](https://www.openrent.co.uk/epc-epcorder) | Content + CTA or Coming soon (India: voluntary) |
| 11 | Photography | [Professional Photography order](https://www.openrent.co.uk/professionalphotography-order) | Content + CTA or Coming soon |
| 12 | Building Insurance | [Building Insurance obtain quote](https://www.openrent.co.uk/buildinginsurance-obtainquote) | Content + CTA or Coming soon |
| 13 | Deposit Protection | [Deposit scheme](https://www.openrent.co.uk/depositscheme-depositscheme) | Content + CTA or Coming soon (India: per regulation) |
| 14 | Legal Checklist | [Landlord checklist info](https://www.openrent.co.uk/listingmanager-landlordchecklistinfo) | Content + CTA or Coming soon |
| 15 | Offsite Tenancies | [Offsite tenancy manager](https://www.openrent.co.uk/offsitetenancy-offsitetenancymanager) | Content + CTA or Coming soon |
| 16 | Renewal Reminders | [Renewal reminder](https://www.openrent.co.uk/renewalreminder) | Content + CTA or Coming soon |
| 17 | Serve Notice | [Serve notice / Section 21](https://www.openrent.co.uk/servenotice-section21) | Content + CTA or Coming soon |

---

#### Right panel — “What services does RentSetu offer?” (Property services)

When a service is selected in the left sidebar, the right panel shows that service’s block. **CTA on right panel** goes to **same route as left-panel link** for that service. Client-specified (no skip).

| # | Right-panel block | Content / design ref | CTA / On click → destination |
|---|--------------------|----------------------|------------------------------|
| 1 | Property Advertising | Same as existing: Property Advertising page at `/pricing/property-advertising`. | Left or CTA → `/pricing/property-advertising`. |
| 2 | Tenancy Creation | Rent Now: what it is, benefits, pricing. | Same route as left panel (e.g. `/rent/tenancycreation`). |
| 3 | Tenancy Referencing | Pricing, Initial/Final report, product breakdown. Ref: [OpenRent Tenant Referencing](https://www.openrent.co.uk/tenant-referencing). | **Begin Referencing** → same page as left-panel Referencing. |
| 4 | Gas Safety Certificate | Info + pricing. Ref: [OpenRent Gas Safety CP12](https://www.openrent.co.uk/gas-safety-certificate-cp12). | **Order gas safety certificate** → same page as left-panel Gas Safety. |
| 5 | Energy Performance Certificates | EPC info, pricing. Ref: [OpenRent EPC](https://www.openrent.co.uk/landlord-energy-performance-certificates-epc). | **Purchase** → same page as left-panel EPC. |
| 6 | Electrical Safety Certificates | EICR/PAT info. Ref: [OpenRent Electrical Safety](https://www.openrent.co.uk/landlord-electrical-safety-certificates-eicr-pat-testing). | **Order EICR or PAT** → [OpenRent order](https://www.openrent.co.uk/electricalsafety/electricalsafetyorder) (same as left); later RentSetu page if needed. |
| 7 | Inventory, Check-In and Check-Out Services | Description, what is included. Ref: [OpenRent Inventory](https://www.openrent.co.uk/landlord-inventory-and-check-in-services). | **Order** → same page as left-panel Inventory. |
| 8 | Pro Photography | Pro photos and floor plans. Ref: [OpenRent Pro Photography](https://www.openrent.co.uk/professional-photography-for-landlords). | CTA → same page as left-panel Photography. |
| 9 | Rent Guarantee Insurance | RGI info, coverage. Ref: [OpenRent RGI](https://www.openrent.co.uk/landlord-rent-guarantee-insurance). | CTA → same as left panel when built. |
| 10 | Landlord Building Insurance | Building and contents insurance. Ref: [OpenRent Building Insurance](https://www.openrent.co.uk/landlord-building-and-contents-insurance). | CTA → same as left panel when built. |
| 11 | Management Plus | Emergency cover. Ref: [OpenRent Management Plus](https://www.openrent.co.uk/management-plus). | CTA → same page as left-panel Management Plus. |

**Summary:** Right panel = info/marketing block per service; CTA on right panel goes to **same destination as left-panel link** (RentSetu order page or, for Electrical Safety initially, [OpenRent order](https://www.openrent.co.uk/electricalsafety/electricalsafetyorder)).

**Implementation:** Single route (e.g. `/landlord-services` or `/services-overview`) with left sidebar (17 links). Property Advertising → navigate to `/pricing/property-advertising`. Other items update right panel or dedicated route. Optional query or segment for selected service (e.g. `?service=property-advertising` or `/landlord-services/referencing`). Left sidebar: 17 links; each updates right panel (client-side or shallow route). Right panel: 11 (or 17) content components; first three (Property Advertising, Tenancy Creation, Tenant Referencing) are full pages or rich content; others can be short copy + “Coming soon” or link to Help until built.

**Backend for 17 services + 11 blocks:** Backend work is required and is already in scope. Property Advertising uses §9.3 #4–5 (stats, packages) — WBS 5.1; Tenancy Creation uses tenancies, documents, payment — WBS 5.4, 5.5, 6.4; Tenant Referencing uses referencing APIs and payment — WBS 6.1–6.4. The remaining 8 right-panel blocks (Management Plus, RGI, Gas Safety, EPC, Electrical Safety, Inventory, Pro Photos, Building Insurance) have no backend in soft launch (Coming soon only).

**Soft launch priority (full build):** Property Advertising (enhance), Tenancy Creation, Tenant Referencing. All other services **must appear** in left list and have a right-panel block (full or “Coming soon”).

---

### 13.5 Property Advertising — Current Status & Enhancements

**Current (RentSetu):** Basic Property Advertising page is done at `/pricing/property-advertising` (hero, stats bar, pricing packages, portal logos, FAQ, testimonials, CTA). See PROPERTY_ADVERTISING_PAGE.md.

**Enhancements (from OpenRent Screenshot 5 — [Advertise Your Rental Property](https://www.openrent.co.uk/landlords-advertise-property-for-rent-on-rightmove-and-zoopla)):**

| Enhancement | Description |
|-------------|-------------|
| **Hero** | Headline "Advertise Your Rental Property"; subline e.g. "Let your property without the hidden fees. No commission, no unexpected costs - just a smarter way to find tenants and keep more of your rent." CTA: "Start your free advert" → Add Listing. |
| **Social proof** | e.g. "Used by X lakh+ landlords and tenants" with small avatar stack. |
| **Trust stats bar** | e.g. "X Days average time to let", "X Lakh+ properties let", "Trusted by X Lakh+ users", "X.X rating on Google". Data from API or config. |
| **Packages section** | "Pick a package that works for you" — three cards: RentSetu Advertising (free), Portal Advertising (₹999), Advertising + Rent Now / Complete (₹1,999). "Most Popular" badge on recommended package. |
| **Imagery** | Optional lifestyle images (families, moving) for trust. |

**Backend:** Stats from `GET /api/property-advertising/stats`; packages from `GET /api/pricing/packages` when ready. Frontend already structured for this; replace dummy data with API.

---

### 13.6 Tenancy Creation ("Rent Now" Style)

**URL (target):** `/rent/tenancycreation` or `/landlord-services/tenancy-creation`.

**Purpose (OpenRent Screenshot 6 — [Tenancy Creation - Rent Now](https://www.openrent.co.uk/rent/tenancycreation)):** Professional tenancy creation service that combines referencing, contract signing, money handling, and deposit registration in one flow.

**Content to include:**

- **Heading:** "Tenancy Creation - Rent Now" (or equivalent brand name).
- **What is Rent Now?** Short paragraph: e.g. "Professional grade tenancy creation service — referencing, contract signing, money handling and deposit registration, all online in a streamlined process."
- **Benefits (checkmarks):** e.g.  
  - Only ₹X Inc. GST (pricing; **payment gateway** required).  
  - Instantly receive applications from tenants.  
  - Use RentSetu's tenancy agreements.  
  - Support and guidance throughout.
- **Moving forward:** "You don't seem to have any published properties. When you have a published property, we'll show it here with enquiries and options for Rent Now." CTA: **Add a Property to RentSetu** → `/landlords/add-listing`.
- **Links:** "Rent Now About page", "Help Centre", "Ask our community!" (optional).

**Backend/API:** Check if landlord has published listings; list enquiries per listing; initiate "Rent Now" (create tenancy, link to referencing + contract + payment). **Payment gateway** required for tenancy creation fee (e.g. ₹79 or equivalent in INR). **Database:** Tenancies, applications, agreements, payments.

---

### 13.7 Tenant Referencing — Full Scope

**URL (target):** `/tenant-referencing` ([OpenRent](https://www.openrent.co.uk/tenant-referencing)).

**Pricing (OpenRent):** £30 Inc. VAT per applicant. **RentSetu (India):** Define equivalent (e.g. ₹X per applicant Inc. GST). **Payment gateway** required.

**Page structure (from OpenRent Screenshots 7–13):**

1. **Hero / CTA**  
   - "Begin Referencing Now" (primary green button).

2. **Order With Confidence**  
   - Copy: e.g. "Standalone tenant and guarantor referencing — in-depth overview of financial status, credit score and risk assessment. All you need to start: name, email, phone."

3. **Tenant & Guarantor Referencing — Pricing**  
   - One-off payment per applicant: **₹X Inc. GST** (or equivalent).

4. **Initial Report (e.g. 24 hours)**  
   - Bullets: Credit Check & Risk Score; Linked Address, Identity & Fraud Information; CCJs / court information; Right to Rent Check Advice (India: adapt to local ID/verification); Affordability Rating.

5. **Final Report (e.g. 3 working days)**  
   - "Everything from the initial report plus:" Previous Landlord Reference & Letting History; Income & Employment Check; Rent Guarantee Insurance Eligible (optional product).

6. **Product Breakdown (detailed)**  
   - Credit Check (credit risk score; India: partner with local bureau or equivalent).  
   - Fraud Checks (linked address, identity, fraud).  
   - Outstanding Debt Search (court/judgment data; adapt for India).  
   - Right to Rent / ID Check Advice (India: ID verification, document collection).  
   - Affordability Rating.  
   - Rent Guarantee Insurance (optional add-on; e.g. ₹X for 12 months).  
   - Previous Landlord Reference.  
   - Income & Employment Check.  
   - **Time taken:** e.g. 3 working days on average.  
   - **Cost per tenant or guarantor:** ₹X.

7. **FAQs**  
   - Who needs to be referenced? Who pays? How long does it take? (Adapt for India — e.g. landlord pays.)

8. **Testimonials**  
   - Short landlord quotes + rating (e.g. "Very pleased with this service" — Helen B style).

9. **Full Tenancy Creation CTA**  
   - "Looking for Full Tenancy Creation?" → link to Tenancy Creation page.

**Backend/API (Java):**  
- Initiate referencing (tenant/guarantor details).  
- Integrate with credit/verification provider (India-specific).  
- Store reports; expose status and report PDF/URL.  
- **Payment:** Collect fee per applicant via payment gateway.

**Database (PostgreSQL):** Referencing requests, applicant details, report status, report storage reference, payments.

**India adaptation:** Replace UK-specific terms (CCJs, Right to Rent) with local equivalents (e.g. court records, ID verification, tenant eligibility as per local law). Credit data: use Indian bureaus/partners where available.

---

### 13.8 Tenant Section (Low-Level Specification)

Tenant-facing flows and entry points, based on [OpenRent](https://www.openrent.co.uk/) (find property, property detail, message landlord, Rent Now info, auth). RentSetu should mirror this structure for the soft launch.

#### 13.8.1 Entry Point — About → Tenants

| Element | Behaviour |
|--------|-----------|
| **Navbar** | **About** dropdown shows: **Landlords** \| **Tenants** \| **OpenRent**. |
| **Tenants** | Clicking **Tenants** goes to the tenant-focused landing or hub (e.g. `/about-tenants` or `/find-property`). This is the main **tenant section** entry from the main menu. |

**RentSetu implementation:** Ensure Navbar has About dropdown with Landlords, **Tenants**, OpenRent; **Tenants** links to tenant hub or search (e.g. `/about-tenants` and/or `/search`).

#### 13.8.2 Tenant Journey — Routes & Screens

| # | Purpose | OpenRent-style URL pattern | RentSetu route (target) | Description |
|---|---------|----------------------------|--------------------------|-------------|
| 1 | **Find property (search)** | `/find-property-to-rent-from-private-landlords` | `/search` (existing) or `/find-property` | Tenant searches by location/filters; list of listings. |
| 2 | **Property detail** | `/property-to-rent-{location}-{id}` (e.g. `...-2722476`) | `/property/[id]` or `/listing/[id]` | Single listing: description, photos, rent, address, **Message landlord** / **Enquire** CTA. |
| 3 | **Message landlord** | `/messagelandlord/[listingId]` | `/message-landlord/[listingId]` or in-app messaging | Tenant sends enquiry/message to landlord for a listing. Requires auth (or prompt to sign in). |
| 4 | **Auth (login/register)** | `/auth` | `/auth/login`, `/auth/callback` (existing) | **Two options:** Keycloak (implemented), Google login. After login, redirect back to intended page (e.g. message landlord, dashboard). |
| 5 | **Rent Now info (tenant view)** | `/rent/rentnowinfo/[listingId]` | `/rent/rent-now-info/[listingId]` or `/my-tenancies` | Tenant’s view of a tenancy in progress: status, next steps, documents to upload, contract signing, deposit/rent. |
| 6 | **My Dashboard (tenant)** | Same as landlord: `/my-dashboard` | `/my-dashboard` | Dashboard shows tenant-specific sidebar: Favourites, Saved Searches, **Your Enquiries**, Verified Tenant. Main: **Search Listings** CTA. |

#### 13.8.3 Where Tenants Upload Details & Check Rented Property

| Action | Where | Implementation notes |
|--------|--------|----------------------|
| **Upload details (referencing)** | When landlord starts referencing, tenant gets link/email → **referencing onboarding** page (e.g. `/referencing/complete/[token]`). | Tenant enters name, email, phone, employment, previous landlord, uploads ID/docs. Backend stores and sends to referencing provider. |
| **Check rented property** | **Manage your Rent Now Tenancies** (OpenRent) = **My Rentals** or **My Tenancies** in RentSetu. | Route: e.g. `/my-tenancies` or under dashboard. List of tenancies (current/past); per tenancy: view details, rent, deposit, **view certificates** (EPC, gas safety equivalent), **upload/view documents** (agreement, ID). |
| **View certificates** | Inside **My Tenancies** → select a tenancy → **Certificates** or **Documents**. | Landlord uploads EPC, gas safety, etc.; tenant sees read-only list + download. |

**Backend/API (Java):**  
- `GET /api/listings` (search), `GET /api/listings/{id}` (detail).  
- `POST /api/enquiries` or `POST /api/messages` (message landlord).  
- `GET/PUT /api/tenancies/mine` (tenant’s tenancies), `GET /api/tenancies/{id}/documents`, `GET /api/tenancies/{id}/certificates`.  
- Referencing: `GET/POST /api/referencing/complete/{token}` (tenant form + file upload).

**Database (PostgreSQL):** `enquiries` or `messages` (listing_id, tenant_id, body, created_at); `tenancies` (listing_id, tenant_id, status, start/end); `tenancy_documents` (tenancy_id, type, file_url, uploaded_by); `referencing_applications` (tenant payload, document refs).

#### 13.8.4 Summary — Tenant Section Checklist

- [ ] **Navbar:** About dropdown → **Tenants** link to tenant hub/search.  
- [ ] **Search:** `/search` (or `/find-property`) — list listings; filters.  
- [ ] **Listing detail:** `/property/[id]` — full listing + **Message landlord** CTA.  
- [ ] **Message landlord:** `/message-landlord/[id]` (or modal); auth required; API to send enquiry.  
- [ ] **Auth:** Login/register; redirect back after auth.  
- [ ] **Rent Now info (tenant):** `/rent/rent-now-info/[id]` or under My Tenancies — status, documents, contract, payments.  
- [ ] **My Tenancies:** `/my-tenancies` — list tenancies; view details, certificates, upload/view documents.  
- [ ] **Referencing onboarding:** Tenant link to complete referencing (form + upload).

---

### 13.9 Additional Information (Past Orders, Renewals, Tenant Certificates)

From OpenRent’s services overview (last screenshot):

| Question | Answer / Feature |
|----------|------------------|
| **Where can I see my past orders?** | Orders visible on dashboard 24/7; link to pricing/services page for full list. |
| **Where can I check when my services need renewing?** | Renewal notifications by email/SMS; "Renewal reminders" page linked from left menu. |
| **How do I view existing certificates as a tenant?** | Tenants view EPC, Gas Certificates, etc. via **My Tenancies** (tenant section — see 13.8). |

**Implementation:**  
- **Past orders:** Java API to list orders (by user); frontend: "Orders" or "History" in dashboard/sidebar.  
- **Renewals:** Backend stores service end dates; sends reminders; "Renewal reminders" page lists upcoming renewals.  
- **Tenant certificates:** Part of tenant section (13.8 — My Tenancies); landlord uploads certificates; tenant sees them in their tenancy view.

---

### 13.10 Open Questions / To Clarify With Client

| # | Question | Impact |
|---|----------|--------|
| 1 | **Verified Tenant:** Is "Verified Tenant" (post-referencing badge) in scope for soft launch? | Affects dashboard sidebar and tenant profile display. |
| 2 | **Share & Earn:** Is "Share & Earn" (referral) in scope for soft launch? | Affects dashboard tab and any referral APIs. |
| 3 | **Deposit protection (India):** Applicable regulation and whether RentSetu holds/registers deposits. | Affects Tenancy Creation and legal compliance. |
| 4 | **Rent Guarantee Insurance:** Offer in India? Partner and pricing. | Affects Tenant Referencing page and product breakdown. |

*(Tenant section entry and flows are defined in 13.8.)*

---

## 14. Security & Compliance

### 14.1 Authentication

- Keycloak: OIDC/OAuth 2.0, PKCE for public client.  
- Redirect URIs and web origins must be allowlisted in Keycloak.  
- Tokens: access token for API; refresh token stored securely; no tokens in localStorage for sensitive flows if policy requires cookies.

### 14.2 Data

- Personal data: handle per Privacy Policy; minimise collection; secure transmission (HTTPS).  
- API: only over HTTPS; credentials and API keys never in client bundle.

### 14.3 Compliance

- Privacy Policy and Terms must be published and linked.  
- Cookie consent and disclosure as per policy.  
- For UK/India or other regions, document any sector-specific requirements (e.g. deposit protection, tenant fees) in legal/compliance docs.

---

## 15. Deployment: Docker & VPS

The application is hosted on a **VPS**. **Docker** is used to run the **frontend** (Next.js) and, in the same environment, the **Java backend** and **PostgreSQL** (or Postgres is run separately). This section covers the full deployment view.

### 15.1 Docker Overview

| Component | Image / Build | Notes |
|-----------|----------------|--------|
| **Next.js (Frontend)** | Built from repo `Dockerfile` (Node 20 Alpine, multi-stage). | Build args: `NEXT_PUBLIC_KEYCLOAK_URL`, `NEXT_PUBLIC_KEYCLOAK_REALM`, `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`. UI can be served without port via reverse proxy (e.g. `http://YOUR_VPS_IP`). |
| **Java Backend** | Built from Java project (e.g. Spring Boot JAR in OpenJDK image). | Env: `SPRING_DATASOURCE_URL`, Keycloak issuer URL, etc. Port mode: API at `http://YOUR_VPS_IP:8080`. |
| **PostgreSQL** | Official `postgres:15-alpine` (or similar). | Env: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`. Data volume for persistence. Internal only. |
| **Keycloak** (optional on same VPS) | Keycloak image. | Realm and client for RentSetu; or use external Keycloak. Use `NEXT_PUBLIC_KEYCLOAK_URL` (Keycloak may still be on `:8081` unless reverse-proxied). |

- **docker-compose** (or compose v2) can define services: `nextjs-app`, `java-backend`, `postgres`, and optionally `keycloak`. Frontend and API are reached via `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_API_URL` (often without ports via reverse proxy). Keycloak may still use `:8081` if not reverse-proxied.

### 15.2 Frontend Build & Run (Docker)

- **Build:** From repo root, `docker build` with build-args for all `NEXT_PUBLIC_*` variables (see DOCKER_BUILD.md). Next.js bakes these into the bundle at build time.
- **Run:** Container runs `node server.js` (Next.js standalone output); listens on `PORT`. Reverse proxy forwards to container; no fixed host port required.
- **Rebuild:** After code or env changes, rebuild the image (e.g. `docker compose build --no-cache nextjs-app`); restart container. Do not rely on runtime env for `NEXT_PUBLIC_*`.

### 15.3 Java Backend Build & Run (Docker)

- **Build:** In Java project: `mvn clean package`; Dockerfile copies JAR and runs `java -jar app.jar`. Image pushed to registry or built on VPS.
- **Run:** Container needs env: `SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/rentsetu`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`; Keycloak issuer URL for JWT validation. Reverse proxy forwards to backend; no fixed host port required.
- **Network:** Same Docker network as Postgres (and optionally Next.js) so that Java can reach DB; frontend may call Java via Nginx or service name depending on setup.

### 15.4 PostgreSQL (Docker)

- **Image:** `postgres:15-alpine`. Volume for data dir so data survives restarts.
- **Env:** `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB=rentsetu`.
- **Network:** Same network as Java backend; Java uses hostname `postgres` (service name) in JDBC URL.
- **Migrations:** Run by Java app on startup (Flyway/Liquibase) or run manually; no separate “DB container” migration step unless desired.

### 15.5 VPS Hosting

- **Server:** Code is deployed to a **VPS** (e.g. Ubuntu). Path used in docs: `/opt/rentsetu/` (frontend); Java app may be in `/opt/rentsetu-backend/` or same repo structure.
- **Reverse proxy:** **Nginx** (or Caddy) on the VPS:
  - Port mode (as earlier): **Frontend** `:8082`, **Java API** `:8080`, **Keycloak** `:8081`. Set `NEXT_PUBLIC_SITE_URL=http://YOUR_VPS_IP:8082` and `NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:8080`.
  - SSL via Let’s Encrypt or similar.
- **Deploy process:** Use `deploy-to-server.sh`: pack frontend (exclude node_modules, .next), SCP to VPS, extract, rebuild Docker image with correct build-args, restart container. For Java: build JAR, copy to VPS or rebuild Java image and restart container.
- **References:** SERVER_DEPLOYMENT.md, DOCKER_BUILD.md, docs/DEPLOY_VPS.md.

### 15.6 Environment Summary

- **Frontend (Next.js):** `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_KEYCLOAK_*`, `NEXT_PUBLIC_API_URL` (build-time). Runtime: `NODE_ENV=production`, `PORT` (internal only).
- **Java:** `SPRING_DATASOURCE_*`, Keycloak issuer, CORS allowed origin (frontend URL).
- **PostgreSQL:** `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`.
- **Secrets:** Keep passwords and API keys in env files or secrets (not in repo); pass into containers via docker-compose `env_file` or `environment`.

### 15.7 Monitoring & Health

- Next.js: health/readiness if implemented (e.g. route that returns 200).
- Java: Spring Boot Actuator `/actuator/health` (optional).
- Logging: stdout; avoid logging secrets. Optionally ship logs to a central store.

---

## 16. Glossary & References

### 16.1 Glossary

| Term | Definition |
|------|------------|
| **Listing** | A single rental property advertisement created by a landlord. |
| **Portal** | Third-party property site (e.g. Rightmove, MagicBricks) where listings may be syndicated. |
| **Package** | Pricing tier: Free (RentSetu only), Portal (syndication), Complete (full tenancy services). |
| **SSG** | Static Site Generation. |
| **IdP** | Identity Provider (Keycloak). |
| **PKCE** | Proof Key for Code Exchange (OAuth 2.0). |
| **JWT** | JSON Web Token; used by Keycloak; Java backend validates JWT for protected APIs. |
| **VPS** | Virtual Private Server; host for Docker containers (Next.js, Java, PostgreSQL). |
| **JPA** | Java Persistence API; used by Spring Data JPA / Hibernate to map entities to PostgreSQL. |
| **Flyway / Liquibase** | Database migration tools; version schema changes in the Java project. |

### 16.2 Internal References

- **README.md** — Project overview, setup, scripts.  
- **IMPLEMENTATION_SUMMARY.md** — Delivered features and structure.  
- **KEYCLOAK_SETUP.md** / **SETUP_WITHOUT_KEYCLOAK.md** — Auth setup.  
- **PROPERTY_ADVERTISING_PAGE.md** — Property Advertising page and API expectations.  
- **API_TOKEN_COOKIES.md** — Token/cookie handling.  
- **SERVER_DEPLOYMENT.md**, **DOCKER_BUILD.md**, **docs/DEPLOY_VPS.md** — Deployment.  
- **ARCHITECTURE.md**, **MICROFRONTEND.md** — Architecture and microfrontend strategy.  
- **docs/SOFT_LAUNCH_WBS_TIMELINE.md** and **docs/SOFT_LAUNCH_WBS_TIMELINE.csv** — WBS and timeline (start 7 Feb, Phase 1 skipped, phases 2–5 with buffer).

### 16.3 External Reference

- **OpenRent:** [https://www.openrent.co.uk/](https://www.openrent.co.uk/) — Reference product for positioning, landlord/tenant flows, and pricing structure.

---

## 17. Appendix: Converting this document to Word (.docx)

You can convert this Markdown (`.md`) file to a Word document (`.docx`) in several ways.

### Option 1: Pandoc (recommended for best quality)

1. Install [Pandoc](https://pandoc.org/installing.html) (e.g. `sudo apt install pandoc` on Linux, or `winget install pandoc` on Windows).
2. From the project root or `docs/` folder, run:

   ```bash
   pandoc docs/SOFTWARE_DEVELOPMENT_DOCUMENT.md -o docs/SOFTWARE_DEVELOPMENT_DOCUMENT.docx
   ```

3. Open `SOFTWARE_DEVELOPMENT_DOCUMENT.docx` in Microsoft Word or LibreOffice.

**Tip:** For a reference doc that includes the table of contents in Word, you can run:

```bash
pandoc docs/SOFTWARE_DEVELOPMENT_DOCUMENT.md -o docs/SOFTWARE_DEVELOPMENT_DOCUMENT.docx --toc
```

Then in Word: References → Table of Contents → Update Field (or insert a TOC) if needed.

### Option 2: Microsoft Word (open directly)

1. Open **Microsoft Word**.
2. File → **Open** → select `SOFTWARE_DEVELOPMENT_DOCUMENT.md`.
3. Word may offer to convert or show the raw Markdown; if the layout is poor, use **Save As** → **Word Document (.docx)** and then adjust formatting.

### Option 3: VS Code / Cursor extension

1. Install an extension such as **"Markdown PDF"** or **"Markdown All in One"** (some support export to Word or PDF; for Word, **Pandoc** is often used by the extension under the hood).
2. Right‑click the `.md` file → export to Word if the extension supports it, or export to PDF and use another tool to convert PDF → Word if necessary.

### Option 4: Online converters

- Upload the `.md` file to a site such as [CloudConvert](https://cloudconvert.com/md-to-docx), [Convertio](https://convertio.co/md-docx/), or similar.
- Download the generated `.docx`.  
- Use only for non-confidential content; avoid uploading sensitive internal docs to third-party sites.

---

**End of Software Development Document**
