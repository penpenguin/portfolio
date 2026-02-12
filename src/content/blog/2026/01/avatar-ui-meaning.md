---

title: 'AVATAR UIって何？「アバターUI」と「AVATAR UI（OSS）」の2つの意味'
description: '同じ言葉に見えて、指しているものが違う。UIデザインの「アバター」と、Sito Sikino氏が公開しているデスクトップ向けOSS「AVATAR UI」を分けて整理します。'
pubDate: 2026-01-14
tags: ['UI', 'AI', 'オープンソース']
impression: 'ここが特に実務で効くポイントだと感じました。'
---

> [!NOTE]
> この記事はAIが書き、人間がレビューしています

「AVATAR UI」という言葉、いちど耳にすると、なんだか大きなものの名前みたいに見えます。でも実際は、場面によって意味が二つに分かれます。ここを取り違えると、会話がすれ違いやすい。

## まずは、ふつうの「アバターUI」

デザインやプロダクトの文脈で「avatar（アバター）」と言ったとき、多くの場合は“ユーザーを表す小さな顔”のことです。丸いアイコンの中に、写真が入っていたり、イニシャルが入っていたりする、あれ。

Atlassianのデザインシステムでも「アバターはユーザーやエンティティの視覚的な表現」と説明されています。([Atlassian Design System][1])
Material UI（MUI）でも、アバターはテーブルやダイアログなど幅広い場面で使われる、と整理されています。([MUI][2])

つまり、この意味での「avatar UI」は、プロフィール画像まわりのUI部品やルール（サイズ、表示優先順位、欠損時の代替など）を指すことが多いです。

## もう一つの「AVATAR UI」：プロジェクト名としてのAVATAR UI

一方で、全部大文字の「AVATAR UI」は、特定のOSS（オープンソース）プロジェクトを指している場合があります。

GitHubで公開されている「AVATAR UI」は、人とAIが同じ画面の中でやり取りするための“デスクトップで動くエージェントUI基盤”として説明されています。Gemini / GPT / Claudeを切り替えられる、というのも特徴として明記されています。([GitHub][3])

このプロジェクトの面白さは、見た目の方向性がわりとハッキリしているところで、端末っぽい世界観（クラシックなターミナル調）に、発話に同期するアバター、文字が一文字ずつ出るタイプライター効果、音の演出などを組み合わせて「会話の体験」を作っています。([Izanami][4])

READMEの記述ベースで言うと、主にこんな性格です。

* デスクトップアプリとしてローカルで動き、macOS / Windows / Linuxに対応する([GitHub][3])
* 必要に応じてGoogle検索を自動実行する“検索サブエージェント”を内蔵している([GitHub][3])
* テーマ（配色）やアバター画像を差し替えて、雰囲気を変えられる([GitHub][3])
* MITライセンスで、個人利用だけでなく商用利用も可能とされている([GitHub][3])

セットアップ面では Node.js と Python を使う構成で、APIキーは `.env` に入れて扱う前提です（リポジトリにキーは入っていない、と注意書きもあります）。([GitHub][3])

## 「AVATAR UI Core」もある（少し小さめの別リポジトリ）

近い名前で「Avatar UI Core」というリポジトリも公開されています。こちらは “classic terminal-style UI core” として、ターミナル風UI、ピクセルアートのアバター、タイプライター効果、タイピング音などを特徴に挙げています。([GitHub][5])

用途としては、AVATAR UIの世界観をまず小さく試したい人や、ベース部分だけを掴みたい人に向いた位置づけに見えます（README上の表現として）。([GitHub][5])

## じゃあ、あなたが見た「AVATAR UI」はどっち？

見分け方は、けっこう素朴です。

プロダクトデザインや画面設計の話で「アバターUI」と言っているなら、たいていは“ユーザーの顔アイコン部品”の話です。([Atlassian Design System][1])
一方、GitHubのリポジトリ名や「Gemini / GPT / Claude」「デスクトップで動く」「検索サブエージェント」みたいな単語と一緒に出てきたなら、それはOSSの「AVATAR UI」を指している可能性が高いです。([GitHub][3])

同じ“avatar”でも、前者は「人を表す小さな部品」、後者は「人とAIのやり取りを成立させる舞台装置」。ここが分かれると、言葉が急にスッキリします。

[1]: https://atlassian.design/components/avatar "Avatar - Avatar - Components - Atlassian Design System"
[2]: https://mui.com/material-ui/react-avatar/ "React Avatar component - Material UI"
[3]: https://github.com/siqidev/avatar-ui "GitHub - siqidev/avatar-ui"
[4]: https://izanami.dev/post/9202eaa7-6a57-40ca-9ae9-28d1d006a5e3 "AVATAR UI - izanami"
[5]: https://github.com/sito-sikino/avatar-ui-core "GitHub - sito-sikino/avatar-ui-core: Classic terminal-style UI core. A project foundation extensible from chat UIs to CLI integration."
