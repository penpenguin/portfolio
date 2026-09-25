---
title: 'Qwen-Image-2.1のGGUF版を読む：4.60GBの外にある必要ファイルと利用条件'
description: 'Qwen-Image-2.1のコミュニティ製GGUF配布を、モデル構成、ComfyUIでの読み込み、ライセンスから整理。重みの容量と必要メモリを分けて考えます。'
pubDate: 2026-09-25
tags: ['Qwen', '画像生成', 'GGUF', 'ComfyUI']
---

> [!NOTE]
> この記事はGPT-6 Astraが書き、人間がレビューしています

Qwen-Image-2.1をローカルで動かすなら、画像生成モデルの重みだけでなく、テキストエンコーダーとVAEも確認したい。Hugging Faceの「abenzerps/Qwen-Image-2.1-Uncensored-GGUF」は、その構成を把握しやすいコミュニティ製の配布リポジトリだ。

Qwen公式のモデルと、このGGUF配布は区別して読む必要がある。公式モデルは画像生成と編集を統合し、透過画像の生成・編集にも対応する。視覚生成部分は7Bパラメーターだが、これはシステム全体の大きさを示す数字ではない。ここでは公開資料を整理しており、GGUF版の生成品質や速度は実測していない。

## 4.60GBは必要メモリの総量ではない

配布元がサイズと品質のバランスで推奨するのは、`Q4_K_M`のGGUFファイル。モデルカード上の容量は4.60GBで、`Q8_0`は7.59GBと記載されている。

ただし、別途使うテキストエンコーダーはBF16版が17.53GB、Int8版でも9.35GB。VAEも676MBある。いずれも配布ファイルの容量であり、そのまま実行時のVRAM使用量を示すわけではない。「4.60GBのファイルだから、その容量のGPUで一式が動く」とは読めない。

配布元は、画像生成側をGPUに置き、テキストエンコーダーをCPU側へオフロードする構成や、メモリ不足時の`--lowvram`を案内している。試す際にはGPUだけでなくシステムRAMも見て、生成条件と一緒に使用量を記録したい。

## ComfyUIではローダーと関連ファイルをそろえる

モデルカードでは、GGUFを`models/diffusion_models/`、テキストエンコーダーを`models/text_encoders/`、VAEを`models/vae/`へ配置する。関連ファイルを同じリポジトリから選べるのは、組み合わせを確認するうえで助かる。

GGUFの読み込み先として案内されているのは、`leejet/ComfyUI-GGUF`の`Unet Loader (GGUF)`だ。このフォークのコミット履歴にも、Qwen-Image-2.1対応とアーキテクチャ識別子の追加がある。拡張の名前だけでなく、どのリポジトリの版を使うかまで合わせたい。

Comfy-Orgの公式Text-to-Imageテンプレートには、`UNETLoader`、`CLIPLoader`、`VAELoader`が含まれる。配布元の手順は、この`UNETLoader`をGGUF用ローダーへ置き換える形だ。`CLIPLoader`の`type`は`qwen_image`。確認時点のテンプレートではローダーがサブグラフ内にあるため、外側のモデル選択欄だけでなく内部も見る必要がある。

公式テンプレートはComfyUI本体の更新も案内している。テンプレートを読み込めたことと、必要なノードが手元の版で動くことは別に確認したい。

## 「Uncensored」と利用許諾は別の話

配布元は、安全性チェッカーやコンテンツフィルターを内蔵しないと説明している。ただし、その説明だけで重みへの変更内容や、あらゆる実行環境での挙動まで確定するわけではない。

利用条件は名称よりもライセンス本文を先に読む。配布元が掲げるのはQwen Research Licenseで、公式の条文では非商用を研究・評価目的と定義し、商用利用には別途ライセンスを求めている。重みをダウンロードできることは、自由な商用利用を意味しない。

この配布を検討するなら、まず用途が許諾範囲に収まるかを確認する。そのうえで関連ファイルと対応ローダーをそろえ、必要メモリと出力を手元で確かめる。量子化ファイルの小ささだけでは決めない、というのが選ぶときの基準になる。

## 参考

- [abenzerps/Qwen-Image-2.1-Uncensored-GGUF：モデルカードと配布ファイル](https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF)
- [Qwen/Qwen-Image-2.1：公式モデルカード](https://huggingface.co/Qwen/Qwen-Image-2.1)
- [Qwen Research License Agreement](https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE)
- [leejet/ComfyUI-GGUF](https://github.com/leejet/ComfyUI-GGUF)
- [Comfy-Org：Qwen-Image-2.1 Text-to-Imageテンプレート](https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_t2i.json)
