---
title: '動的プラグインを安全に外す――Cordis論文の「時空間合成可能性」'
description: 'Cordisの論文が提案する、実行中のコンポーネントを安全に追加・削除するためのrevertible effectsとreactive coeffectsを読み解きます。'
pubDate: 2026-08-19
tags: ['Cordis', 'プラグイン', 'AIエージェント', 'ソフトウェア設計']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

Cordisの論文「A Programming Paradigm for Spatiotemporal Composability」は、実行中のソフトウェアへコンポーネントを足したり外したりする「動的合成」を、どう安全に扱うか考えたプレプリントです。対象はプラグインシステムから自己進化するエージェントハーネスまで。論文は問題を、時間方向と空間方向の二つに分けます。([論文][1])

## 「外したら元に戻る」を仕組みにする

時間方向の課題は、コンポーネントを外したとき、そのコンポーネントが加えた変更もきれいに取り除けるかです。イベントハンドラやサービス登録、確保したリソースが残れば、コードだけ消しても元の状態には戻りません。

論文が提案するrevertible effectsでは、コンテキストを変更する処理に逆操作を持たせ、ランタイムが追跡します。Cordisの実装では、コンテキストへの変更を `ctx.effect` に集約し、コールバックが返すdispose処理を積み上げます。アンロード時は、それらをLIFO順に実行する設計です。コンポーネント作者がロード処理と離れた場所にアンインストール手順を書くのではなく、変更と取り消しを同じ場所で組にする。ここが読みやすいところでした。

ただし、逆操作が本当に元へ戻すかをランタイムが証明してくれるわけではありません。正しいdisposeを渡す責任は作者に残ります。外部へ送ったネットワークデータや、ほかのプロセスも触るファイルのように、システム境界を越えた変更は単純には巻き戻せないという限界も、論文は明記しています。

## 依存先の変化に合わせて生存状態を変える

空間方向を扱うreactive coeffectsは、コンポーネント間の依存関係に焦点を当てます。各コンポーネントは必要な依存先を宣言し、コンテキストが変化するたびに、その条件を満たすか再評価されます。依存先が現れれば起動し、消えれば停止し、関係のない変化なら何もしない。Cordisでは `inject` による依存宣言と、コンテキスト経由のサービス参照として表れます。DeepSeek HarnessのCordis入門でも、プラグインは安定したキーからサービスへアクセスし、必要なサービスが揃ってから起動する、と説明されています。([Cordis入門][3])

大事なのは、提供側を先に破棄しない順序です。Cordisは提供側をアンロード状態にして新規利用を止め、影響を受ける依存側の停止を待ってから、提供側のeffectsを取り消します。依存関係の変化と片付けの順番を、各プラグインの気配りではなくライフサイクルへ持ち込んでいます。

## ハーネス設計へ持ち帰れるもの

Cordisはこのモデルの上に、宣言的な設定、差分によるconfiguration reconciliation、失敗時に以前のモジュールへ戻すhot module replacementを重ねています。DeepSeek Harnessも「Everything is a Plugin」を掲げ、Cordisを基盤に採用しています。([Cordis][2], [DeepSeek Harness][4])

とはいえ、論文は2026年8月13日版の改訂中プレプリントで、CordisのAPIも安定版ではありません。ケーススタディはTypeScript上のKoishiという一つのエコシステムに限られ、性能オーバーヘッドや開発生産性の比較は今後の課題です。自己進化するエージェントハーネスへの適用も、論文の結論では将来の検証対象に置かれています。

いま持ち帰るなら「全部をプラグインにする」という標語より、変更には逆操作を添えること、依存を宣言させること、提供側と利用側の停止順序をランタイムで管理すること。この三つが、動的に組み替わるハーネスを設計するときの具体的なチェックポイントになります。

## 参考

- [A Programming Paradigm for Spatiotemporal Composability][1]
- [cordiverse/cordis][2]
- [Cordis入門][3]
- [deepseek-ai/deepseek-harness][4]

[1]: https://github.com/cordiverse/paper/blob/main/paper.pdf 'A Programming Paradigm for Spatiotemporal Composability'
[2]: https://github.com/cordiverse/cordis 'cordiverse/cordis'
[3]: https://deepseek-harness.github.io/deepseek-harness/reference/cordis-primer 'Cordis入門'
[4]: https://github.com/deepseek-ai/deepseek-harness 'deepseek-ai/deepseek-harness'
