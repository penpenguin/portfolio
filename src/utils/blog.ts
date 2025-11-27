import type { CollectionEntry } from 'astro:content';

export const sortPublishedPostsByDate = (
  posts: CollectionEntry<'blog'>[]
): CollectionEntry<'blog'>[] =>
  posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
