---
title: 'Google Antigravityとは？Gemini 3時代の「エージェントファーストIDE」をざっくり解説'
description: 'Googleが2025年11月に公開したエージェントファーストな開発環境「Google Antigravity」の概要・特徴・始め方を、既存のAIコーディングツールとの違いも含めて整理します。'
pubDate: 2025-11-21
tags: ['google', 'antigravity', 'gemini3', 'agent', 'ide']
---

> [!NOTE]
> この記事はAIが書き、人間がレビューしています

# Google Antigravityとは？Gemini 3時代の「エージェントファーストIDE」をざっくり解説

2025年11月18日、Googleが新しい大規模モデル「Gemini 3」と同時に発表したのが、AIエージェント前提の開発環境**Google Antigravity**です。([Wikipedia][1])

ざっくり言うと、

> 「AIに細かいプロンプトを投げるIDE」ではなく、「**複数のエージェントに仕事を振って見守るミッションコントロール**」

という位置づけのツールです。

この記事では、

* Antigravityが何者なのか
* 既存のCopilot / Cursor系と何が違うのか
* どんなことができるのか
* どうやって触り始めればいいのか
* 現時点（2025/11/21時点）の注意点

あたりを、できるだけ噛み砕いてまとめます。

---

## 一言でいうと：AIエージェント前提のVS Code系IDE

まず基本情報から。

* **正式名**：Google Antigravity
* **種別**：AI支援付き IDE（統合開発環境）
* **開発元**：Google
* **公開形態**：2025-11-18 公開の *public preview*（プレビュー版）([Wikipedia][1])
* **対応OS**：Windows / macOS / Linux（デスクトップアプリとして配布）([Wikipedia][1])
* **料金**：プレビュー期間中は無料。Gemini 3 Proの利用には「かなりゆるめのレート制限付きで無料枠」があると公式が説明しています。([Google Antigravity][2])

技術的なポイントをまとめると：

* ベースは **Visual Studio Code のフォーク**（VS Code互換のUI/拡張エコシステムを持つ）([Medium][3])
* メインのモデルは **Gemini 3 Pro**。ただし**Anthropic Claude Sonnet 4.5 や OpenAI系のGPT-OSSモデルにも対応**し、IDE内で切り替えられるマルチモデル設計。([MarkTechPost][4])
* 「単なるチャットボット」ではなく、**複数エージェントがエディタ・ターミナル・ブラウザを直接操作**できる仕組みになっている ([The Verge][5])

## 背景：Gemini 3とセットで見たほうが理解しやすい

Antigravity単体で見るよりも、**Gemini 3の文脈**で見ると意図が分かりやすいです。

* Gemini 3は、Googleが「これまでで最も高性能」とうたう新世代モデルで、推論やマルチモーダル、コーディングに大きく振った構成になっています。([Android Central][6])
* Google公式ブログでも「Gemini 3を使ってアイデアを形にするための新しい開発体験」として、**Google Antigravity**が開発者向けの中核ツールとして位置づけられています。([blog.google][7])

要するに、

* **強いエージェント（Gemini 3）**
* **そのエージェントに仕事をさせるためのコックピット（Antigravity）**

をセットで出してきた、という構図です。

---

## Antigravityのアーキテクチャと主な特徴

### 1. Agent Manager：エージェント用「ミッションコントロール」

Antigravityを起動すると、最初に出てくるのはファイルツリーではなく、**Agent Manager**と呼ばれる画面です。([Google Codelabs][8])

ここが特徴的で、

* 「どのエージェントに、どんなタスクを任せているか」
* 「今どこまで進んでいるか・何をやったか」
* 「どんな成果物（Artifact）が出てきているか」
* 「人間側のレビュー待ちタスクは何か」

を一覧で管理する**ダッシュボード**になっています。

イメージとしては、開発マネージャーが Jira ボードを見ながら複数のエンジニアにタスクを振っている感じに近いです。ただし、「エンジニア」が人間ではなく**AIエージェント**になっているだけ、という見方もできます。

ポイント：

* 同時に**複数エージェントを走らせて並列作業**させられる
* 会話やタスクごとにスレッド化され、**Inbox**から過去のやりとりと成果物にすぐ戻れる([Google Codelabs][8])
* 各エージェントの状態や進捗が可視化されるため、「何が起きているのか」が追いやすい

従来の「1チャットスレッドに1アシスタント」な体験とはかなり違います。

---

### 2. Editor View：いつものIDE + エージェント

もちろん普通の**エディタ画面（Editor View）**もあります。([Google Codelabs][8])

ここはほぼVS Codeと同じ感覚で、

* ファイルツリー
* シンタックスハイライト
* 拡張機能

などがそのまま使えます。その上で、

* コードを選択して「ここを高速化して」「コメントを追加して」など**インライン指示**が出せる
* 右側のサイドパネルから、エージェントに**会話形式で指示**できる
* エージェントから提案された**diffをまとめて適用**したり、一部だけ採用したりできる

といった形で、**「vibe coding」（なんとなく書きながらAIと相談していく書き方）**を支える機能が入っています。([Google Codelabs][8])

---

### 3. Artifacts：作業ログではなく「検証可能な成果物」で信頼を担保

Antigravityで一番面白いのが、エージェントが作る**Artifacts（アーティファクト）**という概念です。([The Verge][5])

エージェントは、

* ひたすらツール呼び出しログを垂れ流すのではなく
* **人間がレビューしやすい単位の成果物**を作ることにフォーカスしています。

公式ドキュメントやチュートリアルを見ると、代表的なArtifactsはこんな感じです：([Google Codelabs][8])

* **Task List / Plan**

  * これから何をするかのタスクリスト。人間が編集・承認できる。
* **Implementation Plan**

  * どのファイルをどう変えるかの設計メモ。
* **Code Diffs**

  * 実際に変更される行を標準的な diff 形式で提示。
* **Screenshots / Browser Recordings**

  * UI変更やE2E操作の様子をキャプチャ・録画したもの。
* **Test Results**

  * 実行したテストとその成功・失敗のログ。

エージェントが「バグ修正しました」と言うだけではなく、

> 「このタスク群をこう実装して、テスト結果はこうで、UIはこう変わりました」

という**検証可能な証拠のセット**を残すような設計になっています。

---

### 4. ブラウザエージェント：ブラウザ操作もエージェントが担当

Antigravityには、**ブラウザ専用のサブエージェント**もいます。([Google Codelabs][8])

* Antigravity側からChrome拡張をセットアップすると、
* ブラウザエージェントが

  * クリック・スクロール・入力
  * DOMの読み取り
  * コンソールログの取得
  * スクリーンショットや動画の録画

  などを行えるようになります。

これにより、例えば「この管理画面にログインしてダッシュボードの数値を集計し、レポートを書いて」みたいなタスクも、**コード修正とブラウザ操作をセットで自動化**できるようになっています。([Google Codelabs][8])

---

### 5. マルチモデル対応：Gemini 3だけに縛らない設計

Antigravityのもう一つの特徴が、**複数の基盤モデルを同じUIから使える**ことです。

現時点のプレビューでは：([MarkTechPost][4])

* **Gemini 3 Pro**（Google）
* **Anthropic Claude Sonnet 4.5**
* **OpenAI系のGPT-OSSモデル**

などが選べるようになっており、Agent Managerの**Model Selection**ドロップダウンから切り替えられます。([Google Codelabs][8])

このため、

* 普段はGemini 3 Pro
* 長いコードリファクタは別モデル
* ドキュメント生成は軽量モデル

といった**タスクごとのモデル使い分け**がしやすくなっています。

---

### 6. 対応OSと料金体系（2025/11/21時点）

**対応OS**

* Windows
* macOS
* Linux（主要ディストリビューション）([Wikipedia][1])

**料金**

* 現在は**public preview中で、本体利用は無料**
* Gemini 3 Proの利用には**無料枠 + レート制限**があると公式ブログなどで説明されている([Google Antigravity][2])
* 一部のメディアでは、一般提供フェーズでは**トークンベースの従量課金モデル**になると報じています（入力トークン・出力トークンで料金テーブルが分かれる形）。([IT Pro][9])

プレビューなので、**料金体系や無料枠の条件は今後変わる前提**で見ておいたほうが安全です。

---

## Copilot / Cursorと何が違うのか

既存のAIコーディング支援（GitHub Copilot、Cursor、Windsurf など）と比べたときの**思想の違い**をざっくり整理しておきます。

### チャットファースト vs エージェントファースト

* 従来のツール

  * 基本は「1つのチャット + 1人のAIアシスタント」
  * 開発者が細かくプロンプトを書きながら進める
* Antigravity

  * 最初から**エージェントを複数立てることを前提**に設計
  * 開発者は「タスクを定義して、エージェントをオーケストレーション」する役割に寄せている([Venturebeat][10])

### ログ vs Artifacts

* 従来

  * ツール呼び出しログやチャット履歴を追いながら、「何をやったか」を推測しがち
* Antigravity

  * **Artifactsとして構造化された成果物**を重視（プラン・diff・テスト結果・録画など）([The Verge][5])

### IDEとの統合の度合い

* CursorなどもVS Codeベースで似たコンセプトを持っていますが、Antigravityは**EditorとAgent Managerを完全に別ウィンドウとして分離**しているのが特徴です。([Google Codelabs][8])
* 「個人が編集するエディタ」と「エージェントを管理するマネージャー」を明確に分けることで、**個人貢献とマネジメントのメンタルモデルに合わせたUI**になっています。

一方で、Simon Willison氏のブログなどでは「パッと見はCursorや他のVS Codeフォークとあまり変わらないように見える」という評価もあり、実際には「どこまでエージェントを信頼して任せるか」によって体験が変わりそうです。([Simon Willison’s Weblog][11])

---

## 公式チュートリアルから見えるユースケース

公式のCodelabやブログでは、Antigravityを使った具体的な例がいくつか紹介されています。([Google Codelabs][8])

代表的なものをざっと挙げると：

1. **ニュースサイトを巡回してサマリを作るボット**

   * Google Newsなどにアクセス
   * ブラウザエージェントでページを操作し、必要な情報を抽出
   * 結果をレポートとしてArtifactにまとめる

2. **1日技術カンファレンスのサイトを丸ごと生成**

   * 「Python + Flaskで1日カンファレンスの情報サイトを作って」と指示
   * タスク分解 → 実装 → テスト → ローカルサーバ起動までをエージェントが実行
   * 実装内容や操作ログをArtifactsとして残す

3. **Pomodoroタイマーなど小さなプロダクティビティWebアプリ**

   * 見た目の調整やスタイル変更も、Artifactsを通して確認しながら改良

4. **既存コードに対するユニットテスト生成 & 実行**

   * 単一ファイルのPythonコードからテストコードを生成
   * テストを実行し、結果をArtifactとして保存

いずれも共通しているのは、

* **「何をしたか」がArtifactsとして残る**
* エージェントが途中で**人間のレビューを要求してくる**
* EditorとAgent Managerを行き来しながら、**人間が最終責任者としてチェックする**

というワークフローになっていることです。

---

## 使い始め方（インストール〜最初の1タスク）

実際に触り始める手順を、ざっくり手短にまとめます。

### 1. ダウンロード & インストール

1. 公式サイト（antigravity.google）にアクセスする([Google Antigravity][12])
2. 自分のOS（Windows / macOS / Linux）向けのインストーラをダウンロード
3. インストーラを実行し、アプリをインストール

### 2. Googleアカウントでサインイン

* Antigravityを起動すると、Googleアカウントへのサインインを求められます。([Simon Willison’s Weblog][11])
* Gemini 3やその他モデルを使うために必要なので、通常はここでログインします。

### 3. Workspace または Playground を用意

* **Workspace**：ローカルのコードフォルダを指定して使うモード（VS Codeのワークスペースに近い）
* **Playground**：とりあえずエージェントに試してみたいときの「砂場」([Google Codelabs][8])

最初はPlaygroundで、

> 「このリポジトリのREADMEを読み込んで、改善提案を出して」

くらいの小さなタスクから試すと感触を掴みやすいです。

### 4. 最初のエージェントを走らせる

1. Agent Managerで「Start Conversation」を押す([Google Codelabs][8])
2. タスクを自然言語で投げる

   * 例: 「このプロジェクトのテストカバレッジを上げるための計画と、最初のテストコードを作って」
3. エージェントがタスク分解 → プラン作成 → diff提案 → テスト実行…と進んでいくので、

   * 途中で表示されるArtifactsを確認
   * 必要に応じてコメント・フィードバックを返す

### 5. ブラウザ連携も試してみる

* Web操作が必要なタスク（ニュース要約など）を投げると、

  * Antigravity側からブラウザ拡張のセットアップを促される
  * Chrome拡張を入れると、ブラウザエージェントが使えるようになる([Google Codelabs][8])

ここまで動かせると、「AIにどこまで任せるか」を感覚的に掴めるはずです。

---

## 現時点（プレビュー）の注意点・制約

まだpublic preview段階なので、それなりに**荒さ**も報告されています。

### レート制限・クォータの厳しさ

* Redditなどのユーザー報告では、「数メッセージで上限に達してしまう」「Gemini CLIと比べると制限が厳しく感じる」といった声も出ています。([reddit.com][13])
* 公式Codelabでも、Gemini 3 Proの無料クォータには注意するよう記載があります。([Google Codelabs][8])

本格的なプロジェクトに投入する前に、**どの程度のタスクをどれだけ回せるか**を小さめのプロジェクトで試しておくと安心です。

### 「VS Codeラッパー」に見える、という評価も

* 「看板は派手だが、中身はVS CodeをGoogleアカウント連携したものに近い」といった感想も開発者コミュニティから出ています。([Simon Willison’s Weblog][11])
* 一方で、Artifactsやブラウザエージェント、Agent Managerの設計など、**長時間・大規模なタスクをエージェントに任せるための仕掛け**は従来の拡張より踏み込んでいる、という評価もあります。([Venturebeat][10])

### プロダクション利用時は情報の扱いを要確認

* 企業や個人事業で使う場合は、ソースコードやログが

  * どこに保存されるのか
  * モデルの学習に使われるのか
  * 組織内ポリシーに抵触しないか

  といった点を、自社規定やGoogleの利用規約/ドキュメントと照らし合わせて確認しておく必要があります（ここはどのAI IDEでも共通の注意点です）。

---

## どんな人が試してみると良さそうか

個人的に、現時点でAntigravityを試すと面白そうなのはこのあたりの人たちです：

* **AIコーディングを既に日常的に使っている個人開発者**

  * Copilot / Cursor / Windsurfを常用していて、「次の世代」を触ってみたい人
* **チーム開発のリーダー / テックリード**

  * 「タスクをエージェントに割り振る」というメンタルモデルに興味がある人
* **ブラウザ操作込みの自動化が多い人**

  * スクレイピングや社内ツール操作など、コードとWebUI両方をいじる仕事が多い人
* **Gemini 3をメインに使いたい人**

  * Vertex AIやGoogle Cloudと組み合わせて使う構想がある人

逆に、

* まだAIコーディング自体に慣れていない
* 小さなスクリプトの補完くらいしか使わない

という場合は、まずは既存の拡張や軽量なツールで慣れてから、Antigravityのような**エージェント前提の重めのIDE**に移るほうがストレスが少ないと思います。

---

## まとめ

現時点でのAntigravityを一言でまとめると、

> 「複数のAIエージェントに仕事を振り、Artifactsで検証しながら進めるための、Gemini 3時代のミッションコントロールIDE」

といったポジションです。

* ベースはVS Code互換のIDE
* ただしUIの中心を**Agent Manager**に置き、エージェントを前提に設計
* エージェントはコードだけでなくブラウザも操作し、**Artifactsとして検証可能な成果物**を残す
* マルチモデル対応で、Gemini 3 Pro以外のモデルも選択可能
* まだプレビューでレート制限や粗さはあるが、**「アシスタント」から「エージェント」へのシフト**を体感できるツール

というのが、2025年11月時点で見える姿です。([Wikipedia][1])

今後、クォータや料金、組織向け機能などがどう変わっていくかで、実際にどこまで本番開発に載せられるかが決まってきそうです。

---

* [The Verge](https://www.theverge.com/news/822833/google-antigravity-ide-coding-agent-gemini-3-pro?utm_source=chatgpt.com)
* [IT Pro](https://www.itpro.com/technology/artificial-intelligence/google-launches-flagship-gemini-3-model-and-google-antigravity-a-new-agentic-ai-development-platform?utm_source=chatgpt.com)
* [The Times of India](https://timesofindia.indiatimes.com/technology/tech-news/google-launches-antigravity-an-ai-first-coding-platform-built-on-gemini-3/articleshow/125430280.cms?utm_source=chatgpt.com)
* [Android Central](https://www.androidcentral.com/apps-software/ai/google-gemini-3-available-now-everything-you-need-to-know?utm_source=chatgpt.com)

[1]: https://en.wikipedia.org/wiki/Google_Antigravity?utm_source=chatgpt.com "Google Antigravity"
[2]: https://antigravity.google/blog/introducing-google-antigravity?utm_source=chatgpt.com "Introducing Google Antigravity, a New Era in AI-Assisted ..."
[3]: https://medium.com/google-cloud/tutorial-getting-started-with-google-antigravity-b5cc74c103c2?utm_source=chatgpt.com "Tutorial : Getting Started with Google Antigravity"
[4]: https://www.marktechpost.com/2025/11/19/google-antigravity-makes-the-ide-a-control-plane-for-agentic-coding/?utm_source=chatgpt.com "Google Antigravity Makes the IDE a Control Plane for ..."
[5]: https://www.theverge.com/news/822833/google-antigravity-ide-coding-agent-gemini-3-pro?utm_source=chatgpt.com "Google Antigravity is an 'agent-first' coding tool built for Gemini 3"
[6]: https://www.androidcentral.com/apps-software/ai/google-gemini-3-available-now-everything-you-need-to-know?utm_source=chatgpt.com "Gemini 3 is Google's most intelligent AI model and it's available now - here's everything you need to know"
[7]: https://blog.google/products/gemini/gemini-3/?utm_source=chatgpt.com "A new era of intelligence with Gemini 3"
[8]: https://codelabs.developers.google.com/getting-started-google-antigravity "Getting Started with Google Antigravity  |  Google Codelabs"
[9]: https://www.itpro.com/technology/artificial-intelligence/google-launches-flagship-gemini-3-model-and-google-antigravity-a-new-agentic-ai-development-platform?utm_source=chatgpt.com "Google blows away competition with powerful new Gemini 3 model"
[10]: https://venturebeat.com/ai/google-antigravity-introduces-agent-first-architecture-for-asynchronous?utm_source=chatgpt.com "Google Antigravity introduces agent-first architecture for asynchronous, verifiable coding workflows"
[11]: https://simonwillison.net/2025/Nov/18/google-antigravity/?utm_source=chatgpt.com "Google Antigravity"
[12]: https://antigravity.google/?utm_source=chatgpt.com "Google Antigravity"
[13]: https://www.reddit.com/r/singularity/comments/1p10h7i/has_anyone_tried_antigravity_by_google_thoughts/?utm_source=chatgpt.com "Has anyone tried Antigravity by Google? Thoughts on the ..."
