---
title: 'Bookmarklet Exporter - JavaScript Bookmarklet Builder'
description: 'JavaScriptスニペットをbookmarklet URLとドラッグ登録用リンクに変換するAstro製ワンページアプリ'
pubDate: 2025-12-08
heroImage: '/assets/projects/bookmarklet-exporter.webp'
tags: ['Astro', 'TypeScript', 'Web Components', 'Monaco Editor', 'Terser']
github: 'https://github.com/penpenguin/bookmarklet-exporter'
link: 'https://penpenguin.github.io/bookmarklet-exporter/'
---

## 概要

Bookmarklet Exporterは、JavaScriptスニペットを`javascript:` URLへ変換し、ブックマークバーへドラッグ登録できるリンクとして出力するワンページアプリです。小さなブラウザ自動化や検証用スクリプトを、配布しやすいbookmarkletへ整形できます。

## 主な特徴

### Bookmarklet生成フロー

- **変換パイプライン**: normalize、wrap、minify、encodeを段階的に適用
- **ラップ方式の選択**: none、IIFE、async IIFEを用途に応じて選択
- **圧縮オプション**: simple minifyとTerserによる高度圧縮に対応

### 使い続けやすいUI

- **Monaco遅延ロード**: 必要になったタイミングでeditorを読み込み、失敗時はtextareaへフォールバック
- **状態保存**: 入力コード、名称、オプション、タブ状態をlocalStorageへ保存
- **アクセシビリティ**: tablistロールとキーボード操作に対応

## 技術スタック

- **フレームワーク**: Astro
- **言語**: TypeScript
- **UI**: Web Components, Monaco Editor
- **変換処理**: Terser, esbuild
- **テスト**: Vitest, jsdom

## 実装のポイント

Astroで静的生成したページ上にWeb Componentsを配置し、クライアント側で変換処理とUI状態を管理しています。Monaco Editorは遅延ロードにして初期表示を軽くしつつ、URLハッシュとlocalStorageを組み合わせて、ツール画面とガイド画面を自然に行き来できるようにしています。
