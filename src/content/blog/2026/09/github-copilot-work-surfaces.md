---
title: 'GitHub Copilotは「どこで動くか」で整理すると迷わない'
description: 'IDE、CLI、cloud agent、コードレビューを、実行場所と人が介入するタイミングから整理します。'
pubDate: 2026-09-03
tags: ['GitHub Copilot', 'AI Agent', 'Developer Tools']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

GitHub Copilotは、もはやエディターのコード補完だけを指す名前ではありません。Chat、IDEのAgent mode、Copilot CLI、GitHub上で動くcloud agent、PRを読むcode reviewまで、一つの製品群に広がっています。機能名から覚えようとすると境目がぼやけますが、「どこで処理が走り、成果物をどこで受け取るか」で見ると、かなりすっきりします。([GitHub Copilotのメモ][1])

## IDEとCLIは、手元の環境で一緒に進める

補完やChatは、人がコードを読み書きしている横で使う道具です。Agent modeになると、複数ファイルの編集やテスト実行まで範囲が広がりますが、作業場所はローカル環境のまま。Copilot CLIも同じく、起動した端末のファイルやシェルを扱います。

CLIには、実装前に手順を組み立てるPlan modeがあります。いきなり変更を許すのではなく、まず関連ファイルとテストを調べさせ、計画を読んでから編集へ進める使い方ができます。注意したいのは権限です。信頼したディレクトリ以下を読み書きでき、許可したコマンドも実行できるため、ホームディレクトリのように秘密情報が混ざる場所から起動しない。コマンドの一括許可も、必要な道具だけに絞るべきです。([Copilot CLI][2])

## cloud agentは、IssueをPRへ変える別の作業場

Copilot cloud agentはローカルのAgent modeとは違い、GitHub Actionsによる一時的な環境で非同期に動きます。リポジトリを調べて計画を作り、ブランチへ変更を積み、テストやlintを実行する。成果は差分やコミット、PRとして人に渡されます。手元の未pushファイルやローカル設定が、そのまま見えるわけではありません。([Copilot cloud agent][3])

任せやすいのは、完了条件が明確な小さなIssueです。目的、変更してよい範囲、触れない箇所、実行するテストまで書いておけば、作業を止める基準とPRを読む軸が残ります。「画面を改善する」のような広い依頼より、「既存の通知部品を使い、失敗時の表示は変えず、対象テストを通す」まで区切るほうが扱いやすいでしょう。

## 自動レビューを、承認の代わりにしない

Copilot code reviewは、PRから不具合やセキュリティ上の懸念、スタイルの不整合を探し、修正案を示します。ただし、コメントが付かなかったからといって正しさが保証されるわけではありません。CIは動作を確かめ、人は要件や設計との整合を判断し、Copilotは見落とし候補を増やす。この分担が無理のない置き方です。([Copilot code review][4])

リポジトリ固有のビルド手順や変更禁止箇所は、カスタム指示や `AGENTS.md` に置けます。繰り返し使う作業はSkills、外部の情報や操作はMCPと、役割を分けると常駐指示を短く保てます。([カスタマイズ早見表][5])

導入時は、製品全体を一度に評価する必要はありません。まず小さなIssueを一つ選び、ローカルで対話しながら直すのか、クラウドへ預けてPRで受け取るのかを決める。その差分を人がどれだけ直したか、どんな権限を渡したかまで見れば、チームに合う使い方が見えてきます。

## 参考

- [GitHub Copilotのメモ][1]
- [About GitHub Copilot CLI][2]
- [About GitHub Copilot cloud agent][3]
- [About GitHub Copilot code review][4]
- [Copilot customization cheat sheet][5]
- [GitHub Copilot features][6]

[1]: https://thinktwice.tech/posts/7ba1e702593ae1b6c6f1193ee66fec39/ 'GitHub Copilotのメモ'
[2]: https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli 'About GitHub Copilot CLI'
[3]: https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-cloud-agent 'About GitHub Copilot cloud agent'
[4]: https://docs.github.com/en/copilot/concepts/agents/code-review 'About GitHub Copilot code review'
[5]: https://docs.github.com/en/copilot/reference/customization-cheat-sheet 'Copilot customization cheat sheet'
[6]: https://docs.github.com/en/copilot/get-started/features 'GitHub Copilot features'
