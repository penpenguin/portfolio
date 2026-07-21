---
title: 'Agents-A1はパラメータ数より「仕事の長さ」を学習する'
description: '35B MoEモデルAgents-A1について、長い作業軌跡を使う学習基盤、専門教師の統合、評価と再現時の注意点を整理します。'
pubDate: 2026-07-21
tags: ['AI Agent', 'LLM', 'MoE', 'Open Source']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

Agents-A1は、上海AI研究所のInternScienceが公開した35BのMixture-of-Experts（MoE）モデルです。土台はQwen3.5-35B-A3B。検索、機械学習エンジニアリング、科学研究、指示追従、ツール呼び出しといった、何度も判断と実行を往復する仕事へ重点を置いています。論文の主張は明快で、パラメータ数だけでなく「エージェントが動き続ける長さ」を学習時に伸ばす、というものです。([論文][1], [GitHub][2])

## 正解だけでなく、そこへ至る作業を残す

学習基盤の中心にあるのがKnowledge-Action Graph（KAG）です。証拠、ツール呼び出しやコード編集などの行動、その結果として得た観測、検証結果をつなぎ、答えへ至る過程を記録します。成功例だけでなく、失敗して修正した軌跡も保持する点が、普通の知識グラフとは違います。

この基盤から作った教師データは約10万軌跡で、平均45Kトークン。検索ならクエリ作成からページの読解、証拠の統合、回答の検証までをひとまとまりとして学ばせます。長いコンテキストを渡すだけではなく、その中で何を調べ、どこで確かめ、失敗後にどう戻るかまで訓練対象にしています。([論文][1])

## 専門家を並べたままにせず、一つのモデルへ戻す

学習は3段階です。まず複数領域の軌跡でSFTを行い、次に検索、科学、指示追従、ツール利用などの領域別教師をSFTや強化学習で育てます。最後は、学生モデルが生成した軌跡を該当領域の教師が指導するDomain-Routed On-Policy Distillationで、6領域の能力を一つのモデルへ統合します。

領域を混ぜるだけでは、長く考える仕事と短いツール対話の作法が衝突します。実際、全領域SFTの段階では一部の指示追従や一般エージェント評価が落ちました。Agents-A1は、領域ごとに教師を切り替え、頻出領域だけが学習を支配しないよう損失をならす設計で、この衝突を扱っています。([論文][1])

## 数字は強い。ただし「どこでも1T級」ではない

論文の自己評価では、ベースモデルに対してSEAL-0が41.4から56.4、FrontierScience-Researchが2.5から40.0、IFBenchが70.2から80.6へ伸びています。検索や科学研究の一部では、比較対象の大規模モデルを上回りました。その一方、MLE-Bench-LiteやSciCodeなどでは大規模モデルに届いていません。「1T級」という表現は、選ばれた長期タスクでの比較として読むのが妥当です。([論文][1])

重みはApache-2.0で公開され、SGLangとvLLMからOpenAI互換APIとして配信できます。設定上の最大コンテキストは262,144トークンで、自動ツール選択向けの起動例もあります。評価コードも公開済みですが、検索評価には外部の検索・抽出・判定APIが必要で、ツール評価の一部は大容量fixtureを含まないコード中心の公開です。まずモデルカードと評価条件を読み、同じ道具と判定器を用意できる範囲から比べるのがよさそうです。([GitHub][2], [Hugging Face][3])

論文自身も、長い仕事で目標を保つには、行動前の計画と振り返り、長文の要約、過去の判断を拾い直す力がまだ改善対象だとしています。Agents-A1を見るときは、コンテキスト長の数字より、その長さの中で「行動と検証を何周できるか」に目を向けたいところです。

## 参考

- [Scaling the Horizon, Not the Parameters: Reaching Trillion-Parameter Performance with a 35B Agent][1]
- [InternScience/Agents-A1][2]
- [InternScience/Agents-A1 - Hugging Face][3]
- [Agents-A1 - ModelScope][4]

[1]: https://arxiv.org/abs/2606.30616 'Scaling the Horizon, Not the Parameters: Reaching Trillion-Parameter Performance with a 35B Agent'
[2]: https://github.com/InternScience/Agents-A1 'InternScience/Agents-A1'
[3]: https://huggingface.co/InternScience/Agents-A1 'InternScience/Agents-A1 - Hugging Face'
[4]: https://www.modelscope.ai/models/InternScience/Agents-A1 'Agents-A1 - ModelScope'
