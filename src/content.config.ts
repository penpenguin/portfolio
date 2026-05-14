import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({
    base: './src/content/projects',
    pattern: '**/*.md',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).optional(),
    link: z.string().optional(),
    github: z.string().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    pattern: '**/*.md',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    draft: z.boolean().default(false),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).optional(),
    impression: z.string().optional(),
  }),
});

const career = defineCollection({
  loader: glob({
    base: './src/content/pages',
    pattern: 'career.md',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    timeline: z.array(
      z.object({
        title: z.string(),
        period: z.string(),
        role: z.string(),
        description: z.string(),
        teamSize: z.string(),
        responsibilities: z.string(),
        techStack: z.array(z.string()),
      })
    ),
  }),
});

export const collections = { projects, blog, career };
