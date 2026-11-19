---
title: 'AstryxのCLIで確かめるコンポーネント仕様とエラー処理'
description: 'Astryx 0.7.13のCLIを実行し、Buttonの仕様、名前を間違えたときのJSON、回答元のバージョンを確認。AIにUIを書かせる前の参照手順を整理します。'
pubDate: 2026-11-11
heroImage: '/assets/blog/2026/11/astryx-cli-verified-component-docs.webp'
tags: ['Astryx', 'React', 'CLI', 'AIエージェント']
---

> [!NOTE]
> この記事はGPT-6 Astraが書き、人間がレビューしています

AstryxはMetaが公開しているReact向けのデザインシステムです。コンポーネントに加え、仕様や使用例を取得するCLIを備えています。以前の[概要記事](/portfolio/blog/2026/06/astryx-agent-ready-design-system/)に対し、ここではCLIの実行結果から、コードを書く前に何を確認できるかを掘り下げます。

公式ブログは「CLIがドキュメントであり、Webサイトはその利用側」と説明しています。AIに別のUIライブラリの記憶でpropsを補わせるより、使うパッケージの仕様をその場で取得する設計です。ただし、取得できたことと、AIが仕様を守って実装したことは別に確認する必要があります。

## Buttonの仕様を取得する

以下は2026年11月11日にmacOS、Node.js 22.23.1で実行した例です。既存プロジェクトの外に検証用フォルダを用意し、CLIを0.7.13に固定しました。アプリの依存関係やエージェント設定は変更せず、ドキュメントの取得だけを試しています。初回はnpmからの取得が必要です。

```bash
npm exec --yes --package=@astryxdesign/cli@0.7.13 -- astryx component Button --json
```

終了コードは0でした。出力から、識別と回答元に関するフィールドだけを抜き出すと次の形です。

```json
{
  "apiVersion": 1,
  "type": "component.detail",
  "package": "@astryxdesign/core",
  "data": {
    "name": "Button",
    "import": "@astryxdesign/core/Button"
  },
  "meta": {
    "answeredBy": {
      "cli": "0.7.13",
      "core": "0.7.13",
      "copy": "carried"
    }
  }
}
```

実際の`data`にはpropsや使用例も含まれます。Buttonの`label`は必須で、`children`を指定して表示内容を置き換えても必要です。また、`variant`の既定値は`secondary`でした。別のライブラリでよく使う書き方を当てはめず、import先、必須項目、既定値をまとめて確認できます。

`meta.answeredBy`には、回答したCLIと組み合わせたCoreのバージョン、それがどのコピーかが記録されます。この実行では`copy`が`carried`でした。プロジェクト外の照会結果を、そのまま既存アプリの依存バージョンの仕様とみなさないためにも、残しておきたい情報です。

## 名前を間違えたときの分岐

次に、同じ環境でButtonを意図的に`Buttn`と入力しました。CLI READMEにもある誤記の例です。

```bash
npm exec --yes --package=@astryxdesign/cli@0.7.13 -- astryx component Buttn --json
```

終了コードは1で、次のJSONが返りました。

```json
{
  "apiVersion": 1,
  "error": "No component named \"Buttn\"",
  "code": "ERR_UNKNOWN_COMPONENT",
  "suggestions": [
    {
      "name": "Button",
      "reason": "similar name (distance 1)"
    },
    {
      "name": "IconButton",
      "reason": "keyword \"button\" (distance 1)"
    }
  ]
}
```

これは依存関係の不足や通信失敗ではなく指定した名前に一致するコンポーネントがないという応答です。CLI READMEは自動処理では説明文の`error`ではなく安定した識別子の`code`で分岐するよう案内しています。

この結果を使うなら、`ERR_UNKNOWN_COMPONENT`のときは候補を確認し、選んだ名前で再照会する処理にできます。今回はButtonを指定すると先ほどの仕様が返ります。ただし、候補にはIconButtonも含まれます。最初の候補へ無条件に置換せず、画面に必要なのが文字付きの操作なのか、アイコンのみの操作なのかを判断する余地は残ります。

## エージェントへの参照手順

公式の「Working with AI」は、導入したプロジェクトで`init --features agents`を実行し、コンポーネント索引やCLIの参照方法をエージェント向けファイルに生成する手順を案内しています。通常は`AGENTS.md`が対象です。このコマンドはファイルを書き換えるため、上の読み取りだけの検証には含めていません。

生成される案内には`build`で作りたい画面に近いテンプレートを探し、`template`で配置し、使う部品ごとに`component`でpropsと例を読む流れがあります。画面の構成と部品の仕様を別々に確認する手順です。

実装前の確認項目としては、取得した名前とimport先が意図に合うか、必須propsが揃うか、回答元がアプリのバージョンと合うかを使えます。検索に失敗したらエラーコードで原因を分け、仕様が取れたあとに型検査と画面の操作確認へ進む、という使い方が考えられます。

## 導入前に確認する範囲

Astryxは確認時点でBetaです。UIを動かすにはReact 19以降が必要で、公式の導入手順にはCSSの読み込みとテーマの設定もあります。CLIでButtonの説明を取得しただけでは、アプリに導入できたことにはなりません。

今回確かめたのは、固定したCLIから仕様と回答元を取得できること、誤った名前に対してエラーコードと候補が返ることです。生成したUIの品質やアクセシビリティ、エージェントの誤りが減る割合は測っていません。採用を試すなら、既存画面の小さな操作を一つ置き換え、取得した仕様どおりに実装できるかと、テーマを含めた見た目やキーボード操作を確認するところから始められます。

## 参考

- [Astryx README](https://github.com/meta/astryx/tree/v0.7.13)
- [CLI READMEとJSON API](https://github.com/meta/astryx/blob/v0.7.13/packages/cli/README.md)
- [Working with AI](https://astryx.atmeta.com/docs/working-with-ai)
- [Getting Started](https://astryx.atmeta.com/docs/getting-started)
- [The best CLI is one you never run](https://astryx.atmeta.com/blog/the-astryx-cli)
- [Astryx 0.7.13リリース](https://github.com/meta/astryx/releases/tag/v0.7.13)
