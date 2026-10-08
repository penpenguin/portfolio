---
title: 'fireworks-tech-graphは、作図を「検証ループ」にしたAgent Skill'
description: '自然言語から技術図を作るfireworks-tech-graphについて、中間表現、経路検証、画像レビュー、出力形式を追います。'
pubDate: 2026-08-23
tags: ['Agent Skill', 'SVG', 'Technical Writing', 'Open Source']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

fireworks-tech-graphは、英語または中国語でシステムを説明すると、技術図を生成するオープンソースのAgent Skillです。CodexとClaude Codeの両方を対象にし、SVGと高解像度PNG、オフラインで開けるHTML、条件を満たす図ではGIFも出力します。単に文章を図へ置き換えるのではなく、線の交差やラベルの衝突まで検査してから成果物を渡す。その工程が、このSkillの中心です。

## 初回の図を完成品にしない

生成は、依頼内容から図の種類、ノード、階層、接続関係を取り出すところから始まります。そこからバージョン付きのDiagram IRへ落とし、スタイルと経路を決めてSVGを組み立てます。IRの段階で重複IDや存在しない接続先、不正な座標を弾くため、モデルが書いたSVGをそのまま採用する構成ではありません。

SVGの後にも検査が続きます。XMLやマーカー参照の整合性だけでなく、矢印が部品の内側を通っていないか、ラベルが線や予約領域へ重なっていないかを確認します。PNGへ書き出した後は画像を読み戻し、クリッピングや余白、視覚上の衝突を点検。問題があれば、診断した座標や経路だけを直し、既定では最大2回まで再検証します。画像を読めない実行環境では、視覚確認を済ませたふりをせず、スキップしたことを明記する決まりです。

## 見た目より先に、図の意味を固定する

収録スタイルは12種類です。ブログや資料向けのFlat Icon、Blueprint、Notion Cleanなどに加え、C4レビュー、クラウド配置、イベントストリーム、信頼性調査に特化したスタイルがあります。後者4つは配色だけのテンプレートではありません。C4なら抽象度、クラウド図ならリージョンやVPCの所有関係、イベント図ならトピックとコンシューマー、信頼性図なら観測窓やGolden Signalsといった情報を契約として検査します。足りない前提を、きれいな箱と線で覆い隠さない設計です。

矢印にも意味があります。データ、制御、メモリの読み書き、非同期イベント、変換、フィードバックを色や破線で区別し、複数の流れを使う図には凡例を置きます。経路は直交線を基本とし、接続口の分散や迂回点、避けられない交差のジャンプ表現まで扱います。見栄えを整える前に、どこからどこへ何が動くのかを固定するわけです。

## SVGの先にも出口がある

統合CLIには、環境診断、入力検証、描画、SVG検査、HTML書き出し、GIF化の入口があります。HTMLは1ファイルで完結し、パン・ズーム、明暗テーマ、SVGソースのコピー、複数形式でのダウンロードを備えます。v1.2.0で追加されたGIF経路は、12スタイルの承認済みセマンティック構成が対象です。同じスタイルなら任意の図を動かせるわけではなく、役割や順序、経路の条件を外すと失敗として止まります。

導入時は、リポジトリ直下ではなく`skills/fireworks-tech-graph`まで含めたパスを指定するのが公式の推奨です。Python 3.9以上が必要で、PNGにはCairoSVGまたは`rsvg-convert`を使います。GIFにはNode.js 18以上、FFmpeg、Chromium系ブラウザ、Puppeteerも要ります。npm版はGitHub Releasesより遅れる場合があるため、現行Skillを試すならGitHubのネストしたパスを選ぶのが安全です。

Markdown内へ素早く図を置くなら、Mermaidの短い記法で足りる場面もあります。fireworks-tech-graphが向くのは、資料や設計レビューへ載せるSVG・PNGを作り、線の経路や意味まで機械的に確かめたいときです。自然言語入力の手軽さより、その後ろに検証可能な工程を置いた点を見たいプロジェクトです。

## 参考

- [fireworks-tech-graph GitHubリポジトリ][1]
- [fireworks-tech-graph公式サイト][2]
- [Agent Skill仕様][3]
- [v1.2.0リリースノート][4]

[1]: https://github.com/yizhiyanhua-ai/fireworks-tech-graph 'fireworks-tech-graph GitHub Repository'
[2]: https://yizhiyanhua-ai.github.io/fireworks-tech-graph/ 'fireworks-tech-graph Official Site'
[3]: https://github.com/yizhiyanhua-ai/fireworks-tech-graph/blob/main/SKILL.md 'fireworks-tech-graph SKILL.md'
[4]: https://github.com/yizhiyanhua-ai/fireworks-tech-graph/releases/tag/v1.2.0 'Fireworks Tech Graph v1.2.0'
