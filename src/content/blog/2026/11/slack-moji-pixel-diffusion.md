---
title: 'Slack Mojiは16×16のドット絵をどう描くのか'
description: 'Slack Mojiがブラウザーで絵文字の色を決める過程を追い、配布されているアヒルのPNGで生成時と保存時の解像度の違いを確かめます。'
pubDate: 2026-11-20
heroImage: '/assets/blog/2026/11/slack-moji-pixel-diffusion.webp'
tags: ['WebGPU', '画像生成', 'ピクセルアート']
---

> [!NOTE]
> この記事はGPT-6.2 Astraが書き、人間がレビューしています

[Slack Moji](https://huggingface.co/spaces/cfahlgren1/slack-moji)に `rubber duck` と入力すると、ブラウザーでアヒルの絵文字を4案作り、好きなものをPNGで保存できます。保存する画像は128×128ピクセルですが、くちばしや目の位置を決めるのに使うのは、縦横わずか16マスずつです。

## 256マスの色を決める

絵を描くモデルはJagrat PatelによるTessera-smallです。各マスにはRGBの値ではなく、512色のパレットの番号が一つ入ります。番号 `0` は透明です。一方、生成を始めるときには、すべてのマスに `512` という別の値が入っています。こちらは「透明に決めた」のではなく「まだ色を決めていない」という印です。

まず、CLIPのテキストエンコーダーが入力文を数値に変換します。Tesseraはその値と途中まで色の決まった絵を受け取り、各マスにどの色が入りそうかをまとめて予測します。左上から順に塗るわけではありません。候補の色を抽選し、確信度や周囲のマスとの位置関係をもとに、今回色を確定するマスを選びます。残りは次の予測に回し、16ステップで絵にします。

## GPUとCPUで異なる4案の見せ方

初回には画像生成モデルとテキストエンコーダーの重みを合わせて約115 MBダウンロードします。その後の推論は端末内で行います。Slack MojiはWebGPUが使えるかを調べるだけでなく、固定の入力を与えてGPUの計算結果をCPUで求めた参照値と比べます。値が有限でない場合や、各マスで最も高いスコアを取った色の一致率が8割を下回る場合などは、WebAssemblyでCPUを使う処理に切り替えます。

計算に使うデバイスによって、4案の並び方も変わります。WebGPUでは4案をまとめて生成しますが、CPUでは1案ずつ生成し、完成した順に表示します。CPUでも4案すべてがそろう前に、最初のアヒルの出来を確かめられます。

## アヒルのPNGで確かめる解像度

書き出し時には、生成した1マスを同じ色の8×8ピクセルとして描きます。拡大しても細部は増えません。ONNX版の[配布サンプル](https://huggingface.co/cfahlgren1/tessera-small-onnx/resolve/aff5ff7803c772dda5cd9886e503f7b98442822f/assets/sprites/rubber-duck.png)を `duck.png` として保存すれば、モデルを動かさずにこの違いを確かめられます。次の例ではPythonとPillowを使います。

```python
from PIL import Image

with Image.open('duck.png') as im:
    png = im.convert('RGBA')
small = png.resize((16, 16), Image.Resampling.NEAREST)
back = small.resize(png.size, Image.Resampling.NEAREST)
print(png.size, back.tobytes() == png.tobytes())
```

結果は `(128, 128) True` でした。途中で16×16に縮めても、色を混ぜずに拡大し直すと透明度を含む全画素が元に戻ります。これは配布画像の確認で、モデルの速度や生成品質を測った結果ではありません。4案から選ぶときも、拡大表示の大きさより、16×16に戻してもくちばしと顔を見分けられるかが判断の目安になります。

Tessera-smallのライセンスはCC BY-NC 4.0です。作者はモデルと生成画像の商用利用には別途ライセンスが必要と明記しています。製品に組み込む場合には、ブラウザーで動くかどうかとは別に、この条件を確認してください。

## 参考

- [Slack Mojiの生成とPNG書き出しの実装](https://huggingface.co/spaces/cfahlgren1/slack-moji/blob/4ca3812389e6ac4729ab62f93315fee7036762cb/src/routes/%2Bpage.svelte)
- [推論エンジンとWebGPUの動作確認](https://huggingface.co/spaces/cfahlgren1/slack-moji/blob/4ca3812389e6ac4729ab62f93315fee7036762cb/src/lib/engine.js)
- [Tessera-smallのモデルカードと利用条件](https://huggingface.co/thejagstudio/tessera-small)
- [ブラウザー向けONNX版とサンプル画像](https://huggingface.co/cfahlgren1/tessera-small-onnx)
