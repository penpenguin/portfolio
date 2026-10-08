---
title: 'Diagram Designは、図の装飾より先に「何を残すか」を決める'
description: 'HTMLとSVGで図を作るAgent Skill、Diagram Design。Mermaidの再描画、情報量の調整、ラベル配置の検証から、その設計と使いどころを整理します。'
pubDate: 2026-09-15
tags: ['Agent Skills', 'SVG', 'Diagram Design']
---

> [!NOTE]
> この記事はGPT-6 Astraが書き、人間がレビューしています

[Diagram Design](https://github.com/cathrynlavery/diagram-design)は、Claude CodeやCodex、Piなどのエージェントに図の作り方を教えるスキルです。出力は、SVGとCSSを埋め込んだ単体のHTML。構成図やシーケンス図などを、ブラウザーで開いて確認する形です。通常は静止画として作り、動きが説明に必要な場合にだけアニメーションを選びます。

面白いのは、見栄えのよいテンプレートだけを配っているわけではないこと。図の種類を選ぶ前に、伝えたい関係と残す情報を整理する手順が組み込まれています。

## 色を足すより、要素を減らす

スキルの設計方針は、不要な要素を削ることに重心があります。各ノードには別々の意味を持たせ、配置だけで関係が伝わるなら線を消す。アクセント色も、最初に見てほしい少数の要素へ絞ります。単純な比較なら、無理に図にせず表を選ぶよう求めています。

扱う対象の振る舞いと、図のレイアウトを分けている点も特徴です。たとえば、キューの容量やボトルネックを伝えたいなら、先にその意味を表すパターンを選び、配置にはデータフロー図を使う。新しい概念が出るたびに図の種類を増やすのではなく、既存の型に必要な意味を載せる設計です。

色と書体はスタイルガイドに集約され、Webサイトから配色やフォントを取り込む手順もあります。ただし、ブランドに合わせたことと、情報が読み取れることは別です。どのノードを主役にするかは、配色の前に決める必要があります。

## Mermaidの変換ではなく、意味を拾って描き直す

Mermaidの取り込みでは、元のレンダラーが決めた配置やテーマを引き継ぎません。ソースから要素と関係を抽出し、用途に合わせて描き直します。形式、サイズ、詳細度、読者層を別々に指定するため、出力先に合わせて文字の大きさや残す情報量も変わります。

READMEには、Claude Codeでスライド向けに簡略化する例が載っています。

```text
/diagram-design:import-mermaid architecture.mmd --size=slide-16x9 --detail=simplified
```

ここで注意したいのは、あらゆるMermaid構文を取り込めるわけではないことです。取り込み仕様が対応対象として挙げるのは、`flowchart`／`graph`、`sequenceDiagram`、`stateDiagram-v2`、`erDiagram`。未対応の種類は、似た図に置き換えて続行せず停止する方針です。

簡略化した図には、統合・折り畳み・削除した内容を記録する「fidelity ledger」が付きます。きれいになった図だけでなく、何が省かれたかもレビュー対象にできる。この記録は、技術的な意味を削りすぎていないか確かめる助けになります。

## 見た目のルールにも、検証できる範囲がある

ラベル配置に関する設計記録では、色やDOM構造の検査を通っても、ラベルがノードの下に隠れる不具合を見逃した経緯が説明されています。そこで追加されたのが、矩形の座標と描画順から重なりを調べる`verify-geometry.py`です。

ただし、この検査は図形の寸法に基づく判定です。ラベルと接続線の間隔までは評価せず、その確認はチェックリストに残っています。「検査が通れば読みやすい」とまでは言えません。

試すなら、まず既存の小さなMermaid図を一枚だけ描き直すのがよさそうです。元の図と変更記録を並べ、関係が保たれているか、必要なラベルが読めるかを見る。Diagram Designを選ぶ基準は、装飾の好みよりも、その編集と確認の手順を取り入れたいかどうかにあります。

## 参考

- [Diagram Design — README](https://github.com/cathrynlavery/diagram-design/blob/ce9344c52cb9be811de187bf2a6d58c712c9c9fe/README.md)
- [図の選択とデザイン方針 — SKILL.md](https://github.com/cathrynlavery/diagram-design/blob/ce9344c52cb9be811de187bf2a6d58c712c9c9fe/skills/diagram-design/SKILL.md)
- [Mermaid取り込み仕様](https://github.com/cathrynlavery/diagram-design/blob/ce9344c52cb9be811de187bf2a6d58c712c9c9fe/skills/diagram-design/references/import-mermaid.md)
- [ADR 0005 — ラベル配置の幾何学的検証](https://github.com/cathrynlavery/diagram-design/blob/ce9344c52cb9be811de187bf2a6d58c712c9c9fe/docs/adr/0005-label-geometry-is-verified.md)
