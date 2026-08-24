---
title: '型の「根拠」を捨てるコードを止める、anti-slopのリント設計'
description: 'TypeScriptの曖昧な型付けや動的処理を、チーム固有のOxlintルールで拒むanti-slopの設計と導入時の注意点を読み解きます。'
pubDate: 2026-08-21
tags: ['TypeScript', 'Oxlint', 'Lint', 'Code Quality']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

[anti-slop][1]は、TypeScript／JavaScriptで「型の根拠を捨てたまま処理を進める」コードを拒む、Oxlint向けのカスタムルール集です。名前からはAI生成コード専用の検査器にも見えますが、対象は書き手ではありません。型アサーション、広すぎる型、リフレクション、モジュールモックなど、コード上に現れる具体的な書き方を検査します。

## 曖昧さを通す前に、理由を書かせる

たとえば `input as object as User` のような連続アサーションは、値がUserである証拠を作らず、コンパイラだけを納得させます。anti-slopはこれをエラーにします。既知のキーを持つオブジェクトへ `Record<string, Handler>` と明記して情報を広げる書き方や、`unknown`、`object` を入出力に置いた関数も検査対象です。

すべてのアサーションを一律に禁止するわけではありません。`as const` は許可し、それ以外には直前の `SAFETY:` コメントで、TypeScriptが表せない前提を説明するよう求めます。逃げ道を消すというより、曖昧さを残す判断に根拠を添えさせる設計です。

## テストや境界の作り方までリントにする

ルールは型だけに留まりません。`vi.mock` や `jest.mock` を拒み、実際の依存境界を用意するよう促す `no-module-mocking`、場当たり的な `typeof` 判定より境界でのパースを選ばせる `no-runtime-typeof`、`Reflect.get` や `Reflect.apply` を避けるルールも含まれます。Effect向けには、サービスのコンストラクタを実行側から直接importせず、Layerとコンテキスト経由で扱わせるルールが別プラグインとして切り出されています。

ここまで来ると、一般的な静的解析というより、チームの設計判断を実行可能な規約にしたものです。レビュー文書に書くだけでは見落とされる方針を、違反箇所のすぐそばで示せます。

## npm依存ではなく、リポジトリへコピーする

anti-slopは固定のnpmパッケージとして使うのではなく、`src/`を対象リポジトリへコピーし、読んで変える運用を前提にしています。付属のエージェントスキルは、ファイルの配置、Oxlint設定へのローカルプラグイン登録、依存関係の追加、検証までを担当します。導入後のルールは各リポジトリが所有するため、組織固有の例外や命名規則へ手を入れやすい構成です。

ただし、最初から全ルールを絶対視するのは危ういでしょう。OxlintのJavaScriptプラグイン機能自体が公式ドキュメントでアルファ扱いです。anti-slop側にも、存在確認の `typeof x === "undefined"` や、キー集合が閉じた `Record<K, V>` まで検出する問題が報告されています。まず警告として既存コードへ当て、何を本当に拒みたいのかをチームで決めてからエラーへ上げる。その調整まで含めて、ベンダリングという選択が効いてきます。

## 参考

- [dmmulroy/anti-slop][1]
- [Oxlint: JS Plugins][2]
- [no-known-value-widening: Record with a closed key set discards no evidence][3]
- [no-runtime-typeof reports existence probes][4]

[1]: https://github.com/dmmulroy/anti-slop 'dmmulroy/anti-slop'
[2]: https://oxc.rs/docs/guide/usage/linter/js-plugins.html 'Oxlint: JS Plugins'
[3]: https://github.com/dmmulroy/anti-slop/issues/18 'no-known-value-widening: Record with a closed key set discards no evidence'
[4]: https://github.com/dmmulroy/anti-slop/issues/19 'no-runtime-typeof reports existence probes'
