---
title: 'ternlight：5〜7MBのWASMでブラウザ内セマンティック検索を動かす'
description: '軽量な埋め込みモデルternlightについて、2つのnpmパッケージ、三値化とWASMによる小型化、検索実装で見ておきたい制約を整理します。'
pubDate: 2026-07-12
tags: ['WebAssembly', 'Machine Learning', 'JavaScript', 'Semantic Search']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

ternlightは、テキストを意味検索に使えるベクトルへ変換する埋め込みモデルを、WebAssembly（WASM）としてJavaScriptから動かすライブラリです。モデル、推論エンジン、トークナイザーをひとつのWASMに収めているため、実行時にモデルを別途取得したり、推論APIへ問い合わせたりしません。ブラウザへ配信したあとは、訪問者のCPU上で処理が完結します。([GIGAZINE][1], [GitHub][2])

用途は文章生成ではなく、セマンティック検索、FAQ照合、重複検出、クラスタリングなどです。公式デモでは、Reactドキュメント約2,000件を端末内で検索できます。「検索語と同じ単語を含むか」ではなく、文章を384次元のベクトルへ変換し、意味の近さで並べるための小さな部品、と捉えると分かりやすいです。([Demo][3])

## miniとbaseを同じAPIで選ぶ

npmパッケージは `@ternlight/mini` と `@ternlight/base` の2種類です。公式READMEの計測では、miniは転送時5.0MB、埋め込み1件あたりのp50が約2.5ms。baseは7.2MB、約5.1msで、代わりに教師モデルとの順位相関や検索評価が高くなっています。数値はMシリーズMacのNode/V8で測ったものなので、実際のブラウザや端末では測り直す必要があります。([GitHub][2])

呼び出し方はどちらも変わりません。`embed()` はL2正規化済みの `Float32Array(384)` を返し、`cosineSim()` で2つのベクトルを比較できます。`similar()` へ問い合わせ文と文章の配列を渡せば、類似度順の上位を得られます。検索対象が固定なら、本文側のベクトルを最初に一度だけ作って再利用するのが素直です。([base package][4], [mini package][5])

## 小ささは三値化と専用エンジンから来る

ternlightは `all-MiniLM-L6-v2` から蒸留した2層のモデルを使い、重みを `-1`、`0`、`+1` の三値に制約して学習しています。推論時の行列計算を主に加算と減算へ落とし、重みは4個を1バイトへ詰める設計です。埋め込みテーブルはint4で量子化されています。

汎用の機械学習ランタイムを同梱するのではなく、Rustで書いた専用の計算グラフをWASM SIMD向けにコンパイルしている点も効いています。JavaScript側は文字列を渡してベクトルを受け取る薄い窓口に留まり、WordPieceによるトークン化から推論までWASM内で進みます。小型モデルだけを配るのではなく、動かすための一式を小さくまとめた構成です。([Architecture][6])

## 導入前に見るのは精度、入力長、初回配信

APIを呼ぶだけなら短いものの、クラウドの埋め込みAPIをそのまま置き換える話ではありません。入力は最大128トークンで切り詰められます。長い記事や文書は、先に適切な単位へ分割しなければ検索結果が粗くなります。小型化には精度との交換条件もあり、miniとbaseの差を含めて、実データで検索順位を確かめるべきです。

問い合わせを外部へ送らず、オフラインでも動くのは強みです。ただし5〜7MBは初回訪問時の転送量としては無視できません。キャッシュ、読み込み開始のタイミング、低速回線での待ち時間まで含めてUIを組む必要があります。ViteやwebpackではWASM向けの設定も確認が要ります。

静的サイトのドキュメント検索や、外へ出したくない短い入力の照合には、ternlightの境界がよく合います。まずはminiで小さな検索対象を埋め込み、検索品質が足りなければ同じAPIのbaseへ切り替える。この順なら、軽さを保ったまま必要な精度を探れます。

## 参考

- [GIGAZINEの記事][1]
- [soycaporal/ternlight][2]
- [ternlight demo][3]
- [@ternlight/base][4]
- [@ternlight/mini][5]
- [Architecture][6]

[1]: https://gigazine.net/news/20260707-ternlight-webassembly-embeddings/ 'わずか5MBのAIモデルをウェブサイトに組み込んでユーザーにローカル操作させられる「ternlight」が登場'
[2]: https://github.com/soycaporal/ternlight 'soycaporal/ternlight'
[3]: https://ternlight-demo.vercel.app/ 'ternlight semantic search demo'
[4]: https://www.npmjs.com/package/@ternlight/base '@ternlight/base'
[5]: https://www.npmjs.com/package/@ternlight/mini '@ternlight/mini'
[6]: https://github.com/soycaporal/ternlight/blob/main/docs/architecture.md 'ternlight Architecture'
