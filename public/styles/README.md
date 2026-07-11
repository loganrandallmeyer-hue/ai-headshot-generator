# Style preview images

Preview thumbnails for the style picker on the upload page, referenced by `preview` in
`HEADSHOT_STYLES` (`lib/replicate.ts`).

## Files

| File | Style | Dimensions |
|---|---|---|
| `linkedin.jpg` | LinkedIn | 832×1216 (real example) |
| `corporate.jpg` | Corporate | 832×1216 (real example) |
| `executive.jpg` | Executive | 832×1216 (real example) |
| `creative.jpg` | Creative | 832×1216 (real example) |
| `startup.jpg` | Startup | 832×1216 (real example) |
| `academic.jpg` | Academic | 832×1216 (real example) |

## Swapping in new examples

All six are real reference photos. To update any of them, replace the file at the
same path/name with a new image cropped to 832×1216 — no code changes needed,
`HEADSHOT_STYLES` in `lib/replicate.ts` references these paths directly.
