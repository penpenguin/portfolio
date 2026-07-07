---
title: 'Taste Skill：AIエージェントにフロントエンドの癖を読ませる'
description: 'Taste Skillについて、SKILL.mdとしての導入方法、v2 experimentalの設計、3つのダイヤルとpre-flight checkを整理します。'
pubDate: 2026-07-07
tags: ['AI Agent', 'Frontend', 'Design', 'Open Source']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

Taste Skillは、AIコーディングエージェント向けのオープンソースなSKILL.md群です。公式サイトでは「The Anti-Slop Frontend Framework for AI Agents」と説明され、Cursor、Claude Code、Codex、Gemini CLI、v0、Lovable、OpenCodeなど、SKILL.mdを扱えるエージェントで使う前提になっています。狙いは、中央寄せの見出し、3カラムのカード、グラデーションボタンのような、AIが出しがちな同じ顔のUIから抜けることです。([Taste Skill][1], [llms.txt][2])

導入は `npx skills add https://github.com/Leonxlnx/taste-skill`、単体で入れるなら `--skill "design-taste-frontend"` を指定します。READMEは、SKILL.mdをプロジェクトへコピーしたり、ChatGPTやCodexの会話へ貼ったりする使い方にも触れています。フレームワーク専用のUIライブラリではなく、エージェントが読む設計ルール集として置かれているのが出発点です。([README][3])

## v2は「作り始める前」を厚くしている

現在のデフォルト `design-taste-frontend` はv2 experimentalです。CHANGELOGでは、v1からの大きな書き直しとして、brief inference、design system map、dark mode protocol、redesign protocol、block library、final pre-flight checkが追加されたと説明されています。まだstableではなく、v2.0.0へ向けて反復中という位置づけです。v1の挙動に固定したい場合は `design-taste-frontend-v1` を選べます。([Changelog][4])

面白いのは、いきなりコンポーネントを書かせないところです。v2のSKILL.mdは、ページ種別、雰囲気、参照URL、対象読者、ブランド資産、アクセシビリティや規制産業のような静かな制約を先に読むよう求めます。そのうえで、ページの読みを一行で宣言し、DESIGN_VARIANCE、MOTION_INTENSITY、VISUAL_DENSITYの3つの値を決める。デザインの好みを「いい感じ」で流さず、生成前の前提に落としているわけです。([SKILL.md][5])

## 「公式システム」と「見た目の流行」を分ける

Taste Skillのdesign system mapは、Material、Fluent、Carbon、Polaris、Atlassian、Primer、GOV.UK、USWDS、Bootstrap、Radix、shadcn、Tailwindなどを、briefに応じて選ぶ表を持っています。ここで大事なのは、公式パッケージがあるものは公式を使い、glassmorphism、bento、brutalism、editorial、dark tech、auroraのような美的方向は「公式システム」と偽らないこと。Apple Liquid Glassについても、Web実装は近似だと明示するルールになっています。([SKILL.md][5])

これはかなり実務寄りです。AIにUIを任せると、名前だけ借りた「それっぽいMaterial」や、都合よく混ぜたデザインシステムが出やすい。Taste Skillは、どの土台を使うのか、どこから先は雰囲気の実装なのかを分けて、後でレビューしやすくしています。

## ban listは美意識というより出荷前チェック

v2では、em dash、番号付きeyebrow、heroのversion label、装飾的なphoto credit、scroll cue、装飾status dot、divで作ったfake product UIなど、AIっぽく見えやすいパターンの禁止が並びます。さらに、1ページ内のアクセント色や角丸体系を揃える、CTAのコントラストを見る、hero headlineを2行以内に収める、desktop navigationを80px以下にする、といった細かい制約もあります。([Docs][6], [Changelog][4])

全部を鵜呑みにする道具ではありません。SKILL.md自体も、対象をlanding pages、portfolios、redesignsに絞り、dashboards、data tables、multi-step product UIなどは範囲外だと書いています。だから、管理画面や複雑な業務UIの正解をそのまま出すものではない。けれど、AIエージェントに「まず読め、同じ癖へ逃げるな、出す前に点検しろ」と渡すファイルとしては、かなり具体的です。

まず試すなら、既存プロジェクトへ入れるより、小さなランディングページかポートフォリオの1画面で使うのが安全そうです。出力の良し悪しだけでなく、エージェントがどんなdesign readを置き、どの禁止項目に引っかかるかを見る。そこまで含めて、Taste Skillの使いどころが見えてきます。

## 参考

- [Taste Skill][1]
- [Taste Skill llms.txt][2]
- [Leonxlnx/taste-skill README][3]
- [Taste Skill Changelog][4]
- [design-taste-frontend SKILL.md][5]
- [Taste Skill Documentation][6]

[1]: https://www.tasteskill.dev/ 'Taste Skill'
[2]: https://www.tasteskill.dev/llms.txt 'Taste Skill llms.txt'
[3]: https://github.com/Leonxlnx/taste-skill/blob/main/README.md 'Leonxlnx/taste-skill README'
[4]: https://github.com/Leonxlnx/taste-skill/blob/main/CHANGELOG.md 'Taste Skill Changelog'
[5]: https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/SKILL.md 'design-taste-frontend SKILL.md'
[6]: https://www.tasteskill.dev/docs 'Taste Skill Documentation'
