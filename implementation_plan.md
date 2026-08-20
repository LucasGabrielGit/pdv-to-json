# 💳 Implementation Plan: Subscriptions & Credit Purchases (Stripe + Supabase)

Implement a complete monetization infrastructure for **dev-kit.tech**, supporting both **one-time credit top-ups** (Pay-As-You-Go) and **Pro Subscriptions** (Monthly recurring unlimited access) with automatic database synchronization via secure Webhooks.

---

## 🎯 Pricing & Product Architecture

| Plan / Pack | Price (USD / BRL) | Type | What the user gets |
|---|---|---|---|
| **Free Tier** | $0 / Free | Daily Reset | 5 free daily AI credits + BYOK (own Gemini API key) |
| **Starter Pack** | $2.99 / R$ 14.90 | One-Time | +50 AI Credits (Never expires) |
| **Power Pack** | $9.99 / R$ 49.90 | One-Time | +250 AI Credits (Most Popular, never expires) |
| **Pro Pack** | $24.99 / R$ 119.90 | One-Time | +1,000 AI Credits (Best value, never expires) |
| **Pro Unlimited** | $7.99/mo / R$ 39.90/mo | Recurring | Unlimited AI reviews & generations, Ad-free experience, Pro Badge, priority processing |

---

## 🗄️ Database Changes (Supabase SQL)

Update `public.profiles` to track Stripe customer identifiers and subscription lifecycle:

```sql
alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text default 'none';

create index if not exists idx_profiles_stripe_customer on public.profiles(stripe_customer_id);
```

---

## Proposed Changes

### 1. Stripe SDK & Configuration Layer
#### [NEW] [src/lib/stripe.ts](file:///d:/Meus%20Projetos/pdv-to-json/src/lib/stripe.ts)
- Server-side Stripe client singleton initialized with `STRIPE_SECRET_KEY`.
- Product / Price catalog constants and metadata mappings.

### 2. API Routes (Serverless Endpoints)
#### [NEW] [src/app/api/checkout/create-session/route.ts](file:///d:/Meus%20Projetos/pdv-to-json/src/app/api/checkout/create-session/route.ts)
- Verifies user authentication with Supabase.
- Creates a Stripe Checkout Session with `client_reference_id = user.id` and metadata (`creditAmount` or `planType: 'pro'`).
- Returns `{ url: session.url }` for client redirect.

#### [NEW] [src/app/api/checkout/customer-portal/route.ts](file:///d:/Meus%20Projetos/pdv-to-json/src/app/api/checkout/customer-portal/route.ts)
- Generates a Stripe Customer Portal link so Pro subscribers can cancel, update payment method, or view invoices with 1 click.

#### [NEW] [src/app/api/webhooks/stripe/route.ts](file:///d:/Meus%20Projetos/pdv-to-json/src/app/api/webhooks/stripe/route.ts)
- Validates raw Stripe webhook signature (`STRIPE_WEBHOOK_SECRET`).
- Handles events:
  - `checkout.session.completed`: Adds purchased credits (`purchased_credits += amount`) or marks user as `is_pro = true`.
  - `customer.subscription.deleted`: Reverts `is_pro = false` when a user cancels.
  - `customer.subscription.updated`: Syncs active/past_due subscription status.

### 3. User Interface & Components
#### [NEW] [src/app/pricing/page.tsx](file:///d:/Meus%20Projetos/pdv-to-json/src/app/pricing/page.tsx)
- Dedicated `/pricing` route with dynamic currency toggle ($ USD / R$ BRL), neon tier cards, feature comparison table, and FAQ.

#### [NEW] [src/components/pricing/PricingModal.tsx](file:///d:/Meus%20Projetos/pdv-to-json/src/components/pricing/PricingModal.tsx)
- Quick modal popup when a user runs out of credits in `CodeAnalyzer` or `CodeGenerator`, allowing direct checkout.

#### [MODIFY] [src/components/auth/UserMenu.tsx](file:///d:/Meus%20Projetos/pdv-to-json/src/components/auth/UserMenu.tsx)
- Add "Upgrade to Pro" button for free users.
- Add "Manage Subscription" button for Pro members to access the Stripe Customer Portal.

#### [MODIFY] [src/components/layout/Header.tsx](file:///d:/Meus%20Projetos/pdv-to-json/src/components/layout/Header.tsx) & [Footer.tsx](file:///d:/Meus%20Projetos/pdv-to-json/src/components/layout/Footer.tsx)
- Add Pricing link to header navigation and footer.

#### [MODIFY] [.env.example](file:///d:/Meus%20Projetos/pdv-to-json/.env.example)
- Add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

---

## 🧪 Verification Plan

### Automated Verification
1. Install `stripe` package via `pnpm add stripe`.
2. Run `pnpm build` to guarantee all routes, types, and server endpoints compile cleanly with 0 errors.

### Manual Testing & Verification
1. Test session creation on `/api/checkout/create-session`.
2. Verify visual rendering of `/pricing` page and modals in desktop & mobile viewports.
3. Test Stripe Customer Portal redirect for Pro users.
