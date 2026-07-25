---
title: 'Apple HIGに戻ってきた8つのデザイン原則'
description: '2026年6月に再導入されたAppleのデザイン原則を、UIを判断するときの使い方とともに読み解きます。'
pubDate: 2026-07-25
tags: ['Apple', 'Design', 'UI/UX']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

AppleのHuman Interface Guidelines（HIG）に、2026年6月8日付で「Design principles」が再導入されました。並んでいるのは、Purpose、Agency、Responsibility、Familiarity、Flexibility、Simplicity、Craft、Delightの8原則です。ボタンの寸法や画面構成を決める規格ではなく、使いやすさと安全性、個性がぶつかったときに何を優先するか。その判断を支える道具として書かれています。([Design principles][2])

## 仕様へ降りる前に、目的と主導権を確かめる

最初のPurposeは、利用者にとって何が最も大切かを見定め、中心となる機能へ力を注ぐこと。Agencyは、その目的を達成する主導権を利用者に渡す考え方です。決められたフローへ閉じ込めず、何が起きているかを伝え、間違えても元へ戻れるようにする。取り消しや前の状態への復帰は、単なる便利機能ではなく、安心して試せるUIの土台になります。

Responsibilityは、その自由に安全策を添えます。権限を求める理由や収集するデータを明らかにし、機能に必要な情報だけを扱う。Familiarityは既知の概念や一貫した操作を使い、初見でも振る舞いを予測しやすくします。奇抜さで目を引く前に、利用者が迷わず、自分の判断で動けるかを見る順番です。

## 「シンプル」と「飾らない」は同じではない

Simplicityの説明で印象に残るのは、「Simplicity isn’t minimalism」と言い切っているところです。要素を減らすこと自体が目的ではありません。必要なものを近くに置き、簡潔な言葉と明確な階層で次の操作を読めるようにする。画面が静かでも、よく使う操作まで隠れてしまえば、この原則からは外れます。

Delightにも同じ歯止めがあります。楽しさを装飾と取り違えず、作業を邪魔しないこと。Craftが求める滑らかな動き、正確な文言、丁寧な音も、単体で目立たせるのではなく、体験全体の感触へ積み上げていきます。

## Flexibilityを実装項目までつなぐ

Flexibilityは、異なる端末、入力方法、視点やニーズを設計の前提に置きます。HIGのAccessibilityでは、分かりやすい操作、単一の感覚だけに頼らない情報提示、利用者の設定に適応するUIを挙げています。iOS向けのガイドも、画面の向き、Dark Mode、Dynamic Typeへの追従や、端末の持ち方に合う操作位置を勧めています。抽象的な原則は、こうした各論と行き来して初めてレビューに使えます。([Accessibility][3], [Designing for iOS][4])

HIGを読むなら、最初から全コンポーネントを巡るより、まず8原則で自分の画面を眺め直すのがよさそうです。「戻れるか」「説明なく予測できるか」「別の入力方法でも届くか」。そこで見つかった弱点から、Foundations、Patterns、Components、Inputsの該当ページへ降りていく。HIGの新しい入口は、答えを丸写しする場所というより、設計判断に筋を通すためのチェックポイントです。([Human Interface Guidelines][1])

## 参考

- [Human Interface Guidelines][1]
- [Design principles][2]
- [Accessibility][3]
- [Designing for iOS][4]

[1]: https://developer.apple.com/design/human-interface-guidelines 'Human Interface Guidelines'
[2]: https://developer.apple.com/design/human-interface-guidelines/design-principles 'Design principles'
[3]: https://developer.apple.com/design/human-interface-guidelines/accessibility 'Accessibility'
[4]: https://developer.apple.com/design/human-interface-guidelines/designing-for-ios 'Designing for iOS'
