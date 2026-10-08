---
title: 'Suikoは「AIらしさ」を断定せず、日本語の違和感を再現可能に指す'
description: 'Rust製CLIのSuikoが、文章の自然さ、構造、読解負荷をどう分けて検査し、書き手へ判断を返すのかを追います。'
pubDate: 2026-08-30
tags: ['Suiko', 'Rust', 'Japanese NLP', 'Writing Tools']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

日本語の文章を直すとき、禁止語の一覧だけでは拾えない違和感があります。似た長さの文が続く、翻訳調の構文が重なる、段落の中身が抽象語に寄る。Suiko（推敲）は、そうした箇所を再現可能なルールで探すRust製CLIです。ただし、文章がAI生成かどうかは判定しません。機械は疑わしい場所を指し、直すか残すかは人間やエージェントが文脈を読んで決めます。([GitHub][1], [開発者ブログ][2])

## 一つの点数に潰さず、三つの入口に分ける

Suikoの主なコマンドは`lint`、`outline`、`terms`です。`lint`は禁止表現や翻訳調、定型的な対比、リズムなどを診断します。`outline`が抜き出すのは、見出し、段落の先頭文、箇条書き。`terms`では略語やカタカナ複合語、固有名詞候補と初出時の説明手掛かりを確認できます。文章表現、構造、用語を別々に眺められるため、総合スコアの上下だけを追わずに済みます。([README][3])

```sh
suiko lint draft.md --genre tech --json
suiko outline draft.md --json
suiko terms draft.md --json
```

読みづらさを調べたい場合は、`lint`に`--reading-load`を加えます。長すぎる一文、読点のない長文、二重否定、漢字の連続などは、自然さのfindingとは別枠です。「人間らしいが読みにくい文」と「読みやすいが均一な文」を混同しない切り分けになっています。

## Markdownを避けても、指摘位置はずらさない

技術記事にはコード、URL、表、引用が混ざります。Suikoはこれらを同じUTF-8バイト長の空白でマスクし、改行と位置を保ったまま本文を解析します。findingには行・列とバイト範囲を持たせられるので、同じ表現が一行に複数あっても場所を区別できます。その位置情報はGitHub Actions形式の注釈やSARIF 2.1.0にも変換可能です。Markdownを誤検出しにくくする処理と、レビュー画面で該当箇所へ戻る仕組みがつながっています。([README][3])

修正前のJSONを`--baseline`へ渡すと、結果は`resolved`、`new`、`persisting`に分類されます。CIでは`--fail-on warn`のように重大度の境界を決められ、意図して残す表現は`.suiko.toml`へ理由付きで許可できます。検出件数をゼロにすることより、新しく増えた違和感を止め、残す判断を記録する用途に向いています。

## 単一バイナリの裏側に大きな辞書がある

導入は`cargo install suiko`で、ビルドにはRust 1.97以降が必要です。SudachiDict coreをビルド時に検証して埋め込むため、完成後は実行時に辞書やモデルを取得しません。その代わり、埋め込み辞書は約207MBあり、バイナリも200MB台になります。GitHub ReleasesにはmacOS、Linux、Windows向けのビルド済みバイナリも用意されています。([README][3])

もう一つ押さえておきたいのは、Suikoが誤字脱字や組織固有の表記統一まで引き受ける道具ではないことです。既存の校正設定や用語辞書は残し、その手前で翻訳調、反復、構造、読解負荷を観測する。まず一本の記事を`lint`に通し、findingの件数ではなく「指摘を採用した理由、残した理由を説明できるか」を見るのが、このCLIらしい試し方です。

## 参考

- [nwiizo/suiko][1]
- [Rustで日本語推敲CLI/Skillの「Suiko」を作りました][2]
- [Suiko README][3]
- [Suiko Changelog][4]

[1]: https://github.com/nwiizo/suiko 'nwiizo/suiko'
[2]: https://syu-m-5151.hatenablog.com/entry/2026/08/18/224136 'Rustで日本語推敲CLI/Skillの「Suiko」を作りました'
[3]: https://github.com/nwiizo/suiko/blob/main/README.md 'Suiko README'
[4]: https://github.com/nwiizo/suiko/blob/main/CHANGELOG.md 'Suiko Changelog'
