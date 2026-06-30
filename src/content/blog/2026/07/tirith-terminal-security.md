---
title: 'Tirith：実行前にターミナル入力を止めるセキュリティゲート'
description: 'Tirithについて、ホモグラフ攻撃やpipe-to-shellを実行前に検査する仕組み、AIエージェント時代の使いどころ、守備範囲の線引きを整理します。'
pubDate: 2026-07-01
tags: ['Security', 'CLI', 'Rust', 'AI Agent']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

Tirithは、ターミナルで実行されるコマンドや貼り付け内容、ファイルを、実行前に検査するセキュリティツールです。公式READMEは「ブラウザなら止めるが、ターミナルは止めない」例として、Latinの `i` に見えるキリル文字を混ぜたURLを挙げています。見た目は `install.example-cli.dev` に近くても、実際には別ドメインへ向かい、そのまま `curl | bash` で走ってしまう。Tirithはその手前に立つゲートです。([kawarimidoll.com][1], [GitHub][2])

面白いのは、単に危険そうな文字列をdeny-listで弾く話に閉じていないところです。READMEでは、ホモグラフURL、pipe-to-shell、ANSI escape、bidi制御、zero-width文字、難読化されたペイロード、認証情報の外部送信、AI向け設定ファイルの不審な内容まで検査対象として説明されています。インストールはHomebrewなら `brew install tirith`、シェル側は `tirith init` の出力を読み込む形です。hookが入ると、通常のコマンド入力の前にTirithが判断を挟みます。([GitHub][2])

## コマンドを実行せずに見る

CLIリファレンスでは、`tirith check -- <cmd>` が「コマンドを実行せずに解析する」入口として置かれています。貼り付け内容は `tirith paste`、ファイルやディレクトリは `tirith scan`、URLの信頼シグナルを見るなら `tirith score`、怪しい文字の位置を見るなら `tirith diff`。`curl | bash` の代わりに、ダウンロード、解析、レビュー、実行を分ける `tirith run <url>` もあります。CLIリファレンスではUnix向けのコマンドとして扱われています。([Commands][3])

この分解は、日々の開発で地味に効きます。危ないかもしれないコマンドを「実行してからログを見る」のではなく、実行前に構造だけ見る。たとえば、リモートから取ったスクリプトをそのままシェルへ流す、Base64を復号してインタプリタへ渡す、秘密鍵や環境変数を外へ送る。Tirithはそうしたsource-to-sinkの形に反応します。

## AIエージェントには、期待しすぎない線引きも要る

AIエージェントがシェルコマンドを提案し、そのまま実行する場面では、実行前ゲートの価値は上がります。公式ページやREADMEも、開発者だけでなくAIエージェント向けのターミナルセキュリティを前面に出しています。AI設定ファイルやスキル類のスキャンに触れている点も、いまの開発環境に寄せた設計です。([Tirith][4], [GitHub][2])

ただし、Tirithは万能の砂場ではありません。READMEとThreat Modelは、Tirithをpre-execution gateと明記し、runtime sandboxing、実行後のネットワーク監視、マルウェアの振る舞い検出、root/admin権限を持つ攻撃者への防御は範囲外だと書いています。さらに、シェルhookが効くのはhookを通るコマンドです。エージェントが非対話シェルを起動したり、hookなしで直接 `exec` したりする場合は守れません。MCP連携も、エージェント側がTirithのMCPツールを呼ぶ前提の助言的な保護です。([GitHub][2], [Threat Model][5])

## 導入するなら、まず境界を確かめる

Tirithは、危険な入力を実行前に見つけるための薄い膜として見ると扱いやすいです。普段の `git status` や `docker compose up -d` は静かに通し、疑わしいURL、不可視文字、ダウンロード即実行の流れだけで止まる。必要なら `TIRITH=0` でコマンド単位のバイパスも用意されています。組織ポリシーでは、このバイパスを無効化する設定にも触れられています。([GitHub][2], [Threat Model][5])

入れる前に見るべきなのは、検出ルールの多さよりも、自分の実行経路です。手元のzshやbashでhookが効くのか。AIエージェントのコマンドが同じ経路を通るのか。CIでは `tirith scan --format sarif` のような形でレビューに寄せるのか。そこを先に切り分けると、Tirithは「怖いから全部止める」道具ではなく、ターミナルにブラウザ的な警告面を足す道具として使いやすくなります。

## 参考

- [ターミナルの危険なコマンドを実行前に止めるtirithが良さげかも][1]
- [sheeki03/tirith][2]
- [Command reference][3]
- [Tirith — Terminal Security][4]
- [Threat Model][5]

[1]: https://kawarimidoll.com/posts/202606291/ 'ターミナルの危険なコマンドを実行前に止めるtirithが良さげかも'
[2]: https://github.com/sheeki03/tirith 'sheeki03/tirith'
[3]: https://github.com/sheeki03/tirith/blob/main/docs/commands.md 'Command reference'
[4]: https://tirith.sh/ 'Tirith — Terminal Security'
[5]: https://github.com/sheeki03/tirith/blob/main/docs/threat-model.md 'Threat Model'
