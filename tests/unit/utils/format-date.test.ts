import { describe, expect, it } from 'vitest';

import { formatDate } from '../../../src/utils/formatDate';

describe('formatDate', () => {
  it('日本語ロケールで年月日を返す', () => {
    const date = new Date('2024-02-01T00:00:00Z');

    expect(formatDate(date)).toBe('2024年2月1日');
  });

  it('指定ロケールに従ってフォーマットする', () => {
    const date = new Date('2024-02-01T00:00:00Z');

    expect(formatDate(date, 'en-US')).toBe('February 1, 2024');
  });
});
