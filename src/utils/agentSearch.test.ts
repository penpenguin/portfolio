import { describe, expect, it } from 'vitest';

import { searchAgentItems } from './agentSearch';

const items = [
  {
    title: 'Offline Todo Progressive Web App',
    description: 'オフライン対応のタスク管理PWA',
    tags: ['React', 'TypeScript', 'PWA'],
  },
  {
    title: 'Meaningless - Aquarium Web App',
    description: 'Three.jsとGLSLシェーダーを使用した癒し系アプリ',
    tags: ['Three.js', 'GLSL', 'Vite'],
  },
  {
    title: 'Cadenzio - Web Loop Player',
    description: '耳コピ練習を効率化できる音楽プレイヤー',
    tags: ['Astro', 'Web Audio API', 'PWA'],
  },
];

describe('searchAgentItems', () => {
  it('title一致で検索できる', () => {
    expect(searchAgentItems(items, 'Todo')).toEqual([items[0]]);
  });

  it('description一致で検索できる', () => {
    expect(searchAgentItems(items, 'シェーダー')).toEqual([items[1]]);
  });

  it('tags一致で検索できる', () => {
    expect(searchAgentItems(items, 'Web Audio API')).toEqual([items[2]]);
  });

  it('大文字小文字を無視する', () => {
    expect(searchAgentItems(items, 'three.JS')).toEqual([items[1]]);
  });

  it('空queryは空配列を返す', () => {
    expect(searchAgentItems(items, '   ')).toEqual([]);
  });

  it('limitが効く', () => {
    expect(searchAgentItems(items, 'app', 1)).toEqual([items[0]]);
  });

  it('limitを安全な範囲に丸める', () => {
    expect(searchAgentItems(items, 'app', 0)).toEqual([items[0]]);
    expect(searchAgentItems(items, 'app', 99)).toEqual([items[0], items[1]]);
  });
});
