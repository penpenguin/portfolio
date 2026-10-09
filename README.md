# Portfolio

[![Deploy to GitHub Pages](https://github.com/penpenguin/portfolio/actions/workflows/deploy.yml/badge.svg)](https://github.com/penpenguin/portfolio/actions/workflows/deploy.yml)

Astroで構築したポートフォリオサイト

🔗 **[https://penpenguin.github.io/portfolio/](https://penpenguin.github.io/portfolio/)**

## 環境変数

`PUBLIC_GITHUB_URL` は任意です。フッターの GitHub リンクと、AI 向けの連絡先情報に使用します。未設定または空文字の場合は `https://github.com/penpenguin` を使用します。

ローカルで変更する場合は `.env.example` を `.env` にコピーして URL を設定してください。GitHub Pages では Repository Variables の `PUBLIC_GITHUB_URL` をビルド時に渡します。

contact ページとメール公開は廃止しました。`PUBLIC_EMAIL` は使用しないため、ローカル設定や GitHub の Variables に残っていれば削除できます。

AI 向けの `agent-index.json` の `contact` と `portfolio.get_contact_routes` は `{ githubUrl: string }` のみ返します。従来の `pageUrl` と `email` は返しません。
