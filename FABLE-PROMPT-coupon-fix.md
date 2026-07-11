# Prompt for Fable — fix 100%-off coupon orders

Copy everything below the line into Fable.

---

**Task: Fix a bug where 100%-off coupon orders never deliver the headshots.**

**Context**
This is SnapShot AI, a Next.js (App Router) app that sells AI headshots via Stripe Checkout.
Flow: `app/api/create-checkout/route.ts` creates a Stripe Checkout Session with `allow_promotion_codes: true`. After payment, Stripe fires `checkout.session.completed` to `app/api/webhook/route.ts`, which generates the headshots (Replicate) and emails them (Resend).

**Bug**
When a customer uses a **100%-off promotion code**, the order total is $0. The order appears to complete but the headshots email never arrives. Paid orders and partial-discount coupons work fine.

**Root cause (please verify, then fix)**
For a $0 Checkout Session, Stripe does **not** create a PaymentIntent, so `session.payment_intent` is `null`. In `app/api/webhook/route.ts`, the entire idempotency/claim logic **and** the `fulfilled` marker are wrapped in `if (paymentIntentId)`. So for free orders there is no duplicate-protection claim and the order is never marked fulfilled. Because headshot generation takes 2–3 minutes — longer than Stripe's webhook response timeout — Stripe retries the webhook. Paid orders absorb retries via the PaymentIntent claim; free orders have no claim, so retries start overlapping generations that collide/fail, and no email is delivered.

**What to change**
1. Make fulfillment and idempotency work when there is **no PaymentIntent**. Use the Checkout Session id (`session.id`) as the dedup key, and store the `fulfilled` / `fulfillment_claimed_at` state on the **Checkout Session metadata** via `stripe.checkout.sessions.update(session.id, { metadata })` when no PaymentIntent exists. When a PaymentIntent does exist, keep the current PaymentIntent-based behavior.
2. Treat `session.payment_status === 'no_payment_required'` (the $0 case) as a valid, fulfillable order.
3. Preserve the existing `CLAIM_TTL_MS` claim + retry-release behavior for both paths (paid and free).

**Constraints**
- Do NOT break the existing paid-order path or its idempotency.
- Keep the change minimal and scoped to `app/api/webhook/route.ts` (only touch `create-checkout/route.ts` if strictly required).
- Do NOT add a database or new dependency — use Stripe metadata, like the current code does.

**Definition of done**
- A 100%-off coupon order fulfills **exactly once**: headshots generated and email sent.
- Duplicate/retried `checkout.session.completed` deliveries for the same free order do NOT generate or email twice.
- Paid and partial-coupon orders still work unchanged.
- If there are tests under `tests/`, add or update one covering the $0 / no-PaymentIntent case.

When done, show me the full updated `app/api/webhook/route.ts` and a one-paragraph summary of what you changed.
