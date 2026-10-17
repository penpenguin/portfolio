import { readFileSync } from 'node:fs';

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it, vi } from 'vitest';

import BlogThumbnail from '../../../src/components/BlogThumbnail.astro';

describe('BlogThumbnail', () => {
  it('uses the same base-aware image behind the accessible foreground', async () => {
    vi.stubEnv('BASE_URL', '/portfolio/');
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlogThumbnail, {
      props: {
        src: '/assets/projects/cadenzio.webp',
        alt: '記事のサムネイル',
        class: 'post-visual',
      },
    });
    expect(html).toMatch(/<div[^>]*class="[^"]*post-visual/);
    const images = html.match(/<img\b[^>]*>/g)!;
    expect(images).toHaveLength(2);
    expect(images.map((image) => image.match(/src="([^"]+)"/)?.[1])).toEqual([
      '/portfolio/assets/projects/cadenzio.webp',
      '/portfolio/assets/projects/cadenzio.webp',
    ]);
    expect(images[0]).toContain('alt=""');
    expect(images[0]).toContain('aria-hidden="true"');
    expect(images[1]).toContain('alt="記事のサムネイル"');
    expect(images[1]).not.toContain('aria-hidden');
  });

  it('keeps the foreground uncropped and clips the blurred backdrop to its frame', () => {
    const source = readFileSync(
      new URL('../../../src/components/BlogThumbnail.astro', import.meta.url),
      'utf-8'
    );
    expect(source).toMatch(/\.blog-thumbnail\s*\{[^}]*overflow:\s*hidden/s);
    expect(source).toMatch(
      /\.blog-thumbnail\s*\{[^}]*border-bottom:\s*1px solid var\(--glass-border\)/s
    );
    expect(source).toMatch(
      /\.blog-thumbnail__backdrop\s*\{[^}]*object-fit:\s*cover/s
    );
    expect(source).toMatch(
      /\.blog-thumbnail__backdrop\s*\{[^}]*filter:\s*blur\(/s
    );
    expect(source).toMatch(
      /\.blog-thumbnail__image\s*\{[^}]*object-fit:\s*contain/s
    );
  });

  it('preserves the parent page style scope so card heights remain responsive', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlogThumbnail, {
      props: {
        src: '/assets/projects/cadenzio.webp',
        alt: '記事のサムネイル',
        class: 'post-visual',
        'data-astro-cid-parent': true,
      },
    });
    expect(html).toMatch(/<div[^>]*data-astro-cid-parent/);
  });
});
