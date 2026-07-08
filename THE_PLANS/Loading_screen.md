# S.N.S Car Care — Loading Screen Plan

**File**: `THE_PLANS/Loading_screen.md`  
**Feature**: Website Loading Screen  
**Prepared**: 2026-07-08

---

## Overview

When a visitor first opens the S.N.S Car Care website, instead of seeing a blank white/dark flash, they see a **branded, cinematic loading screen** that plays the car animation video while the page hydrates in the background. Once the page is ready (or after a minimum display time), the loading screen smoothly fades away to reveal the full website.

This is consistent with the brand promise: **premium, high-end, luxury garage feel**. A blank loading state would undercut that first impression instantly.

---

## Brand Alignment (from `idea.md` & `README.md`)

The loading screen must match the established S.N.S brand identity:
- **Dark background**: Deep navy `#0A0E17` — matches the main site background
- **Primary accent**: Blue-chrome `#3B82F6` 
- **Chrome/metallic accents**: `#C0C8D4` → `#E2E8F0`
- **Font**: Outfit (headings) and Inter (body)
- **Tagline**: "Care. Shine. Defend."
- **Mood**: Premium, luxury garage, dark mode, cinematic

---

## The Loading Screen Design

### Layer Stack (Bottom → Top)

1. **Full-screen dark backdrop** — `#0A0E17` background color matching the website
2. **The car animation video** — centered, covers most of the screen viewport, plays on a loop
3. **Subtle gradient overlay** — dark vignette around the edges to blend the video into the dark background
4. **Bottom HUD** — progress bar, status text, and brand tagline
5. **S.N.S Logo** — in the top-left or centered at top, small, clean
6. **Particle/shimmer decorations** — subtle CSS chrome shimmer lines to evoke the brushed-steel brand aesthetic

### Visual Hierarchy

```
┌────────────────────────────────────────────────┐
│  [S.N.S LOGO]                     [PREMIUM TAG] │
│                                                  │
│         ╔══════════════════════╗                │
│         ║                      ║                │
│         ║   CAR ANIMATION      ║                │
│         ║      VIDEO           ║                │
│         ║   (8 sec loop)       ║                │
│         ║                      ║                │
│         ╚══════════════════════╝                │
│                                                  │
│  [═══════════════════════════════] Loading...   │
│         "Care. Shine. Defend."                  │
└────────────────────────────────────────────────┘
```

---

## Animation Behavior

### Phase 1: Entry (0ms → 300ms)
- Loading screen **fades in** with opacity from 0 → 1
- Logo slides down from above with Framer Motion
- Progress bar appears from left

### Phase 2: Video Play & Progress (300ms → ~2500ms minimum)
- Video plays (muted, autoPlay, loop, playsInline) — car animation cycling
- Progress bar fills from 0% → 100% over a minimum of **2.5 seconds** (even if page loads faster)
- Percentage counter increments from `0%` → `100%`
- Status text cycles through messages:
  1. "Initializing premium experience..."
  2. "Loading services..."
  3. "Preparing your garage..."
  4. "Almost ready..."

### Phase 3: Completion & Fade-Out
- Once both conditions are met (page is ready **AND** minimum 2.5s has passed):
  - Progress bar completes to 100%
  - Brief pause (300ms)
  - Loading screen **fades out** smoothly over 600ms using Framer Motion `AnimatePresence`
  - Page content becomes interactive

---

## Technical Implementation

### Component: `LoadingScreen.tsx`
Create `sns-website/components/LoadingScreen.tsx` — a client component with:
- `motion.div` wrapper with `AnimatePresence` for the exit fade-out
- HTML5 `<video>` for the animation (`LOADING_SCREEN ANIMATION.mp4`)
- CSS `@keyframes` progress bar animation
- `useEffect` with `Promise.all([minimumDelay, window.load event])` to trigger completion

### Integration: `app/layout.tsx`
Wrap the main body with the `LoadingScreen` component. The loading screen renders above all content using `position: fixed` and `z-index: 9999`.

### Asset: Copy Video
Copy `gallary/LOADING_SCREEN ANIMATION.mp4` → `public/videos/loading-screen.mp4`

### State Logic (in `LoadingScreen.tsx`)
```
1. Component mounts → start timer (2500ms minimum)
2. Window 'load' event fires → mark page as loaded
3. When BOTH conditions are met → trigger exit animation
4. After exit animation completes (600ms) → remove component from DOM
```

---

## Files to Create / Modify

| File | Action | Description |
|------|--------|-------------|
| `public/videos/loading-screen.mp4` | **NEW** (copy) | The 8-second car animation video |
| `components/LoadingScreen.tsx` | **NEW** | The full loading screen component |
| `app/layout.tsx` | **MODIFY** | Import and render `<LoadingScreen>` |
| `docs.md` | **UPDATE** | Log the new loading screen feature |

---

## Accessibility & Performance

- **Reduced Motion**: If `prefers-reduced-motion` is detected, the video will not play and the loading screen will dismiss after a shorter delay (1s)
- **Video**: Muted, no audio, looped — will not interrupt the user
- **Minimum time**: 2.5s ensures users always see the brand for a moment even on fast connections
- **Maximum time**: The component falls back to hiding after 8s if `window.load` never fires (failsafe)

---

## What Makes This Premium

- The car animation video is a **real S.N.S branded asset** — not a generic spinner
- The progress bar uses the brand's primary blue `#3B82F6` with a `box-shadow` chrome-glow
- The entire screen matches the exact dark navy / chrome color palette from `globals.css`
- The tagline `"Care. Shine. Defend."` is reinforced in the user's first second on the site
- The exit animation is a **smooth fade**, not a jarring flash or abrupt disappearance
