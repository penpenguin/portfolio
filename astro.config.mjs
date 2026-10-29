// @ts-check
import { unified } from '@astrojs/markdown-remark';
import { defineConfig } from 'astro/config';
import { rehypeScrollableTables } from './src/utils/rehypeScrollableTables.js';
import { remarkAdmonition } from './src/utils/remarkAdmonition.js';

// https://astro.build/config
export default defineConfig({
  base: '/portfolio',
  compressHTML: true,
  markdown: {
    processor: unified({
      remarkPlugins: [remarkAdmonition],
      rehypePlugins: [rehypeScrollableTables],
    }),
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: false,
    },
  },
});
