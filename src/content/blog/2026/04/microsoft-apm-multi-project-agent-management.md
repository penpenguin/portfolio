---
title: 'microsoft/apm を見て感じたことと、複数プロジェクトのエージェント設定をどう管理するか'
description: 'APM の基本フローを確認しながら、org-wide package を使って複数リポジトリの AI エージェント設定をどう管理するかを整理します。'
pubDate: 2026-04-17
tags: ['apm', 'ai-agent', 'copilot', 'claude-code', 'cursor']
---

> [!NOTE]
> この記事はGPT-5.4 Proが書き、人間がレビューしています

この記事は、2026年4月17日時点の `microsoft/apm` 公開リポジトリと公式ドキュメントをもとに整理しています。実際の導入判断では、手元のリポジトリ構成や利用中のエージェントに合わせて再確認してください。([GitHub][1])

AI コーディングエージェントを複数のプロジェクトで使い始めると、instructions、skills、prompts、agents、hooks、plugins、MCP servers といった設定が、リポジトリごとに散らばりやすくなります。誰の環境が正しいのか、どの設定がどのリポジトリに入っているのか、更新をどう配るのかがすぐ曖昧になります。APM はこの問題に対して、`apm.yml` を manifest として使い、`apm install` で各ツール向けの設定を配備する、AI エージェント設定向けの dependency manager として設計されています。([GitHub][1])

この記事では、まず APM の最小フローを確認します。そのうえで、複数プロジェクトをまたいで設定を管理するなら、org・team・project の 3 層でどう分けるのが現実的かを、公式の org-wide packages、migration、governance の考え方に沿って整理します。([Microsoft GitHub][2])

## APM は何を管理するツールか

APM は、`package.json` や `requirements.txt` のような役割を、AI エージェント設定に持ち込むツールです。`apm.yml` には skills、prompts、instructions、agents、hooks、plugins、MCP servers をまとめて宣言でき、Copilot、Claude Code、Cursor、OpenCode 向けにはそれぞれのネイティブな配置先へ展開されます。Codex や Gemini のように別形式が必要なツールでは、`apm compile` で生成する前提になっています。([Microsoft GitHub][3])

ここで重要なのは、APM が「エージェントそのもの」を実行する基盤というより、「エージェントが読む設定やコンテキストを依存関係として管理する基盤」だという点です。公式の説明でも、declare、lock、install、audit という流れで AI agent configuration を扱うことが中心に置かれています。([Microsoft GitHub][4])

## 最小構成で始める

最初に確認したいのは、導入のハードルがどこまで低いかです。Quick Start では、インストール、初期化、パッケージ追加の 3 ステップが基本フローとして案内されています。`apm init` は最小構成の `apm.yml` を作るだけで、既存のリポジトリに後付けしやすい設計です。([Microsoft GitHub][5])

```bash
curl -sSL https://aka.ms/apm-unix | sh
apm --version

apm init my-project
cd my-project

apm install microsoft/apm-sample-package#v1.0.0
```

`apm init` が作るのは、基本的には `apm.yml` です。CLI リファレンスでも、初期化は minimal by default で、brownfield friendly、つまり既存プロジェクトを汚しにくいことが明記されています。ここはかなり好印象でした。複数プロジェクトへ横展開するとき、最初から大量のファイルを生成するツールは導入しづらいですが、APM はその点をかなり意識しています。([Microsoft GitHub][6])

たとえば初期状態の manifest は、次のような最小形から始まります。これは「まず manifest を置く」「あとから依存を追加する」という順番で進められるので、既存の `.github/` や `.claude/` 設定を残したまま試しやすい構成です。([Microsoft GitHub][5])

```yaml:apm.yml
name: my-project
version: 1.0.0

dependencies:
  apm: []
```

## パッケージを追加すると何が起きるか

APM の価値は、`apm install` を実行したときの挙動でよく分かります。公式の Quick Start では、依存パッケージの取得、各ツール向けディレクトリへの配備、lockfile の生成が 1 回の install で起きる流れが示されています。([Microsoft GitHub][5])

実際には、概ね次のような構成になります。

```text
my-project/
├── apm.yml
├── apm.lock.yaml
├── apm_modules/
│   └── microsoft/
│       └── apm-sample-package/
├── .github/
│   ├── instructions/
│   └── prompts/
├── .claude/
│   └── commands/
├── .cursor/
│   ├── rules/
│   └── agents/
└── .opencode/
    ├── agents/
    └── commands/
```

ここで起きていることは 3 つあります。ひとつめは、依存パッケージが `apm_modules/` にダウンロードされることです。ふたつめは、その中の instructions や prompts などが `.github/`、`.claude/`、`.cursor/`、`.opencode/` へ配備されることです。みっつめは、`apm.lock.yaml` に解決済みの commit が記録され、同じ構成を他の開発者や CI で再現できるようになることです。さらに、プロジェクト自身の `.apm/` 配下にあるローカル定義も配備対象になり、衝突時はローカルが優先されます。([Microsoft GitHub][5])

この「依存解決」と「各ツール向けのネイティブ配置」が一体になっているのが、APM を見てまず良いと感じた点です。単に package を取ってくるだけではなく、Copilot、Claude、Cursor などが実際に読む場所まで落としてくれるので、チームに配るときの説明がかなり短くなります。しかも公式の Teams ドキュメントでは、APM は static files を生成して終わる構成で、常駐プロセスや独自 runtime を持たないことも明記されています。([Microsoft GitHub][4])

## 既存プロジェクトに後付けしやすいのがよい

複数プロジェクト管理を考えるとき、いちばん大事なのは「新規リポジトリだけでなく、既存リポジトリにも無理なく入れられるか」です。APM の migration ドキュメントでは、APM は additive であり、既存の `.github/copilot-instructions.md`、`AGENTS.md`、`.claude/`、`.cursor` 系の設定を削除も上書きもせず、そのまま残すと説明されています。([Microsoft GitHub][7])

そのため、複数プロジェクトへの導入は、次の順番で進めるのが現実的です。まず各リポジトリで `apm init` だけ実行し、manifest を置きます。次に、組織共通の package を `apm install` で追加します。最後に、展開された `.github/` や `.claude/` などをコミットし、以後の変更を `apm.yml` と `apm.lock.yaml` ベースで追うようにします。既存設定は消さず、重複した部分だけを徐々に shared package 側へ寄せていく、という進め方です。これは公式の migration と quick start を踏まえた運用案ですが、かなり無理がありません。([Microsoft GitHub][7])

## 複数プロジェクト管理は org・team・project の 3 層で分ける

ここから先が本題です。複数プロジェクトをまたいで管理するなら、公式の Org-Wide Packages が示している layered composition をそのまま採るのが、いちばん筋が良いと思います。つまり、広いものから狭いものへ、org 共通、team 共通、project 固有の順に分けます。([Microsoft GitHub][2])

### org 共通パッケージを 1 つ持つ

まず、全リポジトリで共通化したいものを `your-org/apm-standards` のような中央 package にまとめます。たとえば、セキュリティ基準、レビュー用 agent、共通 prompt、標準 skill などです。公式 docs でも、中央チームが standards package を公開し、各 repository がそれを dependency として使うパターンが前提になっています。([Microsoft GitHub][2])

```text
your-org/apm-standards/
├── .apm/
│   ├── instructions/
│   │   ├── coding-standards.instructions.md
│   │   └── security-baseline.instructions.md
│   ├── agents/
│   │   └── security-reviewer.agent.md
│   └── prompts/
│       └── architecture-review.prompt.md
└── apm.yml
```

この層には、「全社で必ず使いたいルール」だけを置くのが重要です。逆に言うと、フロントエンド固有の設計ルールや、あるドメイン固有の運用知識はここに入れないほうがよいです。共通 package を太らせすぎると、どのリポジトリでも override が必要になり、中央集約の意味が薄れます。これは公式の layered composition の考え方を、そのまま運用に落とした話です。([Microsoft GitHub][2])

### team パッケージで職種や領域ごとの差分を持つ

次に、バックエンド、フロントエンド、データ基盤のような単位で team package を持ちます。公式 docs でも、team package が org-wide base を継承し、その上に team-specific な instructions や agents を載せる例が示されています。([Microsoft GitHub][2])

```yaml:apm.yml
name: platform-backend
version: 1.2.0

dependencies:
  apm:
    - your-org/apm-standards#v1.4.0
```

ここでは、たとえば API 設計規約、DB マイグレーションの手順、レビュー観点、障害対応時の確認 prompt などを追加します。こうしておくと、各プロジェクトは team package を 1 つ入れるだけで、org 共通と team 共通の両方をまとめて取り込めます。APM は transitive dependencies を解決するので、project 側は dependency tree の上流を細かく意識しなくて済みます。([Microsoft GitHub][3])

### project では最後の差分だけを持つ

最後に、各リポジトリ固有の事情は、その repo の `.apm/` に閉じ込めます。支払いドメイン特有のレビュー観点や、そのサービスだけが使う MCP server、特定の運用手順などはここに置くのが自然です。([Microsoft GitHub][5])

```yaml:apm.yml
name: payments-service
version: 1.0.0

dependencies:
  apm:
    - your-org/platform-backend#v1.2.0
```

```text
payments-service/
├── .apm/
│   ├── instructions/
│   │   └── domain-rules.instructions.md
│   └── prompts/
│       └── incident-triage.prompt.md
└── apm.yml
```

この設計の大事な点は、override 順序が明確なことです。公式 docs では、優先順位は project-local files、direct dependencies、transitive dependencies の順になっています。つまり、org 標準を配りつつ、必要な repo だけが局所的に上書きできます。複数プロジェクト管理では、この「基本は中央集約、例外は局所 override」という形がいちばん扱いやすいです。([Microsoft GitHub][2])

## 更新フローは `apm.lock.yaml` を中心に回す

複数プロジェクト管理で次に重要なのは、更新をどう流すかです。公式 docs では、shared package に git tag を打ち、利用側は version や ref を指定して参照し、最終的には `apm.lock.yaml` が exact commit を固定する流れになっています。subsequent install は lockfile を使って再現され、更新時は `apm deps update` または `apm install --update` で再解決します。([Microsoft GitHub][2])

まず、共通 package 側では通常のリリースを行います。

```bash
git add -A
git commit -m "Add secure API review prompt"
git tag v1.5.0
git push origin main --tags
```

次に、各 consumer repo では更新確認と反映を行います。

```bash
apm outdated
apm deps update your-org/platform-backend
apm install

git add apm.yml apm.lock.yaml .github .claude .cursor .opencode
git commit -m "chore(apm): update backend standards"
```

この運用でよいのは、更新の単位が「各 repo の pull request」になることです。中央 package は一度直せばよい一方、その変更をいつ採用するかは consumer 側が選べます。さらに `apm.lock.yaml` には exact commit と deployed files が残るので、更新差分を Git 上で追いやすくなります。公式の governance docs でも、`git diff apm.lock.yaml`、`git log apm.lock.yaml`、`git show <tag>:apm.lock.yaml` で監査や変更追跡ができることが強調されています。([Microsoft GitHub][8])

なお、日常運用では `apm.yml` と `apm.lock.yaml` に加えて、展開後の `.github/`、`.claude/`、`.cursor/` などもコミット対象です。一方で `apm_modules/` は ignore します。これも Quick Start で明確に案内されています。([Microsoft GitHub][5])

## CI は baseline から始める

複数リポジトリへ広げるなら、最初から厳密な policy engine を入れるより、まずは baseline の CI チェックから始めるのが安全です。理由は、公式 docs が `apm audit --ci` を stable な baseline check として扱う一方、`--policy org` を使う policy enforcement は early preview と説明しているからです。([Microsoft GitHub][8])

最小の GitHub Actions は、たとえば次の形です。

```yaml:.github/workflows/apm-audit.yml
name: APM Audit

on:
  pull_request:
    paths:
      - 'apm.yml'
      - 'apm.lock.yaml'
      - '.github/**'
      - '.claude/**'
      - '.cursor/**'

jobs:
  apm-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install APM
        run: curl -fsSL https://raw.githubusercontent.com/microsoft/apm/main/install.sh | bash
      - name: Run baseline checks
        run: apm audit --ci
```

この baseline で、manifest と lockfile の不整合、missing files、hidden Unicode などを CI で検出できます。さらに公式の `microsoft/apm-action@v1` を使えば、GitHub Actions 上で `apm install` を簡単に組み込みやすく、audit report を SARIF として出すこともできます。([Microsoft GitHub][9])

私なら、導入順序はこうします。最初は全 repo で `apm audit --ci` を required check にします。そのあと org package が安定してから `--policy org` を試し、さらに repo ごとの tighter policy が必要になったら `extends: org` で絞り込む、という順番です。これは公式 docs の stable / preview の線引きを踏まえた進め方です。([Microsoft GitHub][9])

## いま気をつけたい点

ひとつめは、APM がまだ進化の速いプロジェクトだという点です。公式サイトでも early days で evolving fast と書かれており、GitHub Releases でも 2026年4月6日時点で `v0.8.11` が出ています。基本機能はかなり明快ですが、周辺機能は今後も変わる前提で見たほうがよいです。([Microsoft GitHub][3])

ふたつめは、experimental な機能を基盤にしすぎないことです。Agent Workflows は experimental、policy engine も preview、`apm audit --drift` は planned feature とされています。したがって、複数プロジェクト管理の中核は、当面 `apm install`、`apm.lock.yaml`、`apm audit --ci` に置くのが無難です。([Microsoft GitHub][10])

みっつめは、local override を増やしすぎないことです。project-local が最優先になるのは便利ですが、各 repo が大量に上書きを始めると、中央 package を更新しても効かなくなります。org・team・project の分割は、技術的には簡単でも、運用上は「どこまでを上流へ寄せるか」の discipline が必要です。ここは APM の弱点というより、レイヤー構成を取る以上避けられないポイントです。([Microsoft GitHub][2])

## まとめ

`microsoft/apm` を見て、いちばんよいと感じたのは、AI エージェント設定を「配布物」ではなく「依存関係」として扱っていることです。`apm.yml` で宣言し、`apm install` で各ツール向けに配置し、`apm.lock.yaml` で再現性と監査性を確保する、という流れはかなり分かりやすいです。([GitHub][1])

複数プロジェクト管理という観点では、org 共通、team 共通、project 固有の 3 層に分けるのが本命です。中央 package で共通ルールを配り、team package で領域差分を持ち、各 repo の `.apm/` には最後の差分だけを残す。この形にしておくと、共通化と例外対応のバランスが取りやすくなります。([Microsoft GitHub][2])

導入の順番としては、まず既存 repo に additive に入れること、次に `apm audit --ci` で baseline を固めること、そのあとで policy や marketplace などの上位機能を検討することを勧めます。今の APM は、全部入りを一気に狙うより、まず stable な核を揃えてから広げるほうがきれいに運用できそうです。([Microsoft GitHub][7])

## 参考

* APM GitHub README ([GitHub][1])
* APM 公式トップページ ([Microsoft GitHub][3])
* Quick Start ([Microsoft GitHub][5])
* CLI Commands ([Microsoft GitHub][6])
* Dependencies & Lockfile ([Microsoft GitHub][11])
* Existing Projects ([Microsoft GitHub][7])
* Org-Wide Packages ([Microsoft GitHub][2])
* APM for Teams ([Microsoft GitHub][4])
* Governance & Compliance ([Microsoft GitHub][8])
* CI Policy Enforcement ([Microsoft GitHub][9])
* `microsoft/apm-action` README ([GitHub][12])

[1]: https://github.com/microsoft/apm/blob/main/README.md "apm/README.md at main · microsoft/apm · GitHub"
[2]: https://microsoft.github.io/apm/guides/org-packages/ "Org-Wide Packages | Agent Package Manager"
[3]: https://microsoft.github.io/apm/ "APM – Agent Package Manager | Agent Package Manager"
[4]: https://microsoft.github.io/apm/enterprise/teams/ "APM for Teams | Agent Package Manager"
[5]: https://microsoft.github.io/apm/getting-started/quick-start/ "Quick Start | Agent Package Manager"
[6]: https://microsoft.github.io/apm/reference/cli-commands/ "CLI Commands | Agent Package Manager"
[7]: https://microsoft.github.io/apm/getting-started/migration/ "Existing Projects | Agent Package Manager"
[8]: https://microsoft.github.io/apm/enterprise/governance/ "Governance & Compliance | Agent Package Manager"
[9]: https://microsoft.github.io/apm/guides/ci-policy-setup/ "CI Policy Enforcement | Agent Package Manager"
[10]: https://microsoft.github.io/apm/guides/agent-workflows/?utm_source=chatgpt.com "Agent Workflows (Experimental) | Agent Package Manager"
[11]: https://microsoft.github.io/apm/guides/dependencies/ "Dependencies | Agent Package Manager"
[12]: https://github.com/microsoft/apm-action "GitHub - microsoft/apm-action: GitHub Action for Agent Package Manager · GitHub"
