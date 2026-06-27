---
title: 'GitToSkill：GitHubプロフィールをAIエージェントのskillに変える'
description: 'GitHubプロフィールやOrganizationの公開リポジトリから、AIエージェント向けのCursor skillを生成するGitToSkillの仕組みと、使う前に見るべき注意点を整理します。'
pubDate: 2026-06-27
tags: ['AI', 'Agent Skills', 'GitHub']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

GitToSkillは、GitHubプロフィールを「インストール可能なCursor skill」に変換するツールです。WebページではGitHubユーザー名やプロフィールURLを貼り付けてskillを生成し、READMEではCLIから `npx gittoskill add @steipete` のように呼び出せると説明されています。([GitToSkill][1], [GitHub][2])

面白いのは、単にプロフィール文を要約するだけではないところです。GitToSkillはGitHub GraphQLでプロフィール、プロフィールREADME、注目リポジトリを取得し、さらに選んだリポジトリのREADME、`package.json`、`tsconfig.json`、`tailwind.config.ts`、ルート構成を見て、技術選択や構成の手がかりを集めます。その材料をAzure OpenAIへ渡し、開発者ごとの実装スタイルをまとめたskill guideを生成します。([README][3])

## 「この人っぽく書く」を、雰囲気ではなく参照束にする

生成されるのは、ただの文章メモではありません。CLI実行時には、返ってきた `SKILL.md` と参照ファイルを `~/.gittoskill/generated/...` 配下に書き出し、最後に依存パッケージ `skills` のCLIを `skills add <生成フォルダ>` として実行します。CLIは `--agent cursor` や `--scope project` のような通常の `skills add` フラグも後ろに流せる設計です。つまりGitToSkillは、GitHub上の公開情報を読んで「この開発者の傾向」を抽出し、それをエージェントが読み込めるskillの形に変換する薄い橋渡し役になっています。

この発想は、最近のAgent Skillsの流れと相性がいいです。GitHub CLIにもpublic previewとして `gh skill` が入り、skillを検索、インストール、管理、公開する導線が整いつつあります。GitHubのChangelogでは、Agent Skillsを「AIエージェントに特定タスクのやり方を教える、命令・スクリプト・リソースの移植可能なセット」と説明しています。GitToSkillはその配布側というより、既存のGitHubプロフィールからskillの雛形を作る生成側に寄っています。([GitHub Changelog][4])

## 個人だけでなくOrganizationも読みにいく

今回見落としたくないのは、Organization対応です。コードを見ると、まず通常の `user(login: ...)` をGraphQLで引き、ユーザーとして見つからない場合は `organization(login: ...)` に切り替える実装があります。Organizationでは説明文、Webサイト、pinned items、public non-fork repositoriesを取りにいきます。READMEについては、同名リポジトリの `HEAD:README.md` を見にいき、見つからない場合はREADMEなしのクエリへフォールバックします。`read:org` scopeが必要なケースのエラーメッセージも用意されています。([github-client.ts][5])

これが入ると、使い道が少し変わります。個人の「作風」を真似るだけでなく、GoogleのようなOrganizationのpinned itemsやスター上位のpublic non-fork repositoriesから、技術スタックやドキュメントの書き方、パッケージ構成の癖をskill化する入口になります。もちろん、公開repoだけで組織全体の開発スタイルを語れるわけではありません。それでも、エージェントに「このOrganizationの公開コードを見てから作業して」と渡すより、最初からskillとして束ねておけるのは手触りが違います。

## 便利さと危うさは同じ場所にある

GitToSkillの便利さは、生成物がそのままエージェントの指示になるところです。ここは同時に危うさでもあります。GitHub Changelogでも、skillはGitHubに検証されておらず、prompt injection、隠れた指示、悪意あるスクリプトを含み得るため、`gh skill preview` などでインストール前に内容を確認するよう注意しています。GitToSkillが生成するskillも、プロフィールやREADME、リポジトリ内容を材料にする以上、生成結果をそのまま信じるより、`SKILL.md` と参照ファイルを読んでから入れる方が安全です。

もうひとつ、スタイルの模倣には限界があります。生成時にGitToSkillが直接読むのは、公開リポジトリのREADME、`package.json`、`tsconfig.json`、`tailwind.config.ts`、ルート構成などに限られます。実際のソースコード全体、レビュー文化、非公開repo、失敗した設計判断までは見えません。だからGitToSkillは「この人や組織を完全に再現する道具」ではなく、エージェントが最初に読む観察メモを作る道具として見るのがちょうどいいです。

Agent Skillsが増えるほど、良いskillを探すだけでなく、目的に合わせて作る場面も増えます。GitToSkillは、その作る側を手早く試し始められる道具です。プロフィールを貼って終わりにせず、生成されたskillを読み、何を採用して何を捨てるかを決める。そこまで含めて使うなら、GitHubの公開コードをエージェントの作業前提へ変換する、面白い入口になります。

## 参考

- [GitToSkill][1]
- [filiksyos/gittoskill][2]
- [GitToSkill README][3]
- [Manage agent skills with GitHub CLI][4]
- [github-client.ts][5]

[1]: https://www.gittoskill.com/ 'GitToSkill'
[2]: https://github.com/filiksyos/gittoskill 'filiksyos/gittoskill'
[3]: https://github.com/filiksyos/gittoskill/blob/master/README.md 'GitToSkill README'
[4]: https://github.blog/changelog/2026-04-16-manage-agent-skills-with-github-cli/ 'Manage agent skills with GitHub CLI'
[5]: https://github.com/filiksyos/gittoskill/blob/master/lib/github-client.ts 'gittoskill/lib/github-client.ts'
