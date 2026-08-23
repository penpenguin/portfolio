---
title: 'reverse-skillは、セキュリティ作業をAIにどう任せるか'
description: 'セキュリティ向けスキルルーターreverse-skillの、タスク振り分け、証拠管理、認可ゲートと導入時の注意点を読み解きます。'
pubDate: 2026-08-10
tags: ['AI Agent', 'Cybersecurity', 'Reverse Engineering', 'Open Source']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

[reverse-skill][1]は、AIコーディングエージェントにリバースエンジニアリングや認可済みの侵入テストを任せるための、オープンソースのスキルルーターです。新しい解析ツールそのものではありません。依頼を分類し、手元の道具を調べ、対象に合う手順へ振り分け、証拠と報告書を残すところまでを一つの流れにしています。

対象はAPK、ネイティブバイナリ、JavaScript、マルウェア、ファームウェア、API、LLMセキュリティなど。jadxやGhidra、Frida、Burp Suiteといった既存ツールを、AIが場当たり的に選ぶのを防ぐ設計です。

## ルーティングを設定ファイルとテストで固める

中核にあるのは `skills/config/routing.json` です。41個のルート（R0〜R40）にキーワード、除外条件、優先順位を持たせ、依頼から主担当のスキルを決めます。「jailbreak」でも、iOSの文脈ならモバイル解析、LLMの文脈ならAIセキュリティへ送る、といった衝突処理まで明示されています。

現行READMEでは、この振り分けを中国語・英語の163ケースで検査するとしています。ルールを説明文だけに埋めず、機械可読な単一の設定と回帰テストにした点が面白い。v1.0.1ではWindowsとUbuntuのCIも入り、特定のAIクライアントに依存しない構成へ寄せられました。([README][2], [v1.0.1][3])

## 結論を「証拠」から組み立てる

振り分け後はCase単位で作業します。`scope.md` に対象資産、許可された操作、対象外、ネットワーク設定を記録。観測結果をEvidence、そこから導く結論をFinding、攻撃・解析の手順をPathとして関連付けます。ファイルならSHA-256も残せて、引き渡し前のCase Reviewで参照切れやハッシュ不一致を読み取り専用で検査します。([Evidence → Finding → Path][4])

セキュリティ調査は、最後の報告だけ整っていても再現できません。どのコマンドと成果物から結論を出したのかを、作業中から残す仕組みです。

## 認可ゲートは、隔離環境の代わりではない

対象へ働きかける前には、`auth.status=granted` とネットワーク範囲を設定する契約があります。未認可なら文書確認と計画だけに止めるルールです。ローカル試料、CTF、認可済みのオンライン資産も別のネットワーク設定として扱います。([Scope契約][5])

ただし、この境界はAIが読むMarkdownと検査スクリプトで支えるものです。OSやネットワーク側の強制隔離とは違います。`README_AI.md` は初期化や不足ツールの導入をエージェントに実行させるため、導入前に内容と依存先を確認し、VMやコンテナ、権限を絞った環境で試すのが堅いでしょう。

プロジェクト自身も実行面の静的監査と依存バージョン固定を公開しています。ただし自己監査は、第三者による安全性保証とは分けて読む必要があります。まずは外部へ接続しないローカル試料で、ルート選択からCase Reviewまで通してみる。それから運用範囲を決めるのが安全です。([パッケージ監査][6], [外部レビュー][7])

## 参考

- [reverse-skill公式サイト][1]
- [reverse-skill README][2]
- [reverse-skill v1.0.1][3]
- [Evidence → Finding → Path][4]
- [Scope契約][5]
- [パッケージ内セキュリティ監査][6]
- [Offensive-Security Skill Pack Tops GitHub Trending With 20,000 Stars][7]

[1]: https://reverse.apivix.com/ 'REVERSE-SKILL'
[2]: https://github.com/zhaoxuya520/reverse-skill 'reverse-skill README'
[3]: https://github.com/zhaoxuya520/reverse-skill/releases/tag/v1.0.1 'reverse-skill v1.0.1'
[4]: https://github.com/zhaoxuya520/reverse-skill/blob/main/skills/ops/evidence-finding-path.md 'Evidence → Finding → Path'
[5]: https://github.com/zhaoxuya520/reverse-skill/blob/main/skills/ops/scope-contract.md 'Scope契約'
[6]: https://github.com/zhaoxuya520/reverse-skill/blob/main/docs/PACKAGE-SECURITY-AUDIT.md 'パッケージ内セキュリティ監査'
[7]: https://www.implicator.ai/offensive-security-skill-pack-github-trending/ 'Offensive-Security Skill Pack Tops GitHub Trending With 20,000 Stars'
