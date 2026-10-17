import { describe, expect, it } from 'vitest';
import { createBlogArchive } from '../../../src/utils/blogArchive';

describe('createBlogArchive', () => {
  it('returns no archive when there are no published months', () => {
    expect(createBlogArchive([])).toBeNull();
  });

  it('fills January to December and links only published months', () => {
    const archive = createBlogArchive(['2026/10']);

    expect(archive?.selectedYear).toBe('2026');
    expect(archive?.totalMonths).toBe(1);
    expect(archive?.years).toHaveLength(1);
    expect(archive?.years[0].year).toBe('2026');
    expect(archive?.years[0].months).toEqual(
      Array.from({ length: 12 }, (_, index) => ({
        key: `2026/${String(index + 1).padStart(2, '0')}`,
        label: `${index + 1}月`,
        hasPosts: index === 9,
        isCurrent: false,
      }))
    );
  });

  it('deduplicates published months and orders years newest first', () => {
    const archive = createBlogArchive([
      '2024/12',
      '2026/02',
      '2025/11',
      '2026/01',
      '2025/11',
    ]);

    expect(archive?.years.map(({ year }) => year)).toEqual([
      '2026',
      '2025',
      '2024',
    ]);
    expect(archive?.selectedYear).toBe('2026');
    expect(archive?.totalMonths).toBe(4);
    expect(
      archive?.years.flatMap(({ months }) =>
        months.filter(({ hasPosts }) => hasPosts).map(({ key }) => key)
      )
    ).toEqual(['2026/01', '2026/02', '2025/11', '2024/12']);
  });

  it('selects the current page year and marks only that month', () => {
    const archive = createBlogArchive(['2026/10', '2025/11'], '2025/11');

    expect(archive?.selectedYear).toBe('2025');
    expect(
      archive?.years.flatMap(({ months }) =>
        months.filter(({ isCurrent }) => isCurrent).map(({ key }) => key)
      )
    ).toEqual(['2025/11']);
  });

  it('falls back to the latest year if the requested year has no posts', () => {
    expect(createBlogArchive(['2026/10'], '2024/01')?.selectedYear).toBe(
      '2026'
    );
  });

  it.each([12, 36, 120])(
    'keeps twelve slots per year for %i months',
    (count) => {
      const months = Array.from({ length: count }, (_, index) => {
        const year = 2020 + Math.floor(index / 12);
        return `${year}/${String((index % 12) + 1).padStart(2, '0')}`;
      });
      const archive = createBlogArchive(months);

      expect(archive?.totalMonths).toBe(count);
      expect(archive?.years).toHaveLength(count / 12);
      for (const year of archive!.years) {
        expect(year.months).toHaveLength(12);
        expect(year.months.every(({ hasPosts }) => hasPosts)).toBe(true);
      }
    }
  );
});
