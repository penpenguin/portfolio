// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createPortfolioTools,
  isSafePortfolioUrl,
  registerTool,
  type AgentIndex,
} from './portfolio-webmcp';

const index: AgentIndex = {
  site: {
    name: 'Portfolio',
    url: 'https://penpenguin.github.io/portfolio/',
    description: 'Modern portfolio built with Astro',
  },
  profile: {
    headline: 'Programmer',
    skills: ['TypeScript'],
    experience: '10+ years',
    specialties: ['Enterprise Systems'],
  },
  projects: [
    {
      type: 'project',
      id: 'todo-pwa',
      title: 'Offline Todo Progressive Web App',
      description: 'オフライン対応のタスク管理PWA',
      pubDate: '2024-01-15T00:00:00.000Z',
      tags: ['PWA'],
      url: '/portfolio/projects/todo-pwa',
      liveUrl: 'https://penpenguin.github.io/todo-pwa/',
      githubUrl: 'https://github.com/penpenguin/todo-pwa',
    },
  ],
  blog: [
    {
      type: 'blog',
      id: '2026/05/webmcp-basics',
      title: 'WebMCP basics',
      description: 'ブラウザ内AIエージェント向けの記事',
      pubDate: '2026-05-01T00:00:00.000Z',
      updatedDate: null,
      tags: ['WebMCP'],
      url: '/portfolio/blog/2026/05/webmcp-basics',
    },
  ],
  career: [],
  contact: {
    pageUrl: '/portfolio/contact',
    githubUrl: 'https://github.com/penpenguin',
    email: null,
  },
};

beforeEach(() => {
  delete window.__portfolioTools;
});

describe('registerTool', () => {
  it('WebMCPがない場合はwindow.__portfolioToolsにfallback登録する', async () => {
    const invoke = vi.fn();

    await registerTool({ name: 'portfolio.test', invoke });

    expect(window.__portfolioTools?.['portfolio.test']).toBe(invoke);
  });
});

describe('createPortfolioTools', () => {
  it('portfolio.search_contentでprojectsとblogを横断検索する', async () => {
    const tools = createPortfolioTools(index);
    const searchContent = tools.find(
      (tool) => tool.name === 'portfolio.search_content'
    );

    await expect(
      Promise.resolve(
        searchContent?.invoke({ query: 'PWA', type: 'all', limit: 5 })
      )
    ).resolves.toEqual([index.projects[0]]);
  });

  it('portfolio.get_contact_routesで連絡先を返す', async () => {
    const tools = createPortfolioTools(index);
    const getContactRoutes = tools.find(
      (tool) => tool.name === 'portfolio.get_contact_routes'
    );

    await expect(
      Promise.resolve(getContactRoutes?.invoke({}))
    ).resolves.toEqual(index.contact);
  });
});

describe('isSafePortfolioUrl', () => {
  it('同一originかつportfolio配下のURLだけ許可する', () => {
    expect(
      isSafePortfolioUrl('/portfolio/projects', window.location, '/portfolio/')
    ).toBe(true);
    expect(isSafePortfolioUrl('/about', window.location, '/portfolio/')).toBe(
      false
    );
    expect(
      isSafePortfolioUrl('https://example.com/', window.location, '/portfolio/')
    ).toBe(false);
    expect(
      isSafePortfolioUrl('javascript:alert(1)', window.location, '/portfolio/')
    ).toBe(false);
  });
});
