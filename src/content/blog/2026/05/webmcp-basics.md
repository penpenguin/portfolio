---
title: 'WebMCPの基本：Webページの操作をAIエージェント向けツールとして公開する'
description: 'WebMCPの概要、MCPとの違い、navigator.modelContextを使ったツール登録、実行時の挙動、注意点を簡単なコード例で解説します。'
pubDate: 2026-05-10
tags: ['WebMCP', 'MCP', 'AIエージェント', 'Web']
---

> [!NOTE]
> この記事はGPT-5.5 Proが作成し、人間がレビューしています。

AIエージェントがWebサイトを操作するとき、従来は画面を読み取り、ボタンやフォームを推測しながらクリックする方法が中心でした。この方法では、UIの変更、ラベルの違い、画面状態の揺れによって操作が失敗しやすくなります。

WebMCPは、この問題に対して「Webページ側が、AIエージェントに呼び出してよい操作を構造化されたツールとして公開する」ための仕組みです。現在は提案中のブラウザ標準であり、WebアプリケーションがJavaScriptベースのツールをAIエージェントに提供するAPIとして説明されています。仕様文書はDraft Community Group Reportであり、W3C標準そのものではありません。

この記事では、WebMCPの基本的な考え方、MCPとの違い、`navigator.modelContext.registerTool()`を使った簡単なツール登録、エージェントから呼び出されたときの挙動、実装時の注意点を扱います。

## WebMCPで何が変わるか

まず、WebMCPが解決しようとしている問題を整理します。ポイントは、AIエージェントが画面から操作を推測するのではなく、Webサイト側が操作の名前、説明、入力スキーマ、実行関数を明示することです。

たとえば、ECサイトで商品を検索する場合、従来のエージェントは検索ボックスを探し、キーワードを入力し、検索ボタンを押し、結果一覧を読み取ります。これは人間の操作に近い方法ですが、DOM構造やUI文言が変わると失敗しやすくなります。

WebMCPを使うと、ページ側は次のような操作をツールとして公開できます。

```text
search-products
  description: 商品をキーワードで検索する
  inputSchema:
    query: string
    maxPrice: number
  execute:
    ページ内の商品検索ロジックを呼び出す
```

エージェントは「検索ボックスがどこにあるか」を推測するのではなく、`search-products`というツールを見つけ、JSON形式の入力を渡して呼び出します。Chrome for Developersでも、WebMCPはWebサイトを「agent-ready」にし、DOM操作より信頼性と性能の高いワークフローを可能にするAPIとして説明されています。([Chrome for Developers][1])

## MCPとWebMCPの違いを押さえる

WebMCPは名前にMCPを含みますが、サーバー側のMCPをそのままブラウザに移植したものではありません。WebMCPは、MCPに着想を得たブラウザ向けのAPI群として位置づけると理解しやすいです。

MCPは、AIエージェントが外部のデータソース、ツール、ワークフローに接続するための汎用的なプロトコルです。一方、WebMCPは、ユーザーが開いているWebページ上で、そのページの機能をブラウザ経由でエージェントに公開します。Chrome for Developersは、MCPをバックエンド向け、WebMCPをフロントエンド向けと整理しています。([Chrome for Developers][2])

違いを簡単にまとめると、次のようになります。

| 項目                 | MCP                                       | WebMCP                                       |
| -------------------- | ----------------------------------------- | -------------------------------------------- |
| 主な場所             | サーバー、ローカルプロセス、外部システム  | ブラウザ内のWebページ                        |
| ライフサイクル       | 永続的に使えることが多い                  | ページやタブに結びつく                       |
| 実装単位             | MCPサーバー                               | ページ内JavaScriptまたはHTML                 |
| 主な用途             | API操作、データ取得、バックグラウンド処理 | 開いているWebページの操作                    |
| エージェントとの関係 | エージェントがサーバーに接続する          | ブラウザがページとエージェントの間を仲介する |

つまり、WebMCPは「既存のWeb UIをAIエージェントから扱いやすくする」ための仕組みです。ユーザーがページを開いている状態で、ページ側が公開した操作をエージェントが呼び出します。

## ツールを登録する基本形

ここでは、`navigator.modelContext.registerTool()`を使って、ページ内の商品検索機能をWebMCPツールとして公開する例を示します。仕様では、`navigator.modelContext`が`ModelContext`を返し、`registerTool()`によってツールを登録する形が定義されています。([Web Machine Learning][3])

まず、通常のページ内ロジックとして商品検索関数があるとします。

```js title="src/products.js"
const products = [
  { id: 'p-001', name: 'USB-C Cable', price: 1200 },
  { id: 'p-002', name: 'Wireless Mouse', price: 3200 },
  { id: 'p-003', name: 'Laptop Stand', price: 4800 },
];

function searchProducts({ query, maxPrice }) {
  return products.filter((product) => {
    const matchesQuery = product.name
      .toLowerCase()
      .includes(query.toLowerCase());

    const matchesPrice =
      typeof maxPrice === 'number' ? product.price <= maxPrice : true;

    return matchesQuery && matchesPrice;
  });
}
```

この関数は、ページ内の商品配列を検索して結果を返します。WebMCPのためにまったく別の処理を作るのではなく、既存のアプリケーションロジックをツールの`execute`から呼び出す点が重要です。

次に、この検索処理をWebMCPツールとして登録します。

```js title="src/webmcp.js"
if ('modelContext' in navigator) {
  navigator.modelContext.registerTool({
    name: 'search-products',
    title: '商品検索',
    description: '商品名のキーワードと任意の上限価格で商品を検索します。',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '検索に使う商品名のキーワード',
        },
        maxPrice: {
          type: 'number',
          description: '検索対象に含める商品の上限価格',
        },
      },
      required: ['query'],
    },
    annotations: {
      readOnlyHint: true,
    },
    async execute({ query, maxPrice }) {
      const results = searchProducts({ query, maxPrice });

      return {
        count: results.length,
        items: results.map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
        })),
      };
    },
  });
}
```

ここで登録している情報は、主に次の5つです。

- `name`: エージェントが呼び出すツール名
- `title`: ユーザーインターフェース上で表示しやすい名前
- `description`: いつ、何のために使うツールかを説明する文
- `inputSchema`: 入力値の構造を表すJSON Schema
- `execute`: ツールが呼び出されたときに実行される関数

仕様では、`ModelContextTool`に`name`、`title`、`description`、`inputSchema`、`execute`、`annotations`が含まれます。また、`inputSchema`はJSON Schemaオブジェクトとして説明されています。([Web Machine Learning][3])

## エージェントが呼び出すと何が起きるか

次に、登録したツールが呼び出されたときの流れを見ます。WebMCPでは、ページがツールを登録し、ブラウザがその情報をエージェントに見せ、エージェントがツール名と入力を指定して呼び出します。

たとえば、ユーザーがエージェントに次のように依頼したとします。

```text
5000円以下のUSB-C関連商品を探して
```

エージェントは、ページが公開している`search-products`を見つけると、次のような入力でツールを呼び出せます。

```json
{
  "query": "USB-C",
  "maxPrice": 5000
}
```

ページ側では、`execute`が呼び出されます。先ほどの例では`searchProducts()`が実行され、結果がエージェントに返ります。

```json
{
  "count": 1,
  "items": [
    {
      "id": "p-001",
      "name": "USB-C Cable",
      "price": 1200
    }
  ]
}
```

この結果から、エージェントは「USB-C Cableが条件に一致する」と判断できます。画面上の検索フォームを探したり、検索結果のDOMを読み解いたりする必要はありません。

このように、WebMCPの中心は「ページ側が操作の契約を公開し、エージェントがその契約に従って呼び出す」ことです。仕様の説明でも、ツールには自然言語の説明、構造化スキーマ、実行関数が含まれ、エージェントからのツール呼び出しによってJavaScriptコールバックが実行されるとされています。([GitHub][4])

## 状態を変更する操作ではユーザー確認を入れる

検索のような読み取り操作は比較的扱いやすいですが、購入、予約、送信、削除のように状態を変更する操作では、ユーザー確認が必要になります。

WebMCPの`ModelContextClient`には、ツール実行中にユーザー操作を要求する`requestUserInteraction()`が定義されています。仕様では、このメソッドはツール実行中にユーザー入力を非同期に求めるためのものとして説明されています。([Web Machine Learning][3])

以下は、商品をカートに追加するツールの例です。

```js title="src/cart-webmcp.js"
if ('modelContext' in navigator) {
  navigator.modelContext.registerTool({
    name: 'add-to-cart',
    title: 'カートに追加',
    description: '指定された商品IDの商品をカートに追加します。',
    inputSchema: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: 'カートに追加する商品のID',
        },
        quantity: {
          type: 'number',
          description: '追加する数量',
        },
      },
      required: ['productId', 'quantity'],
    },
    async execute({ productId, quantity }, client) {
      const confirmed = await client.requestUserInteraction(async () => {
        return window.confirm(`${productId}を${quantity}個カートに追加しますか？`);
      });

      if (!confirmed) {
        throw new Error('ユーザーがカート追加をキャンセルしました。');
      }

      addToCart(productId, quantity);
      updateCartBadge();

      return {
        status: 'added',
        productId,
        quantity,
      };
    },
  });
}
```

この例では、エージェントが`add-to-cart`を呼び出しても、すぐにカートへ追加しません。まず`requestUserInteraction()`で確認ダイアログを表示し、ユーザーが承認した場合だけ`addToCart()`を実行します。

実行後には、ページ内のカート状態が更新され、UI上のカート件数も更新されます。さらに、エージェントには次のような結果が返ります。

```json
{
  "status": "added",
  "productId": "p-001",
  "quantity": 2
}
```

ここで確認すべき点は、WebMCPが「エージェントに何でも自由に操作させる仕組み」ではないことです。ページ側が公開するツールを選び、必要に応じてユーザー確認を挟むことで、Webサイト側が操作の境界を定義できます。

## 読み取り専用ツールにはreadOnlyHintを付ける

WebMCPのツールには、追加情報として`annotations`を設定できます。代表的なものが`readOnlyHint`です。これは、そのツールが状態を変更せず、読み取りだけを行うことを示すヒントです。

先ほどの商品検索ツールでは、次のように指定しました。

```js
annotations: {
  readOnlyHint: true,
}
```

仕様では、`readOnlyHint`が`true`の場合、そのツールが状態を変更せずデータを読むだけであることを示し、エージェントが安全に呼び出せるか判断する助けになると説明されています。([Web Machine Learning][3])

一方で、`add-to-cart`のような状態変更ツールには、安易に`readOnlyHint: true`を付けるべきではありません。ツールの説明、入力スキーマ、アノテーションが実際の挙動とずれていると、エージェントは誤った判断をしやすくなります。

## Declarative APIとImperative APIを区別する

WebMCPには、大きく分けてDeclarative APIとImperative APIの2つの考え方があります。Chrome for Developersでは、Declarative APIはHTMLフォームで定義できる標準的な操作、Imperative APIはJavaScript実行を必要とする複雑で動的な操作に向いたAPIとして説明されています。([Chrome for Developers][1])

この記事で扱った`navigator.modelContext.registerTool()`は、JavaScriptでツールを登録するImperative APIの例です。既存の関数を呼び出したり、ページの状態を更新したり、確認ダイアログを挟んだりする場合に向いています。

一方、Declarative APIは、フォームのような既存のHTML構造からツール的な操作を公開する方向のAPIです。ただし、2026年4月23日時点の仕様文書ではDeclarative WebMCPの節にTODOが残っているため、実装時には最新の仕様やブラウザの提供状況を確認する必要があります。([Web Machine Learning][3])

## ブラウザで対応状況を確認する

WebMCPは提案中の仕様であり、すべてのブラウザで一般利用できる前提では扱えません。Chrome for Developersでは2026年2月にEarly Previewとして案内されており、プロトタイピング向けの段階として紹介されています。([Chrome for Developers][1])

ページ側では、最低限の確認として`navigator.modelContext`が存在するかを見ます。

```js
if ('modelContext' in navigator) {
  console.log('WebMCP is available');
} else {
  console.log('WebMCP is not available in this browser');
}
```

未対応ブラウザでは、WebMCPツールを登録せず、通常のWeb UIだけを提供します。これにより、WebMCP対応のエージェントには構造化ツールを提供しつつ、通常のユーザーには従来どおりの画面操作を提供できます。

Cloudflare Browser Runのドキュメントでも、WebMCPは実験的なブラウザ機能として扱われ、Chrome betaを使った検証手順が紹介されています。([Cloudflare Docs][5])

## 実装時に注意すること

WebMCPを導入するときは、まず小さな読み取り操作から始めるのが現実的です。検索、一覧取得、現在の選択状態の取得などは、ページ状態を壊しにくく、出力も確認しやすいからです。

一方で、予約、購入、削除、送信のような操作は、ユーザー確認、権限、エラーハンドリングを明確にする必要があります。ツールの`description`には、エージェントが誤解しないように「何をする操作か」「何を変更するか」を具体的に書きます。

また、ツールがページ内の状態を変更した場合は、UIも同じ状態に更新する必要があります。仕様提案の説明でも、ツール呼び出し後にページがUIを更新し、ユーザーとエージェントが同じWebインターフェース上で状態を共有できる点が重視されています。([GitHub][4])

WebMCPの制約として、ブラウジングコンテキスト、つまりブラウザタブやWebViewが必要であり、現時点ではUIなしのヘッドレス呼び出しを主目的にはしていません。また、どのサイトがどのツールを提供しているかを、訪問前に発見する仕組みも課題として挙げられています。([GitHub][4])

## まとめ

WebMCPは、Webサイト側がAIエージェントに対して、ページ内で安全に呼び出してほしい操作を構造化されたツールとして公開するための仕組みです。

従来のようにエージェントが画面を見てクリック対象を推測するのではなく、ページ側が`name`、`description`、`inputSchema`、`execute`を持つツールを登録します。これにより、検索、フィルタリング、カート追加、フォーム送信などの操作を、より明示的な契約として扱えます。

ただし、WebMCPはまだ提案中の仕様です。実装する場合は、対応ブラウザ、最新仕様、ユーザー確認、状態変更時のUI同期を確認しながら進める必要があります。まずは読み取り専用の小さなツールを登録し、エージェントがどのような入力で呼び出し、どのような結果を受け取るかを観察すると、仕組みを理解しやすくなります。

## 参考

- WebMCP Draft Community Group Report ([Web Machine Learning][3])
- Chrome for Developers: WebMCP is available for early preview ([Chrome for Developers][1])
- Chrome for Developers: WebMCP と MCP の使い分け ([Chrome for Developers][2])
- webmachinelearning/webmcp proposal.md ([GitHub][4])
- Cloudflare Browser Run: WebMCP ([Cloudflare Docs][5])

[1]: https://developer.chrome.com/blog/webmcp-epp 'WebMCP is available for early preview | Blog | Chrome for Developers'
[2]: https://developer.chrome.com/blog/webmcp-mcp-usage?hl=ja 'WebMCP と MCP の使い分け | Blog | Chrome for Developers'
[3]: https://webmachinelearning.github.io/webmcp/ 'WebMCP'
[4]: https://github.com/webmachinelearning/webmcp/blob/main/docs/proposal.md 'webmcp/docs/proposal.md at main · webmachinelearning/webmcp · GitHub'
[5]: https://developers.cloudflare.com/browser-run/features/webmcp/ 'WebMCP · Cloudflare Browser Run docs'
