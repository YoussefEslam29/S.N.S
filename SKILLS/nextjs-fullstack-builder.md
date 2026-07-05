---
name: nextjs-fullstack-builder
description: 'Full-stack project workflow for Next.js (App Router) + MongoDB (Mongoose) + shadcn/ui + Tailwind CSS. Use when: scaffolding a new Next.js project, adding features, creating API routes, defining Mongoose models, styling with shadcn or Tailwind, handling auth, or following best practices for this stack. Triggers: "new project", "next.js", "shadcn", "mongoose", "mongodb", "api route", "server component", "build feature", "fullstack builder".'
argument-hint: 'Describe the feature or task to build (e.g. "product CRUD", "auth setup", "data table page")'
---
 
# Next.js + MongoDB + shadcn/ui — Full-Stack Skill
 
## When to Use
- Scaffolding a new Next.js App Router project from scratch
- Adding a new page, feature, or API route to an existing project
- Defining or extending a Mongoose model
- Styling a component using shadcn/ui and Tailwind CSS
- Following consistent conventions for this stack
---
 
## Phase 1 — Project Setup
 
### 1.1 Scaffold
 
```bash
npx create-next-app@latest <project-name> \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --yes
```
 
### 1.2 Install shadcn/ui
 
```bash
cd <project-name>
npx shadcn@latest init
```
 
When prompted, choose:
- Style: **Default**
- Base color: match the project palette
- CSS variables: **Yes**
### 1.3 Add shadcn components you need
 
```bash
npx shadcn@latest add button badge card input label textarea select sheet separator
# Add more as needed: table dialog dropdown-menu toast tabs
```
 
> **Rule:** Never edit files in `components/ui/`. They are auto-generated. Create wrapper components in `components/` outside `ui/` for custom variants.
 
### 1.4 Install Mongoose
 
```bash
npm install mongoose
```
 
### 1.5 Environment variables
 
Create `.env.local` (never commit):
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/<db>?retryWrites=true&w=majority
```
 
Create `.env.example` (commit this):
```
MONGODB_URI=
```
 
---
 
## Phase 2 — Folder Structure
 
```
project/
├── app/
│   ├── layout.tsx          # Root layout (font, Navbar, Footer)
│   ├── page.tsx            # Homepage
│   ├── globals.css
│   ├── <feature>/
│   │   ├── page.tsx        # Public page
│   │   ├── loading.tsx     # Skeleton UI
│   │   ├── error.tsx       # Error boundary
│   │   └── [id]/page.tsx   # Dynamic route
│   ├── admin/
│   │   ├── layout.tsx      # Admin shell + sidebar
│   │   ├── page.tsx        # Stats/dashboard
│   │   └── <resource>/     # CRUD pages
│   └── api/
│       └── <resource>/
│           ├── route.ts        # GET (list), POST (create)
│           └── [id]/route.ts   # GET, PATCH, DELETE by ID
├── components/
│   ├── layout/             # Navbar, Footer, Shell
│   └── ui/                 # shadcn primitives — DO NOT EDIT
├── models/
│   └── MyModel.ts          # Mongoose schemas
├── lib/
│   ├── db.ts               # MongoDB connection (global cache)
│   └── utils.ts            # shadcn cn() and helpers
└── public/
```
 
**Rule:** Do not create a file unless necessary. Ask "Can this be added to an existing file?"
 
---
 
## Phase 3 — Database Layer
 
### 3.1 `lib/db.ts` — connection singleton
 
```typescript
import mongoose from "mongoose";
 
const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined");
 
// @ts-ignore
let cached = global.mongoose as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
if (!cached) cached = (global as any).mongoose = { conn: null, promise: null };
 
export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```
 
### 3.2 Mongoose model pattern
 
```typescript
// models/MyModel.ts
import mongoose, { Schema, model, models, type Document } from "mongoose";
 
export interface IMyModel extends Document {
  name: string;
  status: "active" | "inactive";
}
 
const MyModelSchema = new Schema<IMyModel>(
  {
    name: { type: String, required: true, maxlength: 200 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);
 
// Indexes
MyModelSchema.index({ status: 1, createdAt: -1 });
 
export const MyModel =
  (models.MyModel as mongoose.Model<IMyModel>) ||
  model<IMyModel>("MyModel", MyModelSchema);
```
 
### 3.3 Query best practices
 
```typescript
// ✅ .lean() for read-only — returns plain JS objects
const items = await MyModel.find(filter).lean();
 
// ✅ Select only needed fields
const items = await MyModel.find().select("name status createdAt").lean();
 
// ✅ Always paginate
const items = await MyModel.find().skip(page * limit).limit(limit).lean();
 
// ✅ Validate ObjectId before querying
if (!mongoose.Types.ObjectId.isValid(id)) {
  return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
}
```
 
---
 
## Phase 4 — API Routes
 
### 4.1 Collection route (`app/api/<resource>/route.ts`)
 
```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { MyModel } from "@/models/MyModel";
 
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const items = await MyModel.find().select("-__v").limit(100).lean();
    return NextResponse.json({ data: items });
  } catch (error) {
    console.error("[GET /api/resource]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
 
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
 
    // Validate & sanitize — never pass body directly to model
    const name = String(body.name ?? "").trim().slice(0, 200);
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
 
    const item = await MyModel.create({ name });
    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/resource]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```
 
### 4.2 Item route (`app/api/<resource>/[id]/route.ts`)
 
```typescript
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { MyModel } from "@/models/MyModel";
 
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
 
  await connectDB();
  const item = await MyModel.findById(id).lean();
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: item });
}
 
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
 
  await connectDB();
  const body = await req.json();
  const update: Record<string, unknown> = {};
  if (body.name !== undefined) update.name = String(body.name).trim().slice(0, 200);
 
  const item = await MyModel.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: item });
}
 
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
 
  await connectDB();
  const item = await MyModel.findByIdAndDelete(id).lean();
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: { success: true } });
}
```
 
### 4.3 HTTP status code reference
 
| Situation | Code |
|-----------|------|
| Success with data | 200 |
| Resource created | 201 |
| Validation error | 400 |
| Unauthenticated | 401 |
| Forbidden | 403 |
| Not found | 404 |
| Server error | 500 |
 
### 4.4 Protecting admin API routes
 
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
 
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // ...
}
```
 
---
 
## Phase 5 — Frontend Patterns
 
### 5.1 Server Components first
 
Default: every component is a **Server Component**. Add `"use client"` only for:
- `useState` / `useEffect`
- Browser APIs
- Direct event handlers
- `useSearchParams()`, `useRouter()`, `usePathname()`
### 5.2 Props typing
 
```typescript
interface MyComponentProps {
  id: string;
  name: string;
  status: "active" | "inactive";
}
 
export function MyComponent({ id, name, status }: MyComponentProps) { ... }
```
 
### 5.3 Images
 
```typescript
import Image from "next/image";
 
// Fixed size
<Image src="/logo.png" alt="Logo" width={120} height={40} priority />
 
// Fill container (catalog grids, hero images)
<Image
  src={photo}
  alt={name}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
  className="object-cover"
/>
```
 
### 5.4 Loading states (`app/<route>/loading.tsx`)
 
```tsx
export default function Loading() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-72 bg-[#111111] rounded-[4px] animate-pulse" />
        ))}
      </div>
    </div>
  );
}
```
 
### 5.5 Error boundaries (`app/<route>/error.tsx`)
 
```tsx
"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="text-center py-24">
      <p className="text-[#888888]">Something went wrong.</p>
      <button onClick={reset} className="mt-4 text-[#CC1818] underline">Try Again</button>
    </div>
  );
}
```
 
### 5.6 Caching / revalidation
 
```typescript
// Public pages — ISR
export const revalidate = 60;
 
// Admin / dynamic pages
export const dynamic = "force-dynamic";
```
 
### 5.7 Parallel data fetching
 
```typescript
const [products, categories] = await Promise.all([fetchProducts(), fetchCategories()]);
```
 
---
 
## Phase 6 — Styling Conventions
 
### 6.1 Non-negotiables
 
- Use brand color tokens from the project design system — **not** generic Tailwind colors like `gray-900`
- Radius: `rounded-[4px]` for buttons, cards, inputs. Never `rounded-xl` or `rounded-2xl`
- No gradients, no shadows except intentional glow effects
- Standard container: `max-w-[1280px] mx-auto px-4 md:px-8`
### 6.2 shadcn navigation buttons (no `asChild`)
 
The shadcn Button in newer setups may not support `asChild`. Use styled `<Link>` directly:
 
```tsx
import Link from "next/link";
<Link
  href="/catalog"
  className="inline-flex items-center justify-center h-9 px-4 bg-[#CC1818] hover:bg-[#B01414] text-white font-bold rounded-[4px] text-sm transition-colors"
>
  Browse Now
</Link>
```
 
### 6.3 shadcn wrapper pattern (custom variants)
 
```tsx
// components/PrimaryButton.tsx — never edit components/ui/button.tsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
 
export function PrimaryButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn("bg-[#CC1818] hover:bg-[#B01414] text-white font-bold rounded-[4px]", className)}
      {...props}
    />
  );
}
```
 
---
 
## Phase 7 — Security
 
| Threat | Mitigation |
|--------|-----------|
| NoSQL Injection | Never pass `req.body` directly to a Model. Extract and type each field explicitly. |
| XSS | Next.js escapes JSX. Never use `dangerouslySetInnerHTML` with user input. |
| CSRF | Covered by SameSite cookies + Next.js built-in defenses. |
| Sensitive Data | Use `.select("-password -__v")`. Never return internal fields. |
| Broken Access Control | Protect all admin API routes with session checks. |
| Secrets | Keep in `.env.local` only. Never use `NEXT_PUBLIC_` for secrets. |
 
```typescript
// ✅ Explicit field extraction
const name = String(body.name ?? "").trim().slice(0, 200);
const ALLOWED = ["active", "inactive"] as const;
if (!ALLOWED.includes(body.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
 
// ❌ Never — NoSQL injection / mass assignment risk
await MyModel.create(body);
```
 
---
 
## Phase 8 — Coding Conventions
 
### TypeScript
 
```typescript
// ✅ Explicit types — no `any`
const fetchItem = async (id: string): Promise<IMyModel | null> => { ... };
type Status = "active" | "inactive";
 
// ❌ Never
const handle = (data: any) => { ... };
```
 
### File naming
 
| Type | Convention |
|------|-----------|
| Pages | lowercase (`page.tsx`) |
| Components | PascalCase (`ProductCard.tsx`) |
| Utilities | camelCase (`formatPrice.ts`) |
| Models | PascalCase (`Product.ts`) |
| API routes | lowercase (`route.ts`) |
 
### Import order
 
```typescript
// 1. External packages
import { NextRequest, NextResponse } from "next/server";
// 2. Internal aliases
import { connectDB } from "@/lib/db";
import { MyModel } from "@/models/MyModel";
// 3. Types
import type { IMyModel } from "@/models/MyModel";
```
 
---
 
## Phase 9 — Git Workflow
 
### Commit format
 
```
feat: add product listing page
fix: correct pagination on catalog
style: adjust card spacing on mobile
refactor: extract ProductCard component
docs: update readme
```
 
### Branches
 
```
main     ← production (never push directly)
dev      ← integration
feat/*   ← new features
fix/*    ← bug fixes
```
 
---
 
## Phase 10 — Documentation After Every Iteration
 
After completing any edit, feature, or fix, update the relevant docs in the codebase before considering the task done.
 
### What to update
 
| Change made | Doc to update |
|-------------|--------------|
| New page or route | `README.md` — add to the route table |
| New API endpoint | `README.md` or `DEVELOPER-GUIDE.md` — add method, path, params, response shape |
| New Mongoose model | `DEVELOPER-GUIDE.md` or inline JSDoc on the schema fields |
| New component | Add a usage example as a comment block at the top of the file |
| Changed env variable | `.env.example` — keep it in sync |
| New npm dependency | `README.md` — note it under Tech Stack if it's a major addition |
| Significant refactor | Update folder structure section in `DEVELOPER-GUIDE.md` |
 
### Inline code docs (minimum standard)
 
```typescript
// ✅ Every exported function gets a one-line description
/** Returns all active products sorted by creation date, newest first. */
export async function getActiveProducts() { ... }
 
// ✅ Non-obvious logic gets an inline comment explaining WHY, not WHAT
// Prevent "Cannot overwrite model" error during Next.js hot reload
export const MyModel = (models.MyModel as mongoose.Model<IMyModel>) || model<IMyModel>(...);
 
// ✅ Every API route file starts with a route summary comment
// GET  /api/products        — list all products (public)
// POST /api/products        — create a product (admin only)
```
 
### Keeping DEVELOPER-GUIDE.md current
 
If a project has a `DEVELOPER-GUIDE.md`, treat it as a living document:
- Add new conventions as they are established
- Remove rules that no longer apply
- Update code examples to reflect the current codebase
> **Rule:** A feature is not complete until the docs reflect it. "Code first, docs now" — not later.
 
---
 
## Pre-commit Checklist
 
```
□ Colors use project design tokens — no raw Tailwind palette colors
□ Buttons use rounded-[4px], not rounded-xl or rounded-2xl
□ All user input is validated, trimmed, and length-limited
□ No `any` in TypeScript
□ connectDB() called before every Mongoose query
□ No secrets in NEXT_PUBLIC_ variables
□ Images use next/image with explicit width/height or fill+sizes
□ Server Components are the default — "use client" only when required
□ No dangerouslySetInnerHTML with user-controlled content
□ req.body never passed directly to a Mongoose model
□ ObjectId validated before findById queries
□ Admin API routes protected with session checks
□ .env.local is in .gitignore
```
 