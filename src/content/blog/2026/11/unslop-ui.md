---
title: 'unslop-uiで見直すUIのバッジ：NEWを消してBetaを残す理由'
description: '同じバッジとして検出された2件のうち、消すのは1件だけ。unslop-uiのカウンターを小さなTSXファイルで試し、検出結果と画面上の役割を切り分けます。'
pubDate: 2026-11-22
heroImage: '/assets/blog/2026/11/unslop-ui.webp'
tags: ['UI', 'Agent Skills', 'React']
---

> [!NOTE]
> この記事はGPT-6.2 Astraが書き、人間がレビューしています

請求書の出力画面に「NEW」と「Beta」が並んでいます。どちらも短いバッジですが、片方を消すと、利用者には機能が試験提供中かどうか分からなくなります。スクリーンショットでは似ていても、コードで見るべき場所は文字列そのものではなく、その表示条件です。

unslop-uiは既存の画面を対象に、見出しを繰り返す説明や、状態と結びついていない装飾を見直すエージェント用スキルです。通常は文言や装飾を対象とし、余白や文字の太さまで見直すときには `--surface` を指定します。[1]

## 2件とも検出される理由

以下は説明用に作った `before.tsx` です。`beta` には実際の提供状態が渡り、`NEW` には新着を示す条件も掲載期限もないと仮定します。

```tsx
export function Plan({ beta }: { beta: boolean }) {
  return (
    <section>
      <span>NEW</span>
      <h2>請求書の出力</h2>
      {beta && <span>Beta</span>}
    </section>
  );
}
```

v0.6.0のリポジトリを取得し、上のファイルをその直下に置けば、エージェントを起動しなくても検出だけを試せます。次の `--max 1` はこの例のための上限です。

```sh
python3 skills/unslop-ui/scripts/count_tells.py --max 1 before.tsx
```

Python 3.9.6で試すと、`U9 badge word` は2件、合計も2件で、終了コードは1でした。U9は文字列とそれを囲むタグを見ます。`span` 内に単独で書かれた `Beta` は検出しますが、その外側の `beta &&` を評価して「必要な表示」と判定する処理はありません。[2]

そこで `before.tsx` を `after.tsx` にコピーし、`<span>NEW</span>` の行だけを削除しました。同じコマンドの対象を `after.tsx` に替えると、U9も合計も1件、終了コードは0です。残ったのは `Beta` です。これまで消すと件数は減っても、試験提供と通常提供を画面上で見分けられません。ここで実行したのはカウンターだけで、自動編集の精度や画面の使いやすさを測った結果ではありません。

## 残した表示をレビューする

スキル本体は編集前後の件数に加え、書き換えた文言、意図して残した箇所、確認が必要な項目を分けて報告します。[1] この例なら `Kept on purpose` に「`beta` が真のときだけ試験提供中と知らせる」と書けます。レビューではその説明を手がかりに、呼び出し元が本当に提供状態を渡しているかを確認できます。

同じ判断を複数の画面で繰り返すなら、v0.6.0ではプロジェクト直下の `.unslop-ui/taste.md` に、避けたい表現を `Bans`、残したい表示を `Keep` として記録できます。フォームのラベルや `aria-label` は禁止表現に当てはまっても削除しない方針です。[3] CIの上限をゼロにする前に、まず検出された表示を一つ開き、消した後も利用者が同じ判断をできるか確かめるほうが、この例には合っています。

## 参考

- [1] [unslop-ui v0.6.0のREADMEと使用例](https://github.com/felipebasurto/unslop-ui/tree/v0.6.0)
- [2] [カウンターの実装：badge_wordsと終了条件](https://github.com/felipebasurto/unslop-ui/blob/v0.6.0/skills/unslop-ui/scripts/count_tells.py)
- [3] [v0.6.0のリリースノート：BansとKeep](https://github.com/felipebasurto/unslop-ui/releases/tag/v0.6.0)
