---
title: 'ax：AIエージェントのWeb調査を1コマンドにまとめるCLI'
description: 'axがHTTP取得、ページ構造の探索、CSSセレクタによる抽出をどうつなぎ、出力をエージェントのコンテキストへ収めるのかを整理します。'
pubDate: 2026-07-16
tags: ['CLI', 'AI Agent', 'Web', 'Bun']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

axは、コーディングエージェントによるWeb取得とHTML解析を1つにまとめたCLIです。`curl` でページを保存し、HTMLを眺め、必要な部分だけ抜くPythonを書く。そんな一度きりの作業を、fetch、discover、extractの流れとして扱います。ローカルで動き、クラウドAPIのキーは要りません。Bunの単一バイナリとしてビルドされ、DOM解析にはlinkedomを使っています。([ax][1], [GitHub][2])

普通のスクレイピングCLIとの違いは、出力先として人間の画面だけでなく、AIエージェントのコンテキストを強く意識している点です。大量のHTMLを渡して「どこに商品一覧があるか」と考えさせるのではなく、まず構造を小さく確かめ、必要な行だけを取り出す。道具の機能よりも、エージェントが迷走しにくい手順まで含めて設計されています。

## HTMLを読む前に、構造を探す

未知のページでは `--outline` で繰り返し現れる要素を調べ、`--locate 'text'` で特定の文字列を持つセレクタを探せます。候補が見つかったら `.card` のようなCSSセレクタと `--count` で件数を確認し、最後に `--row 'title=a, href=a@href'` で複数フィールドをまとめて抽出します。HTMLのtableなら `--table`、条件で絞るなら `--where`、文章を読むなら `--md` という分担です。([README][3])

行データは既定でTSVになり、結果は50件で打ち切られます。`--budget <tokens>` を使えば、推定トークン数でも上限を置けます。ここで大事なのは、打ち切りや空フィールドを黙って隠さず、stderrへ注記することです。エージェントが「結果が少ないのは本当に該当件数が少ないからか」と再確認を重ねる場面を、CLI側の報告で減らそうとしています。

## HTTP取得と解析を、同じ入口で扱う

URLだけを渡すfetchモードでは、本文に加えてstatus、ok、処理時間、headersを含むレポートを返します。空の本文やエラーステータスでも情報を残すため、何も出ないまま次の推測へ進みにくくなります。Unixパイプへ本文だけ流したい場合は `--body` も選べます。fetchは毎回ネットワークへ取りに行きますが、セレクタを使うparseモードは探索中の再取得を避けるため、約2分キャッシュする仕様です。([README][3])

使い方をエージェントへ渡す経路も用意されています。`ax agent-context` はオフラインでエージェント向けの手引きを出力し、公式のagent skillは「構造確認から抽出まで3呼び出し以内を目安にする」といった運用まで記載しています。そのskillには、取得したページを命令ではなく信頼できないデータとして扱うことや、別オリジンへ認証情報を送らないことも明記されています。([Agent skill][4])

## 得意なページと、ブラウザへ渡すページ

axの主戦場は、HTTPで取得したHTMLに必要な内容が入っているページです。JavaScriptで描画するSPAは対象外とされ、そうしたサイトではブラウザツールへ切り替えるようREADMEに書かれています。`curl` やブラウザを置き換える万能ツールではなく、静的HTMLやAPIから構造化データを取る経路を短くする道具、と見るのが近そうです。

公式ベンチマークは、axを知っているエージェントを使った条件で、マークアップ差分のある抽出や60件のカタログ抽出、実サイトからの抽出を比較しています。ただし、実サイトの試験ではax側が負けた回もあり、単発の測定は振れが大きいと記録されています。数字だけを導入理由にせず、手元の対象ページで `--outline` から `--row` までが素直につながるかを見るのがよさそうです。([Benchmark results][5])

## 参考

- [ax][1]
- [yusukebe/ax][2]
- [README][3]
- [Agent skill][4]
- [Benchmark results][5]
- [Security Policy][6]

[1]: https://ax.yusuke.run/ 'ax — the AI-era curl'
[2]: https://github.com/yusukebe/ax 'yusukebe/ax'
[3]: https://github.com/yusukebe/ax/blob/main/README.md 'README'
[4]: https://github.com/yusukebe/ax/blob/main/skills/ax/SKILL.md 'ax Agent skill'
[5]: https://github.com/yusukebe/ax/blob/main/bench/RESULTS.md 'ax benchmark results'
[6]: https://github.com/yusukebe/ax/blob/main/SECURITY.md 'Security Policy'
