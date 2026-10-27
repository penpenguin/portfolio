---
title: 'Z3とTLA+で実装を問い直す——反例から仕様を揃える'
description: 'エラーを否定すると許可に化ける判定と、上限確認・記録の間で起きる競合をZ3とTLCで検査。実行できるモデル、反例、修正前後の結果から仕様の決め方を追う。'
pubDate: 2026-10-26
heroImage: '/assets/blog/2026/10/formal-methods-counterexamples.webp'
tags: ['形式手法', 'Z3', 'TLA+']
---

> [!NOTE]
> この記事はGPT-6 Astraが書き、人間がレビューしています

「エラーなら拒否する」「上限を超えて受け付けない」。個々の関数を見ると守れていそうな約束でも、否定を付けたり処理の間に別の要求が入ったりすると崩れます。形式手法を試すなら、まずこうした短い約束を一つ、機械に否定させてみるのが取り組みやすい入口です。

出発点は、[「実装コードから仕様を吸い出して Z3 / TLA+ でバグを払い出す」](https://gist.github.com/mizchi/db7817e6fc077d567c41cd9d41bb1c53)というプレイブック。既存コードの挙動を取り出す、モデルにして反例を探す、反例が意図した挙動かを人に確認する、という順で進めます。理想の仕様だけを書くのでも、現在の実装を無条件に正しいとするのでもありません。

以下では元資料の二つのパターンを、小さな教育用モデルとして具体化します。コードと実行結果は本記事で追加したもので、元資料の実システムにバグを発見したという報告ではありません。

## Z3：エラーを否定したら、許可になった

ルール判定に「条件を反転する」設定があるとします。取得に成功したかを `ok`、条件に一致したかを `match`、反転指定を `invert` と置きます。確認したい約束は「取得失敗なら、反転指定にかかわらず拒否」です。

ところが、不一致と取得失敗を同じ `false` にまとめ、その後で反転するとどうなるでしょう。

```python
collapsed = ok and match
allowed = not collapsed if invert else collapsed
```

`ok=false` なら `collapsed=false`。そこに `invert=true` が重なると、`allowed=true` になってしまいます。失敗の情報を先に捨てたため、正常な不一致と区別できなくなったわけです。

Z3には、約束そのものではなく「約束を破る入力があるか」を問いかけます。次は同梱した[実行用Pythonコード](/portfolio/assets/blog/2026/10/formal-methods-counterexamples/error_negation.py)の中心部分です。Z3の記号式にはPythonの `and` や `not` ではなく、`And`、`Not`、`If` を使います。

```python
from z3 import And, Bools, If, Not, Solver

ok, match, invert = Bools("ok match invert")
collapsed = And(ok, match)
broken = If(invert, Not(collapsed), collapsed)
fixed = And(ok, If(invert, Not(match), match))

solver = Solver()
solver.add(Not(ok), broken)  # 取得に失敗したのに、許可される入力
print(solver.check())
print(solver.model())
```

修正版の `fixed` は、成功確認を反転の外に置いています。同梱コードは両方に同じ違反条件を与え、期待した判定と違えば失敗するようにしてあります。Python 3.11と `z3-solver==5.3.2.0` で実行した結果は次のとおりです。

```text
broken: sat
  ok=false, match=false, invert=true
fixed: unsat
```

`sat` は「与えた条件を満たす入力がある」。今回は違反条件を与えたので、見つかった入力が反例です。`match=false` は得られた一例で、取得失敗時の実際の一致・不一致を確定したわけではありません。`unsat` は「この条件を満たす入力はない」。修正版について確認できたのは、あくまでこのBooleanモデルで「失敗なのに許可」が起きないことです。一般の問題ではZ3が `unknown` を返す場合もあり、それを安全という意味には読めません。

ここで仕様担当へ渡す問いは、「取得失敗を不一致と同じものとして扱うのか、それとも反転不能なエラーとして扱うのか」です。拒否を選ぶなら上の修正になりますが、可用性のために別の扱いを選ぶなら、その条件を明文化する必要があります。ソルバーが業務上の正解まで決めるわけではありません。

なお、この例はBoolean変数が三つだけなので、普通のテストで全組み合わせを調べても十分です。Z3を使う狙いは書き方を学ぶこと。元資料が挙げる設定条件の矛盾や、旧ルールと新ルールで判定が変わる入力の探索へ広げるときに、同じ「違いを満たす入力を探す」という形が使えます。

## TLA+：上限確認と記録の間に、もう一件入る

次は入力値ではなく、処理の順番です。上限は1件、要求はAとBの2件。それぞれ一度だけ実行し、「現在の受付件数を確認する」と「受付件数を増やす」が別々の操作になっているとします。

TLA+では状態と遷移を記述し、TLCというモデル検査器で到達可能な状態を探索します。今回は `served` を記録済みの受付件数、`phase` を各要求の進行状態として、守りたい条件に名前を付けました。

```text
NeverOverCap == served <= Cap
```

[モデル全文（Quota.tla）](/portfolio/assets/blog/2026/10/formal-methods-counterexamples/Quota.tla)は、確認だけを行う `Check` と、確認済みの要求を記録する `Record` を分けています。[Naive.cfg](/portfolio/assets/blog/2026/10/formal-methods-counterexamples/Naive.cfg)でTLCを実行すると、次の反例が出ました。表は実際の状態列を、操作の意味が分かるように読み替えたものです。

| 段階 | 操作              | Aの状態  | Bの状態  | 記録済み件数 |
| ---- | ----------------- | -------- | -------- | ------------ |
| 初期 | まだ何もしない    | 未処理   | 未処理   | 0            |
| 1    | Aが上限未満と確認 | 承認済み | 未処理   | 0            |
| 2    | Bも上限未満と確認 | 承認済み | 承認済み | 0            |
| 3    | Aを記録           | 完了     | 承認済み | 1            |
| 4    | Bを記録           | 完了     | 完了     | 2            |

```text
Error: Invariant NeverOverCap is violated.
```

各要求だけを順にテストすると見逃しやすい、確認と記録の間への割り込みです。ここでは記録件数の増加を反例にしていますが、「承認した時点で利用を許す」実装なら、危険な判断は両方が承認済みになった段階で起きています。

修正版では、空きの確認と枠の確保を一つの遷移 `Reserve` にまとめました。主要な式はこうなります。

```text
served' = IF served < Cap THEN served + 1 ELSE served
```

プライム記号の `served'` は次の状態の値です。モデルでは、この判定と更新の途中に別の要求は割り込めません。同じ2要求・上限1で [Atomic.cfg](/portfolio/assets/blog/2026/10/formal-methods-counterexamples/Atomic.cfg) を実行すると、到達する異なる状態は4つで、不変条件違反は出ませんでした。

```text
Model checking completed. No error has been found.
6 states generated, 4 distinct states found, 0 states left on queue.
```

ただし、コードを一つの関数にまとめるだけでは、この原子性は得られません。実装側にも、条件付き更新や適切なトランザクションなど、確認と確保を分割させない仕組みが必要です。プロセス内のロックなら、複数プロセスから同じ上限を更新する場合も守れるのかを別に確認します。

このモデルは競合を示すための最小例です。クラッシュ、予約の解放、重複要求、読み取り遅延は入れていません。一定時間内に要求が完了する、といった活性も検査していません。「この有限モデルで上限違反を検出しなかった」と「本番がどの障害下でも正しい」は、分けて読む必要があります。

## 同じ結果を手元で確かめる

上記のリンクからPythonコード、TLA+モデル、二つの設定ファイルを同じディレクトリに保存します。Z3の例は、[uv](https://docs.astral.sh/uv/guides/scripts/#running-a-script-with-dependencies)を使うなら次のコマンドで実行できます。初回はPythonや依存パッケージの取得にネットワークが必要です。

```sh
uv run --python 3.11 --with z3-solver==5.3.2.0 error_negation.py
```

TLCの例は、[TLA+ tools v1.7.4](https://github.com/tlaplus/tlaplus/releases/tag/v1.7.4)から `tla2tools.jar` を取得し、Javaが使える環境で実行します。本記事ではTemurin Java 21.0.13、同リリースに含まれるTLC 2.19で確認しました。

```sh
java -XX:+UseParallelGC -cp tla2tools.jar tlc2.TLC -workers 1 -config Naive.cfg Quota.tla
java -XX:+UseParallelGC -cp tla2tools.jar tlc2.TLC -workers 1 -config Atomic.cfg Quota.tla
```

最初のコマンドは意図的に不変条件を破り、終了コード12になります。二つ目は終了コード0です。前者をCIに置くなら、単に成功終了を求めるのではなく、狙った不変条件の違反が出たことを確認します。構文エラーでも非ゼロになるため、終了コードだけで反例を検出できたと判断しないでください。

## 反例を出してからが、仕様を決める作業

元資料で実務に持ち帰りたいのは、検査結果を台帳にして人へ返す部分です。今回の例なら、少なくとも次のように整理できます。

| 実装に期待したこと     | 機械で確認したこと                              | 人が決めること                                 |
| ---------------------- | ----------------------------------------------- | ---------------------------------------------- |
| 取得失敗なら許可しない | 失敗を `false` に畳んでから反転すると許可される | 失敗と不一致を区別するか。反転は何に作用するか |
| 上限1件を超えない      | 確認と記録を分けると2件とも通る順序がある       | 上限は厳密な制約か目安か。いつ枠を消費するか   |

既存コードを調べるときも、コメントやテストに書かれた期待と、実際の分岐を別々に控えます。「この入力を渡すとこうなる」という純粋な判定関数を切り出し、空値・エラー・否定・境界値を含めて比較する。反例を合意した仕様へ落としたら、その入力を実装の回帰テストにも残す。モデルだけを直して終わらせないための一歩です。

今回も、壊れた版と修正版へ同じ性質を問い、違反の有無が変わることを確認しました。元資料が勧める broken-variant の考え方です。ガードを外した版まで検査が通るなら、モデルや検査条件のほうを疑えます。ただし、壊れた例を捕まえたことだけで検査の網羅性が証明されるわけではありません。

実装との対応をさらに調べるなら、判定結果をプロパティベーステストで比較したり、実ログの操作列がモデルに許された振る舞いかを検査したりする方法があります。ただし、ログに残していない内部操作や、まだ観測していない実行経路までは保証できません。本記事の実行例でも、実システムとの照合は行っていません。

全部を形式化するより、まず仕様が曖昧で、壊れると困る約束を一つ選ぶ。その約束を破る具体的な入力や順序を持って、「これは許してよい挙動か」と聞く。Z3やTLCの出力を、開発者だけが読む結果から仕様を決める材料へ変えるのは、その問いです。

## 参考

- [実装コードから仕様を吸い出して Z3 / TLA+ でバグを払い出す — 実践プレイブック](https://gist.github.com/mizchi/db7817e6fc077d567c41cd9d41bb1c53)
- [Online Z3 Guide: Introduction](https://microsoft.github.io/z3guide/docs/logic/intro/)
- [Z3Py Guide](https://ericpony.github.io/z3py-tutorial/guide-examples.htm)
- [TLA+ tools公式リポジトリ](https://github.com/tlaplus/tlaplus)
- [TLCのモデル設定について（公式ドキュメント）](https://github.com/tlaplus/tlaplus/blob/master/toolbox/org.lamport.tla.toolbox.doc/html/model/about-models.html)
