---
title: 'PetaTas - Chrome Extension Task Manager'
description: 'Markdownテーブルをタスクに変換しタイマー管理できるChromeサイドパネル拡張機能'
pubDate: 2025-07-15
tags: ['Astro', 'TypeScript', 'Chrome Extension', 'daisyUI', 'Vitest']
github: 'https://github.com/penpenguin/PetaTas'
---

## 概要

PetaTasは、Markdown形式のタスクリストをそのまま貼り付けて管理できるChrome拡張機能です。サイドパネルで常時表示しながら、タイマーやステータス変更を行い、完了した作業は再びMarkdownとしてコピーし直せます。

## 主な特徴

### Markdown駆動のタスク管理

- **Paste to Import**: Markdownテーブルを貼り付けるだけでタスクが生成
- **Export to Clipboard**: 更新内容をMarkdown形式で再出力し、ドキュメントへの反映が容易
- **状態管理の自動化**: タイマースタートで `in-progress`、停止で `todo` に戻すなど、ステータス遷移を自動化

### 作業フローを支援するUI

- **サイドパネル統合**: Chrome標準のサイドパネルAPIに対応し、ウィンドウを圧迫せず常時参照可能
- **タイマー機能**: タスク単位で経過時間を計測し、進捗把握やポモドーロ的な運用に対応
- **永続化**: Chrome Storage APIを利用し、ブラウザ再起動後もタスクとタイマー状態を保持

## 技術スタック

- **フレームワーク**: Astro 5.x
- **言語**: TypeScript
- **UIライブラリ**: daisyUI + Tailwind CSSユーティリティ
- **テスト**: Vitest
- **配布形態**: Chrome Extension Manifest V3

## 開発の工夫

拡張機能の各ビューはAstroで静的生成しつつ、サイドパネルやバックグラウンドサービスワーカーはTypeScriptで構成。Clipboard APIの権限を明示的に要求することでMarkdownのインポート／エクスポートを快適にし、CSPは`style-src 'self' blob:`に限定してセキュリティ基準を満たしています。CIにはGitHub Actionsを採用し、テストとコードカバレッジバッジで品質状況を可視化しています。
