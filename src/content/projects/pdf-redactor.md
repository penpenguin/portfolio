---
title: 'PDF Redactor - Browser PDF Redaction Tool'
description: 'ブラウザ内でPDFを開き、選択した文字列を黒塗りして再ダウンロードできる静的Webアプリ'
pubDate: 2026-03-25
heroImage: '/assets/projects/pdf-redactor.webp'
tags: ['React', 'TypeScript', 'Vite', 'PDFium', 'Vitest']
github: 'https://github.com/penpenguin/pdf-redactor'
link: 'https://penpenguin.github.io/pdf-redactor/'
---

## 概要

PDF Redactorは、ローカルPDFをブラウザ内で読み込み、選択した文字列範囲をredactionして再ダウンロードできる静的Webアプリです。サーバーへファイルを送らずに処理できるため、PDF編集を手元で完結させたい場面に向いています。

## 主な特徴

### ブラウザ完結のPDF編集

- **ローカルPDF処理**: PDFファイルをブラウザ内で開き、サーバーを介さずに操作
- **選択範囲のredaction**: PDF上の文字列選択から削除対象を追加
- **再ダウンロード**: redaction適用後のPDFをそのまま保存

### 静的配信しやすい構成

- **GitHub Pages対応**: Viteの静的ビルドをそのまま配置可能
- **WASM同梱**: PDFium WebAssemblyをassetとして解決し、ビルド成果物へ含める構成
- **ライセンス導線**: third-party licenseをbuild artifactへ同梱

## 技術スタック

- **フロントエンド**: React 19, TypeScript, Vite
- **PDF Viewer / Engine**: @embedpdf/react-pdf-viewer, PDFium WebAssembly
- **PDF補助ライブラリ**: pdf-lib, pdfjs-dist
- **テスト**: Vitest, jsdom, Testing Library, Playwright
- **配布**: GitHub Pages

## 実装のポイント

PDFium WASMをブラウザ内で動かし、PDF上の選択情報をredaction操作へつなげています。静的Webアプリとして成立させるため、WASMやthird-party licenseのコピーもbuild pipelineに含め、GitHub Pages上でも追加サーバーなしで動作する構成にしています。
