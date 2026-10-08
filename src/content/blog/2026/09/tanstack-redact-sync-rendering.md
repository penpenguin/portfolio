---
title: 'TanStack Redactを選ぶ前に見る、React APIと同期描画の違い'
description: 'Reactのimportを維持したまま実装を置き換えるTanStack Redact。軽量化の代わりに変わるTransitionやActionの挙動と、機能フラグを使う際の注意点を整理します。'
pubDate: 2026-09-21
tags: ['React', 'TanStack', 'JavaScript']
---

> [!NOTE]
> この記事はGPT-6 Astraが書き、人間がレビューしています

TanStack Redactは、ReactのコンポーネントやHooksの書き方を保ちながら、実行時の実装を置き換える軽量ランタイムです。新しいUIの書き方を覚えるより、既存のコードを残して配信するJavaScriptを減らしたい。その用途で検討する候補になります。

ただし、Reactと同名のAPIがあることと、同じ挙動になることは別です。Redactは同期描画を選び、描画の優先順位付けや中断・再開を担うconcurrent schedulingを実装していません。導入前に見るべきなのは、サイズ差だけでなく、この省略が自分の画面にどう響くかです。

## importは残せるが、RSCまで置き換えるわけではない

公式READMEの導入方法は、`@tanstack/redact`を追加し、Viteに`@tanstack/redact/vite`の`redact()`プラグインを組み込む形です。アプリ側の`react`や`react-dom/client`からのimportは維持し、プラグインがRedactの実装へ解決します。JSX用のエントリーポイントも対象です。

プラグインはクライアントとSSRのビルドを扱います。一方、React Server Componentsの環境は本家Reactのまま。SSRへの対応を、そのままRSCの再実装と受け取らないようにしたいところです。

## TransitionやActionは、名前だけで判断しない

Redactの`startTransition`と`useTransition`は処理を同期的に実行し、pendingは常に`false`。`useDeferredValue`も渡された値をそのまま返します。重い一覧の更新を後回しにして入力を優先する、というReactと同じ効果は得られません。

参考記事では、意図的に計算負荷を入れた商品一覧を両方のランタイムで比較しています。Redactでは配信サイズが小さくなる一方、入力の遅延が見られたと報告されています。これは特定のデモの結果ですが、「小さいから操作も必ず軽い」とは言えない理由が分かります。

フォーム周りにも確認が必要です。公式の互換表によると、`useActionState`は初期状態と何もしないdispatch、`false`を返し、Actionを実行しません。`useOptimistic`のsetterも何もしません。これらに処理を任せている画面では、importの差し替えだけで同じ動作になるとは考えない方がよさそうです。

## nanoは、挙動を変えずに圧縮する設定ではない

標準の`redact()`は`full`プリセットで、ネイティブアニメーションを除くオプション機能を有効にします。対して`nano`はオプション機能をすべて無効にした状態から始め、必要な機能を個別に戻す設定です。

たとえば`context`を無効にするとProviderの値は伝わらず、読み取りはデフォルト値になります。`hydration`を無効にした場合、`hydrateRoot`は例外を投げます。nanoは単なる圧縮率の切り替えではありません。不要な機能を見極めて初めて使える選択肢です。

サイズを比べる際も測定対象を揃えたい。公式READMEの表はランタイムのバンドルであり、アプリ全体のサイズではありません。実際の削減量はtree shakingや使う機能で変わります。

試すなら、まず標準設定で既存画面の挙動を比べるのが堅実です。検索入力、フォーム送信、hydrationを確認し、配信量と操作中の応答性を別々に測る。その後で使わない機能を落とす順番なら、軽量化のために何を手放したかを追いやすくなります。

## 参考

- [React 互換の軽量ランタイム TanStack Redact とは](https://azukiazusa.dev/blog/what-is-tanstack-redact/)
- [TanStack Redact README — 導入・互換性・機能フラグ](https://github.com/TanStack/redact#readme)
- [React 19.3 APIs with synchronous rendering](https://github.com/TanStack/redact/blob/main/docs/REACT_19_3_SUPPORT.md)
