---
title: 'React Doctorとは何か。Reactの健康診断をするCLIを読む'
description: 'millionco/react-doctor の役割、仕組み、使い方、CIでの注意点を、READMEとソースコードをもとに整理します。'
pubDate: 2026-03-06
tags: ['React', 'GitHub', 'CI/CD', '静的解析']
---

> [!NOTE]
> この記事はGPT-5.4 Proが書き、人間がレビューしています

# React Doctorとは何か

`millionco/react-doctor` は、Reactのコードベースをまとめて診断するためのCLIです。READMEでは「セキュリティ、性能、正しさ、アーキテクチャ」を一度に見て、0〜100のスコアと改善ポイントを返す道具として説明されています。MITライセンスで公開されており、GitHub Actionとしても使えます。 ([GitHub][1])

名前は軽いのですが、やっていることはかなり実務寄りです。ESLintのように単発の警告を並べるだけではなく、「このReactプロジェクトはいま、どれくらい健康か」をひと目でつかませる設計になっています。フレームワークやReactのバージョン、React Compilerの有無を見てから診断を走らせるので、ただのルール集より一段、文脈を読もうとしている道具です。 ([GitHub][2])

## 何を診ているのか

中身は大きく二本立てです。ひとつはLintで、READMEでは60以上のルールを使って state/effects、performance、architecture、bundle size、security、correctness、accessibility などを検査するとされています。もうひとつは dead code の検出で、未使用ファイル、未使用 export、未使用 type、重複 export まで拾います。スコアは診断結果の深刻度で重み付けされ、75点以上が Great、50〜74点が Needs work、50点未満が Critical という扱いです。 ([GitHub][2])

このへんをもう少し具体的に見ると、独自ルールには `no-fetch-in-effect`、`no-array-index-as-key`、`no-secrets-in-client-code` のようなものがあり、Next.js向けには `nextjs-no-img-element` や `nextjs-no-head-import`、React Native向けには `rn-no-raw-text` などが入っています。プロジェクト検出の側では Next.js、Vite、CRA、Remix、Gatsby、Expo、React Native などを見分ける実装になっていて、ルールの切り替えもその結果に応じて行われます。 ([GitHub][3])

言いかえると、React Doctorは「Reactでよく起きるまずさ」を、性能・設計・安全性までまとめて見ようとしている道具です。単に文法違反を探すのではなく、「それ、あとで重くなるよ」「その書き方だと保守がつらくなるよ」という種類の話まで拾いにいくところが、このリポジトリの持ち味です。 ([GitHub][2])

## どう使うのか

ローカルで試す入口は、READMEだとこの形です。 ([GitHub][2])

```bash
npx -y react-doctor@latest .
```

`--verbose` を付けると、どのファイルのどの行が問題なのかまで見やすくなります。さらに Node.js API も用意されていて、`react-doctor/api` から `diagnose()` を呼び出す使い方もできます。CLIだけの小道具ではなく、ほかの自動化に組み込みやすい形になっているわけです。 ([GitHub][2])

CIに入れるなら GitHub Action が用意されています。READMEの例はこうです。 ([GitHub][2])

```yaml
- uses: actions/checkout@v5
  with:
    fetch-depth: 0
- uses: millionco/react-doctor@main
  with:
    diff: main
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

ここで `fetch-depth: 0` が必要なのは、`--diff` で差分比較をするためです。`github-token` を渡せば `pull_request` でPRコメントも投稿でき、Actionの出力には `score` もあるので、後続ステップで使えます。 ([GitHub][2])

## このリポジトリの本当の役割

READMEの見出しだけを見ると「診断して直す」ツールに見えますが、実体としての中心は「診断」です。`--fix` はCLI自身が自前で一括書き換えするというより、Ami を開いて修正フローにつなぐ仕組みで、別途 `install-skill.sh` を使って coding agent に React Doctor のルールを教える導線も用意されています。つまりこのリポジトリは、静的解析そのものと、AIエージェントによる修正をつなぐ橋のような存在です。 ([GitHub][2])

ここは誤解しやすいところです。React Doctorだけで万能の自動修正器になる、というよりは、「どこが悪いかを機械にかなりうまく伝えるための共通フォーマット」をつくっている、と見たほうがしっくりきます。だからこそ、CLI、Action、Node API、agent向けスキルという複数の入口が同じリポジトリに並んでいます。 ([GitHub][1])

## 使う前に知っておきたいこと

便利ですが、いくつか癖があります。まず、スコアはあくまで要約です。READMEではエラーが警告より重く扱われると説明されており、ソースコード上でも score API への送信や、ローカル推定時のペナルティ設定が確認できます。数字は比較の目安としては優秀ですが、それだけで設計の善し悪しを断定するものではありません。 ([GitHub][2])

次に、差分スキャンの挙動は少し知っておいたほうがいいです。設定では `diff` を `false` にすると自動判定を切れますが、現在のCLIソースでは、プロンプトを出せない環境では変更ファイルだけのスキャンに寄る設計になっています。しかも API 側の実装を見ると、diff mode では dead code 検出は走りません。PRチェックには軽くて都合がいい一方、プロジェクト全体の棚卸しとは結果が変わります。 ([GitHub][2])

CIの失敗条件もローカルと同じではありません。CLIの `--fail-on` の既定値は `none` ですが、GitHub Action の `fail-on` は既定で `error` です。ローカルでは「警告が出た」で終わったものが、Actionではしっかり落ちることがあるので、この差は最初に合わせておいたほうが安心です。 ([GitHub][4])

もうひとつはスコア計算の扱いです。ソースコードでは score API の送信先が `www.react.doctor/api/score` になっており、CLIには `--offline` もあります。説明文では、このオプションはスコア算出のための匿名テレメトリをスキップするためのものとされ、オフライン時はスコアを計算しない挙動になっています。ネットワークを閉じたCIで使うなら、ここは先に理解しておくべき点です。 ([GitHub][5])

そして、2026年3月6日時点では README の Action 例が `@main` を使っており、タグとリリースのページを見ると公開タグは `0.0.1` です。実際、2026年2月23日の issue では、そのタグより後に `diff` や `github-token` などの機能が main に入っていると指摘されています。道具としては面白いぶん、運用するときは「main を追うか、安定版を待つか」をチームで決めておいたほうがよさそうです。 ([GitHub][2])

## どんな人に向いているか

React Doctorがいちばん合うのは、ReactやNext.jsのコードベースを、PR単位でも全体単位でも見たいチームです。モノレポで `--project` を切り替えたい人、PRコメントまで自動化したい人、あるいは coding agent に Reactの流儀をちゃんと教えたい人には、かなり相性がいいはずです。逆に、ESLintだけで十分に回っている小さなアプリなら、まずは既存のLint設定を詰めたほうが手堅い場面もあります。 ([GitHub][2])

## まとめ

`millionco/react-doctor` をひとことで言うなら、React向けの静的解析を「コード品質の健康診断」として再編集したプロジェクトです。Lint、dead code、フレームワーク検出、スコア化、CI連携、agent連携がひとつの流れにまとめられていて、いまのReact開発の空気にかなり合っています。万能薬ではありませんが、どこを直すべきかを早く、共有しやすく、機械にも渡しやすい形で出してくれる。その一点だけでも、このリポジトリの価値は十分あります。 ([GitHub][2])

[1]: https://github.com/millionco/react-doctor "GitHub - millionco/react-doctor: Let coding agents diagnose and fix your React code · GitHub"
[2]: https://raw.githubusercontent.com/millionco/react-doctor/main/packages/react-doctor/README.md "raw.githubusercontent.com"
[3]: https://raw.githubusercontent.com/millionco/react-doctor/main/packages/react-doctor/src/utils/discover-project.ts "raw.githubusercontent.com"
[4]: https://raw.githubusercontent.com/millionco/react-doctor/main/packages/react-doctor/src/cli.ts "raw.githubusercontent.com"
[5]: https://raw.githubusercontent.com/millionco/react-doctor/main/packages/react-doctor/src/constants.ts "raw.githubusercontent.com"
