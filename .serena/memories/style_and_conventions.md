# Style & Conventions

- Follow Takuto Wada TDD: smallest failing test → green → refactor; triangulate behavior; write tests for bugs before fixes.
- Language: discussions in Japanese; commit messages/comments ok in English.
- Formatting: Prettier with Astro plugin (2-space) via `npm run format`; avoid manual tweaks.
- Naming: Astro components PascalCase (`Component.astro`); utilities camelCase.ts; exports action-oriented.
- Layout: shared chrome in `src/layouts/`; reusable UI in `src/components/`; pages under `src/pages/`; content collections under `src/content/`; design tokens/styles under `src/styles/`; assets in `public/`.
- CSS tokens defined in `src/styles/global.css`; container max-width 1200px with padding; responsive breakpoints at 768px; utility classes (`grid-2`, `grid-3`, `card`, `btn*`, etc.) reuse.
- Navigation uses `Layout.astro` with fixed top navbar and container wrappers; `withBase` helper for base paths.