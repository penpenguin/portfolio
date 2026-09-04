---
title: 'Artifact Share previewに見る、会話を塞がない外部イベント待ち'
description: 'ブラウザで受けた指摘をAIエージェントへ渡すArtifact Share previewから、待機処理と製品別の再開経路を分ける設計を読み解きます。'
pubDate: 2026-09-04
tags: ['Artifact Share', 'AI Agent', 'CLI', 'ACP']
---

> [!NOTE]
> この記事はGPT-5.6が書き、人間がレビューしています

[Artifact Shareの`preview`][1]は、ローカルのHTMLやMarkdownをブラウザで開き、画面上の指摘をAIコーディングエージェントへ渡すCLI機能です。人がコメントをまとめて送ると、エージェントがファイルを直し、保存後の内容がブラウザへ反映されます。サインインやアップロードを挟まず、レビューと修正を手元で往復できるのが狙いです。

興味深いのは画面よりも、その裏側にある「エージェントの会話を塞がず、外部イベントの到着で作業を再開させる」仕組みでした。同じ操作感をClaude Code、Codex、Cursorで作るために、共通の待機契約と製品別の起動経路を分けています。

## 待機と修正を二つのコマンドに切る

人が`preview <file>`を実行すると、そのプロセスがファイル単位のローカルサーバーになります。エージェント側の一周はシンプルです。

```sh
npx @artifactshare/cli preview next --wait 90
npx @artifactshare/cli preview done --stdin
```

`next`は指摘のバッチが届くまで待って受け取り、編集後に`done`で結果を返します。指摘は一件ずつではなくバッチで扱い、再オープンのたびに`generation`を更新。古い世代の報告や重複した報告が二重に反映されないようにしています。実装を追加したPRでは、`done`を世代ごとに冪等にすることや、コメントをファイル単位で永続化することも説明されています。([実装PR][2])

## 起こし方だけを製品別にする

難所は、長い待機コマンドをフォアグラウンドで握らせないことです。Artifact Shareは、Claude CodeではバックグラウンドのBashコマンドが完了すると次のターンが始まる性質を利用します。Codexでは実行中セッションのメッセージキューへ合図を入れ、CursorではACPで管理する専用セッションへ固定プロンプトを送ります。Cursorの公式ドキュメントでも、ACPクライアントがセッションを作成・再開し、プロンプトを送り、更新をストリームで受ける流れが公開されています。([Cursor ACP][3])

ここで通知経路に指摘本文を載せず、「届いた」という合図だけにした判断が効いています。本文は`next`で取りに行くため、イベントの保存、取得、エージェントの起動を別々に扱えます。Codexでバックグラウンド処理の完了を自動通知してほしいという要望が未解決でも、待機契約を変えずに別の起動アダプターを選べるわけです。([Codex issue][4])

## 常駐デーモンを持たず、ずれは状態として残す

`preview`は複数ファイルを束ねる常駐デーモンを置きません。一つのファイルを何度も直す用途へ絞り、1ファイル1プロセスにすることで、多重起動の管理や死活監視を減らしています。

指摘位置も座標だけでは保存しません。成果物全体、引用文と前後の文字列を持つテキスト、セレクターにラベルと周辺テキストを添えた要素、という三種類のアンカーで記録します。編集後に結び直せなければ`orphaned`へ落とし、誤った場所へ無理に紐づけない設計です。

外部イベントでエージェントを動かすCLIを考えるなら、まず「イベントを失わず保管して取得する契約」を固め、起動方法は各クライアントのアダプターへ隔離する。Artifact Shareの実装は、その境界を具体的なコマンドと状態遷移で示しています。製品ごとの差を消すのではなく、差が出る場所を狭くする設計です。

## 参考

- [会話セッションを邪魔せずに Claude Code / Codex / Cursor を外部イベントで動かすCLIの作り方まとめ][1]
- [Artifact Share: Add preview for local artifact review][2]
- [ACP | Cursor Docs][3]
- [Event-driven wakeup when background exec sessions complete][4]
- [Artifact Share CLI README][5]

[1]: https://zenn.dev/coji/articles/artifactshare-preview-claude-codex-cursor '会話セッションを邪魔せずに Claude Code / Codex / Cursor を外部イベントで動かすCLIの作り方まとめ'
[2]: https://github.com/artifactshare/artifactshare/pull/198 'Add preview for local artifact review'
[3]: https://cursor.com/docs/cli/acp 'ACP | Cursor Docs'
[4]: https://github.com/openai/codex/issues/32188 'Event-driven wakeup when background exec sessions complete'
[5]: https://github.com/artifactshare/artifactshare/blob/main/packages/cli/README.md 'Artifact Share CLI README'
