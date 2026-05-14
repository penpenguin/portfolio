import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type { APIRoute } from 'astro';

import { sortPublishedPostsByDate } from '../utils/blog';
import type {
  AgentBlogPost,
  AgentIndex,
  AgentProject,
} from '../utils/agentTypes';
import { withBase } from '../utils/withBase';

export const prerender = true;

const githubUrl =
  import.meta.env.PUBLIC_GITHUB_URL || 'https://github.com/penpenguin';
const email = import.meta.env.PUBLIC_EMAIL || null;

export const GET: APIRoute = async () => {
  const [projects, blogPosts, careerEntry] = await Promise.all([
    getCollection('projects'),
    getCollection('blog'),
    getEntry('career', 'career'),
  ]);

  if (!careerEntry) {
    throw new Error(
      'Missing career content entry: src/content/pages/career.md'
    );
  }

  const agentIndex: AgentIndex = {
    site: {
      name: 'Portfolio',
      url: new URL(withBase('/'), 'https://penpenguin.github.io').toString(),
      description: 'Modern portfolio built with Astro',
    },
    profile: {
      headline: 'メーカーの社内システム構築支援に強いフルスタックプログラマー',
      skills: [
        'Java',
        'TypeScript',
        'React',
        'Azure',
        'Quarkus',
        'Node.js',
        'PostgreSQL',
        'ArangoDB',
        'GitLab CI/CD',
      ],
      experience: '10+ years',
      specialties: [
        'Enterprise Systems',
        'Full-stack Web Development',
        'Cloud Infrastructure',
        'CI/CD Automation',
        'Team Leadership',
      ],
    },
    projects: projects.map(toAgentProject),
    blog: sortPublishedPostsByDate(blogPosts).map(toAgentBlogPost),
    career: careerEntry.data.timeline,
    contact: {
      pageUrl: withBase('/contact'),
      githubUrl,
      email,
    },
  };

  return new Response(JSON.stringify(agentIndex, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};

const toAgentProject = (
  project: CollectionEntry<'projects'>
): AgentProject => ({
  type: 'project',
  id: project.slug,
  title: project.data.title,
  description: project.data.description,
  pubDate: project.data.pubDate.toISOString(),
  tags: project.data.tags ?? [],
  url: withBase(`/projects/${project.slug}`),
  liveUrl: project.data.link ?? null,
  githubUrl: project.data.github ?? null,
});

const toAgentBlogPost = (post: CollectionEntry<'blog'>): AgentBlogPost => ({
  type: 'blog',
  id: post.id,
  title: post.data.title,
  description: post.data.description,
  pubDate: post.data.pubDate.toISOString(),
  updatedDate: post.data.updatedDate?.toISOString() ?? null,
  tags: post.data.tags ?? [],
  url: withBase(`/blog/${post.id}`),
});
