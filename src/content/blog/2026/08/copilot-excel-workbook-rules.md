---
title: 'Copilot in Excelの「.Rules」は、ブックに指示を同梱する仕組み'
description: 'ブック固有の書式や数式の方針をCopilotに渡す「.Rules」ワークシートの構造と使いどころを整理します。'
pubDate: 2026-08-08
tags: ['Excel', 'Copilot', 'Microsoft 365']
---

> [!NOTE]
> この記事はGPT-5.5が書き、人間がレビューしています

Copilot in Excelの「ルール」は、ブック固有の指示を専用ワークシートに置く仕組みです。表の見た目や数式、レイアウトに関する約束を毎回プロンプトへ書かなくても、Copilotがそのブックを編集するときの前提にできます。設定がユーザーの手元に閉じず、ファイルと一緒に渡るところが肝です。([Microsoft Support（日本語）][1])

## 指示書をブックの中に置く

ルールを保存するワークシート名は `.Rules`。指示はA列に並べ、シートを表示したままにしておく必要があります。非表示にするとCopilotは参照しません。Copilotの「Add work content」から「Create workbook rules」を選んでテンプレートを作るほか、手動で作成したり、別のブックからコピーしたりもできます。([Microsoft Support（英語）][2])

この設計なら、月次レポートや見積書のテンプレートに、表の命名、数式の書き方、グラフの配色といった約束を添えて配れます。受け取る側が同じ設定を入れ直す必要はありません。個人の好みを保存する「Personalization」がアカウント単位で複数のブックに効くのに対し、`.Rules` は対象ファイルだけに付き、共有相手にも渡ります。似て見える二つですが、使う範囲が違います。([Personalize Copilot in Excel][3])

## ルールは短く、1セルに一つ

Microsoftは、指示を短く具体的にし、1セルに一つのルールを書くよう勧めています。`## NUMBERS` や `## CHARTS` のような見出しでまとめ、望む結果の短い例を添える構成です。長い運用規程をそのまま貼るより、Copilotが判断するときに必要な約束へ切り分けたほうが、あとから人間も直しやすくなります。

面白いのは、セルに固定文だけでなく数式も置ける点です。たとえばドロップダウンの値に応じて「KPIの要約だけを表示する」と「詳細表まで含める」を `IF` 関数で切り替えられます。実績データが入っているかどうかを `COUNTA` で判定し、予測だけを作るのか、予測と実績を比較するのかを変える例も公式ページにあります。ブックが再計算されると、Copilotは次のプロンプトで数式の出力を読み取ります。ルール自体を表計算の状態に連動させられるわけです。

## まずは壊したくない約束から

導入時は、すべての手順を書き尽くすより、「結合セルを使わない」「既存の命名を守る」など、崩れると修正が面倒な約束から置くのがよさそうです。その後、実際の編集結果を見ながらセル単位で足せます。

注意点もあります。Microsoftは、ルールを完全にサポートする言語は英語で、英語以外では動作が一貫しないと明記しています。利用モデルや時期によって挙動が変わる場合もあるため、`.Rules` を固定的な検証機構とみなすのは危険です。共有テンプレートへ組み込むなら、期待どおりの編集になるかを確認し、重要な数式や出力は人間が見直す。その前提なら、口頭や別紙に散っていたExcelの作法を、ファイルのすぐ隣へ戻せます。

## 参考

- [Excel ルールで Copilot を使用してブックのガイドラインを作成する][1]
- [Create guidelines for a workbook with Copilot in Excel rules][2]
- [Personalize Copilot in Excel][3]

[1]: https://support.microsoft.com/ja-jp/excel/copilot/copilot-in-excel-rules
[2]: https://support.microsoft.com/en-us/excel/copilot/copilot-in-excel-rules
[3]: https://support.microsoft.com/en-us/excel/copilot/copilot-in-excel-personalization
