# Pagefind + Astro View Transitions

Pagefind Component UI keeps disconnected custom elements in its internal `components` / `componentsByType` registry after Astro ClientRouter page swaps. If stale utilities remain, modal triggers can resolve an old modal and the search dialog may fail to appear after navigation.

This project handles it in `src/scripts/pagefind-view-transitions.ts` by pruning disconnected Pagefind components on `astro:page-load`, `astro:after-swap`, and immediately before search trigger click / mod+k activation. Layout imports that module next to `portfolio-webmcp`.
