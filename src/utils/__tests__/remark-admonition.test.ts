import { describe, expect, it } from 'vitest';

import { remarkAdmonition } from '../remarkAdmonition.js';

const runPlugin = (tree: any) => {
  const transformer = remarkAdmonition();
  transformer(tree);
  return tree;
};

describe('remarkAdmonition', () => {
  it('noteディレクティブをアクセシブルな注釈コンポーネントに変換する', () => {
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

    const { children } = runPlugin(tree);
    const node = children[0];

    expect(node.data?.hName).toBe('aside');
    expect(node.data?.hProperties?.className).toContain('admonition');
    expect(node.data?.hProperties?.className).toContain('admonition-note');
    expect(node.data?.hProperties?.['data-icon']).toBe('📝');
  });

  it('leafディレクティブもspanで処理される', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'leafDirective',
          name: 'tip',
          children: [{ type: 'text', value: '一言メモ' }],
        },
      ],
    };

    const node = runPlugin(tree).children[0];
    expect(node.data?.hName).toBe('span');
    expect(node.data?.hProperties?.className).toContain('admonition-tip');
    expect(node.data?.hProperties?.['data-icon']).toBe('💡');
  });

  it('warn / warning / caution は warning にマッピングする', () => {
    const aliases = ['warn', 'warning', 'caution'];

    aliases.forEach((name) => {
      const tree = {
        type: 'root',
        children: [{ type: 'containerDirective', name, children: [] }],
      };

      const node = runPlugin(tree).children[0];
      expect(node.data?.hProperties?.className).toContain('admonition-warning');
      expect(node.data?.hProperties?.['data-icon']).toBe('⚠️');
    });
  });

  it('非対応ディレクティブは素通しする', () => {
    const tree = {
      type: 'root',
      children: [{ type: 'containerDirective', name: 'unknown', children: [] }],
    };

    const node = runPlugin(tree).children[0];
    expect(node.data).toBeUndefined();
  });
});
