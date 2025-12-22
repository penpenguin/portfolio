---
title: 'git worktreeで並行開発を回す：VS Code + Peacockとstravu/crystalを比較する'
description: 'VS CodeのWorktree機能を軸に、複数ブランチを同時に扱う開発フローを整理。Peacockで事故を防ぐやり方と、stravu/crystalでAIセッションをworktreeに分離して並走させるやり方を、用途別に比較する。'
pubDate: 2025-12-22
tags: ['git', 'worktree', 'vscode', 'peacock', 'crystal']
---

> [!NOTE]
> この記事はAIが書き、人間がレビューしています

## 「ブランチ切り替え疲れ」を終わらせるのがworktree

開発していると、だいたい同じ詰まり方をします。大きめの作業に集中している最中に、別件のバグ修正やレビューが割り込む。ブランチを切り替えようとして、作業中の変更が邪魔になり、stashしたり一時コミットしたりして流れが途切れる。

`git worktree`は、この手のコンテキストスイッチを「ブランチを切り替える」のではなく「ディレクトリを切り替える」に変える機能です。worktreeは、同じリポジトリに対して、ブランチごとの作業ディレクトリを複数持てる仕組み、と理解すると扱いやすいです。VS Codeのドキュメントでも、worktreeを「別ディレクトリにある別チェックアウト」と説明しています。 ([Visual Studio Code][1])

ただし万能ではありません。Git側の制約として、同じブランチを別worktreeで同時にチェックアウトしようとすると、デフォルトでは作成が拒否されます（`--force`で上書きはできますが、基本は避けたい）。 ([Git][2])
さらに公式ドキュメントには、複数チェックアウトは実験的で、サブモジュール絡みはサポートが不完全なので推奨しない、という注意書きもあります。サブモジュールを多用しているリポジトリは、最初に小さく試したほうが安全です。 ([Git][2])

worktree運用で地味に大事なのは「片付け」です。ディレクトリを手で消すと管理情報だけが残り得ますが、`git worktree prune`で古い管理情報を掃除でき、逆にポータブルディスクなどで一時的に見えなくなるworktreeは`git worktree lock`でprune対象から外せます。 ([Git][2])

ここまでが土台。その上で、worktreeをどう“使いやすくするか”が本題です。

## VS CodeのWorktree機能：いまはエディタ側で完結できる

VS Codeは、比較的新しいアップデートでGit worktreeをUIとして扱えるようになりました。リポジトリ（またはワークスペース）を開いたときにworktreeを自動検出し、Source Controlの「Repositories」ビューから作成・削除・開く操作を提供します。必要なら `git.detectWorktrees` で無効化もできます。 ([Visual Studio Code][3])

実際の操作感はシンプルで、Source ControlのRepositoriesビューを開き、対象リポジトリのメニューから「Worktrees > Create Worktree」を選び、ブランチと配置先を指定する、という流れです。作ったworktreeは一覧に別リポジトリのようにぶら下がり、右クリックから「新しいウィンドウで開く／現在のウィンドウで開く」も選べます。 ([Visual Studio Code][1])

さらに、VS Codeのworktree連携は“見比べる”ところまで面倒を見てくれます。worktree側で編集したファイルを、メインの作業場所と差分比較でき、必要に応じて「Migrate Worktree Changes」で変更を移す導線も用意されています。 ([Visual Studio Code][1])

なお大前提として、VS CodeのGit機能はローカルに入っているGitを使います。環境側にGitが必要です。 ([Visual Studio Code][4])

ここまででも十分便利なのですが、worktree運用で本当に事故りやすいのは「どのウィンドウがどのブランチか分からなくなる問題」です。そこでPeacockが効いてきます。

## Peacock：複数ウィンドウ運用の「事故防止レイヤー」

Peacockは、VS Codeのワークスペース配色を“うっすら”変えて、複数のVS Codeウィンドウを見分けやすくする拡張です。複数インスタンスやRemote、Live Shareなどで「今どれ触ってる？」が起きやすい場面を想定しています。 ([peacockcode.dev][5])

使い方は難しくありません。Peacockのガイドでは、ワークスペースを開いた上でコマンドパレットからPeacock系コマンドを選び、お気に入り色に切り替える流れが案内されています（Peacockは“ワークスペースでのみ動く”点も明記されています）。 ([peacockcode.dev][5])
設定はワークスペース側の `.vscode/settings.json` に保存されます。つまり、色設定をリポジトリにコミットするかどうかはチームの運用次第です。個人だけで使いたいなら、誤ってコミットしないように注意しておくのが無難です。 ([peacockcode.dev][5])

VS Codeのworktree運用は、まとめるとこうです。

同じリポジトリに対して「作業ディレクトリを分ける」→ VS Codeでそれらを「ウィンドウとして開く」→ Peacockで「視覚的に誤操作を防ぐ」。この3点セットが噛み合うと、stash中心の運用に戻りづらくなります。 ([Visual Studio Code][1])

では、もう一つの候補、stravu/crystalは何が違うのか。

## stravu/crystal：AIセッションをworktreeに隔離して“並走”させる

Crystal（stravu/crystal）は、目的がかなり明確です。Claude CodeやCodexといったCLI型のAIコーディング支援を、複数セッション同時に回すときの管理を、git worktreeベースでやりやすくするデスクトップアプリです。READMEでも「各セッションは隔離されたgit worktree」と説明され、並行で作業させて、差分を見て、最後にまとめる、という流れが前提になっています。 ([GitHub][6])

Crystalが提示するワークフローは、ざっくり言うと次の思想です。

プロンプトからセッションを作り（セッションごとにworktreeを作る）、AIが編集を進める。反復ごとにコミットが積まれるので、あとから巻き戻しやすい。差分ビューアで変更を確認し、必要なら手で直す。最後にコミットをまとめ、mainにrebaseする。 ([GitHub][6])

特徴的なのは、AIの“待ち時間”を前提に、複数セッションを同時に走らせて手戻りを減らす設計になっている点です。Nimbalyst側の紹介ページでも、並行セッション、diff確認、実行（run scripts）、rebase/squashといった導線が機能として並んでいます。 ([Nimbalyst][7])

一方で、Crystalは「これ単体で完結」ではありません。前提ツールが要ります。READMEのPrerequisitesには、Claude Code（ログイン済み、もしくはAPIキー）、Codex（`@openai/codex` をnpmで入れるかHomebrewで入れる、など）、そしてGit、Gitリポジトリが挙がっています。 ([GitHub][6])
また、Claude CodeやCodexは別途インストールが必要で、Crystal自体はそれらの公式ツールではない、という免責もREADMEに明記されています。 ([GitHub][6])

導入面も押さえておきたいポイントです。CrystalはmacOS向けにDMGの配布があり、Homebrewでもインストールできます。Windowsは「サポートはあるがソースからビルドが必要」で、Visual Studio 2022の要件も書かれています。Linuxもビルドターゲットとしては用意されています。 ([GitHub][6])

## 比較：VS Code + Peacock と Crystal、選び方の勘どころ

同じworktreeを使っていても、両者は狙っている“並行”が違います。

VS Code + Peacockは、人間が同時並行で開発するための現実的な道具立てです。エディタの中でworktreeを作って開けて、必要なら差分比較や変更の移行もできる。そこにPeacockを足すと、複数ウィンドウが「作業の並行」から「事故の温床」へ落ちるのを防げます。 ([Visual Studio Code][1])

Crystalは、AIに並行作業させる前提のworktree運用です。セッションごとにworktreeを切り、AIの提案を複数走らせ、差分を見比べ、最後にsquash/rebaseでmainへ戻す。言い換えると「AIが複数人いる」状況を、Gitの構造（worktree）で破綻しないように整えるツールです。 ([GitHub][6])

迷ったら、次の感覚で選ぶと外しにくいです。

* 普段の開発で、ホットフィックスやレビュー対応を“同時に抱えがち”なら、まずVS Codeのworktreeサポートを使う。ウィンドウが増えて混乱しそうならPeacockを足す。 ([Visual Studio Code][1])
* 「同じ課題に対してAIに複数案を出させたい」「待ち時間を減らして並列に前へ進めたい」なら、Crystalがハマる。前提としてClaude Code/Codexの導入と運用が必要。 ([GitHub][6])
* Crystalを使う場合でも、成果物を深く読む・細かく直す作業はVS Codeでやりたくなることが多いので、両方を併用する設計にも無理がありません（worktreeという共通言語があるので、行き来がしやすい）。 ([GitHub][6])

## どちらを選んでも効く、worktree運用の小さなコツ

最後に、ツールの前に効く話を少しだけ。

まず「ブランチとディレクトリ名の対応」を雑にしないこと。Gitは `git worktree add` でcommit-ishを省略すると、パスのbasenameからブランチ名を作る挙動があり、命名が整理されていると運用が一気に楽になります。 ([Git][2])

次に「消し方」。ディレクトリを手で消すのではなく、基本は `git worktree remove` を使う。もし手で消してしまって管理情報が残ったら `git worktree prune` を使う。持ち運びディスクなどで一時的に見えなくなるworktreeは `git worktree lock` を検討する。ここを押さえるだけで、worktreeが“増えっぱなし”になりにくいです。 ([Git][2])

そして、サブモジュールが絡むプロジェクトは慎重に。公式ドキュメントが注意している通り、複数チェックアウトとサブモジュールの組み合わせは落とし穴になり得ます。まずは小さな範囲で試し、チームに広げるなら手順を短くドキュメント化しておくのが現実的です。 ([Git][2])

worktreeは、覚えるコマンドが増えるというより、「ブランチ運用の設計」を少しだけ変える機能です。VS Code + Peacockはその設計を普段使いに落とし込み、CrystalはそれをAI並列実行へ拡張する。どちらも、ハマる場面では確実に開発の摩擦を減らしてくれます。

[1]: https://code.visualstudio.com/docs/sourcecontrol/branches-worktrees?utm_source=chatgpt.com "Git Branches and Worktrees in VS Code"
[2]: https://git-scm.com/docs/git-worktree "Git - git-worktree Documentation"
[3]: https://code.visualstudio.com/updates/v1_103?utm_source=chatgpt.com "July 2025 (version 1.103) - Visual Studio Code"
[4]: https://code.visualstudio.com/docs/sourcecontrol/overview?utm_source=chatgpt.com "Source Control in VS Code"
[5]: https://www.peacockcode.dev/guide/ "Guide | Peacock"
[6]: https://github.com/stravu/crystal "GitHub - stravu/crystal: Run multiple Codex and Claude Code AI sessions in parallel git worktrees. Test, compare approaches & manage AI-assisted development workflows in one desktop app."
[7]: https://nimbalyst.com/crystal "Crystal for Claude Code"
