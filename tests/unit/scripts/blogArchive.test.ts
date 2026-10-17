// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, getByLabelText } from '@testing-library/dom';
import '../../../src/scripts/blogArchive';

const mountArchive = (selectedYear = '2026') => {
  const archive = document.createElement('blog-archive');
  archive.innerHTML = `
    <label data-year-control hidden>年
      <select>
        <option value="2026" ${selectedYear === '2026' ? 'selected' : ''}>2026年</option>
        <option value="2025" ${selectedYear === '2025' ? 'selected' : ''}>2025年</option>
      </select>
    </label>
    <details data-year="2026" ${selectedYear === '2026' ? 'open' : ''}>
      <summary>2026年</summary><a href="/portfolio/blog/2026/10">10月</a>
    </details>
    <details data-year="2025" ${selectedYear === '2025' ? 'open' : ''}>
      <summary>2025年</summary><a href="/portfolio/blog/2025/11">11月</a>
    </details>`;
  document.body.append(archive);
  return {
    archive,
    select: getByLabelText(archive, '年') as HTMLSelectElement,
    current: archive.querySelector<HTMLDetailsElement>('[data-year="2026"]')!,
    older: archive.querySelector<HTMLDetailsElement>('[data-year="2025"]')!,
  };
};

afterEach(() => document.body.replaceChildren());

describe('blog archive year selection', () => {
  it.each(['2026', '2025'])('enhances the server-selected year %s', (year) => {
    const { archive, current, older } = mountArchive(year);

    expect(archive.hasAttribute('data-enhanced')).toBe(true);
    expect(
      archive.querySelector<HTMLElement>('[data-year-control]')?.hidden
    ).toBe(false);
    expect(current.hidden).toBe(year !== '2026');
    expect(current.open).toBe(year === '2026');
    expect(older.hidden).toBe(year !== '2025');
    expect(older.open).toBe(year === '2025');
  });

  it('switches visible years without replacing their real links', () => {
    const { archive, select, current, older } = mountArchive();
    const link = older.querySelector('a');
    const location = window.location.href;
    fireEvent.change(select, { target: { value: '2025' } });

    expect(current.hidden).toBe(true);
    expect(older.hidden).toBe(false);
    expect(older.open).toBe(true);
    expect(older.querySelector('a')).toBe(link);
    expect(archive.querySelectorAll('a')).toHaveLength(2);
    expect(window.location.href).toBe(location);
  });

  it('cleans up on disconnect and works after reconnecting or page replacement', () => {
    const { archive, select, older } = mountArchive();
    archive.remove();
    fireEvent.change(select, { target: { value: '2025' } });
    expect(older.hidden).toBe(true);

    document.body.append(archive);
    expect(older.hidden).toBe(false);
    fireEvent.change(select, { target: { value: '2026' } });
    expect(older.hidden).toBe(true);

    archive.remove();
    const next = mountArchive('2025');
    fireEvent.change(next.select, { target: { value: '2026' } });
    expect(next.current.hidden).toBe(false);
    expect(next.older.hidden).toBe(true);
  });
});
