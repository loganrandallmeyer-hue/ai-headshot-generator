# Showcase assets

Before/after image pairs used by `components/Showcase.tsx` on the landing page.

## Required files (fixed names — do not rename)

| File | Purpose | Dimensions | Aspect |
|---|---|---|---|
| `before-1.jpg` | Hero pair — casual snapshot | 832×1216 | ~3:4 |
| `after-1.jpg` | Hero pair — polished headshot (same face as before-1) | 832×1216 | ~3:4 |
| `before-2.jpg` | Reserve pair — casual snapshot | 832×1216 | ~3:4 |
| `after-2.jpg` | Styles proof strip | 832×1216 | ~3:4 |
| `after-3.jpg` | Styles proof strip | 832×1216 | ~3:4 |
| `after-4.jpg` | Styles proof strip | 832×1216 | ~3:4 |

## Rules

- **Before = casual snapshot, after = polished headshot of the SAME face.** Pairs must be visibly the same person for the before/after claim to be honest.
- Keep the exact pixel dimensions above (832×1216) — `Showcase.tsx` sets explicit `width`/`height` on every `next/image` to avoid layout shift. A same-name, same-dimension file swap requires no code change.
- Every rendered pair must keep the visible **"Illustrative example"** label — this is a legal/advertising-honesty requirement, not just a design choice. Do not remove it when swapping in final photography.
- JPG format, sensible quality (≈80–90) for reasonable file size — these load above the fold.

## Swapping in final images

1. Replace the file at the same path/name with your final image, cropped/resized to 832×1216.
2. Redeploy. No code changes needed.
