import { describe, expect, it } from 'vitest';

import { remarkAdmonition } from '../remarkAdmonition.js';

const runPlugin = (tree: any) => {
  const transformer = remarkAdmonition();
  transformer(tree);
  return tree;
};

describe('remarkAdmonition', () => {
  it('[!NOTE] をアクセシブルな注釈コンポーネントに変換する', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', value: '[!NOTE] メモ' }],
            },
          ],
        },
      ],
    };

    const node = runPlugin(tree).children[0];

    expect(node.data?.hName).toBe('aside');
    expect(node.data?.hProperties?.className).toContain('admonition');
    expect(node.data?.hProperties?.className).toContain('admonition-note');
    expect(node.data?.hProperties?.['data-label']).toBe('NOTE');
  });

  it('[!WARNING] は warning クラスを付与する', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', value: '[!WARNING] 危険' }],
            },
          ],
        },
      ],
    };

    const node = runPlugin(tree).children[0];
    expect(node.data?.hProperties?.className).toContain('admonition-warning');
    expect(node.data?.hProperties?.['data-label']).toBe('WARNING');
  });

  it('[!CAUTION] は caution クラスを付与する', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', value: '[!CAUTION] 注意' }],
            },
          ],
        },
      ],
    };

    const node = runPlugin(tree).children[0];
    expect(node.data?.hProperties?.className).toContain('admonition-caution');
    expect(node.data?.hProperties?.['data-label']).toBe('CAUTION');
  });

  it('警告ラベル除去後のテキストを保持する', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', value: '[!TIP] 一言メモ' }],
            },
          ],
        },
      ],
    };

    const node = runPlugin(tree).children[0];
    expect(node.data?.hName).toBe('aside');
    expect(node.data?.hProperties?.className).toContain('admonition-tip');
    expect(node.data?.hProperties?.['data-label']).toBe('TIP');

    const paragraph = node.children[0];
    const text = paragraph.children[0];
    expect(text.value).toBe('一言メモ');
  });

  it('非対応ディレクティブは素通しする', () => {
    const tree = {
      type: 'root',
      children: [{ type: 'containerDirective', name: 'unknown', children: [] }],
    };

    const node = runPlugin(tree).children[0];
    expect(node.data).toBeUndefined();
  });

  it('従来のディレクティブ記法は変換せず素通しする', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'containerDirective',
          name: 'note',
          children: [{ type: 'paragraph', children: [{ type: 'text', value: 'メモ' }] }],
        },
      ],
    };

    const node = runPlugin(tree).children[0];
    expect(node.data).toBeUndefined();
  });

  it('[!INFO] は未対応として素通しする', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', value: '[!INFO] 情報' }],
            },
          ],
        },
      ],
    };

    const node = runPlugin(tree).children[0];
    expect(node.data).toBeUndefined();
  });
});
