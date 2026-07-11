# AdminDash.md — S.N.S Admin Dashboard: Prices, Bookings & Services

**Repo audited:** `YoussefEslam29/S.N.S` (branch `main`)
**Scope of this plan:** the three admin areas you asked about — pricing, bookings, and services — plus new ideas for the dashboard overall, plus a direct answer on the MongoDB question.

---

## Part 1 — What's Actually There Right Now (Repo Audit)

Good news first: the foundation is more complete than "a plan" — real Mongoose models and API routes already exist for every core resource:

| Resource | Model | API routes | Admin UI page |
|---|---|---|---|
| Services | `models/Service.ts` ✅ | `app/api/services/` ✅ | `app/admin/services/page.tsx` ✅ |
| Bookings | `models/Booking.ts` ✅ | `app/api/bookings/` ✅ | `app/admin/bookings/page.tsx` ✅ |
| Customers | `models/Customer.ts` ✅ | `app/api/customers/` ✅ | `app/admin/customers/page.tsx` ✅ |
| Time slots | `models/TimeSlot.ts` ✅ | `app/api/timeslots/` ✅ | *(no dedicated admin page yet)* |
| Staff/Users | `models/User.ts` ✅ | `app/api/users/` ✅ | `app/admin/staff/page.tsx` ✅ |
| Gallery | `models/GalleryItem.ts` ✅ | `app/api/gallery/` ✅ | `app/admin/gallery/page.tsx` ✅ |
| Reviews | `models/Review.ts` ✅ | `app/api/reviews/` ✅ | `app/admin/reviews/page.tsx` ✅ |

**The one critical gap:** every admin page — including `bookings/page.tsx`, `services/page.tsx`, and the main `admin/page.tsx` dashboard overview — currently renders from a hardcoded array of placeholder data (literally commented `/* ─── Placeholder data ─── */` and `// TODO: Fetch real data from API`), not from the API routes that already exist. The pieces are all built; they're just not plugged into each other yet.

**This means the highest-value work isn't new features — it's wiring the existing UI to the existing API.** Everything below assumes that's step one, and layers new ideas on top of it.

---

## Part 2 — Database Decision: Is MongoDB the Right Call?

Direct answer: **MongoDB is a reasonable, defensible choice here — not a mistake — but it's not the *only* fit, and it's worth understanding the trade-off you made rather than assuming it was automatic.**

### Where MongoDB genuinely fits well
- Your data has real document-shaped parts: `Service.pricing` (an object per vehicle size), bilingual text fields (`{ en, ar }`), and `Booking.installmentPlan.schedule` (an array of installment objects) all map naturally onto a flexible document, without needing extra join tables.
- Schema flexibility is handy at this stage — you're actively adding fields as the plan evolves (installments, bilingual support), and Mongoose lets you do that without formal migrations.
- At your actual scale (one shop, hundreds not millions of records), performance differences between databases are not a real concern either way.

### Where a relational database (e.g., PostgreSQL) would have had an edge
- Your admin dashboard is fundamentally **reporting-heavy**: "today's bookings with customer name and service price," "revenue this month by service category," "which customers have overdue installments" — these are all joins across Booking → Customer → Service. MongoDB handles this via `.populate()`, but it's simulating relational joins rather than doing them natively; a relational database (with a tool like Prisma) would make these queries and future analytics noticeably more straightforward.
- Money matters (installment payments, revenue totals) are a natural fit for a relational database's stronger transactional guarantees and constraints — MongoDB *can* do multi-document transactions now, but it's an added layer rather than the default behavior.
- If you ever want strict guarantees like "a booking can't reference a service that doesn't exist" enforced by the database itself (not just your application code), that's something relational foreign keys give you for free, and MongoDB does not.

### My recommendation
Given you already have 7 working Mongoose models, matching API routes, and admin UI shaped around them — **don't rewrite this now.** A migration cost here would outweigh the benefit at your current scale. MongoDB will serve you fine through launch and well beyond.

If you were starting from a truly blank repo today, knowing what the admin dashboard actually needs to do (reporting and joins across bookings/customers/services), I'd lean toward **PostgreSQL with Prisma** as the slightly better long-term fit for this specific kind of admin-heavy app. But that's a "next time" note, not a "go fix it" instruction.

---

## Part 3 — New Ideas for the Admin Dashboard

*(Written from your perspective as the person who'll actually use this every day — not a technical spec. This is the ideation the idea-to-plan approach is meant to produce: what would genuinely help you run the shop, described as an experience, not a feature list.)*

### Real-Time Overview, Not a Snapshot
Right now your dashboard homepage shows numbers that never change — "5 bookings today," always. Imagine instead opening the dashboard each morning and seeing the actual count of today's real bookings, live status, and how many are still unconfirmed — the exact thing a shop owner checks first thing, now actually true.

### A Simple Calendar You Can Scan at a Glance
Instead of scrolling a list of bookings, picture a week view where each day shows how full it is — so you instantly know Friday afternoon has three open slots left, without counting rows.

### Price Changes You Can Make in Bulk
When fuel or material costs go up, you shouldn't have to open five separate services and retype five prices. Imagine selecting "all Wash services" and raising every price by a percentage in one action — with the old prices kept on record so you can always see what changed and when.

### A History of Every Price You've Ever Charged
Six months from now, a customer disputes what they paid, or you want to know how much you charged for Ceramic Coating back in March. Instead of guessing, the dashboard keeps a quiet log of every price change, so the answer is always one click away.

### Installment Tracking That Nags for You
For PPF jobs paid in installments, imagine the dashboard simply telling you "2 customers have a payment due this week" — instead of you remembering to check manually or a customer's payment quietly slipping through the cracks.

### One Search Bar for Everything
Instead of separate customer and booking lists, imagine typing a phone number once and instantly seeing that person's name, their car, every past booking, and any pending installment — all in one place, the way you'd actually think about a returning customer.

### A Daily Job Sheet for Your Technicians
Your technicians don't need the full dashboard — just today's list: which car, what service, what time. Imagine printing or displaying a simple daily sheet each morning so the shop floor runs from a clear checklist, not a phone screen.

### Revenue at a Glance
Imagine a simple chart showing how much the shop made this week versus last week, and which service brought in the most money — the kind of thing that turns "I think business is picking up" into "yes, and here's the proof."

### Low-Slot Warnings
Imagine the dashboard quietly flagging "Saturday is almost fully booked" a few days out, so you know to plan staffing or gently steer new bookings elsewhere, instead of finding out the day itself.

### Customer Trust Signals
Imagine seeing, right next to a customer's name, a small note like "3rd visit" or "previously cancelled once" — small context that helps you and your staff treat regulars accordingly without having to remember every face.

---

## Part 4 — Technical Implementation Plan (Prices, Bookings, Services)

*This section is written for your Opus IDE agent to execute directly against the existing codebase. Conventions follow the project's established stack (Next.js App Router, Mongoose, shadcn/ui, Tailwind) — see `nextjs-fullstack-builder` skill for the underlying patterns being applied.*

### Step 0 — Wire existing UI to existing API (do this before anything else)

**Services (`app/admin/services/page.tsx`):**
- Replace the hardcoded placeholder array with a Server Component fetch from `Service.find().lean()` (via `connectDB()`), or a client-side fetch to `GET /api/services` if the page needs to stay `"use client"` for its existing filter/search interactivity.
- Wire the existing create/edit form (if present) to `POST /api/services` and `PATCH /api/services/[id]`.
- Wire delete actions to `DELETE /api/services/[id]`.

**Bookings (`app/admin/bookings/page.tsx`):**
- Replace `initialBookings` placeholder array with real data from `GET /api/bookings` — this endpoint should `.populate("customer service")` so the admin table can show customer name and service name without extra client-side lookups.
- Wire the existing status-change buttons (the `statusFlow` logic already defines valid transitions — keep this, just make it call `PATCH /api/bookings/[id]` with the new status instead of only updating local state).

**Main dashboard (`app/admin/page.tsx`):**
- Replace the hardcoded `stats` and `recentBookings` arrays with real aggregate queries:
  - Today's bookings: `Booking.countDocuments({ date: todayRange })`
  - Pending: `Booking.countDocuments({ status: "pending" })`
  - Completed this week: `Booking.countDocuments({ status: "completed", date: weekRange })`
  - Total customers: `Customer.countDocuments()`
  - Recent bookings: `Booking.find().sort({ date: 1, timeSlot: 1 }).limit(5).populate("customer service").lean()`
- Use `export const dynamic = "force-dynamic"` on this route since it's admin-only, real-time data (per the skill's caching guidance).

**Done when:** every number and row in the admin dashboard reflects the actual database, and none of the three admin pages above contain hardcoded arrays anymore.

---

### Step 1 — Prices

**Goal:** manage pricing safely, in bulk, and with a paper trail.

1. **Bulk price update endpoint** — add `PATCH /api/services/bulk-price` accepting `{ category?: ServiceCategory, percentage: number }` and applying the percentage change to `pricing.sedan/suv/truck` across matching services. Validate `percentage` is a reasonable bounded number (e.g. -50 to +100) before applying.
2. **Price history model** — add `models/PriceHistory.ts`:
   ```typescript
   interface IPriceHistory extends Document {
     service: Types.ObjectId;
     previousPricing: { sedan: number; suv: number; truck: number };
     newPricing: { sedan: number; suv: number; truck: number };
     changedBy: Types.ObjectId; // User
     reason?: string;
     createdAt: Date;
   }
   ```
   Write to this collection inside every `PATCH /api/services/[id]` and the new bulk endpoint, before applying the update.
3. **Admin UI addition** — on `app/admin/services/page.tsx`, add:
   - A "Bulk update" action (select category → enter % → confirm) calling the new endpoint.
   - A small "Price history" expandable row or modal per service, listing past changes from `PriceHistory`.

**Security:** these are write operations affecting revenue — confirm the existing session/role check (admin/receptionist/technician from `User.role`) restricts bulk price changes to `admin` role only, not receptionist or technician.

---

### Step 2 — Bookings

**Goal:** a real-time, conflict-aware booking system, not just a status list.

1. **Wire to `TimeSlot` capacity** — when creating a booking via `POST /api/bookings`, check the corresponding `TimeSlot` document's `currentBookings < capacity` before allowing the booking, and increment `currentBookings` on success (decrement on cancellation). This prevents double-booking a slot beyond its stated capacity.
2. **Calendar view** — add a week-view component to `app/admin/bookings/page.tsx` (or a new `app/admin/calendar/page.tsx`) that groups bookings by date/time-slot visually, using data from `GET /api/bookings?from=&to=`. Add date-range query params to the existing bookings API route if not already supported.
3. **Installment due-date surfacing** — add a query helper (e.g. `GET /api/bookings/installments-due`) that returns bookings where `installmentPlan.schedule` has an entry with `dueDate <= now + 7 days && paid: false`. Surface this as a widget on the main dashboard ("Part 3" idea above).
4. **Mark installment paid** — add `PATCH /api/bookings/[id]/installments/[scheduleIndex]` to mark a specific installment as paid, updating `paidAmount`/`remainingAmount` accordingly.

---

### Step 3 — Services

**Goal:** richer service management beyond basic CRUD.

1. **Reordering** — the `Service.order` field already exists but confirm the admin UI actually lets you drag-reorder services within a category (affects the public site's display order) and calls `PATCH` to persist new `order` values.
2. **Active/inactive toggle wired to public site** — confirm `isActive: false` services are actually excluded from public-facing queries (check `app/services/page.tsx` or wherever the public catalog reads from `Service.find()` — it should filter `{ isActive: true }`).
3. **Installment settings per service** — `installmentsAllowed` and `maxInstallments` already exist on the model; make sure the admin service form actually exposes these fields (relevant mainly for PPF category) rather than only being set at the database level.

---

## Suggested Order of Work

1. **Step 0** first, always — nothing else matters if the dashboard doesn't reflect real data.
2. **Step 1 (Prices)** — bulk update + history, since pricing errors have direct revenue impact.
3. **Step 2 (Bookings)** — capacity checks and installment surfacing, your actual daily operational tool.
4. **Step 3 (Services)** — polish items, lower urgency since core CRUD already works.
5. Revisit **Part 3 ideas** (search bar, job sheet, revenue chart, low-slot warnings, trust signals) once the above is solid — these are genuine value-adds, not urgent fixes.
