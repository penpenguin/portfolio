---
title: 'sprites.devとは？「戻れるLinux」を1個持つという選択'
description: 'Fly.ioのSprites（stateful sandbox）を、仕組み・できること・注意点、そしてOpenClawと組み合わせると何が変わるのかまで、実用目線で整理します。'
pubDate: 2026-02-15
tags: ['Sprites', 'Fly.io', 'サンドボックス', 'OpenClaw', 'AIエージェント']
---

> [!NOTE]
> この記事はGPT-5.2 Proが書き、人間がレビューしています

# sprites.devをひとことで言うと

`sprites.dev` は、「安全にコードを動かすための、状態を持ったLinux環境」を、必要なときだけ起こして使えるサービスです。

コンテナでもなく、都度つくって壊すだけの一時VMでもない。いちばん近い感覚は、「自分専用の小さなLinuxマシンを、プロジェクトごとに持てる」ことです。しかも、失敗したら戻せる。戻れる、が大事です。([Sprites Documentation][1])

# Spritesの“芯”は3つある

Spritesの説明を読んでいて、骨格はこの3つに集約されます。

まず、<strong>ハードウェアレベルで隔離されたLinux</strong>であること。ドキュメントでも「ハードウェア分離された永続Linux環境」として説明され、専用のmicroVMとして動きます。トップページ側でも、FirecrackerベースのVMであることが明記されています。([Sprites Documentation][1])

次に、<strong>状態（ストレージ）を持つ</strong>こと。ext4のファイルシステムが丸ごと残るので、依存関係を入れても、リポジトリをcloneしても、次に開いたときにそのまま続きからできます。実行中は高速ストレージ（NVMe）に書き込み、アイドルになると耐久性のあるストレージへ退避して復元する、という考え方です。([Sprites Documentation][1])

そして、<strong>sleep / wake（自動アイドル）</strong>。使っていないときは眠り、コマンド実行やHTTPリクエストが来ると起きる。これで「起動しっぱなしのコスト」を避けやすくなっています。([Sprites Documentation][1])

# 「サンドボックス」なのに、ちゃんと“暮らせる”

## 永続ストレージは、いわば“机の引き出し”

Spritesは、サンドボックスと言いながら、机の引き出しが毎回空になるタイプではありません。

各Spriteにはext4のファイルシステムがあり、インストールしたパッケージや作ったファイルは残ります。さらに「最初から100GBの永続ストレージを持つ」という説明もあります（容量の扱いは今後変わる可能性があるので、運用前に公式を確認するのが安全です）。([Sprites][2])

## ただしRAMは“夢の中に置いていく”

ここが重要です。公式ドキュメントの「Working with Sprites」では、ファイルシステムは保持される一方で、RAMは保持されず、プロセスは止まり、インメモリの状態は失われる、と書かれています。つまり「夜になったらサーバが落ちる前提」で設計するのが基本です。([Sprites Documentation][3])

だからSpritesには、`sprite-env services` という「起きたら自動で立ち上げ直す仕組み」が用意されています。HTTPでアクセスされたときにSpriteが起き、登録しておいたサービスが再起動される、という使い方です。([Sprites Documentation][3])

## URLが最初から付いてくる、が地味に強い

各Spriteには `https://<name>.sprites.app` のURLが付きます。デフォルトではポート8080にルーティングされ（または最初に開いたHTTPポートに寄せられ）、アクセスが来ると起きます。URLは既定で認証が必要で、必要なら `sprite url update --auth public` で公開にもできます。([Sprites Documentation][3])

公開は便利ですが、公式ドキュメントにも「public URLはインターネットにさらす」注意書きがあります。デモやWebhookなど用途を絞って使うのがよいです。([Sprites Documentation][3])

# チェックポイントとロールバックが、Spritesを“道具”にしている

Spritesの売り文句は「checkpoint & restore」です。要するに「環境まるごと、戻るボタン」がある。

CLIとしては `sprite checkpoint create` で保存し、戻すときは `sprite restore <version-id>`（`sprite checkpoint restore` の別名）を使います。復元は「チェックポイント時点のファイルシステムに戻す」ので、その後の変更は消える。ここはちゃんと意識しておく必要があります。([Sprites Documentation][4])

チェックポイントの所要時間については、ドキュメント内でも説明が揺れて見えます。トップページでは「約300ms」といった速さが強調される一方、別ページでは「データ量次第で10〜30秒」と書かれています。実際は変更量や裏側の状況で変わるはずなので、「必ず一瞬」とは思い込まず、まず小さく試して肌感を掴むのが現実的です。([Sprites][2])

# ネットワークポリシーが“外側”から効くのが、いちばん安心するところ

サンドボックスで怖いのは、ファイルを壊すことより、外へ勝手に通信されることだったりします。

Spritesにはアウトバウンド通信を制御するネットワークポリシーがあり、ドキュメントではDNSベースのフィルタとして説明されています。ドメインの完全一致やワイルドカード（例：`*.npmjs.org`）に対応し、変更は即時反映され、ブロック後のDNSは `REFUSED` で早く失敗します。([Sprites Documentation][5])

さらに面白いのは「ポリシーを外部APIで設定し、Sprite内のコードが（root権限でも）自分のポリシーを変えられない」とブログで明言している点です。これがあると、AIが生成したコードや不明なスクリプトを動かすときの、心理的ハードルが一段下がります。([Sprites][6])

# 料金の考え方は「動いた分だけ」

料金はCPU時間、メモリ滞在時間、ストレージなどの使用量ベースで説明されています。トップページでは単価の例も明示されています（ただし料金は変わり得るので、導入前は必ず公式の最新表示を確認してください）。([Sprites][2])

# 触ってみる最短ルート

まずは「CLIで1個つくって、echoして、寝かせて、起こす」がいちばんわかりやすいです。

インストールと認証は公式Quickstartの流れが素直で、CLIは次のように入れます。([Sprites Documentation][7])

```sh
curl -fsSL https://sprites.dev/install.sh | sh
sprite org auth
sprite create my-first-sprite
sprite use my-first-sprite
```

あとは、コマンドを実行してみる。

```sh
sprite exec echo "Hello, Sprites!"
sprite console
```

「Fly.ioアカウントで認証する」点もQuickstartに明記されているので、すでにFly.ioを使っている人はスムーズです。([Sprites Documentation][7])

# OpenClawと組み合わせると何が変わる？

ここからが本題です。

OpenClawは、チャットアプリ（WhatsApp/Telegram/Slack/Discord/Teamsなど）から使える“自分の助手”を、自分のマシン（またはVPS）で動かすためのオープンなエージェント基盤です。名前の変遷として、Clawd → Moltbot を経て OpenClaw になったことも公式ブログで説明されています。([OpenClaw][8])

そしてOpenClawは強力です。強力なものは、置き場所を選びます。

## 1) OpenClawを「Spriteの中」で動かす

Sprites公式ブログに、旧名（Moltbot/Clawdbot）をSprite上で動かす手順が出ています。狙いは明確で、「エージェントにそれなりの権限を渡したい。でも自分の手元で暴れてほしくない」という話です。([Sprites][9])

ポイントは2つあります。

ひとつは、Spritesはsystemdを前提にしていないので、普通のLinuxサーバのようにサービス常駐させるのではなく、`sprite-env services create` で登録する、という流儀です。ブログでも「systemd unavailable は正常」と書かれています。([Sprites][9])

もうひとつは、OpenClawのGatewayが使うポート（`18789`）です。OpenClaw側のREADMEにも `openclaw gateway --port 18789` が出てきますし、Sprites側の手順でもHTTPポートとして `18789` を指定してSprite URLにルーティングしています。([GitHub][10])

実際の手順は環境で多少変わりますが、イメージとしてはこうです。

```sh
# Spriteを用意
sprite create openclaw
sprite console -s openclaw

# OpenClawをインストール（OpenClaw公式はインストールスクリプトも案内している）
curl -fsSL https://openclaw.ai/install.sh | bash

# systemdの代わりに、SpritesのサービスとしてGatewayを登録
sprite-env services create openclaw-gateway \
  --cmd "$(which openclaw)" \
  --args "gateway --port 18789" \
  --http-port 18789
```

ここまでできると、「URLにアクセスされたらSpriteが起き、Gatewayが立ち上がる」という形になります。つまり、常時起動のサーバ運用をあまり意識せずに、OpenClawの置き場所を作れます。([Sprites][9])

加えて、OpenClaw側はセキュリティとしてペアリングや許可リストをデフォルトにしており、見知らぬDMを“そのまま処理しない”設計になっています。この性格と、Spritesの「URLはデフォルト非公開」「ネットワークポリシーで縛れる」が相性がいい。([GitHub][10])

## 2) OpenClawは手元、実行はSpritesという分業

もうひとつの組み合わせ方は、「OpenClawは会話と判断を担当し、危ない実行はSpritesへ投げる」パターンです。

Sprites側には“untrusted code runner”の例があり、ネットワークをデフォルト拒否にして、必要なドメインだけ許可する、という考え方が示されています。さらに、そのポリシーは外部APIで設定し、Sprite内のコードが変えられない、と強く言い切っています。これは、エージェントが生成したコードを走らせるときのガードとして素直です。([Sprites][6])

OpenClaw自体も、非メインのセッションをDockerサンドボックスに入れる設定があり、「まずはローカルで安全に」の道も用意されています。そのうえで、「Dockerの境界より強い隔離が欲しい」「チェックポイントで巻き戻したい」「URL付きの実行環境が欲しい」というときに、Spritesを実行先として足す。そんな整理がいちばん扱いやすいと思います。([GitHub][10])

# 使う前に知っておきたい注意点

Spritesは便利ですが、雑に扱うと危ないところもあります。

URLをpublicにすると、文字通りインターネットから触れるようになります。公式も用途を絞るべきだと注意しています。Webhookやデモなど「公開が必要な場面だけ」にするのが無難です。([Sprites Documentation][3])

チェックポイント復元は「環境を戻す」代わりに、「それ以降の変更を捨てる」操作でもあります。大事なデータは別途バックアップする、あるいは“戻してよい作業”に限定する。これは運用ルールで守る部分です。([Sprites Documentation][11])

OpenClawは「プロンプトインジェクションは業界的に未解決」と公式が釘を刺していて、セキュリティベストプラクティスを読むことを勧めています。Spritesを組み合わせると“実行環境の隔離”は強化できますが、会話面のリスクがゼロになるわけではありません。ここは過信しないほうがいい。([OpenClaw][8])

# まとめ

Spritesは「安全な箱」ではなく、「安全に戻れる箱」です。状態が残り、URLがあり、ネットワークを外側から縛れて、使っていないときは寝る。その組み合わせが、AI時代の開発や運用に、ちょうど噛み合ってきています。([Sprites Documentation][1])

OpenClawと合わせるなら、「OpenClawをSpriteの中で走らせる」か、「OpenClawは手元で、危ない実行はSpritesに投げる」か。どちらも、“自分の助手に渡す権限”を現実的に扱うための選択肢になります。([Sprites][9])

[1]: https://docs.sprites.dev/ 'https://docs.sprites.dev/'
[2]: https://sprites.dev/ 'https://sprites.dev/'
[3]: https://docs.sprites.dev/working-with-sprites 'https://docs.sprites.dev/working-with-sprites'
[4]: https://docs.sprites.dev/cli/commands/ 'https://docs.sprites.dev/cli/commands/'
[5]: https://docs.sprites.dev/api/dev-latest/policy 'https://docs.sprites.dev/api/dev-latest/policy'
[6]: https://sprites.dev/blog/running-untrusted-code 'https://sprites.dev/blog/running-untrusted-code'
[7]: https://docs.sprites.dev/quickstart/ 'https://docs.sprites.dev/quickstart/'
[8]: https://openclaw.ai/blog/introducing-openclaw 'https://openclaw.ai/blog/introducing-openclaw'
[9]: https://sprites.dev/blog/moltbot-in-a-sprite 'https://sprites.dev/blog/moltbot-in-a-sprite'
[10]: https://github.com/openclaw/openclaw 'https://github.com/openclaw/openclaw'
[11]: https://docs.sprites.dev/working-with-sprites/ 'https://docs.sprites.dev/working-with-sprites/'
