---
title: 'minorun-marp-skill：登壇スライドの構成と見づらさを別々に直す'
description: 'Marp向けのスキル集minorun-marp-skillを読む。話の組み立てを決める指示と、PDF・SVGを実測する検査を分けた設計、その使いどころを整理する。'
pubDate: 2026-09-24
tags: ['Marp', 'Claude Code', 'Agent Skills']
---

> [!NOTE]
> この記事はGPT-6 Astraが書き、人間がレビューしています

[minorun-marp-skill](https://github.com/minorun365/minorun-marp-skill)は、Marpで登壇スライドを作るためのスキル集です。Claude Codeなどに読ませる指示に加え、黒地のテーマと検査スクリプトを収録しています。Marp CLIがMarkdownをPDFなどへ変換するのに対し、こちらが扱うのは「何をどう話すか」と「書き出した図や文字が読めるか」。生成後の直し方まで含めた構成です。

## 見た目より先に、話す順序を決める

スキルは、構成を扱う`slide-story`、図と挿絵の`slide-figures`、黒地の配色や余白を扱う`slide-design-dark`に分かれています。

`slide-story`は、まず主催者の告知からタイトルや持ち時間を確認し、話し手の過去の資料を読み、聞き手と伝えたい内容を詰める順序を指定しています。骨子と各ページの具体的な中身を決めてから、体裁に進む。カード型のテンプレートへ内容を流し込む作り方とは、出発点が違います。

ここには強い作風もあります。冒頭で要点を予告せず、問いの後に答えを少しずつ見せる。登壇資料を、口頭で補う「紙芝居」として扱うためです。単独で読んで判断する配布資料へ、そのまま適用する型ではありません。スキル自身も、話し手の実話を先に集め、その後の構成チェックや演出の提案に使うとしています。

## ソースの指定値ではなく、書き出した結果を見る

検査が見るのは、MarkdownやCSSの設定だけではありません。`check-dark-margins.py`はPDFを画像化し、黒地以外の画素から下端・右端の空きを測ります。全面画像などを除外する処理もあり、黒地テーマを前提にした検査です。

`check-figure-text.py`はPDFから文字サイズを取り出し、小さい文字や箱の縁に詰まった文字を探します。SVG内では大きく指定した文字も、スライドへ縮小して貼れば小さくなる。そのため、元の数値ではなく出力後を調べます。

ただし、この検査だけでは箱からはみ出した文字を拾えない場合があります。別の`check-svg-box-fit.mjs`がChromeでSVGを描画し、`getBBox()`による文字の寸法と矩形を比較します。役割を分けている点が実用的です。話の流れはスキルで点検し、寸法の問題はスクリプトで測る。ただし、検査が通ることと、話が伝わることは別です。

## 導入はスキル、テーマ、検査環境を分けて考える

READMEでは、Claude Code向けに`skills/`配下を`~/.claude/skills/`へコピーし、`theme/`と`tools/`は資料のリポジトリへ置く手順を案内しています。スキルを入れるだけで検査まで動くわけではありません。

検査環境にはMarp CLIとGoogle Chrome、poppler、mupdf-tools、Python 3、Pillowが挙げられています。SVG検査はMarp CLI同梱の`puppeteer-core`を利用し、配置が異なる場合は`MARP_NODE_MODULES`や`CHROME_PATH`で調整します。

見本の`examples/sample`に加え、検査が反応するかを確かめるため、意図的に崩した`examples/broken`もあります。試すなら、まずこの違いを見るのがよさそうです。なお、見本で使う「いらすとや」の画像は別途取得が必要で、利用条件もリポジトリのApache License 2.0とは別に確認します。

このスキル集で取り入れたいのは、黒地の見た目そのものより、修正を具体的な規則と測定に分ける考え方です。自分の登壇資料に合う構成ルールを選び、書き出した後の読みにくさは別に点検する。その分担から試せます。

## 参考

- [minorun-marp-skill：READMEと導入手順](https://github.com/minorun365/minorun-marp-skill)
- [slide-story：登壇スライドのストーリーの型](https://github.com/minorun365/minorun-marp-skill/blob/main/skills/slide-story/SKILL.md)
- [slide-figures：図と挿絵の規則](https://github.com/minorun365/minorun-marp-skill/blob/main/skills/slide-figures/SKILL.md)
- [検査スクリプト](https://github.com/minorun365/minorun-marp-skill/tree/main/tools)
- [Marp CLI：変換機能と実行環境](https://github.com/marp-team/marp-cli)
