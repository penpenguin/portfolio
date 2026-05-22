---
title: 'uvx / npx / npm exec を外部コード実行として安全に扱う'
description: '一時実行コマンドを使う前に、バージョン固定、lockfile、install script 無効化、CI 設定、隔離実行を確認する'
pubDate: 2026-05-22
tags: ['npm', 'uv', 'security', 'python', 'javascript']
impression: '最近流行りなので...'
---

> [!NOTE]
> この記事はGPT-5.5 Proが書き、人間がレビューしています

開発中に `npx create-...` や `uvx ruff` のようなコマンドを実行すると、手元にツールを明示的にインストールしなくてもすぐに CLI を使えます。これは便利ですが、見方を変えると、外部パッケージのコードを取得して実行している操作でもあります。

`npm exec` / `npx` は、ローカルにある npm パッケージ、またはリモートから取得した npm パッケージ由来のコマンドを実行できます。未導入のパッケージは npm cache 配下にインストールされ、その実行プロセスの `PATH` に追加されます。`uvx` は `uv tool run` のエイリアスで、Python パッケージの CLI を一時的な仮想環境に入れて実行します。([npmドキュメント][1])

この記事では、`uvx`、`npx`、`npm exec` を「一時実行」ではなく「外部コード実行」として扱い、最低限どの設定と手順を入れるべきかを説明します。SBOM、組織全体の権限設計、SLSA レベルの詳細までは扱わず、実際のコマンド実行時に確認できる設定と挙動に絞ります。

## まず何が実行されるのかを確認する

この節では、`npx`、`npm exec`、`uvx` の実行時に何が起きるかを整理します。先に挙動を押さえておくと、後続の設定が何を防ごうとしているのかが見えやすくなります。

npm 側では、たとえば次のようなコマンドがよく使われます。

```bash
npx some-tool
npm exec -- some-tool --help
npm exec --package=some-tool -- some-tool --help
```

このとき、対象のパッケージがローカルプロジェクトに存在しない場合、npm は必要なパッケージを npm cache 配下にインストールし、その実行プロセスの `PATH` に追加します。つまり、依存関係を `package.json` に追加していなくても、取得したパッケージ由来の実行ファイルが動きます。([npmドキュメント][1])

uv 側では、次のように実行します。

```bash
uvx ruff --version
uv tool run ruff --version
```

`uvx` と `uv tool run` は同じ挙動です。uv のドキュメントでは、ツールは一時的な仮想環境にインストールされ、`uvx` 実行時の環境は uv cache ディレクトリに置かれると説明されています。([Astral Docs][2])

ここで重要なのは、仮想環境や cache は Python / npm の依存関係を分離する仕組みであって、OS レベルでファイルアクセスや環境変数アクセスを遮断するサンドボックスではない、という点です。実行されたツールは、通常、そのプロセスの権限で読めるファイルや環境変数にアクセスできます。

## npm の基本設定を .npmrc に書く

ここでは、npm プロジェクトで最初に入れる設定を示します。目的は、インストール時のスクリプト実行、バージョン範囲による意図しない更新、公開直後のパッケージ取得を減らすことです。

プロジェクト直下に `.npmrc` を置きます。

```ini:.npmrc
ignore-scripts=true
save-exact=true
min-release-age=3
```

`ignore-scripts=true` は、`package.json` に定義された lifecycle script の実行を抑止します。ただし、`npm run`、`npm test`、`npm start` のように明示的にスクリプト実行を目的とするコマンドは実行されます。`save-exact=true` は、依存関係を追加するときに `^1.2.3` のような範囲指定ではなく、正確なバージョンを `package.json` に保存します。`min-release-age=3` は、公開から指定日数を超えたバージョンだけを解決候補にします。([npmドキュメント][3])

設定後に依存関係を追加すると、次のような差分になります。

```bash
npm install lodash
```

`save-exact=true` が有効な場合、`package.json` には次のように記録されます。

```json:package.json
{
  "dependencies": {
    "lodash": "4.17.21"
  }
}
```

ここで確認する点は、バージョンの前に `^` が付いていないことです。これにより、lockfile を更新するときに、意図せず互換範囲内の新しいバージョンへ進む範囲を狭められます。

より厳しくする場合は、Git 依存、URL 依存、ローカル tarball、ローカルディレクトリ依存も制限します。

```ini:.npmrc
ignore-scripts=true
save-exact=true
min-release-age=3

allow-git=root
allow-remote=root
allow-file=root
allow-directory=root
```

`root` は、プロジェクトの `package.json` に直接定義された依存だけを許可する設定です。`none` にするとさらに厳しくできますが、monorepo や社内パッケージでローカル依存を使っている場合は壊れる可能性があります。まず CI で検出し、必要な例外だけを明示するほうが導入しやすいです。([npmドキュメント][3])

## npx / npm exec はバージョンを固定して実行する

この節では、npm パッケージ由来の CLI を一時実行するときの書き方を確認します。基本方針は、パッケージ名だけで実行せず、バージョンと実行コマンドを明示することです。

避けたい形は次のような実行です。

```bash
npx some-tool
npx some-tool@latest
npm exec -y some-tool
```

この書き方では、どのバージョンのコードを実行するかが実行時の registry 状態に依存しやすくなります。また、`-y` / `--yes` は確認プロンプトを抑制するための指定であり、安全性を上げる指定ではありません。

最低限、次のように `--package` でパッケージとバージョンを固定します。

```bash
npm exec --package=some-tool@1.2.3 -- some-tool --help
```

このコマンドでは、`some-tool@1.2.3` を実行環境に用意し、`--` 以降を実際のコマンドとして扱います。`npm exec` では、`--package` で指定したパッケージが実行プロセスの `PATH` に提供されます。未導入パッケージは npm cache 配下に置かれます。([npmドキュメント][1])

同じツールを継続的に使う場合は、一時実行ではなく dev dependency として固定するほうが確認しやすくなります。

```bash
npm install --save-dev some-tool@1.2.3
npm exec -- some-tool --version
```

この場合、`package.json` と `package-lock.json` に依存関係が残ります。レビュー時には、追加されたパッケージ名、バージョン、lockfile の差分、install script の有無を確認できます。

## CI では npm ci と署名検証を使う

CI では、依存関係をその場で解決し直すのではなく、lockfile に従って再現性のあるインストールを行います。npm の場合は `npm install` ではなく、原則として `npm ci` を使います。

```bash
npm ci --ignore-scripts
npm audit signatures
```

`npm ci` は `package-lock.json` または `npm-shrinkwrap.json` が存在することを前提にし、`package.json` と lockfile の依存関係が一致しない場合は失敗します。また、既存の `node_modules` はインストール前に削除され、`package.json` や lockfile には書き込みません。([npmドキュメント][4])

`npm audit signatures` は、ダウンロードしたパッケージの registry signatures と provenance attestations を検証するためのコマンドです。すべてのパッケージに provenance があるとは限りませんが、改ざん検知と公開元確認の材料になります。([npmドキュメント][5])

install script が必要なパッケージがある場合は、全体で `ignore-scripts=false` に戻すのではなく、例外を明示して扱います。たとえば、ネイティブバイナリの再構築が必要な場合は、対象パッケージ、必要な理由、実行するタイミングを CI 設定上で分けます。

```bash
npm ci --ignore-scripts

# 必要なパッケージだけ、理由を確認したうえで実行する
npm rebuild some-native-package
```

この形にすると、「すべての依存関係の install script を実行する」のではなく、「必要なパッケージだけを意識的に実行する」という状態にできます。

## uvx は --isolated、--no-build、--exclude-newer を組み合わせる

この節では、Python パッケージ由来の CLI を `uvx` で実行する場合の書き方を示します。npm 側と同じく、基本はバージョン固定です。

避けたい形は次のような実行です。

```bash
uvx some-command
uvx some-command@latest
```

安全寄りにする場合は、パッケージ、バージョン、設定読み込み、build の扱い、公開直後の配布物の扱いを明示します。

```bash
uvx \
  --isolated \
  --no-config \
  --no-env-file \
  --no-build \
  --exclude-newer '3 days' \
  --from 'some-package==1.2.3' \
  some-command --help
```

`--from` は、コマンド名とパッケージ名が異なる場合や、より複雑なバージョン指定をしたい場合に使います。`--isolated` は、すでにインストール済みの tool を無視して隔離された仮想環境で実行します。`--no-config` は `pyproject.toml` や `uv.toml` の探索を避け、`--no-env-file` は `.env` の読み込みを避けます。`--exclude-newer` は、指定した時点より新しい配布物を候補から外します。([Astral Docs][6])

`--no-build` は特に重要です。uv のドキュメントでは、このオプションを有効にすると source distribution を build せず、解決時に任意の Python コードを実行しないと説明されています。build が必要な配布物しかない場合は、処理がエラーになります。([Astral Docs][6])

ただし、`--no-build` は build 時のコード実行を抑えるための設定です。実行対象の CLI 自体が悪意ある処理を行う場合、その実行を止めるものではありません。そのため、未信頼ツールを実行する場合は、後述するように secrets のない環境で実行する必要があります。

## uv プロジェクトでは lockfile の更新を止めて実行する

`uvx` は単体ツールの一時実行に向いています。一方で、プロジェクト内のテストや formatter を実行する場合は、`uv run` と lockfile を使って、依存関係の更新を制御します。

CI では次のように確認します。

```bash
uv lock --check
uv sync --locked --no-build
uv run --locked --exact pytest
```

`uv lock --check` は lockfile がプロジェクトメタデータと一致しているかを確認します。`--locked` は、lockfile が古い場合に自動更新せずエラーにします。`uv sync` はデフォルトで exact sync を行い、lockfile に存在しない余分なパッケージを削除します。一方で、`uv run` はデフォルトでは inexact sync なので、余分なパッケージも削除したい場合は `--exact` を付けます。([Astral Docs][7])

実行後に見るべき点は、`uv.lock` が CI 内で変更されていないことです。CI の途中で lockfile が更新される状態だと、レビュー済みの依存関係と実際に使われた依存関係がずれます。

private index を使う場合は、dependency confusion も確認します。uv はデフォルトで `first-index` を使い、最初に該当パッケージが見つかった index の候補だけを使うため、同名パッケージが別 index にある場合の混乱を抑えます。`unsafe-best-match` は全 index の候補から最適なものを選ぶため、dependency confusion のリスクを高めます。([Astral Docs][8])

## 一時実行は secrets のない環境で行う

この節では、コマンドの書き方だけでは防げない範囲を扱います。`npx` や `uvx` で実行されるツールは、通常のプロセスとして動きます。そのため、環境変数、SSH key、cloud credential、作業ディレクトリ内のファイルにアクセスできる可能性があります。

手元で試す場合は、最低限、作業ディレクトリと環境変数を絞ります。

```bash
mkdir -p .tmp-home

env -i \
  HOME="$PWD/.tmp-home" \
  PATH="$PATH" \
  npm_config_ignore_scripts=true \
  npm exec --package=some-tool@1.2.3 -- some-tool --help
```

この例では、環境変数をいったん空にし、`HOME` を一時ディレクトリへ向けています。実行後は `.tmp-home` に何が作られたかを確認できます。

```bash
find .tmp-home -maxdepth 3 -type f
```

コンテナを使う場合も、ホストの secrets を渡さないことが前提です。

```bash
docker run --rm -it \
  -v "$PWD:/work:ro" \
  -w /work \
  -e HOME=/tmp/home \
  -e npm_config_ignore_scripts=true \
  node:22-bookworm \
  npm exec --package=some-tool@1.2.3 -- some-tool --help
```

ここでは、カレントディレクトリを read-only でマウントし、`HOME` をコンテナ内の一時ディレクトリにしています。実行対象がネットワークや書き込みを必要とする場合は、必要な権限を個別に足します。逆に、Docker socket、SSH agent、cloud credential、GitHub token を安易に渡さないことが重要です。

## パッケージ公開側では長期トークンを減らす

ここまでは利用側の話でした。パッケージを公開している場合は、公開用トークンの扱いも見直します。npm の Trusted Publishing は OIDC を使って CI/CD workflow から npm パッケージを公開し、長期 npm token を不要にする仕組みです。([npmドキュメント][9])

Python / PyPI 側でも、Trusted Publisher を使うことで、GitHub Actions などの CI が発行する短命の OIDC token をもとに PyPI へ公開できます。([PyPI ドキュメント][10])

これは利用側の `npx` や `uvx` のリスクを直接なくすものではありません。しかし、公開元の CI から長期トークンが漏えいし、悪性バージョンが公開されるリスクを下げるうえで重要です。

2025 年の Nx “s1ngularity” 事件では、GitHub Actions の injection vulnerability を経由して npm publishing token が盗まれ、複数の悪性 Nx パッケージが npm に公開されました。悪性パッケージは利用者環境の機密情報を探索し、GitHub repository へアップロードしたと報告されています。([Nx][11])

## 疑わしいパッケージを実行したあとに確認する

この節では、すでに疑わしい `npx`、`npm exec`、`uvx` を実行してしまった場合の確認手順を整理します。単に `node_modules` を消すだけでは不十分です。

まず、該当パッケージとバージョンを特定します。

```bash
npm ls some-package
npm cache verify
uv cache dir
```

npm 側で `npx` 経由の cache を消す場合は、次のようにします。

```bash
npm cache clean --force
rm -rf ~/.npm/_npx
```

uv 側は、cache を確認してから削除します。

```bash
uv cache dir
uv cache clean
```

次に、漏えいした可能性がある credential をローテーションします。GitHub token、npm token、PyPI token、cloud key、SSH key、CI secret は、実行環境に存在していたものから優先して確認します。Nx の advisory でも、影響を受けた場合は GitHub、npm、環境変数に含まれていた credential のローテーション、npm cache や `_npx` cache の削除、`.zshrc` と `.bashrc` の確認が案内されています。([GitHub][12])

最後に、lockfile を安全な版へ戻します。このとき、単に再生成するのではなく、差分を確認します。

```bash
git checkout -- package-lock.json
git diff -- package-lock.json

git checkout -- uv.lock
git diff -- uv.lock
```

lockfile の差分を見ると、どのパッケージが増えたか、どのバージョンへ変わったか、想定外の registry や URL 依存が入っていないかを確認できます。

## 実務で使う最小チェックリスト

ここまでの設定を、実行前に確認する項目としてまとめます。

| 観点            | 確認すること                                                  |
| ------------- | ------------------------------------------------------- |
| バージョン         | `@latest` ではなく、具体的なバージョンを指定しているか                        |
| lockfile      | `package-lock.json` や `uv.lock` の差分をレビューしているか           |
| scripts       | npm の install script を原則止め、例外を明示しているか                   |
| release age   | 公開直後のバージョンを避ける設定を入れているか                                 |
| 実行環境          | secrets のない環境、またはコンテナで実行しているか                           |
| cache         | npm cache、`~/.npm/_npx`、uv cache の扱いを把握しているか            |
| private index | uv の `first-index` を維持し、安易に `unsafe-best-match` にしていないか |
| 公開側           | npm / PyPI の Trusted Publishing を検討しているか                |

この表で特に重要なのは、バージョン固定、install script 抑止、secrets の分離です。`npx` や `uvx` は便利な起動方法ですが、実行されるのは外部パッケージのコードです。`curl | sh` と同じくらい慎重に扱う、と考えると判断を誤りにくくなります。

## まとめ

`uvx`、`npx`、`npm exec` は、依存関係を手軽に試すための便利なコマンドです。しかし、実際には外部パッケージを取得し、そのパッケージ由来のコードを実行しています。

npm では、まず `.npmrc` に `ignore-scripts=true`、`save-exact=true`、`min-release-age=3` を入れます。CI では `npm ci --ignore-scripts` と `npm audit signatures` を使い、lockfile に従った再現性のあるインストールを行います。

uv では、`uvx` を `uv tool run` と同じ外部コード実行として扱い、`--isolated`、`--no-config`、`--no-env-file`、`--no-build`、`--exclude-newer`、`--from パッケージ==バージョン` を必要に応じて組み合わせます。uv プロジェクトでは、`uv lock --check`、`uv sync --locked --no-build`、`uv run --locked --exact` で lockfile の更新を制御します。

最終的には、コマンドの形だけでなく、実行環境も重要です。未信頼の一時実行は、GitHub token、cloud key、SSH key、npm token、PyPI token がない環境で実行します。実行後に不審な挙動があった場合は、cache の削除だけでなく、credential のローテーションと shell 設定の確認まで行います。

## 参考

* npm Docs: `npm exec` / `npx` の挙動 ([npmドキュメント][1])
* npm Docs: `npm ci` ([npmドキュメント][4])
* npm Docs: `npm install` の設定項目 ([npmドキュメント][3])
* npm Docs: provenance attestations と `npm audit signatures` ([npmドキュメント][5])
* uv Docs: Tools / `uvx` / `uv tool run` ([Astral Docs][2])
* uv Docs: CLI options for `uv tool run` ([Astral Docs][6])
* uv Docs: Locking and syncing ([Astral Docs][7])
* uv Docs: Package indexes and `first-index` ([Astral Docs][8])
* npm Docs: Trusted Publishing ([npmドキュメント][9])
* PyPI Docs: Trusted Publishers ([PyPI ドキュメント][10])
* Nx Blog: S1ngularity postmortem ([Nx][11])
* GitHub Advisory: malicious Nx versions and remediation ([GitHub][12])

[1]: https://docs.npmjs.com/cli/v8/commands/npm-exec/?utm_source=chatgpt.com "npm-exec"
[2]: https://docs.astral.sh/uv/concepts/tools/ "Tools | uv"
[3]: https://docs.npmjs.com/cli/v11/commands/npm-install/ "npm-install | npm Docs"
[4]: https://docs.npmjs.com/cli/v11/commands/npm-ci/ "npm-ci | npm Docs"
[5]: https://docs.npmjs.com/generating-provenance-statements/ "Generating provenance statements | npm Docs"
[6]: https://docs.astral.sh/uv/reference/cli/ "Commands | uv"
[7]: https://docs.astral.sh/uv/concepts/projects/sync/ "Locking and syncing | uv"
[8]: https://docs.astral.sh/uv/concepts/indexes/ "Package indexes | uv"
[9]: https://docs.npmjs.com/trusted-publishers/ "Trusted publishing for npm packages | npm Docs"
[10]: https://docs.pypi.org/trusted-publishers/ "Getting Started - PyPI Docs"
[11]: https://nx.dev/blog/s1ngularity-postmortem "S1ngularity - What Happened, How We Responded, What We Learned | Nx Blog"
[12]: https://github.com/nrwl/nx/security/advisories/GHSA-cxm3-wv7p-598c "Malicious versions of Nx and some supporting plugins were published · Advisory · nrwl/nx · GitHub"
