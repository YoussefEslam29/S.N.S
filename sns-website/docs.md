# S.N.S Car Care — Brand Assets & Premium Gallery Documentation

This document logs the recent visual upgrades and feature additions made to the S.N.S Car Care website.

---

## 1. Brand Assets & Layout Config
We updated the core logo elements and browser metadata icons to use the official S.N.S logo files:
* **Browser Tab Icon (Favicon)**: Copied `gallery/2-LOGO S.N.S.jpg` to [app/icon.jpg](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/app/icon.jpg). Deleted the default `favicon.ico` so the browser resolves this new premium icon automatically.
* **Header & Navbar Logo**: Copied `gallery/2-LOGO S.N.S.jpg` to `public/logo.jpg`. Updated [Navbar.tsx](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/components/layout/Navbar.tsx) to fetch `/logo.jpg` and added rounded edges for a clean fit.
* **Hero Image**: Copied `gallery/1-LOGO S.N.S.png` to `public/hero-logo.png`.

---

## 2. Dependencies
* Installed `framer-motion` inside `sns-website` (with peer-dependency flags for React 19 compatibility).

---

## 3. Redesigned Home Page Hero Section
Updated [page.tsx](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/app/page.tsx) to present a premium two-column desktop layout:
* **Left Column**: Responsive copy, badges, vehicle size pricing selectors, and styled call-to-actions (CTAs) that stagger-animate in on load.
* **Right Column**: Visual frame highlighting `hero-logo.png`.
  * **Hover Glow**: A gradient neon-border glow (primary brand color + blue) that brightens on hover.
  * **Float Effect**: A continuous CSS/Framer Motion keyframe translation (`y: [0, -12, 0]`) to make the card appear floating.
  * **Backdrop**: Blurred glowing background blob (`blur-[80px]`) giving a premium 3D depth effect.
  * **Watermark**: Added a bottom glassmorphic caption card inside the frame showing the `Swill N Spin` brand details and `PREMIUM` tag.

---

## 4. Upgraded Gallery Page & Interactive Video Portfolio
Updated [page.tsx](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/app/gallery/page.tsx) to incorporate our video portfolio assets:
* **Video Directory**: Created `public/videos/` and copied the following video edits there:
  * `1-cc-edit-video.mp4` (S.N.S Premium Car Care Experience)
  * `2-cc-edit-video-polandpro.mp4` (Ceramic Coating & PPF Protection)
  * `3-cc-edit-video.mp4` (Interior Detailing & Restoration)
  * `3-cc-edit-video-pro.mp4` (Elite Car Care & Shine Showreel)
* **Video Filtering**:
  * Added a **Videos** category tab filter alongside existing service tabs.
  * Configured filtering logic to resolve videos under the main "All Work" category, "Videos" category, and their respective service categories (e.g. PPF, wash, detailing).
* **Hover-to-Play Previews**:
  * Implemented `GalleryVideoCard` using standard HTML5 `<video>` tags and React refs.
  * Muted video starts playing automatically on mouse hover and pauses/resets when mouse leaves, providing dynamic video previews without wasting heavy bandwidth.
  * Displays an animated play button overlay and a helpful "Hover to Preview" tip.
* **Lightbox Video Player**:
  * Lightbox overlay detects if the item clicked is a video.
  * Displays a full HTML5 video element with play controls (`controls`, `autoPlay`, `playsInline`) inside the lightbox so users can enjoy the audio and high-definition quality.
* **Animations**:
  * Framer Motion staggered entrance animations for all cards.
  * Smooth layout transitioning (`layout` prop) that animates cards sliding into position when switching filters.
  * AnimatePresence for smooth fade-in/fade-out of the lightbox overlays.
* **Process Showcase**:
  * Redesigned the bottom section ("Watch Our Process") to highlight all 4 premium edits side-by-side with full hover-play capabilities.

---

## 5. Branded Loading Screen
Updated [LoadingScreen.tsx](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/components/LoadingScreen.tsx) and [layout.tsx](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/app/layout.tsx):
* **Asset**: Copied `gallery/LOADING_SCREEN ANIMATION.mp4` to `public/videos/loading-screen.mp4` — the 8-second car-cycling animation.
* **Plan**: Full design spec documented in [Loading_screen.md](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/THE_PLANS/Loading_screen.md).
* **Component** (`components/LoadingScreen.tsx`):
  * Full-screen fixed overlay (`z-index: 9999`) placed at top of the `<body>` before the Navbar so it covers everything.
  * Plays the car animation video (`autoPlay`, `muted`, `loop`, `playsInline`) centered in the screen.
  * **Progress bar**: Fills from 0% → 100% over a minimum of 3 seconds, with a blue glow (`#3B82F6` with `box-shadow`), and a traveling shimmer effect.
  * **Status messages**: Cycles through 4 branded messages ("Initializing premium experience...", "Loading services...", "Preparing your garage...", "Almost ready...") every 750ms.
  * **Percentage counter**: Live `0%` → `100%` counter displayed in primary blue.
  * **Brand elements**: S.N.S logo top-left, `PREMIUM` tag top-right, tagline `"Care. Shine. Defend."` at the bottom in tracking caps.
  * **Decorative layers**: Chrome shimmer top/bottom edge lines, radial vignette around the video, corner glow blobs using brand primary color.
  * **Dismiss logic**: Screen hides after **both** the minimum 3-second timer AND the `window.load` event have fired. A 9-second failsafe forces dismissal regardless.
  * **Exit animation**: Smooth opacity fade-out (600ms) via Framer Motion `AnimatePresence`.
  * **Accessibility**: Respects `prefers-reduced-motion` via the existing `globals.css` media query.

---

## 6. Audit & Fixes (fix_claude.md Plan)
Implemented the quality fixes detailed in [fix_claude.md](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/THE_PLANS/fix_claude.md):
* **Crisp SVG Favicon**: Created [icon.svg](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/app/icon.svg) to serve as a clean vector tab icon. Removed `icon.jpg` to avoid resolution issues.
* **Responsive DOM Text Logo**: Replaced navbar logo image with a styled text-based logo component ("S.N.S Car Care") using brand colors and Outfit typography, avoiding mudded or squeezed illustration layouts.
* **Developer README**: Created a detailed setup guide at [README.md](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/README.md) containing prerequisites, environmental variables, quickstart commands, and directory layouts.
* **Git Large File Storage (LFS)**: Initialized Git LFS and configured tracking rules for all `*.mp4` assets to prevent committing large binary files to core Git history.
* **Folder Structure Cleanups**: Misspelled `gallary` directory renamed to `gallery` at repo root. All plan and document references have been updated.
* **Environment Variables**: Enhanced [.env.example](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/.env.example) to fully document `MONGODB_URI`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` placeholders.
* **Bilingual English & Arabic Routing**:
  * Created i18n context provider in [i18n.tsx](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/lib/i18n.tsx).
  * Automatically coordinates text-direction (`dir="rtl"` / `dir="ltr"`) and page language tag based on active locale.
  * Added a language switcher button to [Navbar.tsx](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/components/layout/Navbar.tsx) (active on desktop and mobile).
  * Translated main homepage text strings (hero section, services menu titles, review tags, and call-to-actions), gallery page content, and the site footer layout.
* **Leftover AI Tooling Files**: Deleted the instructions folders (`SKILLS/`), `AGENTS.md`, and `CLAUDE.md` to keep the codebase focused on the website implementation.
* **License Preservation**: Confirmed and retained the GPLv3 license terms in the repo.

---

## 7. Wire Services & Timeslots Booking Integration (GoLive Plan)
We wired the booking wizard and service page to the backend MongoDB APIs:
* **Upgraded NextAuth**: Upgraded `next-auth` to `5.0.0-beta.25` in `package.json` to resolve build compatibility issues with the NextAuth v5 API shape used in the codebase. Installed dependencies with `--legacy-peer-deps`.
* **Admin Seeder Script**: Created [seed-admin.ts](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/scripts/seed-admin.ts) to connect to MongoDB and insert the initial Administrator account using the `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` from `.env`. Added `"seed:admin"` script to `package.json`.
* **Booking Wizard Integration**: Updated [page.tsx (Booking)](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/app/booking/page.tsx) to:
  * Fetch active services dynamically on mount from `/api/services`.
  * Fetch timeslots and capacity checks dynamically from `/api/timeslots?date=YYYY-MM-DD` when the user selects a date, disabling unavailable/full slots.
  * Correct the fields in the POST body to match the database schemas (e.g. flat `customerName`, `customerPhone` attributes instead of nested objects).
  * Enable bilingual support (`locale === "ar" ? service.name.ar : service.name.en`) inside all wizard steps.
  * Implement loaders, confirmation details, and error banners to handle transaction feedback.
* **Services Page Internationalization**: Updated [page.tsx (Services)](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/app/services/page.tsx) to load translated name and description strings dynamically, including translated category tab headers and installment details.

---

## 8. Self-Healing DNS Resolution, Seeder Script & Waiting Overlays
We added system fixes to guarantee database connection success across any ISP and implemented waiting overlays:
* **Self-Healing DNS Converter**: Created a dynamic query converter inside [db.ts](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/lib/db.ts) that uses a custom `node:dns` `Resolver` pointed to Google DNS (`8.8.8.8`, `8.8.4.4`). It resolves the MongoDB SRV/TXT records at runtime and outputs a standard `mongodb://` string, bypassing local ISP DNS limitations without process-level preloading hacks.
* **Self-Healing Connection Caching**: Enhanced `connectDB` to catch database connection errors and purge them from the Next.js global cache (`global.mongoose`) so that the application can self-recover and reconnect on subsequent requests.
* **Default Services Seeder**: Created [seed-services.ts](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/scripts/seed-services.ts) to populate the MongoDB catalog with default S.N.S services (Premium Wash, Interior Detailing, 3-Year Ceramic Coating, Full PPF Wrap, Premium Window Tinting) in English and Arabic. Added the `"seed:services"` command to `package.json`.
* **Action Waiting Overlay Screen**: Built a reusable glassmorphic [LoadingOverlay](file:///d:/4%29%20projects/Websites/S.N.S%20CARWASH/S.N.S/sns-website/components/LoadingOverlay.tsx) component and wired it into all client wait states:
  * Public Booking submission
  * Admin dashboard login
  * Admin Bookings moderation & marking installments paid
  * Admin Services CRUD & bulk price updates
  * Admin Gallery uploads & deletions
  * Admin Staff creation & toggle active status
  * Admin Reviews approval & featured actions

---

## 9. Next.js 16 Routing and Auth Proxy Migration (proxy.ts)
* **Problem**: Next.js 16.2.10 (Turbopack) deprecates the legacy `middleware.ts` convention in favor of `proxy.ts`. When NextAuth v5's middleware wrapper `auth` was exported as a default export from a `middleware.ts` file, the Next.js routing engine intercepted all requests (including public pages `/services`, `/booking`, `/gallery`, `/reviews`) and erroneously returned a `404 This page could not be found` page, ignoring the matcher rules.
* **Solution**:
  1. **Rename File**: Rename `middleware.ts` to `proxy.ts` at the root of the project.
  2. **Named Export**: Instead of a default export, export the NextAuth `auth` function as a named `proxy` export:
     ```typescript
     export { auth as proxy };
     ```
  3. **Restrict Matcher**: Set the matcher rules to only intercept administration routes:
     ```typescript
     export const config = {
       matcher: ["/admin/:path*"],
     };
     ```
