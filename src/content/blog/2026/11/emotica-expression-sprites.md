---
title: 'Emoticaで立ち絵の表情を描き分ける：顔の編集からSillyTavernでの切り替えまで'
description: 'EmoticaのComfyUIワークフローで、表情の指示とファイル名が別々に渡る理由をたどります。SillyTavernで既存の笑顔を残し、新しい差分を試す方法も紹介します。'
pubDate: 2026-11-25
heroImage: '/assets/blog/2026/11/emotica-expression-sprites.webp'
tags: ['Emotica', 'ComfyUI', 'SillyTavern']
---

> [!NOTE]
> この記事はGPT-6.2 Astraが書き、人間がレビューしています

チャットの返事に合わせて立ち絵を笑顔にしたい。そんなときは、返事が来るたびに絵を描き直す必要はありません。Emoticaで同じ立ち絵から喜びや怒りの画像を先に作り、SillyTavernで返事に合う画像を選ぶ方法があります。両者をつなぐのが `joy` や `anger` といった表情の名前です。

## 顔を描き直す指示と保存する名前

Emoticaには28種類の表情があり、必要なものだけを選べます。ComfyUIで顔だけを描き直す構成では、元画像と顔の検出器を `FaceDetailer` につなぎます。`Emotica Expression Prompts` から渡す `prompts` は表情ごとの指示のリストです。ComfyUIはリストの各項目について `FaceDetailer` を実行します。服や背景を描き分けたいときとは違い、別の表情でも同じ立ち姿を使うための構成です。

ここでもう一つ、プロンプトとは別に `names` という出力があります。こちらは顔を描くための入力ではありません。[公式のSDXLワークフロー](https://github.com/deepratna-awale/Emotica/blob/41b4c8ccc6c19f2a75e3309b1fa9b502e30855ca/example_workflows/Emotica%20SDXL.json)を保存し、リポジトリ直下で次のコマンドを実行すると、保存ノードに接続された入力だけを取り出せます。

```sh
jq -r '.nodes[] | select(.type == "EmoticaSaveExpressions") |
  .inputs[] | select(.link != null) | "\(.name): \(.type)"' \
  'example_workflows/Emotica SDXL.json'
```

```text
images: IMAGE
names: STRING
```

これは公開されている配線を `jq` で読んだ結果で、画像生成の実測ではありません。`images` には編集後の画像が、`names` には対応する表情名が届きます。保存ノードが両方を受け取るので、喜びの画像は連番ではなく `joy.png` になります。ワークフローを組み替えるときも、画像だけを並べ替えると名前との対応がずれます。

## 既存の笑顔を残して試す

SillyTavernのEmotica拡張を使う場合は、先に単体版のEmoticaを起動して画像生成用のWebUIに接続します。拡張はキャラクターのアバターか指定した画像を単体版に送り、できた表情から順に `Character Expressions` に登録します。すべての生成が終わるまで待たずに、一枚目から確認できます。

たとえば、手描きの `joy.png` がすでにあり、新しい笑顔と比べたいとします。`Missing` は画像のない表情だけを選ぶので、この用途には合いません。`joy` だけを選び、`Keep existing sprites` を有効にします。新しい画像は `joy-emotica.png` として元の笑顔の隣に追加されます。両方を使うには、受け取り側の `Character Expressions` でも `Allow multiple sprites per expression` を有効にします。

## 描き直す前に表示を確かめる

笑顔が出ないときは、まず `Character Expressions` の一覧で画像をクリックしてみてください。意図した絵が表示されるなら、少なくともその画像は登録されています。自動切り替えでは、分類器が返事に含まれる感情を一つ選び、SillyTavernがその感情に対応する画像を表示します。手動では笑顔になるのに会話では変わらない場合は、絵を作り直す前に分類元の設定と、選ばれた表情に画像があるかを確認できます。

## 参考

- [Emotica公式リポジトリ](https://github.com/deepratna-awale/Emotica)
- [EmoticaのComfyUIワークフロー](https://github.com/deepratna-awale/Emotica/blob/41b4c8ccc6c19f2a75e3309b1fa9b502e30855ca/docs/comfyui.md)
- [EmoticaのSillyTavern連携ガイド](https://github.com/deepratna-awale/Emotica/blob/41b4c8ccc6c19f2a75e3309b1fa9b502e30855ca/docs/sillytavern.md)
- [SillyTavernのCharacter Expressions](https://docs.sillytavern.app/extensions/expression-images/)
