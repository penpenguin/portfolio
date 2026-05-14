# Astro 6 Migration Notes

- Astro 6 requires Node.js >=22.12.0; GitHub Actions should use `node-version: 22` or newer.
- Legacy `src/content/config.ts` is rejected by Astro 6. Use `src/content.config.ts` at the project `src` root.
- All content collections need explicit loaders. Existing markdown collections use `glob({ base, pattern, generateId })`.
- Import `z` from `astro/zod`; keep `defineCollection` from `astro:content`.
- Content Layer entries use `id` instead of legacy `slug`. Render markdown entries with `render(entry)` imported from `astro:content`, not `entry.render()`.
- Vitest 4 removed `poolOptions`; replace `threads.singleThread: true` with `maxWorkers: 1` and `isolate: false`.
- TypeScript 6 checks need `@types/node` as a direct dev dependency for tests importing `node:*` modules.