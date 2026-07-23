---
title: 'AI駆動開発で「作るAI」の次に「評価するAI」を置く'
description: 'AIが実装を速めるほど重くなるレビュー工程を、独立した評価AI、明文化した基準、改善ループで組み直す考え方を整理します。'
pubDate: 2026-07-23
tags: ['AI Agent', 'Software Testing', 'Quality Assurance', 'AWS']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

山本直弥氏と上田瀟逸氏の登壇資料「AI駆動開発時代の品質保証」は、AIにコードを書かせる話ではなく、その後ろに詰まり始めたレビューを扱っています。Faros AIの調査では、AI活用度の高いチームはタスク完了数が21%、PRのマージ数が98%増えた一方、PRレビュー時間も91%増加しました。作る速度だけを上げると、確認する人間が新しいボトルネックになる。資料はここに「評価するAI」を置き、人は合否基準と最終判断を担う構成を示します。([Speaker Deck][1], [Faros AI][2])

## 仕様どおりでも、品質保証は終わらない

KiroのSpecsは、要求と受け入れ条件を記す`requirements.md`、技術設計の`design.md`、実装計画の`tasks.md`を作り、曖昧な依頼を実装可能な単位へ落とします。AIが何を作るべきか迷いにくくなる、堅い足場です。([Kiro Docs][3])

ただし、仕様への適合と品質は同じではありません。仕様そのものが抜けているかもしれず、セキュリティや組織固有の規約、リリース時の危険まで一冊の仕様書に収まるとも限りません。そこで、実装時の文脈をそのまま引きずる作成役とは別に、セキュリティ、運用、テストといった観点ごとの評価役を置く。分業の狙いは、AIを増やすことより、見落とし方の違う確認線を引くことにあります。

## レビューを一枚岩にしない

資料では、AWS Continuumによる脅威モデリングやコードスキャン、AWS DevOps Agentによるリリース評価とテストを重ねた流れが紹介されています。DevOps Agentのリリース管理はプレビューで、変更の本番リスクやポリシー適合を調べ、変更内容に応じたテストを生成・実行する機能です。Continuumもコード脆弱性対応の一部が限定プレビューなので、現時点では人の承認を外す理由にはなりません。([AWS DevOps Agent][4], [AWS Continuum][5])

実務へ持ち込むなら、「レビューして」と丸投げするより先に、禁止事項、必要なテスト、ブロックする条件を文章にします。評価結果は指摘だけで終わらせず、どの基準に触れたか、再実行で通ったかまで残す。最後に出すか止めるかは、人が製品事情と損失の大きさを見て決める。この境界が曖昧なまま自動化すると、レビューの渋滞が、理由の読めない判定へ置き換わるだけです。

## エージェント自身にも評価と改善のループを回す

コードと違い、AIエージェントは同じ入力でも出力が揺れます。完全一致だけでは、役に立ったか、道具を正しく選んだか、目的を達成したかを測れません。Amazon Bedrock AgentCore Evaluationsは、組み込みまたは独自の評価器で実行トレースを採点します。AgentCore optimizationは、そのトレースからシステムプロンプトやツール説明の改善案を作り、A/Bテストで変更前後を比べる仕組みです。([AgentCore Evaluations][6], [AgentCore optimization][7])

ここでも出発点は評価基準です。スコアが上がっても、測っている指標が利用者の目的とずれていれば意味がない。まず一つのPR工程を選び、受け入れ条件と停止条件を決め、AIの判定と人の最終判断が食い違った例を集める。その差分を基準へ戻すところまで回せて、ようやく「評価するAI」が品質保証の一員になります。

## 参考

- [AI駆動開発時代の品質保証][1]
- [The AI Productivity Paradox Report 2025][2]
- [Specs - Kiro Docs][3]
- [About AWS DevOps Agent][4]
- [AWS Continuum][5]
- [Amazon Bedrock AgentCore Evaluations][6]
- [AgentCore optimization][7]

[1]: https://speakerdeck.com/naonana777/aiqu-dong-kai-fa-shi-dai-pin-zhi-bao-zheng 'AI駆動開発時代の品質保証'
[2]: https://www.faros.ai/blog/ai-software-engineering 'The AI Productivity Paradox Report 2025'
[3]: https://kiro.dev/docs/specs/ 'Specs - Kiro Docs'
[4]: https://docs.aws.amazon.com/devopsagent/latest/userguide/about-aws-devops-agent.html 'About AWS DevOps Agent'
[5]: https://aws.amazon.com/continuum/ 'AWS Continuum'
[6]: https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/evaluations.html 'Amazon Bedrock AgentCore Evaluations'
[7]: https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/optimization.html 'AgentCore optimization'
