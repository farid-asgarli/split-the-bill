# UX Research Report: Mobile Restaurant Payment & Bill Splitting

**Prepared for:** Split-the-Bill project  
**Date:** April 25, 2026

---

## 1. QR-to-Pay Flow: Design Patterns & Best Practices

### The Ideal Flow (Scan to Done)

The industry consensus converges on a **3-5 screen** flow from QR scan to payment confirmation:

```
Scan QR --> View Bill --> Choose Action (split/tip/pay) --> Confirm Payment --> Receipt
```

**Screen-by-screen breakdown:**

1. **Instant Bill Display (Screen 1):** After scanning, the full itemized bill should appear within 1-2 seconds. No login, no app download, no account creation. Sunday's key selling point is "no app needed" -- the entire flow happens in the mobile browser. This is now table stakes for the category. Requiring an app download is the single biggest conversion killer.

2. **Action Selection (Screen 2):** Present the bill with clear CTAs: "Pay Full Bill," "Split Bill," or "Pay My Share." This is the decision point and should feel lightweight, not overwhelming.

3. **Tip + Payment (Screen 3):** Tip selection and payment method on a single screen. Apple Pay / Google Pay should be the primary CTA (one-tap payment). Card entry is the fallback.

4. **Confirmation (Screen 4):** Immediate visual confirmation with animation. Receipt delivered via text/email optionally.

### Key Principles

- **Zero-friction entry:** No app install, no account creation, no login. The QR code opens a mobile web experience. Sunday, me&u, and Mr Yum all operate as web-first (PWA or mobile web).
- **Instant bill recognition:** The QR code is table-linked. The system should automatically show the correct bill -- never ask the user to enter a table number.
- **Pre-populated data:** Show the full itemized bill immediately. Users need to verify they are paying the right bill.
- **Trust anchor:** Display restaurant name, logo, and table number prominently at the top. Users just scanned a random QR code -- reassure them instantly.
- **Guest checkout only:** Never require account creation before payment. Optionally capture email for receipt after payment is complete.

### Competitive Landscape

| Feature              | Sunday               | me&u              | Mr Yum         |
| -------------------- | -------------------- | ----------------- | -------------- |
| No app required      | Yes                  | Yes               | Yes            |
| Bill splitting       | Yes                  | Yes               | Yes            |
| Tipping boost        | Yes (20% -> 30% avg) | Unknown           | Unknown        |
| Time savings         | ~12 min/table        | Similar claims    | Similar claims |
| Loyalty integration  | Yes                  | Yes (Velocity FF) | Yes            |
| Multi-vendor support | No                   | Yes (food halls)  | Unknown        |

---

## 2. Bill Splitting UX Patterns

### Pattern A: Equal Split (Most Common, Default)

**How it works:** User selects "Split Bill" -> chooses number of people -> sees their share amount.

**Best practices:**

- Use a simple stepper (- / + buttons) or number pad for selecting the number of people
- Show the per-person amount updating in real-time as the number changes
- Include tax and any existing tip in the split calculation
- Default to 2 people (the most common split scenario)
- Display: "Your share: $24.50 (1 of 3)"

**UI Pattern:** A horizontal stepper with the per-person amount prominently displayed below. Splitwise validates that equal/unequal split is the most-used feature.

### Pattern B: Item-by-Item Claiming

**How it works:** Each diner taps/selects the items they ordered. Shared items (appetizers, bottles of wine) can be split among multiple claimers.

**Best practices:**

- Show the full itemized bill as a tappable list
- Use checkmarks or color-coding to show claimed vs. unclaimed items
- Allow "shared item" designation with sub-splitting (e.g., "Split this appetizer 3 ways")
- Show a running total of "Your items" at the bottom as a sticky footer
- Handle tax proportionally (not equally) based on item value
- Allow claiming for absent friends ("Add a person" who will pay later)

**UI Pattern:** Tappable item list with avatar/color assignment per person. Each person gets a color; tapping an item assigns it. Multi-tap for shared items. This is Splitwise's "Itemization" pattern.

### Pattern C: Custom Amount Splitting

**How it works:** Each person enters a custom dollar amount they want to pay.

**Best practices:**

- Show the remaining balance prominently: "Remaining: $45.20 of $128.60"
- Use a numeric keypad (not a text field) for amount entry
- Validate that amounts don't exceed the total
- Allow percentage-based entry as an alternative to dollar amounts
- Show a progress bar of how much of the bill is covered

**UI Pattern:** Amount input field with remaining balance indicator. Progress bar showing bill coverage.

### Pattern D: Partial Payment (Pay Your Share, Others Pay Later)

**How it works:** One person pays their portion. The bill remains open for others to scan the same QR code and pay their share.

**Best practices:**

- This is the most technically complex but most realistic pattern for restaurant groups
- Show what has been paid vs. what remains: "2 of 4 people have paid. Remaining: $64.30"
- Send the QR code / payment link via text so others can pay remotely
- Set a reasonable expiration (e.g., bill closes when fully paid or after 24 hours)
- The last person should see a clear "Pay remaining balance" option
- Handle the "last person stuck with the rounding" problem gracefully

**UI Pattern:** Progress indicator showing paid portions as filled segments. Shareable link for remaining payers.

### Recommended Default Flow

Based on industry adoption, the recommended priority order is:

1. **Equal split** (default, covers ~60% of use cases)
2. **Pay full bill** (single payer, ~25% of cases)
3. **Custom amount** (flexible, ~10%)
4. **Item-by-item** (power users, ~5% but high satisfaction)

---

## 3. Visual Design Trends in Fintech/Payment Apps

### Color Schemes That Convey Trust

**Primary palette trends (2025-2026):**

- **Blues and teals** remain the dominant trust color in fintech (Stripe, PayPal, Venmo). Blue reduces anxiety and implies security.
- **Deep navy + white** for primary UI creates a premium, institutional feel.
- **Green for success states** is universal (payment confirmed, sufficient balance).
- **Muted, desaturated palettes** are replacing the bright/bold era. Sophisticated, not playful.

**Recommended approach for a restaurant payment app:**

- Primary: Deep blue or teal (`#1A56DB` range or `#0D9488` range)
- Secondary: Warm neutral (restaurants are warm environments; pure clinical blue can feel cold)
- Success: Green (`#16A34A`)
- Error: Red, but muted (`#DC2626`)
- Backgrounds: Off-white (`#F9FAFB`) or very light warm gray
- Text: Near-black (`#111827`), never pure black on pure white

**What to avoid:**

- Red as a primary color (anxiety, error association)
- Overly playful/bright colors (undermines trust with real money)
- Pure black backgrounds in dark mode (use `#121212` or `#1E1E1E` instead)

### Typography

**Current trends:**

- **Inter, SF Pro, or similar neo-grotesque sans-serifs** dominate fintech
- Large, bold currency amounts (32-48px for the total)
- Clear hierarchy: amount > description > metadata
- Tabular/monospace numerals for financial figures (prevents digits from jumping during animations)
- Minimum 16px body text on mobile (prevents iOS zoom on input focus)

**Recommended type scale:**

- Bill total: 32-40px, bold
- Section headers: 18-20px, semibold
- Item names: 16px, regular
- Item prices: 16px, medium (tabular figures)
- Metadata/timestamps: 14px, regular, secondary color

### Animation & Micro-interactions

**Effective patterns:**

- **Payment confirmation:** Satisfying checkmark animation (Stripe's is the gold standard -- a circle that fills and reveals a checkmark, ~800ms)
- **Amount changes:** Numbers should animate/count up when tip is added or split recalculates
- **Pull-to-refresh** on bill view (in case items were added)
- **Haptic feedback** on payment confirmation (single tap vibration)
- **Skeleton loading screens** while bill data loads (never show a spinner)
- **Subtle spring animations** on card/section transitions (not linear easing)
- **Progress indicators** during payment processing (pulsing dots or animated bar, never a static spinner)

**What to avoid:**

- Animations longer than 300ms for UI transitions
- Any animation that delays the user from taking action
- Bouncy/playful animations (this is real money, not a game)
- Loading screens that feel like something could go wrong

### Dark Mode Considerations

- Dark mode is expected, not optional, in 2026
- Use surface elevation (lighter shades of dark for raised elements) rather than borders
- Currency amounts in white on dark backgrounds need extra letter-spacing
- Green/red status colors need different shades in dark mode for WCAG compliance
- Test tip selection buttons for contrast in both modes
- Cards/sections: use `#1E1E1E` on `#121212` background (Material Design 3 elevation model)

---

## 4. Tipping UX

### Pre-set Percentages vs. Custom

**Industry standard layout:**

```
[ 15% ]  [ 18% ]  [ 20% ]  [ Custom ]
 $8.25    $9.90    $11.00
```

**Best practices:**

- Show **3 pre-set options + custom** (not 4+, not 2)
- Display both percentage AND dollar amount for each option
- **Pre-select the middle option** (this is the most common nudge -- Sunday reports tips increased from 20% to 30% average using this technique)
- The middle option should be your "target" tip (e.g., 18% or 20%)
- Include a "No tip" option but make it less prominent (text link, not a button)
- Calculate tip on the **pre-tax subtotal** (this is legally and ethically expected in most jurisdictions)

### Tip Placement in the Flow

**Optimal placement:** Tip selection should appear AFTER the user has reviewed their bill but BEFORE they enter payment. The sequence is:

```
View Bill -> Split (if applicable) -> Select Tip -> Confirm & Pay
```

**Rationale:**

- Placing tips before payment reduces the "additional step after commitment" feeling
- Users expect tip selection as part of the checkout flow
- Placing it after payment (as a separate step) has lower completion and lower tip amounts

### Psychological Nudges (Ethical)

- **Anchoring:** The pre-selected option anchors expectations. A pre-selected 20% leads to higher average tips than presenting 15% first.
- **Dollar amounts:** Showing "$4.50" feels smaller than "18%" for large bills, and larger for small bills. Show both.
- **Social proof:** "Most diners at [Restaurant] tip 20%" (if true and the restaurant opts in)
- **Round-up option:** "Round up to $50.00 ($3.27 tip)" -- simple and psychologically satisfying
- **Post-payment gratitude:** "Your server Sarah says thanks!" with a brief, warm animation
- **Avoid guilt:** Never use language like "No tip -- are you sure?" or sad emoji. This damages brand trust.

### Tip Distribution Transparency

An emerging trend: some apps now show "Tips go directly to your server" or "Tips are shared with kitchen staff." Transparency builds trust and increases tip amounts.

---

## 5. Key Metrics & Benchmarks

### Flow Length

| Metric                                 | Benchmark                | Best-in-Class                     |
| -------------------------------------- | ------------------------ | --------------------------------- |
| Screens to complete payment            | 3-5                      | 3 (with Apple/Google Pay)         |
| Taps to complete (full bill, no split) | 4-6                      | 3 (bill -> tip -> Apple Pay)      |
| Taps to complete (with split)          | 6-9                      | 5-6                               |
| Time from scan to payment complete     | 30-60 seconds            | Under 15 seconds (Sunday's claim) |
| Form fields required                   | 0 (with digital wallets) | 0                                 |

### Completion Rates

| Metric                           | Industry Average | Target |
| -------------------------------- | ---------------- | ------ |
| QR scan to bill view             | 85-90%           | 95%+   |
| Bill view to payment initiation  | 70-80%           | 85%+   |
| Payment initiation to completion | 90-95%           | 95%+   |
| Overall scan-to-paid             | 55-70%           | 75%+   |
| Tip opt-in rate                  | 60-75%           | 80%+   |

Note: Restaurant QR-to-pay has inherently higher completion than e-commerce because the user has already consumed the product and has an obligation to pay. The 69.82% cart abandonment rate from e-commerce does not apply here -- restaurant payment completion should be significantly higher.

### Common Drop-off Points

1. **QR scan to page load (5-15% drop-off):** Slow loading, broken URLs, camera issues, or user decides to pay traditionally
2. **Bill verification (5-10%):** User doesn't recognize the bill, wrong table, or items are missing/incorrect
3. **Account creation wall (30-50% if present):** NEVER require this. Guest checkout only.
4. **Payment method entry (10-20%):** If Apple Pay/Google Pay aren't available, card entry is friction. Auto-detect and prioritize digital wallets.
5. **Splitting complexity (5-15%):** If the split flow is confusing or takes too many steps
6. **Tip screen (3-5%):** Users may hesitate or get confused. Keep it simple.
7. **3D Secure / bank verification (5-10%):** Unavoidable for some cards, but optimize for passkeys/biometric auth

### Key Performance Metrics to Track

- **Time to pay:** Median time from QR scan to payment confirmation
- **Split adoption rate:** % of bills that use any split feature
- **Tip rate:** Average tip % and tip opt-in rate
- **Digital wallet adoption:** % using Apple Pay / Google Pay vs. manual card entry
- **Return rate:** % of users who use the system again at any restaurant
- **Error rate:** % of payment failures or retries

---

## 6. Accessibility & Internationalization

### Accessibility (WCAG 2.2 AA Minimum)

**Visual:**

- Minimum contrast ratio of 4.5:1 for text, 3:1 for large text and UI components
- Currency amounts should meet 7:1 contrast (AAA) given their critical importance
- Never use color alone to convey information (e.g., don't rely only on red/green for paid/unpaid)
- Support Dynamic Type / system font scaling (up to 200% without horizontal scrolling)
- Touch targets minimum 44x44 CSS pixels (WCAG 2.5.8)
- Tip percentage buttons should be generously sized (minimum 48x48, ideally 56x48)

**Motor:**

- All actions achievable with single tap (no swipe-required gestures for critical paths)
- No time limits on payment screens (except reasonable session timeout with warning)
- Avoid drag-and-drop for item claiming; use tap-to-toggle

**Screen readers:**

- All currency amounts must be announced properly ("twenty-four dollars and fifty cents," not "twenty-four point five zero")
- Tip buttons: "18 percent tip, nine dollars and ninety cents" not just "18%"
- Bill items should be in a semantic list with item name and price as a coherent unit
- Payment confirmation must be announced as a live region (aria-live="assertive")
- Split progress: "Two of four people have paid. Sixty-four dollars and thirty cents remaining."

**Cognitive:**

- Clear, simple language (no jargon: "Split the bill" not "Initiate proportional disbursement")
- Consistent layout across all screens
- Visible running total at all times
- Undo option for tip selection and split choices
- Confirmation before final payment (but only one confirmation, not multiple)

### Internationalization

**Currency:**

- Format currencies according to locale (e.g., $1,234.56 vs 1.234,56 EUR vs 1 234,56 SEK)
- Use the Intl.NumberFormat API for all currency display
- Support right-to-left (RTL) layouts for Arabic/Hebrew locales (important in international hospitality)
- Show currency symbol/code clearly (especially in tourist areas where currency may be ambiguous)

**Language:**

- Detect device language and offer the bill in that language
- Keep the number of translatable strings small (payment flows should be icon-heavy)
- Critical strings: "Pay," "Split," "Tip," "Confirm," "Total," "Remaining"
- Avoid idioms ("going Dutch" doesn't translate)
- Right-to-left support for Arabic, Hebrew, Urdu

**Tipping culture:**

- Tipping norms vary drastically by country. The tip screen should be configurable per-restaurant or per-region.
- Some countries (Japan, South Korea) consider tipping offensive. Allow restaurants to disable the tip screen entirely.
- In countries where tipping is uncommon (most of Europe, Australia), default to "No tip" selected and present options as optional and smaller.
- me&u (Australian company) handles multi-vendor food halls, suggesting their tip UX is likely more subdued than US-focused Sunday.

**Payment methods:**

- Digital wallet availability varies by region (Apple Pay, Google Pay have different market penetration)
- Consider local payment methods for international markets (iDEAL in Netherlands, Bancontact in Belgium, PIX in Brazil)
- Card types vary (Visa/MC global, Amex less so, JCB in Japan, UnionPay in China)

**Tax display:**

- US: Tax is added to displayed prices (show subtotal + tax + tip = total)
- Most other countries: Tax is included in displayed prices
- Always clarify whether displayed prices include tax

**Accessibility + i18n intersection:**

- Screen reader currency announcements must be locale-aware
- Number input fields must accept locale-appropriate decimal separators
- Date/time formats on receipts must be localized

---

## 7. Recommendations for Split-the-Bill

Based on this research, the following priorities are recommended:

### Must-Have (MVP)

1. **Zero-friction web-based flow** -- no app, no account, no login
2. **3-screen payment flow** -- Bill View -> Tip & Split -> Confirm (Apple/Google Pay)
3. **Equal split** with person-count stepper
4. **3 pre-set tip options + custom** with dollar amounts shown
5. **Apple Pay and Google Pay** as primary payment methods
6. **Mobile-optimized responsive design** with 44px+ touch targets
7. **Instant visual confirmation** with animation

### Should-Have (v1.1)

1. **Item-by-item claiming** with tap-to-select
2. **Partial payment** (pay your share, share link for others)
3. **Custom amount splitting**
4. **Dark mode**
5. **Receipt via email/SMS**
6. **Accessibility audit** (WCAG 2.2 AA)

### Nice-to-Have (v2+)

1. **Multi-language support**
2. **Region-aware tipping defaults**
3. **Loyalty program integration**
4. **Social proof tipping nudges**
5. **Payment method localization**
6. **Round-up tip option**

---

## Sources & References

- Sunday (sundayapp.com) -- market leader in QR pay-at-table, claims 12 min saved per table and tips increase from 20% to 30%
- me&u (meandu.com) -- Australian market, multi-vendor support, Velocity FF loyalty integration
- Mr Yum (mryum.com) -- competitor in the space (site returned 403, limited data)
- Splitwise -- established bill-splitting patterns: equal, unequal, percentage, shares, itemization
- Shopify checkout research -- 69.82% cart abandonment rate (e-commerce baseline), 17% abandon due to complexity
- Baymard Institute -- average checkout has 11.3 form fields, only 8 needed
- WCAG 2.2 guidelines -- accessibility standards
- Material Design 3 -- dark mode elevation and color system guidelines
