---

title: 'OpenClawとは何か：自分の端末で動く自律型AIパーソナルアシスタント'
description: 'WhatsAppやSlackで話しかけると、ブラウザ操作やファイル作業まで進めてくれる。オープンソースAIエージェント「OpenClaw」の仕組みと、安心して試すための注意点を整理します。'
pubDate: 2026-02-14
tags: [AI, OpenClaw, オープンソース, AIエージェント, セキュリティ]
impression: 触ってみたいけど環境がない、mac miniとか..?
-----------

> [!NOTE]
> この記事はGPT-5.2 Proが書き、人間がレビューしています

# OpenClawは「チャットするAI」ではなく「動くAI」

OpenClawをひとことで言うなら、「話しかけたら、手も動くAI」です。メールの整理や予定の確認、フォーム入力、ファイルの読み書き、シェルコマンド実行まで、こちらが許した範囲で“作業”をやってくれる。しかも、話しかける場所は新しいアプリではなく、WhatsAppやTelegram、Slack、Discord、iMessageなど、ふだん使っているチャットのまま。これが、いま注目を集めている理由です。 ([OpenClaw][1])

ただし、最初に大事な前置きをします。OpenClawは「便利な道具」であると同時に、「強い権限を持てる道具」です。便利さと危うさが、ほぼ同じところにあります。ここをわかった上で読むと、理解が早いと思います。 ([OpenClaw][2])

## OpenClawとは何か

OpenClawは、開発者のPeter Steinberger氏が中心となって公開している、オープンソース（MITライセンス）の自律型AIアシスタントです。2025年11月ごろの週末プロジェクトから始まり、名称もClawd（/Clawdbot）→ Moltbot → OpenClawと変わりつつ、2026年1月末には短期間でGitHubスターが10万を超えた、と公式ブログで説明されています（その後もスター数は増え続けています）。 ([OpenClaw][3])

「モデルそのもの」ではなく、いわば“器”です。どのLLM（たとえばOpenAIやAnthropic、ローカルモデルなど）を使うかは利用者が選び、OpenClawはそのLLMを頭脳として、チャットやツールをつないで動きます。クラウドのSaaS秘書と違って、どこで動かすか（自分のPC、ホームラボ、VPSなど）も自分で決める、という思想が強いです。 ([OpenClaw][1])

# どこが「自律型」なのか

自律型と聞くと、勝手に暴走するイメージが先に来ます。でも、OpenClawが狙っている“自律”はもう少し実務的です。

たとえば「毎朝7時に今日の予定と重要メールをまとめて送って」「30分おきに受信箱を見て緊急だけ教えて」といった、定期巡回やリマインドを仕組みとして持っています。OpenClawには大きく分けて、ざっくり二種類の「起き方」があります。

ひとつはHeartbeat。一定間隔（ドキュメント上のデフォルトは30分）で“定期的に気を配る”ための仕組みで、何もなければ通知を抑制する設計です。もうひとつはCron。こちらは「9時ちょうど」みたいに正確な時刻や繰り返しで実行したいときに使うスケジューラで、ジョブはホスト側に保存され、再起動してもスケジュールが消えにくい作りになっています。 ([OpenClaw][4])

ここが、単なるチャットUIと違うところです。人間が話しかけない時間にも、「見張り」と「定期実行」で仕事を進められる。これが“自律”の正体です。

# 仕組みをざっくり：Gatewayが「司令塔」になる

OpenClawの中心には<strong>Gateway</strong>という常駐プロセスがいます。いろいろなチャット（WhatsAppなど）から来るメッセージを受け取り、LLMに投げ、必要ならツールを呼び、結果を返す。いわば司令塔です。公式READMEでは、Gatewayがws://127.0.0.1:18789で動く“control plane”として説明され、CLIやWebChat、macOSアプリ、iOS/Androidのノード（端末側でカメラや通知などを扱う仕組み）がここにつながります。 ([GitHub][5])

この構造のおかげで「チャットはどこからでも」「実行はどこでやるかを分ける」がやりやすい。たとえば、GatewayはLinuxの小さなサーバーに置き、手元のMacはノードとして“端末ローカルの操作（通知、カメラ、画面収録など）”だけを担当する、という運用も公式に想定されています。 ([GitHub][5])

# OpenClawができること：強みは「生活圏に入り込める」点

OpenClawの機能は幅広いのですが、特徴は大きく3つにまとめられます。

まず、<strong>「どこで話しかけるか」を選べる</strong>こと。WhatsAppやSlackなど複数のチャットから同じ助手にアクセスでき、音声（macOS/iOS/Android）やCanvasと呼ばれる視覚的な作業面も用意されています。 ([GitHub][5])

次に、<strong>「何ができるか」をツールで広げられる</strong>こと。ブラウザ操作、ファイル読み書き、シェル実行といった“手足”を持てます。公式サイトでも「Browser Control」「Full System Access」として、フォーム入力やスクリプト実行まで明記されています。 ([OpenClaw][1])

そして、<strong>「覚える」の扱いが現実的</strong>です。OpenClawのメモリは、基本的にワークスペース内のMarkdownファイルが真実の記録で、モデルは“ディスクに書かれたことだけ”を覚える、という割り切りになっています。日次ログ（memory/YYYY-MM-DD.md）と、長期メモ（MEMORY.md）という二層があり、長期メモは「メインのプライベートセッションだけで読み込む（グループでは読み込まない）」設計です。ここは、地味に安心材料です。 ([OpenClaw][6])

# いちばん大事な話：便利さは「鍵の束」とセットで来る

OpenClawは、うまく使えば“自分の端末に住む秘書”です。でも、裏を返すと「端末の鍵束を渡せる」道具でもあります。公式ドキュメントも、ここはかなりストレートに書いています。シェル実行、ファイル操作、ネットワークアクセス、メッセージ送信。許せば全部できてしまう。だからこそ、アクセス制御を先に考え、最小権限から始めるべきだ、と。 ([OpenClaw][2])

さらに、AIエージェント固有の面倒もあります。たとえば<strong>プロンプトインジェクション</strong>。メール本文やWebページに紛れた“指示”で、エージェントが意図しない操作をしてしまう問題です。開発者自身も「プロンプトインジェクションは業界全体で未解決」とし、セキュリティベストプラクティスを読むよう呼びかけています。 ([OpenClaw][3])

## ClawHub（スキル）問題は、いままさに進行形

OpenClawには、スキル（拡張機能）を入れてできることを増やす仕組みがあります。READMEでもClawHubは「最小限のスキルレジストリ」で、有効化するとエージェントが必要に応じてスキルを探して取り込める、と説明されています。便利ですが、信頼境界が一気に広がります。 ([GitHub][5])

実際、2026年2月初旬にはClawHub上のスキルにマルウェアが含まれていた、という報道が出ました（「数百の悪性スキルが見つかった」とするものもあります）。 ([The Verge][7])

これを受けてOpenClaw側は、2026年2月7日にVirusTotalと連携し、ClawHubに公開されるスキルをスキャンする取り組みを発表しています。スキルは「エージェントの文脈で動くコード」であり、悪性なら情報窃取や不正コマンド実行につながりうる、という説明も明記されています。 ([OpenClaw][8])

ただし、ここも正直です。「スキャンは追加の防御層ではあるが、銀の弾丸ではない」「自然言語でエージェントをだますタイプはシグネチャでは捕まらないことがある」と、公式がはっきり書いています。結局、最後は使う側の慎重さが残ります。 ([OpenClaw][8])

# 安全に試すための、現実的なコツ

「怖いからやめよう」ではなく、「どう付き合うか」を決めるのが筋です。公式ドキュメントが勧める方向性に沿って、要点だけ絞ります。

* まずは<strong>最小権限</strong>で始める。いきなりブラウザ制御やシェル実行を開けない。必要になったら段階的に広げる。 ([OpenClaw][2])
* DMは<strong>pairing（ペアリング）</strong>がデフォルトで、知らない相手からのDMはコード発行だけして処理しない設計です。これを崩して「誰でもDM可」にするのは、意識してやるべき設定です。 ([GitHub][5])
* もし複数人がDMできる運用なら、DMの会話コンテキストを分離する「Secure DM mode（dmScope設定）」を検討する。分けないと、Aさんの話題がBさんに漏れる可能性がある、とドキュメントが明確に警告しています。 ([OpenClaw][9])
* スキルやプラグインは<strong>「コードをインストールする」</strong>のと同義です。特にプラグインはGatewayと同一プロセスで動き、npm install時のライフサイクルスクリプトが実行されうる、と公式が注意しています。信頼できる出どころ、固定バージョン、内容確認。ここは手を抜かない。 ([OpenClaw][2])
* `openclaw security audit`で設定の危険信号を拾う。Gatewayの公開状態、ブラウザ制御の露出、権限やログの扱いなどを点検する用途が想定されています。 ([OpenClaw][2])

このへんを守ると、「面白い実験」から「日常の道具」に近づきます。逆に言うと、ここを飛ばすと“鍵束を玄関に置きっぱなし”になりがちです。

# どんな人に向くか

OpenClawは、刺さる人には刺さります。自分の環境で動かし、道具箱を整え、少しずつ育てていくのが好きな人には、かなり楽しいはずです。GitHubのスターが急増した背景にも、「自分の機械で動く」「いつものチャットで使える」「記憶と自動化がある」という体験の新しさがある、と各所が分析しています。 ([OpenClaw][3])

一方で、セキュリティ企業や研究者が繰り返し指摘している通り、強い権限を与えるエージェントは、設定ミスや露出で“強力な足場”にもなり得ます。個人でも組織でも、ノリで入れるタイプのツールではありません。 ([CrowdStrike][10])

# まとめ：OpenClawは「便利な秘書」でも「危険な万能鍵」でもある

OpenClawが見せているのは、「AIは会話相手」から「AIは作業者」へ、という流れの現実味です。自分の端末で動き、いつものチャットにいて、定期的に見張り、必要なら手も動かす。たしかに未来っぽい。 ([OpenClaw][1])

でも、その未来っぽさは、権限と責任とセットです。スキルはコードで、チャットは入口で、プロンプトインジェクションはまだ解けていない。だから、急がず、狭く始めて、育てていく。OpenClawの良さは、むしろその“育てられる余白”にある気がします。 ([OpenClaw][3])

[1]: https://openclaw.ai/ "OpenClaw — Personal AI Assistant"
[2]: https://docs.openclaw.ai/gateway/security "Security - OpenClaw"
[3]: https://openclaw.ai/blog/introducing-openclaw "Introducing OpenClaw — OpenClaw Blog"
[4]: https://docs.openclaw.ai/automation/cron-vs-heartbeat "Cron vs Heartbeat - OpenClaw"
[5]: https://github.com/openclaw/openclaw "GitHub - openclaw/openclaw: Your own personal AI assistant. Any OS. Any Platform. The lobster way. "
[6]: https://docs.openclaw.ai/concepts/memory "Memory - OpenClaw"
[7]: https://www.theverge.com/news/874011/openclaw-ai-skill-clawhub-extensions-security-nightmare?utm_source=chatgpt.com "OpenClaw's AI 'skill' extensions are a security nightmare"
[8]: https://openclaw.ai/blog/virustotal-partnership "OpenClaw Partners with VirusTotal for Skill Security — OpenClaw Blog"
[9]: https://docs.openclaw.ai/session "Session Management - OpenClaw"
[10]: https://www.crowdstrike.com/en-us/blog/what-security-teams-need-to-know-about-openclaw-ai-super-agent/ "What Security Teams Need to Know About OpenClaw, the AI Super Agent"
