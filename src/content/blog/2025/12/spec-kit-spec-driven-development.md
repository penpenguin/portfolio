---

title: 'Spec Kitとは何か：AIコーディングを「仕様」から整える、GitHub発のツールキット'
description: '生成AIでコードを書く時代に増えた「意図のズレ」を、仕様→計画→タスク→実装の流れで減らす。Spec Kitの考え方と使いどころ、導入のポイントを整理する。'
pubDate: 2025-12-25
tags: ['GitHub', 'AI開発', '仕様駆動開発', 'Spec Kit']
---

> [!NOTE]
> この記事はAIが書き、人間がレビューしています

## Spec Kitは「AIにうまく書かせる」ための、開発の型

Spec Kit（スペックキット）は、GitHubが公開しているオープンソースのツールキットです。狙いはシンプルで、AIコーディングの“それっぽいけど違う”を減らすこと。いきなりコードを吐かせて後から直すのではなく、まず仕様を作り、次に技術的な計画を立て、タスクに分解し、その順番で実装していく。いわば、AIに仕事を渡す前の「前さばき」を仕組みにしたものです。 ([GitHub][1])

GitHubの説明では、従来の「雰囲気（vibe）でプロンプトを投げてコードを得る」やり方だと、意図が欠けたり、アーキテクチャがズレたり、後になって気づく前提が増えやすい。そこで仕様を“生きた成果物”として扱い、段階ごとにレビューしてから次へ進む、という思想が前に出ています。 ([The GitHub Blog][2])

## 何が入っているのか：CLIとテンプレート、スラッシュコマンド

Spec Kitの入口は `specify` というCLIです。これでプロジェクトを初期化すると、AIエージェント（GitHub Copilot、Claude Code、Gemini CLI、Cursorなど）で使えるスラッシュコマンドと、仕様作成・計画・タスク分解のためのテンプレート一式がリポジトリに配置されます。 ([GitHub][1])

初期化後に増える代表的なものは、大きく2系統です。

ひとつは「常に参照される前提（プロジェクトの憲法）」です。Spec Kitではこれを **constitution** と呼び、品質基準、設計・実装の原則、チームの制約などをここに集めます。ワークフローの前提になる“強いルールファイル”として扱うのがポイントです。 ([martinfowler.com][3])

もうひとつは「機能単位の仕様群」です。例えば `.specify/specs/...` のような場所に、spec（要求・ユーザーストーリー）やplan（技術計画）などが、段階を追って増えていきます。テンプレートやスクリプトも同じく `.specify` 配下に入り、仕組みそのものがリポジトリ内に残ります。 ([GitHub][1])

## ワークフローの流れ：仕様→計画→タスク→実装（その前に憲法）

Spec Kitが用意するコアの流れは、だいたい次の順番です。

まず **Constitution**。プロジェクト全体の「こう作る」「これはやらない」を決めます。次に **Specify** で、作りたいものの“何を・なぜ”を文章で伝え、AIに仕様へ落とし込ませます。 ([GitHub][1])

仕様の段階で曖昧さが残りやすいので、Spec Kitは **Clarify**（曖昧な箇所を質問で詰める）も用意しています。計画の前に一度ここを通すと、後の手戻りが減りやすい、という位置づけです。 ([GitHub][1])

その上で **Plan**。ここで初めて技術スタック、アーキテクチャ、制約、既存システムとの整合などを与え、AIに技術計画を作らせます。次が **Tasks** で、実装可能な粒度へ分解。最後に **Implement** で、タスクに沿って実装を進めます。 ([The GitHub Blog][2])

大事なのは、GitHub自身が「あなたの役割は操縦だけでなく、検証だ」と明言している点です。各フェーズで成果物を読み、ズレを直し、次へ進む。Spec Kitは“自動化”というより“検証ポイントを強制する型”に近い、と捉えると誤解が減ります。 ([The GitHub Blog][2])

## どんなときに効くのか：向き・不向きがはっきりしている

GitHubの整理では、Spec Kitが特に役立つ場面として、新規開発（ゼロイチ）、既存システムへの機能追加、レガシー刷新が挙げられています。いずれも「作る前に前提を揃えないと破綻しやすい」領域です。 ([The GitHub Blog][2])

一方で、万能ではありません。Martin Fowler氏のレビューでは、spec-kit（Spec Kit）を試すと大量のMarkdown成果物が増え、問題のサイズによっては“ナットを割るのにスレッジハンマー”になりうる、という指摘があります。つまり小さな修正や単発のバグ潰しには重い可能性がある。ここは現場感覚としてかなり大事です。 ([martinfowler.com][3])

## 最小の導入手順：まずは動かして手触りを見る

細かな環境差はありますが、公式READMEに沿うと流れはこうです（前提として uv、Python 3.11+、Git が推奨されています）。 ([GitHub][1])

```bash
# 例：uvでCLIをインストール（推奨）
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# 新規プロジェクトを作成
specify init <PROJECT_NAME>

# 既存リポジトリに入れる場合（例）
specify init . --ai claude

# 必要ツールのチェック
specify check
```

初期化が済むと、AIエージェント側で `/speckit.specify` `/speckit.plan` のようなコマンドを叩ける状態になります（環境や解説記事によっては `/specify` `/plan` のように紹介されていることもあります）。 ([The GitHub Blog][2])

## 使いこなしのコツ：Spec Kitを「儀式」にしない

Spec Kitで詰まりやすいのは、プロセスを守ること自体が目的化する瞬間です。仕様は丁寧に書くべきですが、長く書けば正しくなるわけでもありません。むしろ、レビューしきれない分量になると、誤りを見落としやすくなります。Fowler氏の指摘にもある通り、チェックリストやテンプレートが増えても、AIが常に指示を守る保証はない。だからこそ、成果物のレビューを短いサイクルで回せるサイズに保つことが重要です。 ([martinfowler.com][3])

もうひとつのコツは、constitution（憲法）を欲張りすぎないことです。ここに“守ってほしいこと”を詰め込みすぎると、今度は現実の変更が追随できず、ルールが形骸化します。最初は「テストの扱い」「品質基準」「設計の大枠」「禁止事項」くらいに絞り、運用しながら育てるほうが、結果的に強い土台になりやすいはずです（このあたりはチームの成熟度で変わるので、断定は避けます）。 ([GitHub][1])

## まとめ：Spec Kitは“生成AIの出力”ではなく“意思決定の順番”を整える

Spec Kitは、AIでコードを書くこと自体を簡単にするツールというより、作る側の意図と制約を先に固定し、段階ごとに検証するための枠組みです。ハマる場面では強力ですが、小さな作業にまで常用すると重くなりやすい。まずは一つの機能追加など、スコープが見える仕事で試し、チームに合う粒度を探るのが現実的だと思います。 ([The GitHub Blog][2])

[1]: https://github.com/github/spec-kit "GitHub - github/spec-kit:  Toolkit to help you get started with Spec-Driven Development"
[2]: https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/ "Spec-driven development with AI: Get started with a new open source toolkit - The GitHub Blog"
[3]: https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html "Understanding Spec-Driven-Development: Kiro, spec-kit, and Tessl"
