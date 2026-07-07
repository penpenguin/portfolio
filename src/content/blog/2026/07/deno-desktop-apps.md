---
title: 'deno desktop：Denoだけでデスクトップアプリを包む入口'
description: 'Deno 2.9で入ったdeno desktopについて、WebView/CEF、フレームワーク検出、Deno.BrowserWindowや配布まわりの勘所を整理します。'
pubDate: 2026-07-05
tags: ['Deno', 'Desktop App', 'TypeScript']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

Deno 2.9で `deno desktop` が入りました。Deno公式ブログは、Webスタックで作ったUIをネイティブのデスクトップアプリとして包み、最後は単一の配布用バイナリにする機能だと説明しています。単一のTypeScriptファイルだけでなく、Next.jsやAstro、Fresh、Remix、Nuxt、SvelteKit、SolidStart、TanStack Start、Vite SSRのようなフレームワークプロジェクトも対象です。([Deno 2.9][1], [Desktop apps][2])

まだDeno 2.9時点ではexperimentalです。だから、すぐにElectronやTauriの置き換えとして決め打ちするより、「DenoでWebアプリを書いているなら、デスクトップ配布までどこまで同じ道具で行けるか」を見る機能として読むのがよさそうです。

## 最小形はDeno.serveから始まる

いちばん小さい例は、`Deno.serve()` でHTMLを返す `main.ts` を作り、`deno desktop main.ts` を実行する流れです。Denoのデスクトップエントリポイント内では、`Deno.serve()` がWebViewの開くポートに自動でbindするため、アプリ側でポート番号を決めて渡す必要がありません。起動するとローカルHTTPサーバーに向いたウィンドウが開きます。([Desktop apps][2])

既存のWebフレームワークを包む場合は、`deno desktop` または `deno desktop .` でカレントディレクトリのフレームワークを検出できます。リリースビルドでは本番サーバー、`--hmr` 付きでは開発サーバーとHot Module Replacementを使う、という分け方です。あずきあずささんの記事では、Next.jsのTodoアプリを作ってビルドし、macOSの `.app` として出力する手順まで確認されています。([azukiazusa.dev][4])

## 小さいWebViewか、揃ったCEFか

`deno desktop` の描画バックエンドは、デフォルトが `webview` です。WindowsではWebView2、macOSとLinuxではWebKitを使い、余計なブラウザエンジンを同梱しないぶん、バイナリを小さくしやすい。一方で、見た目やWeb Platform APIの挙動はホストOS側のエンジンに寄ります。([Deno 2.9][1], [CLI reference][3])

同じ描画結果を優先するなら `--backend cef` を選べます。Chromium Embedded Frameworkを同梱するため、ビルド時のダウンロードとサイズ増は避けられません。ここは設計の好みというより、配布するアプリが「OSに馴染む軽さ」を取るのか、「全環境で同じレンダリング」を取るのかの判断です。

## ネイティブらしさはDeno.\*に寄っている

Deno 2.9の紹介では、`Deno.BrowserWindow`、`Deno.Tray`、macOS向けの `Deno.Dock`、`prompt()` / `alert()` / `confirm()` のネイティブダイアログ、`Deno.autoUpdate()` が挙げられています。`Deno.BrowserWindow` はウィンドウサイズ、位置、表示状態、メニュー、DevToolsの制御に使え、`window.bind()` でDeno側の関数をWebView側の `bindings` 名前空間から呼べます。([Deno 2.9][1])

公式ドキュメントは、この通信をsocketベースのIPCではなくプロセス内バインディングだと説明しています。値は境界を越えるときにエンコードされますが、DenoコードとWebViewのあいだに別プロセス往復を置かない、という整理です。デスクトップアプリでよくある「UIはWeb、処理はローカル」の橋を、Denoのランタイム側にかなり寄せている印象があります。

## 配布の前に、権限と形式を見る

CLIリファレンスでは、`deno desktop` は `deno run` と同じランタイムフラグや権限フラグを受け付け、コンパイル時に与えた権限が生成バイナリへ組み込まれると書かれています。`--output` は出力パスを指定し、`.app`、`.dmg`、`.AppImage` など、拡張子で形式が決まります。`--target` や `--all-targets` によるクロスコンパイルも用意されています。([CLI reference][3])

この機能が刺さるのは、Denoでサーバーやフロントエンドを触っていて、同じTypeScriptの地続きで小さなデスクトップツールを配りたい場面だと思います。逆に、OSごとの細かい統合、既存のElectron資産、まだexperimentalなAPIを避けたいプロダクトでは、急いで乗り換える理由は薄いです。まずは `Deno.serve()` の最小例か、手元の小さなNext.js/Astroアプリを包んで、WebViewとCEFの差、出力サイズ、権限指定の感触を見るのがちょうどいい入口になります。

## 参考

- [Deno 2.9][1]
- [Desktop apps | Deno Docs][2]
- [deno desktop | Deno Docs][3]
- [Deno で Desktop アプリを作れるようになっていた][4]

[1]: https://deno.com/blog/v2.9 'Deno 2.9'
[2]: https://docs.deno.com/runtime/desktop/ 'Desktop apps | Deno Docs'
[3]: https://docs.deno.com/runtime/reference/cli/desktop/ 'deno desktop | Deno Docs'
[4]: https://azukiazusa.dev/blog/deno-desktop-app/ 'Deno で Desktop アプリを作れるようになっていた'
