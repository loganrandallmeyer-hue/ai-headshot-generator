# SnapShot AI — Redesign: Component Specs & Sonnet Code Directives

> Companion to `REDESIGN-PHASED-PLAN.md`. That doc = Deliverable 1 (the plan). This doc = Deliverables 2–4 (component specs, numbered Sonnet code directives, QA & rollout).
>
> **Confirmed decisions:** CSS-only motion (no library) · real/AI-generated before-after images dropped in at the end via fixed placeholder slots · full 6-phase transformation.
>
> **Asset workflow:** Sonnet builds everything against committed **placeholder** files at fixed paths in `public/showcase/`. Logan overwrites those files (same names, same dimensions) with final images at the end. No code changes required at drop-in.

---

## How Sonnet should work this doc
- Execute tasks **in numbered order**. Each phase is a separate commit/PR on its own branch → its own Vercel preview.
- Do **not** change anything under `app/api/`, `lib/`, `next.config.mjs` behavior, Stripe/Replicate/Resend logic, pricing, or the data passed between pages. This is a visual/UX layer only.
- After each phase, run the acceptance checks listed for its tasks before moving on.
- Preserve all existing `aria-*`, `role`, `alt`, and `aria-live` attributes; add more where noted, never remove.

---

# Section A — Component Redesign Specs

### A0. Global foundation (not a component, but everything depends on it)
**Current issues:** Four utility classes used across components (`.reveal/.is-visible`, `.lift`, `.link-underline`, `.pulse-soft`) are undefined, so reveal/hover/underline/pulse silently no-op. No `prefers-reduced-motion`. Fonts render-blocking via `@import`. No favicon/OG/theme-color. Gold gradient inlined ~15+ times. Grain at `z-index:9999`.
**Objectives:** A working, tokenized foundation: design tokens (spacing, easing, radii, elevation, fluid type, gradient), restored primitives, reduced-motion guard, self-hosted fonts, brand/meta plumbing.
**Implementation:** All in `app/globals.css` + `app/layout.tsx`. See Tasks 0.1–0.5.

### A1. Navigation (`components/SiteNav.tsx` + duplicated navs in upload/preview/success)
**Current issues:** `.link-underline` undefined. Three surfaces hand-roll their own `<nav>` instead of reusing one. Logo is plain text. Nav is symmetric and generic.
**Objectives:** One shared, art-directed nav system; animated underlines that work; a refined logo lockup; a slimmer "flow nav" variant for funnel pages (upload/preview/success) that shows the Stepper context.
**Concrete changes:** Keep the scroll-progress bar (good). Add working underline. Extract a `FlowNav` (or a `variant` prop on `SiteNav`) and replace the three inline navs. Logo: refine kerning/weight, add a small mark.
**Implementation:** `components/SiteNav.tsx`, new `components/FlowNav.tsx`, edits to `app/upload/page.tsx`, `app/preview/page.tsx`, `app/success/page.tsx`.

### A2. Hero / Landing (`app/page.tsx` HERO section)
**Current issues:** Symmetric 2-col `grid lg:grid-cols-2 gap-14 items-center`, everything `text-center lg:text-left`. Visual is placeholder `PortraitGlyph` SVGs in a uniform 2×2 grid. Fixed type sizes.
**Objectives:** An editorial, asymmetric hero that breathes — offset columns, display type allowed to run large via `clamp()`, real before/after imagery overlapping the copy column, controlled negative space.
**Concrete changes:** Asymmetric grid (e.g. `~1.1fr / 0.9fr` with a vertical offset on the image cluster). Replace the glyph grid with a layered **before/after showcase** (Showcase component, A9) where an "after" card overlaps a smaller "before" card at an offset with a subtle connective element and an "Example" label. Headline uses fluid clamp type and is allowed to slightly exceed its column. Keep the badge, subhead, CTA, and trust strip, restyled.
**Implementation:** `app/page.tsx`, `components/Showcase.tsx`.

### A3. Landing content sections (Trust / How it works / Comparison / Styles / Pricing)
**Current issues:** Every section is `text-center` + `max-w-* mx-auto` + uniform grid + identical `rounded-2xl border border-border bg-charcoal/50` cards + equal `py-24`. Textbook symmetric SaaS.
**Objectives:** Editorial rhythm and asymmetry — varied section widths and vertical spacing, section eyebrows set to one side, at least one section using an offset/overlap or magazine-style two-column layout, differentiated card treatments (elevation tiers, not one flat style). Numerals in "How it works" become a bold typographic motif.
**Concrete changes:** Alternate left/centered section headers; vary vertical padding using spacing tokens; give the Comparison section a distinct layered treatment (the SnapShot column visually elevated over the studio column); Pricing keeps 3 tiers but the "Standard" card breaks the grid line (scale/offset) rather than just a border.
**Implementation:** `app/page.tsx`, `components/Reveal.tsx` (stagger), `components/FAQ.tsx`.

### A4. Upload (`app/upload/page.tsx`)
**Current issues:** Centered single column, generic dashed dropzone, 2×2 tip grid all identical, hand-rolled nav. Functional but templated.
**Objectives:** A confident, guided "studio intake" feel. Keep the exact upload/compress/poll logic untouched. Elevate the dropzone into a tactile surface with clear affordance, give the guideline tips a more editorial layout, and make the progress/generation state feel premium (the 30–60s wait is a key moment).
**Concrete changes:** Restyle dropzone with layered surface + working drag state (already has `upload-active`). Asymmetric intro. Nicer thumbnail grid. Elevated progress state with tokenized gold gradient. Replace inline nav with `FlowNav` (Stepper 1).
**Implementation:** `app/upload/page.tsx` (JSX/classes only — do not touch `onDrop`, `compressToDataUrl`, `handleSubmit`, polling).

### A5. Preview + package selection = "Customization experience" (`app/preview/page.tsx`)
**Current issues:** Symmetric 2-col, tier buttons are flat bordered rectangles, the watermarked canvas sits in a plain frame. This is the highest-intent conversion moment and looks the most like a form.
**Objectives:** Make choosing a package feel like configuring a premium product. Do not change checkout logic, tiers, prices, or the canvas watermark drawing. Elevate tier selection into tactile, clearly-differentiated cards with a satisfying selected state; frame the preview as a "proof" hero.
**Concrete changes:** Layered preview frame with caption. Tier cards: elevation + gold accent on select, animated check, clearer price hierarchy, "Most Popular" tier visually lifted. Keep `selectedTier` state and `handleCheckout` intact. `FlowNav` (Stepper 2).
**Implementation:** `app/preview/page.tsx` (presentation only — leave the `useEffect` canvas code and `handleCheckout` untouched).

### A6. Success (`app/success/page.tsx`)
**Current issues:** Centered checkmark + glow, generic. A celebratory moment that lands flat.
**Objectives:** A refined, quietly celebratory confirmation with brand character; reinforce "photos arriving in your inbox" and the delete-in-24h trust point.
**Concrete changes:** Keep share logic. Elevate the confirmation mark, add editorial spacing, tokenized styling, `FlowNav` (Stepper 3).
**Implementation:** `app/success/page.tsx`.

### A7. Footer (`components/SiteFooter.tsx`)
**Objectives:** Editorial multi-column footer with the refined logo, restrained type, working link states.
**Implementation:** `components/SiteFooter.tsx`.

### A8. FAQ (`components/FAQ.tsx`)
**Objectives:** Refined accordion with smooth height/opacity transition (reduced-motion aware), better type rhythm, working hover/focus states.
**Implementation:** `components/FAQ.tsx`.

### A9. Showcase / before-after asset system (new `components/Showcase.tsx` + `public/showcase/`)
**Objectives:** A reusable layered before/after component driven by fixed asset paths, with committed placeholders Logan swaps at the end, and a persistent "Illustrative example" label to stay on the right side of advertising honesty.
**Implementation:** New `components/Showcase.tsx`, new `public/showcase/` with placeholders + `README.md` spec. See Task 0.4.

---

# Section B — Sonnet Code Change Directives

Legend: each task = **Target · Before · After · Acceptance**. "Before/After" is illustrative of the change; keep surrounding code intact.

## PHASE 0 — Foundation & Design Tokens (safe, no visible layout change)

### Task 0.1 — Add design tokens + restore the missing utilities + reduced-motion
**Target:** `app/globals.css`
**Before (relevant gaps):** `:root` defines only 4 color vars. `.reveal/.is-visible`, `.lift`, `.link-underline`, `.pulse-soft` are **not defined**. No `prefers-reduced-motion`. Grain is `z-index:9999`.
**After:** Extend `:root` with a token layer and define every missing primitive. Add these blocks to `globals.css` (keep existing rules; change grain z-index to `60`):

```css
:root {
  /* palette (existing) */
  --gold: #C9A550; --gold-light: #E2C06A; --obsidian: #090909; --cream: #F0EBE0;
  /* brand gradient token (replaces ~15 inline copies) */
  --grad-gold: linear-gradient(135deg, #E2C06A, #C9A550);
  /* spacing scale */
  --space-2xs:.5rem; --space-xs:1rem; --space-sm:2rem; --space-md:4rem;
  --space-lg:6rem; --space-xl:9rem; --space-2xl:12rem;
  /* radii */
  --r-sm:.75rem; --r-md:1rem; --r-lg:1.5rem; --r-pill:999px;
  /* elevation tiers */
  --shadow-1:0 1px 2px rgba(0,0,0,.4);
  --shadow-2:0 12px 30px -12px rgba(0,0,0,.6);
  --shadow-3:0 30px 60px -20px rgba(0,0,0,.7);
  --glow-gold:0 0 40px rgba(201,165,80,.18);
  /* easing */
  --ease-out:cubic-bezier(.16,1,.3,1);
  --ease-in-out:cubic-bezier(.65,0,.35,1);
  /* fluid type ramp */
  --fs-eyebrow:.75rem;
  --fs-body:clamp(.95rem,.9rem + .3vw,1.125rem);
  --fs-h2:clamp(2rem,1.4rem + 2.6vw,3.25rem);
  --fs-h1:clamp(2.75rem,1.6rem + 5.2vw,5.5rem);
  --fs-display:clamp(3.25rem,1.5rem + 8vw,7rem);
}

/* Scroll-reveal (used by Reveal.tsx) */
.reveal{opacity:0;transform:translateY(24px);transition:opacity .7s var(--ease-out),transform .7s var(--ease-out);}
.reveal.is-visible{opacity:1;transform:none;}

/* Card hover-raise */
.lift{transition:transform .4s var(--ease-out),border-color .4s var(--ease-out),box-shadow .4s var(--ease-out);will-change:transform;}
.lift:hover{transform:translateY(-4px);box-shadow:var(--shadow-2);}

/* Animated nav underline */
.link-underline{position:relative;}
.link-underline::after{content:'';position:absolute;left:0;bottom:-4px;height:1px;width:100%;background:var(--gold);transform:scaleX(0);transform-origin:right;transition:transform .4s var(--ease-out);}
.link-underline:hover::after{transform:scaleX(1);transform-origin:left;}

/* Soft pulse for the live badge dot */
.pulse-soft{animation:pulseSoft 2.4s var(--ease-in-out) infinite;}
@keyframes pulseSoft{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(201,165,80,.5);}50%{opacity:.6;box-shadow:0 0 0 6px rgba(201,165,80,0);}}

/* Gold gradient utility (token) */
.bg-grad-gold{background:var(--grad-gold);}

/* Visible keyboard focus everywhere */
:where(a,button,input,[tabindex]):focus-visible{outline:2px solid var(--gold);outline-offset:3px;border-radius:4px;}

/* HARD CONSTRAINT: respect reduced motion */
@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{animation-duration:.001ms !important;animation-iteration-count:1 !important;transition-duration:.001ms !important;scroll-behavior:auto !important;}
  .reveal{opacity:1 !important;transform:none !important;}
}
```
Also change `.grain::before{ ... z-index:9999; }` → `z-index:60;`.
**Acceptance:** Landing reveals now fade/slide in on scroll; cards raise on hover; nav underlines animate; badge dot pulses. With OS "reduce motion" on, nothing animates and all content is visible. No console errors. No layout shift vs. before.

### Task 0.2 — Self-host fonts via `next/font`, remove render-blocking `@import`
**Target:** `app/layout.tsx`, `app/globals.css`, `tailwind.config.ts`
**Before:** `globals.css` line 1 is `@import url('https://fonts.googleapis.com/...Cormorant+Garamond...DM+Sans...')`. `tailwind.config.ts` maps `display`/`body` font families to those names.
**After:** Delete the `@import` line from `globals.css`. In `layout.tsx`:
```tsx
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
const display = Cormorant_Garamond({ subsets:['latin'], weight:['300','400','500','600','700'], variable:'--font-display', display:'swap' })
const body = DM_Sans({ subsets:['latin'], weight:['300','400','500','600'], variable:'--font-body', display:'swap' })
// on <html>: className={`${display.variable} ${body.variable}`}
```
Update `tailwind.config.ts` fontFamily to `display:['var(--font-display)','serif']`, `body:['var(--font-body)','sans-serif']`.
**Acceptance:** Fonts identical visually. No external `fonts.googleapis.com` request in Network tab. Lighthouse "Eliminate render-blocking resources" no longer flags fonts; CLS ≤ 0.01 on landing.

### Task 0.3 — Brand & SEO plumbing (favicon, icons, theme-color, OG)
**Target:** `app/layout.tsx`, add `app/icon.svg` (or `.png`), `app/opengraph-image` reference
**Before:** `metadata` has title/description/openGraph but no `metadataBase`, no icons, no theme-color, no OG image file.
**After:** Add `metadataBase: new URL('https://<production-domain>')`, `icons`, `themeColor:'#090909'`, and wire the existing `SnapShot-AI-launch-graphic.png` as the OG image (copy it to `public/og.png` and reference `openGraph.images:['/og.png']`). Add a simple gold-on-obsidian `app/icon.svg` favicon.
**Acceptance:** Favicon shows in the browser tab. Sharing the URL yields a rich preview. Lighthouse SEO ≥ 90, Best Practices ≥ 95. (Logan: confirm the production domain to fill `metadataBase`.)

### Task 0.4 — Showcase asset system + committed placeholders
**Target:** new `components/Showcase.tsx`, new `public/showcase/` (`before-1.jpg`, `after-1.jpg`, `before-2.jpg`, `after-2.jpg`, `after-3.jpg`, `after-4.jpg`), new `public/showcase/README.md`
**Before:** Hero uses inline `PortraitGlyph` SVGs and gradient cards; no reusable asset system.
**After:**
- Create `public/showcase/` and commit **placeholder** JPGs at fixed names above. Generate them as tasteful obsidian/gold gradient tiles with a centered "PLACEHOLDER — replace" label (a tiny build script or hand-made files are both fine) at these exact dimensions so Logan's real files drop in 1:1:
  - `before-*.jpg` → **832×1216** (portrait 3:4-ish), `after-*.jpg` → **832×1216**.
- `public/showcase/README.md` documents: required filenames, exact pixel dimensions, aspect ratio, "before = casual snapshot, after = polished headshot of the SAME face," and that every rendered pair must keep the visible "Illustrative example" label.
- `components/Showcase.tsx`: a client-safe component using `next/image` that renders a layered pair — the `after` card elevated (`--shadow-3`), a smaller `before` card offset behind/beside it, a subtle connective arrow, and a persistent small `Example` chip. Props: `beforeSrc`, `afterSrc`, `afterLabel`, `className`. Use `sizes`/`priority` appropriately for the hero instance.
**Acceptance:** Component renders placeholders with no layout shift (explicit width/height). Overwriting any file in `public/showcase/` with a same-name, same-dimension image requires **zero** code changes. "Illustrative example" label always visible. `next.config.mjs` already allows replicate hosts; local `public/` images need no config.

### Task 0.5 — Tokenize the inlined gold gradient (progressive)
**Target:** the exact 6 files containing `linear-gradient(135deg, #E2C06A, #C9A550)` (verified): `app/page.tsx`, `app/preview/page.tsx`, `app/upload/page.tsx`, `components/SiteNav.tsx`, `components/Stepper.tsx`, `components/StickyBuyBar.tsx`. (`app/success/page.tsx` uses only radial-glow gradients — leave it.)
**Before:** `style={{ background:'linear-gradient(135deg, #E2C06A, #C9A550)' }}` repeated ~15×.
**After:** Replace with `className="bg-grad-gold"` (from Task 0.1). Leave multi-stop decorative gradients (radial glows, the `#C9A550,#8B6914,#C9A550` pricing border) as-is.
**Acceptance:** Visual parity. A single CSS var now controls the brand gradient. Grep for the inline gold gradient returns only intentional multi-stop cases.

**Phase 0 exit:** no visual regression; reveals/hover/underline/pulse work; reduced-motion verified; fonts self-hosted; favicon/OG present; Lighthouse Perf & CLS hold or improve.

---

## PHASE 1 — Structural / Layout (editorial composition)

### Task 1.1 — Asymmetric hero grid
**Target:** `app/page.tsx` HERO `<section>`
**Before:** `grid lg:grid-cols-2 gap-14 items-center`; copy `text-center lg:text-left`; right column = 2×2 glyph grid.
**After:** `lg:grid-cols-[1.15fr_0.85fr]` with `items-start` and a downward offset on the visual cluster (`lg:mt-16`), asymmetric `gap` via tokens. Replace the glyph grid with `<Showcase beforeSrc="/showcase/before-1.jpg" afterSrc="/showcase/after-1.jpg" afterLabel="Executive" priority />`, positioned to slightly overlap the copy column at `lg` using relative/negative margin with managed `z-index`. Keep badge, headline, subhead, CTA, trust strip.
**Acceptance:** No overlap/clipping at 360/768/1024/1440. Showcase overlaps copy only ≥1024px; stacks cleanly below. LCP element (headline or after-image) has no CLS. Hero CTA remains above the fold on 360×640.

### Task 1.2 — Vary section rhythm and header alignment
**Target:** `app/page.tsx` all content `<section>`s
**Before:** every section `px-6 py-24`, headers `text-center`.
**After:** Replace uniform `py-24` with tokenized varied vertical rhythm (e.g. alternate `--space-lg`/`--space-xl`). Move at least two section eyebrows/headers to a left-aligned editorial position with an offset rule/line; keep others centered for contrast. Do not change section copy.
**Acceptance:** Sections no longer share identical spacing; reading order and anchor links (`#how-it-works`,`#pricing`,`#faq`) still work; responsive matrix clean.

### Task 1.3 — Layered Comparison + grid-breaking Pricing
**Target:** `app/page.tsx` COMPARISON and PRICING sections
**Before:** Comparison = two equal cards; Pricing = 3 equal cards, "Standard" differentiated only by a gradient border.
**After:** Comparison — elevate the SnapShot column above the studio column (offset + `--shadow-3` + `--glow-gold`), studio column recessed/desaturated, optional connective element. Pricing — the "Standard" card breaks the grid baseline via `lg:scale-105 lg:-translate-y-4` and higher elevation, not just a border; keep all three tiers, prices, features, and links.
**Acceptance:** Prices and CTAs unchanged and clickable. "Standard" clearly dominant. No horizontal scroll at any breakpoint. Tap targets ≥ 44px.

### Task 1.4 — Stagger system for reveals (replace `.delay-*`)
**Target:** `components/Reveal.tsx`, `app/globals.css`, call sites in `app/page.tsx`
**Before:** hardcoded `.delay-100…700` classes + `delay` prop via `setTimeout`.
**After:** Keep the `delay` prop (it already staggers via `setTimeout`) but standardize its use; ensure the reveal transition uses `--ease-out` from Task 0.1. Remove reliance on the undefined `.delay-*` utility classes where `Reveal delay={}` already covers it.
**Acceptance:** Staggered entrance intact and smooth; no dependency on undefined classes; reduced-motion disables it.

**Phase 1 exit:** editorial asymmetry present; no layout break at 360/768/1024/1440; funnel CTAs still above fold on mobile; anchors intact.

---

## PHASE 2 — Visual Layer (typography, material, depth, assets, brand)

### Task 2.1 — Fluid typography ramp
**Target:** `app/page.tsx`, `app/upload/page.tsx`, `app/preview/page.tsx`, `app/success/page.tsx`, headings in components
**Before:** fixed steps e.g. `text-5xl md:text-7xl`, `text-4xl md:text-5xl`.
**After:** Swap primary display/H1/H2 to the `clamp()` tokens from Task 0.1 via small utility classes (e.g. `.t-display{font-size:var(--fs-display);line-height:.95;letter-spacing:-.02em;}`, `.t-h1`, `.t-h2`, `.t-body`). Apply to hero headline (display), page H1s (h1), section H2s (h2). Tune tracking/leading for the serif at large sizes.
**Acceptance:** Type scales smoothly 360→1440 with no wrapping breakage; no overflow-x; contrast unchanged; WCAG AA holds.

### Task 2.2 — Material & elevation tiers (retire the single flat card)
**Target:** `app/page.tsx`, `app/preview/page.tsx`, `components/*`
**Before:** one card style everywhere: `rounded-2xl border border-border bg-charcoal/50`.
**After:** Introduce 2–3 surface tiers using tokens: base (`bg-charcoal/40`, `--shadow-1`), raised (`--shadow-2` + subtle top inner-glow), hero/featured (`--shadow-3` + `--glow-gold` + hairline gold border). Add a faint 1px top highlight (`border-t` lighter) on raised surfaces for a tactile edge. Apply per section so cards read as intentionally differentiated, not uniform.
**Acceptance:** Distinct depth hierarchy visible; borders/contrast still AA; no new CLS; hover `.lift` still applies on interactive cards.

### Task 2.3 — Wire real before/after assets into hero + a proof strip
**Target:** `app/page.tsx`, `components/Showcase.tsx`
**Before:** placeholders from Task 0.4 in the hero only.
**After:** Hero uses pair 1. Add a compact "styles proof" strip near the Styles section using `after-2…4.jpg` as a layered/overlapping trio (each with a style label + one shared "Illustrative examples" caption). All driven by `public/showcase/` files.
**Acceptance:** Images render with explicit dimensions (no CLS); labels/captions present; overwriting placeholder files needs no code change; `alt` text meaningful.

### Task 2.4 — Refined logo lockup + lightweight preloader
**Target:** `components/SiteNav.tsx`, `components/FlowNav.tsx`, `components/SiteFooter.tsx`, new `components/Preloader.tsx` (+ mount in `app/layout.tsx` or landing)
**Before:** logo is plain `Snap<span>Shot</span> AI` text; no preloader.
**After:** Refine the wordmark (kerning, weight, a small gold mark/dot motif) into a shared `<Logo/>`; reuse across nav/footer. Add a minimal, fast (<600ms) obsidian preloader that fades out on load — **must** be skipped/instant under `prefers-reduced-motion` and must never block content or hurt LCP (CSS-only, no blocking JS).
**Acceptance:** Logo consistent everywhere; preloader adds ≤ 0ms to LCP (measure), fades out, and is disabled under reduced-motion; no FOUC.

**Phase 2 exit:** WCAG AA holds on all new surfaces; Accessibility ≥ 95; no new CLS from imagery/preloader.

---

## PHASE 3 — Micro-interactions & Motion System (CSS-only)

### Task 3.1 — Motion tokens + tactile CTA/press states
**Target:** `app/globals.css`, all primary CTAs
**Before:** ad-hoc `hover:scale-105`/`hover:scale-[1.02]`; no press feedback; no shared curve.
**After:** Standardize hover/active with `--ease-out`; add `:active{transform:translateY(1px) scale(.99)}` press feedback on buttons; a subtle sheen/glow on the gold CTA on hover. Keep transforms GPU-friendly (`transform`/`opacity` only).
**Acceptance:** Buttons feel tactile; 60fps on mid-tier mobile; all disabled under reduced-motion.

### Task 3.2 — Nav, FAQ, and stepper interaction polish
**Target:** `components/SiteNav.tsx`, `components/FlowNav.tsx`, `components/FAQ.tsx`, `components/Stepper.tsx`
**Before:** FAQ toggle likely instant; nav underline now works (0.1); stepper static.
**After:** FAQ: smooth max-height/opacity expand with `--ease-out` (reduced-motion → instant). Nav: refine mobile menu open/close transition. Stepper: subtle animated fill on the active node.
**Acceptance:** All transitions smooth and interruptible; keyboard-operable; reduced-motion path instant; no CLS on FAQ expand.

### Task 3.3 — Scroll-reveal orchestration on funnel pages
**Target:** `app/upload/page.tsx`, `app/preview/page.tsx`, `app/success/page.tsx`
**Before:** funnel pages don't use `Reveal`.
**After:** Wrap key blocks in `Reveal` with light stagger for a curated entrance (do not wrap or delay anything that gates interaction — dropzone, email input, buttons must be immediately usable). Reduced-motion → visible instantly.
**Acceptance:** Entrance feels intentional; no interaction is delayed or hidden pending animation; reduced-motion safe.

**Phase 3 exit:** 60fps on mid-tier mobile; no motion required to use any flow; reduced-motion fully functional.

---

## PHASE 4 — Per-Surface Redesign Pass

### Task 4.1 — Extract shared `FlowNav` and replace the 3 hand-rolled navs
**Target:** new `components/FlowNav.tsx`; edit `app/upload/page.tsx`, `app/preview/page.tsx`, `app/success/page.tsx`
**Before:** each page has its own `<nav>...</nav>` with logo + status dot.
**After:** `FlowNav` takes `status` label + optional `step` and renders shared `<Logo/>` + status. Replace the three inline navs.
**Acceptance:** All three pages use `FlowNav`; visual parity or better; no duplicated nav markup remains.

### Task 4.2 — Upload surface elevation
**Target:** `app/upload/page.tsx` (presentation only)
**Before:** centered column, generic dropzone, uniform 2×2 tips.
**After:** Apply asymmetric intro, elevated tactile dropzone (layered surface, working `upload-active`/drag state, clearer affordance), editorial tip layout, tokenized progress state. **Do not touch** `onDrop`, `compressToDataUrl`, `handleSubmit`, polling, state, or `aria-live`.
**Acceptance:** Upload → compress → generate → redirect flow works identically; drag state visible; progress readable; `aria-live` intact; matrix clean.

### Task 4.3 — Preview / "customization" surface
**Target:** `app/preview/page.tsx` (presentation only)
**Before:** symmetric 2-col; flat tier buttons; plain canvas frame.
**After:** Layered "proof" preview frame with caption; tier cards become tactile elevation cards with gold-accent selected state + animated check + clearer price hierarchy; "Most Popular" lifted. **Do not touch** the canvas `useEffect`, `selectedTier` logic, `handleCheckout`, tiers/prices, or the 409 handling.
**Acceptance:** Watermark canvas still draws; tier select + checkout work; prices unchanged; keyboard-selectable tiers; matrix clean.

### Task 4.4 — Success + Footer + landing sections polish
**Target:** `app/success/page.tsx`, `components/SiteFooter.tsx`, remaining `app/page.tsx` sections (Trust, Styles, FAQ)
**After:** Apply tokens, elevation tiers, editorial spacing, working link/hover/focus states, refined confirmation mark. Keep share logic and all copy/links.
**Acceptance:** Consistent system across all surfaces; nothing templated remains; links/focus states work; AA holds.

**Phase 4 exit:** every surface reflects the new system; upload-start & checkout-completion hold or improve (Phase 5 gate).

---

# Section C — QA & Rollout Plan

## C1. Validation matrix (run at each phase exit)
**Responsive** — verify no break, no horizontal scroll, tap targets ≥ 44px at **360 / 768 / 1024 / 1440px** on: landing, upload, preview, success.
**Keyboard/a11y** — every interactive element reachable and operable by keyboard; visible focus (Task 0.1); tier selection and FAQ operable without a mouse; run axe/Lighthouse a11y; **no WCAG 2.1 AA contrast failures** (watch `cream-muted` on `charcoal`).
**Reduced motion** — with OS "reduce motion" on: no animation, all content visible, funnels fully usable, preloader instant.
**Functional smoke (must pass, unchanged behavior):**
- Upload: drag+click add, compress, `generate-preview`, poll, redirect to `/preview` with params.
- Preview: watermark canvas draws; tier switch; `create-checkout` → Stripe redirect; 409 "session expired" path.
- Success: renders from params; share/copy works.

## C2. Performance gates (Lighthouse, mobile preset, production build)
| Metric | Target |
|---|---|
| Performance | ≥ 90 |
| Accessibility | ≥ 95 |
| Best Practices | ≥ 95 |
| SEO | ≥ 90 |
Also: CLS ≤ 0.05 on all pages; LCP not regressed by hero imagery/preloader; no render-blocking fonts; all `public/showcase/` and `/og.png` images have explicit dimensions.

## C3. Rollout & rollback
- **One branch/PR per phase** → one Vercel preview URL per phase. Review visually + run C1/C2 on the preview before merge.
- **Ship order:** Phase 0 first (neutral, pure win) → 1 → 2 → 3 → 4. Phases can be split into smaller PRs if a diff gets large.
- **Rollback:** each phase is an isolated PR; revert = revert that PR. No data/schema/API changes means reverts are always safe.
- **Asset drop-in (final step):** Logan overwrites `public/showcase/before-*.jpg` / `after-*.jpg` (and `/og.png`) with real images at the documented dimensions; redeploy. No code change.

## C4. Conversion guard + A/B hypotheses
- **Guard metrics:** upload-start rate (landing→/upload) and checkout-completion rate (preview→success). Neither may drop measurably vs. the pre-redesign baseline.
- **A/B hypotheses (if analytics available):**
  1. *Hero:* real before/after showcase increases upload-start rate vs. the old glyph hero.
  2. *Preview:* elevated tactile tier cards increase checkout-completion vs. flat buttons.
  3. *CTA:* tactile press + sheen on the gold CTA increases click-through.
  Run one variable at a time; keep the pre-redesign build as control if traffic allows.

---

# Section D — Open inputs from Logan
1. **Production domain** for `metadataBase` (Task 0.3).
2. **Final showcase images** (before/after pairs) + **`/og.png`** — dropped in at the end at documented dimensions.
3. **Analytics** availability (for the C4 guard metrics / A/B). If none, we validate qualitatively and rely on Lighthouse + smoke tests.

*End of directives. Sonnet: begin at Task 0.1 and proceed in order, one phase per PR.*
