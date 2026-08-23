---
title: 'Agent Plugins 1.0：SkillとMCPを1つの配布形式にまとめる'
description: 'AIエージェント向け拡張を複数クライアントへ持ち運ぶための仕様、Agent Plugins 1.0.0のパッケージ構造と意図的に狭い標準化範囲を読み解きます。'
pubDate: 2026-08-09
tags: ['Agent Plugins', 'Agent Skills', 'MCP', 'AIエージェント']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

Agent Plugins 1.0.0は、AIエージェント向けの拡張を配布するためのオープンでベンダー中立な仕様です。対象はAgent SkillsとMCPサーバー。両者の仕様を作り直すのではなく、同じ拡張をクライアントごとに包み直さずに済むよう、パッケージの置き場所と読み込み方を揃えます。Vercelが提案を始め、AWS、Anysphere、GitHub、Microsoft、OpenAI、Vercelのメンバーが1.0.0へまとめました。([Vercel][1])

この仕様で目を引くのは、できることの多さではなく、境界の引き方です。標準化するのは、共有しやすい部分だけ。インストール方法や配布経路、権限管理、画面上の見せ方まで共通化しようとはしていません。

## 入口は `plugin.json`、中身は決まった場所へ

プラグインは1つのディレクトリです。ルートに `plugin.json` を置き、Skillは `skills/`、MCPサーバーの設定は `mcp.json` に入れます。最小のmanifestで必須なのは、仕様バージョンを示す `$schema` と `name` の2項目だけです。([仕様書][2])

```text
my-plugin/
├── plugin.json
├── skills/
│   └── summarize/
│       └── SKILL.md
└── mcp.json
```

配置を固定したことで、manifestに独自の探索ルールを書き足す必要がありません。クライアントは対応する種類だけを読み込めます。Skillのみ対応するクライアントも仕様に準拠でき、`skills/` や `mcp.json` が存在しないこと自体はエラーになりません。

失敗の範囲も細かく区切られています。不正なSkillはそのSkillだけを飛ばし、MCPサーバーの設定が1件壊れていれば、その項目だけを無効にするのが原則です。1つの接続失敗で、同じパッケージ内の無関係なSkillまで使えなくなる設計ではありません。

## MCP設定も持ち運べるが、秘密は入れない

`mcp.json` は `stdio`、`streamable-http`、旧方式の `sse` を区別します。ローカルプロセスには、配布物を指す `${PLUGIN_ROOT}` と、更新後も残す書き込み可能な領域 `${PLUGIN_DATA}` が用意されます。実行ファイルや設定は前者、キャッシュや仮想環境などの状態は後者、という分担です。([仕様書][2])

ただし、これはサンドボックスの仕様ではありません。パッケージ内のパスがルート外へ抜けないための規則はありますが、起動したプロセスの権限までは制限しません。環境変数やHTTPヘッダーも秘密情報の保管場所ではないと明記されています。VS Codeのドキュメントも、MCPサーバーやクライアント固有のhookがローカルコードを実行し得るため、導入前に配布元と内容を確認するよう案内しています。([VS Code][4])

## 共通化しない余地を残す

Agent Plugins v1が持ち運べる部品は、Agent SkillsとMCPサーバーの2種類です。commands、hooks、agentsなどは対象外。クライアント固有の機能は、逆ドメイン名のnamespaceを使って `extensions` や専用ディレクトリへ隔離できます。理解しないクライアントは、その領域を無視します。

ここを無理に統一しなかったのは堅実です。共通部分を小さく保てば、クライアントは独自機能を試しながら、SkillとMCPだけは同じ形で受け取れます。作者側も「すべてのクライアントで同じ挙動になる」とは考えず、まずportableな2種類を分け、対応状況を各クライアントで確かめるのがよさそうです。仕様書には実装者向けのconformance checklistもあるので、独自クライアントへ組み込む場合はそこから読めます。

## 参考

- [Introducing Agent Plugins][1]
- [Agent Plugins Specification 1.0.0][2]
- [Agent Plugins公式ドキュメント][3]
- [Agent plugins in VS Code][4]
- [AWS Supports Agent Plugins][5]

[1]: https://vercel.com/blog/introducing-agent-plugins 'Introducing Agent Plugins'
[2]: https://github.com/agentplugins/agent-plugins-spec/blob/main/spec/1.0.0.md 'Agent Plugins Specification 1.0.0'
[3]: https://agent-plugins.org/ 'Agent Plugins'
[4]: https://code.visualstudio.com/docs/agent-customization/agent-plugins 'Agent plugins in VS Code'
[5]: https://aws.amazon.com/blogs/opensource/aws-supports-agent-plugins-an-open-standard-for-portable-agent-extensions 'AWS Supports Agent Plugins'
