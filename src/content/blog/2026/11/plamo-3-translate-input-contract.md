---
title: 'PLaMo 3 Translateを組み込む前に読む、翻訳専用の入力形式'
description: '小型モデルを支える学習の工夫と、原文・用語集・文体を分けるPFML3。重みを読み込まずに公式テンプレートを動かし、汎用チャットとの違いを確かめます。'
pubDate: 2026-11-07
heroImage: '/assets/blog/2026/11/plamo-3-translate-input-contract.webp'
tags: ['PLaMo', 'LLM', '翻訳', 'ローカルAI']
---

> [!NOTE]
> この記事はGPT-6 Astraが書き、人間がレビューしています

PLaMo 3 Translateは、Preferred Networks（PFN）が重みを公開した翻訳特化LLMです。0.8B、2B、8B、31Bの4サイズがあり、日本語・英語を含む53言語に対応します。GGUFやMLX形式も用意され、外部の翻訳APIへ原文を送らない構成を選べます。ただし、公開されたのはモデルです。公式動画のスマートフォン翻訳は社内デモであり、完成したアプリの配布ではありません。

組み込みで先に確認したいのは、小ささだけでなく入力の作り方。汎用チャットのように「あなたは翻訳者です」とsystemメッセージを置くのではなく、原文と翻訳条件を分けて渡します。

## 小型化の前に、教師データを磨いている

[開発ブログ](https://www.preferred.jp/ja/blog/tech/plamo-3-translate-weight-release)では、2段階の教師あり微調整（SFT）と、好ましい訳文を選びやすくするDPOを説明しています。8B以下には、その間に31Bモデルからの蒸留が入ります。

特徴的なのが、学習用の訳文を一度の生成で決めない点です。複数候補をトーナメント式に比べ、勝った訳へ負けた訳の良い部分も取り込む。さらに逆方向の学習では、合成訳文から人が書いた自然な原文を出すペアを作ります。単なる左右の入れ替えではなく、翻訳で失われた情報に合わせて原文も調整する方式です。

小型モデルへの蒸留でも、完成した訳文を真似るだけではありません。参照訳の系列と、生徒モデル自身が生成した系列の両方で、教師の次トークン分布を学びます。正解に沿って進む場面だけでなく、生徒自身の出力に続く場面も学習対象にする設計です。

性能の数字は読み分けが必要です。PFNの比較には独自のPFTB・SaaSベンチマークが含まれ、多言語評価も対応53言語すべての全組合せではありません。「小型でも有力な候補」とは読めても、手元の契約書や専門文書の品質まで保証する結果ではありません。

## 原文はuser、条件はテンプレート引数へ

[公式モデルカード](https://huggingface.co/pfnet/plamo-3-translate-0.8b/blob/main/README_ja.md)では、`apply_chat_template()`の`target_lang`で翻訳先を指定します。参考文脈は`context`、用語集は`glossary`、日本語の敬体・常体は`form`です。原文へ指示文を継ぎ足すのではなく、それぞれ別の欄に入れます。

内部では、これらがPFML3という特殊トークンで区切られた文字列に変換されます。`dataset`が翻訳タスク、`input`が原文、`output`が翻訳先と文体を表し、空の`output`本文に続けて訳文を生成します。用語集は独立した`glossary`要素です。

この境界を、重みをダウンロードせずに確認してみます。以下はこの記事用のテンプレート検証で、翻訳推論ではありません。PythonとJinja2 3.1.6を使い、公式リポジトリのリビジョンを固定して実行しました。`python -m pip install Jinja2==3.1.6`で依存を用意し、次をファイルに保存して実行できます。初回のテンプレート取得にはネット接続が必要です。

```python
from urllib.request import urlopen
from jinja2.sandbox import ImmutableSandboxedEnvironment

revision = "cc8e88169807d5a272e8ff06db12eb0129b67f81"
url = (
    "https://huggingface.co/pfnet/plamo-3-translate-0.8b/raw/"
    f"{revision}/chat_template.jinja"
)
with urlopen(url, timeout=30) as response:
    source = response.read().decode("utf-8")


def reject(message):
    raise ValueError(message)


env = ImmutableSandboxedEnvironment()
env.globals["raise_exception"] = reject
template = env.from_string(source)
options = dict(
    bos_token="<|plamo:bos|>",
    add_generation_prompt=True,
    target_lang="ja",
)
text = {"role": "user", "content": "Please open the project dashboard."}
bad = [
    {"role": "system", "content": "Translate into Japanese."},
    {"role": "assistant", "content": "OK"},
    text,
]
try:
    template.render(messages=bad, **options)
except ValueError as error:
    assert str(error) == (
        "System messages are not supported; use context for reference text."
    )
    print("rejected:", error)
else:
    raise AssertionError("system role was unexpectedly accepted")

prompt = template.render(
    messages=[text],
    glossary=[{"source": "dashboard", "target": "管理画面"}],
    form="polite",
    **options,
)
expected = (
    "<|plamo:bos|><|plamo:tag|>dataset<|plamo:msg|>translation"
    "<|plamo:tag|>glossary<|plamo:index|>dashboard<|plamo:item|>管理画面"
    "<|plamo:tag|>input<|plamo:msg|>Please open the project dashboard."
    "<|plamo:tag|>output<|plamo:key|>lang<|plamo:val|>ja"
    "<|plamo:key|>form<|plamo:val|>polite<|plamo:msg|>"
)
assert prompt == expected
print("valid: exact PFML3 match")
```

実行結果は次のとおりです。失敗側はsystemロールに対する意図した例外、修正側は生成した文字列の完全一致を確認しています。

```text
rejected: System messages are not supported; use context for reference text.
valid: exact PFML3 match
```

失敗側を3メッセージにしたのは、先に「メッセージ数は奇数」という検査へ引っ掛からず、systemロールの検査を確かめるためです。実装でも、一般的なチャットクライアントが自動挿入するsystemメッセージには注意が要ります。

この検証で分かるのは入力の組み立て方まで。用語集を渡した事実は確認できますが、訳語の遵守率、翻訳品質、速度、必要メモリは測っていません。実際の統合では公式のTransformersやvLLMの例を使い、生成した訳文を別途評価する必要があります。

## 導入時は、履歴・長さ・ライセンスを別々に確認する

文書を段落ごとに訳す場合、過去の原文を`user`、その訳文を`assistant`として交互に並べ、最後の`user`に今回の原文を置けます。ただし履歴は自動保存されません。次のリクエストへ必要なペアを渡すのはアプリ側の仕事です。

学習時の最大長は、入力と出力を合わせて32,768トークン。原文だけでなく、履歴・参考文脈・用語集と訳文の余地も数えます。実行環境側の上限がそれより小さければ、そちらに合わせます。長い文書を扱うなら、モデルサイズを上げる前に、段落分割と残す履歴を決めたいところです。

また、オープンウェイトは無条件の商用利用を意味しません。公式説明では私的・非商用利用は事前登録不要ですが、商用利用は利用者または関係会社の直近事業年度の収入・売上が10億円以下なら事前登録が必要で、超える場合は別途契約が必要です。[ライセンス本文](https://plamo.preferredai.jp/info/plamo-community-license-ja)は組織内部での利用も商業目的に含め、第三者への提供や生成物の公表にも表示などの条件を定めています。社内だけで使う場合も確認対象です。

試すなら、まず対象環境に合う小型モデルで、実際に使う短い原文と用語集を固定する。条件を正しく渡せることと、その条件で満足する訳が出ることを分けて確かめれば、上位サイズと比べる理由もはっきりします。

## 参考

- [PFN：PLaMo 3 Translateの重み公開と開発秘話](https://www.preferred.jp/ja/blog/tech/plamo-3-translate-weight-release)
- [PFN：オープンウェイト公開のお知らせ](https://www.preferred.jp/ja/news/pr20261105)
- [PLaMo 3 Translate 0.8B 日本語モデルカード](https://huggingface.co/pfnet/plamo-3-translate-0.8b/blob/main/README_ja.md)
- [検証に使った公式チャットテンプレート（固定リビジョン）](https://huggingface.co/pfnet/plamo-3-translate-0.8b/blob/cc8e88169807d5a272e8ff06db12eb0129b67f81/chat_template.jinja)
- [PLaMoコミュニティライセンス契約](https://plamo.preferredai.jp/info/plamo-community-license-ja)
