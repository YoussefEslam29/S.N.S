# S.N.S Car Care — Website

The official website for **S.N.S (Swillnspin)** — a premium car care shop in Alexandria, Egypt offering car wash, detailing, ceramic coating, paint protection film (PPF), and window tinting services.

Built with **Next.js 16**, **MongoDB**, **Tailwind CSS 4**, and **Framer Motion**.

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **MongoDB** — a running instance (local or Atlas cluster)
- **npm** 9+

---

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YoussefEslam29/S.N.S.git
   cd S.N.S/sns-website
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and fill in your values. See [`.env.example`](.env.example) for all required variables.

4. **Start the dev server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string (e.g. `mongodb+srv://user:pass@cluster/db`) |
| `NEXTAUTH_SECRET` | Yes | Random secret for NextAuth.js session encryption (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Yes | The canonical URL of your site (e.g. `http://localhost:3000` in dev) |

---

## Project Structure

```
sns-website/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Homepage (hero, services, reviews)
│   ├── services/         # Services listing page
│   ├── booking/          # Booking flow page
│   ├── gallery/          # Gallery & video portfolio
│   ├── reviews/          # Customer reviews
│   ├── admin/            # Admin dashboard (login, bookings, services, gallery, etc.)
│   ├── api/              # API routes (bookings, customers, gallery, reviews, services, users)
│   └── layout.tsx        # Root layout (fonts, navbar, footer, loading screen)
├── components/           # Reusable React components
│   ├── layout/           # Navbar, Footer
│   ├── services/         # VehicleSelector
│   └── LoadingScreen.tsx # Branded loading screen with video animation
├── lib/                  # Shared utilities
│   ├── auth.ts           # NextAuth.js configuration (credentials provider)
│   ├── db.ts             # MongoDB connection singleton
│   └── utils.ts          # Formatting helpers (prices, etc.)
├── models/               # Mongoose schema definitions
│   ├── Booking.ts
│   ├── Customer.ts
│   ├── GalleryItem.ts
│   ├── Review.ts
│   ├── Service.ts
│   └── User.ts
└── public/               # Static assets (logos, videos)
```

---

## Product Context

For the full product plan — features, branding, user flows, and business rationale — see [`THE_PLANS/idea.md`](../THE_PLANS/idea.md).

---

## License

This project is licensed under the **GNU General Public License v3.0** — see the [LICENSE](../LICENSE) file for details.
