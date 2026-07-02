---
title: 'Clapet：AIと一緒に詰めるアーキテクチャ図の白板'
description: 'Clapetについて、AI Design Agent、Architecture Coverage、Mermaid/JSON入出力、BYO APIキーの扱いを整理します。'
pubDate: 2026-07-02
tags: ['System Design', 'Architecture', 'AI', 'Diagram']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

Clapetは、システム設計のためのAI支援付きホワイトボードです。公式ページは「AI-assisted architecture diagram tool」と説明していて、設計、レビュー、保存、共有を扱うプロダクトとして置かれています。Product Hunt上の見出しは「Excalidraw meets AI system design」。ただ図を描く道具というより、空のキャンバスからアーキテクチャの論点を埋めていくための作業場に近いです。([Clapet][1], [Product Hunt][2])

最初の画面には「Let me design from scratch」と「Explore Featured Designs」が並びます。前者は次のプロジェクトのフルスタック構成を自分で起こす入口、後者は既存のシステム設計を見て学び、テンプレートとして触る入口です。白板に向き合った瞬間の「どこから始めるんだっけ」を、完全に自由な作図ではなく、少し狭い入口で受け止めているのがいいところです。

## Design Agentは、作図より前の聞き返しに寄っている

右側のDesign Agentには、要件入力、チャット、クイックスタートがあり、「Bit.lyのようなシステムのスターター構成を作る」「フロントエンド、API gateway、API serverを足す」「いまのシステムを説明して」といった例が置かれています。アプリ内の説明では、自然言語からアーキテクチャを生成し、設計をレビューし、改善提案を返す機能として扱われています。([Clapet][1])

ここで目立つのは、生成結果そのものよりもArchitecture Coverageです。Purpose、Data、Consistency、Scale、API/UX、Reliability、Security、Observability、Costなどの観点が並び、設計がどこまで詰められているかを見える形にします。図をきれいにする前に、遅延予算、障害時の振る舞い、認可境界、コスト要因、テスト方針をまだ話していない、と気づける。システム設計の練習にも、チーム内レビューにも効きそうです。

## BYO APIキーという割り切り

ClapetのAI機能は、OpenAI、Anthropic、DeepSeekなどのプロバイダーを選び、自分のAPIキーを入れて使う形です。設定文には、キーはブラウザ内だけに保存され、Clapetへ届かず、サーバーログやプロキシにも載らない、と説明されています。リクエストも選んだプロバイダーへブラウザから直接送る設計です。([Clapet][1])

この割り切りは、SaaSとしては少し手間が増えます。けれど、設計途中の構成図や要件を扱うツールでは、どこにキーと文脈が流れるのかが曖昧なままより安心しやすい。アプリ内の更新文では、Design AgentをProなしで使えるようにしたことにも触れています。料金表の派手さではなく、触れる範囲を広げる方向へ寄せた判断に見えます。

## 図は持ち出せる形で残す

作った図はClapet JSONとして書き出し、あとでレイアウト、ノード詳細、エッジを保ったまま読み戻せます。Mermaidはファイル選択か貼り付けで取り込む入口があり、更新履歴では矢印方向、双方向リンク、エッジラベルの保持にも触れられています。保存した図は公開リンクや埋め込み、コメントにもつながります。([Clapet][1])

Clapetを見るなら、AIで図を一発生成する道具としてだけ見ると少しもったいないです。空白のキャンバス、要件の聞き返し、Coverageの抜け漏れ、JSON/Mermaidでの持ち出し。この一連の流れを、設計レビューの薄いワークフローとして試すのがよさそうです。

## 参考

- [Clapet - AI-assisted architecture diagrams][1]
- [Clapet: Excalidraw meets AI system design | Product Hunt][2]
- [Clapet - Excalidraw meets AI system design | Innolope][3]

[1]: https://clapet.app/ 'Clapet - AI-assisted architecture diagrams'
[2]: https://www.producthunt.com/products/clapet 'Clapet: Excalidraw meets AI system design | Product Hunt'
[3]: https://innolope.com/pulse/startups/6a3d18d232155bc827bf06ad 'Clapet - Excalidraw meets AI system design | Innolope'
