---
title: 'PptxGenJS（pptxgenjs）解説：JavaScriptでPowerPointを自動生成する現実的なやり方'
description: 'Node.jsやブラウザから .pptx を生成できるPptxGenJSの基本、できること・できないこと、つまずきやすいポイントをまとめます。'
pubDate: 2026-02-15
tags: ['JavaScript', 'PowerPoint', 'Node.js', '自動化']
---

> [!NOTE]
> この記事はGPT-5.2 Proが書き、人間がレビューしています

「pptxjenjs」と書かれているのを見かけたら、だいたいは **PptxGenJS**（npmのパッケージ名は `pptxgenjs`）のことだと思って大丈夫です。JavaScriptでPowerPoint（.pptx）を“自動で組み立てて”出力できる、わりと珍しいタイプのライブラリです。([GitHub][1])

PowerPointを開いてコピペして整えて……という作業、正直しんどいですよね。とくに、毎週・毎月、同じ形で数字だけ差し替える資料は、いちばん機械に任せたい。PptxGenJSは、そこをまっすぐ狙ってきます。Node.jsでもブラウザでも動き、出力はOfficeの標準形式（OOXML）なので、PowerPointやKeynote、LibreOfficeなどで開けます（Google Slidesはインポート経由）。([GitHub][1])

ちなみに現時点の最新リリースは v4.0.1（2025年6月26日）です。バージョン差で挙動が変わることもあるので、チームで使うなら「どのバージョン前提か」を最初に揃えておくと後が楽です。([GitHub][1])

## PptxGenJSでできること（ざっくり）

できることはシンプルです。コードで「スライドを追加して、そこにテキスト・図形・画像・表・グラフなどのオブジェクトを配置していく」。それを最後に `.pptx` として書き出します。テキスト、表、図形、画像、チャート、メディアまで一通り揃っています。([GitHub][1])

もうひとつ便利なのが“型”です。会社のロゴ位置やフッター、ページ番号などを「マスター（Slide Master）」として定義し、以降のスライドに同じ骨格を適用できます。要するに、デザインのルールをコードに閉じ込められる。([gitbrent.github.io][2])

## どんな場面で刺さるか

人間が作る価値が高いのは、構成を考えることや、言葉を選ぶことです。逆に、決まった型に数字を流し込む作業は、人間がやるほどミスが増えます。

PptxGenJSが得意なのは、たとえばこんな場面です。

- 月次・週次のレポート（KPIの表、推移グラフ、コメント欄）
- 顧客別の提案書を大量に作る（表紙だけ差し替え、あとは同じ構造）
- ダッシュボードの“配布用スナップショット”をpptxで出したい
- フロントエンドで「エクスポート（PPTX）」ボタンを作りたい

ブラウザから直接 `.pptx` をダウンロードさせることもできます。ここは地味に強い。([gitbrent.github.io][3])

## まずは動かす：インストールと最初の1枚

Node.jsなら `npm install pptxgenjs`（または `yarn add pptxgenjs`）で入ります。ブラウザで素の `<script>` で使う場合は、bundle版を読み込むと依存（JSZip）込みで扱えます。([gitbrent.github.io][4])

Node環境の注意点として、公式ドキュメントではNode.js 18以上が案内されています。CIやサーバーのバージョンが古いと、思わぬところで詰まります。([gitbrent.github.io][5])

最小コードはこんな感じです（TypeScriptでもJavaScriptでもほぼ同じです）。

```ts
import pptxgen from 'pptxgenjs';

async function main() {
  // 1) プレゼンを作る
  const pptx = new pptxgen();

  // 2) スライドを足す
  const slide = pptx.addSlide();

  // 3) オブジェクトを置く（ここではテキスト）
  slide.addText('こんにちは、PptxGenJS', {
    x: 0.8,
    y: 0.8,
    w: 8.5,
    h: 0.6,
    fontSize: 28,
    color: '363636',
  });

  // 4) 書き出す
  await pptx.writeFile({ fileName: 'hello.pptx' });
}

main().catch(console.error);
```

流れは公式の「4ステップ」と同じで、やっていることも素直です。([gitbrent.github.io][6])

## いちばん大事な話：座標の単位は「インチ」

PptxGenJSを使ううえで、最初に体に入れておきたいのが座標系です。`x, y, w, h` は基本的に「インチ」で指定します（数値の場合）。加えて、`'50%'` のようにパーセント指定もできます。([gitbrent.github.io][7])

ここを理解すると、配置が急に安定します。逆にここがふわっとしていると、「環境によってズレる」「ちょっと直すたびに全体が崩れる」が起きます。

合わせて、スライドのサイズ（レイアウト）も最初に決めるのがコツです。標準レイアウトには `LAYOUT_16x9`（10 x 5.625 inches）などがあり、必要なら `defineLayout()` で独自サイズも定義できます。([gitbrent.github.io][8])

## “会社っぽさ”を出す：マスターをコードで持つ

資料がダサく見える最大の理由は、たいてい「毎回ちょっとずつ違う」からです。ロゴの位置、帯の高さ、タイトルの余白。これが揃うだけで、見た目は一段上がります。

PptxGenJSは `defineSlideMaster()` でマスターを定義できます。定義したマスターは `addSlide({ masterName: '...' })` で使います。([gitbrent.github.io][2])

```ts
import pptxgen from 'pptxgenjs';

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';

pptx.defineSlideMaster({
  title: 'MASTER',
  background: { color: 'FFFFFF' },
  objects: [
    // 上部に帯
    { rect: { x: 0, y: 0, w: '100%', h: 0.55, fill: { color: '0B1F3A' } } },
    // 左上タイトル（固定）
    {
      text: {
        text: '月次レポート',
        options: {
          x: 0.6,
          y: 0.12,
          w: 8,
          h: 0.3,
          color: 'FFFFFF',
          fontSize: 16,
        },
      },
    },
  ],
  slideNumber: { x: '92%', y: '93%', color: '666666' },
});

const slide = pptx.addSlide({ masterName: 'MASTER' });
slide.addText('今月のサマリー', {
  x: 0.6,
  y: 0.9,
  fontSize: 28,
  color: '111111',
});
```

プレースホルダーも用意できるので、「ここに画像を入れる」「ここにタイトルを流し込む」を名前で扱えるようになります。テンプレート運用がぐっとラクになります。([gitbrent.github.io][2])

## 表とグラフ：レポートっぽさの芯

グラフは `addChart()`、表は `addTable()` です。チャート種類は `pptx.ChartType` から選びます。([gitbrent.github.io][9])

```ts
const slide = pptx.addSlide({ masterName: 'MASTER' });

const data = [
  {
    name: 'Actual',
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    values: [1500, 4600, 5156, 3167],
  },
  {
    name: 'Projected',
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    values: [1000, 2600, 3456, 4567],
  },
];

slide.addChart(pptx.ChartType.line, data, { x: 0.8, y: 1.6, w: 8.6, h: 3.2 });
```

表は地味ですが強いです。PptxGenJSの表は、行がスライドからはみ出たら自動で次スライドへ送る「auto-paging」も用意されています。行数が増減するレポート系に、これが効きます。([gitbrent.github.io][10])

## HTMLの表を“そのまま”スライドにする裏技

Webアプリ側に既に `<table>` があるなら、`tableToSlides()` が刺さることがあります。HTMLのテーブルを1行でスライドに起こし、必要なら自動で複数枚に分割します。CSSはセルレベルまで反映されます（ただし万能ではなく、ネストしたテーブルなどは制約があります）。([gitbrent.github.io][11])

```js
const pptx = new pptxgen();
pptx.tableToSlides('tableElementId');
pptx.writeFile({ fileName: 'export.pptx' });
```

「見た目はアプリで作り込んでいる。配布だけpptxが欲しい」みたいなときに、上手くハマると気持ちいいやつです。([gitbrent.github.io][11])

## 書き出し：ブラウザとNodeで“同じメソッド、違う挙動”

`writeFile()` は共通の入口ですが、ブラウザではダウンロードが走り、Nodeではファイルとして保存されます。いずれもPromiseを返します。さらに `outputType` を指定してbase64 / Blob / Bufferなどで受け取ることもできます。圧縮（zip compression）を有効にするオプションもあります。([gitbrent.github.io][3])

このあたりは「どこで生成して、どこで配るか」を決めたうえで設計すると迷いません。サーバーで生成してS3に置くのか、ブラウザで生成してその場で落とすのか。どっちも選べます。([gitbrent.github.io][3])

## つまずきやすいポイント（先回りメモ）

最後に、地味に効く話をいくつか。

まず、フォントです。pptxは「フォント名」を指定しても、最終的に描画するのは閲覧側の環境です。相手のPCにないフォントは置き換わります。会社で標準フォントが決まっているなら、マスターやテーマで揃えるのが無難です（デフォルトフォントの設定も用意されています）。([gitbrent.github.io][8])

次に、メディアです。動画・音声は入れられますが、再生互換は環境依存になりがちです。オンライン動画（YouTube埋め込み）はMicrosoft 365でのサポート、といった前提もあります。デッキを配る相手の再生環境が読めないなら、動画は「サムネ＋リンク」に逃がすのが安全です。([gitbrent.github.io][12])

そして、座標の設計です。インチ指定は強力ですが、行き当たりばったりで数字を置くと、後から修正するたびに破綻します。マスターで余白・帯・フッターを固定し、本文領域だけを「ここに収める」と決める。PptxGenJSは、そういう作り方が似合います。([gitbrent.github.io][2])

[1]: https://github.com/gitbrent/PptxGenJS/tree/v4.0.1 'GitHub - gitbrent/PptxGenJS at v4.0.1'
[2]: https://gitbrent.github.io/PptxGenJS/docs/masters.html?utm_source=chatgpt.com 'Masters and Placeholders | PptxGenJS'
[3]: https://gitbrent.github.io/PptxGenJS/docs/usage-saving/?utm_source=chatgpt.com 'Saving Presentations | PptxGenJS - GitHub Pages'
[4]: https://gitbrent.github.io/PptxGenJS/docs/installation/?utm_source=chatgpt.com 'Installation | PptxGenJS - GitHub Pages'
[5]: https://gitbrent.github.io/PptxGenJS/docs/integration.html 'Integration by Environment | PptxGenJS'
[6]: https://gitbrent.github.io/PptxGenJS/docs/quick-start/?utm_source=chatgpt.com 'Quick Start Guide | PptxGenJS - GitHub Pages'
[7]: https://gitbrent.github.io/PptxGenJS/docs/api-text.html?utm_source=chatgpt.com 'Text | PptxGenJS'
[8]: https://gitbrent.github.io/PptxGenJS/docs/usage-pres-options/?utm_source=chatgpt.com 'Presentation Options | PptxGenJS'
[9]: https://gitbrent.github.io/PptxGenJS/docs/api-charts.html?utm_source=chatgpt.com 'Charts | PptxGenJS'
[10]: https://gitbrent.github.io/PptxGenJS/docs/api-tables.html?utm_source=chatgpt.com 'Tables | PptxGenJS'
[11]: https://gitbrent.github.io/PptxGenJS/docs/html-to-powerpoint.html?utm_source=chatgpt.com 'HTML to PowerPoint | PptxGenJS'
[12]: https://gitbrent.github.io/PptxGenJS/docs/api-media/?utm_source=chatgpt.com 'Media | PptxGenJS'
