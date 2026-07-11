# Prompt for Fable — fix "domain is not verified" email failure

Copy everything below the line into Fable.

---

**Task: Fix email delivery failing at runtime with "The pinelightlabs.com domain is not verified."**

**Context**
This is SnapShot AI, a Next.js (App Router) app. After a Stripe payment, `app/api/webhook/route.ts` calls `sendHeadshotsEmail()` in `lib/email.ts`, which emails the headshots via Resend. The send fails with:
`Email delivery failed: The pinelightlabs.com domain is not verified. Please, add and verify your domain on https://resend.com/domains`

**Cause**
`lib/email.ts` hardcodes the sender as `SnapShot AI <hello@pinelightlabs.com>`. Resend refuses to send from a domain that hasn't been verified in the Resend dashboard. Verifying the domain is a manual DNS step the owner will handle in Resend — your job is only the code, so it's flexible and testable before verification is done.

**What to change (in `lib/email.ts`)**
1. Stop hardcoding the sender. Read it from an environment variable `EMAIL_FROM`, falling back to Resend's always-available shared test sender when the variable is unset, so the flow is testable before the domain is verified:
   `const from = process.env.EMAIL_FROM || 'SnapShot AI <onboarding@resend.dev>'`
   Use `from` in the `resend.emails.send({ from, ... })` call.
2. Replace the hardcoded contact address `hello@pinelightlabs.com` in the email HTML with an environment variable `EMAIL_CONTACT` (fall back to a sensible default string).
3. When Resend returns an error, keep throwing, but include the sender address in the thrown message so this is easy to diagnose next time (e.g. `Email delivery failed from "${from}": ${error.message}`).
4. Add `EMAIL_FROM=` and `EMAIL_CONTACT=` to `.env.example` (create the file if it doesn't exist), with a comment noting that `EMAIL_FROM` must use a Resend-verified domain in production.

**Constraints**
- Do NOT change the attachment download, size-batching, or email-template design logic.
- Keep changes scoped to `lib/email.ts` and `.env.example`.

**Definition of done**
- With no `EMAIL_FROM` set, the app sends via `onboarding@resend.dev` and no longer throws the "domain is not verified" error.
- After the owner verifies the domain, setting `EMAIL_FROM="SnapShot AI <hello@pinelightlabs.com>"` makes it send from that domain with no code change.
- No email addresses remain hardcoded in `lib/email.ts`.

When done, show me the full updated `lib/email.ts` and the `.env.example` entries.
