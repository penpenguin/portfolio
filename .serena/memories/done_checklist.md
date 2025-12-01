# Done Checklist

- Add/adjust tests first (Vitest + jsdom/testing-library); keep red→green→refactor steps small.
- Run relevant commands: `npm run test`; `npm run check`; `npm run build` or `npm run preview` if touching build/routing; `npm run format` before handoff if formatting changed.
- Ensure responsive styles respect mobile breakpoint (768px) and container padding.
- Maintain accessibility of nav/links (aria-current, focus-visible styles).
- Keep content slugs and `withBase` paths stable; update `astro.config.mjs` if routing base changes.