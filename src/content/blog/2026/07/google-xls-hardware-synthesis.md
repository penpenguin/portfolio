---
title: 'Google XLS：DSLXからVerilogを生成する実験的HLSツールチェーン'
description: 'GoogleのXLSについて、DSLXからIR、最適化、スケジューリング、RTL生成へ進む設計と、試す前に知っておきたい制約を整理します。'
pubDate: 2026-07-28
tags: ['Hardware', 'Compiler', 'Verilog', 'Open Source']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

XLS（Accelerated HW Synthesis）は、高水準の機能記述から合成可能なVerilog／SystemVerilogを生成する、GoogleのオープンソースHLSツールチェーンです。Apache 2.0で公開され、同じ設計をホスト上では高速に実行し、ハードウェア向けには機能的に同一なブロックとして出力することを狙っています。ただし、公式READMEが明記するとおり、まだ実験段階であり、Googleが正式にサポートする製品ではありません。([README][1])

## DSLXとIRの間でハードウェアを捉える

主な入力言語のDSLXは、Rustに似た構文を持つ、イミュータブルで式指向のデータフローDSLです。任意のビット幅、固定サイズの値、解析可能なコールグラフなど、回路を記述するための性質を最初から言語へ組み込んでいます。一般的なCPU向け言語の逐次実行を、そのまま回路へ移す発想ではありません。([DSLX Reference][2])

DSLXはXLS IRへ変換され、最適化を通ったあと、スケジューラが演算をパイプラインの各段へ割り当てます。IRはSSAの性質を持つデータフロー表現で、制御フローグラフではなく、ノード同士の依存関係で計算を表します。CPUでは命令が順番に進むのに対し、回路では複数の演算が並行して動く。その違いをIRの形にも反映した設計です。([IR Overview][3])

クイックスタートでは、DSLXのテスト、IRへの変換、IR最適化、Verilog生成という流れを個別のコマンドで確認できます。たとえばクロック周期やパイプライン段数、遅延モデルを与え、制約を守るように演算を配置するのがcodegenの役目です。単にソースコードをRTLへ置換するのではなく、どの演算を何サイクル目に置くかまでコンパイラへ任せられます。([Quick Start][4], [Codegen Options][5])

## 関数だけでなく、状態を持つprocも扱う

組み合わせ回路やパイプライン化した関数に加え、XLSには `proc` があります。procは固定の状態を持ち、FIFOのようなチャネルで別のprocと通信する、逐次回路向けのモデルです。`config` で接続を決め、`init` で初期状態を置き、`next` に各アクティベーションの処理を書きます。データ依存だけでは表せないI/O順序はtokenで明示します。([What is a Proc?][6])

ここは便利さと注意点が隣り合う部分です。受信待ちや有限FIFOのバックプレッシャーはパイプラインを停止させ、構成によってはRTLでデッドロックを起こし得ます。状態更新に複数サイクルかかれば、毎サイクル処理を始めるフルスループットにも届きません。抽象化されていても、レイテンシ、スループット、チャネル容量といった回路設計の論点は残ります。

## まずはColabかバイナリで境界を見る

XLSにはDSLXのテスト、IR変換、Verilog生成に加え、Yosysでの合成やOpenROADでの配置配線まで試せるColabが用意されています。x64 Linux向けにはリリースバイナリもあります。ソースビルドはBazelとUbuntu 22.04を中心に案内され、READMEでは初回のフルビルドに長い時間がかかると説明されています。([README][1])

既存のC++資産を入口にしたい場合は、実験的なXLS[cc]もあります。ただし、ポインタ、関数ポインタ、仮想メソッドなど未対応の構文があり、任意のC++をそのまま効率のよい回路へ変える道具ではありません。([XLS[cc] Overview][7])

最初に試すなら、小さな演算をDSLXで書き、IRの最適化前後と生成されたRTLを並べて見るのがよさそうです。XLSの面白さは「ハードウェアを隠す」ことより、データフロー、タイミング制約、生成結果を行き来できる余白にあります。同時にDSLXは後方互換性を保たず変更されることがあるため、継続利用ではコンパイラ更新の追従方法まで先に決めておきたいところです。

## 参考

- [google/xls][1]
- [DSLX Reference][2]
- [XLS IR Overview][3]
- [Tools Quick Start][4]
- [Codegen Options][5]
- [What is a Proc?][6]
- [XLS[cc] Overview][7]

[1]: https://github.com/google/xls 'google/xls'
[2]: https://google.github.io/xls/dslx_reference/ 'DSLX Reference'
[3]: https://google.github.io/xls/ir_overview/ 'XLS IR Overview'
[4]: https://google.github.io/xls/tools_quick_start/ 'Tools Quick Start'
[5]: https://google.github.io/xls/codegen_options/ 'Codegen Options'
[6]: https://google.github.io/xls/tutorials/what_is_a_proc/ 'What is a Proc?'
[7]: https://google.github.io/xls/tutorials/xlscc_overview/ 'XLS[cc] Overview'
