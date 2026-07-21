---
title: 'ThinkingCap Qwen3.6-27B NVFP4：短い推論と4bit量子化を重ねる'
description: 'ThinkingCap、abliteration、NVFP4量子化を重ねたQwen3.6-27B派生モデルについて、設計の狙いと導入前に見るべき制約を整理します。'
pubDate: 2026-07-18
tags: ['AI', 'LLM', 'Qwen', 'Quantization']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

Huihui-ThinkingCap-Qwen3.6-27B-abliterated-NVFP4は、Qwen3.6-27Bの派生モデルをNVFP4で量子化したチェックポイントです。名前は長いものの、手が入った場所を順に読むと分かりやすい。推論トークンを減らすThinkingCap、拒否傾向を弱めるabliteration、重みと活性値を4bitにするNVFP4という三段構成です。([Hugging Face][1])

## まず「考える長さ」を縮める

土台のQwen3.6-27Bは、27Bパラメーターの言語モデルにVision Encoderを組み合わせたモデルです。64層のうちGated DeltaNetとGated Attentionを混在させ、ネイティブのコンテキスト長は262,144トークン。Multi-Token Prediction（MTP）も学習されています。([Qwen3.6-27B][2])

ThinkingCapは、この土台を短い推論へ寄せたファインチューニングです。公開元の評価では、12種類の学習分布外ベンチマークで思考トークンが平均45.8%減り、正解率のマクロ平均は81.5%から80.7%へ変化しました。5シードで測った自己報告値であり、「品質を落とさず半減」と一括りにするより、課題ごとの振れを含む結果として読むべきでしょう。([ThinkingCap][3])

## 4bit化しても、全部は削らない

今回のチェックポイントは、主なLinear層の重みと活性値をNVFP4のW4A4、グループサイズ16で量子化しています。ディスク上の容量は、モデルカード記載でBF16の約55.6GBから20.6GBへ縮小。一方、Vision Tower、DeltaNetの`conv1d`、`lm_head`、MTPヘッドはBF16のまま残しています。単純に全層を4bitへ落とすのではなく、量子化対象を選んだ構成です。([Hugging Face][1])

MTPヘッドを残したため、vLLMでは投機的デコードも利用できます。モデルカードはvLLM 0.21以降を指定し、`qwen3_5_mtp`で3トークンを先読みする例を掲載しています。推論モデルなので生成上限は4,096トークン以上、できれば8,192以上が推奨されています。短い上限では`<think>`の途中で予算を使い切り、回答本文が空になるためです。([Hugging Face][1])

## 軽量化と安全性は別の軸

このモデルには、ThinkingCapの後段でhuihui-aiによるabliterationが入っています。公開元自身が「粗い概念実証」と位置づけ、安全フィルタリングが大きく弱まっていること、公開環境や高い安全性が必要な用途には向かないことを警告しています。量子化による容量削減と、拒否傾向を変える処理は別物です。20.6GBという扱いやすさだけで採用を決めず、出力監視や用途ごとの評価まで含めて考える必要があります。([Huihui版][4])

試す際は、まず同じThinkingCapの未改変版と比較し、推論長、回答品質、拒否挙動を分けて測るのがよさそうです。このチェックポイントの面白さは三つの変更を重ねた点にありますが、どの変更が効いたのかも、同じ三層にほどいて見るべきです。

## 参考

- [sakamakismile/Huihui-ThinkingCap-Qwen3.6-27B-abliterated-NVFP4][1]
- [Qwen/Qwen3.6-27B][2]
- [bottlecapai/ThinkingCap-Qwen3.6-27B][3]
- [huihui-ai/Huihui-ThinkingCap-Qwen3.6-27B-abliterated][4]

[1]: https://huggingface.co/sakamakismile/Huihui-ThinkingCap-Qwen3.6-27B-abliterated-NVFP4 'sakamakismile/Huihui-ThinkingCap-Qwen3.6-27B-abliterated-NVFP4'
[2]: https://huggingface.co/Qwen/Qwen3.6-27B 'Qwen/Qwen3.6-27B'
[3]: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.6-27B 'bottlecapai/ThinkingCap-Qwen3.6-27B'
[4]: https://huggingface.co/huihui-ai/Huihui-ThinkingCap-Qwen3.6-27B-abliterated 'huihui-ai/Huihui-ThinkingCap-Qwen3.6-27B-abliterated'
