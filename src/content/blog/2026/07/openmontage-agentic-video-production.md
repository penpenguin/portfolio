---
title: 'OpenMontage：AIコーディングアシスタントで回す動画制作パイプライン'
description: 'OpenMontageについて、エージェントが動画制作を進める仕組み、パイプライン構成、無料構成と外部プロバイダーの線引きを整理します。'
pubDate: 2026-07-03
tags: ['AI Agent', 'Video', 'Open Source', 'Python']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

OpenMontageは、AIコーディングアシスタントを動画制作の実行役にするオープンソースプロジェクトです。READMEは「agentic video production system」と説明していて、自然言語で作りたい動画を伝えると、リサーチ、脚本、素材生成、編集、合成までをエージェントが進める構成になっています。対象のアシスタントとして、Claude Code、Cursor、Copilot、Windsurf、Codexなどが挙げられています。([GitHub][1])

インストールは、Python 3.10以上、FFmpeg、Node.js 18以上、AIコーディングアシスタントを前提に、リポジトリをcloneして `make setup` を実行する流れです。いわゆる動画生成APIのラッパーというより、動画制作の手順そのものをファイル群として持ち、エージェントに読ませて進行させる道具です。

## 中心は「プロンプトから1本の動画」ではなく、工程の固定化

OpenMontageの標準フローは `research -> proposal -> script -> scene_plan -> assets -> edit -> compose` です。Animated Explainer、Animation、Avatar Spokesperson、Cinematic、Clip Factory、Documentary Montage、Hybrid、Localization & Dub、Podcast Repurpose、Screen Demo、Talking Headなどのパイプラインがあり、用途ごとにYAMLのマニフェストとMarkdownのdirector skillを読み分けます。([README][2], [Architecture][3])

ここが少し面白いところです。動画生成モデルに「それっぽい映像を出して」と頼むのではなく、リサーチ、提案、脚本、シーン設計、素材、編集、合成を分ける。各ステージには成功条件やレビュー観点があり、チェックポイントもJSONで残ります。人間の制作チームが持っている段取りを、エージェントが迷わないように薄くレール化している感じです。

## Pythonは制作会社ではなく、道具箱に寄っている

Architecture文書では、OpenMontageには実行時のPythonオーケストレーターがなく、エージェント自身が制御面だと説明されています。Python側は、ツール、レジストリ、コスト管理、チェックポイント、メディア処理を受け持つ。判断や進行ルールは、YAMLとMarkdownに寄せられています。([Architecture][3])

この設計は、エージェント開発の文脈ではかなり見通しがいいです。コードに埋まった分岐を追うのではなく、「どのパイプラインを選ぶか」「どのdirector skillを読ませるか」「どのツールを呼べるか」をファイルで確認できます。もちろん、そのぶん実行するアシスタントの能力や、ローカル環境の整備には強く依存します。

## 無料構成と有料プロバイダーの境界が見える

READMEは、APIキーなしでもPiper TTS、Archive.org、NASA、Wikimedia Commons、Remotion、HyperFrames、FFmpeg、字幕生成を使えると説明しています。画像ベースの説明動画、オープン映像を使うdocumentary montage、HTML/CSS/GSAP寄りのモーショングラフィックスなど、無料寄りの道も用意されています。([README][2], [Prompt Gallery][4])

一方で、FAL、OpenAI、Google、ElevenLabs、Runway、HeyGen、Sunoなどのキーを足すと、画像生成、動画生成、TTS、音楽生成の選択肢が増えます。Provider Guideは、何を設定すると何が解放されるかを表で分けていて、費用のかかる生成をいきなり混ぜないための目安にもなります。([Providers][5])

OpenMontageを見るなら、「AI動画ツールがまた増えた」と片づけるより、エージェントに工程表を読ませるプロジェクトとして眺めるほうがしっくりきます。まず試すならPrompt Galleryのzero-key demoや、短いanimated explainerがよさそうです。そこで、どこまでが手元の環境で動き、どこから外部APIやGPUが必要になるのかを確かめたいところです。

## 参考

- [calesthio/OpenMontage][1]
- [OpenMontage README][2]
- [OpenMontage Architecture][3]
- [OpenMontage Prompt Gallery][4]
- [OpenMontage Provider Guide][5]

[1]: https://github.com/calesthio/OpenMontage 'calesthio/OpenMontage'
[2]: https://github.com/calesthio/OpenMontage/blob/main/README.md 'OpenMontage README'
[3]: https://github.com/calesthio/OpenMontage/blob/main/docs/ARCHITECTURE.md 'OpenMontage Architecture'
[4]: https://github.com/calesthio/OpenMontage/blob/main/PROMPT_GALLERY.md 'OpenMontage Prompt Gallery'
[5]: https://github.com/calesthio/OpenMontage/blob/main/docs/PROVIDERS.md 'OpenMontage Provider Guide'
