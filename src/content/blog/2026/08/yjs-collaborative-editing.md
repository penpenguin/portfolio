---
title: 'Yjsで同時編集を「競合解決」から「部品の組み合わせ」へ'
description: 'CRDTを共有データ型として扱うYjsについて、エディタ連携、通信、プレゼンス、オフライン保存の役割分担を整理します。'
pubDate: 2026-08-26
tags: ['Yjs', 'CRDT', 'Collaborative Editing', 'Local First']
---

> [!NOTE]
> この記事はGPT-5.6が書き、人間がレビューしています

同時編集を作るとき、難所はカーソルの描画だけではありません。複数人が同じ箇所を変えたときの収束、切断中の編集、再接続後の差分交換まで考える必要があります。Yjsは、その土台を担うJavaScript向けのCRDT実装です。完成済みのエディタや専用サーバーを渡すのではなく、競合なくマージできる共有データ型を中心に、UIや通信を別の部品として組み合わせます。([GitHub][1], [公式ドキュメント][2])

## 共有データを普通のMapやTextに近い感覚で扱う

Yjsでは`Y.Doc`の中に`Y.Map`、`Y.Array`、`Y.Text`などを置きます。各クライアントで生じた変更はバイナリのdocument updateとして表現され、受け取る順序が前後しても、同じ更新を重複して受け取っても適用できます。state vectorを交換すれば、相手に足りない差分だけを算出する構成も取れます。アプリ側で編集操作ごとの競合解決規則を一から組む代わりに、共有状態の操作へ落とし込めるわけです。([Document Updates][3])

```js
import * as Y from 'yjs';

const doc = new Y.Doc();
const title = doc.getText('title');
title.insert(0, '共同編集する文章');
```

ただし、`Y.Doc`を作っただけでは画面も通信も付きません。ここを分けて考えるのがYjsの設計をつかむ近道です。

## エディタ、共有状態、通信を切り離す

公式チュートリアルでは、Quillと`Y.Text`を`y-quill`の`QuillBinding`で結び、さらに`y-websocket`や`y-webrtc`などのproviderを接続します。ProseMirror、Tiptap、Monaco、CodeMirrorなどにもbindingが用意されています。エディタが入力を受け、bindingが共有型との相互変換を担い、providerがupdateを運ぶ。三つの責務が薄く分かれています。([Collaborative Editor][4])

Yjs本体はnetwork agnosticです。WebSocketを使うなら、中央の接続先で認証・認可を扱いやすい`y-websocket`を選べます。ブラウザ同士をつなぐWebRTCや、既存の通信基盤に合わせた独自providerも候補です。通信方式を選べることと、本番運用が自動で片付くことは別です。`y-websocket`のREADMEも、付属する単純なインメモリbackendは容易にスケールできないと明記しています。([y-websocket][5])

## 文書と「いま誰がいるか」は保存先を分ける

共同編集画面には、本文とは寿命の違う情報があります。参加者名やカーソル位置、オンライン状態といったAwareness情報です。Yjsではこれを文書本体へ永続化せず、別のAwareness CRDTで配ります。利用者がオフラインになれば、その状態は削除されます。履歴として残す文書と、その瞬間だけ必要な気配を同じデータへ押し込まない設計です。([Awareness & Presence][6])

オフライン編集には`y-indexeddb`を併用できます。文書の更新をブラウザのIndexedDBへ保存するため、次回はローカルの内容を先に読み、network providerとは不足分だけを同期できます。通信とローカル保存も別々のproviderなので、要件に応じて足せます。([y-indexeddb][7])

試すなら、まず公式demoで二つのタブを開き、入力、切断、再接続時の動きを見る。その後で、本文、Awareness、認証、永続化をどの層が持つかを図にするとよさそうです。Yjsが減らすのはCRDTとエディタ連携を再実装する負担であり、権限設計やbackend運用まで消すわけではありません。この境界を見誤らないことが、導入判断の要になります。

## 参考

- [yjs/yjs][1]
- [Yjs公式ドキュメント][2]
- [Document Updates][3]
- [A Collaborative Editor][4]
- [yjs/y-websocket][5]
- [Awareness & Presence][6]
- [yjs/y-indexeddb][7]

[1]: https://github.com/yjs/yjs 'yjs/yjs'
[2]: https://docs.yjs.dev/ 'Yjs公式ドキュメント'
[3]: https://docs.yjs.dev/api/document-updates 'Document Updates'
[4]: https://docs.yjs.dev/getting-started/a-collaborative-editor 'A Collaborative Editor'
[5]: https://github.com/yjs/y-websocket 'yjs/y-websocket'
[6]: https://docs.yjs.dev/getting-started/adding-awareness 'Awareness & Presence'
[7]: https://github.com/yjs/y-indexeddb 'yjs/y-indexeddb'
