---
title: '技術記事を「書く」と「確かめる」に分けるAgent Skills'
description: 'azukiazusa1/skillsのwritingコレクションから、根拠と検証を残しながら技術記事を組み立てる設計を読み解きます。'
pubDate: 2026-08-18
tags: ['AI Agent', 'Agent Skills', 'Technical Writing']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

`azukiazusa1/skills` は、日本語の技術記事を書く工程を Agent Skills としてまとめたリポジトリです。収録されている writing コレクションは、執筆を担う `write-blog-article`、文章を点検する `article-review`、技術的な裏付けを調べる `tech-review`、検証済みのブラウザ向けサンプルを CodePen へ渡す `codepen-share` の 4 つ。ひとつの巨大な指示書ではなく、目的ごとに独立して導入できる構成です。([azukiazusa1/skills][1])

## 結論より先に、根拠の置き場所を決める

中心となる `write-blog-article` は、依頼の整理から調査、検証、構成の合意、執筆、レビューまでを 8 段階に分けています。特徴的なのは、文章を書き始める前が長いことです。読者や記事の型を決めたあと、質問を一度にひとつずつ投げかけ、主張と根拠、アウトライン、検証方法について合意を取ってから本文へ進みます。([write-blog-article][2])

調査では、仕様、公式ドキュメント、リポジトリ、リリースノートなどの一次資料を優先します。見つけた情報をそのまま並べるのではなく、記事で述べる主張ごとに、出力、エラー、型チェック、アクセシビリティ上の挙動といった観察可能な証拠を対応させる方針です。実行できる主張は `examples/<slug>/` の最小構成で確かめ、環境や手順、成功条件、観察結果を記録する。検証できなければ、済んだようには書かず、未検証であることを残します。([Research and validation][3])

これは「もっと詳しく書く」ためのルールというより、事実、実行結果、推論、書き手の意見が混ざるのを防ぐ仕切りです。新しい API の紹介、実装チュートリアル、比較調査、経験や意見の記事という 4 つの型も用意されており、記事の目的に合わせて必要な検証の形を変えられます。([Article types][7])

## 編集と技術検証を同じレビューにしない

レビュー用 Skill が 2 つに分かれている点もわかりやすい設計です。`article-review` が見るのは、タイトル、対象読者、見出しの流れ、コードや図の前後にある説明、文体や表記の一貫性です。技術的な正しさは検証したふりをせず、確認が必要な箇所を `tech-review` へ渡します。([article-review][4])

`tech-review` は反対に、一次資料との照合、現在の API の挙動、コードの再現性、セキュリティや互換性などを扱います。どちらも初期状態では原稿を直接書き換えず、指摘を `P0` から `P3` の優先度で整理し、場所、影響、根拠、直し方を示します。文章として読みにくい問題と、公開すると誤解を生む技術的な問題を別々に拾えるわけです。([tech-review][5])

Agent Skills の仕様では、最初に名前と説明を読み、必要になった段階で `SKILL.md`、さらに参照資料やスクリプトを読み込む段階的な構成が想定されています。writing コレクションも、記事の型、調査、文体、チェックリストを参照ファイルへ分離しています。([Agent Skills specification][6])

技術記事の品質を一回のプロンプトで引き上げようとすると、調査と推敲の境目が曖昧になりがちです。このコレクションは、書く前の合意、主張に対応する証拠、役割を分けたレビューを手順として固定します。試すなら、まず `write-blog-article` と `tech-review` を組み合わせ、原稿に残った未検証の主張が減るかを見るのがよさそうです。

## 参考

- [azukiazusa1/skills][1]
- [write-blog-article][2]
- [Research and validation][3]
- [Article types][7]
- [article-review][4]
- [tech-review][5]
- [Agent Skills specification][6]

[1]: https://github.com/azukiazusa1/skills
[2]: https://github.com/azukiazusa1/skills/blob/main/skills/writing/write-blog-article/SKILL.md
[3]: https://github.com/azukiazusa1/skills/blob/main/skills/writing/write-blog-article/references/research-and-validation.md
[4]: https://github.com/azukiazusa1/skills/blob/main/skills/writing/article-review/SKILL.md
[5]: https://github.com/azukiazusa1/skills/blob/main/skills/writing/tech-review/SKILL.md
[6]: https://agentskills.io/specification
[7]: https://github.com/azukiazusa1/skills/blob/main/skills/writing/write-blog-article/references/article-types.md
