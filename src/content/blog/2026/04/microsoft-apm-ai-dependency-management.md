---
title: 'microsoft/apmを触ってみて見えたこと。AI設定を「属人化」から「依存管理」に戻す'
description: 'Agent Package Manager を追いながら、使ってみて感じた手応えと、これから複数プロジェクトをどう管理していくかを整理する。'
pubDate: 2026-04-16
tags: ['APM', 'AI開発', 'GitHub', 'プロジェクト管理']
---

> [!NOTE]
> この記事はGPT-5.4 Proが書き、人間がレビューしています

# microsoft/apmを見て、ようやく「AIの設定も依存関係だよな」と思えた

`microsoft/apm` は、AIエージェント向けの設定を依存管理するためのツールだ。`apm.yml` に instructions、skills、prompts、agents、hooks、plugins、MCP servers などをまとめて書き、`apm install` で各ツールが読む場所へ配る。公式はこれを「AIエージェント向けの `package.json` や `requirements.txt` のようなもの」と説明していて、Copilot、Claude Code、Cursor、OpenCode、Codex などをひとつのマニフェストから扱えるようにしている。しかも MIT ライセンスのオープンソースで、公式自身が「まだ early days」と書いている。2026年4月16日時点の最新リリースは v0.8.11 だ。 ([Microsoft GitHub][1])

これを見て、いちばん腑に落ちたのは、AIの使い方そのものより「AIに何を覚えさせ、どこで効かせるか」をちゃんと管理対象に戻そうとしているところだった。これまでは、だれかの `CLAUDE.md` を真似したり、`.github/` に instructions を置いたり、Slack に貼られたプロンプトをコピペしたり、かなり人づてだった。APM はそこを「リポジトリに置かれた宣言」と「再現できるインストール」に置き換えようとしている。 ([Microsoft GitHub][1])

## 使ってみてよかったのは、設定の話がやっとチームの話になること

触ってみて最初に感じたのは、AI設定が個人の工夫から、チームでレビューできる変更に変わる気持ちよさだった。新しい人が入ったら `git clone` して `apm install` を実行すれば、同じ設定が手元に来る。`apm.lock.yaml` をコミットしておけば、開発者の端末でも CI でも同じ構成を再現できる。オンボーディングが楽になるというより、「何が正解の設定か」がリポジトリに残るのが大きい。 ([Microsoft GitHub][2])

もうひとつよかったのは、ツールごとの作法の違いを、ある程度吸収してくれるところだ。Copilot や Claude Code にはネイティブに展開し、Cursor や OpenCode にも対応しつつ、Codex や Gemini のように単一の指示ファイルを読むツールには `apm compile` で `AGENTS.md` や `GEMINI.md` を生成できる。つまり「このチームは Claude、あのチームは Copilot、個人では Codex も使う」という現実を、無理にひとつへ寄せなくていい。ここはかなり実務向きだと思った。 ([Microsoft GitHub][3])

しかも、これは独自ランタイムを常駐させる道具ではない。公式は、APM は各ツールが読むネイティブな設定ファイルを生成して終わるもので、デーモンでもバックグラウンドプロセスでもない、と説明している。やめたくなったら、生成済みの設定はそのまま残る。ここが「便利そうだけど閉じた仕組みなんじゃないの」と身構えなくていい理由になっている。 ([Microsoft GitHub][4])

## ちゃんとしているのは、便利さよりむしろ再現性と安全性だと思う

APM の本体は、派手な自動化というより、かなり地味なガードレールにある。依存関係は `apm.lock.yaml` に exact commit SHA で記録されるし、継続インストール時には content hash も照合する。しかも APM は中央レジストリを使わず、git リポジトリを直接参照する設計になっている。レジストリ汚染の面をひとつ消しているのは、地味だけれど大事だ。 ([Microsoft GitHub][5])

さらにおもしろいのは、公式が「プロンプト供給網は普通のパッケージマネージャと違う」とかなりはっきり書いている点だ。`npm install` なら、インストール後に監査やレビューを挟める。でも AI 向けの instructions や prompts は、ファイルが置かれた瞬間に IDE 側が読み始めることがある。だから APM は `apm install` の途中で hidden Unicode などを先にスキャンし、きれいなら配り、危険なら止める。発想として筋が通っている。 ([Microsoft GitHub][5])

## ただし、まだ「全部これで解決」とは思わない

一方で、まだ若い道具でもある。公式も早いペースで進化中だと明記しているし、実際に 2026年4月上旬だけでも v0.8.10 から v0.8.11 へ更新されている。機能の成熟度に差があるところもある。たとえば Agent Workflows は experimental 扱いだし、user-scope のインストールも target ごとに対応範囲が揃っているわけではなく、MCP は user-scope ではまだ未対応だ。ここは導入前に期待値を揃えておいたほうがいい。 ([Microsoft GitHub][1])

だから、APM を「AIが賢くなる道具」と見るより、「AI設定をレビュー可能にして、履歴に残し、複数ツールへ配る配線」と見るほうがしっくりくる。そこを見誤らなければ、かなり使い道がある。逆に、ここに過剰な魔法を期待すると、ちょっと肩すかしになるかもしれない。 ([Microsoft GitHub][4])

## これから複数プロジェクトをどう管理するか

私なら、今後の複数プロジェクト運用は「個人」「組織」「プロジェクト」の三層で分ける。APM のドキュメントも、組織全体の shared package、チーム固有の package、プロジェクト固有の context という三層構成を前提にしている。新しい開発者が `apm install` ひとつで必要な積み上がりを取れる、という考え方は、この三層でいちばん効く。 ([Microsoft GitHub][4])

まず個人レイヤーでは、`apm install -g` を使って、自分だけが使う commands や agents や skills を置くのがよさそうだ。公式も、personal commands や skills は user-scope、チーム共有の instructions や prompts は project-scope と整理している。ここは素直に従ったほうがいい。個人の便利道具まで全部リポジトリに入れると、逆にノイズになる。 ([Microsoft GitHub][6])

組織レイヤーでは、共通ルールをひとつの大きな塊にしないことが大事だと思う。公式の Org-Wide Packages ガイドも、`security-baseline`、`coding-standards`、`review-agents` のように関心ごとごとに分ける構成を勧めている。タグでバージョンを切り、利用側は `@v1.0.0` や `@v1` のようにピン留めし、更新が必要なときだけ `apm deps update` で取り込む。このやり方なら、「全社標準を配る」と「各プロジェクトが自分のタイミングで上げる」を両立しやすい。しかも lockfile 側では exact commit SHA まで固定されるので、CI では常に同じ状態を再現できる。 ([Microsoft GitHub][7])

プロジェクトレイヤーでは、各リポジトリの `.apm/` を最後の調整弁にするのが自然だ。公式には、ローカルの `.apm/` は依存パッケージより優先され、衝突時の優先順位も project-local、direct dependency、transitive dependency の順だとある。つまり「会社の標準は尊重するが、このリポジトリだけは例外がある」という現実を、無理なく表現できる。標準を壊さず、現場の事情も潰さない。ここが APM のいちばん実務的なところかもしれない。 ([Microsoft GitHub][8])

開発中の共有 package については、ローカルパス依存を使ってすばやく回すのがよさそうだ。APM は `./packages/...` のような local path dependencies を認めていて、monorepo やローカル開発での反復に向いている。ただし、`apm pack` では local path dependencies を含む package は配れないし、user-scope でも local path は使えない。なので、育てている間はローカル、配る段階でリモート参照とタグに切り替える、という運用がきれいだと思う。これは公式仕様から見た、かなり素直な流れだ。 ([Microsoft GitHub][6])

## 最後は CI で締める

複数プロジェクトに広げるなら、最後は人の善意ではなく CI で閉じたほうがいい。APM には `apm audit --ci` があり、baseline で 6 つの整合性チェックを回せる。さらに `--policy org` をつけると、組織の `.github` リポジトリに置いた `apm-policy.yml` を自動発見して、追加の 16 チェックを走らせられる。SARIF 出力もできるので、GitHub Code Scanning とつなぎやすい。required check にしておけば、「設定はあるけど守られていない」をかなり減らせるはずだ。 ([Microsoft GitHub][9])

## いまの結論

APM の価値は、プロンプトを増やすことではなく、AI設定をコードと同じように「宣言して、ロックして、配って、監査する」流れに戻してくれるところにある。複数プロジェクト間の管理でも、まずは小さく始めるのがよさそうだ。最初の一歩は、全社向けの `security-baseline` package をひとつ作ること。その次にチーム別 package を足す。そして最後に、各プロジェクトの `.apm/` で調整する。たぶんこの順番が、いちばん無理がない。 ([Microsoft GitHub][7])

[1]: https://microsoft.github.io/apm/ "APM – Agent Package Manager | Agent Package Manager"
[2]: https://microsoft.github.io/apm/getting-started/quick-start/?utm_source=chatgpt.com "Quick Start | Agent Package Manager"
[3]: https://microsoft.github.io/apm/introduction/how-it-works/?utm_source=chatgpt.com "How It Works | Agent Package Manager"
[4]: https://microsoft.github.io/apm/enterprise/teams/ "APM for Teams | Agent Package Manager"
[5]: https://microsoft.github.io/apm/enterprise/security/ "Security Model | Agent Package Manager"
[6]: https://microsoft.github.io/apm/guides/dependencies/ "Dependencies | Agent Package Manager"
[7]: https://microsoft.github.io/apm/guides/org-packages/ "Org-Wide Packages | Agent Package Manager"
[8]: https://microsoft.github.io/apm/reference/cli-commands/?utm_source=chatgpt.com "CLI Commands | Agent Package Manager"
[9]: https://microsoft.github.io/apm/guides/ci-policy-setup/ "CI Policy Enforcement | Agent Package Manager"
