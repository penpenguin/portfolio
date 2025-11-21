---
title: 'git-worktree-runnerで平行開発を快適にする'
description: 'Agentを使った並行開発向けに、worktreeごとの依存インストールやMCP設定を自動化し、lint/testを瞬時に回すための実践メモ。'
pubDate: 2025-10-01
tags: ['git', 'worktree', 'DX']
---

公式リポジトリ: https://github.com/coderabbitai/git-worktree-runner

## なぜ使うのか

- ブランチを行き来するたびの `npm install` 地獄から解放される。
- worktreeごとに依存・キャッシュを分離でき、並列作業が安全。
- フックで作成直後のセットアップ（依存インストールや索引生成など）を自動化できる。

## 導入（最小ステップ）

```bash
git clone https://github.com/coderabbitai/git-worktree-runner.git
cd ./git-worktree-runner
sudo ln -s "$(pwd)/bin/gtr" /usr/local/bin/gtr
```

## 推奨初期設定（グローバルに1回）

```bash
cd ${project dir}
gtr config set gtr.editor.default vscode
gtr config set gtr.ai.default codex
gtr config set gtr.worktrees.dir .worktrees
gtr config add gtr.copy.exclude "**/.env"
gtr config add gtr.hook.postCreate 'cd "$WORKTREE_PATH" && npm ci'
gtr config add gtr.hook.postCreate 'uvx --from git+https://github.com/oraios/serena serena project index'
```

### よく使うコマンド

```bash
gtr new <branch>       # <branch> 用の worktree を作成
gtr editor <branch>    # その worktree をエディタで開く
gtr ai <branch>        # その worktree で AI ツールを起動
gtr rm <branch>        # worktree を削除（--delete-branch でブランチも削除）

cd "$(git gtr go <branch>)"   # worktree のパスへジャンプ
gtr list                     # すべての worktree を一覧
```

### 追加設定の例（必要なら）

```bash
gtr config set gtr.editor.default cursor
gtr config set gtr.ai.default claude

gtr config add gtr.hook.postCreate "npm ci"
gtr config add gtr.hook.postCreate "npm run build"
```

### 診断・ヘルプ

```bash
gtr doctor     # 依存や環境のヘルスチェック
gtr adapter    # 使えるエディタ/AIアダプタ一覧
gtr help       # ヘルプ
gtr version    # バージョン
```

## 運用のコツ

- フックに「依存インストール」「索引生成」を入れておくと、作った瞬間に開発可能状態になる。
- `.worktrees` をプロジェクト直下に固定すると、相対パスの共有やキャッシュヒット率が安定。
- 使い終わったら `gtr rm <branch>` で掃除し、`git worktree prune` で孤児を片付けるとクリーンに保てる。

このセットを用意しておくと、新しいブランチでも数秒で lint/test まで走り、手元のフィードバックサイクルが大幅に短縮できます。
