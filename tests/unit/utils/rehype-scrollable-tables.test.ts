// @vitest-environment jsdom
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { describe, expect, it } from 'vitest';

import { rehypeScrollableTables } from '../../../src/utils/rehypeScrollableTables.js';

const render = async (markdown: string) => {
  const processor = await createMarkdownProcessor({
    rehypePlugins: [rehypeScrollableTables],
  });
  const { code } = await processor.render(markdown);
  document.body.innerHTML = code;
  return document.body;
};

describe('Markdown table scrolling', () => {
  it('wraps each native table in a named keyboard-accessible region', async () => {
    const body = await render(
      'Before\n\n| Name | Value |\n| --- | --- |\n| One | Two |\n\nAfter'
    );
    const region = body.querySelector('.table-scroll')!;
    expect(region?.getAttribute('role')).toBe('region');
    expect(region?.getAttribute('aria-label')).toBe('表（横スクロール可能）');
    expect(region?.getAttribute('tabindex')).toBe('0');
    expect(region?.querySelector('table thead th')?.textContent).toBe('Name');
    expect(region?.querySelector('table tbody td')?.textContent).toBe('One');
    expect(region?.querySelector('p')).toBeNull();
    expect(body.querySelectorAll(':scope > p')).toHaveLength(2);
  });

  it('also wraps a table nested in a quote without changing surrounding content', async () => {
    const body = await render(
      '> | A | B |\n> | --- | --- |\n> | C | D |\n\n`inline`'
    );
    expect(
      body.querySelectorAll('blockquote .table-scroll > table')
    ).toHaveLength(1);
    expect(body.querySelector('p code')?.textContent).toBe('inline');
  });

  it('leaves documents without tables unchanged', async () => {
    const body = await render('## Heading\n\nParagraph.');
    expect(body.querySelector('.table-scroll')).toBeNull();
    expect(body.querySelector('h2')?.textContent).toBe('Heading');
    expect(body.querySelector('p')?.textContent).toBe('Paragraph.');
  });
});
