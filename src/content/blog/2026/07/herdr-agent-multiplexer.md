---
title: 'Herdr：複数のAIエージェントを端末の中で束ねるマルチプレクサ'
description: 'Herdrについて、tmux的な永続セッションとAIエージェントの状態表示、リモート接続、Socket API、公式integrationの使いどころを整理します。'
pubDate: 2026-07-06
tags: ['CLI', 'AI Agent', 'Terminal', 'Rust']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

Herdrは、複数のコーディングエージェントを1つの端末で動かすためのagent multiplexerです。公式READMEは「run all your coding agents in one terminal」と説明していて、各エージェントに本物の端末paneを割り当て、blocked、working、done、idleのような状態をサイドバーで見られる設計になっています。GUIで端末を包み直すのではなく、端末の中で動く単一のRustバイナリとして振る舞うのが入口の印象です。([Herdr][1], [GitHub][2])

tmuxに近い永続セッションを持ちながら、Herdrの関心はpaneの中身が「いま待っているのか、走っているのか」まで踏み込むところにあります。READMEでは、tmuxはpaneと永続性を持つ一方でエージェントの状態を知らない、GUI型の管理アプリは状態を見せるが端末外のアプリになりがち、という比較で位置づけています。少し乱暴に言うと、Herdrは「tmuxをAIエージェントの作業場として作り直す」方向の道具です。([GitHub][2])

## paneは端末のまま、作業だけを束ねる

Herdrの基本単位はworkspace、tab、paneです。`herdr` を起動するとバックグラウンドサーバーへ接続し、paneの中で好きなエージェントやコマンドを走らせます。マウスでpaneをクリックしたり境界をドラッグしたりでき、キーボードでは `ctrl+b` をprefixにしてtab作成、pane分割、workspace切り替え、detachなどを行います。`ctrl+b` のあと `q` でdetachしてもpaneとエージェントは残り、あとで `herdr` を実行すれば戻れます。([Quick start][3], [Persistence][4])

ここは地味だけれど効くところです。複数のAIエージェントを並べると、問題は起動そのものより「どれが人間の入力を待っていて、どれがまだ作業中か」を見失うことに寄りがちです。Herdrはpaneを単なる分割画面として扱わず、プロセス名と端末出力のヒューリスティック、またはintegrationからの報告で状態をまとめます。Claude Code、Codex、OpenCode、Grok CLI、Hermes Agentなど、多くのCLI系エージェントが対応表に並んでいます。([GitHub][2], [Integrations][5])

## リモートと復元を前提にしている

Herdrはローカル端末だけで完結する道具ではありません。VPSや作業用サーバーでHerdrを動かし、手元から `herdr --remote workbox` や `herdr --remote ssh://you@server:2222` で接続する使い方が説明されています。このモードでは手元のHerdrがthin clientになり、SSH越しにリモートのHerdrサーバーへつながります。通常のSSH先で `herdr` を起動する使い方も残されていて、どちらを選ぶかでローカルのクリップボード機能などの扱いが変わります。([Persistence][4])

セッション名を分ければ、仕事用、個人プロジェクト用のように独立したサーバーを持てます。pane、tab、workspace、socket、runtime stateはセッションごとに分かれ、設定ファイルは共有される、という線引きです。単に「閉じても消えない」だけでなく、複数の作業群をどう再接続するかまで設計に入っています。([Persistence][4])

## APIがあるので、人間だけの道具で終わらない

HerdrにはCLI wrapperとローカルSocket APIがあります。ドキュメントでは、通常の自動化はCLIから始め、長いイベント購読や直接のrequest/response制御が必要なときにraw socket APIを使う方針が示されています。APIからはworkspaceやtabの作成、paneの分割、コマンド実行、pane出力の読み取り、agent状態の待機、integrationのinstall/uninstallなどを扱えます。pane IDは `w1:p1` のような形式です。([Socket API][6])

このAPI面があることで、Herdrは「人間が眺めるダッシュボード」だけではなくなります。エージェント自身がpaneを作り、補助プロセスを走らせ、出力を読み、状態変化を待つ。そこまで任せるなら、端末は人間の表示面であると同時に、エージェントが安全に触れる作業面にもなります。もちろん、導入前にはライセンスも見ておきたいところです。HerdrはAGPL-3.0-or-laterと商用ライセンスのデュアルライセンスとして公開されています。([GitHub][2])

## 参考

- [Herdr][1]
- [ogulcancelik/herdr][2]
- [Quick start][3]
- [Persistence and remote access][4]
- [Integrations][5]
- [Socket API][6]

[1]: https://herdr.dev/ 'Herdr'
[2]: https://github.com/ogulcancelik/herdr 'ogulcancelik/herdr'
[3]: https://herdr.dev/docs/quick-start/ 'Quick start'
[4]: https://herdr.dev/docs/persistence-remote/ 'Persistence and remote access'
[5]: https://herdr.dev/docs/integrations/ 'Integrations'
[6]: https://herdr.dev/docs/socket-api/ 'Socket API'
