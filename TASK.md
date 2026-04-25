# Split The Bill - Project Task Plan

## Vision

A QR-based pay-at-table solution for restaurants. Customers scan a QR code on their table, view the itemized bill, split it however they want, tip, and pay — all in under 30 seconds, no app download required.

---

## Market Research Summary

### Key Competitors & What They Do Best

| Player           | Strength                                                             | Lesson for Us                                                   |
| ---------------- | -------------------------------------------------------------------- | --------------------------------------------------------------- |
| **Sunday**       | 10-second checkout, 3-mode splitting, post-payment review collection | The gold standard flow — scan → bill → split → tip → pay → done |
| **me&u**         | Multi-vendor food halls, mixed payment methods, AI recommendations   | Mixed payments & loyalty are strong differentiators             |
| **Splitwise**    | Item-by-item assignment UX, debt simplification                      | Best "who had what" splitting interface                         |
| **Toast/Square** | Seat-based ordering on POS, deep integrations                        | Server-side seat assignment makes splitting effortless          |
| **Wetherspoons** | Each person orders independently — avoids splitting entirely         | Per-person ordering eliminates the splitting problem            |
| **Obypay**       | European market focus, GDPR-first, Stripe-powered                    | Local compliance and local payment methods matter               |

### Critical UX Benchmarks (Industry Standard)

- **Time to pay (no split, Apple Pay):** < 10 seconds
- **Time to pay (with split):** < 30 seconds
- **Taps to pay (minimum path):** 3–4
- **Taps to pay (with split):** 5–7
- **Page load after QR scan:** < 2 seconds
- **Required fields before payment:** ZERO (no account, no email, no phone)
- **Scan-to-paid completion rate target:** 75%+
- **Tip uplift with pre-selected amounts:** +50% to +150% vs. no prompt

### Core Flow (Validated by Market Leaders)

```
QR Scan → Instant Bill View → [Optional: Split] → Tip → Pay → Confirmation
```

### Three Splitting Modes (Must-Have)

1. **Equal Split** — divide by N people (~60% of use cases)
2. **Item-Based Split** — each person selects their items (~5%, but expected by users)
3. **Custom Amount** — enter any amount (~10%)

---

## Phase 1: Foundation & Core Payment Flow

> Goal: A customer can scan a QR, see a bill, and pay it in full — the "happy path."

### 1.1 Project Setup

- [ ] Initialize Next.js project with TypeScript
- [ ] Configure Tailwind CSS with custom design tokens (color palette, typography, spacing)
- [ ] Set up PWA manifest and service worker (installable, no app store)
- [ ] Configure ESLint, Prettier, Husky pre-commit hooks
- [ ] Set up project folder structure (`/app`, `/components`, `/lib`, `/hooks`, `/types`)

### 1.2 Design System & Tokens

- [ ] Define color palette:
  - Primary: Deep teal/blue (#0D9488 range) — trust, calm, financial
  - Accent: Warm amber/gold — CTAs, highlights, success
  - Neutrals: Warm grays — backgrounds, cards, dividers
  - Semantic: Green (success), Red (error), Amber (warning)
- [ ] Define typography scale (Inter or similar clean sans-serif)
  - Currency amounts: Bold, tabular figures, large (24–32px)
  - Body: 16px minimum (prevents iOS zoom)
  - Labels: 14px, medium weight
- [ ] Define spacing scale (4px base grid)
- [ ] Define border radius tokens (soft, rounded — 12px cards, 8px buttons)
- [ ] Build base components: Button, Card, Input, Badge, Divider, BottomSheet
- [ ] Ensure all touch targets are 48x48px minimum

### 1.3 QR Scan Landing Page

- [ ] Build the landing page that loads after QR scan
- [ ] Parse table ID and session from QR code URL params
- [ ] Show restaurant name, logo, and table number at top
- [ ] Display loading skeleton while fetching bill data
- [ ] Handle error states: invalid QR, expired session, table not found

### 1.4 Bill View Screen

- [ ] Itemized bill display — grouped by course (starters, mains, desserts, drinks)
- [ ] Each item: name, quantity, unit price, subtotal
- [ ] Running total always visible (sticky footer or bottom bar)
- [ ] Show tax and service charge as separate line items
- [ ] Smooth entrance animation (staggered fade-in for items)

### 1.5 Tip Selection

- [ ] Three preset buttons: 10%, 15%, 20% — showing both % and absolute amount
- [ ] "Custom" option opens a numeric input
- [ ] "No tip" option — always visible, never hidden
- [ ] Middle option (15%) pre-selected by default
- [ ] Tip amount updates the total in real time

### 1.6 Payment Screen

- [ ] Apple Pay / Google Pay as primary (1-tap biometric payment)
- [ ] Credit/debit card form as fallback (clean, minimal fields)
- [ ] Show final total clearly before payment confirmation
- [ ] Loading state during payment processing (subtle animation, not a spinner)

### 1.7 Confirmation Screen

- [ ] Success state with satisfying checkmark animation
- [ ] Payment summary: items, tip, total paid
- [ ] "Email receipt" option (optional, not required)
- [ ] "Leave a review" prompt (link to Google Reviews)
- [ ] "Done" button that closes the session

---

## Phase 2: Bill Splitting

> Goal: Multiple people at the same table can each pay their share.

### 2.1 Split Mode Selection

- [ ] After viewing the bill, "Split the bill" button opens a bottom sheet
- [ ] Three clear options with icons:
  - **Split equally** — "Divide evenly between everyone"
  - **Split by item** — "Each person picks what they had"
  - **Custom amounts** — "Enter how much each person pays"

### 2.2 Equal Split Flow

- [ ] Number selector: "How many people?" (stepper or quick-select 2/3/4/5/6+)
- [ ] Show per-person amount in real time as number changes
- [ ] Handle rounding: last person pays the remainder (show exact amounts)
- [ ] Shared items (like a bottle of wine) divided equally by default
- [ ] "Pay your share" button leads to tip → payment flow

### 2.3 Item-Based Split Flow

- [ ] Each bill item becomes selectable (checkbox or tap-to-claim)
- [ ] Visual feedback: claimed items show the person's avatar/color
- [ ] "Shared" toggle per item — marks it for equal division among all
- [ ] Running "your share" total updates as items are selected
- [ ] Handle the sequential model: first payer claims items and pays, remaining balance shown to next scanner
- [ ] Unclaimed items section clearly visible

### 2.4 Custom Amount Split

- [ ] Input field: "How much do you want to pay?"
- [ ] Show remaining balance after your amount
- [ ] Prevent overpayment (amount can't exceed remaining)
- [ ] "Pay the rest" shortcut button

### 2.5 Multi-Payer Session Management

- [ ] When one person pays, the bill updates for subsequent scanners
- [ ] Show: "₼X paid · ₼Y remaining" status bar
- [ ] Paid items visually grayed out or marked with a check
- [ ] Final payer sees only the remaining balance
- [ ] Handle race conditions: lock items during payment processing

---

## Phase 3: Restaurant Dashboard & Backend

> Goal: Restaurants can manage tables, view payments, and configure settings.

### 3.1 Backend API

- [ ] Design REST API: tables, bills, payments, splits, tips
- [ ] Set up database schema (PostgreSQL)
- [ ] Payment gateway integration (Stripe recommended — supports Apple Pay, Google Pay)
- [ ] WebSocket support for real-time bill updates across devices at same table
- [ ] QR code generation per table (unique URLs with table ID + session token)

### 3.2 Restaurant Admin Dashboard

- [ ] Login/authentication for restaurant managers
- [ ] Table management: add/remove tables, generate QR codes, download/print QR stickers
- [ ] Live bill tracking: see which tables have open bills, partial payments
- [ ] Daily/weekly/monthly revenue reports
- [ ] Tip reports (total tips, average tip %, per-server breakdown)
- [ ] Configure tipping presets (change %, enable/disable)
- [ ] Branding settings: upload logo, set colors (white-label feel)

### 3.3 POS Integration

- [ ] API for POS systems to push bills to our platform
- [ ] Webhook notifications when payment is completed
- [ ] Reconciliation: match our payments to POS transactions
- [ ] Support for manual bill entry (for restaurants without POS integration)

---

## Phase 4: Polish & Delight

> Goal: The experience feels premium, trustworthy, and delightful.

### 4.1 Micro-Interactions & Animation

- [ ] Smooth page transitions (slide-up for new screens, not full reloads)
- [ ] Haptic feedback on payment confirmation (device vibration API)
- [ ] Number counting animation for totals
- [ ] Subtle parallax on the bill view scroll
- [ ] Skeleton loading states (not spinners) for all data-dependent views
- [ ] Respect `prefers-reduced-motion` for all animations

### 4.2 Accessibility (WCAG 2.2 AA)

- [ ] Color contrast audit (4.5:1 for text, 3:1 for UI elements)
- [ ] Screen reader testing: all amounts announced as currency
- [ ] Focus management: logical tab order through the payment flow
- [ ] No reliance on color alone for status (use icons + text)
- [ ] Support system font scaling up to 200%
- [ ] One-handed operation: all CTAs in thumb-reachable zone

### 4.3 Edge Cases & Error Handling

- [ ] Offline detection: show message if connection drops mid-payment
- [ ] Payment failure: clear error message + retry button (not a dead end)
- [ ] Session timeout handling (bill has been open too long)
- [ ] Multiple devices on same table: conflict resolution
- [ ] Already-paid detection: "This bill has already been settled"

### 4.4 Dark Mode

- [ ] Full dark mode theme using design tokens
- [ ] Respect system `prefers-color-scheme` preference
- [ ] Manual toggle available

---

## Phase 5: Growth & Engagement

> Goal: Features that drive restaurant adoption and customer retention.

### 5.1 Post-Payment Engagement

- [ ] Google Review prompt (deep link to restaurant's Google listing)
- [ ] NPS survey (1-question: "How was your experience?")
- [ ] Social sharing: "I just split a ₼X bill in 10 seconds" (organic marketing)

### 5.2 Loyalty & Rewards (v2)

- [ ] Points system: earn points per payment
- [ ] Restaurant-specific offers ("10% off your next visit")
- [ ] Returning customer recognition (optional account creation post-payment)
- [ ] Payment history for registered users

### 5.3 Analytics for Restaurants

- [ ] Table turnover time improvement metrics
- [ ] Average tip analytics with benchmarks
- [ ] Peak hours and payment volume heatmaps
- [ ] Split method usage breakdown
- [ ] Customer satisfaction scores from NPS

### 5.4 Multi-Language Support

- [ ] i18n framework setup
- [ ] Support for local language + English
- [ ] RTL layout support if applicable
- [ ] Currency formatting per locale
- [ ] Tipping defaults per region (disable for cultures where tipping is not customary)

---

## Design Principles (North Stars)

1. **Zero friction** — No downloads, no signups, no forms. Scan and go.
2. **Trust through transparency** — Itemized bills, clear totals, no hidden fees.
3. **Speed is the feature** — Every screen earns its existence. If it can be removed, remove it.
4. **Splitting should feel fair** — Multiple modes so every group dynamic is covered.
5. **Delight, don't distract** — Subtle animations that feel premium, not gimmicky.
6. **Accessible by default** — Built for everyone, not retrofitted later.

---

## Tech Stack (Recommended)

| Layer     | Choice                           | Why                                                   |
| --------- | -------------------------------- | ----------------------------------------------------- |
| Frontend  | Next.js + TypeScript             | SSR for fast QR landing, React ecosystem              |
| Styling   | Tailwind CSS                     | Utility-first, fast iteration, design tokens          |
| PWA       | next-pwa / Workbox               | Installable, offline-capable, no app store            |
| Backend   | Node.js / Next.js API routes     | Unified stack, fast dev                               |
| Database  | PostgreSQL + Prisma              | Relational data (bills, items, splits), type-safe ORM |
| Real-time | WebSockets (Socket.io or Pusher) | Multi-device bill sync                                |
| Payments  | Stripe                           | Apple Pay, Google Pay, cards, global coverage         |
| Hosting   | Vercel                           | Edge network, fast globally, Next.js native           |
| QR Codes  | `qrcode` npm package             | Generate per-table codes                              |
| Analytics | PostHog or Mixpanel              | Event tracking, funnels                               |
