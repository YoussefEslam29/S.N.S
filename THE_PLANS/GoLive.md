# GoLive.md — S.N.S: Closing the Gap Between "Built" and "Working"

**Repo:** `YoussefEslam29/S.N.S` (branch `main`)
**For:** Claude Opus 4.6 agent running in Antigravity IDE
**Context:** The models, API routes, and UI pages already exist. This plan closes four specific gaps that currently stop the app from actually working end-to-end. Work through sections in order — each depends on the one before it.

Skills applied: `nextjs-fullstack-builder` (code conventions, API/security patterns), `ui-ux-pro-max` (loading/error feedback states for the newly-wired UI), `idea-to-plan` (plain-language framing of why each fix matters), `skill-creator` (noted where a fix is worth turning into a reusable pattern).

---

## ⚠️ Bonus finding before you start: NextAuth version mismatch

While auditing for this plan, one more blocking issue turned up that isn't in the original list but will make Section 2 (the admin seeder) impossible to test if left unfixed:

**`package.json` declares `"next-auth": "^4.24.14"`, but `lib/auth.ts`, `middleware.ts`, and `app/api/auth/[...nextauth]/route.ts` are all written against the NextAuth v5 (Auth.js) API** — `NextAuth(config)` returning `{ handlers, auth, signIn, signOut }`, and `export { auth as middleware }`. This shape does not exist in NextAuth v4. As written, `npm install` pulls v4 and the auth system will fail to build or run entirely, regardless of any other fix in this plan.

**Fix:** update `package.json` to use a v5 (beta/canary) release compatible with `@auth/mongodb-adapter@^3.11.2`, e.g.:
```json
"next-auth": "^5.0.0-beta.25"
```
Then run `npm install` and confirm `npm run build` succeeds before moving to any section below. **Do this first — nothing involving login can be tested until this is fixed.**

---

## Section 1 — Disconnected Pages (Step 0 Gap)

**Why this matters:** right now, anyone using the site can fill out the booking wizard, click submit, and nothing is saved — the same for admin edits. The app *looks* finished but doesn't remember anything. This has to be fixed before anything else in this plan is worth testing.

### 1.1 — Public booking wizard (`app/booking/page.tsx`)

- Line 39, `const allServices = [...]` — replace with a fetch from `GET /api/services?isActive=true` on mount (or convert the data-loading part to a Server Component wrapper that passes services down as props, keeping the wizard steps themselves client-side for interactivity).
- Line 33, `const timeSlots = [...]` — replace with a fetch from `GET /api/timeslots?date=<selected date>` so displayed slots reflect real remaining capacity, not a static list.
- **Line 102, `// TODO: POST to /api/bookings`** — this is the actual submit action. Implement it:
  ```typescript
  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer: { name, phone, email, vehicleMake, vehicleModel },
      service: selectedService.id,
      vehicleType,
      date: selectedDate,
      timeSlot: selectedTime,
      paymentMethod,
      price,
    }),
  });
  if (!res.ok) {
    const { error } = await res.json();
    // show error near the submit button — see 1.4 below
    return;
  }
  // show confirmation step
  ```
  Note: `POST /api/bookings` will need to also create the `Customer` record if the phone number doesn't already exist (upsert by `phone`, per `Customer.ts`'s unique index) — check whether this logic already exists in `app/api/bookings/route.ts`; if not, add it there rather than in the frontend.

### 1.2 — Public services list (`app/services/page.tsx`)

- Line 31, `const services = [...]` — replace with a fetch from `GET /api/services?isActive=true`.
- **Icon handling:** the current placeholder array stores `service.icon` as an actual React component reference (line ~197, `const Icon = service.icon`). Database records can't store component references. Fix: keep a small client-side map of `category → icon component` (e.g. `{ wash: Droplets, detailing: Sparkles, ... }`) and look up the icon by the fetched `service.category` instead of expecting it from the API.
- Confirm the query filters `isActive: true` at the API level (`app/api/services/route.ts`), not just visually — inactive services should never reach this page at all.

### 1.3 — Admin pages (`app/admin/page.tsx`, `app/admin/bookings/page.tsx`, `app/admin/services/page.tsx`, and others still using placeholder arrays)

Apply the same pattern repo-wide: every `const initial<X> = [...]` / placeholder array in `app/admin/**/page.tsx` gets replaced with a real fetch to its matching `app/api/<x>/route.ts`, and every local-state-only mutation (status change, edit, delete) gets a matching `fetch(..., { method: "PATCH" | "DELETE" })` call. Use the same aggregate-query approach described for `app/admin/page.tsx` in the previous plan (`AdminDash.md`, Part 4, Step 0) if that work hasn't been done yet — this plan and that one overlap here; don't do it twice.

### 1.4 — UX requirements while wiring (per `ui-ux-pro-max`)

Since every save/submit action is now a real network call instead of instant local state, add the feedback these actions now need:
- **Disable the submit/save button during the request** and show a spinner — an async action with zero visual feedback reads as broken, not fast.
- **Show errors near the field or button that failed**, not just in the console — e.g. if `POST /api/bookings` fails because the phone number is malformed, that message belongs next to the phone input, not silently swallowed.
- **Confirm on delete actions** (admin services/bookings/staff) — a real delete now permanently removes a database record; a lost click shouldn't be able to trigger it without confirmation.

**Done when:** filling out the booking wizard on the live site creates a real `Booking` + `Customer` document; editing a service, changing a booking status, or adding a gallery item in `/admin` persists after a page refresh; and every save/delete action shows loading and error states instead of failing silently.

---

## Section 2 — First Admin Lockout (Chicken-and-Egg)

**Why this matters:** `POST /api/users` (the only way to create a staff account) requires the requester to already be logged in as `role: "admin"`. On a fresh database, no such account exists — so there's no way to create the first one through the app itself. This needs a way in that bypasses the app.

### 2.1 — Add a seed script

Create `scripts/seed-admin.ts`:
```typescript
// scripts/seed-admin.ts — creates the first root administrator account.
// Run once against a fresh database: npm run seed:admin
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set — check your .env file.");

  const name = process.env.SEED_ADMIN_NAME || "Admin";
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in your .env before running this script."
    );
  }

  await mongoose.connect(uri);

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    console.log(`Admin already exists for ${email} — nothing to do.`);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await User.create({
    name,
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role: "admin",
    isActive: true,
  });

  console.log(`✅ Root admin created: ${email}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
```

### 2.2 — Wire it up

- Add `dotenv` and `tsx` as dev dependencies (`npm install -D dotenv tsx`) — `tsx` runs TypeScript scripts directly without a separate build step.
- Add to `package.json` scripts:
  ```json
  "seed:admin": "tsx scripts/seed-admin.ts"
  ```
- Add `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` to `.env.example` (see Section 3) as placeholders — **never commit real credentials.**

### 2.3 — Guard against production misuse

Add a check so this can't accidentally create a second silent admin in production without noticing: if `existing` is found for a *different* email but any admin already exists, log a warning like `"An admin account already exists (${otherAdminEmail}) — creating an additional one."` so it's never a silent surprise.

**Done when:** running `npm run seed:admin` once against an empty database creates exactly one working admin login, and running it again is safely a no-op.

*(Optional, per `skill-creator`: if this project or future ones end up needing seed scripts for other first-run data — e.g. default service categories — consider documenting "seed script" as a small reusable pattern/skill rather than solving it fresh each time.)*

---

## Section 3 — Environment Setup

**Why this matters:** without a `.env` file, the app has no idea which MongoDB database to talk to — `lib/db.ts` throws immediately (`if (!MONGODB_URI) throw new Error(...)`), so nothing above can even be tested locally.

### 3.1 — Add `.env.example` (commit this)

Create `sns-website/.env.example`:
```
# MongoDB connection string — get this from your MongoDB Atlas cluster or local instance
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority

# NextAuth / Auth.js
NEXTAUTH_SECRET=replace-with-a-random-32-char-string
NEXTAUTH_URL=http://localhost:3000

# One-time admin seed script (Section 2) — remove real values after first run
SEED_ADMIN_NAME=Admin
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=change-this-before-running
```
Audit the codebase for any other `process.env.X` reads (search `process.env` across `lib/`, `app/api/`) and make sure every variable actually used is listed here.

### 3.2 — Create the real `.env` (do NOT commit)

- Confirm `sns-website/.gitignore` already excludes `.env*` (it does, per the earlier audit) — leave this as-is.
- The agent should **not invent a real `MONGODB_URI`** — this requires an actual MongoDB Atlas cluster (or local MongoDB instance) that only the repo owner can provide. If no `.env` exists yet, stop and ask the user for their connection string rather than guessing or hardcoding a placeholder that looks real.
- Generate a real random value for `NEXTAUTH_SECRET` (e.g. `openssl rand -base64 32`) rather than leaving the example placeholder in place.

**Done when:** `sns-website/.env.example` exists and lists every required variable, and a real (never committed) `.env` exists locally with a working `MONGODB_URI`, letting `npm run dev` connect successfully and `npm run seed:admin` complete.

---

## Section 4 — Large Video Hosting

**Why this matters:** the gallery and loading-screen videos are large binary files. Keeping them in git (even via Git LFS) is fine for day-to-day development, but shipping them from your own deployment means every visitor downloads multi-megabyte video directly from your server/hosting bandwidth — slow for users, and costly on most hosting plans (including Vercel's bandwidth-based pricing).

### 4.1 — Short term (already covered in `fix_claude.md`, Section 1, item 3)
If not already done: set up Git LFS for `*.mp4` so the repo itself stays lean during development.

### 4.2 — Before deployment: move videos to external hosting

- Upload each video (`gallary/*.mp4` and the loading-screen animation) to a media host — **Cloudinary** or **Vercel Blob** are the simplest fits for a Next.js/Vercel deployment.
- Replace local video `src` references (in the gallery components and `LoadingScreen.tsx`) with the hosted URLs.
- Remove the `.mp4` files from the repo (or from `public/videos/` if duplicated there) once hosted versions are confirmed working — no need to keep both a local and hosted copy long-term.
- If using Cloudinary: their free tier and automatic format/quality optimization (auto-served WebM/lower bitrate per device) is a meaningful performance win over serving raw `.mp4` directly, worth using rather than just a plain file host.

**Done when:** no `.mp4` file needs to be downloaded from the app's own deployment — all video sources point to an external host, and repo size no longer includes video binaries at all (LFS or otherwise) once this step is complete.

---

## Suggested Order of Work

1. **NextAuth version fix** (bonus finding) — nothing involving login works until this is right.
2. **Section 3 (Environment Setup)** — needed before anything touching the database can be tested at all.
3. **Section 2 (Seed script)** — needed before any admin login can happen.
4. **Section 1 (Wiring)** — the actual functional gap; test end-to-end once 1–3 are done (submit a real booking, log into `/admin` with the seeded account, confirm it appears).
5. **Section 4 (Video hosting)** — do this before deploying to production; not urgent for local development.
