import type { APIContext } from 'astro';

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('astro:content', () => ({
  getCollection: vi.fn(async () => []),
}));

beforeEach(() => {
  vi.resetModules();
});

describe('Agent index contact routes', () => {
  it.each([
    [
      'https://github.com/example-profile',
      'https://github.com/example-profile',
    ],
    [undefined, 'https://github.com/penpenguin'],
    ['', 'https://github.com/penpenguin'],
  ])(
    'publishes only GitHub when PUBLIC_GITHUB_URL is %s',
    async (value, expected) => {
      vi.stubEnv('PUBLIC_GITHUB_URL', value);
      vi.stubEnv('PUBLIC_EMAIL', 'retired@example.com');

      const { GET } = await import('../../../src/pages/agent-index.json');
      const response = await GET({} as APIContext);
      const index = await response.json();

      expect(index.contact).toEqual({ githubUrl: expected });
      expect(JSON.stringify(index)).not.toContain('retired@example.com');
    }
  );
});
