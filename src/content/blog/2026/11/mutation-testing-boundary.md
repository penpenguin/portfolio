---
title: '3,000円ちょうどの送料で分かるミューテーションテスト'
description: '送料判定の「以上」を「より大きい」に変え、どのテストが違いを見つけるかをNode.jsで確かめます。差分だけを検査するmutatorの使いどころも紹介します。'
pubDate: 2026-11-19
heroImage: '/assets/blog/2026/11/mutation-testing-boundary.webp'
tags: ['テスト', 'JavaScript']
---

> [!NOTE]
> この記事はGPT-6.2 Astraが書き、人間がレビューしています

「3,000円以上なら送料無料」という仕様に対して、2,999円で送料がかかり、3,001円で無料になることを確かめたとします。有料と無料の両方を試したのに、実装を「3,000円を超えたら無料」と書き間違えても、この二つのテストは通ります。

mizchiさんが紹介するミューテーションテストでは、実装に小さな変更を加え、同じテストをもう一度実行します。カバレッジから分かるのは、テストがどのコードを実行したかです。変更後のコード（ミュータント）を使うと、それまで通っていたテストが失敗するかどうかまで確かめられます。[1]

## 送料判定の「以上」を変えてみる

次はこの記事用に作った例です。注文額は非負の整数で、3,000円未満の送料は一律400円とします。`postage.mjs` に保存すれば、追加パッケージなしで試せます。`mutant` を渡すと比較が `>=` から `>` に替わり、`boundary` を渡すと3,000円のテストが一つ増えます。

```js
import assert from 'node:assert/strict';

const mutant = process.argv.includes('mutant');
const postage = (yen) => ((mutant ? yen > 3000 : yen >= 3000) ? 0 : 400);

assert.equal(postage(2999), 400);
assert.equal(postage(3001), 0);
if (process.argv.includes('boundary')) assert.equal(postage(3000), 0);
console.log('OK');
```

Node.js 26.12.1で実行した結果です。ここではツールが自動生成する変更を一つだけ手で用意しました。

| コマンド                           | 結果                                     |
| ---------------------------------- | ---------------------------------------- |
| `node postage.mjs`                 | `OK`                                     |
| `node postage.mjs mutant`          | `OK`                                     |
| `node postage.mjs boundary`        | `OK`                                     |
| `node postage.mjs mutant boundary` | `AssertionError`（実際は400、期待値は0） |

最初の2回では、実装を変えてもテストはすべて成功しました。こうして検出されずに残った変更を `Survived` と呼びます。後の2回は同じ境界値を使い、元の実装だけが成功しました。変更後に少なくとも一つのテストが失敗したので、この変更は `Killed` です。[3] 差が出るのは3,000円のときだけなので、無料側に4,000円や5,000円のケースをいくら足しても、この間違いは見つかりません。

## 差分を調べるときと全体を調べるとき

Vitestを使うプロジェクトなら、`@mizchi/mutator` で実装の変更とテストの再実行を自動化できます。たとえば送料の関数を編集した直後なら、導入済みのプロジェクトで `pnpm exec mutator --since HEAD` とすると、原則として最後のコミットとの差分に検査を絞れます。[1][2]

反対に、実装には触れず、以前のテストから3,000円の検査だけを消したらどうでしょう。mutatorの差分モードでは、テストファイルを編集しても、そのテストが実行する実装すべてが再検査の対象になるわけではありません。テストの編集で検出力が落ちていないかを調べるなら、`--since` を外して全体を検査します。[2]

残った変更を見て最初に考えたいのは「仕様の範囲で、どの入力なら利用者に見える結果が変わるか」です。送料の例なら、3,000円という答えがそのままテストになります。一方、どの入力でも振る舞いが同じなら、それは等価ミュータントです。テストを増やしても区別できません。[1] 今回の失敗が示したのは「以上」と「超える」を区別できたことまでで、送料の仕様全体が正しいという保証ではありません。

## 参考

1. [mizchi「おい、 Mutation Test をやれ。テスト品質を、測るために」](https://zenn.dev/mizchi/articles/mutation-test-quality)
2. [mizchi/mutator：差分実行と結果の再利用](https://github.com/mizchi/mutator)
3. [Stryker Mutator：Mutant states and metrics](https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/)
