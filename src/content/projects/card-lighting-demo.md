---
title: 'Card Lighting Demo - Interactive Holographic Card'
description: 'カード表面のホロ表現とポインター追従ライティングを再現するAstro製インタラクティブデモ'
pubDate: 2026-05-22
heroImage: '/assets/projects/card-lighting-demo.webp'
tags: ['Astro', 'TypeScript', 'Tweakpane', 'CSS', 'Vitest']
github: 'https://github.com/penpenguin/card-lighting-demo'
link: 'https://penpenguin.github.io/card-lighting-demo/'
---

## 概要

Card Lighting Demoは、カード表面のホログラム風表現とライト追従による立体感を1ページで試せるインタラクティブデモです。ポインター操作に合わせて傾きや反射が変化し、Tweakpaneから表示内容やエフェクトを調整できます。

## 主な特徴

### 視覚表現の調整

- **ポインター追従**: カーソル位置に応じてカードの傾きとライトを変化
- **レアリティ表現**: ホロや縁取りのプリセットを切り替え可能
- **ライブ編集**: カード番号、名義、期限などの表示テキストをTweakpaneから変更

### GitHub Pages向けの構成

- **Astro管理スクリプト**: TypeScriptをAstro/Viteでバンドル
- **base path対応**: GitHub Pagesのsubpath配信を想定した設定
- **回帰テスト**: 主要なマークアップと構成をVitestで確認

## 技術スタック

- **フレームワーク**: Astro 6
- **言語**: TypeScript
- **操作パネル**: Tweakpane
- **スタイリング**: CSS
- **テスト**: Vitest, Astro check

## 実装のポイント

カードの見た目はCSSを中心に構成し、ポインター座標をTypeScriptで反映して光源と傾きの変化を作っています。Tweakpaneを使うことで、UIを作り込みすぎずにパラメータ調整を外出しし、表現の比較や確認をしやすくしています。
