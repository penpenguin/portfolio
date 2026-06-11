import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pages = [
  '../../../src/pages/index.astro',
  '../../../src/pages/about.astro',
  '../../../src/pages/projects/index.astro',
  '../../../src/pages/projects/[...slug].astro',
  '../../../src/pages/blog/index.astro',
  '../../../src/pages/blog/[year]/[month]/index.astro',
  '../../../src/pages/blog/[year]/[month]/[slug].astro',
  '../../../src/pages/career.astro',
  '../../../src/pages/contact.astro',
];

const load = (path: string) =>
  readFileSync(new URL(path, import.meta.url), 'utf-8');

describe('No eyebrow visual policy', () => {
  it.each(pages)('%s does not render decorative overline labels', (path) => {
    const source = load(path);

    expect(source).not.toContain('bento-eyebrow');
    expect(source).not.toContain('class="eyebrow');
    expect(source).not.toContain('post-kind');
    expect(source).not.toContain('project-kicker');
    expect(source).not.toContain('blog-kicker');
  });

  it('home preview cards place date metadata after titles, not before them', () => {
    const source = load('../../../src/pages/index.astro');
    const projectPreview = source.slice(
      source.indexOf('bento-card--project'),
      source.indexOf('bento-card--blog')
    );
    const blogPreview = source.slice(source.indexOf('bento-card--blog'));

    expect(projectPreview.indexOf('latestProject.data.title')).toBeLessThan(
      projectPreview.indexOf('latestProject.data.pubDate')
    );
    expect(blogPreview.indexOf('latestPost.data.title')).toBeLessThan(
      blogPreview.indexOf('latestPost.data.pubDate')
    );
  });

  it('project list places project number and date in metadata below the title', () => {
    const source = load('../../../src/pages/projects/index.astro');
    const projectMeta = source.slice(
      source.indexOf('<div class="project-meta">'),
      source.indexOf('</div>', source.indexOf('<div class="project-meta">'))
    );

    expect(source).toContain('project-card-meta');
    expect(projectMeta.indexOf('project.data.title')).toBeLessThan(
      projectMeta.indexOf('String(index + 1).padStart')
    );
    expect(projectMeta.indexOf('project.data.title')).toBeLessThan(
      projectMeta.indexOf('formatDate(project.data.pubDate)')
    );
  });
});
