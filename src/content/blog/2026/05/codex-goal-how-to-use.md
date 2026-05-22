---
title: 'Codexで /goal を使う方法'
description: 'Codex CLIの/goalで、長い作業に達成条件を設定し、確認・一時停止・再開・解除する手順を説明します。'
pubDate: 2026-05-22
tags: ['Codex', 'OpenAI', 'CLI', 'AI Coding']
---

> [!NOTE]
> この記事はGPT-5.5 Proが書き、人間がレビューしています

通常のプロンプトでは、Codex に「このバグを直して」「このテストを見て」と依頼し、1回の応答が終わると次の指示を待ちます。一方で、テスト修正、移行、リファクタリング、性能改善のような作業では、調査、変更、実行、再修正を何度か繰り返す必要があります。

`/goal` は、Codex に継続的な達成目標を設定するためのスラッシュコマンドです。OpenAI のドキュメントでは、Goal は「スレッドを定義済みの結果に向かわせる永続的な目的」と説明されています。完了条件、検証方法、守るべき制約を含めて指定できるため、単発のプロンプトよりも長い作業に向いています。([OpenAI Developers][1])

この記事では、Codex CLI のインタラクティブセッションで `/goal` を使う方法を扱います。インストール、起動、Goal の設定、確認、一時停止、再開、解除、Goal の書き方までを順番に説明します。

## /goalで何が変わるか

ここでは、通常のプロンプトと `/goal` の違いを確認します。先に違いを押さえておくと、どの作業に使うべきか判断しやすくなります。

通常のプロンプトは、「次にこれをしてほしい」という指示です。たとえば「このテストを修正して」と送ると、Codex はその指示に対して作業し、結果を返して止まります。

一方で `/goal` は、「この状態になるまで作業を続けてほしい」という達成条件をスレッドに付けます。OpenAI の説明では、Goal は通常の「ask -> work -> result -> wait」ではなく、「work -> check -> continue or complete」に近い動きとして説明されています。([OpenAI Developers][1])

たとえば次のような作業では、`/goal` が向いています。

```text
/goal checkoutのp95レイテンシを120ms未満にし、正しさを確認するテストは失敗させない
```

この Goal には、達成したい状態と守るべき制約があります。Codex はベンチマークを実行し、原因を調べ、変更を加え、再度ベンチマークやテストを実行する、という流れで進めやすくなります。

## Codex CLIを更新して起動する

まず、`/goal` を使うために Codex CLI を新しい状態にします。Codex CLI は、ローカルのターミナルから実行できる OpenAI のコーディングエージェントで、選択したディレクトリ内のコードを読み、変更し、コマンドを実行できます。([OpenAI Developers][2])

npm でインストールまたは更新する場合は、次のようにします。

```bash
npm i -g @openai/codex@latest
codex --version
```

Homebrew を使う場合は、次のように更新します。

```bash
brew update
brew upgrade --cask codex
codex --version
```

OpenAI の Cookbook では、Goals は Codex 0.128.0 以降で利用できると説明されています。また、2026年5月21日の Codex CLI 0.133.0 の changelog では、Goals がデフォルトで有効になったと記載されています。([OpenAI Developers][1]) ([OpenAI Developers][3])

次に、対象のリポジトリへ移動して Codex を起動します。

```bash
cd ~/work/example-app
codex
```

初回起動時は、ChatGPT アカウントまたは API キーでのサインインを求められます。Codex CLI の公式ドキュメントでも、`codex` を実行するとターミナル UI が開き、初回は認証を行う流れになっています。([OpenAI Developers][2])

## /goalが表示されない場合に有効化する

新しい Codex CLI では、通常は `/goal` をそのまま使えます。もし `/` を入力しても `/goal` が候補に出ない場合は、古いビルドや設定の影響を疑います。

OpenAI の「Follow a goal」ドキュメントでは、`/goal` がスラッシュコマンド一覧に表示されない場合、`config.toml` で `features.goals` を有効化する方法が示されています。([OpenAI Developers][4])

ユーザー設定で有効化する場合は、次のように書きます。

```toml title="~/.codex/config.toml"
[features]
goals = true
```

Codex のユーザー設定は `~/.codex/config.toml` に置けます。また、プロジェクト単位で設定したい場合は、リポジトリ内に `.codex/config.toml` を置きます。([OpenAI Developers][5])

CLI から有効化する場合は、次のコマンドを実行します。

```bash
codex features enable goals
```

その後、Codex を起動し直して `/` を入力し、候補に `/goal` が出るか確認します。もし表示されない場合は、まず `npm i -g @openai/codex@latest` で最新版に更新するのが基本です。

## Goalを設定する

ここでは、実際に `/goal` を設定します。基本形は次のとおりです。

```text
/goal <objective>
```

たとえば、失敗しているテストを修正し、テストが通る状態まで進めたい場合は、次のように書けます。

```text
/goal tests/cart.test.ts の失敗を修正し、pnpm test が通る状態にする。公開APIのレスポンス形式は変更しない。
```

`/goal <objective>` を入力すると、その Goal が現在のアクティブなスレッドに関連付けられます。公式の CLI スラッシュコマンド一覧では、`/goal <objective>` で Goal を設定し、`/goal` で現在の Goal を表示し、`/goal pause`、`/goal resume`、`/goal clear` で制御できると説明されています。([OpenAI Developers][6])

設定後は、Codex が対象ファイルを調べ、必要なコマンドを実行し、変更を加え、検証結果を見ながら進めます。Goal が有効な間は、Codex は達成条件に向かって作業を継続でき、成功、停止、ブロック、予算上限などの条件で止まります。([OpenAI Developers][1])

## 完了条件を観測できる形で書く

`/goal` は、単に「いい感じに直して」と書くよりも、完了条件を観測できる形にしたほうが扱いやすくなります。ここでは Goal の書き方を具体化します。

OpenAI の Cookbook では、強い Goal には、結果、検証対象、制約、境界、反復方針、ブロック時の停止条件などを含めると説明されています。([OpenAI Developers][1])

たとえば、弱い Goal は次のようなものです。

```text
/goal カート周りのバグを直す
```

この書き方では、どのバグを直すのか、どう確認するのか、どこまで変更してよいのかが曖昧です。Codex は作業できますが、完了判定が難しくなります。

実務では、次のように書くと確認しやすくなります。

```text
/goal tests/cart.test.ts の失敗を修正し、pnpm test tests/cart.test.ts が成功する状態にする。src/cart.ts の公開関数名と返却形式は変更しない。変更後は実行したコマンド、テスト結果、変更ファイルを報告する。
```

この Goal では、次の点が明確です。

* 何を直すか: `tests/cart.test.ts` の失敗
* どう確認するか: `pnpm test tests/cart.test.ts`
* 何を守るか: `src/cart.ts` の公開関数名と返却形式
* 最後に何を報告するか: コマンド、テスト結果、変更ファイル

このように書くと、Codex が「まだ続けるべきか」「完了としてよいか」を判断しやすくなります。

## 実行例: 失敗しているテストを修正する

ここでは、よくあるテスト修正を例にします。まず、リポジトリでテストを実行し、失敗している状態を確認します。

```bash
pnpm test tests/cart.test.ts
```

出力例は次のようになります。これは説明用の例です。

```text
FAIL tests/cart.test.ts
  cart total
    ✕ calculates total with tax

Expected: 1200
Received: 1000
```

この状態で Codex を起動します。

```bash
codex
```

Codex の入力欄で、次の Goal を設定します。

```text
/goal tests/cart.test.ts の失敗を修正し、pnpm test tests/cart.test.ts が成功する状態にする。税計算の既存仕様は維持し、変更後は差分とテスト結果を報告する。
```

この後、Codex は必要に応じて `tests/cart.test.ts` や関連ファイルを調べ、原因を推定し、修正案を作ります。権限設定によっては、ファイル変更やコマンド実行の前に承認を求められます。Codex の設定では、承認ポリシーやサンドボックス設定によって、コマンド実行やファイルアクセスの扱いを変えられます。([OpenAI Developers][5])

作業が進むと、たとえば次のような確認ができます。

```bash
git diff
pnpm test tests/cart.test.ts
```

テストが成功すれば、出力は次のようになります。

```text
PASS tests/cart.test.ts
  cart total
    ✓ calculates total with tax
```

ここで確認すべき点は、テストが通ったかどうかだけではありません。Goal に書いた制約、つまり公開関数名や返却形式が変わっていないかも確認します。Codex 内では `/diff` を使うと、作業ツリーの差分を確認できます。CLI のスラッシュコマンド一覧でも、`/diff` は Git の差分を確認するためのコマンドとして説明されています。([OpenAI Developers][6])

```text
/diff
```

差分を確認し、意図したファイルだけが変わっていれば、Goal の達成状態をレビューしやすくなります。

## 現在のGoalを確認する

Goal を設定したあと、現在の Goal を確認したい場合は、引数なしで `/goal` を入力します。

```text
/goal
```

表示例はバージョンによって変わる可能性がありますが、現在のスレッドに設定されている Goal の内容が表示されます。

```text
Current goal:
tests/cart.test.ts の失敗を修正し、pnpm test tests/cart.test.ts が成功する状態にする。
```

この確認は、長い作業の途中で特に有効です。作業を続ける前に、Goal が現在の目的と一致しているかを確認できます。もし作業方針を変えたい場合は、古い Goal をそのまま残さず、後述する `/goal clear` で解除してから新しい Goal を設定します。

## Goalを一時停止・再開・解除する

`/goal` は、設定して終わりではありません。作業中に一時停止したり、再開したり、解除したりできます。

Goal を一時停止するには、次のように入力します。

```text
/goal pause
```

一時停止は、たとえば大きな変更の前に人間が差分を確認したい場合や、別の情報を追加したい場合に使います。

再開するには、次のように入力します。

```text
/goal resume
```

Goal を完全に解除するには、次のように入力します。

```text
/goal clear
```

公式ドキュメントでは、`/goal pause`、`/goal resume`、`/goal clear` が Goal のライフサイクルを管理するコマンドとして説明されています。([OpenAI Developers][6])

実務では、次のように使い分けると整理しやすくなります。

```text
/goal pause
```

レビューや追加調査のために止めたいときに使います。

```text
/goal resume
```

同じ Goal に戻り、続きから進めたいときに使います。

```text
/goal clear
```

目的が変わったときや、作業が完了して別のタスクへ移るときに使います。

## 長い指示はファイルに分ける

Goal の本文は長くしすぎないほうが扱いやすくなります。CLI の公式ドキュメントでは、Goal の objective は空であってはならず、最大 4,000 文字までとされています。長い指示はファイルに書き、そのファイルを Goal から参照する方法が推奨されています。([OpenAI Developers][6])

たとえば、移行作業の詳細を `PLAN.md` に書きます。

```md title="PLAN.md"
# Migration plan

## Goal

Next.js 14 の App Router へ移行する。

## Scope

- `src/pages` 配下の主要画面を `src/app` へ移す
- APIレスポンス形式は変更しない
- 既存の認証フローは維持する

## Verification

- `pnpm lint` が成功する
- `pnpm test` が成功する
- `pnpm build` が成功する

## Report

最後に、変更したファイル、実行したコマンド、残った課題を報告する。
```

そのうえで、Codex には短く Goal を渡します。

```text
/goal PLAN.md に従って移行を進める。pnpm lint、pnpm test、pnpm build が成功するまで作業し、最後に変更ファイル、実行コマンド、残課題を報告する。
```

この書き方では、詳細な手順と検証条件をファイル側に置けます。Goal の入力欄は短く保ちつつ、Codex が読むべき文脈を明確にできます。

## 複雑な作業では先に/planを使う

Goal に入る前に、作業計画を整理したい場合は `/plan` を使います。OpenAI のベストプラクティスでは、複雑、曖昧、説明が難しいタスクでは、実装前に Codex に計画を作らせる方法が紹介されています。([OpenAI Developers][7])

たとえば、まず次のように計画を作らせます。

```text
/plan PLAN.md を読み、移行の実行順序、確認コマンド、リスクのある箇所を整理してください。まだ実装はしないでください。
```

Codex が計画を返したら、人間が内容を確認します。計画に問題がなければ、次のように Goal として実行に移します。

```text
/goal 承認したPLAN.mdの方針に従って移行を進める。各段階でpnpm lint、pnpm test、pnpm buildの結果を確認し、成功条件を満たしたら変更内容を報告する。
```

この流れにすると、最初から長時間作業に入るのではなく、作業範囲、検証方法、停止条件を確認してから Goal を開始できます。

## /goalを使うときの注意点

`/goal` は、すべての依頼に使うコマンドではありません。OpenAI のユースケースでは、Goal は「1つのプロンプトより大きいが、開かれたバックログよりは小さい」作業に向いていると説明されています。([OpenAI Developers][4])

たとえば、次のような Goal は広すぎます。

```text
/goal このリポジトリを良くする
```

この場合、何が終わりなのか判断できません。検証コマンドも、守るべき制約もありません。

次のように、作業範囲と確認方法を入れると実行しやすくなります。

```text
/goal src/api/orders.ts のN+1クエリを解消し、pnpm test orders と pnpm lint が成功する状態にする。APIレスポンスのJSON構造は変更しない。
```

また、Goal が有効でも、Codex の変更はレビューが必要です。特に長時間作業では、途中で `/goal` を確認し、必要に応じて `/goal pause` で止め、`/diff` やテスト結果を見てから続けると安全です。

## まとめ

`/goal` は、Codex に長い作業の達成条件を設定するためのコマンドです。通常のプロンプトが「次に何をするか」を指示するのに対し、Goal は「どの状態になれば完了か」をスレッドに持たせます。

基本の使い方は次のとおりです。

```text
/goal <objective>
/goal
/goal pause
/goal resume
/goal clear
```

実務で使うときは、Goal に結果、検証コマンド、制約、報告内容を含めます。長い指示は `PLAN.md` のようなファイルに分け、Goal から参照すると扱いやすくなります。

まずは、失敗しているテストを1つ直すような小さめの作業で試すのが現実的です。そのうえで、移行、リファクタリング、性能改善のような反復が必要な作業へ広げると、`/goal` の挙動を確認しながら使えます。

## 参考

* OpenAI Developers, “Codex CLI” ([OpenAI Developers][2])
* OpenAI Developers, “Slash commands in Codex CLI” ([OpenAI Developers][6])
* OpenAI Developers, “Follow a goal” ([OpenAI Developers][4])
* OpenAI Cookbook, “Using Goals in Codex” ([OpenAI Developers][1])
* OpenAI Developers, “Codex changelog” ([OpenAI Developers][3])

[1]: https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex "Using Goals in Codex"
[2]: https://developers.openai.com/codex/cli "CLI – Codex | OpenAI Developers"
[3]: https://developers.openai.com/codex/changelog "Changelog – Codex | OpenAI Developers"
[4]: https://developers.openai.com/codex/use-cases/follow-goals "Follow a goal | Codex use cases"
[5]: https://developers.openai.com/codex/config-basic "Config basics – Codex | OpenAI Developers"
[6]: https://developers.openai.com/codex/cli/slash-commands "Slash commands in Codex CLI | OpenAI Developers"
[7]: https://developers.openai.com/codex/learn/best-practices "Best practices – Codex | OpenAI Developers"
