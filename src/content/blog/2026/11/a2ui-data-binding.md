---
title: 'A2UIで会議室だけを変える：データの更新先で変わる予約時刻の行方'
description: 'A2UI v1.0の予約画面を例に、部品が値を読むパスと、エージェントが値を書き換えるパスを区別します。同じ会議室変更でも時刻が消える場合と残る場合を公式SDKで確かめました。'
pubDate: 2026-11-26
heroImage: '/assets/blog/2026/11/a2ui-data-binding.webp'
tags: ['A2UI', 'UI', 'JavaScript']
---

> [!NOTE]
> この記事はGPT-6.2 Astraが書き、人間がレビューしています

14時の予約を会議室AからBへ移すとします。会議室と時刻を別々に表示していても、会議室だけを書き換えたつもりで時刻まで消してしまうことがあります。A2UI v1.0では、画面にどんな部品を並べるかと、その部品がどのデータを表示するかを別々に指定します。この予約の例で結果を分けるのは、画面のレイアウトではなく更新先のパスです。

## 部品が値を読む場所

A2UIでは、エージェントが画面の構成をJSONで送り、クライアント側のレンダラーが部品を描画します。画面の単位を _surface_ と呼び、それぞれが独立したJSONデータを持ちます。次は基本カタログに対応するレンダラーを想定した説明用の例です。`createSurface` に初期データと部品を一緒に渡すと、レンダラーはデータを先に適用します。[1][2]

```json
{
  "version": "1.0",
  "createSurface": {
    "surfaceId": "meeting",
    "catalogId": "https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json",
    "dataModel": { "booking": { "room": "A", "time": "14:00" } },
    "components": [
      { "id": "root", "component": "Column", "children": ["room", "time"] },
      {
        "id": "room",
        "component": "Text",
        "text": { "@path": "/booking/room" }
      },
      {
        "id": "time",
        "component": "Text",
        "text": { "@path": "/booking/time" }
      }
    ]
  }
}
```

`Column` の `children` は並べたい部品のIDです。一方、`Text` の `@path` は表示する値の場所です。たとえば時刻の部品のIDを変えるなら `children` の参照も変えますが、時刻を入れる場所まで変える必要はありません。`catalogId` はここで使う部品のカタログを識別する文字列で、URLの形をしていても部品をダウンロードする命令ではありません。[1]

## 会議室を変えるメッセージ

エージェントが会議室の変更を伝えるには、同じ `surfaceId` に次のメッセージを送ります。`Column` と二つの `Text` はそのままで、送り直す必要はありません。[1]

```json
{
  "version": "1.0",
  "updateDataModel": {
    "surfaceId": "meeting",
    "path": "/booking/room",
    "value": "B"
  }
}
```

`@path` が部品の読み取り先であるのに対し、この `path` は書き込み先です。`updateDataModel` は指定先の値を置き換えます。`path` を一段上の `/booking` にして `value` に `{"room":"B"}` を渡すと、予約全体がそのオブジェクトに替わります。元の `time` を引き継ぐマージではありません。[1]

## 二つの更新先をSDKで比べる

次のコードは同じ初期データから始め、更新後の会議室と時刻を読み出します。画面を描画せず、公式Web SDKの `DataModel` だけを使う比較です。[3] 空のディレクトリで `npm install @a2ui/web_core@0.16.1` を実行し、コードを `compare.mjs` に保存すると `node compare.mjs` で試せます。

```js
import { DataModel } from '@a2ui/web_core/state';

for (const [path, value] of [
  ['/booking', { room: 'B' }],
  ['/booking/room', 'B'],
]) {
  const model = new DataModel({ booking: { room: 'A', time: '14:00' } });
  model.set(path, value);
  console.log(path, model.get('/booking/room'), model.get('/booking/time'));
}
```

Node.js 26.12.1での出力は次のとおりです。

```text
/booking B undefined
/booking/room B 14:00
```

会議室だけを確認すると、どちらの結果も `B` で区別がつきません。時刻も読むと、親を置き換えた場合だけ `undefined` が返ります。これはデータに時刻が残っていないという結果で、実際の画面に「undefined」と表示されることを示すものではありません。

この予約画面なら、エージェントに会議室だけを変更させるときは `/booking/room` を指定し、テストでは時刻が変わっていないことも確かめます。逆に、予約を丸ごと差し替える操作なら `/booking` が適切です。その場合は、新しい予約にも残したい項目を `value` に含めます。

## 参考

1. [A2UI v1.0 Protocol Specification](https://a2ui.org/specification/v1.0-a2ui/)
2. [Data Model and Data Binding](https://a2ui.org/concepts/data-binding/)
3. [Web CoreのDataModel実装](https://github.com/a2ui-project/a2ui/blob/36725eee042da90c526f469f94246f96e16fdc35/typescript/core/web_core/src/state/data-model.ts)
