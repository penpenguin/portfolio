---
title: 'ufのSNS実装で読む、Flowのmatchとrenders'
description: 'ufのサンプルCommonplaceを読み、Flowで画面の状態分岐とコンポーネントの組み合わせをどう型に表すかを整理します。'
pubDate: 2026-10-08
tags: ['Flow', 'React', 'uf']
---

> [!NOTE]
> この記事はGPT-6 Astraが書き、人間がレビューしています

Reactの型付けは、propsの形を決めるだけではありません。読み込みが失敗したら何を描くか、フォームの子にどの部品を受け入れるか。ufのSNSサンプル「Commonplace」では、こうした画面の約束をFlowの構文で表しています。

ufは、ReactとModern Flow向けのツールチェーンです。開発・本番ビルド、テスト、整形、lint、型チェックを、ネイティブCLIと`uf.config.js`にまとめています。公式のFlowパーサー、React Compiler、Viteを使う構成です。ここでは実行時の速さではなく、公開ソースから読み取れるUIの書き方に絞ります。

## 状態を並べると、描画の分岐も見える

Commonplaceの`social-model.js`には、未ログインとログイン済みを区別する`Session`や、成功と失敗を表す`ActionResult`があります。値の有無だけでなく、`kind`や`status`で状態を区別するunion型です。

その使い道が見えるのが`async-region.client.js`。読み込みが完了した結果を`ready`と`failed`に分け、`match (use(resource))`で表示を選びます。成功ならデータを子の描画関数へ渡し、失敗なら再試行ボタンのある画面へ。まだ待っている間は、外側のSuspenseが担当します。

Flowの`match`は式として値を返せるうえ、網羅性も検査します。状態の定義と描画側を照らし合わせやすいのが、この書き方のよさです。ただし、サンプルでも予期しない描画の不具合は別扱いで、ルートの`$error.js`に任せています。失敗をすべて同じ画面へ押し込んでいるわけではありません。

## rendersは、子に渡せる部品の約束

Flowの`component`構文では、propsを名前付きの引数として宣言します。Commonplaceの`FormField`は、さらに`children: renders Field.Control`と、コンポーネント自身の`renders Field.Root`を指定しています。

前者は「この子はField.Controlを描くもの」、後者は「この部品はField.Rootを描くもの」という制約です。単に描画可能な値を広く受け入れるより、フォーム部品同士の関係が明確になります。

ここで、Field.Controlそのものしか渡せないと読むと狭すぎます。Flow公式ドキュメントによれば、同じ部品を最終的に描くラッパーも、`renders`の連鎖を通じて扱えます。組み合わせを制限しつつ、独自の部品へ包み直す余地は残す。その両立が面白いところです。

なお、これは型の制約であって、実行時に渡された部品の種類を判定する仕組みではありません。

## 非同期処理の境界まで読む

構文だけでなく、Promiseの持ち主も揃えています。最初の読み込みはloaderが開始し、描画側は`use`で結果を読みます。明示的な再試行では対象領域のresourceを差し替えるため、隣の領域とは独立して扱えます。`AsyncRegion`の待機表示にも`pending: renders LoadingState`という制約があります。

ただ、これをそのまま本番用SNSの雛形と捉えるのは早計です。READMEは、単一インスタンスのSQLiteサンプルであり、メール確認、パスワード復旧、MFAは含まないと明記しています。現在は、独立したバックエンドと小さなFlow BFFを持つ別のGraphQL版を推奨しています。uf自体も0.xで、コマンドや設定、パッケージAPIがリリース間で変わり得ます。

読むなら、まず`social-model.js`で状態を確認し、次に`async-region.client.js`と`form-ui.client.js`を追うとつながりが見えます。Flowを選ぶか考える材料としては、型注釈の短さより、状態の分岐とUI部品の約束をどこまでコードに書いておきたいかを見るのがよさそうです。

## 参考

サンプルの参照先は、確認時のコミットに固定しています。

- [uf README](https://github.com/ubugeeei-prod/uf/blob/18140f8ab526019c988d76b75ee24fe38480523d/README.md)
- [Commonplace：構成・実行方法・制約](https://github.com/ubugeeei-prod/uf/tree/18140f8ab526019c988d76b75ee24fe38480523d/examples/simple-sns)
- [Flow：Component Syntax](https://flow.org/en/docs/react/component-syntax/)
- [Flow：Match Expressions and Statements](https://flow.org/en/docs/match/)
- [Flow：Render Types](https://flow.org/en/docs/react/render-types/)
