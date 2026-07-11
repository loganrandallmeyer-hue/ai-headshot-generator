# Style preview images

Preview thumbnails for the style picker on the upload page, referenced by `preview` in
`HEADSHOT_STYLES` (`lib/replicate.ts`).

## Files

| File | Style | Dimensions |
|---|---|---|
| `linkedin.jpg` | LinkedIn | 832×1216 |
| `corporate.jpg` | Corporate | 832×1216 |
| `executive.jpg` | Executive | 832×1216 (real photo — reused from `public/showcase/after-1.jpg`) |
| `creative.jpg` | Creative | 832×1216 |
| `startup.jpg` | Startup | 832×1216 |
| `academic.jpg` | Academic | 832×1216 |

## Swapping in real examples

`linkedin.jpg`, `corporate.jpg`, `creative.jpg`, `startup.jpg`, and `academic.jpg` are
still placeholder tiles. Replace each with a real AI-generated example of that style
(same filename, 832×1216) whenever available — no code changes needed, `HEADSHOT_STYLES`
in `lib/replicate.ts` references these paths directly.
