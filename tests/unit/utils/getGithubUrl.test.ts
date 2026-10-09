import { describe, expect, it, vi } from 'vitest';

import { getGithubUrl } from '../../../src/utils/getGithubUrl';

describe('getGithubUrl', () => {
  it('uses the configured public GitHub URL', () => {
    vi.stubEnv('PUBLIC_GITHUB_URL', 'https://github.com/example-profile');

    expect(getGithubUrl()).toBe('https://github.com/example-profile');
  });

  it.each([undefined, ''])(
    'uses the portfolio owner when PUBLIC_GITHUB_URL is %s',
    (value) => {
      vi.stubEnv('PUBLIC_GITHUB_URL', value);

      expect(getGithubUrl()).toBe('https://github.com/penpenguin');
    }
  );
});
