import { describe, expect, it } from 'vitest';

import { remarkAdmonition } from '../../../src/utils/remarkAdmonition.js';

type TestNode = {
  type: string;
  name?: string;
  value?: string;
  data?: {
    hName?: string;
    hProperties?: {
      className?: string[];
      [key: string]: unknown;
    };
  };
  children?: TestNode[];
};

const runPlugin = <T extends TestNode>(tree: T): T => {
  const transformer = remarkAdmonition();
  transformer(tree);
  return tree;
};

const firstTransformedChild = (tree: TestNode): TestNode => {
  const child = runPlugin(tree).children?.[0];
  if (!child) {
    throw new Error('Expected transformed tree to keep the first child');
  }

  return child;
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

    const node = firstTransformedChild(tree);

    expect(node.data?.hName).toBe('aside');
    expect(node.data?.hProperties?.className).toContain('admonition');
    expect(node.data?.hProperties?.className).toContain('admonition-note');
    expect(node.data?.hProperties?.['data-label']).toBe('Note');
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

    const node = firstTransformedChild(tree);
    expect(node.data?.hProperties?.className).toContain('admonition-warning');
    expect(node.data?.hProperties?.['data-label']).toBe('Warning');
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

    const node = firstTransformedChild(tree);
    expect(node.data?.hProperties?.className).toContain('admonition-caution');
    expect(node.data?.hProperties?.['data-label']).toBe('Caution');
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

    const node = firstTransformedChild(tree);
    expect(node.data?.hName).toBe('aside');
    expect(node.data?.hProperties?.className).toContain('admonition-tip');
    expect(node.data?.hProperties?.['data-label']).toBe('Tip');

    expect(node.children?.[0]?.children?.[0]?.value).toBe('一言メモ');
  });

  it('非対応ディレクティブは素通しする', () => {
    const tree = {
      type: 'root',
      children: [{ type: 'containerDirective', name: 'unknown', children: [] }],
    };

    const node = firstTransformedChild(tree);
    expect(node.data).toBeUndefined();
  });

  it('従来のディレクティブ記法は変換せず素通しする', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'containerDirective',
          name: 'note',
          children: [
            { type: 'paragraph', children: [{ type: 'text', value: 'メモ' }] },
          ],
        },
      ],
    };

    const node = firstTransformedChild(tree);
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

    const node = firstTransformedChild(tree);
    expect(node.data).toBeUndefined();
  });
});
