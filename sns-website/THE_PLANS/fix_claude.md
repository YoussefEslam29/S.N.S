# fix_claude.md — S.N.S Website: Issues to Fix

**Repo:** `YoussefEslam29/S.N.S`
**Context:** This repo was audited (README, code structure, models, components) and the issues below were found. Work through them in priority order. Each item lists: the problem, the exact file(s) involved, and what "done" looks like.

---

## 🔴 P0 — Fix First

### 1. Logo is unusable as a favicon and navbar mark
**Problem:** `app/icon.jpg` and `public/logo.jpg` are both the same full illustrated banner (750×606px — technician, car, shield, all in one scene). This is used directly as:
- The favicon (`app/icon.jpg`) — illegible at 16–32px.
- The navbar logo (`components/layout/Navbar.tsx`, `<Image src="/logo.jpg" ... className="h-10 md:h-12 w-auto" />`) — the whole detailed scene gets squeezed into a 40–48px-tall strip.

**What to do:**
- Create a **simplified square icon** (just the shield emblem, or a monogram/wordmark on its own) sized properly for favicon use (e.g. 512×512 source, Next.js will generate the rest). Replace `app/icon.jpg`.
- Create a **cropped horizontal lockup** for the navbar — wordmark ("S.N.S") plus optionally a small emblem, no illustrated scene — and replace what `public/logo.jpg` points to in `Navbar.tsx`.
- Keep the full illustrated banner for places where it fits properly at large size (e.g. homepage hero, `public/hero-logo.png` is already 4400×2400 and likely fine there — verify it's not also being squeezed).
- **Note:** if no simplified logo assets exist yet, flag this back to the user rather than auto-cropping the illustration — a naive crop/resize will still look muddy. This needs an actual redesigned asset.

**Done when:** the browser tab icon is crisp and readable at normal tab size, and the navbar logo reads clearly without squinting.

---

### 2. `sns-website/README.md` is still default `create-next-app` boilerplate
**Problem:** File still contains generic "This is a Next.js project bootstrapped with `create-next-app`..." content — no mention of S.N.S, no setup instructions specific to this project.

**What to do:** Replace with a real developer README covering:
- One-line project description (S.N.S car care website)
- Prerequisites (Node version, MongoDB)
- Required environment variables (see item 6 below) — reference `.env.example`
- `npm install`, `npm run dev` steps
- Brief note on folder structure (`app/`, `models/`, `components/`, `app/admin/`)
- Link back to `THE_PLANS/idea.md` for product context

**Done when:** a new developer cloning the repo can get the dev server running from this file alone, without guessing env vars.

---

### 3. Large video files committed directly to git
**Problem:** `gallary/` contains ~34MB of `.mp4` files (`1-cc edit video.mp4`, `2-cc edit video POLANDPRO.mp4`, `3-cc edit video PRO.mp4`, `3-cc edit video.mp4`, `LOADING_SCREEN ANIMATION.mp4`) committed as regular blobs. Every clone downloads all of this, and git history keeps every version forever, growing over time.

**What to do:**
- Move these video files out of plain git tracking. Two options:
  - **Preferred:** Host them externally (Vercel Blob, Cloudinary, YouTube unlisted, or S3) and reference by URL in the code/plans. Remove from repo entirely.
  - **If they must stay in git:** set up **Git LFS** for `*.mp4` before re-adding them.
- Check `sns-website/public/videos/` too — confirm whether production video assets used by `LoadingScreen.tsx` are duplicated from `gallary/` and consolidate to one location using the same approach.

**Done when:** `git clone` of the repo is meaningfully smaller, and video assets are either LFS-tracked or served from an external URL.

---

## 🟡 P1 — Fix Soon

### 4. Duplicate planning docs at root and in `THE_PLANS/`
**Problem:** `README.md` and `idea.md` exist identically both at repo root and inside `THE_PLANS/`.

**What to do:**
- Keep `THE_PLANS/idea.md` as the canonical planning doc location.
- Keep the root `README.md` as the public-facing portfolio README (the one with badges, features, branding table).
- Delete the duplicate copy from whichever location doesn't match its purpose (delete `THE_PLANS/README.md` if it's identical to root; do not duplicate `idea.md` at root — link to `THE_PLANS/idea.md` from the root README instead, as it already does).

**Done when:** each file exists in exactly one place, with the root README linking to `THE_PLANS/idea.md` rather than containing a copy.

---

### 5. Folder name typo: `gallary` → `gallery`
**Problem:** Top-level folder is misspelled `gallary` (should be `gallery`).

**What to do:** Rename the folder and update any references to its path in code, docs, or the loading-screen plan (`THE_PLANS/Loading_screen.md` references brand assets — check it doesn't hardcode the old path).

**Done when:** folder is renamed and nothing references the old path.

---

### 6. Missing `.env.example`
**Problem:** `.env*` is correctly gitignored (good — no secrets leaked), but there's no template showing which environment variables are required. `lib/db.ts` requires `MONGODB_URI`; `lib/auth.ts`/NextAuth likely needs `NEXTAUTH_SECRET` and `NEXTAUTH_URL` too.

**What to do:** Add `sns-website/.env.example` listing every required variable with placeholder values, e.g.:
```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
NEXTAUTH_SECRET=replace-with-a-random-secret
NEXTAUTH_URL=http://localhost:3000
```
Audit the codebase for any other `process.env.X` reads and make sure all are listed.

**Done when:** `.env.example` exists and covers every environment variable the app actually reads.

---

### 7. Arabic language switch not implemented
**Problem:** The product plan (`THE_PLANS/idea.md`) specifies a bilingual site (English/Arabic with a switch). `app/layout.tsx` already loads `IBM_Plex_Sans_Arabic` as a font, but `lang="en"` is hardcoded in the `<html>` tag and there's no locale routing, no language toggle UI, and no translated copy anywhere in `app/`.

**What to do:**
- Decide on an approach: Next.js App Router i18n routing (`app/[locale]/...`) is the standard pattern, or a simpler client-side toggle with a translation dictionary if full routing is overkill for now.
- Add a language switch control to `Navbar.tsx`.
- At minimum, translate the core public pages (`app/page.tsx`, `app/services`, `app/booking`, `app/gallery`, `app/reviews`) — admin dashboard can stay English-only for now unless told otherwise.
- Set `dir="rtl"` conditionally when Arabic is active, since Arabic requires right-to-left layout — check this doesn't break the existing Tailwind layout.

**Done when:** a visitor can switch the site language and see translated content with correct text direction.

---

## 🟢 P2 — Cleanup

### 8. `SKILLS/` folder and `AGENTS.md`/`CLAUDE.md` look like leftover AI tooling config, not project content
**Problem:** `SKILLS/nextjs-fullstack-builder.md`, `SKILLS/ui-ux-SKILL.md`, `sns-website/AGENTS.md`, and `sns-website/CLAUDE.md` are AI-coding-assistant configuration/instruction files, not something a portfolio visitor or collaborator needs to see in the shipped repo.

**What to do:** Confirm with the repo owner whether these should stay (useful if you keep using AI coding tools on this project) or be removed/gitignored from the public view. If kept, consider moving them under a clearly-labeled `.ai/` or `tooling/` folder so they don't read as part of the product.

**Done when:** a decision is made and applied consistently — either these files are clearly separated from product code, or removed.

---

### 9. Confirm license choice
**Problem:** Repo ships a GPLv3 `LICENSE`. GPL requires derivative works that are distributed to also be open-sourced under GPL — an unusual choice for a commercial business's client-facing website code.

**What to do:** Confirm with the repo owner whether GPLv3 was an intentional choice. If this is meant to just be a portfolio piece rather than an open-source project others should freely fork/reuse commercially, consider switching to something like an "all rights reserved" notice, or MIT if open reuse is genuinely fine.

**Done when:** license reflects the owner's actual intent.

---

## Suggested Order of Work

1. P0 items (1–3) — these affect first impressions and repo health immediately.
2. P1 items (4–7) — cleanup and the Arabic language gap, which is a real product requirement, not just polish.
3. P2 items (8–9) — housekeeping, can be done whenever convenient.

Do not mark an item done without meeting its "Done when" criteria above — several of these (especially the logo, item 1) require new visual assets that may need to come from the repo owner rather than being generated automatically.
