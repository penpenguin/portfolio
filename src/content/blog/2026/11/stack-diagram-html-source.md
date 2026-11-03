---
title: 'stack-diagram：構成図の見た目より、HTMLを正本にする仕組みが面白い'
description: 'stack-diagram v0.4.0の構成図生成を、ロゴの埋め込み、矢印の座標、HTMLからの出力という流れで読む。小さな実行例で、ビルドが検出する欠落と検出しない誤りを確かめる。'
pubDate: 2026-11-03
heroImage: '/assets/blog/2026/11/stack-diagram-html-source.webp'
tags: ['AI', 'Agent Skills', 'ドキュメント']
---

> [!NOTE]
> この記事はGPT-6 Astraが書き、人間がレビューしています

構成図を描くとき、サービスの関係を整理する時間より、ロゴを探し、箱を揃え、文字に重なった矢印を直す時間のほうが長くなることがある。[stack-diagram](https://github.com/caru-ini/stack-diagram)は、その作業をエージェントに任せるためのSkillだ。Claude Code、Codex、Cursorなどで使え、クラウド構成だけでなく開発ツールの関係も描く。

面白いのは、画像生成モデルに完成図を一枚描かせる方式ではないこと。エージェントが配置を決め、ロゴとフォントを埋め込んだHTMLを作り、そのHTMLからPNGなどを出力する。本稿ではv0.4.0のソースを読む。

## 構成の解釈と、図の組み立ては別の仕事

READMEには、Next.jsとHonoをVercelに置き、Neon、Clerk、Stripeにつなぐ入力例がある。Skillはそこからノード、グループ、接続を決める。主なリクエスト経路はアクセント色の実線、内部接続は中立色の実線、CIやデプロイの関係は破線で分ける。

ただし、ツール名の羅列からグループや流れを推測するようにも指示されている。整った図が出ても、それが実システムの構成を調査して証明した結果とは限らない。入力には「誰が誰を呼ぶか」「同じ実行環境にあるもの」「デプロイ時だけの接続」を書いておきたい。

ロゴは通常、svgl、devicon、gilbarbara/logosの順に探す。AWS、Google Cloud、Azureには各社の公式アイコンパッケージを使う専用経路があり、v0.4.0ではGoogle CloudとAzureの取得元が追加された。見つからないものをそれらしい図形で代用する方針ではない。なお、コードのMITライセンスと、各ブランドのロゴの利用条件は別に扱う必要がある。

## 小さな実行例で、HTMLへの埋め込みを確かめる

生成全体を試す前に、`build.py`が何を検証するかを切り出した。以下は記事用の最小例で、完成した構成図ではない。Python 3.9以上とGitを前提に、作業用ディレクトリでv0.4.0を取得する。

```sh
git clone --depth 1 --branch v0.4.0 \
  https://github.com/caru-ini/stack-diagram.git
cd stack-diagram/skills/stack-diagram
mkdir probe-icons
```

次の内容を`probe.html`として保存する。

```html
<!doctype html>
<html lang="en">
  <meta charset="utf-8" />
  <title>Embedding probe</title>
  <img alt="Browser" width="60" height="60" src="%%ICON_browser%%" />
</html>
```

空のアイコンディレクトリを渡してビルドする。

```sh
python3 scripts/build.py probe.html probe-icons probe-out.html
```

実行結果は終了コード1で、`unresolved tokens: %%ICON_browser%%`と表示され、出力ファイルは作られなかった。次に、付属の汎用ブラウザー図形を同じ名前で置く。

```sh
cp assets/generic/browser.svg probe-icons/browser.svg
python3 scripts/build.py probe.html probe-icons probe-out.html
```

今度は終了コード0。出力を調べると、参照は`data:image/svg+xml;base64,`で始まる埋め込みデータに置き換わり、未解決のトークンは消えていた。実際のテンプレートでは、`--fonts assets/fonts`を渡してフォントも埋め込む。

つまり、このビルドが検出するのは「必要な素材が揃っていない」という欠落だ。APIからDBへの矢印が逆向きでも、素材が揃っていれば検出する仕組みではない。配布ファイルとして完結していることと、図の内容が正しいことは分けて確認する。

## 矢印はアイコンではなく、文字を含む領域につなぐ

配置は自動レイアウトエンジン任せではなく、エージェントが座標を組む。`geometry.md`には、そのための具体的な規則がある。

標準のタイルは60×60pxだが、ノード全体は下の名前と役割を含め、およそ132×100pxとして扱う。上段のタイル上端が`y=120`、下段が`y=350`なら、縦線をタイル下端の`180`から引くと、上段のラベルを通ってしまう。公式の例は、文字領域の下に余白を取った`226`から、下段直前の`344`までを結ぶ。

```html
<path class="n" d="M487 226 V344" marker-end="url(#ar)" />
```

この規則は文字の重なりを減らすが、長い名前や日本語の折り返しまで保証するものではない。Skillが、HTMLをChromiumでPNGにして実際に読み、重なりや欠けを直す工程を要求しているのはそのためだ。今回実行したのは先ほどの埋め込み検証であり、エージェントによる構成図生成全体やPNG書き出しの品質評価ではない。

## 共有前に見るのは、色より境界と接続

HTMLを正本にすれば、PNG用とブラウザー表示用で別々の図を保守せずに済む。ロゴ取得時にはネットワークが必要だが、素材を埋め込んだHTMLはオフラインで表示する設計だ。PNG出力にはPlaywrightとChromiumが必要になる。

導入時は、既知の小さな構成を一つ渡し、まずグループの境界と矢印の向きを確認する。その後で明暗両テーマのロゴとラベルを見る。図をきれいにする手順が用意されているからこそ、人間は「この接続は本当にあるか」のレビューに時間を使いたい。

## 参考

- [stack-diagram v0.4.0 README](https://github.com/caru-ini/stack-diagram/blob/v0.4.0/README.md)
- [Skillの生成手順とロゴ取得規則](https://github.com/caru-ini/stack-diagram/blob/v0.4.0/skills/stack-diagram/SKILL.md)
- [build.py：素材の埋め込みと未解決トークンの検査](https://github.com/caru-ini/stack-diagram/blob/v0.4.0/skills/stack-diagram/scripts/build.py)
- [geometry.md：ノード領域と矢印の配置](https://github.com/caru-ini/stack-diagram/blob/v0.4.0/skills/stack-diagram/references/geometry.md)
- [v0.4.0リリース](https://github.com/caru-ini/stack-diagram/releases/tag/v0.4.0)
