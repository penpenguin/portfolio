---
title: 'DenoがCloudflareへ合流。ランタイムの保守期限とcelldへの転換'
description: 'Denoランタイムは1年間の保守後に開発元による開発を終了し、Deployは6か月後に停止へ。JSRの継続と、celld・workerdを軸にしたセルフホストの方針を整理します。'
pubDate: 2026-10-15
tags: ['Deno', 'Cloudflare', 'JavaScript']
---

> [!NOTE]
> この記事はGPT-6 Astraが書き、人間がレビューしています

Denoチームは2026年10月9日、全員がCloudflareに加わると発表しました。独立したランタイムとホスティングの開発を続けるのではなく、WorkersとDurable Objectsを軸にした共通基盤へ開発の力を移します。

ただし、Denoが今日から動かなくなるわけではありません。ランタイム、Deno Deploy、JSRでは、その後の扱いが違います。利用者としては、この区別から確認したいところです。

## ランタイムは1年、Deployは6か月

Deno公式発表が示した方針は次のとおりです。期間はいずれも発表時点からのものです。

- **Denoランタイム**：さらに1年間、バグ修正とセキュリティ更新を含む月次リリースを提供。その後、Denoチームによる開発を終了します。オープンソースとしては残り、他の開発者による継続を歓迎するとしています。
- **Deno Deploy**：6か月間の運用を続けた後に停止。有料顧客にはCloudflare Workersへの移行支援を提供します。
- **JSR**：運用を継続し、インフラをCloudflareへ移します。
- **rusty_v8**：サポートを続け、workerdへの統合を目指します。

ランタイムの開発終了と、ホスティングの停止は別の話です。手元や自前のサーバーでDenoを使う場合と、Deployに本番アプリを預けている場合とでは、対応の期限も内容も変わります。また、JSRまで終了するという発表ではありません。

## 次の焦点は、状態を持つアプリのセルフホスト

Cloudflare側の発表で中心にあるのは、celldのコードや設計をworkerdへ取り込む計画です。workerdはWorkersのオープンソースランタイムですが、発表では、Durable Objectsの対応が単一インスタンスに限られ、分散運用には足りなかったと説明されています。

Durable Objectsは、名前で呼び出せる計算処理と永続ストレージを組み合わせた仕組みです。たとえばチャットの部屋ごとにオブジェクトを分ければ、接続とデータも部屋単位に分割できます。これはCloudflareの発表でも使われている例で、後からサーバー分割を考えるのではなく、最初から分散を意識した構造にする発想です。

celldは、このモデルを自分のマシンで動かすためのデーモンです。READMEによれば、各オブジェクトはSQLiteデータベースを持つ「cell」として動き、長期的な状態は利用者のオブジェクトストレージに保存されます。単にJavaScriptを実行する場所を増やすのではなく、状態の置き場所や複数マシンでの運用まで扱う。その方向に、Denoチームは次の仕事を定めたわけです。

## 移行期限と互換性は分けて確認する

この方針転換を、Denoアプリがそのままcelldへ移せるという話には読み替えられません。celldが対象にしているのはWorkersのプログラミングモデルであり、対応範囲にも差があります。

互換性ドキュメントでは、Node.js互換は部分対応、Workers AIやHyperdrive、Browser Renderingは未対応とされています。設定ファイルも`wrangler.json`と`wrangler.jsonc`を受け付け、`wrangler.toml`は対象外です。「Workers互換」という大枠だけで移行先を決めず、利用中のAPIや設定を照合する必要があります。

まずはDeploy上で動くものと、ランタイムだけを使うものを分けて棚卸しする。そのうえで、停止期限への対応と、新しい実行基盤の評価を別々に進めるのがよさそうです。celldとworkerdの統合はこれからの計画です。移行判断では、目指す姿と現在使える機能を混同しないようにしたいところです。

## 参考

- [Deno is joining Cloudflare — Deno](https://deno.com/blog/cloudflare)
- [Deno is joining Cloudflare — Cloudflare](https://blog.cloudflare.com/deno-joins-cloudflare/)
- [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [celld README](https://github.com/denoland/celld)
- [celldのCloudflare互換性](https://celld.dev/docs/cloudflare-compat)
