// @ts-check
import { defineConfig } from 'astro/config';
import remarkDirective from 'remark-directive';
import { remarkAdmonition } from './src/utils/remarkAdmonition.js';

// https://astro.build/config
export default defineConfig({
  base: '/portfolio',
  markdown: {
    remarkPlugins: [remarkDirective, remarkAdmonition],
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true,
    },
  },
});
