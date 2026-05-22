---
title: 'Bonsai Box - Voxel Bonsai Generator'
description: '箱と直方体だけで盆栽を描く、Three.js製の3Dビューア兼ミニジェネレータ'
pubDate: 2026-04-01
heroImage: '/assets/projects/bonsai-box.webp'
tags: ['Three.js', 'Vite', 'JavaScript', '3D', 'Vitest']
github: 'https://github.com/penpenguin/bonsai-box'
link: 'https://penpenguin.github.io/bonsai-box/'
---

## 概要

Bonsai Boxは、箱と直方体だけで盆栽を描く3Dビューア兼ミニジェネレータです。Three.jsで構築したシーン上に、seedベースで再現可能な盆栽形状を生成し、静かな展示物のように眺められるWebアプリとして公開しています。

## 主な特徴

### 3D盆栽の生成と鑑賞

- **ボクセル風表現**: 箱と直方体を組み合わせて盆栽を構成
- **4つのプリセット**: 直幹、斜幹、吹き流し、半懸崖を切り替え可能
- **seed生成**: 同じseedから同じ形状を再現

### 操作と出力

- **ビュー操作**: 回転、ズーム、自動回転に対応
- **PNG保存**: 表示中の盆栽を画像として保存
- **静的配信**: `dist/` をGitHub Pagesへ置くだけで動作

## 技術スタック

- **3D描画**: Three.js
- **ビルド**: Vite
- **言語**: JavaScript
- **テスト**: Vitest, jsdom
- **配布**: GitHub Pages

## 実装のポイント

盆栽形状は専用のgeneratorで生成し、Three.jsのシーン、カメラ、ライト、InstancedMesh描画と連携しています。UI側ではプリセットやseedをlocalStorageに保持し、再訪時も前回の表示状態から試せるようにしています。
