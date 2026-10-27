# Portfolio

[![Deploy to GitHub Pages](https://github.com/penpenguin/portfolio/actions/workflows/deploy.yml/badge.svg)](https://github.com/penpenguin/portfolio/actions/workflows/deploy.yml)

Astroで構築したポートフォリオサイト

🔗 **[https://penpenguin.github.io/portfolio/](https://penpenguin.github.io/portfolio/)**

## 開発環境と依存関係

Node.js は `.nvmrc` の 26.12.1、npm は Node.js 付属のバージョンを使用します。npm の下限は `min-release-age` に対応した 11.10.0 です。nvm を使う場合のセットアップは次のとおりです。

```sh
nvm install
nvm use
npm ci
npm run dev
```

`.npmrc` でインストール時のスクリプトを無効化し、公開から3日以上経過したバージョンを選びます。依存追加時は完全なバージョン番号で保存し、非対応の Node.js / npm ではインストールを停止します。`npm run` で指定したスクリプトは実行できますが、付随する `pre` / `post` スクリプトは実行されません。

依存更新後は `npm audit`、`npm test -- --run`、`npm run lint`、`npm run check`、`npm run build` を実行してください。CI のテストとビルドは Node.js 付属の npm で `npm ci` を実行します。CI でも全依存を監査し、High 以上の脆弱性で停止します。`npm ci` は lockfile の固定バージョンを再現するため、更新時に監査結果と lockfile の差分を確認してください。

## 環境変数

`PUBLIC_GITHUB_URL` は任意です。フッターの GitHub リンクと、AI 向けの連絡先情報に使用します。未設定または空文字の場合は `https://github.com/penpenguin` を使用します。

ローカルで変更する場合は `.env.example` を `.env` にコピーして URL を設定してください。GitHub Pages では Repository Variables の `PUBLIC_GITHUB_URL` をビルド時に渡します。

contact ページとメール公開は廃止しました。`PUBLIC_EMAIL` は使用しないため、ローカル設定や GitHub の Variables に残っていれば削除できます。

AI 向けの `agent-index.json` の `contact` と `portfolio.get_contact_routes` は `{ githubUrl: string }` のみ返します。従来の `pageUrl` と `email` は返しません。
