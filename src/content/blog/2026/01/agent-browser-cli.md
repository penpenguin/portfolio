---

title: 'agent-browserとは？AIエージェントに「ブラウザの手足」を渡すためのCLI'
description: 'Vercel Labsが公開しているagent-browserを、snapshotとrefという考え方を軸に、導入から使いどころまで自然体で解説します。'
pubDate: 2026-01-14
tags: ['AIエージェント', 'ブラウザ自動化', 'CLI', 'Playwright', 'Vercel']
---

> [!NOTE]
> この記事はAIが書き、人間がレビューしています

# agent-browserをひとことで言うと

agent-browserは、AIエージェントがWebブラウザを操作するための「コマンドライン道具」です。画面を開いて、ボタンを押して、フォームに入力して、必要ならスクリーンショットも撮る。そういう一連の動きを、シェルコマンドとして扱えるようにしてあります。([Agent Browser][1])

ここで大事なのは、「人間向けの自動化ツールを、AI向けに持ち替えた」感じがするところです。特に、agent-browserが推している `snapshot` と `ref` の考え方が、その“持ち替え”の中心にあります。([Agent Browser][1])

# 先に注意：同じ名前がいくつかある

ややこしいのですが、「Agent Browser」という言葉は別の文脈でも使われています。

たとえばDatto RMMの「Agent Browser」は、リモート操作や端末管理のための機能名です。([rmm.datto.com][2])
Bright Dataの「Agent Browser」は、クラウド上のブラウザ実行基盤（アンブロックやCAPTCHA対応などを含む）として説明されています。([Bright Data][3])
さらにMCPサーバーをまとめて管理するための「Agent Browser」という別プロジェクトも存在します。([GitHub][4])

この記事で扱うのは、`agent-browser`（ハイフン付き）のnpmパッケージとして配布されている、Vercel LabsのCLIツールです。([Agent Browser][1])

# 何がうれしいのか：「ref」で迷子になりにくい

ブラウザ自動化って、もともとPlaywrightやSeleniumでできますよね。なのに、なぜagent-browserがわざわざ生まれたのか。

理由のひとつは、AIが「どの要素を押せばいいのか」を安定して選ぶのが、意外とむずかしいからです。CSSセレクタは壊れやすいし、画面の都合でボタンが増えたり減ったりすると、すぐ迷子になります。

そこでagent-browserは、`snapshot` で「アクセシビリティツリー」を取り出して、各要素に `@e1` みたいな参照（ref）を振ります。AIはそのrefを使って `click @e2` のように操作する。つまり、AIが“次にやるべき行動”を選びやすい形で、ページを差し出しているんです。([Agent Browser][5])

このref方式の利点は、ドキュメントでも「決定的（deterministic）で、AIフレンドリー」と明記されています。([Agent Browser][6])

# 仕組みはわりと現実的：RustのCLI＋Nodeのデーモン

agent-browserは「速さ」にこだわっています。コマンドを受け取る部分はRustのネイティブCLIで、実際にブラウザを動かすのはNode.js側のデーモンが担当し、Playwrightのブラウザインスタンスを管理する構造です。デーモンは最初のコマンドで自動起動し、コマンド間で生き続けるので、毎回ゼロから立ち上げないぶん速い、という考え方ですね。([Agent Browser][1])

「もしネイティブバイナリが使えないならNode.jsにフォールバックする」という説明もあり、現場で詰まりにくい設計になっています。([GitHub][7])

# まずは触る：インストールと最小の流れ

導入はシンプルで、npmでグローバルに入れてからChromiumを落とします。([Agent Browser][8])

```bash
npm install -g agent-browser
agent-browser install
```

最小の流れは、ページを開いて、スナップショットを取り、refでクリックする。これだけです。([Agent Browser][9])

```bash
agent-browser open example.com
agent-browser snapshot -i
agent-browser click @e2
agent-browser screenshot page.png
agent-browser close
```

`-i` を付けると「操作できる要素だけ」に絞ってくれるので、AIに渡す情報量が減って扱いやすい。これは地味に効きます。([Agent Browser][5])

# AIエージェントと組むときの作法：「--json」がちょうどいい

AIエージェントに使わせるなら、出力を機械が読みやすい形に揃えたくなります。agent-browserは `--json` を用意していて、`snapshot` の結果も、`get text` の結果も、JSONで返せます。([Agent Browser][10])

たとえば、次のようなループが自然です。

1. `open` して移動
2. `snapshot -i --json` で画面を読む
3. AIがrefを決める
4. `click` や `fill` を実行
5. 画面が変わったらまた `snapshot`

この「スナップショット→行動→再スナップショット」というリズムが、agent-browserの基本呼吸だと思います。([Agent Browser][10])

対応するエージェントは特定の製品に固定されておらず、「シェルコマンドを実行できるならOK」という立て付けです。ドキュメント上はClaude Code、Cursor、Copilot、Codex、Geminiなどが例示されています。([Agent Browser][10])

# ちょっと便利なところ：セッションとヘッダーの扱いが丁寧

地味だけど、実運用で助かるのが「セッション」です。`--session` を変えると、ブラウザインスタンスが分かれて、Cookieやストレージ、認証状態も分離される、と説明されています。複数アカウントを同時に扱うときや、テスト環境を分けたいときに便利です。([Agent Browser][11])

さらに `--headers` を使うと、特定のoriginにだけHTTPヘッダーを付けられる。別ドメインに移動したらヘッダーは送られない、という点まで明記されています。ログインフローを無理にUIで踏まず、トークンで認証したい場面に向いています。([Agent Browser][11])

# 見える化もできる：headed、streaming、CDP

AIがブラウザを動かしていると、「いま何してるの？」が気になります。

agent-browserは `--headed` で画面表示しながら動かすモードがあります。デバッグのとき、これだけで気持ちが落ち着きます。([Agent Browser][9])

もう一段おもしろいのがStreaming機能です。環境変数でポートを指定すると、WebSocketでビューポートをストリーミングし、マウスやキーボード入力も注入できる、とされています。人間が横で見守る「ペアブラウジング」に寄せた設計ですね。([Agent Browser][12])

そしてCDP Mode。Chrome DevTools Protocolで既存のブラウザ（ElectronやWebView2なども含む）につないで操作できる、と説明されています。すでに立ち上がっている環境を触りたいときに効きます。([Agent Browser][13])

# どんな人に向くのか

いちばん似合うのは、「AIにWeb作業をさせたいけど、成功率と再現性がほしい」人です。テスト自動化でも、情報収集でも、フォーム入力でも、ブラウザの操作が入るだけで不確実さが跳ね上がる。そこをrefとsnapshotで“読み替え”して、AIが扱える形に寄せるのがagent-browserの狙いです。([Agent Browser][1])

逆にいうと、「ただのスクレイピング」だけなら、もっと軽い方法もあります。agent-browserは“行動する”前提の道具なので、ページを読むだけで終わる用途には、少し大げさかもしれません。

# 最後に：強い道具は、使い方が顔になる

ブラウザ操作をAIに渡すというのは、要するに「クリック権限を渡す」ということです。便利なぶん、気をつけるところも出てきます。個人アカウントでログインしたまま動かすのか、テスト用の環境で完結させるのか。セッション分離をどう使うのか。そういう設計が、そのまま安全性になります。([Agent Browser][11])

agent-browserは、そういう“現実の運用”に足場を置いたまま、AIが迷いにくい形をちゃんと作っている。そこが、いちばんの良さだと思います。([Agent Browser][1])

[1]: https://agent-browser.dev/ "agent-browser"
[2]: https://rmm.datto.com/help/en/Content/5AGENT/AgentBrowser.htm "Agent Browser"
[3]: https://brightdata.com/ai/agent-browser "AI-Ready Browser: Scalable & Block-Free Agent Execution"
[4]: https://github.com/co-browser/agent-browser "GitHub - kontext-dev/agent-browser: One connection for all your MCP servers."
[5]: https://agent-browser.dev/snapshots "agent-browser"
[6]: https://agent-browser.dev/selectors "agent-browser"
[7]: https://github.com/vercel-labs/agent-browser "GitHub - vercel-labs/agent-browser: Browser automation CLI for AI agents"
[8]: https://agent-browser.dev/installation "agent-browser"
[9]: https://agent-browser.dev/quick-start "agent-browser"
[10]: https://agent-browser.dev/agent-mode "agent-browser"
[11]: https://agent-browser.dev/sessions "agent-browser"
[12]: https://agent-browser.dev/streaming "agent-browser"
[13]: https://agent-browser.dev/cdp-mode "agent-browser"
