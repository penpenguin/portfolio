---
name: Linear Bento Portfolio Design System
version: 1.0.0
base: Linear-inspired, customized for a BentoUI portfolio
mode: light-first, dark-compatible
scope: visual direction only
---

# DESIGN.md — Linear Bento Portfolio

## 1. Design North Star

Create a portfolio that feels precise, quiet, and product-minded.

The site should not feel like a generic SaaS landing page, a dashboard template, or a decorative showcase. It should feel like a carefully edited engineering/design artifact: calm surface hierarchy, sharp typography, restrained color, deliberate spacing, and high-quality project presentation.

Keep the existing BentoUI composition. Improve the perceived quality through surface treatment, spacing, typography, media framing, and interaction states.

Primary attributes:

- precise
- minimal
- calm
- engineered
- tactile but restrained
- portfolio-first, not SaaS-template-first

## 2. Non-Negotiable Visual Rules

### Preserve

- Preserve the Bento grid concept.
- Preserve the current high-level page structure.
- Preserve card-based composition.
- Preserve the portfolio/content hierarchy unless a visual problem requires a small adjustment.
- Preserve a mostly neutral palette with one scarce accent color.

### Avoid

- Do not redesign the entire site.
- Do not introduce a loud visual theme.
- Do not add decorative gradients as a default card treatment.
- Do not use large emoji, novelty icons, floating blobs, glassmorphism, or spotlight-card effects.
- Do not make every card visually equal.
- Do not make every card visually loud.
- Do not use strong drop shadows to create hierarchy.
- Do not use a second chromatic accent unless it communicates a real state.

## 3. No Eyebrow / Overline Policy

Eyebrow text is forbidden.

Do not place small uppercase category labels above headings. This ban applies even when the pattern is called by another name, including eyebrow, overline, kicker, section label, category label, pre-title, small uppercase label, or muted all-caps label.

Forbidden examples:

- FEATURED PROJECT
- SELECTED WORK
- CASE STUDY
- ABOUT
- EXPERIENCE
- CURRENTLY
- NOW
- BUILT WITH
- LATEST
- OPEN SOURCE

Card titles must stand on their own.

Context should be communicated through:

- the title itself
- card size
- card placement
- image treatment
- body copy
- metadata location
- CTA placement
- restrained state badges

Allowed:

- Dates as metadata, but never above the title in an eyebrow-like position.
- Technology tags, but place them below the body copy or in the card footer.
- Functional badges only when they indicate real state, such as Live, Archived, Private, Open Source, or WIP.

Never use muted, letter-spaced, all-caps text above a card title as a decorative hierarchy device.

## 4. Visual Theme & Atmosphere

Use Linear-inspired precision, but adapt it to a light-first portfolio.

The atmosphere should be quiet and exact. The canvas should feel like a clean workbench. Cards should feel like intentionally placed panels, not generic tiles.

Use a restrained surface ladder instead of strong shadows:

- page canvas
- base card surface
- lifted/featured card surface
- nested media surface
- subtle hairline borders

The accent color should appear rarely. It should guide interaction and emphasis, not decorate the page.

## 5. Color System

### Light Theme — Default

Use this palette unless the existing site is already dark-first.

| Token | Value | Role |
|---|---:|---|
| `canvas` | `#f7f8fb` | Page background |
| `surface-1` | `#ffffff` | Default Bento cards |
| `surface-2` | `#f2f4f8` | Featured/lifted cards |
| `surface-3` | `#e9edf4` | Nested media wells, subtle panels |
| `surface-inset` | `#f9fafc` | Screenshot frame interior |
| `ink` | `#0b0d12` | Primary text |
| `ink-muted` | `#4b5565` | Secondary text |
| `ink-subtle` | `#7c8493` | Metadata, helper text |
| `ink-tertiary` | `#a0a7b5` | Disabled/very low priority text |
| `hairline` | `#dfe3ea` | Default card border |
| `hairline-strong` | `#cbd2df` | Hover/focus border |
| `primary` | `#5e6ad2` | Scarce accent, links, primary CTA |
| `primary-hover` | `#6f7be8` | Accent hover |
| `primary-soft` | `rgba(94, 106, 210, 0.10)` | Subtle active surface only |
| `success` | `#27a644` | Real positive status only |
| `danger` | `#d92d20` | Real destructive/error status only |

### Optional Dark Theme

Use only if the portfolio already has a dark theme or the user explicitly wants one.

| Token | Value | Role |
|---|---:|---|
| `canvas` | `#010102` | Near-black page background |
| `surface-1` | `#0f1011` | Default dark cards |
| `surface-2` | `#141516` | Hover/lifted cards |
| `surface-3` | `#18191a` | Nested panels |
| `ink` | `#f7f8f8` | Primary text |
| `ink-muted` | `#d0d6e0` | Secondary text |
| `ink-subtle` | `#8a8f98` | Metadata |
| `hairline` | `#23252a` | Default dark border |
| `hairline-strong` | `#34343a` | Hover/focus border |
| `primary` | `#5e6ad2` | Scarce accent |

### Color Rules

- Use lavender only for links, primary CTA, focus rings, selected states, and a few meaningful highlights.
- Do not use lavender as a large card background.
- Do not add pink/orange/green/blue gradients as decorative fills.
- Do not color-code every project card.
- Keep project thumbnails visually consistent; their content may be colorful, but the surrounding frame should stay neutral.

## 6. Typography

### Font Stack

Use a clean grotesk/sans stack.

Recommended:

```css
font-family: Inter, Geist, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Use a mono font only for actual code, version numbers, compact technical tokens, or command-like text.

Recommended mono:

```css
font-family: "Geist Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
```

### Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---:|---:|---:|---:|---|
| `display` | `clamp(44px, 7vw, 80px)` | 600 | 0.98–1.04 | `-0.055em` | Hero headline |
| `section-title` | `clamp(32px, 4vw, 56px)` | 600 | 1.05 | `-0.045em` | Section titles |
| `card-title-lg` | `clamp(24px, 2.5vw, 34px)` | 600 | 1.08 | `-0.04em` | Featured card titles |
| `card-title` | `20px–24px` | 560–600 | 1.18 | `-0.03em` | Standard card titles |
| `body-lg` | `18px–20px` | 400 | 1.55 | `-0.01em` | Hero/subhead copy |
| `body` | `15px–16px` | 400 | 1.6 | `0` | Default body |
| `body-sm` | `13px–14px` | 400 | 1.55 | `0` | Card support text |
| `caption` | `12px–13px` | 400–500 | 1.4 | `0` | Metadata below content |
| `button` | `14px` | 500 | 1.2 | `0` | Button labels |
| `mono` | `12px–13px` | 400 | 1.5 | `0` | Code/tokens only |

### Typography Rules

- Use negative tracking on large headings.
- Avoid heavy 700+ weights unless absolutely necessary.
- Keep card titles concise.
- Use body copy to clarify, not to explain everything.
- Do not use all-caps labels as visual decoration.
- Do not use uppercase letter-spacing to create hierarchy.
- Metadata should be quiet and secondary, not a pre-title.

## 7. Layout & Bento Composition

### Container

- Max width: `1120px–1240px`.
- Page side padding: `20px` mobile, `32px` tablet, `40px–48px` desktop.
- Align content to a consistent grid. Avoid random card offsets.

### Bento Grid

Use a 12-column mental model on desktop.

Recommended grid:

- Desktop: 12 columns
- Tablet: 6 columns
- Mobile: 1 column

Recommended gap:

- Mobile: `12px`
- Tablet: `14px–16px`
- Desktop: `16px–20px`

Card interior padding should be larger than the grid gap.

Recommended card padding:

- Small cards: `20px–24px`
- Standard cards: `24px–28px`
- Featured cards: `28px–36px`

### Composition Rules

- Make 1–2 cards clearly dominant through size, title scale, and media treatment.
- Keep supporting cards quieter.
- Use asymmetry deliberately, not randomly.
- Avoid a wall of identical cards.
- Do not rely on labels like “Featured Project” to create hierarchy.
- Featured work should feel featured because the card is larger, better framed, and more visually resolved.

## 8. Surface, Border, Radius, and Depth

### Radius Scale

| Token | Value | Use |
|---|---:|---|
| `radius-xs` | `4px` | Tiny tags, small indicators |
| `radius-sm` | `8px` | Buttons, small controls |
| `radius-md` | `12px` | Inner elements, media chrome |
| `radius-card` | `18px` | Default Bento cards |
| `radius-featured` | `22px` | Large hero/project cards |
| `radius-xl` | `28px` | Rare large section panels |
| `radius-pill` | `9999px` | Functional status pills only |

### Border Rules

- Default border: `1px solid hairline`.
- Hover border: `1px solid hairline-strong`.
- Avoid thick borders.
- Avoid colorful borders except focus states.
- Nested media frames may use a slightly stronger border than the parent card.

### Shadow Rules

Use almost no shadow.

Allowed light-theme shadow:

```css
box-shadow:
  0 1px 2px rgba(15, 23, 42, 0.04),
  0 12px 32px rgba(15, 23, 42, 0.05);
```

Allowed dark-theme shadow:

```css
box-shadow:
  inset 0 1px 0 rgba(255, 255, 255, 0.035),
  0 24px 80px rgba(0, 0, 0, 0.28);
```

Do not use large blurred glow shadows.
Do not use neon card glows.
Do not use spotlight gradients behind cards.

## 9. Core Components

### Bento Card

Default card treatment:

- Background: `surface-1`
- Border: `hairline`
- Radius: `radius-card`
- Padding: `24px–28px`
- Shadow: minimal or none
- Text: `ink`
- Body: `ink-muted`

The card should feel crisp, not soft or bubbly.

Hover:

- Translate up by `1px–2px` maximum.
- Border becomes slightly stronger.
- Background may shift one surface level.
- Do not scale the card.
- Do not add glow.

### Featured Project Card

Featured project cards must not use “FEATURED PROJECT” or any eyebrow label.

Use these instead:

- larger card span
- larger title
- stronger media frame
- more generous internal spacing
- clearer CTA
- slightly lifted surface

The title should carry the card.

### Project Media Frame

Project screenshots should look curated, not pasted in.

Rules:

- Use a consistent aspect ratio across project cards when possible.
- Prefer `16:10`, `4:3`, or a deliberate tall mobile ratio.
- Use a neutral frame around screenshots.
- Use inner radius smaller than the card radius.
- Keep screenshot padding consistent.
- Avoid mixing raw browser screenshots with cropped UI fragments unless the composition is intentional.
- Do not let screenshots touch the outer card edge unless it is a deliberate full-bleed hero card.

### Tags and Metadata

Tags belong below the description or in the footer area of the card.

Good placements:

- under the body copy
- aligned along the bottom edge
- after CTA
- in a compact row with low contrast

Bad placements:

- above the card title
- as uppercase taxonomy labels
- as large colorful pills

Technology tags should be quiet and functional.

### CTA

CTAs should be compact and precise.

Recommended labels:

- View project
- Read case study
- Open live site
- View source
- See details

Visual rules:

- Buttons use `radius-sm` or `radius-md`, never oversized pills.
- Text links can use a small arrow.
- Primary CTA may use `primary`; secondary CTAs should stay neutral.
- Avoid multiple primary CTAs in the same viewport.

### Status Badge

Status badges are allowed only when they indicate real state.

Allowed examples:

- Live
- WIP
- Archived
- Open Source
- Private

Rules:

- Use small text.
- Use pill radius only for badges.
- Place near metadata or footer, not above the title as an eyebrow.
- Keep the color neutral unless the state requires color.

## 10. Imagery & Project Presentation

Images should be the highest-quality visual element on the page.

Rules:

- Crop all project thumbnails consistently.
- Avoid inconsistent screenshot zoom levels.
- Avoid mixed image brightness across adjacent cards.
- Add neutral background padding around screenshots.
- Keep image radius one step smaller than the parent card.
- Use thin hairline frames for screenshots.
- If a project has weak visuals, use a typographic composition, interface fragment, or neutral product mockup instead of a low-quality screenshot.

Avoid:

- raw full-page screenshots that are unreadable
- screenshots with browser UI clutter unless styled intentionally
- random image aspect ratios
- overly saturated image backgrounds
- thumbnails that fight with the site accent color

## 11. Interaction & Motion

Motion should be nearly invisible.

Allowed:

- `120ms–180ms` transition duration
- small translate on hover
- border/surface transition
- subtle arrow movement on CTA
- focus ring using the primary accent

Avoid:

- bouncy easing
- large parallax effects
- card scaling
- cursor-following glow
- animated gradients
- excessive staggered entrance animations

Use motion to confirm interactivity, not to impress.

## 12. Responsive Behavior

### Desktop

- Preserve Bento rhythm and card span variety.
- Keep the strongest project card near the first viewport.
- Avoid more than 2 visually dominant cards at once.

### Tablet

- Reduce card span complexity.
- Maintain generous card padding.
- Keep image aspect ratios stable.

### Mobile

Mobile should become a clear story, not a compressed mosaic.

Recommended order:

1. hero / identity
2. best work
3. project cards
4. skills or process
5. contact

Rules:

- Single column.
- Remove decorative empty space.
- Keep touch targets at least `44px` when interactive.
- Avoid tiny tag clusters above the fold.
- Titles should remain readable and not wrap awkwardly.

## 13. Do / Don’t

### Do

- Use quiet surfaces and hairline borders.
- Use typography and spacing as the primary design tools.
- Use one scarce lavender accent.
- Make important cards larger, not louder.
- Curate screenshots so they feel intentionally displayed.
- Keep body copy compact and useful.
- Use metadata only where it helps interpretation.
- Treat each Bento card as part of an edited composition.

### Don’t

- Do not use eyebrow/overline/kicker labels.
- Do not use uppercase category labels above headings.
- Do not make cards look like generic SaaS feature tiles.
- Do not use lavender as a decorative background.
- Do not use multiple accent colors.
- Do not add heavy shadows or glow.
- Do not introduce large gradients.
- Do not overuse icons.
- Do not place technology tags before the title.
- Do not let project screenshots vary wildly in tone or aspect ratio.

## 14. Agent Prompt Guide

When improving the site, follow this prompt:

```txt
Use DESIGN.md as the visual source of truth.
Preserve the existing BentoUI portfolio structure.
Do not perform a full redesign.
Improve only visual quality: spacing, card hierarchy, typography, surface treatment, media framing, hover/focus states, and CTA polish.

Linear-inspired precision is the target, but keep the portfolio light-first unless the existing site is already dark.
Use one scarce lavender accent.
Use hairline borders and surface hierarchy instead of heavy shadows.

Strictly remove and avoid eyebrow labels, overline labels, kicker labels, and small uppercase category labels above headings.
Do not replace them with synonyms.
Make card titles stand on their own.
Place dates, tags, and metadata below the title/body or in the card footer.
```

## 15. Visual QA Checklist

Before accepting a design pass, verify:

- No eyebrow/overline/kicker labels remain.
- No muted all-caps labels appear above headings.
- The first viewport has one clear focal point.
- Card hierarchy is visible without labels.
- Grid gap and card padding feel intentional.
- Project screenshots have consistent framing.
- Lavender is used sparingly.
- Borders are subtle and consistent.
- Shadows are minimal.
- Tags and dates do not compete with titles.
- Mobile order reads like a portfolio story.
- The design feels precise, not decorative.
