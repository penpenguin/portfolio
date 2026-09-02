---
title: 'パスワード変更画面への入口を固定する「/.well-known/change-password」'
description: 'パスワードマネージャーから変更画面へ直接案内する、Well-Known URLの役割と実装時に外せない点を整理します。'
pubDate: 2026-09-02
tags: ['Web Security', 'Password Manager', 'Authentication']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

パスワードを変更したいのに、アカウント設定のどこに入口があるのか分からない。人間でも迷う導線を、パスワードマネージャーがサイトごとに推測するのは無理があります。W3CのWorking Draft「A Well-Known URL for Changing Passwords」は、その入口を `/.well-known/change-password` にそろえる仕様です。固定されたURLから実際の変更画面へ転送することで、ブラウザやパスワード管理ツールが行き先を見つけられます。([W3C][1])

## 固定するのは画面ではなく、入口

実装の中心は短いリダイレクトです。たとえば変更画面が `https://example.com/settings/password` にあるなら、次のURLへのアクセスをそこへ転送します。

```text
https://example.com/.well-known/change-password
```

W3Cの仕様が挙げるステータスコードは `302`、`303`、`307` で、レスポンスには `Location` ヘッダーを付けます。いずれも一時的なリダイレクトです。変更画面のパスをあとで動かしても、外から見える入口は保てます。逆に、実際のフォームをWell-Known URLへ直接置く構成は仕様上認められていません。ここは「変更画面そのもの」ではなく、見つけるための中継点です。([W3C][1])

HTMLの `meta refresh` も代替手段として定義されていますが、サーバー側でHTTPリダイレクトを返せるなら、そのほうが構成は素直です。

## フォーム側の受け入れも整える

入口だけ正しくても、到着先のフォームがパスワードマネージャーに読めなければ操作はぎこちなくなります。web.devは、現在のパスワード欄へ `autocomplete="current-password"`、新しいパスワード欄へ `autocomplete="new-password"` を指定するよう案内しています。前者は保存済みの値の入力、後者は新しいパスワードの生成や保存を助ける目印です。([web.dev][2])

もう一つ見落としやすいのが、存在しないURLにも `200 OK` を返すSPAや独自404ページです。web.devによれば、この挙動はクライアントによる機能の有無の判定を邪魔することがあります。未対応なら適切な `404 Not Found` を返し、対応するならWell-Known URLから確実に変更画面へ転送する。曖昧な200応答を残さないことが大切です。([web.dev][2])

## 小さな設定がパスワード管理とつながる

AppleはWWDC24で、Passwordsアプリの「Change Password」ボタンから変更ページを開くために、このWell-Known URLを採用できると説明しています。サイト内のナビゲーションを作り直さず、認証まわりの既存画面へ機械がたどれる入口だけを足せるのが、この仕組みのよさです。([Apple Developer][3])

ただし、仕様はW3CのWorking Draftで、IANAの `change-password` 登録もprovisionalです。完成済みの勧告と読み違えず、まずステージング環境でリダイレクト先、未ログイン時の認証フロー、フォームの `autocomplete` を一続きで確認したいところです。設定ファイルに数行を足すだけでも、試験はURL単体ではなく、変更完了まで通しておくのが堅実です。([IANA][4])

## 参考

- [A Well-Known URL for Changing Passwords][1]
- [パスワード変更用のよく知られたURLを追加する][2]
- [Streamline sign-in with passkey upgrades and credential managers][3]
- [IANA Well-Known URIs Registry][4]

[1]: https://www.w3.org/TR/change-password-url/ 'A Well-Known URL for Changing Passwords'
[2]: https://web.dev/articles/change-password-url?hl=ja 'パスワード変更用のよく知られたURLを追加する'
[3]: https://developer.apple.com/videos/play/wwdc2024/10125/ 'Streamline sign-in with passkey upgrades and credential managers'
[4]: https://www.iana.org/assignments/well-known-uris/well-known-uris.xhtml 'Well-Known URIs'
