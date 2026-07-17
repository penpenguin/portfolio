---
title: 'Reicon：UIにそのまま置けるオープンソースSVGアイコン集'
description: 'Reiconについて、2700以上のSVGアイコン、2ウェイト、React/Vue/Svelte/Vanilla JS/CDN向けの使い方を整理します。'
pubDate: 2026-07-09
tags: ['Icon', 'Design', 'Open Source']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

Reiconは、デザイナーと開発者向けの無料オープンソースSVGアイコンライブラリです。公式サイトとREADMEでは、2700以上のアイコンをReact、Vue 3、Svelte、Vanilla JavaScript、CDN、Figma、VS Code向けに扱えると説明されています。見た目の売り文句だけでなく、24×24pxグリッド、OutlineとFilledの2ウェイト、MITライセンスまでひとまとまりで揃えているのが特徴です。([Reicon][1], [README][2])

アイコン集は数だけで選ぶと、実際のUIに置いたときに線幅や角の丸みが微妙にぶれることがあります。Reiconが面白いのは、各アイコンを24×24pxの前提に乗せ、Outlineは1.5pxのstroke、Filledはアクティブ状態や強調に使いやすいソリッドな形として分けているところです。アイコン単体の派手さより、ナビゲーション、ボタン、設定画面のような細かい部品に混ぜたときの揃い方を見ているライブラリだと読めます。([README][2])

## フレームワークごとに薄い入口がある

Reactなら `npm install reicon-react` で入れて、`import { Home } from 'reicon-react'` のように名前付きインポートします。各アイコンはコンポーネントとして扱え、`size`、`color`、`weight`、`className` などを渡せます。Vue 3は `reicon-vue`、Svelteは `reicon-svelte` が用意され、どちらもPascalCase名でアイコンを取り込み、propsでサイズや色、ウェイトを変える形です。([React usage][3], [Vue usage][4], [Svelte usage][5])

バンドルサイズを気にする場面では、`reicon-react/icons/Home` や `reicon-vue/icons/Home` のような直接インポートも案内されています。全部入りのアイコンフォントを読み込むより、使うSVGだけを部品として持ち込む発想です。Tailwind CSSとの組み合わせでは、アイコンがデフォルトで `currentColor` を継承するため、テキスト色のutilityでそのまま色を寄せられます。

## ビルドなしでも使える余白

Vanilla JavaScript向けの `reicon` パッケージは、アイコンを `SVGSVGElement` として生成するfactoryを提供します。サーバー側で文字列として扱いたいときは `toSvg()` を使い、Node.jsやSSRの出力へ直接SVGを差し込める、とドキュメントは説明しています。さらに `reicon/element` またはCDNスクリプトを読み込むと、HTML上で `<re-icon icon="home"></re-icon>` のようなcustom elementとして使えます。([JavaScript usage][6])

この入口があると、ReactやVueのプロジェクトだけでなく、静的HTML、古い管理画面、小さなプロトタイプにも試しやすい。フレームワークを選ぶ前の段階で、アイコンだけ先にUIへ差し込めるのは地味に助かります。

## データソースを中心にしたモノレポ

READMEでは、`data/icon-data.json` が単一のアイコンデータソースとして示されています。そこから各パッケージ、ドキュメント、CDNランタイムなどへ展開する構成です。npm向けには `reicon`、`reicon-react`、`reicon-vue`、`reicon-svelte` が並び、Figma workspaceやVS Code extensionも同じリポジトリ内に置かれています。([README][2])

ライセンスはMITです。公式のライセンスページとリポジトリのLICENSEは、個人・商用プロジェクトで使える前提を示しています。ただし、ブランドロゴ集のように別ドメインで提供されているものもあるため、プロダクトへ組み込む前には、使うパッケージとアイコン種別ごとのライセンス表示を確認したほうが安全です。([License][7], [LICENSE][8])

Reiconを最初に見るなら、まず公式のアイコンブラウザで線の細さとFilledの雰囲気を確認し、次に自分のスタック用パッケージで2、3個だけ置いてみるのがよさそうです。アイコンライブラリは、一覧で眺めているときより、ヘッダー、空状態、設定項目の横へ置いたときに相性が出ます。そこで線幅と余白が馴染むなら、候補に入れやすい一式です。

## 参考

- [Reicon][1]
- [dqev/reicon README][2]
- [React Usage Guide][3]
- [Vue Usage Guide][4]
- [Svelte Usage Guide][5]
- [Vanilla JS & CDN Usage Guide][6]
- [Reicon License][7]
- [dqev/reicon LICENSE][8]
- [Reicon v1.0.0 release][9]

[1]: https://reicon.dev/ 'Reicon — Free Open-Source Icon Library for Designers & Developers'
[2]: https://github.com/dqev/reicon 'dqev/reicon README'
[3]: https://github.com/dqev/reicon/blob/main/docs/react/usage.md 'Usage of Reicon React'
[4]: https://github.com/dqev/reicon/blob/main/docs/vue/usage.md 'Usage of Reicon Vue'
[5]: https://github.com/dqev/reicon/blob/main/docs/svelte/usage.md 'Usage of Reicon Svelte'
[6]: https://github.com/dqev/reicon/blob/main/docs/javascript/usage.md 'Usage of Reicon Vanilla JS & CDN'
[7]: https://reicon.dev/license 'License — Reicon | MIT License'
[8]: https://github.com/dqev/reicon/blob/main/LICENSE 'dqev/reicon LICENSE'
[9]: https://github.com/dqev/reicon/releases/tag/v1.0.0 'Reicon v1.0.0 — Hello, world'
