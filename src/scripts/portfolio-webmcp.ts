import { searchAgentItems } from '../utils/agentSearch';
import type {
  AgentContact,
  AgentIndex,
  ToolDefinition,
} from '../utils/agentTypes';
import { withBase } from '../utils/withBase';

export type { AgentIndex, ToolDefinition } from '../utils/agentTypes';

type PortfolioSearchType = 'all' | 'project' | 'blog';

interface SearchContentInput {
  query: string;
  type?: PortfolioSearchType;
  limit?: number;
}

interface SearchInput {
  query: string;
  limit?: number;
}

interface OpenPageInput {
  url: string;
}

interface OpenPageOutput {
  navigatedTo: string;
}

interface CareerSummaryOutput {
  career: AgentIndex['career'];
  suggestedSummary: string;
}

type PortfolioToolsRegistry = Record<string, ToolDefinition['invoke']>;

interface WebMCPRegistry {
  registerTool: (tool: ToolDefinition) => void | Promise<void>;
}

declare global {
  interface Window {
    webMCP?: WebMCPRegistry;
    __portfolioTools?: PortfolioToolsRegistry;
  }

  interface Navigator {
    webMCP?: WebMCPRegistry;
  }
}

let registrationPromise: Promise<void> | null = null;

export async function registerTool(tool: ToolDefinition): Promise<void> {
  const webMCP = window.webMCP ?? navigator.webMCP;

  if (webMCP?.registerTool) {
    await webMCP.registerTool(tool);
    return;
  }

  window.__portfolioTools ??= {};
  window.__portfolioTools[tool.name] = tool.invoke;
}

export function createPortfolioTools(
  index: AgentIndex
): ToolDefinition<unknown, unknown>[] {
  return [
    {
      name: 'portfolio.search_content',
      description: 'Search portfolio projects and blog posts.',
      invoke: (input: unknown) => {
        const { query, type, limit } = parseSearchContentInput(input);
        const items = [
          ...(type === 'blog' ? [] : index.projects),
          ...(type === 'project' ? [] : index.blog),
        ];

        return searchAgentItems(items, query, limit);
      },
    },
    {
      name: 'portfolio.find_projects',
      description: 'Search portfolio projects.',
      invoke: (input: unknown) => {
        const { query, limit } = parseSearchInput(input);
        return searchAgentItems(index.projects, query, limit);
      },
    },
    {
      name: 'portfolio.find_blog_posts',
      description: 'Search portfolio blog posts.',
      invoke: (input: unknown) => {
        const { query, limit } = parseSearchInput(input);
        return searchAgentItems(index.blog, query, limit);
      },
    },
    {
      name: 'portfolio.get_career_summary',
      description: 'Return the career timeline and a short suggested summary.',
      invoke: (): CareerSummaryOutput => ({
        career: index.career,
        suggestedSummary:
          '10年以上にわたり、メーカーの社内システム開発を中心に要件定義、設計、実装、テスト、運用、インフラ構築まで幅広く担当しています。',
      }),
    },
    {
      name: 'portfolio.get_contact_routes',
      description: 'Return contact page, GitHub, and email routes.',
      invoke: (): AgentContact => index.contact,
    },
    {
      name: 'portfolio.open_page',
      description: 'Navigate to an internal portfolio page on the same origin.',
      invoke: (input: unknown): OpenPageOutput => {
        const { url } = parseOpenPageInput(input);
        return openPortfolioPage(url);
      },
    },
  ];
}

export function isSafePortfolioUrl(
  url: string,
  location: Location = window.location,
  basePath = withBase('/')
): boolean {
  try {
    const target = new URL(url, location.origin);
    const normalizedBase = normalizeBasePath(basePath);

    const baseRoot = normalizedBase.replace(/\/$/, '');

    return (
      (target.protocol === 'http:' || target.protocol === 'https:') &&
      target.origin === location.origin &&
      (target.pathname === baseRoot ||
        target.pathname.startsWith(normalizedBase))
    );
  } catch {
    return false;
  }
}

export function openPortfolioPage(url: string): OpenPageOutput {
  const target = new URL(url, window.location.origin);

  if (!isSafePortfolioUrl(url)) {
    throw new Error('Navigation is limited to same-origin portfolio pages.');
  }

  window.location.href = target.href;

  return {
    navigatedTo: target.href,
  };
}

export async function initializePortfolioTools(): Promise<void> {
  registrationPromise ??= fetchAgentIndex()
    .then((index) =>
      Promise.all(createPortfolioTools(index).map((tool) => registerTool(tool)))
    )
    .then(() => undefined)
    .catch((error: unknown) => {
      console.warn('Failed to register portfolio tools.', error);
    });

  return registrationPromise;
}

async function fetchAgentIndex(): Promise<AgentIndex> {
  const response = await fetch(withBase('/agent-index.json'), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load agent index: ${response.status}`);
  }

  return response.json() as Promise<AgentIndex>;
}

function parseSearchContentInput(input: unknown): SearchContentInput {
  const value = toRecord(input);
  const type = parseSearchType(value.type);

  return {
    query: parseString(value.query),
    type,
    limit: parseOptionalNumber(value.limit),
  };
}

function parseSearchInput(input: unknown): SearchInput {
  const value = toRecord(input);

  return {
    query: parseString(value.query),
    limit: parseOptionalNumber(value.limit),
  };
}

function parseOpenPageInput(input: unknown): OpenPageInput {
  const value = toRecord(input);

  return {
    url: parseString(value.url),
  };
}

function parseSearchType(value: unknown): PortfolioSearchType {
  if (value === 'project' || value === 'blog') {
    return value;
  }

  return 'all';
}

function parseString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function parseOptionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function toRecord(input: unknown): Record<string, unknown> {
  return input !== null && typeof input === 'object'
    ? (input as Record<string, unknown>)
    : {};
}

function normalizeBasePath(basePath: string): string {
  const pathname = new URL(basePath, window.location.origin).pathname;
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

function isVitestRuntime(): boolean {
  const runtime = globalThis as {
    process?: { env?: { VITEST?: string } };
  };

  return runtime.process?.env?.VITEST === 'true';
}

if (typeof window !== 'undefined' && !isVitestRuntime()) {
  void initializePortfolioTools();
}
