import { afterEach, describe, expect, it, vi } from 'vitest';

import { withBase } from '../../../src/utils/withBase';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('withBase', () => {
  it('basically applies the configured base url to root-relative paths', () => {
    vi.stubEnv('BASE_URL', '/portfolio/');

    expect(withBase('/about')).toBe('/portfolio/about');
  });

  it('returns root-relative paths untouched when the base url is "/"', () => {
    vi.stubEnv('BASE_URL', '/');

    expect(withBase('/about')).toBe('/about');
  });

  it('does not rewrite hash-only anchors', () => {
    vi.stubEnv('BASE_URL', '/portfolio/');

    expect(withBase('#section')).toBe('#section');
  });

  it('does not rewrite protocol-relative URLs', () => {
    vi.stubEnv('BASE_URL', '/portfolio/');

    expect(withBase('//example.com')).toBe('//example.com');
  });
});
