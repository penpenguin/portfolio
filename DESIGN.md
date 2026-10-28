---
name: Editorial Bento Portfolio Design System
version: 2.4.0
base: Light gray edited collection with restrained terminal details
mode: light-only
scope: visual direction only
---

# DESIGN.md — Editorial Bento Portfolio

## 1. Direction and boundaries

Create a quietly edited collection of working projects and technical notes. Use light gray paper, generous spacing, large serif headings, small monospaced metadata, and precise hairline borders. Home About only uses a black title surface.

Keep the existing BentoUI composition. Preserve the Bento grid concept. Preserve the current high-level page structure and content order. Changes are limited to surface treatment, spacing, typography, media framing, hover/focus states, and CTA polish.

Preserve routes and slugs, Content Collections, date sorting and latest-entry selection, metadata, real links, Pagefind, Astro ClientRouter, archive enhancement, and WebMCP. Do not invent copy, projects, roles, metrics, statuses, or reference numbers. Keep the existing project sequence numbers below titles.

Do not redesign the entire site. Do not introduce a loud visual theme. Do not add decorative gradients, spotlight effects, glow, full-page noise, scan lines, or a theme switch. The static NO IMAGE texture is a local exception. Reference PDF imagery is not material to reuse on the site.

## 2. No Eyebrow / Overline Policy

Eyebrow text is forbidden. Card titles must stand on their own.

Do not add small labels above titles, including FEATURED PROJECT, ARTICLE, ARCHIVE, SELECTED WORK, ABOUT, LATEST, and their synonyms. Do not move dates, numbers, or technology tags above headings.

Keep the order: title → date and existing number → thin divider → description → technology tags → links. Functional archive headings, form labels, and existing semantic admonition labels remain meaningful UI.

## 3. Color system

| Role                     | Value     | Existing token / mapping                            |
| ------------------------ | --------- | --------------------------------------------------- |
| Page                     | `#EDEDED` | `--primary-bg`                                      |
| Card                     | `#E9E9E9` | `--secondary-bg`, `--glass-bg`, `--bento-card-bg`   |
| Inset / selected surface | `#E4E4E4` | `--accent-bg`, `--glass-subtle`, `--bento-muted-bg` |
| Main text / normal links | `#171719` | `--text-primary`, `--text-accent`                   |
| Body / dates / metadata  | `#5B5A60` | `--text-secondary`, `--text-muted`                  |
| Editorial border         | `#D3D2D6` | `--border-editorial`                                |
| Hairline                 | `#C6C5C9` | `--glass-border`                                    |
| Strong border            | `#77767D` | `--border-strong`                                   |
| Focus                    | `#625E72` | `--focus-color`                                     |
| About background         | `#090909` | `--about-bg`                                        |
| About heading            | `#C4C4C4` | `--about-heading`                                   |
| About description        | `#B6B5BB` | `--about-text`                                      |
| About border             | `#36353A` | `--about-border`                                    |
| Primary button hover     | `#36353A` | `--button-hover`                                    |
| Primary button text      | `#EDEDED` | `--on-primary`                                      |

Body text, dates, and ordinary links must meet 4.5:1 contrast on their actual surfaces. Inverse About text must never be reused on light surfaces. Focus is separate from normal link color. Use neutral hover, selection, and scrollbar colors.

Apply About colors directly to its heading and description. Scope the black surface to `.bento-card--intro`, including hover and focus-within; never darken the shared `.bento-hero` class.

Keep original files and article/project body images intact. Blog and Projects list thumbnails use the shared grayscale tone described below; Project detail heroes explicitly use original colors on both layers; never filter cards, text, NO IMAGE, or the entire page. Preserve warning/error colors, admonition categories, and syntax highlighting. These semantic colors are intentional exceptions to the neutral UI palette.

## 4. Typography

| Role                                  | Font                           | Size and leading                                 |
| ------------------------------------- | ------------------------------ | ------------------------------------------------ |
| About                                 | Cormorant Garamond 400         | Desktop 88–104px; mobile 64–80px; 1.02           |
| English page titles / logo            | Cormorant Garamond 400–500     | Page titles 56–80px desktop, 40–56px mobile; 1.1 |
| Project card titles                   | Serif stack, 500               | Desktop 26–30px, mobile 24–28px; 1.35            |
| Japanese card titles                  | Noto Serif JP 500              | Desktop 22–26px, mobile 20–24px; 1.4             |
| Descriptions / prose                  | Inter and Japanese system sans | 16px minimum; 1.8–1.9                            |
| Dates / compact technical tags / code | System monospace               | Metadata 12–13px; 1.5–1.7                        |
| Navigation / controls                 | Inter and system sans          | Approximately 14px; 400–500                      |

Heading fallback: `'Cormorant Garamond', 'Noto Serif JP', 'Yu Mincho', Georgia, serif`. Japanese article headings use Noto Serif JP first. Body fallback includes system Gothic fonts. Do not use dot fonts for prose.

Load Cormorant Garamond 400/500 and Noto Serif JP 500 through the existing Google Fonts CSS delivery with `display=swap`; Japanese font subsets are fetched as needed. Inter uses 400/500/600/700 for UI, prose, and semantic emphasis. Add no font dependency library.

Use slight negative tracking only on large English titles. Keep Japanese tracking neutral, show complete titles, allow natural wrapping, and use emergency word wrapping only for strings too wide for the available space. Do not impose fixed card heights to compensate for different title lengths.

## 5. Grid, surfaces, and media

- Maximum container width: 1200px.
- Page gutters: 32px desktop, 20px mobile.
- Card gaps: 20px desktop, 16px mobile.
- Card padding: 32px desktop, 20px mobile.
- Outer radius: 2px. Controls: 2–4px. Border: 1px. Decorative shadows: none.
- Home desktop: four columns, About spans three, wireframe device one, latest Project and Blog two each.
- Preserve the existing Home breakpoints at 980px and 768px and the stacked order About → wireframe device → Project → Blog. The device remains 240px tall on smaller screens.
- Preserve Projects' two-column grid and featured first card. Preserve Blog's featured card, archive location, and secondary cards.
- Use content-driven heights. Home, Projects and Blog introduction panels share `--page-hero-min-height` (260px above 768px, 240px below), card padding, top headings, bottom descriptions and a 16px minimum gap. Verify their actual standard heights match within 1px; allow natural growth for zoom, long text and font fallback. Align card CTAs using flexible content, not fixed blank space.

Projects reuse the Blog thumbnail component, including zero padding, sharp contain foreground, blurred cover background, shared tone, loading policy and failure handling. List frames remain 220px regular / 360px featured, with the featured frame at 220px on mobile. Detail hero frames retain the current screenshots' 16:10 ratio and reserve space before loading. Card Lighting Demo's central card must remain completely visible. Detail hero frames have a thin editorial border and 2px radius.

Missing, empty or failed Project list images use the same NO IMAGE as Blog; never repeat the project title inside the image frame. Project details with missing or blank heroImage keep the existing centered single-column layout without an image frame. When a specified detail image fails, keep the frame and show NO IMAGE. Detail hero images load eagerly and expose Pagefind image metadata only on the foreground. Do not generate fake interfaces, charts, maps, or counts.

Blog thumbnails retain their existing 150px regular / 260px featured height (180px featured on mobile), with zero padding and no enforced aspect ratio. Use the original image twice: a sharp centered `contain` foreground and a decorative `cover` background with `blur(22px)` extending 32px beyond each edge. Clip both inside an isolated positioning context. Keep the background alt empty and hide it from assistive technology; never blur the foreground. Both image layers share `grayscale(0.92) contrast(0.94) brightness(0.98)` in that order, with the background blur appended. Optional Blog or Projects frontmatter `thumbnailTone: 'original'` preserves informative colors through `grayscale(0) contrast(1) brightness(1)` on both layers. Omit it for the default editorial tone, including the current Blog illustrations and Project thumbnails. Project detail heroes always pass `tone="original"`, independent of the list frontmatter choice; keep the 22px background blur. Keep heroImage and base-path handling. Featured images use eager loading; both layers of other images use native lazy loading. Retain fixed frame dimensions and async decoding.

Missing, empty or failed foreground image URLs use exactly `NO IMAGE`, centered in 13px monospaced type (#3E3E45) with 0.1em tracking over a #C5C5C8 base. A shared non-repeating static SVG spans the frame with subtle broad tonal variation and faint scan remnants; only fine grain repeats as a separate 256px SVG with fixed seed 17, opacity 0.36 and stronger grain-only tonal separation. These external assets have no animation or runtime texture generation. Keep the text sharp and check groups of 3–6 missing-image cards. Do not repeat article titles. Hide this decorative fallback from assistive technology. Failed images hide both layers; loading and fallback states retain the same frame dimensions. The broad prohibition on decorative noise does not apply to this thumbnail-only static texture.

Home uses a wireframe computing device with internal boards, columns, a heat sink and terminals, projected from 3D line segments onto Canvas 2D. Use a light gray inset surface, gray lines at 0.95px for the outline, 0.8px for components, and 0.6px for detail, each with depth-dependent opacity, a fixed elevated camera, and a scale that contains the entire rotation. No filled faces, glass, photographs, glow, metrics or new descriptive copy. Use a compact 1.15:1.8:0.8 open chassis, a vertical backplane, unequal compute/cooling boards, mounting rings, connector pins, capacitors and a few routed/curved wires. Concentrate detail and leave a clear bay. Canvas and static SVG share geometry and line hierarchy. Apply local Y rotation then a fixed -12-degree Z tilt before the camera transform; the tilted axis never wobbles. Derive full-turn analytic bounds from the vertices and use one fixed scale occupying about 78% of the limiting stage dimension. Use the whole panel without a lower control reservation. The independent aquarium website remains unchanged.

Technology tags have a transparent background, a thin editorial border, 2px radius, and small regular-weight monospaced text. Do not use colored pills.

## 6. Shared UI and article content

The header is a full-width opaque gray sticky band at top: 0 in normal flow, with one thin editorial bottom border and no outer gap, radius, blur or shadow. Its inner container aligns the logo with the page gutter and is about 64px tall on desktop; mobile navigation wraps naturally. A ResizeObserver on the persisted header updates scroll-padding for anchor/focus visibility. Remove the old fixed-nav offset. Active navigation uses main text and a fine underline. Keep semantic links, current-page attributes, Search, and keyboard behavior. Check its bottom edge against the first card at 320px, including font fallback.

The body owns min-height: 100vh/100svh; `.site-main` flexes into the remaining space with no viewport minimum or top offset. Page shells use 32px vertical padding on desktop and 24px on mobile. Allow scrolling whenever content needs it; never hide overflow or fix the footer. The footer uses a thin editorial top border, 12px top/bottom spacing and 44px links (about 69px total on desktop), with natural wrapping. Retain generated copyright year, GitHub, and WebMCP links.

Primary buttons use dark gray with light text, including hover. Secondary controls stay neutral. Blog card CTAs are left-aligned underlined “記事を読む →” links with at least 44px height; retain their bottom alignment. One border-bottom on an inner `.read-more__label` spans the text, gap and arrow; the outer link has no separate text decoration. Card borders and thumbnail boundaries use the weaker editorial token, while date dividers and actual controls keep their existing border tokens. Article links must be underlined. Keep all mobile controls and primary navigation targets at least 44px tall.

Pagefind Component UI uses `--pf-*`; set its body-inherited surface, text, border, selected state, focus, radius, and shadow tokens as well as the existing `--pagefind-ui-*` mapping. Preserve error colors, opening/closing, shortcuts, results, focus return, and behavior after ClientRouter navigation. Verify on a production build with the search index.

`formatDate` defaults to `YYYY.MM.DD` using Asia/Tokyo, while explicit locale overrides retain their existing behavior. Keep ISO datetime attributes and machine-readable Pagefind dates unchanged. Archive month headings retain `YYYY/MM`.

Prose remains Gothic; headings are serif. Tables retain native table structure inside named, keyboard-accessible scroll regions. Long code scrolls inside its own block. Neither a table nor a code block should make the article or entire page scroll sideways. Retain lists, quotes, inline code, notes, and syntax colors.

## 7. Motion and verification

Use approximately 150ms transitions. Passive card surfaces do not react to hover. Actual links and controls change borders, text, surfaces, or underlines; it must not lift or scale cards. Respect `prefers-reduced-motion` for decorative motion and scrolling while preserving page rendering and event registration.

Home's device is an explicit motion exception: a continuous one-direction 16-second rotation, calculated from elapsed time, rendered at approximately 30fps with DPR capped at 2. Use the full drawing stage as a native button for click/tap and Enter/Space pause/play, with an accessible action label and inset focus outline. Do not show a separate button or visible control text. Enable it only after Canvas succeeds, and update attributes without replacing its Canvas/SVG children. With JavaScript disabled or Canvas unavailable, leave the stage disabled and outside the focus order. Start still under reduced motion and stop when that preference changes to reduce; explicit play may override it. Stop all scheduled drawing when paused, offscreen, in a hidden tab, or disconnected. Resume without adding hidden time. Preserve the user's pause/play choice and angle across Astro transitions in memory; a full reload initializes from the OS preference. Custom element disconnect must release animation frames, observers and listeners. Render a static SVG from the same geometry when JavaScript or Canvas is unavailable.

Follow the repository's Red → Green → Refactor workflow. Update obsolete visual expectations without deleting or skipping functional coverage. Check normal, hover, focus, selection, image-less, and font-fallback states.

Review Home, Projects, Project detail, Blog, month archive, article detail, and search at 1440px, 390px, and 320px. Also check Home/header around 1024px, 980px, and 768px. Cover long Japanese/English titles, many tags, image framing, device rotation/pause/play/return navigation, reduced motion, offscreen and hidden-tab suspension, thumbnail aspect ratios/transparency/load failures, search keyboard behavior, archive controls, and JavaScript-disabled archive links.

Run lint, type/content checks, unit tests, production build with Pagefind, and the Bento/archive browser tests. Save Home desktop/mobile before-and-after screenshots, inspect representative pages, and report any unverified behavior explicitly.
