# SnapShot AI — Setup Guide

## Accounts You Need (all free to start)

1. **Vercel** — https://vercel.com (free hosting)
2. **Stripe** — https://stripe.com (free, takes 2.9% per sale)
3. **Replicate** — https://replicate.com (pay per use, ~$0.02/image = ~$1 per order)
4. **Resend** — https://resend.com (free up to 3000 emails/month)

---

## Step 1 — Install & Run Locally

```bash
cd ai-headshot-generator
npm install
cp .env.example .env.local
# Fill in .env.local with your keys (see below)
npm run dev
```

Open http://localhost:3000

---

## Step 2 — Get Your API Keys

### Stripe
1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Secret key** → `STRIPE_SECRET_KEY`
3. For the webhook secret, run locally first (step 4)

### Replicate
1. Go to https://replicate.com/account/api-tokens
2. Create a new token → `REPLICATE_API_TOKEN`
3. Note: Each headshot order costs ~$0.50–$1.00 in API fees (you charge $24.99 = ~$24 profit)

### Resend
1. Sign up at https://resend.com
2. Add and verify your domain (or use their test domain for dev)
3. Create an API key → `RESEND_API_KEY`
4. Update the "from" email in `lib/email.ts` to match your verified domain

---

## Step 3 — Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Follow the prompts. Then add your environment variables in the Vercel dashboard under Settings → Environment Variables.

---

## Step 4 — Set Up Stripe Webhook

After deploying, go to https://dashboard.stripe.com/webhooks and:
1. Click "Add endpoint"
2. Enter: `https://your-app.vercel.app/api/webhook`
3. Select event: `checkout.session.completed`
4. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`
5. Update this in your Vercel env vars and redeploy

---

## Revenue Breakdown Per Sale

| Item | Amount |
|------|--------|
| Customer pays | $24.99 |
| Stripe fee (2.9% + $0.30) | −$1.02 |
| Replicate AI cost | −$0.80 |
| Resend email cost | −$0.00 (free tier) |
| **Your profit** | **~$23.17** |

---

## Testing

Use Stripe test card: `4242 4242 4242 4242` (any future date, any CVC)
Switch `STRIPE_SECRET_KEY` to your `sk_test_...` key for testing.
