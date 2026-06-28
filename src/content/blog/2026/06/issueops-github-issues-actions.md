---
title: 'IssueOps：GitHub Issueを申請フローの入口にする'
description: 'GitHub Blogで紹介されたIssueOpsについて、Issue Forms、GitHub Actions、コメントコマンド、ラベルを組み合わせて申請や承認を扱う設計を整理します。'
pubDate: 2026-06-29
tags: ['GitHub', 'GitHub Actions', 'IssueOps']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

GitHub Blogの「IssueOps: Automate CI/CD (and more!) with GitHub Issues and Actions」は、GitHub Issues、GitHub Actions、Pull Requestをワークフロー自動化のインターフェースとして使う考え方を紹介しています。Issueをただの問い合わせ欄にせず、申請、承認、CI/CD、デプロイ、タスク割り当ての起点にする。記事ではこの実践をIssueOpsと呼んでいます。([GitHub Blog][1])

見どころは、チャットの代わりにIssueを使うという話で終わらないところです。Issueには本文、ラベル、コメント、状態、タイムラインがあり、Actionsには `issues` や `issue_comment` のようなイベントがあります。GitHub Docsでも、Issueの作成・編集・再オープン、コメントの作成・編集・削除をワークフローの起点にできると説明されています。入力と履歴が同じ場所に残るので、承認の経緯をあとから追いやすい設計になります。([GitHub Docs][2])

## 状態遷移としてIssueを見る

記事ではIssueOpsのワークフローを有限状態機械にたとえています。Issueが対象物、コメントやラベル変更がイベント、状態をまたぐ条件がguard、実行される処理がactionです。たとえばチーム参加申請なら、Issueが開かれ、内容が検証され、`.submit` で提出され、管理者の `.approve` または `.deny` で分岐し、最後に処理結果を通知してIssueを閉じます。

この見方を入れると、Workflow YAMLの `if` 条件が単なる小技ではなくなります。`.approve` という文字列だけで承認扱いにせず、対象Issueに必要なラベルが付いているか、すでに承認・否認済みではないか、コメントした人に権限があるかを確認する。IssueOps DocsのComment Workflowでも、コメント駆動の処理ではコマンド検出、Issue本文の再検証、現在状態の確認、権限確認、ラベル更新、フィードバックを分けて考える流れが示されています。([IssueOps Docs][3])

## フォーム、解析、検証を分ける

記事の実装例は、Issue Formsで「参加したいチーム名」を受け取り、`issue-ops/parser` でIssue本文をJSONに変換し、`issue-ops/validator` でテンプレートやカスタムロジックに照らして検証します。parserのREADMEは、Issue Forms由来の構造化Markdownを機械が扱いやすいJSONに変換するためのActionだと説明しています。validatorは必須入力やdropdown、checkboxesの検証に加え、開発者が用意した検証スクリプトも扱えます。([parser][4], [validator][5])

状態の更新にはラベルが使われます。`validated`、`submitted`、`approved`、`denied` のようなラベルを付け外しすれば、後続のWorkflowは「いまどこまで進んでいるか」をIssueから読めます。`issue-ops/labeler` はIssueやPull Requestのラベル追加・削除を行うActionで、明示したラベルだけでなくglobパターンに合うラベルの削除にも対応しています。([labeler][6])

## 便利さより、境界の引き方が大事

IssueOpsが向いているのは、入力、承認、実行、記録を同じリポジトリ上で閉じたい作業です。チーム参加申請のように、誰が何を頼み、誰が許可し、どの処理が走ったかを残したい場面ではかなり相性がいい。一方で、コメントが増えすぎると解析はすぐつらくなります。IssueOps Docsも、コメント駆動の柔軟さに触れつつ、Workflowを複雑にしすぎないよう注意しています。

だから最初から大きな業務ポータルを作るより、フォーム、検証、状態ラベル、承認コマンドがはっきりした小さな申請から始めるのがよさそうです。Issueを「人間が読める依頼書」と「Actionsが読める状態機械」の両方として扱う。その割り切りが、IssueOpsのおもしろいところです。

## 参考

- [IssueOps: Automate CI/CD (and more!) with GitHub Issues and Actions][1]
- [Events that trigger workflows][2]
- [IssueOps Docs - Comment Workflow][3]
- [issue-ops/parser][4]
- [issue-ops/validator][5]
- [issue-ops/labeler][6]

[1]: https://github.blog/engineering/issueops-automate-ci-cd-and-more-with-github-issues-and-actions/ 'IssueOps: Automate CI/CD (and more!) with GitHub Issues and Actions'
[2]: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows 'Events that trigger workflows'
[3]: https://issue-ops.github.io/docs/setup/comment-workflow 'IssueOps Docs - Comment Workflow'
[4]: https://github.com/issue-ops/parser 'issue-ops/parser'
[5]: https://github.com/issue-ops/validator 'issue-ops/validator'
[6]: https://github.com/issue-ops/labeler 'issue-ops/labeler'
