import { readFileSync } from 'node:fs';

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it, vi } from 'vitest';

import BlogThumbnail from '../../../src/components/BlogThumbnail.astro';

describe('BlogThumbnail', () => {
  it.each(['eager', 'lazy'] as const)(
    'passes original tone and %s loading to both layers',
    async (loading) => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(BlogThumbnail, {
        props: {
          src: '/image.webp',
          alt: 'Color diagram',
          tone: 'original',
          loading,
        },
      });
      expect(html).toMatch(/<blog-thumbnail[^>]*data-tone="original"/);
      const images = html.match(/<img\b[^>]*>/g)!;
      expect(
        images.every((image) => image.includes(`loading="${loading}"`))
      ).toBe(true);
    }
  );

  it('renders the same base-aware image twice with only the foreground accessible', async () => {
    vi.stubEnv('BASE_URL', '/portfolio/');
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlogThumbnail, {
      props: {
        src: '/assets/projects/cadenzio.webp',
        alt: '記事のサムネイル',
        class: 'post-visual',
      },
    });
    expect(html).toMatch(/<blog-thumbnail[^>]*class="[^"]*post-visual/);
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

  it('keeps the image uncropped and its surrounding frame neutral', () => {
    const source = readFileSync(
      new URL('../../../src/components/BlogThumbnail.astro', import.meta.url),
      'utf-8'
    );
    expect(source).toMatch(/\.blog-thumbnail\s*\{[^}]*overflow:\s*hidden/s);
    expect(source).toMatch(
      /\.blog-thumbnail\s*\{[^}]*border-bottom:\s*1px solid var\(--border-editorial\)/s
    );
    expect(source).toMatch(/\.blog-thumbnail\s*\{[^}]*padding:\s*0/s);
    expect(source).toMatch(
      /\.blog-thumbnail__image\s*\{[^}]*object-fit:\s*contain/s
    );
    const foreground = source.match(
      /\.blog-thumbnail__image\s*\{[^}]*\}/s
    )?.[0];
    expect(foreground).toContain('filter: var(--thumbnail-tone)');
    expect(foreground).not.toContain('blur(');
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
    expect(html).toMatch(/<blog-thumbnail[^>]*data-astro-cid-parent/);
  });
});

it.each([undefined, '', '   '])(
  'uses static NoImage for missing source %s without repeating the title',
  async (src) => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlogThumbnail, {
      props: { src, alt: '実際の記事タイトル', class: 'post-visual' },
    });
    expect(html).not.toContain('<img');
    expect(html).toMatch(/aria-hidden="true"[^>]*>[\s\S]*?NoImage/s);
    expect(html).not.toContain('実際の記事タイトル');
    expect(html).toContain('post-visual--fallback');
  }
);
