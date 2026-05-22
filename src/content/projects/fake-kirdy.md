---
title: 'Fake Kirdy - Hovering Action Game'
description: 'ふわふわしたホバリング操作でステージを進む、Phaser製のブラウザ向けアクションゲーム'
pubDate: 2025-10-02
heroImage: '/assets/projects/fake-kirdy.webp'
tags: ['TypeScript', 'Vite', 'Phaser', 'Matter.js', 'Vitest']
github: 'https://github.com/penpenguin/fake-kirdy'
link: 'https://penpenguin.github.io/fake-kirdy/'
---

## 概要

Fake Kirdyは、ホバリング操作でステージを進むブラウザ向けアクションゲームです。PhaserとMatter.jsを使い、ふわっとした移動感と物理挙動を組み合わせたプレイ体験を作っています。

## 主な特徴

### ブラウザで遊べるゲーム体験

- **ホバリング操作**: 浮遊感のある移動でステージを攻略
- **物理演算**: Matter.jsによる衝突や移動の挙動
- **GitHub Pages配信**: インストール不要でそのままプレイ可能

### 開発と品質

- **TypeScript構成**: ゲームロジックを型付きで実装
- **Viteビルド**: 軽量な開発サーバーと静的ビルド
- **テスト導入**: typecheckとVitestを組み合わせた確認フロー

## 技術スタック

- **ゲームエンジン**: Phaser 3
- **物理エンジン**: Matter.js
- **言語**: TypeScript
- **ビルド**: Vite
- **テスト**: Vitest, TypeScript typecheck

## 実装のポイント

ゲームループやステージ表現はPhaserに任せつつ、キャラクターの移動感にはMatter.jsの物理挙動を利用しています。GitHub Actionsでテストとデプロイを回し、ブラウザからすぐ遊べる完成品として公開しています。
