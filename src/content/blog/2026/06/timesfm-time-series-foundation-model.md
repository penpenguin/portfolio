---
title: 'TimesFM 2.5：時系列予測を事前学習モデルから始める'
description: 'Google ResearchのTimesFM 2.5について、オープンなチェックポイント、Python API、BigQuery MLでの使い方から、時系列予測の始め方がどう変わるのかを整理します。'
pubDate: 2026-06-30
tags: ['TimesFM', '時系列予測', 'AI', 'Google Research']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

TimesFMは、Google Researchが公開している時系列予測向けの事前学習済み基盤モデルです。論文は “A decoder-only foundation model for time-series forecasting” としてICML 2024に採択され、GitHub、Hugging Face、Google Researchブログから技術情報を追えます。オープン版についてはREADMEで「公式にサポートされるGoogle製品ではない」と断ったうえで、チェックポイントとPythonパッケージが公開されています。([GitHub][1], [arXiv][2], [Google Research Blog][3])

このモデルの見どころは、時系列ごとにモデルを一から作る前に、まず事前学習済みモデルをそのまま当てられる点です。Google Researchブログでは、TimesFMを1000億の実世界時系列ポイントで事前学習した forecasting model と説明し、未見データへのゼロショット性能を前面に出しています。小売、金融、製造、医療、自然科学のように時系列が出てくる領域では、最初のベースラインを作るだけでも地味に手間がかかります。TimesFMはそこを、LLMの「まず既存モデルを呼ぶ」に近い感覚へ寄せています。

## 2.5で、軽く長くなった

READMEで最新モデルとして示されているのはTimesFM 2.5です。2.0と比べて、パラメータ数は500Mから200Mへ減り、コンテキスト長は2048から16kへ伸びています。さらに、任意の30M分位点ヘッドを使うことで、最大1k horizonまで連続分位点予測を扱えると説明されています。頻度を表すindicatorはなくなり、いくつかのforecasting flagが追加されました。([README][4])

Hugging Faceの `google/timesfm-2.5-200m-pytorch` モデルカードを見ると、2.5のPyTorch版チェックポイントはApache-2.0ライセンスで公開されています。学習データとして、GiftEvalPretrain、Wikimedia Pageviews、Google Trendsのtop queries、合成・拡張データが挙げられています。ここは読み飛ばさない方がいいです。ゼロショットで使えるとしても、どんな系列に触れてきたモデルなのかは、結果の見方にそのまま響きます。([Hugging Face][5])

## APIは短いが、設定は雑にしない

Pythonからは `timesfm[torch]`、`timesfm[flax]`、必要なら `timesfm[xreg]` を入れる導線がREADMEにあります。基本の流れは、`TimesFM_2p5_200M_torch.from_pretrained("google/timesfm-2.5-200m-pytorch")` で読み込み、`ForecastConfig` を渡して `compile()` し、`forecast()` へ1次元のnumpy配列リストを渡す形です。返り値は点予測と分位点予測で、READMEの例では `(2, 12)` と `(2, 12, 10)` の形になっています。([README][4])

公式のAPIリファレンスには、入力系列が `max_context` より長ければ末尾側を使う、短ければpaddingする、先頭のNaNは取り除き、内部のNaNは線形補間する、といった挙動も書かれています。予測器を呼ぶコードは短くても、`max_context`、`max_horizon`、`normalize_inputs`、分位点の扱いを決めずに走らせると、あとで比較しにくくなります。外生変数を使う場合は `forecast_with_covariates()` と `timesfm[xreg]` が入口になります。([API Reference][6], [Data Preparation][7])

## BigQuery MLに入っている意味

実験だけならGitHubとHugging Faceで十分です。ただ、運用に近い場所では「モデルをどこで管理するか」が残ります。BigQuery MLのドキュメントでは、組み込みのTimesFM単変量モデルを `AI.FORECAST` から使えると説明されています。モデルを作成、学習、管理せずに予測でき、すべてのBigQuery対応リージョンで利用可能です。異常検知には `AI.DETECT_ANOMALIES`、実績値との評価には `AI.EVALUATE` も用意されています。([BigQuery Docs][8])

だからTimesFMは、ひとつのライブラリというより、時系列予測の入口を二つ持っていると見ると分かりやすいです。手元で細かく触るならオープンなチェックポイントとPython API。データがBigQueryにあり、まずSQLで試したいならBigQuery ML。どちらにしても、事前学習モデルの出力をそのまま信じるより、ARIMAなどの従来手法、自分のドメインでの検証、予測区間の振る舞いと並べて見る方が健全です。

## 参考

- [google-research/timesfm][1]
- [A decoder-only foundation model for time-series forecasting][2]
- [Google Research Blog: A decoder-only foundation model for time-series forecasting][3]
- [TimesFM README][4]
- [google/timesfm-2.5-200m-pytorch][5]
- [TimesFM API Reference][6]
- [Data Preparation for TimesFM][7]
- [The TimesFM model | BigQuery][8]

[1]: https://github.com/google-research/timesfm 'google-research/timesfm'
[2]: https://arxiv.org/abs/2310.10688 'A decoder-only foundation model for time-series forecasting'
[3]: https://research.google/blog/a-decoder-only-foundation-model-for-time-series-forecasting/ 'Google Research Blog: TimesFM'
[4]: https://github.com/google-research/timesfm/blob/master/README.md 'TimesFM README'
[5]: https://huggingface.co/google/timesfm-2.5-200m-pytorch 'google/timesfm-2.5-200m-pytorch'
[6]: https://github.com/google-research/timesfm/blob/master/timesfm-forecasting/references/api_reference.md 'TimesFM API Reference'
[7]: https://github.com/google-research/timesfm/blob/master/timesfm-forecasting/references/data_preparation.md 'Data Preparation for TimesFM'
[8]: https://docs.cloud.google.com/bigquery/docs/timesfm-model 'The TimesFM model | BigQuery'
