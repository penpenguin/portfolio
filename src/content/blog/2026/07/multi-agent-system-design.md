---
title: 'マルチエージェントは「役割」ではなく「文脈」で分ける'
description: 'Anthropicの設計指針をもとに、単一エージェントから始める理由と、並列化・文脈分離・検証役が効く条件を整理します。'
pubDate: 2026-07-13
tags: ['AI Agent', 'Claude', 'Architecture']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

Anthropicの「Building multi-agent systems: When and how to use them」は、複数のLLMを束ねれば自動的に賢くなる、という期待に冷静な線を引く記事です。まず単一エージェントをよく設計し、それで越えられない制約が見つかってから分割する。マルチエージェントは出発点ではなく、文脈の汚染、並列探索、ツールや指示の専門化に対処するための選択肢として置かれています。([Claude Blog][1])

## 追加コストを払う理由を先に決める

複数のエージェントには、プロンプトの保守、引き継ぎ、結果の要約、失敗箇所の増加がついてきます。Anthropicのテストでは、同等のタスクに使うトークンが単一エージェントの3〜10倍になる傾向があったといいます。並列実行なら必ず速いわけでもありません。探索範囲は広げやすいものの、計算量が増えるため、記事は主な利点を速度より網羅性に置いています。([Claude Blog][1])

それでも分割が効く場面はあります。大量の検索結果を別の文脈で読み、必要な要約だけを主担当へ返す。独立した観点を同時に調べる。互いに似たツールが増えすぎたとき、領域ごとに道具とシステムプロンプトを絞る。AnthropicのResearch機能も、リードエージェントが調査を分解し、サブエージェントが別々の方向を探索するorchestrator-worker構成です。検索という「大きな情報から要点を圧縮する仕事」と、独立した文脈を持つサブエージェントの相性がよい、と説明されています。([Research system][2])

## 工程ではなく、共有すべき文脈で切る

記事の中でいちばん実装に響くのは、problem-centricではなくcontext-centricに分解する、という指針です。企画、実装、テスト、レビューを別々の担当へ渡すと、同じ機能の背景を何度も説明することになります。引き継ぎのたびに判断理由が薄れ、調整のための会話が実作業を上回りかねません。

代わりに、ひとつの機能とそのテストは、必要な文脈をすでに持つ同じエージェントへ任せる。分割するのは、地域別の調査のような独立した探索、明確なAPIで隔てられたコンポーネント、内部の経緯を知らなくても判定できるブラックボックス検証です。組織図のように役職を並べるのではなく、「この担当が前の会話をどれだけ必要とするか」で境界を引くわけです。([Claude Blog][1])

## 検証役には、成果物と合格条件だけを渡す

サブエージェントの使い道として再現しやすいのが検証です。テスト、lint、スキーマ検査のような仕事なら、実装中の試行錯誤をすべて共有せず、成果物と判定基準だけを渡せます。電話ゲームのような情報劣化を避けながら、独立した確認点を置けます。

ただし「動くか確認して」では、数件だけ試して合格にする早すぎる判定が起きます。完全なテストスイートを実行する、失敗すべき入力も試す、すべて通った場合だけ合格にする、と条件を具体化する必要があります。これは単一エージェントでも変わりません。Anthropicが以前から示している原則も、単純な構成から始め、評価で改善を確かめられたときだけ複雑さを足す、というものです。([Building effective agents][3])

マルチエージェント化を検討するときは、先に「どの文脈を隔離したいのか」「本当に並列な仕事か」「専門化でツール選択が楽になるか」を書き出したほうがよさそうです。答えが曖昧なら、増やすべきなのは担当エージェントではなく、まず評価と単一エージェントの設計です。

## 参考

- [Building multi-agent systems: When and how to use them][1]
- [How we built our multi-agent research system][2]
- [Building effective agents][3]

[1]: https://claude.com/blog/building-multi-agent-systems-when-and-how-to-use-them 'Building multi-agent systems: When and how to use them'
[2]: https://www.anthropic.com/engineering/multi-agent-research-system 'How we built our multi-agent research system'
[3]: https://www.anthropic.com/engineering/building-effective-agents 'Building effective agents'
