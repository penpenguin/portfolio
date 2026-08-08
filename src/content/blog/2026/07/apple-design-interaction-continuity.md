---
title: 'Appleらしい流体UIを「動きの連続性」から実装する'
description: 'apple-designの設計原則から、入力、現在位置、速度を途切れさせないWebインタラクションの組み立て方を読み解きます。'
pubDate: 2026-07-23
tags: ['Design', 'Animation', 'Frontend', 'Accessibility']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

Emil Kowalskiの`apple-design`は、AppleのWWDCセッションで語られたインターフェース設計を、CSS、Pointer Events、`requestAnimationFrame`、スプリングライブラリへ翻訳したAIエージェント用スキルです。見た目をApple風に寄せるテンプレートではありません。中心にあるのは、入力している人と画面上の物体のあいだに、切れ目を作らないことです。([apple-design][1], [Designing Fluid Interfaces][2])

## まず、指が触れた瞬間からつなぐ

ボタンの反応を`click`まで待つと、押してから離すまで画面は黙ったままです。スキルはpointer-downで押下状態を返し、ドラッグ中はポインターへ1対1で追従させるよう求めます。要素の中心へ急に吸い寄せず、つかんだ位置とのずれを保つ。ポインターが要素の外へ出ても追跡できるよう、`setPointerCapture`も使います。

ここで大切なのは、100ms短く見せることより、操作と表示の因果が崩れないことです。Appleの「Designing Fluid Interfaces」でも、即時応答と連続した追従は流体的な操作の土台として扱われています。映像だけ滑らかでも、ドラッグ中に入力を失えば、手で動かしている感覚は消えます。

## 目標値ではなく、いま見えている位置から動かす

閉じかけたシートをつかみ直したとき、最初に必要なのはアニメーションの終了ではありません。画面上の現在位置を読み、そこから指へ制御を戻すことです。論理上の開始点や終了点から再生し直すと、要素が一瞬跳びます。

`apple-design`は、ジェスチャーに結びつく動きでは固定尺の演出よりスプリングを勧めています。目標が途中で変わっても、現在値と速度を受け継いで動きを組み直せるためです。指を離した瞬間も同じで、リリース速度を初速として渡す。着地点は離した座標だけで決めず、速度から減速後の位置を投影し、最寄りのスナップ先を選びます。小さなフリックが、その勢いに合った距離まで届く仕組みです。

## 端とアクセシビリティにも連続性を残す

スクロール端やシートの限界で座標を急に固定すると、故障したような止まり方になります。越えた距離に応じて追従量を減らすラバーバンドなら、「入力は届いているが、先はない」と動きで返せます。入ってきたパネルを同じ経路へ戻し、ポップオーバーをトリガー位置から開くのも、空間上のつながりを守る工夫です。

ただし、連続性は大きな移動を全員に見せることではありません。Appleのアクセシビリティ指針は、Reduce Motionが有効ならズーム、拡大縮小、周辺視野で動く表現などを抑えるよう案内しています。Webでは`prefers-reduced-motion`を受け、スライドや弾みを短いクロスフェードや静的な切り替えへ置き換える。反応そのものを消さず、身体的な負担になりやすい動きだけを減らします。([Accessibility][3])

レビューでは、押した瞬間に返るか、途中でつかみ直せるか、反転時に位置と速度が跳ばないか、動きを減らしても状態変化が読めるかを見る。この四つを順に触ると、装飾の好みではなく、操作の切れ目をコードから探せます。

## 参考

- [apple-design SKILL.md][1]
- [Designing Fluid Interfaces - WWDC18][2]
- [Accessibility - Human Interface Guidelines][3]
- [Great Animations][4]

[1]: https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md 'apple-design SKILL.md'
[2]: https://developer.apple.com/videos/play/wwdc2018/803/ 'Designing Fluid Interfaces - WWDC18'
[3]: https://developer.apple.com/design/human-interface-guidelines/accessibility 'Accessibility - Human Interface Guidelines'
[4]: https://emilkowal.ski/ui/great-animations 'Great Animations'
