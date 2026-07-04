# Tests

Self-contained test suites that run the real app code against stubbed
Stripe / Replicate / Resend backends — no API keys, no network, no charges.

- `test-logic.ts` — AI generation math (tier splitting, PhotoMaker 4-output cap,
  partial-failure tolerance) and email attachment batching (60 MB set → 2 emails).
- `route-tests.ts` — every API route executed directly: input validation,
  expired-preview rejection (409), Stripe checkout metadata (prediction ID only,
  never photo data), and the full webhook flow with a real HMAC-signed event:
  signature check → duplicate skip → photo recovery → 30 headshots → email →
  idempotent retry.
- `render-tests.ts` — server-renders every page and asserts key content
  (prices, trust copy, legal links) is present and fake content is gone.

Run (from the project root, after `npm install`):

```bash
npx tsx tests/test-logic.ts
npx tsx tests/route-tests.ts
npx tsx tests/render-tests.ts
```

These files are excluded from the Next.js build (`tsconfig.json` excludes
`tests/`), so they never affect deploys.
