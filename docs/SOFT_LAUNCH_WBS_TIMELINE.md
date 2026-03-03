# RentSetu Soft Launch — WBS & Timeline

**Product:** RentSetu  
**Reference:** SOFTWARE_DEVELOPMENT_DOCUMENT.md (Section 13)  
**Project start:** 7 February 2025 | **Phase 1 skipped** (in progress) | **Target launch:** ~15 April 2025

---

## Team & Owners

| Role | Owner | Scope |
|------|--------|--------|
| **UI / Frontend** | **Devashish Maurya** | Next.js pages, components, Navbar, Dashboard, Account, Landlord Services, Tenant Section, search, listing detail, forms |
| **API / Backend** | **Vinod Saini** | Java REST APIs, Keycloak integration, listing add/view, enquiries, tenancies, referencing, payment gateway, file uploads |
| **DB / Data** | **Pooja Chhetri** | PostgreSQL schema, migrations (Flyway/Liquibase), tables (users, listings, enquiries, tenancies, documents), file storage (S3) setup |

*Docker & VPS:* Vinod (or shared). Use **Cursor / ChatGPT** to accelerate (per client).

---

## Working Hours & Timeline Summary

| Item | Detail |
|------|--------|
| **Context** | RentSetu alongside office work (not full-time). |
| **Weekdays** | 2–4 hours |
| **Weekends** | 8–10+ hours |
| **Per week (planning)** | ~30 hours total (all roles) |
| **Buffer** | None (client asked for shorter timeline). |
| **Remaining phases** | Phase 2 → 5: 24 Feb – 15 Apr 2025 (~7 weeks, ~2 weeks per phase). |

---

## Phase Overview

| Phase | Start | End | Duration | Focus | Owners (primary) |
|-------|--------|--------|-----------|--------|-------------------|
| ~~Phase 1 — Foundation~~ | 7 Feb 2025 | — | — | Nav, dashboard, account, tenant entry (started; skipped in plan) | All |
| **Phase 2 — Listings & Enquiries** | 24 Feb | 8 Mar | ~2 weeks | Listing detail, Message landlord, My Tenancies shell, Landlord Services overview; APIs: listing detail, enquiries, tenancies, account profile | Devashish, Vinod, Pooja |
| **Phase 3 — Landlord Services & Prep** | 9 Mar | 21 Mar | ~2 weeks | Services Overview (17 left + 11 right, interconnected); Property Advertising, Tenancy Creation, Referencing (right-panel + full pages); remaining 8 right-panel blocks (Coming soon); tenancy docs/certs; S3; referencing APIs | Devashish, Vinod, Pooja |
| **Phase 4 — Referencing & Payments** | 22 Mar | 3 Apr | ~2 weeks | Referencing onboarding (tenant), referencing complete APIs, payment gateway, file storage | Devashish, Vinod, Pooja |
| **Phase 5 — Polish & Launch** | 4 Apr | 15 Apr | ~2 weeks | Rent Now info (tenant), profile photo, QA, Docker/VPS deploy | Devashish, Vinod |

---

## Work Breakdown Structure (WBS) — Full Detail

*Owner: DM = Devashish Maurya (UI), VS = Vinod Saini (API), PC = Pooja Chhetri (DB). For Excel view with Owner and Status, use **SOFT_LAUNCH_WBS_TIMELINE.csv**.*

### 1. Frontend — Public & Nav (Owner: Devashish Maurya)

| WBS | Work Package | Description | Phase | Start | End | Depends On | Deliverables |
|-----|--------------|-------------|--------|--------|--------|------------|--------------|
| 1.1 | Navbar: About dropdown | About menu: Landlords \| Tenants \| OpenRent links; Tenants → tenant hub/search | P1 (started) | 7 Feb | — | — | Navbar component updated |
| 1.2 | Post-login UX | Logged-in name + avatar; dropdown (Edit Profile, Switch Account, Log out); click → My Dashboard | P1 (started) | 7 Feb | — | Auth | User menu component |
| 1.3 | My Dashboard shell | Tabs (Dashboard, Account, Landlord Services); sidebar (Favourites, Saved Searches, Your Enquiries, Verified Tenant); welcome + Search Listings + Create listing cards | P1 (started) | 7 Feb | — | 1.2 | `/my-dashboard` page |
| 1.4 | Google login | Two options: Keycloak (existing) + Sign in with Google; OAuth flow, callback; backend: Google JWT or Keycloak broker | P2 | 24 Feb | 8 Mar | 1.2, Auth | Login UI + Google OAuth; backend support |

### 2. Frontend — Account (Owner: Devashish Maurya)

| WBS | Work Package | Description | Phase | Start | End | Depends On | Deliverables |
|-----|--------------|-------------|--------|--------|--------|------------|--------------|
| 2.1 | Account section | Route `/account/edit`; sidebar: Edit Details, My Photo, Credits, Delete Account | P1 (started) | 7 Feb | — | 1.2 | Account layout + sidebar |
| 2.2 | Edit details form | Password, Email, First/Last name, Primary phone (+91); wire to GET/PUT profile API | P2 | 24 Feb | 8 Mar | 2.1, API 5.6 | Profile form |
| 2.3 | Profile photo upload | My Photo — upload, crop, display; wire to storage/API | P5 | 4 Apr | 15 Apr | 2.1, API + storage | Photo upload component |

### 3. Frontend — Landlord Services (Owner: Devashish Maurya)

*Left sidebar (17 services) + right panel (11 blocks); interconnected. Ref: [OpenRent Services Overview](https://www.openrent.co.uk/services-overview).*

| WBS | Work Package | Description | Phase | Start | End | Depends On | Deliverables |
|-----|--------------|-------------|--------|--------|--------|------------|--------------|
| 3.1 | Services Overview | Route `/landlord-services` or `/services-overview`. Left sidebar: all 17 services. Right panel: 11 blocks. Click left → show right; Property Advertising click → `/pricing/property-advertising`. | P2 | 24 Feb | 8 Mar | 1.3 | `/landlord-services` with full left + right; all 17 in sidebar; PA click → existing page 
| 3.2 | Property Advertising | Link → `/pricing/property-advertising` (existing page). Enhance: hero, stats, packages API, CTA. | P3 | 9 Mar | 21 Mar | 3.1, API 5.1 | PA link opens existing page; enhance page content 
| 3.3 | Tenancy Creation | What is Rent Now, benefits, Moving forward, Add Property CTA; right panel when selected + full page `/rent/tenancycreation`. “Moving forward” (need published property), Add Property CTA | P3 | 9 Mar | 21 Mar | 3.1 | Tenancy Creation block + page 
| 3.4 | Tenant Referencing | Pricing, Initial/Final report, product breakdown, FAQs, Begin Referencing CTA; right panel + `/tenant-referencing`; wire API 6.x | P3 | 9 Mar | 21 Mar | 3.1, API 6.x | Tenant Referencing block + page 
| 3.5 | Remaining 8 right-panel blocks | Management Plus, RGI, Building Insurance, Gas Safety, EPC, Electrical Safety, Inventory, Pro Photos — copy + CTA or Coming soon | P3 | 9 Mar | 21 Mar | 3.1 | All 11 right-panel blocks; 8 as placeholder or Coming soon |

**Backend for 17 services + 11 blocks:** Yes — covered by existing WBS. **Property Advertising** → 5.1 (stats, packages); **Tenancy Creation** → 5.4, 5.5, 6.4 (tenancies, documents, payment); **Tenant Referencing** → 6.1–6.4 (initiate, complete, provider, payment). **Remaining 8 blocks** (Management Plus, RGI, Gas Safety, EPC, Electrical, Inventory, Pro Photos, Building Insurance): no backend in soft launch (Coming soon / placeholder only).

### 4. Frontend — Tenant Section (Owner: Devashish Maurya)

| WBS | Work Package | Description | Phase | Start | End | Depends On | Deliverables |
|-----|--------------|-------------|--------|--------|--------|------------|--------------|
| 4.1 | Tenant entry & search | About → Tenants; `/search` or `/find-property`; filters and listing rows | P1 (started) | 7 Feb | — | 1.1, existing search | Tenant hub + search |
| 4.2 | Listing detail page | Route `/property/[id]`; full listing, photos, rent, address, Message landlord CTA | P2 | 24 Feb | 8 Mar | API 5.2 | Property detail page |
| 4.3 | Message landlord | Route `/message-landlord/[id]` or modal; auth required; form to enquiries API | P2 | 24 Feb | 8 Mar | 4.2, API 5.3 | Enquiry form + POST |
| 4.4 | Rent Now info (tenant) | Route `/rent/rent-now-info/[id]` or under My Tenancies; status, documents, next steps | P5 | 4 Apr | 15 Apr | API 5.4 | Rent Now info view |
| 4.5 | My Tenancies | Route `/my-tenancies`; list tenancies; view details, certificates, upload/view documents | P2–P3 | 24 Feb | 21 Mar | API 5.4, 5.5 | My Tenancies page |
| 4.6 | Referencing onboarding (tenant) | Tenant link to complete referencing; form + document upload; wire to API | P4 | 22 Mar | 3 Apr | API 6.2 | Referencing form page |

### 5. Backend — Core APIs (Owner: Vinod Saini)

| WBS | Work Package | Description | Phase | Start | End | Depends On | Deliverables |
|-----|--------------|-------------|--------|--------|--------|------------|--------------|
| 5.1 | Listing add + view + stats + packages | POST `/api/listing/add`, POST `/api/listing/v1.0/view`, GET stats, GET packages | P1 (started) | 7 Feb | — | DB 7.1 | 4 endpoints live |
| 5.1a | Auth: Google login support | Backend accepts Google OAuth tokens or Keycloak Google identity broker | P2 | 24 Feb | 8 Mar | — | Google JWT validation or Keycloak broker |
| 5.2 | Listing detail | GET `/api/listings/{id}` (public) | P2 | 24 Feb | 8 Mar | DB | Listing by id |
| 5.3 | Enquiries / messages | POST `/api/enquiries` or `/api/messages`; GET list by user | P2 | 24 Feb | 8 Mar | DB 7.1 | Enquiry APIs |
| 5.4 | Tenancies (tenant view) | GET `/api/tenancies/mine`, GET `/api/tenancies/{id}` | P2–P3 | 24 Feb | 21 Mar | DB | Tenancy APIs |
| 5.5 | Tenancy documents & certificates | GET/POST `/api/tenancies/{id}/documents`, certificates; upload (landlord) | P2–P3 | 24 Feb | 21 Mar | DB, Storage 7.2 | Document/certificate APIs |
| 5.6 | Account profile | GET / PUT `/api/account/profile` or `/api/users/me` | P2 | 24 Feb | 8 Mar | DB | Profile APIs |

### 6. Backend — Referencing & Payments (Owner: Vinod Saini)

| WBS | Work Package | Description | Phase | Start | End | Depends On | Deliverables |
|-----|--------------|-------------|--------|--------|--------|------------|--------------|
| 6.1 | Referencing initiate | Landlord starts referencing; create application; generate tenant link | P3–P4 | 9 Mar | 3 Apr | DB | Referencing initiation API |
| 6.2 | Referencing complete (tenant) | GET/POST `/api/referencing/complete/{token}`; tenant form + file upload | P4 | 22 Mar | 3 Apr | 6.1, Storage | Referencing complete API |
| 6.3 | Referencing provider integration | Credit/ID checks (India partner); store report; status webhooks | P4 | 22 Mar | 3 Apr | 6.1 | Provider integration |
| 6.4 | Payment gateway | Razorpay/Stripe for referencing, Tenancy Creation, Portal package; webhooks | P4 | 22 Mar | 3 Apr | — | Payment + webhooks |

### 7. Database & DevOps (Owner: Pooja Chhetri / Vinod)

| WBS | Work Package | Description | Phase | Start | End | Depends On | Deliverables |
|-----|--------------|-------------|--------|--------|--------|------------|--------------|
| 7.1 | PostgreSQL migrations | users, account, listings, enquiries, tenancies, documents, pricing_packages; indexes | P1 (started) | 7 Feb | — | — | Flyway/Liquibase scripts |
| 7.2 | File storage (S3) | Certificates, referencing docs, profile photo; presigned or server upload | P3–P4 | 9 Mar | 3 Apr | — | S3 bucket + upload API |
| 7.3 | Docker & VPS | Frontend + Java + Postgres; Nginx; env and secrets | P1–P5 | 7 Feb | 15 Apr | Existing | Running on VPS |

---

## Gantt by Owner

*■ = primary focus in that week.*

| Owner | 24 Feb – 8 Mar (P2) | 9 Mar – 21 Mar (P3) | 22 Mar – 3 Apr (P4) | 4 Apr – 15 Apr (P5) |
|--------|----------------------|---------------------|----------------------|----------------------|
| **Devashish (UI)** | 1.4, 2.2, 3.1, 4.2, 4.3, 4.5 | 3.2, 3.3, 3.4, 3.5, 4.5 | 4.6 | 2.3, 4.4, QA |
| **Vinod (API)** | 5.1a, 5.2, 5.3, 5.4, 5.5, 5.6 | 5.4, 5.5, 6.1, 7.2 | 6.1, 6.2, 6.3, 6.4 | Deploy, 7.3 |
| **Pooja (DB)** | Support 5.x (tables if needed) | 7.2 (storage) | 7.2, support 6.x | Support deploy |

---

## Dependencies (Critical Path)

1. **DB 7.1** (Pooja) → APIs 5.1, 5.2, 5.3, 5.4, 5.5, 5.6 (Vinod) → UI 2.2, 4.2, 4.3, 4.5 (Devashish).
2. **APIs 6.1, 6.2** (Vinod) + **Storage 7.2** (Pooja) → UI 4.6 (Devashish).
3. **API 5.1** (stats, packages) → UI 3.2 (Devashish).

---

## How to Use in Excel

Open **SOFT_LAUNCH_WBS_TIMELINE.csv** in Excel (Data → From Text/CSV) for a flat view with Owner and Status. Filter by Owner or Phase as needed.

---

**End of WBS & Timeline**
