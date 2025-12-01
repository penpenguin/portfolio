# Project Overview

- Purpose: Modern portfolio website built with Astro 5; deployed to GitHub Pages (badge in README).
- Tech stack: Astro + TypeScript; global CSS in `src/styles/global.css`; Astro transitions; Vitest + jsdom + @testing-library/dom for tests; Prettier + prettier-plugin-astro for formatting.
- Structure: `src/pages/` route files, `src/layouts/Layout.astro` shared nav/footer, `src/components` reusable pieces (e.g., Link), `src/utils/withBase.ts`, `src/content` for markdown collections, `src/styles` for tokens + tests, `public` for static assets/favicons.
- Configuration: `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.prettierrc`; env examples in `.env.example` (GitHub/X URLs).
- Navigation: Layout builds nav items with base path awareness; navbar fixed; ClientRouter enables transitions.
- Deployment/CI: GitHub Actions workflow `deploy.yml` (badge).