// @ts-check
import { defineConfig } from 'astro/config';
import { remarkAdmonition } from './src/utils/remarkAdmonition.js';

// https://astro.build/config
export default defineConfig({
  base: '/portfolio',
  markdown: {
    remarkPlugins: [remarkAdmonition],
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true,
    },
  },
});
