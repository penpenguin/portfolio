---
title: 'AIエージェント向けブラウザKitesurfは、速さより軽さを選んだ'
description: 'CloudflareのKitesurfが人間向けブラウザの機能を削り、短時間のWeb操作に合わせた設計と、その性能上の割り切りを読み解きます。'
pubDate: 2026-08-14
tags: ['Cloudflare', 'AI Agent', 'Browser', 'WebAssembly']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

Cloudflareがベータ公開した「Kitesurf」は、AIエージェントのために作られたブラウザです。Chromiumを小さくしたものではありません。Cloudflare WorkersのV8 isolate上で動き、ページの内容抽出やスクリーンショット、PDF生成といった短時間の処理へ狙いを絞っています。人が画面を見て使うブラウザとは、必要なものの順番が違う。そこから設計を組み直した点が面白いプロジェクトです。([GIGAZINE][1], [Cloudflare Blog][2])

## タブも拡張機能も持たない

人間向けのブラウザには、タブ、テーマ、拡張機能、端末間同期、滑らかなスクロール、画面を正確に描くための仕組みがあります。エージェントがHTMLを読み、リンクをたどるだけなら、その多くは重荷になります。Kitesurfは見た目の完全な再現より、CPUとメモリの消費、同時に立ち上げられるセッション数、機械が扱いやすいDOMを優先しました。

その代わり、どんなサイトでもChromiumと同じように動くわけではありません。動画とWebGL、実際のTLSフィンガープリントを求めるボット対策、状態を保つ長時間の認証セッションは現時点の対象外です。この境界を越える用途には、Cloudflare自身もBrowser Runの標準Chromiumを案内しています。([Cloudflare Docs][3])

## Workersの分離をブラウザの部品に使う

Kitesurfは役割をいくつかのWorkerへ分けています。外部からChrome DevTools Protocol（CDP）やREST APIを受け、セッション状態を持つのがEngine。ページごとに起動するPageScriptはHTMLとCSSを解析し、DOMを組み立ててJavaScriptを実行します。描画を担うPageRendererはページの状態を持たず、必要な場面だけ画像やPDFを返します。

ネットワークへ直接出られるのはSandboxOutboundだけです。CORSの適用、レスポンスの検査、ページごとのCookie管理をここへ集め、ほかの部品から通信経路を切り離しています。処理が止まったPageRendererは捨てて起動し直せる。短命なタスクを大量にさばく設計と、信頼できないページを隔離する設計が同じ方向を向いています。HTMLとCSSの処理にはRust製のBlitzやStyloを使い、WebAssemblyへコンパイルしてWorkers上で動かしています。([Cloudflare Blog][2])

## 軽いが、待ち時間は短くない

Cloudflareが14件のURLを各5回実行した中央値では、HTML抽出時のメモリ使用量はKitesurfが39.4 MiB、ウォーム状態のChromiumが273.7 MiBでした。CPU時間も229ミリ秒対877ミリ秒です。ところが処理完了までの実時間は820ミリ秒対472ミリ秒で、Kitesurfのほうが1.7倍遅い。スクリーンショットでも、CPUとメモリは少ない一方、実時間では1.8倍遅いという結果でした。([Cloudflare Docs][3])

つまりKitesurfは、1件を最速で終わらせるブラウザではありません。短い仕事が一度に押し寄せる場面で、各セッションを軽く保つための選択です。既存のPuppeteerやPlaywrightからは、Browser RunのCDPエンドポイントへ`browser=kitesurf`を加えて試せます。現在はアカウントごとの上限がある無料ベータなので、まず公開プレイグラウンドで対象サイトの表示とDOM、コンソール、メモリを確かめるのが堅実です。WPTの通過数より先に、自分が操作したいサイトが動くかを見る。その割り切りまで含めて、エージェント向けブラウザらしい設計です。

## 参考

- [CloudflareがAIエージェント向けブラウザ「Kitesurf」をリリース][1]
- [Introducing Kitesurf: The agent-first browser that runs in V8 isolates on Cloudflare Workers][2]
- [Kitesurf · Cloudflare Browser Run docs][3]
- [Kitesurf Playground][4]

[1]: https://gigazine.net/news/20260810-cloudflare-kitesurf/ 'CloudflareがAIエージェント向けブラウザ「Kitesurf」をリリース'
[2]: https://blog.cloudflare.com/kitesurf/ 'Introducing Kitesurf: The agent-first browser that runs in V8 isolates on Cloudflare Workers'
[3]: https://developers.cloudflare.com/browser-run/kitesurf/ 'Kitesurf · Cloudflare Browser Run docs'
[4]: https://kitesurf.cloudflare.app/ 'Kitesurf Playground'
