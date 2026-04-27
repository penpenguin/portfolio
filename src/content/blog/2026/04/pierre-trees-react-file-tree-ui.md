---
title: '@pierre/treesでファイルツリーUIをReactに組み込む'
description: 'path-firstなファイルツリーライブラリ@pierre/treesの導入、表示、検索、Gitステータス、コンテキストメニュー、入力データの準備を順番に確認します。'
pubDate: 2026-04-27
tags: ['React', 'UI', 'file-tree', '@pierre/trees']
---

> [!NOTE]
> この記事はGPT-5.5 Proが書き、人間がレビューしています

Webアプリケーションでファイル一覧を扱う場合、単にパスを並べるだけでは不十分なことがあります。たとえば、ディレクトリの開閉、ファイル選択、検索、Gitステータス表示、コンテキストメニュー、ドラッグ操作などを組み合わせると、独自実装の範囲がすぐに広がります。

`@pierre/trees` は、Web向けのファイルツリーUIライブラリです。公式READMEでは「Path-first file tree UI for the web」と説明されており、状態を内部IDではなく正規化されたパス文字列で扱う点が特徴です。また、パッケージにはVanilla API、React API、SSR用API、Web Components登録用エントリポイントが用意されています。

この記事では、Reactアプリケーションに `@pierre/trees` を組み込み、ファイルツリーを表示する基本手順を確認します。対象範囲は、インストール、最小表示、パス入力の考え方、検索、Gitステータス、コンテキストメニュー、入力データの準備までです。SSRや独自アイコンの詳細な作り込みは扱いません。

## @pierre/treesで何ができるかを確認する

まず、ライブラリの役割を整理します。`@pierre/trees` は、ファイルパスの配列を受け取り、それをディレクトリ階層として描画するためのUIライブラリです。

公式READMEによると、公開エントリポイントは次の4つです。

```txt
@pierre/trees
@pierre/trees/react
@pierre/trees/ssr
@pierre/trees/web-components
```

Reactで使う場合は、主に `@pierre/trees/react` から `FileTree` と `useFileTree` を読み込みます。`useFileTree` でモデルを作り、そのモデルを `<FileTree model={model} />` に渡して描画する構成です。公式READMEでも、この形のReact利用例が示されています。([GitHub][1])

`@pierre/trees` の大きなポイントは、ファイルツリーの公開状態がパス文字列を基準にしていることです。たとえば `src/App.tsx` を選択したり、`src/components/Button.tsx` にGitステータスを付けたりする場合、内部の数値IDではなく、アプリケーション側で扱っているパス文字列をそのまま使えます。

## Reactプロジェクトを作成してインストールする

ここでは、ViteのReact + TypeScriptテンプレートを使って動作確認します。既存のReactプロジェクトに組み込む場合は、`@pierre/trees` のインストールだけで構いません。

```bash
npm create vite@latest trees-demo -- --template react-ts
cd trees-demo
npm install
npm install @pierre/trees
npm run dev
```

公式READMEでは `bun add @pierre/trees` の例が示されていますが、npmパッケージとして公開されているため、npmやpnpmなどでも通常の依存関係として追加できます。jsDelivr上のパッケージ情報では、現時点のバージョンは `1.0.0-beta.3`、ライセンスは `apache-2.0` と表示されています。([GitHub][1])

この記事のサンプルでは、次のような構成を想定します。

```txt
trees-demo/
  package.json
  src/
    App.tsx
    main.tsx
```

インストール後は、`src/App.tsx` を編集してファイルツリーを表示します。

## 最小構成でファイルツリーを表示する

次に、ファイルパスの配列を渡してツリーを描画します。ここでは `paths` にファイル一覧を渡し、`initialExpansion: 'open'` で初期表示時にツリーを開いた状態にします。

```tsx:src/App.tsx
import { FileTree, useFileTree } from '@pierre/trees/react';

const paths = [
  'README.md',
  'package.json',
  'src/main.tsx',
  'src/App.tsx',
  'src/components/FileTreeDemo.tsx',
  'public/favicon.svg',
];

export default function App() {
  const { model } = useFileTree({
    paths,
    initialExpansion: 'open',
    search: true,
  });

  return (
    <main style={{ padding: 24 }}>
      <h1>File tree demo</h1>

      <FileTree
        model={model}
        header={<strong>Project files</strong>}
        style={{ height: 320 }}
      />
    </main>
  );
}
```

このコードでは、`useFileTree` がファイルツリーのモデルを作成します。`FileTree` コンポーネントは、そのモデルを受け取ってDOMに描画します。`search: true` を指定しているため、組み込みの検索UIも表示されます。

ブラウザでは、概ね次のような階層として表示されます。

```txt
Project files

README.md
package.json
public/
  favicon.svg
src/
  App.tsx
  main.tsx
  components/
    FileTreeDemo.tsx
```

ここで確認するポイントは、`paths` にはフラットな文字列配列を渡しているにもかかわらず、表示上はディレクトリ階層として組み立てられることです。`src/App.tsx` や `src/components/FileTreeDemo.tsx` のようなパスから、`src/` や `src/components/` がツリー上のディレクトリとして扱われます。

## pathsの入力ルールを理解する

`@pierre/trees` は、パスを中心にツリーを組み立てます。そのため、アプリケーション側では「どのファイルやディレクトリを表示するか」をパス文字列の配列として用意します。

たとえば、次のような入力を渡します。

```ts
const paths = [
  'README.md',
  'docs/',
  'docs/getting-started.md',
  'src/index.ts',
  'src/components/Button.tsx',
];
```

`docs/` のように末尾にスラッシュを付けたパスを含めると、ディレクトリそのものを入力として表現できます。ファイルだけで十分な場合は、`src/index.ts` のようなファイルパスから親ディレクトリが推論されます。

ネストが深いプロジェクトでは、単一の子ディレクトリが続くことがあります。その場合は `flattenEmptyDirectories: true` を使うと、空の中間ディレクトリを1行にまとめて表示できます。公式READMEのVanilla API例でも、このオプションが使われています。([GitHub][1])

```tsx
const { model } = useFileTree({
  paths: [
    'src/domain/user/model/User.ts',
    'src/domain/user/repository/UserRepository.ts',
    'README.md',
  ],
  initialExpansion: 'open',
  flattenEmptyDirectories: true,
});
```

この指定をすると、表示上は次のように深いディレクトリ列がまとまります。

```txt
README.md
src/domain/user/
  model/
    User.ts
  repository/
    UserRepository.ts
```

重要なのは、これは表示上の整理であり、アプリケーション側が扱うパスは引き続き `src/domain/user/model/User.ts` のような文字列である点です。選択状態やGitステータスなども、このパス文字列を基準に扱えます。

## 選択状態と検索状態を読む

ファイルツリーをUI部品として使う場合、どのファイルが選択されているかを外側の画面で使いたいことがあります。React向けAPIには、選択状態や検索状態を読むためのフックが用意されています。`@pierre/trees/react` は、`FileTree`、`useFileTree`、`useFileTreeSearch`、`useFileTreeSelection`、`useFileTreeSelector` をエクスポートしています。([GitHub][1])

次の例では、選択されたパス一覧を画面下部に表示します。

```tsx:src/App.tsx
import {
  FileTree,
  useFileTree,
  useFileTreeSearch,
  useFileTreeSelection,
} from '@pierre/trees/react';

const paths = [
  'README.md',
  'package.json',
  'src/main.tsx',
  'src/App.tsx',
  'src/components/FileTreeDemo.tsx',
  'public/favicon.svg',
];

export default function App() {
  const { model } = useFileTree({
    paths,
    initialExpansion: 'open',
    search: true,
  });

  const selectedPaths = useFileTreeSelection(model);
  const search = useFileTreeSearch(model);

  return (
    <main style={{ padding: 24 }}>
      <h1>File tree demo</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => search.open('tsx')}>
          tsxを検索
        </button>
        <button type="button" onClick={() => search.setValue(null)}>
          検索をクリア
        </button>
      </div>

      <FileTree
        model={model}
        header={<strong>Project files</strong>}
        style={{ height: 320 }}
      />

      <h2>Selected paths</h2>
      <pre>{JSON.stringify(selectedPaths, null, 2)}</pre>
    </main>
  );
}
```

`useFileTreeSelection(model)` は、選択されているパスの配列を返します。ファイルをクリックすると、`pre` 要素の内容が更新されます。

また、`useFileTreeSearch(model)` から取得した `search.open('tsx')` を呼び出すと、検索UIを開き、初期検索語として `tsx` を設定します。型定義上、検索状態には `open`、`close`、`setValue`、`matchingPaths` などが含まれます。([jsDelivr][2])

このように、ツリー内部の状態をReact側のUIと連動させられるため、ファイルプレビュー、詳細ペイン、検索ボタンなどと組み合わせやすくなります。

## Gitステータスを表示する

ファイルツリーでは、Gitの変更状態を行に表示したい場面があります。`@pierre/trees` では、`gitStatus` にパスとステータスの配列を渡せます。型定義では、ステータスとして `added`、`deleted`、`ignored`、`modified`、`renamed`、`untracked` が定義されています。([jsDelivr][3])

次の例では、`src/App.tsx` を変更済み、`src/components/FileTreeDemo.tsx` を未追跡ファイルとして渡します。

```tsx:src/App.tsx
import type { GitStatusEntry } from '@pierre/trees';
import { FileTree, useFileTree } from '@pierre/trees/react';

const paths = [
  'README.md',
  'package.json',
  'src/main.tsx',
  'src/App.tsx',
  'src/components/FileTreeDemo.tsx',
];

const gitStatus: GitStatusEntry[] = [
  { path: 'src/App.tsx', status: 'modified' },
  { path: 'src/components/FileTreeDemo.tsx', status: 'untracked' },
];

export default function App() {
  const { model } = useFileTree({
    paths,
    gitStatus,
    initialExpansion: 'open',
  });

  return (
    <main style={{ padding: 24 }}>
      <FileTree
        model={model}
        header={<strong>Project files</strong>}
        style={{ height: 320 }}
      />
    </main>
  );
}
```

実行すると、該当するファイル行にGitステータスが反映されます。ここでも、ステータス指定は内部IDではなくファイルパスで行います。

Gitステータスは、コードレビュー画面、オンラインIDE、ドキュメント管理画面などで使いやすい機能です。単なるファイル一覧ではなく、「どのファイルが変更されているか」をツリー内で確認できます。

## コンテキストメニューを追加する

ファイルツリーでは、右クリックメニューや行末のアクションボタンを使いたいことがあります。`@pierre/trees` では、`composition.contextMenu` を有効にし、React側で `renderContextMenu` を渡すことでコンテキストメニューを組み込めます。

公式READMEによると、コンテキストメニューを有効にして `triggerMode` を明示しない場合、既定では `right-click` になります。`button` または `both` を指定すると、右側のアクションレーンを使えます。([GitHub][1])

次の例では、右クリックとボタンの両方でメニューを開けるようにします。

```tsx:src/App.tsx
import { FileTree, useFileTree } from '@pierre/trees/react';

const paths = [
  'README.md',
  'package.json',
  'src/main.tsx',
  'src/App.tsx',
];

export default function App() {
  const { model } = useFileTree({
    paths,
    initialExpansion: 'open',
    composition: {
      contextMenu: {
        enabled: true,
        triggerMode: 'both',
      },
    },
  });

  return (
    <main style={{ padding: 24 }}>
      <FileTree
        model={model}
        header={<strong>Project files</strong>}
        style={{ height: 320 }}
        renderContextMenu={(item, context) => (
          <div
            role="menu"
            style={{
              padding: 8,
              background: 'Canvas',
              border: '1px solid ButtonBorder',
              borderRadius: 6,
            }}
          >
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(item.path);
                context.close();
              }}
            >
              Copy path
            </button>
          </div>
        )}
      />
    </main>
  );
}
```

この例では、メニューから `item.path` をクリップボードにコピーします。`item` には対象行の情報が渡されるため、プレビューを開く、削除確認を出す、リネーム処理に進む、といった操作に接続できます。

確認時は、ファイル行を右クリックするか、行末のアクションからメニューを開きます。`Copy path` を押すと、対象ファイルのパスがクリップボードにコピーされます。

## 大きなパス一覧はprepared inputとして渡す

ファイル数が多い場合や、同じパス一覧を何度も再利用する場合は、入力データを事前に準備してから渡せます。公式READMEでは、大きなパス一覧や頻繁に再読み込みされるパス一覧を一度prepareし、その結果を `FileTree` に渡す使い方が紹介されています。([GitHub][1])

`prepareFileTreeInput` は未整列の入力向け、`preparePresortedFileTreeInput` は最終的な順序がすでに決まっている入力向けです。型定義上も、この2つの関数が公開されています。([jsDelivr][4])

Reactでは、`useMemo` と組み合わせると扱いやすくなります。

```tsx:src/App.tsx
import { useMemo } from 'react';
import { prepareFileTreeInput } from '@pierre/trees';
import { FileTree, useFileTree } from '@pierre/trees/react';

const paths = [
  'README.md',
  'package.json',
  'src/main.tsx',
  'src/App.tsx',
  'src/components/FileTreeDemo.tsx',
  'src/features/files/FilePreview.tsx',
  'src/features/files/FileToolbar.tsx',
];

export default function App() {
  const preparedInput = useMemo(
    () =>
      prepareFileTreeInput(paths, {
        flattenEmptyDirectories: true,
      }),
    [],
  );

  const { model } = useFileTree({
    preparedInput,
    initialExpansion: 'open',
    search: true,
  });

  return (
    <main style={{ padding: 24 }}>
      <FileTree
        model={model}
        header={<strong>Project files</strong>}
        style={{ height: 320 }}
      />
    </main>
  );
}
```

このコードでは、`paths` から作ったprepared inputを `useFileTree` に渡しています。毎回パス配列からツリー構造を作り直すのではなく、入力を準備済みの形にして渡すため、パス一覧が大きい画面で検討しやすい構成になります。

## スタイルを変更する

`@pierre/trees` はShadow DOM内にツリーを描画します。公式READMEでも、ツリーはshadow root内にレンダリングされると説明されています。([GitHub][1])

そのため、通常のグローバルCSSで内部要素を直接指定するよりも、まずCSSカスタムプロパティやテーマ変換関数を使うのが基本です。READMEでは、`--trees-selected-bg-override`、`--trees-border-color-override`、`--trees-fg-override`、`--trees-theme-*` などのCSS変数や、`themeToTreeStyles()` が紹介されています。([GitHub][1])

たとえば、React側から最低限の見た目を調整する場合は、次のように `style` にCSS変数を渡せます。

```tsx
<FileTree
  model={model}
  header={<strong>Project files</strong>}
  style={
    {
      height: 320,
      border: '1px solid ButtonBorder',
      borderRadius: 8,
      '--trees-border-color-override': 'ButtonBorder',
      '--trees-fg-override': 'CanvasText',
    } as React.CSSProperties
  }
/>
```

CSS変数だけで足りない場合は、`unsafeCSS` でshadow root内にCSSを注入できます。ただし、READMEでも `unsafeCSS` はescape hatchとして扱い、まずホスト側のスタイル、CSS変数、`themeToTreeStyles()` から始めることが推奨されています。([GitHub][1])

```tsx
const { model } = useFileTree({
  paths,
  unsafeCSS: `
    button[data-type='item'][data-item-selected] {
      border-radius: 999px;
    }
  `,
});
```

この方法は内部構造に依存しやすいため、アプリケーション全体のテーマに合わせる程度ならCSS変数を優先したほうが安全です。

## 利用時の注意点

`@pierre/trees` は、現時点では `1.0.0-beta.3` として公開されています。beta版であるため、正式版に向けてAPIが変わる可能性があります。導入時は、公式READMEとパッケージの型定義を確認してから使うのが安全です。([jsDelivr][5])

また、状態管理はパス文字列が中心です。そのため、`paths`、`gitStatus`、選択状態、コンテキストメニュー処理で使うパス表現は揃えておく必要があります。たとえば、同じディレクトリを `docs` と `docs/` のように混在させると、意図しない扱いになる可能性があります。

スタイル面では、Shadow DOM内に描画されることを前提にします。通常のCSSで内部要素を細かく上書きするのではなく、CSS変数、テーマ変換、必要最小限の `unsafeCSS` の順に検討すると、ライブラリの更新に追従しやすくなります。

## まとめ

`@pierre/trees` は、ファイルパスの配列からファイルツリーUIを描画できるライブラリです。Reactでは `useFileTree` でモデルを作り、`FileTree` コンポーネントに渡すだけで基本的なツリーを表示できます。

この記事では、次の流れを確認しました。

- `paths` にファイルパスを渡してツリーを表示する
- `initialExpansion` や `flattenEmptyDirectories` で初期表示を調整する
- `useFileTreeSelection` と `useFileTreeSearch` で状態を読む
- `gitStatus` で変更状態を表示する
- `composition.contextMenu` と `renderContextMenu` でメニューを追加する
- 大きなパス一覧では `prepareFileTreeInput` を使う
- スタイル変更はCSS変数や `themeToTreeStyles()` を優先する

ファイルツリーは、オンラインIDE、ドキュメント管理、コードレビュー、管理画面のリソース一覧などでよく使われます。`@pierre/trees` は、選択、検索、Gitステータス、コンテキストメニューなどをパス基準で扱えるため、ファイル構造を中心にしたUIを作るときに検討しやすい選択肢です。

## 参考

- @pierre/trees 公式README。エントリポイント、React利用例、prepared input、スタイル、コンテキストメニューの説明を参照しました。([GitHub][1])
- jsDelivrの `@pierre/trees` パッケージ情報。バージョンとライセンスの確認に使用しました。([jsDelivr][5])
- `@pierre/trees` の型定義。Gitステータス、prepared input、Reactフックの公開API確認に使用しました。([jsDelivr][4])

[1]: https://github.com/pierrecomputer/pierre/tree/main/packages/trees "pierre/packages/trees at main · pierrecomputer/pierre · GitHub"
[2]: https://cdn.jsdelivr.net/npm/@pierre/trees@1.0.0-beta.3/dist/react/useFileTreeSearch.d.ts "cdn.jsdelivr.net"
[3]: https://cdn.jsdelivr.net/npm/@pierre/trees@1.0.0-beta.3/dist/types.d.ts "cdn.jsdelivr.net"
[4]: https://cdn.jsdelivr.net/npm/@pierre/trees@1.0.0-beta.3/dist/preparedInput.d.ts "cdn.jsdelivr.net"
[5]: https://www.jsdelivr.com/package/npm/@pierre/trees "@pierre/trees CDN by jsDelivr - A CDN for npm and GitHub"
