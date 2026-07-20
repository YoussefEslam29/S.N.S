# S.N.S Website — Known Issues & Fix Plan

**File**: `THE_PLANS/error.md`
**Last updated**: 2026-07-20

This document lists every known bug or content problem with the S.N.S website in priority order.
Each entry explains the **root cause**, the **exact files to edit**, and what **"done" looks like**.

---

## Issue 1 — Admin Dashboard: Sign-in Does Not Work

### Problem
When navigating to `/admin/login` and submitting the credentials form, sign-in fails.

### Root Causes
1. **No admin account seeded**: The MongoDB database has no user document matching
   `admin@sns.com`. The `seed:admin` script must be run once to create it.
2. **MongoDB connection fails**: If the `MONGODB_URI` in `.env` is wrong or the
   cluster is paused (Atlas free-tier auto-pauses after 60 days of inactivity), the
   `authorize()` function in `lib/auth.ts` silently returns `null`, which the login
   form shows as "Invalid email or password".
3. **`NEXTAUTH_SECRET` missing or mismatched**: NextAuth v5 refuses to issue a JWT if
   this value is not set or is shorter than 32 characters.

### Fix
1. **Verify `.env`** contains all three values:
   ```
   MONGODB_URI=mongodb+srv://sns_admin:<password>@clusterforsns...
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=<at-least-32-char-random-string>
   ```
2. **Wake up the Atlas cluster** — log in to <https://cloud.mongodb.com>, open the
   cluster, and click **Resume** if it is paused.
3. **Seed the admin account** — run this once in the project root:
   ```bash
   npm run seed:admin
   ```
   This creates the user document with the credentials defined in `.env`:
   - Email: `admin@sns.com`
   - Password: `SNS@Admin2024!`
4. **Verify** by going to `http://localhost:3000/admin/login` and signing in.

### Files Involved
- [`lib/auth.ts`](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/lib/auth.ts) — `authorize()` callback
- [`scripts/seed-admin.ts`](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/scripts/seed-admin.ts) — seeder script
- [`.env`](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/.env) — environment variables

### Done When
Admin can sign in with `admin@sns.com` / `SNS@Admin2024!` and land on the dashboard.

---

## Issue 2 — Booking Page: "Failed to Load Services"

### Problem
When navigating to `/booking`, the wizard displays **"Failed to Load Services — Failed to fetch services."** and the service selection step is empty.

### Root Causes
1. **No services in the database**: The MongoDB `services` collection is empty. The
   `/api/services` endpoint returns `{ data: [] }`, which the booking page treats as
   an error (empty array).
2. **MongoDB not reachable**: If the cluster is paused or the URI is wrong, the API
   route throws a 500 and the page catches it and shows the error banner.
3. **Services are marked `isActive: false`**: The `/api/services` GET filter is
   `{ isActive: true }`. If all seeded services have `isActive: false`, the list is
   empty.

### Fix
1. **Fix MongoDB connectivity** (see Issue 1, steps 1–2).
2. **Seed the default services catalog** — run once:
   ```bash
   npm run seed:services
   ```
   This inserts five services (Wash, Detailing, Ceramic Coating, PPF, Tinting) in
   English and Arabic.
3. **Verify** at `http://localhost:3000/booking` — the service selection step should
   populate with the seeded services.

### Files Involved
- [`app/booking/page.tsx`](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/app/booking/page.tsx) — fetches `/api/services` on mount
- [`app/api/services/route.ts`](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/app/api/services/route.ts) — returns active services
- [`scripts/seed-services.ts`](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/scripts/seed-services.ts) — seeder script

### Done When
Booking page shows all 5 service categories and the user can proceed through the booking wizard.

---

## Issue 3 — Arabic Language: Layout Breaks & Translations Don't Fit

### Problem
Switching to Arabic (عربي) causes layout issues — elements overlap, text overflows,
spacing is wrong, and some UI components (navbar, cards, buttons) do not flip to RTL.

### Root Causes
1. **Tailwind LTR-only utility classes**: Classes like `pl-*`, `pr-*`, `text-left`,
   `ml-*` are hard-coded for LTR. Tailwind 4 provides logical properties
   (`ps-*` / `pe-*`) but the codebase uses physical ones throughout.
2. **Missing RTL overrides in `globals.css`**: The `[dir="rtl"]` block only switches
   the font — it does not flip flex directions, text alignment, or spacing.
3. **Framer Motion animations use `x: -30` / `x: 30`**: These slide directions are
   wrong in RTL (left becomes right).
4. **Arabic text is longer than English in some keys**: Translated strings in
   `lib/i18n.tsx` (e.g. `hero.badge`, `nav.bookNow`) are longer than the space
   allocated by the fixed-width English design, causing overflow.
5. **Navbar mobile menu**: The close/open icon and language toggle button are not
   mirrored for RTL.

### Fix Plan

#### Step A — `globals.css`: Add RTL layout overrides
```css
/* ─── RTL Layout Fixes ─── */
[dir="rtl"] .container-sns {
  direction: rtl;
}

[dir="rtl"] .flex-row-reverse-rtl {
  flex-direction: row-reverse;
}
```

#### Step B — `Navbar.tsx`: Add `dir`-aware icon mirroring
Import `useLanguage` and conditionally flip directional icons:
```tsx
const { dir } = useLanguage();
// On ChevronRight icons:
<ChevronRight className={cn("w-4 h-4", dir === "rtl" && "rotate-180")} />
```
Also change the mobile menu from `text-left` → `text-start` and `px-4` → `px-4 rtl:flex-row-reverse`.

#### Step C — Replace physical Tailwind classes with logical ones (key components)
In `app/page.tsx`, `app/services/page.tsx`, `app/booking/page.tsx`:
- `pl-*` → `ps-*`
- `pr-*` → `pe-*`
- `text-left` → `text-start`
- `ml-auto` → `ms-auto`
- `mr-auto` → `me-auto`

#### Step D — `lib/i18n.tsx`: Shorten Arabic translations that overflow
Review and shorten these keys so they fit the allocated space:
- `hero.badge`
- `nav.bookNow`
- `booking.step.*` labels (used in the multi-step progress bar)

### Files Involved
- [`app/globals.css`](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/app/globals.css)
- [`components/layout/Navbar.tsx`](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/components/layout/Navbar.tsx)
- [`lib/i18n.tsx`](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/lib/i18n.tsx)
- [`app/page.tsx`](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/app/page.tsx)
- [`app/services/page.tsx`](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/app/services/page.tsx)
- [`app/booking/page.tsx`](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/app/booking/page.tsx)

### Done When
Full RTL layout with readable Arabic text and no overflow or misalignment on any page.

---

## Issue 4 — Reviews Page: AI-Generated Fake Reviews, Not Google Maps Data

### Problem
The `/reviews` page shows 6 static, AI-written fake customer reviews hardcoded in
the component. The original requirement was to embed real Google Maps reviews.

### Root Cause
The AI assistant generated placeholder data (`placeholderReviews` array) in
`app/reviews/page.tsx` instead of connecting to a real data source.

### The Reality of Google Maps API
Google does **not** provide a public API that returns reviews for a specific place in
a format that can be embedded freely. Options:
1. **Google Places API (Photos + Reviews)** — paid per request, returns max 5 reviews.
2. **Google Reviews Widget** (unofficial) — JavaScript embed, limited control over styling.
3. **Manual entry** — owner adds real reviews to the MongoDB `reviews` collection via the admin dashboard, which the public `/reviews` page fetches.

### Recommended Fix — Use Admin Dashboard + Real MongoDB Reviews
The cleanest approach that fits the existing architecture:

1. **Remove the fake `placeholderReviews` array** from
   [`app/reviews/page.tsx`](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/app/reviews/page.tsx)
2. **Fetch real reviews** from `/api/reviews?approved=true` on mount (same pattern as
   the services page).
3. **Owner adds reviews manually** via the Admin Dashboard → Reviews tab, copying
   real text from Google Maps.
4. **Optionally** embed the Google Maps widget by adding a `<script>` tag for the
   official Google Maps Place Reviews embed:
   - Google Maps Place ID for S.N.S: get this from <https://developers.google.com/maps/documentation/places/web-service/place-id>
   - Embed the place widget: `https://maps.google.com/maps?q=place_id:<YOUR_PLACE_ID>&output=embed`

### Files to Edit
- [`app/reviews/page.tsx`](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/app/reviews/page.tsx) — replace static array with `useEffect` fetch
- [`app/api/reviews/route.ts`](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/app/api/reviews/route.ts) — verify GET supports `?approved=true` filter

### Done When
The `/reviews` page shows only reviews that the owner has approved via the admin
dashboard, or the owner's chosen Google Maps embed is visible.

---

## Issue 5 — Gallery Page: AI-Generated Fake Image Cards

### Problem
The gallery shows image cards with names like "BMW X5 — Full PPF Wrap" but no actual
photos. These are placeholder items with a sparkle icon. The user does not want AI-made
fake media.

### Root Cause
Image gallery items (ids `"1"` through `"6"`) in `app/gallery/page.tsx` were created
as static placeholder data by the AI. No real photos exist in `/public/` for them.

### Fix — Remove Fake Image Cards; Keep Only Real Videos
1. **Delete the static fake image items** from the `galleryItems` array in
   [`app/gallery/page.tsx`](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/app/gallery/page.tsx) (items with ids `"1"` through `"6"`).
2. **Keep only the 4 real video entries** (ids `"v1"` to `"v4"`) which reference
   the actual `.mp4` files in `/public/videos/`.
3. **Add a "Photos Coming Soon" placeholder section** instead of fake cards — a clean
   banner that says photos will be added soon.
4. **To add real photos later**:
   - Upload photos to `/public/gallery/` (e.g. `ppf-bmw-x5.jpg`)
   - Add an `src` field to the `GalleryItem` interface
   - Add real items to `galleryItems` with `isVideo: false` and real `src` paths
   - Update `GalleryImageCard` to render `<Image>` instead of the sparkle placeholder

### Files to Edit
- [`app/gallery/page.tsx`](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/app/gallery/page.tsx):
  - Remove items with ids `"1"` through `"6"` from `galleryItems`
  - Update `GalleryImageCard` to render `<Image src={item.src}>` when `src` is present
  - Add a "Photos Coming Soon" empty-state section

### Done When
Gallery only shows content the owner has explicitly added — no placeholder cards with
sparkle icons or fake vehicle names.

---

## Issue 6 — WhatsApp Floating Contact Button

### Problem
The owner wants customers who get confused to be able to contact them directly via
WhatsApp without having to look for a phone number. There is no floating WhatsApp
button on the website.

### Current State
WhatsApp is linked in the footer social icons (`https://wa.me/201285476014`) but it
is not visible on every page and is easy to miss.

### Fix — Add a Floating WhatsApp Button
Add a fixed-position WhatsApp button that floats on the bottom-right corner of every
page (above the footer), on all screen sizes.

#### Implementation

**1. Create `components/WhatsAppButton.tsx`**:
```tsx
"use client";

export function WhatsAppButton() {
  const phone = "201285476014"; // Owner's WhatsApp number (no + prefix)
  const message = encodeURIComponent("Hi S.N.S! I need help with a car care service.");
  const url = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 flex items-center justify-center
                 bg-[#25D366] hover:bg-[#128C7E] rounded-full shadow-lg
                 hover:shadow-xl hover:scale-110 transition-all duration-300
                 rtl:right-auto rtl:left-6"
    >
      {/* WhatsApp SVG icon */}
      <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15
          -.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463
          -2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606
          .134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025
          -.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008
          -.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0
          1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262
          .489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413
          .248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004
          a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86
          0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988
          2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413
          -18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547
          4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005
          c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  );
}
```

**2. Add it to `app/layout.tsx`** inside the `<LanguageProvider>` wrapper:
```tsx
import { WhatsAppButton } from "@/components/WhatsAppButton";

// Inside <body>:
<LanguageProvider>
  <LoadingScreen />
  <Navbar />
  <main className="flex-1">{children}</main>
  <WhatsAppButton />   {/* ← add this line */}
  <Footer />
</LanguageProvider>
```

### Files to Edit / Create
- **[NEW]** `components/WhatsAppButton.tsx`
- [`app/layout.tsx`](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/app/layout.tsx) — import and render `<WhatsAppButton />`

### Owner's WhatsApp Number
`+20 128 547 6014` — already referenced in the footer. Verify this is the correct
number for customer contact before deploying.

### Done When
A green WhatsApp button is visible in the bottom-right corner (bottom-left in Arabic
RTL mode) on every page, and clicking it opens WhatsApp with a pre-filled greeting
message.

---

## Priority Order

| # | Issue | Priority | Status |
|---|-------|----------|--------|
| 1 | Admin sign-in broken | 🔴 Critical | Open |
| 2 | Booking "Failed to Load Services" | 🔴 Critical | Open |
| 6 | WhatsApp floating contact button | 🟡 High | Open |
| 3 | Arabic language layout broken | 🟡 High | Open |
| 4 | Fake AI reviews — replace with real | 🟡 High | Open |
| 5 | Fake AI gallery image cards | 🟡 High | Open |
