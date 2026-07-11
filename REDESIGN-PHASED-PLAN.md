# SnapShot AI — Premium Redesign: Phased Implementation Plan

> **Status: PLAN FOR APPROVAL.** This document covers Deliverable 1 (Phased Implementation Plan) only. Component-by-component specs and Sonnet-ready code directives are gated behind your approval and will follow once this plan is signed off.

---

## 0. Stack (confirmed from the codebase — placeholders now filled)

| Item | Reality in the repo |
|---|---|
| Framework | **Next.js 14.2.3**, App Router, React 18, TypeScript |
| Styling | **Tailwind CSS 3.3** + hand-written CSS in `app/globals.css` (CSS vars + custom utility classes) |
| Motion | **Native CSS** animations/transitions + one `IntersectionObserver` (`components/Reveal.tsx`). No Framer Motion / GSAP. |
| Build | Next.js default (SWC) |
| Deploy | **Vercel** (`.vercel/` present) |
| Backend | Stripe (checkout), Replicate (generation), Resend (email), react-dropzone (upload) |
| Surfaces | `app/page.tsx` (landing), `app/upload`, `app/preview`, `app/success`, `app/privacy`, `app/terms`; components: `SiteNav`, `SiteFooter`, `StickyBuyBar`, `Stepper`, `Reveal`, `FAQ` |

The existing design is already on a strong editorial footing: obsidian/gold/cream palette, Cormorant Garamond display serif + DM Sans body, grain overlay, gold shimmer. This is **elevation, not a teardown** — the raw materials are good; the execution has gaps.

---

## 1. Audit — concrete findings (grounded in the actual files)

**A. Broken / no-op styling (highest-leverage, lowest-risk fixes)**
1. `.reveal` / `.is-visible` (used by `Reveal.tsx`) are **never defined** in `globals.css`. Scroll-reveal currently does nothing on the landing page — content just appears. The only `.reveal` rule that exists is the `<noscript>` fallback in `layout.tsx`.
2. `.lift` + `:hover` (card hover-raise, used on every card) — **undefined**. Cards don't lift.
3. `.link-underline` (nav links) — **undefined**. No animated underline.
4. `.pulse-soft` (hero live badge dot) — **undefined**. No pulse.
   → These four alone mean a large fraction of the intended polish isn't rendering.

**B. Motion / accessibility**
5. **No `prefers-reduced-motion` handling anywhere.** This is a hard constraint in the brief and is currently unmet.
6. Motion is ad-hoc: hardcoded `.delay-100 … .delay-700` classes, no shared easing curve, no coherent stagger system.
7. Custom focus-visible states aren't defined; keyboard focus relies on browser defaults (accessibility + polish gap).

**C. Composition (the core of the brief)**
8. Nearly every section is `max-w-* mx-auto` + `text-center` + uniform `grid` with **identical card dimensions and equal gaps** — the exact "assembled, not designed" symmetry the brief wants broken.
9. No layering, overlap, or asymmetry. Depth = flat `rounded-2xl border bg-charcoal/50` cards, repeated ~6 times across sections.

**D. Typography**
10. Fixed Tailwind steps (`text-5xl md:text-7xl`) instead of fluid `clamp()`. No intentional overflow/breathing, minimal tracking control.

**E. Performance / brand plumbing**
11. Fonts loaded via CSS `@import` (render-blocking, causes FOUT/CLS). Should move to **`next/font`** (self-hosted, zero layout shift, LCP win).
12. `.grain::before` is `z-index: 9999` — above nav and any future modal. Too high.
13. Gold gradient `linear-gradient(135deg,#E2C06A,#C9A550)` is inlined via `style={{}}` in ~15+ places — should be one token/utility for consistency + maintainability.
14. `layout.tsx` metadata has **no favicon, no icons, no theme-color, no canonical, no OG image**. `SnapShot-AI-launch-graphic.png` exists in the project root but isn't wired as an OG asset.
15. Hero "visual assets" are abstract `PortraitGlyph` SVGs + gradient cards — placeholder-grade, the weakest visual moment on the page.

**F. Consistency**
16. `upload`, `preview`, `success` each hand-roll their own `<nav>` instead of reusing a shared component — drift risk and duplicated markup.

---

## 2. Phased plan

Each phase is independently shippable and ordered so risk rises only after the safe foundation is in. Effort is rough (S/M/L) for a focused implementation pass.

### Phase 0 — Foundation & Design Tokens *(safe, no visible layout change)* — **M**
Make the existing intent actually render, and centralize the vocabulary everything else builds on.
- Restore the missing utilities (`.reveal/.is-visible`, `.lift`, `.link-underline`, `.pulse-soft`) in `globals.css`.
- Add a **`prefers-reduced-motion`** guard that neutralizes all transforms/animations.
- Introduce a **design-token layer** (CSS custom properties): spacing scale, easing curves, radii, elevation/shadow tiers, the gold-gradient token, fluid type ramp.
- Migrate fonts to **`next/font`**; drop the render-blocking `@import`.
- Fix grain `z-index`; add favicon/icons/theme-color/OG metadata wiring.
- **Exit criteria:** no visual regression; Lighthouse Performance and CLS improve or hold; reveals/hover/underline now animate; reduced-motion verified.

### Phase 1 — Structural / Layout (editorial composition) — **L**
Break the symmetry, section by section, using the tokens from Phase 0.
- Replace centered/uniform grids with **asymmetric editorial grids** (irregular column spans, offset containers, intentional negative space).
- Introduce controlled **overlap and layering** (z-managed) — imagery/type crossing module boundaries in the hero and key sections.
- Establish **varied vertical rhythm** (not uniform `py-24` everywhere).
- **Exit criteria:** no layout break at 360 / 768 / 1024 / 1440px; no reduction in tap-target sizes or reading order; CTAs remain above the fold on mobile.

### Phase 2 — Visual Layer (type, material, depth, assets, brand) — **L**
- **Typography:** fluid `clamp()` ramp, refined tracking/leading, intentional display overflow where art-directed.
- **Material & depth:** layered surfaces, refined borders/gradients/inner-glow, elevation tiers replacing the single flat card.
- **Visual assets:** upgrade the hero transformation visual (real before/after treatment or a materially richer illustrative system than the current glyphs).
- **Brand identity:** finalize logo lockup, favicon set, and a lightweight preloader consistent with the palette.
- **Exit criteria:** WCAG 2.1 AA contrast holds on all new surfaces; Accessibility ≥ 95; no new CLS from imagery.

### Phase 3 — Micro-interactions & Motion System — **M**
- Codify a **motion system**: shared easing curves, a stagger utility to replace `.delay-*`, hover/press states, page-transition treatment, tactile CTA feedback.
- All motion **optional and non-essential**, fully gated by `prefers-reduced-motion`.
- **Exit criteria:** 60fps on mid-tier mobile; no motion required to understand or use any flow; reduced-motion path fully functional.

### Phase 4 — Per-Surface Redesign Pass — **L**
Apply Phases 1–3 to each surface, plus surface-specific fixes:
- **Hero / landing**, **Upload guidelines**, **Preview + package selection ("customization experience")**, **Nav/global layout**, **Success**, **Footer**.
- Consolidate the three hand-rolled `<nav>` blocks into shared components.
- **Exit criteria:** upload-start rate and checkout-completion rate hold or improve (see Phase 5).

### Phase 5 — QA, Performance & Rollout — **M**
- Lighthouse gate: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.
- Responsive matrix (360/768/1024/1440), keyboard-nav pass, contrast pass, reduced-motion pass.
- **Rollout:** ship Phase 0 first (pure win), then branch-preview each subsequent phase on Vercel; propose A/B hypotheses (hero variant, CTA treatment) since checkout/upload are the guarded conversion metrics.
- **Rollback:** each phase is a discrete PR on its own preview URL; revert = revert the PR.

---

## 3. Dependencies & sequencing
- Phase 0 unblocks everything (tokens + working primitives).
- Phases 1 → 2 → 3 are best done in order but can overlap per-surface.
- Phase 4 depends on 1–3; Phase 5 runs continuously and gates each merge.

## 4. Risk register
| Risk | Mitigation |
|---|---|
| Asymmetric layouts break small screens | Mobile-first; test matrix every phase; keep a symmetric fallback under a breakpoint |
| Motion hurts Lighthouse/perf | CSS-first, GPU-friendly transforms only; `content-visibility`; measure each phase |
| Redesign dips conversion | Phase 0 is neutral; guard funnel metrics; A/B the hero and CTA |
| Real photography unavailable | Illustrative-system fallback path kept in Phase 2 |

## 5. Confirmed decisions
1. **Motion: CSS-only.** No motion library — hand-tuned CSS transitions/animations, GPU-friendly transforms, fully `prefers-reduced-motion`-gated. Protects Lighthouse and bundle size.
2. **Hero/visual assets: real before/after images.** We'll wire real headshot examples (yours or generated via the existing Replicate pipeline) into the hero and proof sections, replacing the abstract glyphs. Fallback illustrative system retained only if a specific asset is missing.
3. **Scope: full transformation** — directives for all 6 phases across every surface.

## 6. Assumptions (stated per brief)
1. **"Customization experience"** = the package/style-selection UX on the preview page (and style presentation on landing), **not** a new product feature. APIs and data model untouched.
2. No backend/API/pricing changes — visual/UX layer only.
3. `SnapShot-AI-launch-graphic.png` can serve as the OG/share image.
