---
title: 'DevinのDeep WikiとGeminiのCode Wikiをざっくり整理する'
description: 'Cognition LabsのDeep WikiとGoogle GeminiのCode Wikiを、役割と特徴、使い分けの観点からコンパクトに解説します。'
pubDate: 2025-12-01
tags: ['Devin', 'Gemini', 'DeepWiki', 'CodeWiki', 'AIドキュメント']
---

> [!NOTE]
> この記事はAIが書き、人間がレビューしています

Devin 周りで「Deep Wiki」、Google/Gemini 周りで「Code Wiki」という似た名前のサービスが立て続けに出てきました。どちらも「コードベースをまるごと理解するための AI ドキュメント」という位置づけですが、背景も得意分野も少し違います。

ここでは開発者目線で、それぞれが何をしてくれるのか、どこが違うのかをコンパクトに整理します。

---

## Deep Wiki（Cognition Labs / Devin 側）

### 何をするサービスか

Deep Wiki は、Cognition Labs（AI ソフトウェアエンジニア「Devin」のチーム）が提供する「GitHub リポジトリ用の AI ドキュメント生成サービス」です。GitHub の URL の `github.com` を `deepwiki.com` に置き換えるだけで、そのリポジトリ向けの Wiki 形式ドキュメントと Q&A チャットが自動生成されます。([Cognition][1])

Cognition の公式ブログでは「Devin Wiki / Devin Search の“無料・公開版”として DeepWiki を出した」と説明されており、すでに 5 万件以上の公開 GitHub リポジトリがインデックスされていると明言されています。([Cognition][1])
外部の技術ブログでは、30,000 超のリポジトリと 40 億行以上のコードを処理している「コードの Wikipedia」と表現されており、大規模にクローリングされていることがわかります。([DEV Community][2])

### 主な特徴

Deep Wiki がやっていることを、人間が見る側の体験に落とすとだいたい次のような感じです。

まず、対象リポジトリのコードと既存ドキュメントを解析し、アーキテクチャ概略、主要コンポーネントの説明、使い方ガイドなどを含むドキュメントをまとめて生成します。これにはクラス・モジュールの説明や、処理の流れがわかるレベルの解説が含まれます。([DEV Community][2])

生成された Wiki は「チャットできるドキュメント」という位置付けで、特定のファイルや機能について自然言語で質問すると、該当箇所へのリンク付きで解説を返してくれる Q&A 実装が入っています。([DEV Community][2])

最近のアップデートでは、リポジトリ全体を俯瞰できるコードマップ（コード構造の可視化）や、複数言語でのドキュメント生成、Q&A スレッドを Markdown と引用付きで書き出す機能なども追加されています。([cognitionai.mintlify.app][3])

料金面では、公開 GitHub リポジトリは DeepWiki サイトから無料で追加でき、プライベートリポジトリを対象にしたい場合は Devin アカウント（有償の Devin 導入）側で扱う形になっています。([Cognition][1])

### Devin との関係

Deep Wiki は、単なるスタンドアロンなサービスというより「Devin がコードを理解するための土台」として設計されています。Cognition の CEO も、Deep Wiki がコードベースの表現を構築し、Devin のタスク分解やコード編集に使われていると説明しています。([Wave AI Podcast Notes][4])

実際、Devin を使うチームでは次のような流れになります。

コードベース → Deep Wiki が構造を解析して Wiki / コードマップ化 → その知識を Devin が参照しながらチケットのスコープ決め、実装、既存コードの影響範囲調査を行う

人間にとっては「新しいプロジェクトに入るときに、一通り整ったドキュメントが最初から用意されている」感覚に近く、Devin にとっては「自分専用のコード知識グラフ」が常に用意されているイメージです。

---

## Code Wiki（Google / Gemini 側）

### 何をするサービスか

Code Wiki は、Google が Gemini を使って提供している「常に更新され続けるコード用 Wiki プラットフォーム」です。2025 年 11 月に Google Developers Blog および開発者向けニュースサイトで正式に発表されました。([Google Developers Blog][5])

コンセプトは、Google の言葉を借りると「コードリポジトリごとに、常に最新の構造化された Wiki を維持する」こと。リポジトリ全体をスキャンし、コード変更のたびにドキュメント・図・リンクを再生成することで、「いつ見てもコードとドキュメントがズレていない状態」を目指しています。([Google Developers Blog][5])

現在は `codewiki.google` からアクセスできるウェブ版が公開プレビューとして提供されており、まずは公開 GitHub リポジトリを対象に Wiki を生成・ホスト・更新する構成になっています。([Google Developers Blog][5])

### 主な特徴

Google の公式ブログや各種レポートから読み解くと、Code Wiki の特徴はだいたい次の三つに集約できます。

1. **自動 & 常に最新**
   リポジトリ全体をスキャンし、コード変更ごとに Wiki を再生成します。ドキュメントだけでなく、クラス図・シーケンス図などのアーキテクチャ図も毎回更新されるため、「図だけ古い」というありがちな状態を避けやすくなっています。([Google Developers Blog][5])

2. **Gemini ベースのコンテキストチャット**
   生成された Wiki 全体が、Gemini チャットのコンテキストとして使われます。一般的なコードアシスタントと違い、「このリポジトリに特有の設計や関数名を把握しているモデル」に質問できる点が売りです。([Google Developers Blog][5])

3. **コードと密にリンクされた UI**
   Wiki の各セクションやチャットの回答は、対応するファイル・クラス・関数へのリンクと一体化しており、説明から該当コードへ即ジャンプできるようになっています。([Google Developers Blog][5])

また、今後は Gemini CLI の拡張として、企業内のプライベートリポジトリに対してローカル・セキュアに同じ仕組みを動かせるようにする計画も公式に示されています。([Google Developers Blog][5])

Google の AI/開発者エコシステム（Gemini API、Google AI Studio、Vertex AI など）と結び付いている点も大きく、すでに Gemini ベースのワークフローを使っているチームには取り込みやすい設計と言えます。([InfoQ][6])

---

## ざっくり比較と使い分け

両者は「コードベースから AI でドキュメントを起こし、チャットで質問できるようにする」という意味ではかなり似ていますが、現時点でのスタンスには違いがあります。

Deep Wiki は **Devin というエージェントのための“コード知識レイヤー”が元になっており、その一部を無料公開に開いたもの**、という色が濃いです。Cognition 側では 2025 年初頭から Deep Wiki を Devin の中核機能として使っており、オンボーディングやチケットスコープ決め、既存コード調査の基盤になっていると説明されています。([Cognition][7])
オープンソースに関してはすでにかなりの量がインデックスされているので、「有名 OSS の内部構造を勉強したい」「Devin を導入していて、Devin からも人間からも同じ Wiki を見たい」といった用途と相性が良さそうです。([DEV Community][2])

一方 Code Wiki は、**Google が Gemini を前提に“ドキュメントを常にコードと同期させるプラットフォーム”としてゼロから設計したサービス**という印象です。コード変更ごとに Wiki や図を再生成すること、Gemini CLI 拡張で社内リポジトリにも持ち込める計画であることなど、「継続的な更新」と「Google の開発者エコシステムとの統合」を強く打ち出しています。([Google Developers Blog][5])

端的に言うなら、

* **Devin/Deep Wiki 側**

  * Devin を中心とした「AI ソフトウェアエンジニア」の文脈で活きるコード知識基盤
  * すでに大量の OSS がカバーされており、Devin を使っていない人でも「OSS の構造をサクッと把握する用途」に使いやすい

* **Gemini/Code Wiki 側**

  * 「コードを読むコスト」を減らすための汎用プラットフォームとして設計され、Gemini ベースのチャットと図付きドキュメントを常に最新に保つことにフォーカス
  * Google のクラウド/AI ツール群と連携しながら、将来的に社内リポジトリにも適用していく構想

という整理になると思います。([ScriptByAI][8])

どちらもまだ 2025 年時点で出たばかりのプロダクトなので仕様はどんどん変わるはずですが、「Devin を導入しているか」「既存の Gemini/Google エコシステムをどれくらい使っているか」が、現実的な選択の分かれ目になりそうです。公式ブログやドキュメントの更新も適宜チェックしつつ、自分たちの環境でどちらがフィットしそうか試してみるのが良さそうです。

[1]: https://cognition.ai/blog/deepwiki "Cognition | DeepWiki: AI docs for any repo"
[2]: https://dev.to/czmilo/deepwiki-ai-driven-revolution-in-code-documentation-1jb4 "DeepWiki: AI-Driven Revolution in Code Documentation - DEV Community"
[3]: https://cognitionai.mintlify.app/release-notes/overview "Release Notes - Devin Docs"
[4]: https://pod.wave.co/podcast/how-i-ai/how-devin-replaces-your-junior-engineers-with-infinite-ai-interns-that-never-sleep-scott-wu-cognitio?utm_source=chatgpt.com "How Devin replaces your junior engineers with infinite AI interns ..."
[5]: https://developers.googleblog.com/introducing-code-wiki-accelerating-your-code-understanding/ "Introducing Code Wiki: Accelerating your code understanding - Google Developers Blog"
[6]: https://www.infoq.com/news/2025/10/gemini-computer-use/?utm_source=chatgpt.com "Google DeepMind Launches Gemini 2.5 Computer Use ..."
[7]: https://cognition.ai/blog/deepwiki?utm_source=chatgpt.com "DeepWiki: AI docs for any repo"
[8]: https://www.scriptbyai.com/github-deep-wiki/?utm_source=chatgpt.com "Transforms GitHub Repos into Detailed Documentation"
