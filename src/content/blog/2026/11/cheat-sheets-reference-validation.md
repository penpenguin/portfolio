---
title: 'Cheat-Sheets.orgで早見表を探し、公式仕様で確かめる'
description: '技術別に早見表を集めたCheat-Sheets.orgの使い方と、保存コピーの注意点。Pythonの正規表現を例に、短い説明を実装へ使う前の確認手順を紹介します。'
pubDate: 2026-11-10
heroImage: '/assets/blog/2026/11/cheat-sheets-reference-validation.webp'
tags: ['開発ツール', 'ドキュメント', 'Python', '正規表現']
---

> [!NOTE]
> この記事はGPT-6 Astraが書き、人間がレビューしています

[Cheat-Sheets.org](https://cheat-sheets.org/)は、プログラミング言語や開発ツールなどの早見表を集めたリンク集です。Git、Docker、Pythonに加え、数学や物理の資料も同じページに並びます。文法を一から学ぶ教材というより、使ったことのある構文やコマンドを思い出したいときに向いています。

ただし、一覧に載っていることと、自分の環境でそのまま使えることは別です。資料を探すところから、記載内容を確かめるところまでを、正規表現の小さな例でたどります。

## 元ページと保存コピー

ページ上部の技術名を選ぶと、その項目へ移動します。各資料にはタイトル、形式、配布元が添えられ、リンクのアイコンは`online`、`saved`、`archived`で区別されています。

`online`は公開元のページやファイル、`saved`はサイト内の保存コピー、`archived`はInternet Archiveの履歴へのリンクです。たとえば「Regular Expressions」の項目には、Cheatographyの早見表へのリンクと、PNG・PDFの保存コピーが並んでいます。元ページを読めない場合に別の参照先を探せる構成ですが、保存コピーが公開元の最新版と一致するとは限りません。

対象バージョンにも注意が要ります。Pythonの項目には「Python 2.6 Quick Reference」も掲載されています。古い環境の調査には使えても、Python 3の仕様確認とは分けて読むべき資料です。

## 正規表現の「数字」を確かめる

「Regular Expressions」から開ける[Regular Expressions Cheat Sheet](https://cheatography.com/davechild/cheat-sheets/regular-expressions/)では、`\d`は「Digit」、`+`は「1 or more」と説明されています。これで数字の繰り返しを表す構文は思い出せますが、「数字」に全角文字を含むかは、この短い説明だけでは決まりません。表にはPCRE向けの修飾子もあり、すべてをPythonの構文表として読むことはできません。

そこで[Pythonのreドキュメント](https://docs.python.org/3/library/re.html)を確認します。Unicode文字列を扱うとき、`\d`はASCIIの`0`〜`9`だけでなく、Unicodeの十進数字にも一致します。ASCIIの数字に限定するなら、`[0-9]`という範囲指定が使えます。

次は記事用に作った確認例です。「ASCIIの数字が1文字以上ある文字列だけを受け付ける」という条件を置きます。実際の入力フォームの運用結果ではありません。Python 3の標準ライブラリだけで実行でき、`re.fullmatch`で文字列全体の一致を調べます。

```python
import re

values = ["123", "１２３", "123\n", ""]
expected = [True, False, False, False]

for pattern in (r"\d+", r"[0-9]+"):
    actual = [re.fullmatch(pattern, value) is not None for value in values]
    print(pattern, actual)
    print("ASCII-only requirement:", actual == expected)
```

Python 3.9.6で実行した出力は次のとおりです。

```text
\d+ [True, True, False, False]
ASCII-only requirement: False
[0-9]+ [True, False, False, False]
ASCII-only requirement: True
```

`\d+`では全角の`１２３`も一致するため、今回の条件を満たしません。`[0-9]+`に替えると、この入力は不一致になります。末尾に改行がある文字列は全体が一致せず、空文字列は`+`が要求する1文字以上を満たさないため、どちらのパターンでも不一致です。

この例で確認したのは、選んだ入力に対する文字種と全体一致の違いです。数値の上限、桁数、全角から半角への変換は扱っていません。全角入力を許容したいサービスなら、単に拒否するのではなく変換するかどうかを別途決める必要があります。

## 手元に残す資料の選び方

Cheat-Sheets.orgで候補を見つけたら、配布元と対象バージョンを確認し、使う構文だけ公式資料で照らす。この順序なら、早見表の短さを活かしながら、省略された条件を確認できます。入力を判定する処理では期待する入力と拒否したい入力を並べて試すと、今回のような違いが見えます。

同サイトが紹介する[Awesome Cheatsheets](https://github.com/LeCoupa/awesome-cheatsheets)のように、GitHub上で管理されている資料もあります。READMEでは履歴を追い、貢献を受け付けるために資料を一つのリポジトリへ整理したと説明されています。印刷用のPDFが欲しいのか、変更履歴を確認したいのかによって、選ぶ参照先を変えられます。

手元用の早見表には構文だけでなく「どの言語・バージョンで確認したか」と、今回なら「全角数字を受け付けるか」も書き添えると、次に使うときの判断材料が残ります。

## 参考

- [Cheat-Sheets.org](https://cheat-sheets.org/)
- [Regular Expressions Cheat Sheet](https://cheatography.com/davechild/cheat-sheets/regular-expressions/)
- [Python re — Regular expression operations](https://docs.python.org/3/library/re.html)
- [Awesome Cheatsheets README](https://github.com/LeCoupa/awesome-cheatsheets#readme)
