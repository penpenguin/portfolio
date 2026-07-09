---
title: 'only-you：最上位モデルに渡す仕事だけを絞り込むAgent Skill'
description: 'yamadashy/skillsのonly-youを題材に、Agent Skillがタスク提案の基準そのものをどう固定するのかを整理します。'
pubDate: 2026-07-10
tags: ['AI Agent', 'Agent Skills', 'GitHub']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

`only-you` は、`yamadashy/skills` に含まれるAgent Skillのひとつです。目的はかなり絞られています。リポジトリを見て「最上位級のモデルにしか任せる意味がない仕事」を探し、人間がそのまま選べる番号付きの提案にする。単なるレビューでも、気づきの一覧でもありません。READMEではこのリポジトリを個人用Agent Skills集として扱い、`npx skills add yamadashy/skills` でまとめて導入する形が示されています。([yamadashy/skills][1], [only-you][2])

Agent Skills全体の文脈で見ると、これは小さなSkillです。Anthropicの説明では、Skillは`SKILL.md`を含むディレクトリで、`name`と`description`のfrontmatterを起点に、必要なときだけ本文や追加ファイルを読み込む仕組みです。`only-you` もその形式に沿っていて、ファイルは`skills/only-you/SKILL.md`だけ。スクリプトやテンプレートを抱えるタイプではなく、モデルの判断基準を短く固定するためのSkillになっています。([Anthropic Engineering][3], [Claude Platform Docs][4])

## 「すごい気づき」ではなく、任せられる仕事にする

`only-you` の中心にあるのは、提案を出す前のフィルタです。「1段下のモデル、または時間のある有能なエンジニアが、ほぼ同じ結果を出せるか」。答えがはいなら、その候補は捨てる。残すのは、リポジトリ全体にまたがる矛盾の解消、前提を正したうえでの再設計、まだ実装されていないが必要な設計対象の発見、将来の副作用を先回りする構造変更のような仕事です。([only-you][2])

ここでおもしろいのは、観察そのものを成果物にしないところです。Skill本文には、観察は材料であって、仕事につながらないものは trivia だと書かれています。AIにコードベースを読ませると「なるほど」で終わる指摘が増えがちですが、このSkillは最後を「何をするか」「なぜ今ここで必要か」「完了条件は何か」まで押し込みます。

## 低コストな探索を使い、最後の判断だけを厳しくする

手順はScout、Judge、Groundの3段階です。Scoutでは、リポジトリが小さければ全部読み、大きければ1段下のモデルに構造、慣習、履歴を調べさせます。`git log` も、作者が何に悩み、何を大事にしてきたかを見る材料として扱います。([only-you][2])

Judgeだけは委譲しません。候補を作ったあと、さらに複数の「1段下のモデル相当」のスカウトに、彼ら自身なら提案し実行できる仕事を挙げさせます。その和集合に入るもの、または明らかに彼らでも実行できるものは落とす。自分で読んでいる最中は何でも特別に見える、という失敗を前提にして、わざと強いベースラインを置いているわけです。

Groundでは、残った案にファイル、行、コミット、あるいは「この配下にXが存在しない」という具体的な不在を結びつけます。根拠を持てないタスクは ambition として切る。このあたりは、最上位モデル向けのSkillでありながら、むしろ出力を抑制するための設計に見えます。

## 人間が一語で許可できる粒度

出力は3〜5件の番号付き提案です。それぞれに、実施内容、必要性の証拠、安価な手段では足りない理由、完了条件を含めます。3件未満しか残らないなら水増ししない、と明記されているのもいい線引きです。最上位モデルを使う理由が薄い仕事まで並べると、結局は普通のタスク管理表になってしまうからです。([only-you][2])

Agent Skillは、手順を足せば足すほど強くなるとは限りません。`only-you` のNotesには、frontier models degrade when over-scripted とあり、維持するときも手順を増やしすぎないよう書かれています。モデルに何を読ませるかだけでなく、何を成果物として認めないかを決める。`only-you` は、その線引きを1枚の`SKILL.md`に閉じ込めた例として読めます。

## 参考

- [yamadashy/skills][1]
- [only-you SKILL.md][2]
- [Equipping agents for the real world with Agent Skills][3]
- [Agent Skills - Claude Platform Docs][4]
- [vercel-labs/skills][5]

[1]: https://github.com/yamadashy/skills 'yamadashy/skills'
[2]: https://github.com/yamadashy/skills/blob/main/skills/only-you/SKILL.md 'only-you SKILL.md'
[3]: https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills 'Equipping agents for the real world with Agent Skills'
[4]: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview 'Agent Skills - Claude Platform Docs'
[5]: https://github.com/vercel-labs/skills 'vercel-labs/skills'
