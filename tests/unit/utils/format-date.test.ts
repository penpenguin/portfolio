import { describe, expect, it } from 'vitest';

import { formatDate } from '../../../src/utils/formatDate';

describe('formatDate', () => {
  it('既定ではゼロ埋めした年月日をドット区切りで返す', () => {
    const date = new Date('2024-02-01T00:00:00Z');

    expect(formatDate(date)).toBe('2024.02.01');
  });

  it.each([
    ['2024-02-01T14:59:59Z', '2024.02.01'],
    ['2024-02-01T15:00:00Z', '2024.02.02'],
    ['2024-02-29T00:00:00Z', '2024.02.29'],
    ['2024-12-31T15:00:00Z', '2025.01.01'],
  ])('日本時間の境界と閏日を維持する: %s', (input, expected) => {
    const date = new Date(input);
    expect(formatDate(date)).toBe(expected);
    expect(date.toISOString()).toBe(new Date(input).toISOString());
  });

  it('指定ロケールに従ってフォーマットする', () => {
    const date = new Date('2024-02-01T00:00:00Z');

    expect(formatDate(date, 'en-US')).toBe('February 1, 2024');
  });
});
