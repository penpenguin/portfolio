---
title: 'Suika3がNovelMLとRayを分ける理由'
description: 'ビジュアルノベルエンジンSuika3の記述言語、実行方式、クロスプラットフォーム設計を読み解きます。'
pubDate: 2026-07-27
tags: ['GameDev', 'VisualNovel', 'OpenSource']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

Suika3は、ビジュアルノベルと2Dゲームを対象にしたオープンソースのゲームエンジンです。リポジトリにはWindows、macOS、Linux、iOS、Android、WebAssemblyに加え、NEC PC-9801やIBM PC/AT向けの配布物まで並びます。ただ対応先を増やしただけではありません。シナリオを書く層と複雑な処理を書く層を分け、実行環境に応じてスクリプトの動かし方を変える設計が、その広さを支えています。

## シナリオはNovelML、拡張はRay

ゲームの入口は`start.novel`です。ここに使うNovelMLは、`[text]`や`[choose]`、`[if]`といったタグを上から順に実行する宣言的な言語です。文章表示や選択肢、分岐はシナリオの流れに沿って読める一方、一般的なプログラミング構文を直接持ち込みません。

細かなゲームロジックやエンジン拡張は、動的型付きのスクリプト言語Rayが受け持ちます。Rayで`Tag_<name>()`という関数を定義すると、NovelML側から`[<name>]`として呼び出せる仕組みです。ライターが触る時系列の記述と、開発者が扱う低レベルな処理の境界が見えやすい。用途ごとに言語を分けつつ、独自タグでつなげる構成です。

## JITとAOTを同じスクリプトの出口にする

Rayの実行方式は一つではありません。PCではJITを使い、iOSなど実行時コード生成に制約のある環境ではAOTへ切り替えます。公式のAOT手順では、`suika3-aotcomp`が`.ray`ファイルをANSI Cの`library.c`へ変換し、エンジンと一緒にコンパイルします。未知のCPUへ移植するときや、ベンダー指定のコンパイラを通す必要がある環境も見据え、機械語ではなくCを中間の出口にしているのが特徴です。

下層も、OSとハードウェアを吸収するStratoHAL、スクリプト処理系NoctLang、2DランタイムのPlayfield Engine、最上位のSuika3 VN Engineという4層に分かれています。各層は隣接する層の公開C APIだけを使う、という制約まで要求仕様に書かれています。移植時に直す場所を閉じ込めるための、かなり意識的な分割です。

## 広い対応範囲は、配布条件とセットで見る

要求仕様では、iOS、Android、HarmonyOS NEXT、Windows、macOS、LinuxをTier 1、Unity経由のゲーム機をTier 2、WebAssemblyとChromebookをTier 3に分類しています。WebAssembly版はデモやプレビュー用途で、ゲーム機の認証と申請は導入側の責任です。3D描画やLive2D、Spine、FMODなどのプロプライエタリなミドルウェアも、現行のコア範囲には含まれません。

Suika3を試すなら、まずブラウザデモかSDKのサンプルでNovelMLの書き味を見るのが早そうです。そのうえで、Rayによる独自タグ、AOT、対象プラットフォームの配布要件へ進む。対応OSの長い一覧より、この層分けが自分の制作体制に合うかを確かめたいエンジンです。

## 参考

- [Suika3 GitHubリポジトリ][1]
- [NovelML構文リファレンス][2]
- [AOTの使い方][3]
- [Suika3要求仕様書][4]

[1]: https://github.com/awemorris/suika3 'Suika3 GitHub Repository'
[2]: https://suika3.vn/ja/docs/novelml-syntax/ 'NovelML構文リファレンス'
[3]: https://suika3.vn/ja/docs/aot/ 'AOTの使い方'
[4]: https://suika3.vn/docs/srs/ 'System Requirement Specifications for Suika3'
