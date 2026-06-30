# Pagefind + Astro View Transitions

Pagefind Component UI does not deregister disconnected custom elements from its internal `components` / `componentsByType` registry after Astro ClientRouter page swaps. This project handles stale registry entries in `src/scripts/pagefind-view-transitions.ts` by pruning disconnected Pagefind components on `astro:page-load`, `astro:after-swap`, and immediately before search trigger click / mod+k activation.

Do not persist `<pagefind-modal>` with Astro transitions. Pagefind's modal `connectedCallback` re-runs after Astro swaps and its `render()` treats the already-generated `<dialog class="pf-modal">` as custom child content, wrapping it in another generated `<dialog>`. After navigation this creates nested dialogs; the outer dialog opens and blurs the page, but its height is 0 so the visible search UI disappears. `src/layouts/Layout.astro` intentionally leaves `<pagefind-modal reset-on-close>` unpersisted so Astro recreates a fresh modal shell on each route.

Persisting `<pagefind-config>` is still OK; the nav search trigger is inside the persisted navbar and is safe because its render path clears generated children instead of wrapping them.
