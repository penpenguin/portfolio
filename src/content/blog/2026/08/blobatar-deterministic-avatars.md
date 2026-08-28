---
title: '文字列から「その人の顔」をつくるblobatar'
description: '決定的なSVGアバターを生成するblobatarについて、描画方法、見た目を保つ世代設計、導入時の選択肢を整理します。'
pubDate: 2026-08-28
tags: ['blobatar', 'Avatar', 'SVG', 'Frontend']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

プロフィール画像が未設定のとき、単色の丸に頭文字を置くだけでは、一覧の中で人を見分けにくいことがあります。かといって、仮画像を保存して配信する仕組みまで用意するのは大げさです。blobatarは、名前やメールアドレス、IDなどの文字列から幾何学的なSVGアバターを決定的に生成します。同じ文字列なら同じ姿になるため、画像を持たないユーザーやBotにも、見分けるための顔を添えられます。コアは依存パッケージなし、gzip後で約4.4KBと案内されています。([公式サイト][1], [README][2])

## 保存しなくても、同じ顔に戻れる

基本のAPIは`blobatar(name)`です。SVG文字列を返すほか、`blobatarUri()`なら`<img>`やCSSの背景に渡せるData URIを得られます。入力は既定でNFC正規化され、前後の空白と大文字・小文字の差も吸収されます。表示名の表記が少し揺れても同じ結果になりやすい設計です。生の文字列を区別したければ、正規化を無効にもできます。([Package README][3])

React、Vue、Svelte、Solid、Preactには個別のアダプターがあり、React Nativeにも対応しています。Webの静止表示は単一の`<img>`、アニメーションを有効にした場合はインラインSVGへ切り替わります。呼吸、まばたき、視線の動きには`motion.css`が必要で、`prefers-reduced-motion`では静止します。大量のアバターを並べる画面で、初期状態を軽い`<img>`にしているのは実用的な判断です。([README][2])

## 見た目の変更を「世代」として分ける

決定的な生成で難しいのは、ライブラリを改良したあとも以前の顔を保てるかどうかです。blobatarでは、同じ名前から同じ見た目を得る契約をパッケージのメジャーバージョン単位に置いています。輪郭の追加は既存の割り当てを動かすため、新しい「generation」としてメジャー更新に分離。通常のAPIへ世代指定を持ち込まず、アップグレードそのものを見た目変更への同意にしています。([ADR-0008][4])

URLで使う場合は`https://blobatar.dev/avatar/<name>`というHTTPエンドポイントもあります。こちらは`?gen=1`のように世代を固定でき、明示した世代は同じ顔を返し続ける方針です。一方、世代を省いたURLは現在の世代へ追随します。既存画面の顔を変えたくないなら、パッケージのメジャーを固定するか、URLに`gen`を付けるかを先に決めておく必要があります。

## どこまで個性を固定するか

`background`、`hue`、`tone`に加え、`traits`で輪郭や目などの軸を0〜1の値へ固定できます。ブランドカラーだけそろえ、残りは名前から生成する、といった中間の調整が可能です。すべてのtraitを固定すれば、入力に左右されない一体のキャラクターにもできます。([Package README][3])

導入方法は二つです。アプリ内で生成すればネットワーク要求はなく、URLが必要なメールや外部サービスではホストされたエンドポイントを使えます。ただし公式READMEは、公開エンドポイントがレート制限付きであることも明記しています。表示がサービスの要になるなら、同梱のCloudflare Workers実装を自前で動かす選択肢まで含めて比べるのがよさそうです。

## 参考

- [blobatar公式サイト][1]
- [Alain00/blobatar][2]
- [blobatar Package README][3]
- [ADR-0008: Package majors select generations][4]

[1]: https://blobatar.dev/ 'blobatar公式サイト'
[2]: https://github.com/Alain00/blobatar 'Alain00/blobatar'
[3]: https://github.com/Alain00/blobatar/blob/main/packages/blobatar/README.md 'blobatar Package README'
[4]: https://github.com/Alain00/blobatar/blob/main/docs/adr/0008-package-majors-select-generations.md 'ADR-0008: Package majors select generations'
