---
title: 'git-worktree-runner で並行開発をまわすサンプルメモ'
description: 'AIエージェントと git worktree を組み合わせて、worktree ごとの依存インストールやインデックス作成を自動化するためのセットアップ例。'
pubDate: 2025-11-21
tags: ['git', 'worktree', 'agent']
impression: '便利ではあるが、issueと連携しにくくprはコミットが必要なのでそれぞれのタスクを微妙に管理しづらいと思った。 '
---

> [!NOTE]
> この記事はAIが書き、人間がレビューしています

公式リポジトリ: https://github.com/coderabbitai/git-worktree-runner

ここに書いているのはあくまで一例です。プロジェクトの規模や使っている AI / エディタにあわせて、ほどよく削ったり足したりしてください。

> ※ v2 以降はコマンドが `gtr` ではなく `git gtr` に変わっているので、以下は `git gtr` 前提で書いています。

---

## なぜ使うのか

- ブランチを行き来するたびに `npm install` し直す手間を減らしたい。
- worktree ごとに依存・キャッシュを分離して、並行作業（レビュー用ブランチ・修正用ブランチなど）を安全に走らせたい。
- worktree 作成直後に「依存インストール」「Serena などのインデックス作成」まで自動で終わっていてほしい。

git worktree だけでも頑張れば同じことはできますが、コマンドが長くなりがちなので、日常的に使うならラッパーがあると楽です。

---

## 導入（最小ステップ）

macOS / Linux 想定。Windows なら Git Bash から同じノリでいけます。

```bash
git clone https://github.com/coderabbitai/git-worktree-runner.git
cd git-worktree-runner

# 実行ファイルを PATH に通す（README に合わせた例）
sudo ln -s "$(pwd)/bin/git-gtr" /usr/local/bin/git-gtr

# 好みでショートカットを貼っておくと楽
echo "alias gtr='git gtr'" >> ~/.zshrc  # or ~/.bashrc
source ~/.zshrc
````

以降、このメモでは `git gtr` と書きますが、上の alias を入れていれば単に `gtr` と打っても同じです。

---

## 設定の分け方イメージ

* **グローバル（一度きり）**: よく使うエディタ / AI ツールのデフォルト
* **リポジトリ単位**: worktrees の配置場所、コピー対象、フック（インストールやインデックス作成）

以下の例ではこの切り方をしています。

---

## グローバル初期設定（1回やっておく）

```bash
# 好きなエディタ / AI ツールをグローバルデフォルトに
git gtr config set gtr.editor.default cursor --global   # or vscode, zed
git gtr config set gtr.ai.default claude --global       # or aider, codex, cursor, continue
```

---

## プロジェクトごとの初期設定例

```bash
cd ${project_dir}

# worktree はリポジトリ直下の .worktrees/ にまとめる
git gtr config set gtr.worktrees.dir .worktrees

# .env は新しい worktree にコピーしない（多値）
git gtr config add gtr.copy.exclude "**/.env"

# worktree 作成直後に依存インストール
git gtr config add gtr.hook.postCreate 'cd "$WORKTREE_PATH" && npm ci'

# Serena MCP でプロジェクトのインデックスを張る例
git gtr config add gtr.hook.postCreate \
  'cd "$WORKTREE_PATH" && uvx --from git+https://github.com/oraios/serena serena project index'
```

* `WORKTREE_PATH` は gtr 側がフックに渡してくれる環境変数。
* Serena を使っていないなら、最後の行は丸ごと消して OK です。

---

## よく使うコマンド

```bash
git gtr new <branch>        # <branch> 用の worktree を作る
git gtr editor <branch>     # その worktree をエディタで開く
git gtr ai <branch>         # その worktree で AI ツールを起動
git gtr rm <branch>         # worktree を削除（--delete-branch でブランチも削除）

cd "$(git gtr go <branch>)" # worktree のパスへジャンプ
git gtr list                # すべての worktree を一覧
```

`git gtr go 1` とすると「元のリポジトリ」に戻れるので、覚えておくと便利です。

---

## 追加設定の例（必要になったら）

プロジェクトによっては、もう少しフックを厚めにしておくと楽です。

```bash
# エディタ / AI ツールをプロジェクト単位で上書きしたい場合
git gtr config set gtr.editor.default vscode
git gtr config set gtr.ai.default codex

# worktree 作成直後にビルドまで回したい場合
git gtr config add gtr.hook.postCreate "npm ci"
git gtr config add gtr.hook.postCreate "npm run build"
# 好みで lint / test も
# git gtr config add gtr.hook.postCreate "npm test"
```

---

## 診断・ヘルプ系

```bash
git gtr doctor      # 依存や環境のヘルスチェック
git gtr adapter     # 使えるエディタ / AI アダプタ一覧
git gtr list        # worktree 一覧（ブランチとパスが出る）
git gtr clean       # 使われていない worktree を掃除
git gtr help        # 一覧ヘルプ
git gtr version     # バージョン表示
```

---

## 運用のコツ

* **フックに「依存インストール」「Serena の index」などを入れておく**
  → ブランチを切って worktree を作った時点で、ほぼ「開けばすぐ書ける」状態になる。

* **`gtr.worktrees.dir = .worktrees` にして、リポジトリ直下に揃える**
  → 相対パス前提のスクリプトを書きやすく、キャッシュの位置も分かりやすい。`.gitignore` に `/.worktrees/` を足すのを忘れずに。

* **使い終わった worktree は意識的に掃除する**

  ```bash
  git gtr rm <branch>            # まず gtr 側で削除
  git worktree prune             # git 純正側の孤児も掃除
  ```

  ブランチごといらなくなったら `git gtr rm <branch> --delete-branch` までやってしまうとスッキリします。

うまくハマると、新しいブランチを切った直後に `npm ci` や Serena の index が自動で走るので、lint / test までの立ち上げコストがかなり軽くなります。

