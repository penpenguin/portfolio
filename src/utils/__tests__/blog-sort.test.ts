import { describe, expect, it } from 'vitest';

import type { CollectionEntry } from 'astro:content';
import { sortPublishedPostsByDate } from '../blog';

const buildPost = (
  id: string,
  pubDate: string,
  draft = false
): CollectionEntry<'blog'> =>
  ({
    id,
    data: {
      title: id,
      description: '',
      pubDate: new Date(pubDate),
      draft,
    },
  } as unknown as CollectionEntry<'blog'>);

describe('sortPublishedPostsByDate', () => {
  it('draftを除外し、公開日の降順で並べ替える', () => {
    const posts = [
      buildPost('first', '2024-01-10'),
      buildPost('latest', '2024-02-01'),
      buildPost('draft-post', '2025-03-01', true),
    ];

    const sorted = sortPublishedPostsByDate(posts);

    expect(sorted.map((post) => post.id)).toEqual(['latest', 'first']);
  });
});
