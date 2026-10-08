---
title: 'Pixel Refinerで「ドット絵風」のAI画像を素材へ整える'
description: 'AI生成画像のぼやけた輪郭や不揃いなグリッドを補正し、背景透過、減色、書き出しまでブラウザで処理するPixel Refinerを紹介します。'
pubDate: 2026-09-01
tags: ['Pixel Art', 'Image Processing', 'Generative AI', 'Open Source']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

画像生成AIにドット絵を頼むと、縮小表示ではそれらしく見えても、拡大した途端に輪郭のにじみや色の揺れが現れます。見た目の1ドットが実際には何十ピクセルもの色の塊で、格子も揃っていない。ゲームやアイコンの素材にするには、単に画像を小さくするだけでは足りません。

[Pixel Refiner][1]は、そんな「ドット絵風」の画像をブラウザ上で整える無料のWebツールです。インストールやアカウント登録は不要。ソースコードはMITライセンスで公開され、日本語、英語、簡体字中国語のUIを備えています。([紹介記事][2], [GitHub][3])

## 起点は、見た目ではなくグリッドの復元

Pixel Refinerの中心にあるのは、元画像で「見た目の1ドット」が何ピクセルに相当するかを推定し、適切な解像度へ再サンプリングする処理です。グリッドの判定に迷う場合は候補を複数表示し、人が結果を見比べて選び直せます。単純な縮小で隣の色が混ざる問題を避けながら、1ドットと1ピクセルの対応を作り直すわけです。

既定のAutoパイプラインは入力を分類し、グリッド復元、通常画像のドット絵化、不確かな画像の原寸維持から処理経路を選びます。判定の信頼度が低いときに、極端な縮小を押し通さない設計も堅実です。用途が決まっていれば、「くっきりスプライト」「細部を保持」「透過アイコン」「色数を制限」などのプリセットから始められます。([README][4])

## 背景透過と減色を一つの流れにまとめる

グリッドを直したあとも、素材化には背景や配色の調整が残ります。Pixel Refinerは画像の外周から背景を推定し、グラデーションや軽いノイズを含む背景を透過します。自動判定が合わなければ、スポイトで背景色を指定可能です。余白のトリムや浮いたノイズの除去も同じ画面で扱えます。

色はOklab色空間とK-means法による減色に加え、ファミコン、Game Boy、PC-9801、MSX1、PICO-8などのパレットへ変換できます。Floyd–SteinbergやBayerのディザリング、スプライトの縁取りにも対応。処理後は等倍または2倍から32倍で書き出せ、複数画像はZIPへまとめられます。重い画像処理をWeb Workerへ逃がし、UIを塞がない点もWebツールとして相性がいいところです。([README][4])

## 自動変換と手修正の境界を見て使う

変換前後はスライダーで比較でき、画像処理はローカルのブラウザ内で完結すると案内されています。一方、Pixel Refinerはペイントソフトではありません。1ピクセルずつ描き直す機能は対象外で、被写体と背景が同色だったり、影が輪郭へ溶け込んでいたりする画像には限界があります。

まずAutoで処理し、グリッド候補と背景透過を確認する。仕上げに手打ちが必要なら、結果をドット絵エディタへ渡す。この分担なら、生成画像を素材へ近づける面倒な下処理だけを切り出せます。

## 参考

- [Pixel Refiner][1]
- [AI が作る「ドット絵風」を本物のドット絵に変換する Web ツール「Pixel Refiner」を作りました][2]
- [HappyOnigiri/PixelRefiner][3]
- [Pixel Refiner README（日本語）][4]
- [Pixel Refiner v1.0.0][5]

[1]: https://pixel-refiner.app/ 'Pixel Refiner'
[2]: https://zenn.dev/happy_onigiri/articles/1a0601d2afec2c 'AI が作る「ドット絵風」を本物のドット絵に変換する Web ツール「Pixel Refiner」を作りました'
[3]: https://github.com/HappyOnigiri/PixelRefiner 'HappyOnigiri/PixelRefiner'
[4]: https://github.com/HappyOnigiri/PixelRefiner/blob/main/README.ja.md 'Pixel Refiner README（日本語）'
[5]: https://github.com/HappyOnigiri/PixelRefiner/releases/tag/v1.0.0 'Pixel Refiner v1.0.0'
