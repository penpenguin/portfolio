---
title: 'apple-design：Appleの流体的なインターフェース設計をWebへ移す'
description: 'apple-designスキルがWWDCの知見をどう整理し、応答性、割り込み可能な動き、速度の引き継ぎをWeb実装へ落としているかを読み解きます。'
pubDate: 2026-07-15
tags: ['AI Agent', 'Design', 'Animation', 'Frontend']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

`apple-design`は、AppleのWWDCセッションからインターフェース設計とモーションの原則を抜き出し、Web向けに置き換えたAIエージェント用スキルです。Emil Kowalskiの「Skills For Design Engineers」に収録され、`npx skills@latest add emilkowalski/skills` で導入できます。UI部品ではなく、設計やレビュー時に読むSKILL.mdです。([GitHub][1], [apple-design][2])

土台にあるのは、WWDC 2018の「Designing Fluid Interfaces」。Appleは、入力へ即座に反応し、途中で止めたり方向を変えたりできるインターフェースを解説しています。`apple-design`はこの考えを17章に分け、Pointer Events、`requestAnimationFrame`、CSS、MotionなどWebの道具へ写しています。([Designing Fluid Interfaces][3])

## 固定尺の演出より、途中で触れる「振る舞い」

軸にあるのは、アニメーションへいつでも割り込めることです。閉じかけたシートをつかみ直したら、画面に見えている位置から動きを引き継ぐ。閉じ切るまで入力を止める設計は避けます。

ジェスチャーに結びつく動きでは、固定時間のCSS transitionやkeyframesより、現在値と速度を保って目標を変えられるスプリングを選びます。指を離した瞬間の速度を初速として渡し、着地点を投影してスナップ先を決める。WWDC 2023の「Animate with springs」でも、スプリングがジェスチャーや割り込み前の速度を保ち、位置と速度を連続させる仕組みが解説されています。([apple-design][2], [Animate with springs][4])

## 「反応した」と「操作できる」は別物

押下時の反応は `click` を待たず、pointer-downで出す。ドラッグ中はポインターへ1対1で追従させ、要素の外へ出ても追跡するために`setPointerCapture`を使う。こうした細部が、滑らかな映像と手元で動かす感覚を分けます。

端では、越えた距離に応じて抵抗を増やすラバーバンドを使います。パネルは入ってきた方向へ戻し、ポップオーバーはトリガーを起点に開く。次に何が起きるかを位置関係から読ませる設計です。([apple-design][2], [Designing Fluid Interfaces][3])

## Apple風の見た目を作るスキルではない

半透明素材、タイポグラフィ、アクセシビリティも扱います。`prefers-reduced-motion`では反応を消さず、スライドや弾みを短いクロスフェードへ替える方針です。同じ動きを全員へ押しつけないところまで設計に入っています。

名前からガラス表現や弾むカードのレシピを想像すると、少し違います。読むべき中心は、入力の遅延を削り、現在位置と速度を途切れさせず、いつでもユーザーへ操作を返すこと。まずはドラッグできるシートやカルーセルを一つ選び、途中でつかみ直せるか、反転時に跳ばないか、低速再生でも継ぎ目がないかを点検する使い方が合いそうです。

## 参考

- [emilkowalski/skills][1]
- [apple-design SKILL.md][2]
- [Designing Fluid Interfaces - WWDC18][3]
- [Animate with springs - WWDC23][4]

[1]: https://github.com/emilkowalski/skills 'emilkowalski/skills'
[2]: https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md 'apple-design SKILL.md'
[3]: https://developer.apple.com/videos/play/wwdc2018/803/ 'Designing Fluid Interfaces - WWDC18'
[4]: https://developer.apple.com/videos/play/wwdc2023/10158/ 'Animate with springs - WWDC23'
