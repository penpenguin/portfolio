---
title: 'hf downloadで保存するファイルとrevisionを固定する'
description: 'Hugging Face CLIでWhisperの小さなファイルを取得し、dry-runの件数、保存先、revisionの意味を確かめる。保存できたことと推論できることを分けて考える。'
pubDate: 2026-11-17
heroImage: '/assets/blog/2026/11/hf-download-pinned-files.webp'
tags: ['Hugging Face', 'CLI', 'ローカルAI']
---

> [!NOTE]
> この記事はGPT-6 Astraが書き、人間がレビューしています

Hugging Faceのモデルを手元に保存するとき、`hf download`にリポジトリ名だけを渡すと、そのリポジトリの全ファイルが取得対象になります。必要なファイルを絞るには`--include`、取得する時点を固定するには`--revision`を使います。容量だけでなく「何を保存したか」を後から確かめるための指定です。

## 小さなファイルで保存を試す

以下はダウンロードの動作を確かめるために組んだ例です。音声認識モデル`openai/whisper-large-v3-turbo`から、説明書の`README.md`と設定の`config.json`だけを取得します。重みは含まないので、この例だけで音声認識はできません。

2026年11月17日に、macOSと`huggingface_hub` 1.33.0のCLIで実行しました。`hf`が使える環境と、まだ存在しない保存先を前提にします。CLIは`huggingface_hub`パッケージに含まれ、利用中のバージョンは`hf version`で確認できます。

```bash
REPO=openai/whisper-large-v3-turbo
REV=41f01f3fe87f28c78e2fbf8b568835947dd65ed9

hf download "$REPO" \
  --revision "$REV" \
  --include README.md --include config.json \
  --local-dir ./whisper-metadata --dry-run
```

`REV`は実行時にHub APIで確認した完全なコミットハッシュです。ブランチ名の`main`は更新されますが、この指定なら同じコミットのファイルを選べます。ただし、将来も配布元から取得できるという保証にはなりません。

初回の出力には、次の件数とファイル名が並びました。

```text
[dry-run] Will download 2 files (out of 2) totalling 22.5K.
file       size
README.md  21.2K
config.json 1.3K
```

表示の空白は読みやすく整えています。`--dry-run`は取得対象とダウンロード予定量を確認する指定で、この段階ではファイル本体を保存しません。予定が合っていれば、同じ条件から`--dry-run`だけを外します。

```bash
hf download "$REPO" \
  --revision "$REV" \
  --include README.md --include config.json \
  --local-dir ./whisper-metadata
```

保存された本体はREADMEが21,196バイト、設定が1,256バイトで、合計22,452バイトでした。`--local-dir`の保存先には取得元のディレクトリ構造が保たれ、更新確認用のメタデータは`.cache/huggingface/`に作られます。この本体サイズにはメタデータを含めていません。

## dry-runの「0件」を読み分ける

保存後に最初のdry-runを繰り返すと、次の表示になりました。

```text
[dry-run] Will download 0 files (out of 2) totalling 0.0.
```

対象は2ファイルのままですが、追加で取得するファイルは0件です。一方、同じリポジトリに、存在しない形式のフィルターを指定した場合はどうなるでしょうか。

```bash
hf download "$REPO" \
  --revision "$REV" \
  --include '*.gguf' \
  --local-dir ./whisper-metadata --dry-run
```

```text
[dry-run] Will download 0 files (out of 0) totalling 0.0.
No results found.
```

この実行も終了コードは0でした。こちらは保存済みだから省略したのではなく、条件に一致するファイルが指定したコミットになかった結果です。**終了コードと追加取得数だけでは、必要なファイルを保存できたか判断できません**。 `out of`の対象数とファイル名を、保存したい一覧と照合する必要があります。

`--include`はファイル名のパターンを選ぶ機能であり、形式を変換する機能ではありません。また、`*.json`のような広い指定ではサブディレクトリのファイルも対象になり得ます。まずdry-runで一覧を読み、意図しない形式や別用途のファイルまで含まれていないか確かめると、不要な取得を避けられます。

## モデル本体の保存へ進む前に

ここまでで確かめたのは、特定コミットの2ファイルを保存する動作です。Whisperの公式モデルカードでは、推論時にモデルと`AutoProcessor`を読み込み、トークナイザーと特徴抽出器を使っています。重みだけを残せば同じ手順を再現できる、と考えるのは早計です。

実際に保存する場合は、使う推論ライブラリの読み込み手順から必要ファイルを決め、その一覧とコミットハッシュを取得コマンドと一緒に残すのがよいでしょう。READMEやライセンス文書も保存対象に含め、別の作業ディレクトリからローカルのファイルだけで読み込めるかを確認すると、保存漏れを見つけやすくなります。この例では推論やオフライン動作までは検証していません。

アクセス申請が必要なgated modelは、承認とCLIの認証を済ませてから取得する仕組みです。ダウンロードの可否と利用条件は別に確認してください。手元にファイルがあることだけを根拠に、再配布や商用利用まで許可されているとは判断できません。

## 参考

- [Download files from the Hub](https://huggingface.co/docs/huggingface_hub/guides/download)
- [Hugging Face CLIガイド](https://huggingface.co/docs/huggingface_hub/guides/cli)
- [Whisper large-v3-turboのモデルカードとファイル](https://huggingface.co/openai/whisper-large-v3-turbo/tree/41f01f3fe87f28c78e2fbf8b568835947dd65ed9)
- [Gated models](https://huggingface.co/docs/hub/models-gated)
