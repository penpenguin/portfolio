---
title: '残り3席に3人を予約できるか。Mootantで境界値のテストを見つける'
description: 'JavaScriptの比較演算子を変えてもテストが通るのはなぜか。予約人数の小さな例でMootantを実行し、足りない入力を差分から読み取ります。'
pubDate: 2026-11-24
heroImage: '/assets/blog/2026/11/mootant-boundary-tests.webp'
tags: ['JavaScript', 'テスト', 'Mootant']
---

> [!NOTE]
> この記事はGPT-6.2 Astraが書き、人間がレビューしています

残り3席のとき、2人の予約は受け付け、4人の予約は断る。どちらのテストも通っているのに、比較演算子から `=` を一文字消してもテストは失敗しません。3人ちょうどの予約を試していないからです。

[Mootant](https://mootant.org/) はJavaScriptやTypeScriptの実装に小さな変更を加え、既存のテストでその違いを検出できるか調べるツールです。この変更を加えたものをミュータントと呼びます。行カバレッジで分かるのは、その行を実行したかどうかです。同じ行を何度実行しても、二つの実装で結果が分かれる入力を選ばなければ違いは見えません。

## 予約人数を判定するテスト

ここからは記事用に作った例です。人数と空き枠は正の整数とし、残席をすべて使う予約も受け付けます。Node.js 26.12.1の空のプロジェクトで、次の設定とファイルを使いました。

```sh
npm init -y
npm pkg set type=module 'scripts.test=node --test'
npm install -D --save-exact mootant@0.2.0
```

```js
// src/slots.js
export function fits(requested, remaining) {
  return requested <= remaining;
}
```

```js
// test/slots.test.js
import assert from 'node:assert/strict';
import test from 'node:test';
import { fits } from '../src/slots.js';

test('予約人数と空き枠', () => {
  assert.equal(fits(2, 3), true);
  assert.equal(fits(4, 3), false);
});
```

`npm test` は成功しました。続いて `npx mootant run src` を実行すると、3件のミュータントのうち2件はテストが失敗し（`killed`）、1件は通ったままでした（`survived`）。残ったのはこの変更です。

```diff
- return requested <= remaining
+ return requested < remaining
```

## ファイルを書き換えずに違いを試す仕組み

Mootant 0.2.0は `oxc-parser` でソースを解析します。変更候補をメモリ上のコードに組み込み、実行時に一つずつ切り替えるので、手元の `src/slots.js` に上の差分が残るわけではありません。

最初の試行（dry run）では、どのテストファイルが変更候補の箇所を実行するかを調べます。次に、候補ごとに該当するテストファイルを実行します。今回のレポートに出たのは `survived` で、どのテストもその箇所を実行しなかったことを示す `no coverage` は0件でした。テストの呼び出し先は合っています。見直すのは渡した人数と期待値です。

## 残席を使い切るケースの再検査

2人なら `<` でも `<=` でも真、4人ならどちらでも偽です。二つの式で答えが分かれるのは、予約人数と残席が等しいときだけです。実装は変えず、先ほどの `test` の中に次の1行を足しました。

```js
assert.equal(fits(3, 3), true);
```

元の実装では `npm test` が引き続き成功しました。一方、レポートに表示されたIDで `npx mootant run src --mutant hncr` を実行すると、この変更は `killed` になりました。全件を再検査した結果も `killed 3`、`survived 0` でした。再現するときは手元のレポートに出たIDを使ってください。

この結果だけでは、3人の予約を受け付ける仕様が正しいかまでは決まりません。仮に「必ず1席空ける」という要件なら、同じ入力でも期待値は `false` です。`survived` を見つけたら、まず差分で結果が変わる入力を探し、その入力で利用者にどんな結果を返すべきかを確かめます。それが決まって初めて、実装を直すのか、テストを足すのかを選べます。

## 参考

- [Mootant公式サイト：ミュータントの実行方法](https://mootant.org/)
- [Mootant v0.2.0のREADME](https://github.com/azat-io/mootant/tree/v0.2.0#readme)
- [v0.2.0のソース解析処理](https://github.com/azat-io/mootant/blob/v0.2.0/core/parser/parse-file.ts)
