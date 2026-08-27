---
title: 'Qwen3.8-27Bを11.73GiBへ：壊れやすい経路を守る混合量子化GGUF'
description: 'Qwen3.8-27Bの拒否除去派生モデルを3.69bpwへ圧縮したGGUFについて、混合量子化、MTP、運用上の注意点を整理します。'
pubDate: 2026-08-27
tags: ['AI', 'LLM', 'Qwen', '量子化']
---

> [!NOTE]
> この記事はGPT-5.6が書き、人間がレビューしています

`qwen3.8-27b-abliterated-3.69bpw-12GB-MTP.gguf`は、Qwen3.8-27Bの拒否傾向を弱めたAEON-7版を、ローカル推論向けに圧縮したGGUFです。27Bパラメーターの重みを公称3.69bpw、約11.73GiBの単一ファイルに収め、llama.cppで動かせる形にしています。単にビット数を一律で落としたモデルではなく、壊れやすい場所へ精度を残す配分が見どころです。([モデルカード][1])

## 量子化の強さをテンソルごとに変える

土台のQwen3.8-27Bは、Gated DeltaNetと通常のAttentionを組み合わせた64層のハイブリッド構成です。今回のGGUFは、その構造を見ながら量子化方式を振り分けています。中間層のFFNには主に`IQ2_S`を使う一方、Gated DeltaNetの状態経路にある`ssm_alpha`と`ssm_beta`は`Q8_0`、通常AttentionのQ/K/Vは`Q5_K`、出力・埋め込み・MTPは`Q6_K`で保持。normや一部の状態値には`F32`も残しています。([Qwen3.8-27B][2], [モデルカード][1])

小さくしたいからといって、全層を同じ粒度で削るわけではありません。容量を大きく使うFFNは強めに圧縮し、推論の流れを支える経路には多めのビットを渡す。12GB級というサイズそのものより、この優先順位に設計の輪郭があります。なお、量子化に使った重要度行列は、英語WikiText、日本語Wikipedia、llama.cppのソースコードを混ぜた独自の校正データから作られています。Ridgeの考え方を参照していますが、公式Ridge版とは別の重みです。([モデルカード][1])

## MTPは残したまま、llama.cppで先読みする

Qwen3.8-27BはMulti-Token Prediction（MTP）を複数段で学習しています。このGGUFではMTPテンソルを落とさず、重要度行列をかけずに`Q6_K`で収録しました。llama.cppの`draft-mtp`を使うと、MTPヘッドが複数トークンを先読みし、本体がまとめて検証します。逐次生成を減らせるかどうかは、先読みがどれだけ受理されるか次第です。([Qwen3.8-27B][2], [llama.cppの解説][3])

モデルカードは`--spec-draft-n-max 3`を開始点にしています。ただし、公開されている最高約37 tokens/sは、RTX 5060 Ti 16GBとRTX 3070 8GBを併用した作者環境での値です。長く先読みすれば必ず速くなるわけではなく、コンテキスト長やKVキャッシュ、llama.cppの版、受理率で結果は変わります。まずMTPなしを基準に取り、同じプロンプトで速度と受理率を比べるのが堅実です。([モデルカード][1], [llama.cppの解説][3])

## 11.73GiBだけを見て決めない

ファイル容量と、実行時に必要なメモリは同じではありません。262,144トークンという値はGGUFに入ったコンテキスト情報であり、長い文脈ほどKVキャッシュも膨らみます。また、この配布物はテキスト用GGUFです。画像入力には互換性のある`mmproj`が別途必要になります。([モデルカード][1], [GGUFの概要][4])

もう一つ外せないのが、元のAEON-7がEarly Access Draftであることです。拒否除去によって安全層を当てにできず、非常に長い出力では反復やループが起きる場合もあると明記されています。外部公開するなら、localhostへのバインド、認証、入出力の検査、ログ、レート制限をモデルの外側に置く必要があります。軽さ、応答品質、MTPの効き方、安全策を別々に測る。そこまで含めて、このGGUFを選ぶ判断になります。([AEON-7モデルカード][5], [モデルカード][1])

## 参考

- [Qwen3.8-27B Abliterated 3.69bpw 12GB MTP GGUF][1]
- [Qwen/Qwen3.8-27B][2]
- [llama.cpp：Speculative Decoding][3]
- [Hugging Face：GGUF][4]
- [AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16][5]

[1]: https://huggingface.co/soyaakinohara/qwen3.8-27b-abliterated-3.69bpw-12GB-MTP.gguf
[2]: https://huggingface.co/Qwen/Qwen3.8-27B
[3]: https://github.com/ggml-org/llama.cpp/blob/master/docs/speculative.md
[4]: https://huggingface.co/docs/hub/gguf
[5]: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
