---
title: 'Crafting Appsを試す前に知りたい、PhotoCraftのPSD互換と自動化'
description: 'Rust製のオープンソース制作ツール群Crafting Apps。PhotoCraftの公式資料から、PSDの保存と描画の違い、CLI・MCPの設計、乗り換え前に確認したい制約を整理します。'
pubDate: 2026-10-13
tags: ['Open Source', 'Rust', 'PhotoCraft', 'MCP']
---

> [!NOTE]
> この記事はGPT-6 Astraが書き、人間がレビューしています

Crafting Appsは、ArtCraftチームがRustで開発する、無料のオープンソース制作ツール群です。画像編集のPhotoCraft、ベクター編集のVectorCraft、動画編集のFilmCraftなどを、使い慣れた画面や操作に寄せて作っています。Adobe製品そのものが公開されたわけではなく、独立した実装です。

コリスの紹介記事では7種類でしたが、2026年10月13日に確認した公式一覧には、文書作成や表計算なども加わっています。ただ、用途が広いことと、仕事で置き換えられることは別の話。ここではPhotoCraftに絞り、公式READMEと互換性評価資料を読みます。実機での使用レビューではありません。

## PSDを保存できる、の中身を分ける

PhotoCraftはレイヤー、マスク、調整レイヤー、文字、スマートオブジェクトなどを備え、PSDとPSBを読み書きします。macOS、Windows、Linuxのネイティブ版に加え、WebAssembly版も用意されています。

注意したいのは、PSDの「往復保存」が何を保つのかです。READMEは、文書として開いて再保存すると、画像リソースやレイヤー情報、合成画像を書き直すため、元ファイルとバイト単位では一致しないと明記しています。未対応の情報は、未解釈のデータとして持ち越す設計です。

一方、文書モデルを通さず、独立した`photocraft-psd`クレートで解析・書き出しするテストには、バイト単位の一致という別の基準があります。この結果を、そのまま編集アプリ全体の完全互換と読むのは早い。

さらに、自分で保存したファイルを再び同じ見た目で開けることと、Photoshopの描画に一致することも異なります。確認するなら、手元のPSDのコピーを開き、文字や効果を編集して別名保存し、元のアプリでも開き直す。プレビューだけでなく、再編集できる状態かまで見るのがよさそうです。

## GUIと自動化が同じコマンドを使う

設計面で面白いのは、UI、CLI、JSON制御チャネル、MCPサーバーが共通のコマンドを呼ぶ点です。画面上の操作とは別に自動化用の処理を作るのではなく、同じ編集エンジンに入口を複数用意しています。

READMEには、CLIで画像を開いてフィルターや調整を適用する例と、フォルダーへアクションを一括適用する例があります。MCPの資料では、`command_list`で操作を調べ、`command_run`で実行し、`doc_inspect`で文書を確認する流れが示されています。読み書きするファイルの範囲は、それぞれのルート指定で制限します。

ただし、`command_batch`はトランザクションではありません。途中で失敗しても、それ以前に成功した操作は残ります。取り消し操作も、すでにディスクへ書いたファイルまでは戻しません。自動化を試すときこそ、文書の複製と出力先の分離を先に決めておきたいところです。

## 置き換えより、作業を区切って試す

PhotoCraftのREADMEは「early alpha」とし、日常のプロ業務でPhotoshopを置き換える段階ではないと明言しています。互換性評価でも、メニューがコマンドにつながっていることと、期待どおりに動くことを分けて扱っています。

生成AI機能やプラグイン互換、文字組み、実務の細かな操作には、まだ差があるという説明です。慣れた画面が出てきても、これまでの制作環境がそのまま移るとは考えないほうが安全でしょう。

まずは納品物の原本ではなく、複製した小さな文書で、読み込みから編集、保存、別アプリでの再確認までを通してみる。Crafting Appsの魅力を判断する入口は、アプリの数よりも、自分の作業が最後まで崩れずに通るかどうかだと思います。

## 参考

- [Crafting Apps公式一覧](https://getartcraft.com/apps)
- [PhotoCraft README](https://github.com/storytold/photocraft#readme)
- [PhotoCraftのPhotoshop互換性評価](https://github.com/storytold/photocraft/blob/main/docs/target-app-parity.md)
- [PhotoCraftのMCP仕様](https://github.com/storytold/photocraft/blob/main/docs/mcp.md)
- [コリスによるCrafting Appsの紹介](https://coliss.com/articles/build-websites/operation/work/7-adobe-apps-open-sourced.html)
