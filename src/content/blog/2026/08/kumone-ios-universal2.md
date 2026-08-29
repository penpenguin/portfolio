---
title: 'Kumone 0.2.0：SwiftUI製の音楽クライアントをiPhoneとIntel Macへ'
description: 'NetEase Cloud Musicの非公式ネイティブクライアントKumoneが、共有コアと適応型UIで対応端末を広げた設計を追います。'
pubDate: 2026-08-29
tags: ['Kumone', 'SwiftUI', 'iOS', 'macOS']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

Kumoneは、NetEase Cloud MusicをApple製品で使うための非公式クライアントです。SwiftとSwiftUIで書かれ、QRコードログイン、プレイリスト、検索、同期歌詞、Personal FMなどを備えています。特徴は、別のAPIサーバーを挟まず、NetEaseの`weapi`と`eapi`に必要な暗号処理までSwiftで実装していること。まずmacOS向けに始まったアプリですが、v0.2.0でiPhone、iPad、Intel Macまで対象が広がりました。([README][1], [Release v0.2.0][2])

## macOSアプリをそのまま縮めない

iOS対応の土台になったのは、既存コードを`KumoneCore`というライブラリへ切り出す構成です。Swift Package Managerの定義では、API、モデル、再生、ストレージ、画面ロジックを含むコアをmacOSとiOSで共有し、macOS側の起動処理は別ターゲットに分けています。自動更新に使うSparkleもmacOSでだけ依存する条件付きです。([Package.swift][3])

画面は単純な移植ではありません。詳細画面や曲一覧、ナビゲーションを、iPhoneのコンパクト幅とiPad・macOSのレギュラー幅に合わせて切り替えます。iOS側には独立したアプリシェルを置き、ローカルSwift Packageから機能を読み込む形にしています。Xcodeプロジェクトは`ios/project.yml`からXcodeGenで再生成でき、UIテスト用ターゲットも定義されています。共有する範囲と、端末ごとに持つ入口がはっきりした構成です。([iOS対応PR][4], [project.yml][5])

## 配布方法はプラットフォームで違う

v0.2.0のmacOS版はUniversal 2になり、Apple Siliconに加えてIntel Macも動作対象になりました。macOS 15以降が必要で、配布物は署名・公証済み。GitHub Releasesから入れるほか、Homebrew Caskも用意されています。([README][1], [Release v0.2.0][2])

iOS・iPadOS版はiOS 16以降が対象ですが、App StoreやTestFlightから入れる方式ではありません。リリースに添付された未署名IPAを、AltStore、SideStore、Sideloadly、Xcodeなどで自分のApple IDを使って署名し、サイドロードします。通常のサイドロード環境では更新時にもIPAの入れ直しが必要です。macOS版と同じ感覚で導入できるわけではないので、ここは試す前に確認しておきたいところです。([README][1])

Kumone 0.2.0で興味深いのは、対応端末の数よりも、macOS専用だった実装を共有コアと薄いアプリシェルへ組み替えた点です。コードを共有しつつ、画面幅や更新手段まで無理に揃えない。SwiftUIアプリを複数のAppleプラットフォームへ広げるとき、どこを共通化し、どこから分けるかを読む題材になります。

## 参考

- [Kumone README][1]
- [Kumone 0.2.0][2]
- [Kumone Package.swift][3]
- [iOS support and cross-platform compatibility][4]
- [Kumone iOS project.yml][5]

[1]: https://github.com/missuo/kumone/blob/main/README.md 'Kumone README'
[2]: https://github.com/missuo/kumone/releases/tag/v0.2.0 'Kumone 0.2.0'
[3]: https://github.com/missuo/kumone/blob/main/Package.swift 'Kumone Package.swift'
[4]: https://github.com/missuo/kumone/pull/5 'iOS support and cross-platform compatibility'
[5]: https://github.com/missuo/kumone/blob/main/ios/project.yml 'Kumone iOS project.yml'
