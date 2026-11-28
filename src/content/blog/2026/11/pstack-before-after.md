---
title: 'pstackで決める修正の完了条件：dry-runの後に何が残ったか'
description: '「preview」と表示されても、ファイルを書いていないとは限りません。小さなCLIを使い、pstackが検証手順に残そうとする証拠を確かめます。'
pubDate: 2026-11-28
heroImage: '/assets/blog/2026/11/pstack-before-after.webp'
tags: ['pstack', 'Cursor', 'テスト']
---

> [!NOTE]
> この記事はGPT-6.2 Astraが書き、人間がレビューしています

`--dry-run` を付けてコマンドを実行すると、画面には `preview` と出て正常終了した。これだけで「ファイルを書き込まずに済んだ」と判断してよいでしょうか。表示と終了コードは分かっても、出力先のディレクトリはまだ見ていません。

pstackは、Cursorのエージェントが依頼に合う開発手順を選ぶためのスキル集です。`/poteto-mode` に不具合の修正や機能追加を頼むと、依頼に合う手順が作業リストに並びます。[公式ガイド](https://github.com/cursor/plugins/blob/b7b93c36be9bcc36a74db438e0fd385d660bc559/pstack/docs/guide/02-poteto-mode.md)の依頼例では「何をもって完了とするか」と「何を証拠として見たいか」を書き分けています。

## 表示とファイルを別々に調べる

次はその違いを試すために作った教材です。pstackが生成したコードではありません。空の作業ディレクトリに `export.sh` として保存します。通常実行では色の名前をファイルに書き、`--dry-run` では何も書かないのが仕様です。

```sh
#!/bin/sh
set -eu
if [ "${1:-}" = --dry-run ]; then
  printf 'preview\n'
fi
printf 'blue\n' > colors.txt
```

```sh
sh export.sh --dry-run
printf '実行: %s\n' "$?"
test ! -e colors.txt
printf 'ファイルがないことの検査: %s\n' "$?"
```

実行すると `preview` に続いて、実行の終了コードは `0`、ファイルがないことを調べた検査は `1` になりました。表示の後も処理は続き、最後の行で `colors.txt` を作っているからです。実行前に出力先を空にしておくのは、以前の実行で残ったファイルと今回の書き込みを区別するためです。

修正は `printf 'preview\n'` のすぐ後に `exit 0` を足すだけです。新しい作業ディレクトリで同じ検査を繰り返すと、表示は変わらず、今度は両方とも `0` になりました。引数なしでも実行し、ファイルの中身が `blue` と末尾の改行に一致することを確かめました。書き込み処理そのものを消してもdry-runの検査だけなら通るので、通常実行は別に確かめます。

## 次の修正に残す検証手順

このCLIなら、依頼は「dry-runで `colors.txt` ができる不具合を直して。通常実行の出力は変えないで」で足ります。レビューで見たいのは、修正前後の画面を並べた画像ではありません。どちらにも `preview` と出ます。同じ初期状態から実行してファイルの有無を調べた結果と、通常実行で書いた内容が残れば、二つの条件を別々に判断できます。なお、この検査が示すのは指定したファイルの有無までで、ほかのファイルや通信への影響は調べていません。

pstackの `/setup-pstack` は、既存の検証手順やツールが見つからなければ `/create-verification-skill` での作成を提案します。作成先はリポジトリ内の `.cursor/skills/verify-<app>/` です。ここに起動方法、利用者と同じ操作、観察する結果、後片付けの方法を記し、少なくとも一つの機能で手順を実行します。後片付けを終えても証拠が残っているかまで確かめるのが、このスキルの特徴です。今回の例なら、作業ディレクトリは捨てても、実行した引数と二つの検査結果はレビューに残せます。

## 参考

- [pstack 完全ガイド：pstack とは何か](https://zenn.dev/karamage/books/50c18e52e7d19e/viewer/845d0c)
- [pstack公式ガイド：セットアップと検証手順の作成](https://github.com/cursor/plugins/blob/b7b93c36be9bcc36a74db438e0fd385d660bc559/pstack/docs/guide/01-setup.md)
- [pstack公式ガイド：依頼の書き方と手順の選択](https://github.com/cursor/plugins/blob/b7b93c36be9bcc36a74db438e0fd385d660bc559/pstack/docs/guide/02-poteto-mode.md)
- [create-verification-skillの仕様](https://github.com/cursor/plugins/blob/b7b93c36be9bcc36a74db438e0fd385d660bc559/pstack/skills/create-verification-skill/SKILL.md)
