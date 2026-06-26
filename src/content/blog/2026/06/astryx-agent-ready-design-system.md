---
title: 'Astryx：AIエージェントが使えるデザインシステムという設計'
description: 'Metaが公開したAstryxについて、React/StyleXベースのUIコンポーネントだけでなく、CLI、テンプレート、JSON API、MCPを含めたエージェント対応の意味を整理します。'
pubDate: 2026-06-27
tags: ['Astryx', 'React', 'StyleX', 'デザインシステム', 'AIエージェント']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

Metaが公開したAstryxは、ReactとStyleXを土台にしたオープンソースのデザインシステムです。READMEではBetaと明記されており、Metaのモノレポ内で8年ほど育ち、13,000以上のアプリを支えてきた内部ツール開発の経験から生まれたものとして説明されています。([GitHub][1])

ただ、Astryxを「React用のUIコンポーネント集」とだけ見ると、少し薄いです。READMEで前面に出ているのは、コンポーネント、テンプレート、テーマ、CLI、MCPサーバーまで含めて、人間とAIエージェントが同じ道具を使って画面を作れるようにする、という方向です。公式サイトでもDocs、Components、Templates、Themes、Playgroundへの導線が並び、単なるパッケージ一覧より「作り始める入口」を強く見せています。([Astryx Design System][4])

## コンポーネントより先に、作り方を揃える

Astryxの中核は `@astryxdesign/core` です。ここにはUIコンポーネント、テーマシステム、ユーティリティが入っています。導入は `@astryxdesign/core` と `@astryxdesign/theme-neutral` を追加し、Next.jsやVite側でCSSとProviderを設定する流れです。Next.js + Tailwind、Next.js + StyleX、Vite向けの例がREADMEに分けて載っています。([core README][2])

おもしろいのは、ページを一から組み立てるより、テンプレートから始めることを勧めている点です。`XDSLayout` のheader、content、panelスロットを組み合わせたダッシュボード、設定画面、フォーム、詳細ページなどのパターンを、CLIから取り出せるようにしています。

これはデザインシステムの範囲を「ButtonやCardの見た目」だけに閉じない考え方です。UI部品を揃えても、画面全体の余白、情報量、ナビゲーション、フォームの流れがばらければ、プロダクトはすぐに別物になります。Astryxはそのズレを、部品より大きい単位のテンプレートで抑えようとしているように見えます。

## AIエージェント向けの入口がCLIにある

Astryxで特に目立つのは `@astryxdesign/cli` です。CLIはコンポーネントのドキュメント、デザイントークン、ページテンプレート、テーマ、アップグレード用codemodを扱います。`astryx search button` のように横断検索したり、`astryx component Button` でコンポーネントの詳細を見たり、`astryx template --list` でテンプレートを探したりできます。([CLI README][3])

ここまでは開発者向けCLIとして自然です。もう一段踏み込んでいるのが、JSON APIとmanifestです。CLI READMEでは、各コマンドが `--json` で型付きのレスポンスを返し、エラーには `ERR_UNKNOWN_COMPONENT` や `ERR_CORE_NOT_FOUND` のような安定したコードが付くと説明されています。さらにmanifestでは、コマンド、引数、フラグ、JSON対応の有無、レスポンス型をまとめて取得できます。

AIエージェントにとって、この差は大きいです。ドキュメントを読んで雰囲気でコマンドを組むのではなく、「どの操作があり、何を渡せばよく、失敗時にどのコードを見るか」を構造化して扱えます。READMEではMCPサーバーにも触れており、エージェントがscaffold、browse、documentする入口まで同じAPIに寄せようとしています。人間向けのヘルプと、機械向けの契約を同じ道具に置いているところが、Astryxの“agent ready”らしさです。

Getting Startedにも、その考え方がそのまま出ています。既存プロジェクトに `@astryxdesign/core`、`@astryxdesign/theme-neutral`、`@astryxdesign/cli` を入れ、`npx astryx init` でエージェント向けドキュメントを生成する流れが案内されています。人間がREADMEを読んでから手で整えるというより、AI coding toolへ渡す前提の導入文まで用意しているのが特徴です。([Getting Started][5])

## テーマと余白も、あとから直す対象ではない

READMEでは、Astryxの特徴としてCSS変数カスケードによるテーマ機構、10種類の既成テーマ、文脈に応じたspacing補正が挙げられています。特に自動spacingは、二重paddingのようなレイアウト崩れを手作業で直さずに済ませるための仕組みとして説明されています。([GitHub][1])

デザインシステムをAIエージェントに使わせる場合、ここは地味に効きます。エージェントは局所的なコード生成は得意でも、画面全体の余白や階層の違和感を人間ほど細かく見続けるのは苦手です。テーマやspacingのルールがコンポーネント側に寄っていれば、生成された画面も崩れにくい方向へ寄ります。

## まだBetaだが、見るべき場所ははっきりしている

AstryxはBetaです。すぐに既存プロダクトへ全面採用するというより、まずはREADME、core、CLIの設計を読む対象としておもしろいです。

見るべき点は、コンポーネント数の多さよりも、デザインシステムを「人間だけが読むガイドライン」から「エージェントも呼び出せるAPI」に寄せているところです。コンポーネントのprops、テンプレート、テーマ、検索、エラーコード、manifestまで揃っていると、AIエージェントは画面を推測で作るのではなく、用意された設計資産をたどって作れるようになります。

デザインシステムの次の課題は、見た目の統一だけではなく、生成や保守の入口をどこまで機械に開くかになっていきそうです。Astryxは、その方向をかなり明確に示しているプロジェクトです。

## 参考

- [facebook/astryx README][1]
- [@astryxdesign/core README][2]
- [@astryxdesign/cli README][3]
- [Astryx Design System][4]
- [Getting Started][5]

[1]: https://github.com/facebook/astryx 'facebook/astryx'
[2]: https://github.com/facebook/astryx/blob/main/packages/core/README.md '@astryxdesign/core README'
[3]: https://github.com/facebook/astryx/blob/main/packages/cli/README.md '@astryxdesign/cli README'
[4]: https://astryx.atmeta.com/ 'Astryx Design System'
[5]: https://astryx.atmeta.com/docs/getting-started 'Getting Started · Astryx'
