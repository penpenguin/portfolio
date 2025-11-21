# Repository Guidelines

## Serena Tooling Expectations
- Default to Serena's MCP integrations whenever you need context; it centralizes specs, saved memories, and helper scripts so agents stay in sync.
- Kick off each session by opening the Serena Instructions Manual (call `mcp__serena__initial_instructions`) and listing resources via `list_mcp_resources` to learn what's already documented before poking around the repo.
- Use `read_mcp_resource` (or the parameterized templates) instead of ad-hoc browsing when you need docs from `docs/` or historical decisions, and record new findings with `write_memory` so future agents inherit them.
- Favor Serena's memory + resource workflow during hand-offs (e.g., summarize outs

## Project Structure & Module Organization

- `src/pages/` contains the Astro route files that compile directly to pages.
- `src/layouts/` centralizes shared chrome, metadata, and wrapper logic for pages.
- `src/components/` holds reusable UI pieces; colocate component-specific assets beside the component.
- `src/content/` manages Markdown collections—update the schema before adding new frontmatter fields.
- Design tokens live in `src/styles/`, while raw assets (favicons, OG images) sit under `public/`.

## Build, Test, and Development Commands

- `npm run dev` serves the site locally with hot reload on `http://localhost:4321/`.
- `npm run build` outputs the static production bundle into `dist/`.
- `npm run preview` smoke-tests the built bundle; use it before merging deployment work.
- `npm run check` runs `astro check` for types, content collections, and integration warnings.
- `npm run lint` and `npm run format` run Prettier with the Astro plugin in verify or fix mode.

## Coding Style & Naming Conventions

- Prettier controls formatting (two-space indentation, trailing commas); rely on `npm run format` instead of manual tweaks.
- Name Astro components with `PascalCase.astro`, utility modules with `camelCase.ts`, and exported helpers with action-oriented verbs.
- Group imports by origin: Astro core, third-party packages, then local modules.

## Testing Guidelines

- Follow Takuto Wada’s TDD loop: write the smallest failing Vitest spec, get it green, then refactor.
- Add Vitest plus jsdom (`npm install -D vitest jsdom @testing-library/dom`) and place specs as `*.test.ts` alongside the code they cover.
- Keep fixtures lightweight; extract shared ones to `src/utils/__tests__/fixtures/` only when duplication appears.
- Include `npm run check` inside the red-green cycle to surface schema drift early.

## Commit & Pull Request Guidelines

- Use Conventional Commits (`feat:`, `fix:`, `docs:`) in the imperative mood, mirroring the existing history.
- PRs must state intent, flag UI or content changes, and link issues; attach before/after screenshots for visual edits.
- Run `npm run lint`, `npm run check`, and the relevant Vitest suites before requesting review.

## Content & Deployment Notes

- Keep `src/content` entry slugs stable; run a build after schema edits to refresh generated types.
- Update `astro.config.mjs` alongside any routing or base-path change so GitHub Pages stays aligned.
- Assets under `public/` bypass Astro transforms—compress images manually and reference them with absolute `/` URLs.
