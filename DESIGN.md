---
name: Editorial Bento Portfolio Design System
version: 2.0.0
base: Light gray edited collection with restrained terminal details
mode: light-only
scope: visual direction only
---

# DESIGN.md — Editorial Bento Portfolio

## 1. Direction and boundaries

Create a quietly edited collection of working projects and technical notes. Use light gray paper, generous spacing, large serif headings, small monospaced metadata, and precise hairline borders. Home About only uses a black title surface.

Keep the existing BentoUI composition. Preserve the Bento grid concept. Preserve the current high-level page structure and content order. Changes are limited to surface treatment, spacing, typography, media framing, hover/focus states, and CTA polish.

Preserve routes and slugs, Content Collections, date sorting and latest-entry selection, metadata, real links, the aquarium iframe, Pagefind, Astro ClientRouter, archive enhancement, and WebMCP. Do not invent copy, projects, roles, metrics, statuses, or reference numbers. Keep the existing project sequence numbers below titles.

Do not redesign the entire site. Do not introduce a loud visual theme. Do not add decorative gradients, spotlight effects, glow, noise, scan lines, or a theme switch. Reference PDF imagery is not material to reuse on the site.

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

Keep image and aquarium colors intact. Do not apply grayscale or reduced saturation to images, iframes, or pages. Preserve warning/error colors, admonition categories, and syntax highlighting. These semantic colors are intentional exceptions to the neutral UI palette.

## 4. Typography

| Role                                  | Font                           | Size and leading                                 |
| ------------------------------------- | ------------------------------ | ------------------------------------------------ |
| About                                 | Cormorant Garamond 400         | Desktop 88–104px; mobile 64–80px; 1.02           |
| English page titles / logo            | Cormorant Garamond 400–500     | Page titles 56–80px desktop, 40–56px mobile; 1.1 |
| Project card titles                   | Serif stack, 500               | Desktop 26–30px, mobile 24–28px; 1.35            |
| Japanese card titles                  | Noto Serif JP 500              | Desktop 22–26px, mobile 20–24px; 1.6             |
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
- Home desktop: four columns, About spans three, aquarium one, latest Project and Blog two each.
- Preserve the existing Home breakpoints at 980px and 768px and the stacked order About → aquarium → Project → Blog. The aquarium remains 240px tall on smaller screens.
- Preserve Projects' two-column grid and featured first card. Preserve Blog's featured card, archive location, and secondary cards.
- Use content-driven heights; remove unnecessary mobile hero minimum heights. Align card CTAs using flexible content, not fixed blank space.

Frame images with neutral inset surfaces, thin borders, and 16px inner padding (12px mobile). Existing Project screenshots are 16:10: center them with `object-fit: contain` within their media slots. Card Lighting Demo's central card must remain completely visible. Use the same neutral framing for actual Blog images, without a blurred duplicate backdrop.

When an image is missing, use its existing dynamic title as neutral typography. Do not generate fake interfaces, charts, maps, or counts. Decorative repeated titles are hidden from assistive technology; the actual card heading remains accessible.

Technology tags have a transparent background, thin border, 2px radius, and small regular-weight monospaced text. Do not use colored pills.

## 6. Shared UI and article content

The header stays fixed, with an opaque gray surface, thin bottom border, and no blur or shadow. Active navigation uses main text and a fine underline. Keep semantic links, current-page attributes, Search, and keyboard behavior. Check its bottom edge against the first card at 320px, including font fallback.

The footer uses a thin top border and small text; retain generated copyright year, GitHub, and WebMCP links.

Primary buttons use dark gray with light text, including hover. Secondary controls stay neutral. Article links must be underlined. Keep all mobile controls and primary navigation targets at least 44px tall.

Pagefind Component UI uses `--pf-*`; set its body-inherited surface, text, border, selected state, focus, radius, and shadow tokens as well as the existing `--pagefind-ui-*` mapping. Preserve error colors, opening/closing, shortcuts, results, focus return, and behavior after ClientRouter navigation. Verify on a production build with the search index.

`formatDate` defaults to `YYYY.MM.DD` using Asia/Tokyo, while explicit locale overrides retain their existing behavior. Keep ISO datetime attributes and machine-readable Pagefind dates unchanged. Archive month headings retain `YYYY/MM`.

Prose remains Gothic; headings are serif. Tables retain native table structure inside named, keyboard-accessible scroll regions. Long code scrolls inside its own block. Neither a table nor a code block should make the article or entire page scroll sideways. Retain lists, quotes, inline code, notes, and syntax colors.

## 7. Motion and verification

Use approximately 150ms transitions. Hover changes borders, text, surfaces, or underlines; it must not lift or scale cards. Respect `prefers-reduced-motion` for decorative motion and scrolling while preserving page rendering and event registration.

Follow the repository's Red → Green → Refactor workflow. Update obsolete visual expectations without deleting or skipping functional coverage. Check normal, hover, focus, selection, image-less, and font-fallback states.

Review Home, Projects, Project detail, Blog, month archive, article detail, and search at 1440px, 390px, and 320px. Also check Home/header around 1024px, 980px, and 768px. Cover long Japanese/English titles, many tags, image framing, real aquarium interaction/fullscreen/return navigation, search keyboard behavior, archive controls, and JavaScript-disabled archive links.

Run lint, type/content checks, unit tests, production build with Pagefind, and the Bento/archive browser tests. Save Home desktop/mobile before-and-after screenshots, inspect representative pages, and report any unverified behavior explicitly.
