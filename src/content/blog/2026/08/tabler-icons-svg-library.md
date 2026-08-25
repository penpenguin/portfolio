---
title: 'Tabler Iconsは、SVGを選ぶところから実装まで迷わせない'
description: '6,000点を超えるSVGアイコンを、素のHTMLや各種フレームワークで扱えるTabler Icons。その設計と導入方法を整理します。'
pubDate: 2026-08-25
tags: ['Tabler Icons', 'SVG', 'Icon', 'Frontend']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

アイコン集を選ぶとき、収録数だけを見ても実装時の使いやすさまでは分かりません。Tabler Iconsは、6,184点のSVGアイコンをMITライセンスで公開するライブラリです。すべて24×24のグリッドを基準に、アウトライン版は2pxのストロークで設計されています。数の多さより先に、異なる用途のアイコンを並べても線の調子が揃う。その一貫性が使いやすさの土台です。([公式サイト][1], [GitHub][2])

## アウトラインと塗りを同じ場所で探せる

公式リポジトリには、5,130点のアウトラインアイコンと1,054点の塗りアイコンが収録されています。公式サイトでは名前やカテゴリから検索し、サイズ、色、ストローク幅を変えながら見た目を確かめられます。輪郭だけでは状態を伝えにくい箇所に塗りを使うなど、画面全体の調子を見ながら選び分けやすい構成です。

SVGはGitHub Releasesから直接取得できるほか、`@tabler/icons`としてnpmから導入できます。`<img>`、CSSの`background-image`、インラインSVG、SVGスプライトに対応しており、既存の構成を大きく変えずに使い始められます。インラインで置けば、サイズ、色、`stroke-width`をCSSから調整可能です。([README][3])

## フレームワークでは一つずつコンポーネントとして読む

React向けには`@tabler/icons-react`が用意されています。

```jsx
import { IconArrowLeft } from '@tabler/icons-react';

export const BackButton = () => (
  <IconArrowLeft color="currentColor" size={24} stroke={2} />
);
```

パッケージはES Modulesで構成され、使うアイコンを個別のコンポーネントとしてimportできます。公式ドキュメントが示す既定値は、サイズが24、色が`currentColor`、ストローク幅が2です。色を親要素に合わせたい場面では`currentColor`がそのまま働き、見た目を変えたいときは通常のpropsを渡せます。Vue、Angular、Svelteなどにも専用パッケージがあり、デザイン側ではFigmaプラグインも選べます。([React package][4], [Packages][5])

Tabler Iconsを試すなら、まず一つの画面で必要なアイコンを置き換え、本文の文字やボタンと並べたときの線幅を確認するのがよさそうです。収録点数を追うより、24pxを基準にした形と`currentColor`の扱いが既存のデザインルールに馴染むかを見る。そこで揃えば、素材探しから実装までを同じライブラリでつなげられます。

## 参考

- [Tabler Icons公式サイト][1]
- [tabler/tabler-icons][2]
- [Tabler Icons README][3]
- [Tabler Icons for React][4]
- [Tabler Icons Packages][5]

[1]: https://tabler.io/icons 'Tabler Icons公式サイト'
[2]: https://github.com/tabler/tabler-icons 'tabler/tabler-icons'
[3]: https://github.com/tabler/tabler-icons/blob/main/README.md 'Tabler Icons README'
[4]: https://github.com/tabler/tabler-icons/blob/main/packages/icons-react/README.md 'Tabler Icons for React'
[5]: https://tabler.io/icons/packages 'Tabler Icons Packages'
