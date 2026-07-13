---
title: 'ChatGPTの契約をアプリにつなぐ「LoginWithChatGPT」の設計を読む'
description: 'LoginWithChatGPTのデバイス認証、サーバー側プロキシ、Vercel AI SDK連携と、本番導入前に確認したい境界を整理します。'
pubDate: 2026-07-14
tags: ['AI', 'TypeScript', 'OAuth', 'Vercel AI SDK']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

LoginWithChatGPTは、利用者のChatGPTアカウントをWebアプリにつなぐ、OpenCoreDev製のTypeScript SDKです。開発者のAPIキーで推論費用を負担するのではなく、利用者自身のChatGPT契約を使う設計を採っています。OpenAI公式のSDKではなく、MITライセンスで公開されたサードパーティー製OSSです。([GitHub][1])

パッケージは役割ごとに分かれています。OAuthとトークン更新を担うcore、ログインやセッション、モデル一覧、レスポンス中継をまとめたserver、ボタンとHookを提供するreact、Vercel AI SDKとの接続を受け持つaiの4つです。Node.js 18以降に対応し、型付きESMとして配布されています。([GitHub][1])

## ログインボタンの裏側は、サーバー所有のセッション

認証にはOAuthのデバイスコードフローを使います。ブラウザがログインを始めると、サーバーはデバイスコードを取得し、利用者はOpenAIの確認画面で許可します。ブラウザからのポーリングで認証完了を確認したあと、アクセストークンとリフレッシュトークンは暗号化され、サーバー側のセッションストアへ保存されます。ブラウザに残るのは、セッションを識別するHttpOnly Cookieだけです。([How it works][2])

以後のモデル一覧取得やAIリクエストも、ブラウザからOpenAIへ直接送るわけではありません。`POST /api/chatgpt/responses` がCookieを検証し、トークンを注入してCodex側へ中継します。Vercel AI SDKでは `createChatGPTProxyProvider()` を通じて `streamText()` を使えます。利用可能なモデルは契約によって異なるため、固定値を決め打ちせず `/models` から取得するのが前提です。([Quickstart][3], [Response proxy][4])

## 「パスワードを見ない」と「権限が小さい」は別の話

このSDKのセキュリティ文書は、認証済みのアプリが利用者の契約枠を消費できる点を明記しています。許可には「読み取り専用」「1回だけ」「上限額」といった細かなスコープがありません。プロンプトや添付ファイルもアプリのサーバーを通るため、見た目だけを一般的なソーシャルログインと同じに扱うのは危険です。([Security model][5])

SDK側には、同意画面、同一オリジンを基本とするCSRF対策、セッション単位で毎分30リクエストの既定制限、モデル許可リストなどが用意されています。ただし、サーバーを管理する開発者自身が悪意を持つ場合までは防げません。運営側には、用途に合ったモデル制限、入力サイズや回数の上限、緊急停止、見える位置でのログアウトを重ねる責任が残ります。([Security model][5], [Response proxy][4])

## 本番投入は認証方式より運用設計から見る

ローカル向けの既定値は、再起動で変わるsecretとインメモリのセッションストアです。本番では固定secret、Redisやデータベースなどの共有ストア、HTTPS、複数インスタンスで共有できるレート制限が必要です。公式のProduction checklistも、デプロイ前にOpenAIの規約とポリシーを用途ごとに確認するよう求めています。([Production checklist][6])

OpenAIのCodex認証にはChatGPTログインとAPIキーの2方式があります。前者はChatGPT契約、後者はOpenAI Platformの従量課金にひもづきます。LoginWithChatGPTを検討するときは、「ログインが簡単か」だけでなく、誰の利用枠を使い、どこで内容を扱い、どう失効させるかまで先に決めたいところです。([OpenAI Codex Authentication][7])

## 参考

- [opencoredev/login-with-chatgpt][1]
- [How it works][2]
- [Quickstart][3]
- [Response proxy][4]
- [Security model][5]
- [Production checklist][6]
- [OpenAI Codex Authentication][7]

[1]: https://github.com/opencoredev/login-with-chatgpt 'opencoredev/login-with-chatgpt'
[2]: https://github.com/opencoredev/login-with-chatgpt/blob/main/docs/content/docs/concepts/how-it-works.mdx 'How it works'
[3]: https://github.com/opencoredev/login-with-chatgpt/blob/main/docs/content/docs/quickstart.mdx 'Quickstart'
[4]: https://github.com/opencoredev/login-with-chatgpt/blob/main/docs/content/docs/concepts/response-proxy.mdx 'Response proxy'
[5]: https://github.com/opencoredev/login-with-chatgpt/blob/main/docs/content/docs/concepts/security.mdx 'Security model'
[6]: https://github.com/opencoredev/login-with-chatgpt/blob/main/docs/content/docs/guides/production.mdx 'Production checklist'
[7]: https://developers.openai.com/codex/auth 'OpenAI Codex Authentication'
