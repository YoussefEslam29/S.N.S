# payments.md — S.N.S Car Care: Payment Flow Plan

**Repo:** `YoussefEslam29/S.N.S` (branch `main`)  
**Goal:** Let customers understand how to pay for their booked service without requiring personal data entry on the site. Payment is handled through two simple channels: WhatsApp or Cash on-site.

---

## Overview

S.N.S keeps payment simple and personal. There is no online payment gateway and no stored card data. After a customer books their service (or even before booking), they have two ways to settle their bill:

1. **WhatsApp the Owner** — send payment via digital transfer (Vodafone Cash / InstaPay) after confirming details with the owner through WhatsApp.
2. **Cash at the Shop** — pay directly on the day of service at the Smouha location.

The customer does **not** need to enter any payment info on the website. The site simply presents these two options clearly and gives the customer an easy path to either one.

---

## Why This Approach

- **No PCI/security risk** — no card data, no payment gateway integration, no sensitive data handled by the site.
- **Already how the business works** — the owner communicates through WhatsApp and receives cash. This formalizes that workflow into the website without changing it.
- **Builds trust** — customers know exactly who they're talking to (the owner directly on WhatsApp) before committing.
- **Works for installments too** — PPF installment plans are negotiated and tracked via WhatsApp + in-store, not via automated billing.

---

## Payment Options

### Option 1 — WhatsApp Payment

**How it works:**
- Customer taps the WhatsApp button on the Payment page.
- Opens a pre-filled WhatsApp message to the owner's number: `+20 128 547 6014`
- Customer and owner confirm the service details and pricing via chat.
- Customer transfers the amount digitally (Vodafone Cash, InstaPay, or any mobile wallet) and sends a screenshot.
- Owner confirms receipt and the booking is considered paid.

**Pre-filled WhatsApp message template (English):**
```
Hello! I just booked a service on the S.N.S website and I'd like to pay via WhatsApp. My name is [Name] and I booked [Service] for [Date].
```

**Pre-filled WhatsApp message template (Arabic):**
```
مرحباً! لقد حجزت خدمة على موقع S.N.S وأريد الدفع عبر واتساب. اسمي [الاسم] وحجزت [الخدمة] بتاريخ [التاريخ].
```

**Owner's WhatsApp number:** `+20 128 547 6014`  
**WhatsApp link:** `https://wa.me/201285476014`

---

### Option 2 — Cash at the Shop

**How it works:**
- Customer selects "Cash at the Shop" and simply shows up on the booked date.
- Payment is made in full at the Smouha location when the service is completed.
- No deposit required. No upfront payment needed.

**Shop location:** Smouha, Alexandria, Egypt  
**Working hours:** Saturday – Thursday, 2:00 PM – 12:00 AM  
**Closed:** Friday

---

## Page Design: `/payment` or As Part of Booking Wizard Step 4

### Placement

The payment options are already surfaced in **Step 4** of the booking wizard (`/booking`). The plan here adds an **additional standalone `/payment` page** that:

- Can be linked from the homepage CTA, the footer, and the success screen after booking.
- Acts as a reference page customers can return to at any time to understand their options.
- Is not a checkout form — it contains no form fields or data collection.

### Content Structure (English / Arabic bilingual)

```
[Hero Badge] — "Simple & Secure Payments"

[Headline] — "Pay Your Way — No Fuss"
[Subhead] — "Choose how you'd like to settle your service — digitally via WhatsApp or in cash at our Smouha shop."

[Two Option Cards — side by side on desktop, stacked on mobile]

  ┌──────────────────────────────────────┐   ┌──────────────────────────────────────┐
  │  💬 WhatsApp Payment                 │   │  💵 Cash at the Shop                 │
  │                                      │   │                                      │
  │  Send payment details + screenshot   │   │  Pay in full on the day of service   │
  │  via WhatsApp after booking.         │   │  at our Smouha location.             │
  │                                      │   │                                      │
  │  ✓ Vodafone Cash                     │   │  ✓ No deposit required               │
  │  ✓ InstaPay                          │   │  ✓ Pay after service is done         │
  │  ✓ Any mobile wallet                 │   │  ✓ No online info needed             │
  │                                      │   │                                      │
  │  [WhatsApp Us Now ↗]                 │   │  [Get Directions ↗]                  │
  └──────────────────────────────────────┘   └──────────────────────────────────────┘

[Info Banner]
  "Have questions about your booking or want to discuss installments for PPF?
   Message us on WhatsApp — the owner answers personally."

[Bottom CTA] — "Ready to book?" → [Book Your Session]
```

---

## Component Implementation

### File to Create

**`app/payment/page.tsx`** — New standalone public page, client component.

### Key UI Elements

| Element | Notes |
|---|---|
| `PaymentOptionCard` | Reusable card for each option. Accepts icon, title, desc, bullet points, and a CTA link. |
| WhatsApp CTA | `<a href="https://wa.me/201285476014?text=...">` — opens WhatsApp with pre-filled booking message. |
| Cash CTA | Links to Google Maps for shop directions. |
| Bilingual | Uses `useLanguage()` from `lib/i18n.tsx` for EN/AR switching. |
| Design | Matches existing dark chrome design system: `glass-card`, `bg-surface`, `text-primary` tokens. |
| Animations | Framer Motion `fade-in-up` on cards with stagger. |

### Booking Wizard Integration (Step 4 Update)

The existing Step 4 in `/booking/page.tsx` already shows cash and digital payment method selectors. After this plan:

- **"Digital Payment"** option in Step 4 description is updated to say:  
  _"Pay via Vodafone Cash, InstaPay, or any mobile wallet — confirm details with the owner on WhatsApp after booking."_
- A **"Learn more about payment options"** link is added under Step 4, pointing to `/payment`.
- The **booking success screen** adds: _"To pay via WhatsApp, tap the button below"_ → pre-filled WhatsApp link.

---

## Success Screen Enhancement (Post-Booking)

After a customer completes a booking, the confirmation screen (`isSubmitted === true` in `booking/page.tsx`) should display:

```
✅ Booking Confirmed!

Your booking for [Service] on [Date] at [Time] is saved.

━━━━━━━━━━━━━━━━━━━━━━
Next Step — Pay Your Way:

  [💬 Pay via WhatsApp]     [💵 Cash at Shop — See You There!]
━━━━━━━━━━━━━━━━━━━━━━

Questions? Contact us: +20 115 335 3362
```

---

## Translations to Add to `lib/i18n.tsx`

```typescript
// ── Payment Page ──
"payment.badge":        { en: "Simple & Secure", ar: "بسيط وآمن" },
"payment.title":        { en: "Pay Your Way", ar: "ادفع بطريقتك" },
"payment.subtitle":     { en: "Choose how you'd like to settle your service — no forms, no fuss.", ar: "اختر طريقة دفعك — بدون نماذج أو تعقيد." },
"payment.whatsapp":     { en: "WhatsApp Payment", ar: "الدفع عبر واتساب" },
"payment.whatsappDesc": { en: "Message the owner on WhatsApp, confirm your service, and send your transfer screenshot.", ar: "راسل المالك على واتساب، أكد خدمتك، وأرسل صورة التحويل." },
"payment.cash":         { en: "Cash at the Shop", ar: "نقداً في المركز" },
"payment.cashDesc":     { en: "Pay in full on the day of service at our Smouha location. No deposit needed.", ar: "ادفع كاملاً يوم الخدمة في مركزنا بسموحة. لا يوجد دفعة مقدمة." },
"payment.whatsappCta":  { en: "WhatsApp Us Now", ar: "راسلنا على واتساب" },
"payment.cashCta":      { en: "Get Directions", ar: "احصل على الاتجاهات" },
"payment.infoTitle":    { en: "Questions or installments?", ar: "أسئلة أو تقسيط؟" },
"payment.infoDesc":     { en: "For PPF installment plans or any payment questions, message us on WhatsApp — the owner answers personally.", ar: "لخطط تقسيط PPF أو أي أسئلة عن الدفع، راسلنا على واتساب — المالك يرد شخصياً." },
"payment.bookCta":      { en: "Ready to book?", ar: "جاهز للحجز؟" },
```

---

## Booking Step 4 — Updated Payment Options Text

The payment method labels in `booking/page.tsx` Step 4:

| ID | EN Label | EN Description | AR Label | AR Description |
|---|---|---|---|---|
| `cash` | Cash at the Shop | Pay in full when you visit | نقداً في المركز | ادفع عند زيارتك |
| `digital` | WhatsApp Payment | Pay via Vodafone Cash, InstaPay, or mobile wallet — confirm with the owner on WhatsApp after booking | دفع عبر واتساب | ادفع عبر فودافون كاش أو إنستا باي — أكد التفاصيل مع المالك عبر واتساب |
| `installments` | Installments (3 Payments) | For PPF only — discuss the schedule with the owner on WhatsApp | تقسيط (٣ دفعات) | لـ PPF فقط — ناقش الجدول مع المالك عبر واتساب |

---

## Files to Create / Modify

| Action | File | What Changes |
|---|---|---|
| **CREATE** | `app/payment/page.tsx` | New standalone payment info page |
| **MODIFY** | `lib/i18n.tsx` | Add all `payment.*` translation keys |
| **MODIFY** | `app/booking/page.tsx` | Update Step 4 "digital" description; add `/payment` info link; update success screen with WhatsApp CTA |
| **MODIFY** | `components/layout/Navbar.tsx` | Optionally add "Payment" link in footer nav or keep linked only from booking flow — TBD |

---

## What This Does NOT Include

- No payment gateway (Stripe, PayMob, Fawry, etc.)
- No stored card or banking data
- No customer login or account creation
- No automated receipt emails (future phase)
- No SMS confirmations (future phase)
- No online booking fee or deposit collection

---

## Owner Reference

**Owner WhatsApp:** `+20 128 547 6014`  
**Shop Phone:** `+20 115 335 3362`  
**Location:** Smouha, Alexandria, Egypt  
**Hours:** Sat–Thu, 2 PM – midnight | Closed Friday
