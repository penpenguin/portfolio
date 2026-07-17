---
title: 'exo：手元のMacを束ねてローカルAIを動かす'
description: '複数のMacやワークステーションをローカル推論クラスターにするexoについて、自動検出、モデル分割、API互換性と現時点の制約を整理します。'
pubDate: 2026-07-11
tags: ['Local AI', 'Distributed Computing', 'MLX', 'macOS']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

exoは、同じネットワークにあるMacやワークステーションを束ね、ひとつのローカルAI推論クラスターとして扱うオープンソースソフトウェアです。1台には収まらないモデルを複数台のメモリへ分けて載せる、という発想が中心にあります。2025年7月のGIGAZINEの記事ではスマートフォンやRaspberry Piを含む身近な機器の活用例が紹介されましたが、現在の公式サイトとドキュメントは、まずMacを軸にした構成を前面に出しています。([GIGAZINE][1], [EXO][2])

## 台数より先に、接続状態を読む

exoを起動した端末同士は自動で見つかります。人がノード一覧を手で書くのではなく、各端末のリソースと、端末間のレイテンシーや帯域を含むトポロジーを読み取り、モデルの配置を決める設計です。推論バックエンドにはAppleのMLXを使い、モデルを層のまとまりで渡していくパイプライン並列と、計算を複数端末へ分けるテンソル並列を扱います。([GitHub][3])

ここで効くのは、単にメモリ容量を足せることだけではありません。分散推論では、端末間の通信が遅ければ待ち時間が増えます。exoはネットワークまで配置判断の材料にし、対応するMacではThunderbolt 5経由のRDMAも利用します。ただしRDMAには、対応ポートとケーブル、端末同士の接続、macOSバージョンの一致など条件があります。「余っている機器を並べれば、そのまま速くなる」と考えるより、モデルを載せる容量と通信経路を一緒に組む道具として見るほうが実態に近いです。([GitHub][3])

## クラスターの外側は普通のAPIに寄せる

各ノードは `http://localhost:52415` でダッシュボードとAPIを提供します。APIはOpenAI Chat Completions、Claude Messages、OpenAI Responses、Ollamaの形式に対応しており、既存のクライアントやOpenWebUIから接続できます。モデルの配置はダッシュボードで見つつ、利用側はよくあるAPI形式で呼ぶ。分散処理の複雑さをアプリケーションへ持ち出しにくい境界です。([GitHub][3])

## まず確認したいのは対応範囲

執筆時点のPlatform supportでTier 1に列挙されているのは、Apple Silicon搭載のMac Studio、Mac mini、MacBook Proです。Linux版はCPUで動作し、GPU対応は開発中とREADMEに明記されています。macOSアプリにもmacOS Tahoe 26.2以降という要件があります。初期の記事にある多種多様な端末の寄せ集めと、現在よく整備されている経路は分けて読んだほうが安全です。([Platform support][4], [GitHub][3])

手元に複数の対応Macがあり、1台のメモリ上限を越えるモデルをローカルで試したいなら、exoの狙いははっきりしています。逆にLinux GPUや異種端末の混成を前提にするなら、導入前にREADMEとPlatform supportを確認するところからです。Apache-2.0で公開されているので、まず小さなモデルで自動検出とAPI接続を確かめ、次に配置と通信の差を見るのが無理のない試し方でしょう。

## 参考

- [スマホやPCなど家の中の計算資源をかき集めて自分用AIクラスターを構築できる「exo」][1]
- [EXO — Run frontier AI locally.][2]
- [exo-explore/exo][3]
- [EXO Platform support][4]

[1]: https://gigazine.net/news/20250706-exo-ai-cluster/ 'スマホやPCなど家の中の計算資源をかき集めて自分用AIクラスターを構築できる「exo」'
[2]: https://exolabs.net/ 'EXO — Run frontier AI locally.'
[3]: https://github.com/exo-explore/exo 'exo-explore/exo'
[4]: https://github.com/exo-explore/exo/blob/main/PLATFORMS.md 'EXO Platform support'
