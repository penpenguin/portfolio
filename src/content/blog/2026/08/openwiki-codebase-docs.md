---
title: 'OpenWikiでコードベースの知識を「検索結果」から「育てるWiki」へ'
description: 'OpenWikiがコードをLinked Markdownへ整理し、コーディングエージェント向けの文脈を更新し続ける仕組みと、導入時の注意点を追います。'
pubDate: 2026-08-11
tags: ['OpenWiki', 'LLM Wiki', 'Coding Agent', 'Documentation']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

コードベースについてコーディングエージェントへ尋ねるたび、同じファイル探索から始まる。検索型の仕組みでは自然な動きですが、何度も参照するアーキテクチャや主要フローまで毎回組み立て直すのは少し惜しいところです。Qiitaの記事「コードベースのナレッジ化なら、LLM Wikiで十分かもしれない」は、質問時ではなくデータの取り込み時に知識をページへまとめる「LLM Wiki」という見方を紹介しています。([Qiita][1])

その具体例が、LangChainのOSSであるOpenWikiです。リポジトリをエージェントが読み、相互リンクを持つMarkdownを`openwiki/`へ生成します。検索インデックスの裏側に閉じず、成果物をコードと一緒に読めて、差分レビューやバージョン管理にも載せられる。この素朴さがOpenWikiの芯です。([OpenWiki][2], [LangChain Blog][3])

## 指示ファイルを長大な百科事典にしない

初期化はCLIを入れて、対象リポジトリでコマンドを実行します。

```sh
npm install -g openwiki
openwiki --init
```

初回はモデルプロバイダーやモデルを選び、Wikiの方針を`openwiki/INSTRUCTIONS.md`へ保存します。生成後は`AGENTS.md`と`CLAUDE.md`に、Wikiを参照するためのOpenWiki管理ブロックが入ります。指示ファイルへすべての設計知識を詰め込むのではなく、入口だけを置き、必要なページをリンクからたどらせる構造です。OpenWikiが通常の更新で書き換えるのは自身の管理ブロックに限られ、既存の指示は残ります。([README][4])

## 更新をドキュメント作業ではなく差分処理にする

コードが変わったあとは`openwiki --update`でWikiを更新できます。公式リポジトリには、Gitの履歴を取得して更新を走らせ、変更があればドキュメントのPRを作るGitHub Actionsの例もあります。生成物をそのまま正解にするのではなく、コード変更と同じように差分を人が確認できる形です。ローカルでは`openwiki visualize`を使い、Markdownとページ間リンクをノードグラフで眺められます。([Update workflow][5], [CLI usage][6])

この方式でも、元のコードを読まなくてよくなるわけではありません。Wikiが古ければ判断もずれますし、選ぶプロバイダーによっては初期生成や更新にモデル利用料がかかります。まず小さなリポジトリで、生成された設計説明と実装が合っているか、更新PRの粒度がレビューに耐えるかを見るのが堅実です。

## 読ませない範囲は先に線を引く

`.openwikiignore`には、秘密情報、生成物、解析対象にしたくないパスをgitignore風の規則で書けます。指定したパスは探索と読み取りから外れます。ただし、許可されたREADMEやテスト、コミット履歴から除外領域の存在を推測される余地までは消えません。機密情報を置いたまま「ignoreしたから安全」とは考えず、モデルへ渡してよいリポジトリかを先に決める必要があります。([README][4])

OpenWikiが面白いのは、回答を速くする検索技術というより、エージェントが次の作業で再利用できる文書を残す点です。試すなら生成枚数よりも、次の改修で探索が短くなったか、コード変更にWikiが追随したかを見る。その二つが、育てる価値のあるWikiかどうかを分けます。

## 参考

- [コードベースのナレッジ化なら、LLM Wikiで十分かもしれない][1]
- [langchain-ai/openwiki][2]
- [Introducing OpenWiki, an open source agent for repo documentation][3]
- [OpenWiki README][4]
- [OpenWiki Update workflow][5]
- [OpenWiki CLI usage][6]

[1]: https://qiita.com/Syoitu/items/ff38655fed51a2920910 'コードベースのナレッジ化なら、LLM Wikiで十分かもしれない'
[2]: https://github.com/langchain-ai/openwiki 'langchain-ai/openwiki'
[3]: https://www.langchain.com/blog/introducing-openwiki-an-open-source-agent-for-repo-documentation 'Introducing OpenWiki, an open source agent for repo documentation'
[4]: https://github.com/langchain-ai/openwiki/blob/main/README.md 'OpenWiki README'
[5]: https://github.com/langchain-ai/openwiki/blob/main/examples/openwiki-update.yml 'OpenWiki Update workflow'
[6]: https://github.com/langchain-ai/openwiki/blob/main/openwiki/cli/usage.md 'OpenWiki CLI usage'
