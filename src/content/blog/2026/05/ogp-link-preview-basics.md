---
title: 'OGPとは何か：リンクプレビュー用メタ情報の基本と設定例'
description: 'Open Graph Protocolの役割、基本タグ、HTMLへの設定方法、確認手順を簡単に解説します。'
pubDate: 2026-05-10
tags: ['HTML', 'OGP', 'SNS']
---

> [!NOTE]
> この記事はGPT-5.5 Proが書き、人間がレビューしています

WebページのURLをSNSやチャットに貼ると、タイトル、説明文、サムネイル画像が表示されることがあります。単なるURLだけではページの内容が伝わりにくいため、多くのWebサイトではリンクプレビュー用のメタ情報をHTMLに埋め込んでいます。

OGPはOpen Graph Protocolの略で、WebページをSNSなどのサービス上で「タイトル・説明文・画像・URLを持つオブジェクト」として扱うための仕組みです。公式仕様では、Webページをソーシャルグラフ上のリッチなオブジェクトにするためのプロトコルとして説明されています。([ogp.me][1])

この記事では、OGPの基本的な役割、HTMLへの書き方、設定後に何を確認すればよいかを、簡単な例で順番に説明します。

## OGPで指定できる情報を理解する

まず、OGPが何を指定する仕組みなのかを確認します。OGPは、HTMLの`head`要素内に`meta`タグとして記述します。SNSやメッセージアプリのクローラーは、そのページにアクセスしたときにこれらのメタタグを読み取り、リンクプレビューの表示に利用します。

OGPの基本プロパティとして、公式仕様では次の4つが必須として示されています。([ogp.me][1])

```html
<meta property="og:title" content="ページのタイトル" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://example.com/article" />
<meta property="og:image" content="https://example.com/images/ogp.png" />
```

それぞれの役割は次のとおりです。

- `og:title`は、リンクプレビューに表示したいページタイトルです。
- `og:type`は、ページの種類です。通常のWebページでは`website`、記事ページでは`article`がよく使われます。
- `og:url`は、そのページの正規URLです。
- `og:image`は、リンクプレビューに表示したい画像のURLです。

ここで重要なのは、OGPはページ本文の見た目を変えるものではないという点です。ブラウザでページを開いたときの表示ではなく、外部サービスがページを共有・取得したときの表示材料を指定します。

## HTMLにOGPタグを追加する

次に、実際のHTMLにOGPを追加します。ここでは、ブログ記事ページを例にします。OGPタグは`body`ではなく`head`内に書きます。

```html
<!doctype html>
<html lang="ja" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="utf-8" />
  <title>OGPとは何か：基本と設定例</title>

  <meta property="og:title" content="OGPとは何か：基本と設定例" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://example.com/blog/ogp-basic" />
  <meta property="og:image" content="https://example.com/images/ogp-basic.png" />
  <meta property="og:description" content="OGPの役割、基本タグ、HTMLへの設定方法を簡単に解説します。" />
  <meta property="og:site_name" content="Example Blog" />
  <meta property="og:locale" content="ja_JP" />
</head>
<body>
  <h1>OGPとは何か：基本と設定例</h1>
</body>
</html>
```

この例では、必須の4項目に加えて、`og:description`、`og:site_name`、`og:locale`も指定しています。`og:description`はページ内容の短い説明、`og:site_name`はサイト名、`og:locale`はページの言語・地域を示します。公式仕様でも、これらは任意ですが一般的に推奨されるプロパティとして説明されています。([ogp.me][1])

このHTMLを公開すると、外部サービスが`https://example.com/blog/ogp-basic`にアクセスした際、`head`内のOGPタグを読み取れる状態になります。

## 設定後のリンクプレビューを確認する

OGPを設定したら、実際にクローラーが取得できるかを確認します。確認では、ページがインターネット上からアクセス可能であること、`og:image`の画像URLが正しく開けること、HTMLの`head`内にタグが出力されていることを見ます。

まず、ブラウザでページを開き、開発者ツールまたはページのソース表示で`og:`を検索します。次のようなタグが出ていれば、HTMLにはOGPが埋め込まれています。

```html
<meta property="og:title" content="OGPとは何か：基本と設定例" />
<meta property="og:image" content="https://example.com/images/ogp-basic.png" />
```

次に、URLをSNSやチャットの投稿欄に貼り付け、プレビューが出るか確認します。ただし、サービスによって取得タイミングやキャッシュの扱いが異なります。設定を変更してもすぐに反映されない場合は、サービス側が以前のOGP情報を保持している可能性があります。

Facebook向けには、MetaのSharing Debuggerを使うと、URLのプレビュー表示やOpen Graphタグの問題を確認できます。([Facebook Developers][2])

## OGP画像を指定するときの注意点を押さえる

OGPの中でも、表示結果に大きく影響するのが`og:image`です。画像が指定されていない、URLが間違っている、アクセス制限がある、といった状態では、リンクプレビューに意図した画像が表示されません。

画像を指定する場合は、次のように画像の種類やサイズ、代替テキストも合わせて指定できます。公式仕様では、`og:image`に対して`og:image:type`、`og:image:width`、`og:image:height`、`og:image:alt`などの構造化プロパティを追加できます。([ogp.me][1])

```html
<meta property="og:image" content="https://example.com/images/ogp-basic.png" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="OGPの基本タグを説明する図" />
```

このように書くと、画像URLだけでなく、画像の形式、幅、高さ、画像内容の説明も明示できます。`og:image:alt`は画像そのものの説明であり、キャプションではありません。OGP画像を設定する場合は、画像がHTTPSで取得できるか、ログインなしでアクセスできるかも確認しておく必要があります。

## 複数ページでOGPを出し分ける

ブログやメディアサイトでは、トップページ、記事ページ、カテゴリページごとにOGPの内容を変える必要があります。すべてのページで同じ`og:title`や`og:url`を出すと、リンクプレビューがページ内容と一致しなくなります。

たとえば、テンプレートエンジンや静的サイトジェネレーターでは、記事ごとのメタデータからOGPを生成します。以下は、記事データを使ってOGPを出し分けるイメージです。

```html
<meta property="og:title" content="{{ page.title }}" />
<meta property="og:type" content="article" />
<meta property="og:url" content="{{ site.url }}{{ page.path }}" />
<meta property="og:image" content="{{ site.url }}{{ page.ogImage }}" />
<meta property="og:description" content="{{ page.description }}" />
<meta property="og:site_name" content="{{ site.name }}" />
```

この例では、`page.title`や`page.description`が記事ごとに変わります。生成後のHTMLでは、各ページに固有のOGPタグが出力されます。

確認するときは、テンプレートそのものではなく、実際にビルドされたHTMLを見ることが重要です。テンプレート上では正しく見えても、生成後に値が空になっている場合があります。

## OGPと通常のtitle・descriptionの違いを確認する

HTMLには、もともと`title`要素や`meta name="description"`があります。これらは主にブラウザのタブ表示や検索エンジン向けの説明として使われます。一方、OGPはリンクプレビューで使われる情報を明示するためのメタ情報です。

次のように、通常のメタ情報とOGPを併記できます。

```html
<title>OGPとは何か：基本と設定例</title>
<meta name="description" content="OGPの基本をHTMLの設定例つきで解説します。" />

<meta property="og:title" content="OGPとは何か：リンクプレビューの基本" />
<meta
  property="og:description"
  content="SNSでURLを共有したときに表示されるタイトル、説明文、画像を指定する方法を解説します。"
/>
```

この場合、ブラウザや検索エンジン向けの説明と、SNSなどのリンクプレビュー向けの説明を分けて管理できます。ただし、内容が大きく食い違うと読者に誤解を与えるため、基本的には同じページ内容を別の長さで表現する程度にとどめるのが扱いやすいです。

## まとめ

OGPは、WebページのURLが共有されたときに表示されるリンクプレビュー用のメタ情報を指定する仕組みです。HTMLの`head`内に`meta property="og:..."`形式で記述します。

基本として押さえるべき項目は、`og:title`、`og:type`、`og:url`、`og:image`です。必要に応じて、`og:description`、`og:site_name`、`og:locale`、`og:image:alt`なども追加します。

設定後は、実際に生成されたHTMLにOGPタグが出ているか、画像URLに外部からアクセスできるか、リンクプレビュー確認ツールで意図した表示になるかを確認します。OGPはページ本文を変える設定ではなく、外部サービスがページを共有するときの表示情報を整えるための設定です。

## 参考

- Open Graph Protocol公式仕様。基本メタデータ、任意メタデータ、画像の構造化プロパティなどを確認できます。([ogp.me][1])
- Meta for DevelopersのSharing Debugger。FacebookでのリンクプレビューとOpen Graphタグの問題確認に使えます。([Facebook Developers][2])

[1]: https://ogp.me/ 'The Open Graph protocol'
[2]: https://developers.facebook.com/tools/debug/ 'Sharing Debugger - Meta for Developers - Facebook'
