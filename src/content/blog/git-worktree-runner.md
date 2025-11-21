---
title: 'git-worktree-runnerで高速チェックフローを回す'
description: 'worktreeごとに依存をプリロードして、手元のlint/testを瞬時に回すための運用メモです。'
pubDate: 2025-10-01
tags: ['git', 'worktree', 'DX']
---

## 背景

大きめのリポジトリで複数ブランチを行き来すると、`npm install` やビルドキャッシュの切り替えに時間がかかります。`git worktree` と runner 用の専用ディレクトリを組み合わせると、ブランチごとに隔離された速い検証環境を並列で持てます。

## セットアップ手順

1. 作業用ディレクトリを用意

   ```bash
   mkdir -p .worktrees/runner && cd .worktrees/runner
   git worktree add -b feature/runner ../.. worktree-runner
   ```

2. 依存を事前インストール

   ```bash
   cd worktree-runner
   npm ci
   ```

3. runner スクリプトで lint/test を実行

   ```bash
   npm run lint && npm test
   ```

これで元の作業ツリーを汚さずに、並列でチェックを回せます。

## Tips

- worktreeを削除するときは `git worktree remove worktree-runner` を忘れずに。
- CIで流用する場合、依存キャッシュをworktree単位で分けるとヒット率が上がります。
- ブランチを作り直す際は `git worktree prune` で不要エントリを掃除すると安全です。

## まとめ

git worktree とプリロード済みのrunnerを組み合わせるだけで、手元のフィードバックサイクルを短縮できます。大規模リポジトリほど効果が大きいので試してみてください。
