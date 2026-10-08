---
title: 'Blender Geometry NodesをAIに頼むなら、完成形より生成ルールを決める'
description: '森や道路を作るGeometry Nodesの作例から、AIへの指示に含めたい公開パラメータと変更テストを整理します。Points・Instances・Fieldsの役割も公式資料で確認します。'
pubDate: 2026-09-12
tags: ['Blender', 'Geometry Nodes', '生成AI']
---

> [!NOTE]
> この記事はGPT-6 Astraが書き、人間がレビューしています

BlenderのGeometry Nodesは、形を直接編集する代わりに、形状の生成や配置の手順をノードで組み立てる仕組みです。参考記事「GPT-6 Astra で Blender Geometry Nodes を試す」では、森、道路、ビルなどを作る指示例が紹介されています。読みどころは、見栄えのよい完成形だけでなく、あとから条件を変えて作り直せる生成器を求めている点です。

この記事では、その指示の組み立て方をBlender公式資料と照らして整理します。モデルの性能比較や、こちらでBlenderを動かした実測ではありません。

## 森を作る前に、どこを変えたいか決める

参考記事の森の例は、地面に木を配置するだけでは終わりません。木の密度、サイズの範囲、Random SeedをGeometry Nodes Modifierから変えられるように求めています。回転をランダムにする軸もZ軸に限定しています。

この指定には意味があります。「ランダムな森」だけでは、ばらつきの範囲も、あとから調整する方法も曖昧なままです。密度とサイズを別々の入力にすれば、何を操作する生成器なのかがはっきりします。

公式マニュアルによると、ModifierにはNode Groupの入力が並び、同じグループを複数のModifierで共有していても、それぞれ異なる値を持たせられます。公開する入力は、単なる便利機能ではなく、生成ルールを使い回すための操作面です。

## Points・Instances・Fieldsは役割が違う

木を並べる処理なら、まず配置先となる点を用意し、そこへ木のジオメトリを参照するインスタンスを置きます。公式の`Instance on Points`ノードは、入力ジオメトリの各点に参照を追加するもの。同じ形状のデータを毎回複製せずに配置する仕組みです。ノードには`Rotation`と`Scale`の入力があり、回転と大きさを指定します。

Fieldは配置物そのものではなく、要素ごとの値を計算する仕組みです。公式資料はFieldを関数として説明し、評価するジオメトリの文脈によって結果が変わるとしています。同じFieldのノード構成を別の場所へつないでも、必ず同じ値になるわけではありません。

AIへの指示でも、配置する位置、参照する形状、要素ごとに変えたい値を分けて書くと、求めている構造を伝えやすくなります。「木を増やす」と「木を大きくする」を混ぜない、ということです。

## 完成画像ではなく、変更への追従を確かめる

参考記事で持ち帰りたいのは、生成後の確認まで指示に含める書き方です。道路の例では、元のCurveを編集した際に、道路、縁石、街灯がすべて追従するかを確認します。ビルの例なら、階数を変えたときに建物本体だけでなく窓も更新されるか。森なら、密度やサイズの入力が配置結果に反映されるかが確認項目です。

これらは参考記事が求めている確認であり、この場で動作を追試した結果ではありません。また、記事本文にはBlenderの操作接続や環境構築の詳しい手順がないため、そのまま実行環境まで再現できるチュートリアルとは分けて読む必要があります。

試すなら、街全体を一度に頼むより、森のように変更箇所を絞れる題材から始めたいところです。何を作るかに加え、どの入力を触り、何が変われば合格かまで決めておく。完成時の一枚より、条件を変えたあとにも使えるかで生成器を評価するほうが、Geometry Nodesらしい使い方です。

## 参考

- [GPT-6 Astra で Blender Geometry Nodes を試す](https://note.com/npaka/n/n99672f845acb)
- [Blender Manual: Geometry Nodes Modifier](https://docs.blender.org/manual/en/latest/modeling/modifiers/geometry_nodes.html)
- [Blender Manual: Instance on Points Node](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/instances/instance_on_points.html)
- [Blender Manual: Fields](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/fields.html)
- [Blenderソースコード: Instance on Points](https://github.com/blender/blender/blob/8e93a2468fd0fbab4714665032a3926cef0990c8/source/blender/nodes/geometry/nodes/node_geo_instance_on_points.cc)
