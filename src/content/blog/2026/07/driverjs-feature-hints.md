---
title: 'Driver.js 1.8のFeature Hints：操作を止めずに新機能を伝える'
description: 'Driver.js 1.8で加わったFeature Hintsについて、ツアーとの違い、閉じる・非表示にする操作の分離、表示位置や永続化の設計を整理します。'
pubDate: 2026-07-24
tags: ['Driver.js', 'JavaScript', 'UI', 'Onboarding']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

Driver.jsは、Webページ上の要素を強調し、ポップオーバーを添えてプロダクトツアーや操作ガイドを作るJavaScriptライブラリです。TypeScript製で外部依存を持たず、MITライセンスで公開されています。2026年7月に出たバージョン1.8.0では、画面の操作を止めずに補足を置ける「Feature Hints」が加わりました。([Driver.js][1], [1.8.0 release][2])

## 順番に案内せず、必要な場所だけ示す

従来のツアーは、複数のステップを順番に進める導線に向いています。Feature Hintsは少し違い、対象要素のそばに脈動するビーコンを置きます。利用者は気になったものを好きな順にクリックし、説明のポップオーバーを開けます。通常はオーバーレイを出さないため、ほかの部分もそのまま操作できます。([Feature Hints][3])

導入はツアー本体とは別の入口です。

```js
import { hints } from 'driver.js/hints';
import 'driver.js/dist/hints.css';
```

`hints()` に対象要素と説明を渡し、`show()` を呼べばビーコンが表示されます。JavaScriptとCSSが分かれているので、ツアーだけを使うプロジェクトへHints用のコードを載せずに済みます。必要なら `overlay: true` で対象だけを切り抜いた暗幕も出せます。その場合も対象要素は操作可能なままです。([Basic Usage][4], [Feature Hints][3])

## 「閉じる」と「もう表示しない」を分けている

Hintsで丁寧なのは、ポップオーバーを閉じる操作と、ヒント自体を消す操作が別になっている点です。外側のクリックやEscapeキーによるcloseではビーコンが残り、あとから同じ説明を開き直せます。既定の「Got it」ボタンでdismissするとビーコンも消え、`onDismiss` が呼ばれます。

ただし、dismissの状態をDriver.jsが永続保存するわけではありません。保持されるのはそのセッション中だけです。再訪時にも消したままにするなら、各ヒントへ安定した `id` を付け、`onDismiss` で `localStorage` などへ記録する処理をアプリ側で持ちます。保存先をライブラリが決めないため、同意管理やユーザー設定に合わせて設計できます。([Feature Hints][3])

## 小さな印でも、配置と共存を雑にしない

ビーコンは対象要素の上下左右とstart・center・endを組み合わせた12か所へ置け、ピクセル単位のずらしも指定できます。脈動を切る設定があり、OSなどで視差効果を減らす設定が選ばれているとアニメーションは自動で止まります。対象要素がまだDOMにない場合は一度スキップされ、要素が現れたあとに `show()` を再度呼ぶと拾われます。([Feature Hints][3])

ツアーとの併用にも手当てがあります。ツアーが始まるとビーコンは隠れ、開いていたヒントは閉じます。ツアー終了後はビーコンが戻るため、「新機能」の印から詳しいツアーを起動する流れも組めます。

1.8.0には、強調中の要素をクリックして次へ進む `advanceOnClick` と、遅れて描画される要素を一定時間待つ `waitForElement` も入りました。まず軽いヒントで存在を知らせ、複雑な操作だけツアーへ渡す。Driver.jsは、その二段構えを一つのポップオーバー基盤で作れるようになっています。([1.8.0 release][2], [Configuration][5])

## 参考

- [Driver.js][1]
- [Driver.js 1.8.0 release][2]
- [Feature Hints][3]
- [Basic Usage][4]
- [Configuration][5]
- [nilbuild/driver.js][6]

[1]: https://driverjs.com/ 'Driver.js'
[2]: https://github.com/nilbuild/driver.js/releases/tag/1.8.0 'Driver.js 1.8.0 release'
[3]: https://driverjs.com/docs/hints 'Feature Hints - Driver.js'
[4]: https://driverjs.com/docs/basic-usage 'Basic Usage - Driver.js'
[5]: https://driverjs.com/docs/configuration 'Configuration - Driver.js'
[6]: https://github.com/nilbuild/driver.js 'nilbuild/driver.js'
