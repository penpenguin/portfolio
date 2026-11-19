---
title: '常時稼働エージェントを支える待機と再開の設計'
description: 'Anthropicの設計ガイドをもとに、イベント受付、タイマー、メモリ、権限、通知を整理。SQLiteの小さな実験で、再試行による出力の重複とトランザクションの役割を確かめます。'
pubDate: 2026-11-15
heroImage: '/assets/blog/2026/11/always-on-agents-durable-cycle.webp'
tags: ['AI Agent', 'Architecture', 'SQLite']
---

> [!NOTE]
> この記事はGPT-6 Astraが書き、人間がレビューしています

Anthropicの「Building always-on agents」は、利用者が画面を閉じたあとも仕事を続けるエージェントの設計ガイドです。中心にあるのは、モデルを絶えず動かす方法ではなくイベントを受けて処理し、状態を保存して待機に戻る仕組みです。

このガイドでは一度の処理をrun、メッセージとツール呼び出しの履歴をsessionと呼びます。利用者の返答を受けて同じsessionを再開する場合もあれば、新しい仕事として別のsessionを始める場合もあります。承認待ちのsessionを保存してrunを終えれば、そのあいだも別の仕事を進められます。

## 起動の入口をそろえる

構成要素はイベントのinbox、タイマー、メモリ、権限、outboxの5つです。inboxは処理待ちイベントを保存する場所、outboxは送信待ちメッセージを保存する場所に当たります。

Webhookが届くたびにエージェントを直接呼ぶと、同時に届いたイベントが別々のrunを起動し、作業が競合することがあります。ガイドは、受付処理がまずDBへイベントを保存し、workerが未処理分を読む構成を勧めています。同じinboxで動くworkerは一度に1つにし、連続して届いたメッセージはまとめて扱います。受付への応答と、時間のかかる処理も分けられます。

タイマーはinboxとは別に保存します。期限前の予定まで処理待ちに混ぜず、schedulerが期限の来た予定をイベントに変えます。一度限りのフォローアップなら完了にし、繰り返す予定なら次回時刻へ更新してからinboxへ追加する、という役割分担です。

## 受信の重複排除と処理の再試行

入力IDを一意にしても、処理途中の失敗による出力の重複までは防げません。この違いを確認するため、Python標準ライブラリだけで動く[SQLiteの実行例](/portfolio/examples/always-on-inbox.py)を用意しました。Anthropicの実装を再現したものではなくinboxとoutboxの保存順序を調べる教材です。

前提はworkerが1つ、入力は`event-1`、出力内容は固定です。同じ入力を2回登録し、outboxへの追加とinboxの完了記録のあいだで例外を発生させます。そのあとDBへの接続を開き直して再試行します。ファイルを保存し、次のコマンドで実行できます。

```bash
python3 always-on-inbox.py
```

Python 3.9.6での実行結果は次のとおりでした。

```text
split: duplicate input -> inbox=1
split: after failure -> done=0, outbox=1
split: after retry -> done=1, outbox=2
atomic: duplicate input -> inbox=1
atomic: after failure -> done=0, outbox=0
atomic: after retry -> done=1, outbox=1
PASS: split writes duplicate output; atomic writes keep one queued output
```

`done=0`は未完了、`done=1`は完了を表します。`outbox`の数は送信待ち行数で、実際に届いた通知数ではありません。

`split`ではoutboxへの追加だけを先にcommitします。例外のあとも入力は未完了なので、再試行で同じ出力がもう一度追加されました。inboxの行数は1のままでも、outboxは2行になります。

`atomic`では出力の追加と完了記録を同じトランザクションで確定します。例外時には出力の追加も取り消され、再試行後は1行だけ残りました。違いは実行例の次の部分です。

```python
with db:
    db.execute("INSERT INTO outbox(event_id) VALUES (?)", event)
    if not atomic:
        db.commit()  # splitだけが途中で確定する
    if fail:
        raise SimulatedFailure("between output and completion")
    db.execute("UPDATE inbox SET done = 1 WHERE id = ?", event)
```

これは、DBの更新と送信予定を一緒に保存するtransactional outboxの考え方です。AWSの解説でも、業務データとoutboxを同一トランザクションで更新し、別の処理が送信を担当する構成が示されています。

ただし、この実験が確認したのは、指定した例外箇所でのDB内の整合性だけです。プロセスの強制終了、停電、複数workerの競合、外部への配信は試していません。配信側が送信後に失敗すれば再送は起こり得るため、送信先で処理済みIDを記録するなど、同じメッセージを再処理しても影響を重ねない設計が別に必要です。モデル呼び出しも含まないため、長い推論中ずっとDBのトランザクションを保持する実装例ではありません。

## 待機中に残す情報と権限

再開時には履歴だけでなく、利用者の指示、好み、既に伝えた内容、進行中の作業も必要になります。ガイドはこれらをメモリとして保存し、毎回読む指示や索引と、必要なときに読む詳細を分けています。Issueなど別のシステムから取得し直せる情報は、内容を複製するより参照先を残す方針です。

Messages APIのmemory toolも、保存場所を提供するクラウドストレージではありません。Claudeが要求したファイル操作をアプリ側で実行する仕組みで、`/memories`を実際のディレクトリやDBに対応づけるのはアプリの担当です。workerを交換したあとも同じ情報を読める保存先が要ります。

権限が必要な操作は、承認を待つ状態を保存してrunを終了し、返答をinboxのイベントとして受けて再開します。ガイドが紹介する認証情報の扱いも、エージェントに秘密を直接渡す方式とは異なります。実行環境の外のproxyが認証情報を付け、許可した接続先へ転送する構成です。権限の判断と、実際にアクセスを制限する仕組みを両方用意する必要があります。

## 最初に確かめる失敗箇所

正式なoutboxはすべてのエージェントに必須ではありません。元のガイドも単純な送信ツールで足りる場合と、通知の頻度調整や失敗からの復旧のためにoutboxを設ける場合を分けています。通知しないという終了方法も認めています。

実装を選ぶ際は、「入力を保存した直後」「結果を保存した直後」「外部へ送信した直後」で処理が止まったとき、何を再試行するかを書き出すと比較しやすくなります。今回の実験なら、入力IDの重複排除に加えて、出力と完了記録を一緒に確定する必要がありました。どこまでをDBで一括保存でき、どこからは送信先との調整になるのかが、構成を決める具体的な判断材料になります。

## 参考

- [Anthropic: Building always-on agents](https://claude.com/resources/articles/building-always-on-agents)
- [Claude Platform Docs: Memory tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)
- [Claude Code Docs: Securely deploying AI agents](https://code.claude.com/docs/en/agent-sdk/secure-deployment)
- [AWS Prescriptive Guidance: Transactional outbox pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html)
