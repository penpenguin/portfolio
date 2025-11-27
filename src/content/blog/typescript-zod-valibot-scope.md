---
title: 'Type だけじゃダメ？TypeScript と Zod / Valibot の守備範囲を整理する'
description: '「type で十分じゃない？」から出発して、どこまでを TypeScript に任せて、どこから Zod / Valibot に任せるべきかを実務目線で整理します。'
pubDate: 2025-11-21
tags: ['typescript', 'zod', 'valibot']
---

## Type だけじゃダメ？Zod / Valibot が必要になる理由を整理する

:::info
この記事はAIが書き、人間がレビューしています
:::

「**普通に `type` で型をつければよくない？**」

TypeScript を触っていると、一度はこう思うはずです。
そしてこれはかなり本質的な問いで、「どこまでを TypeScript に任せて、どこからを Zod / Valibot みたいなライブラリに任せるべきか？」という設計の話につながります。

この記事では、ざっくり次のあたりを整理します。

* TypeScript の `type` / `interface` が守ってくれる範囲
* なぜ実行時バリデーション（Zod / Valibot）が必要になるのか
* どこまでは `type` だけでよくて、どこからはスキーマライブラリを使うとコスパが良いか
* Zod / Valibot のざっくり比較と、実務での使い分けパターン
* 既存の `type` ベースのコードから徐々に移行するステップ

---

## このブログの前提

* TypeScript の基本文法（`type` / `interface` / `Promise` など）は既に分かっている想定
* React / API クライアントを触ったことがある人をイメージ
* ランタイムバリデーションは「テストの話」ではなく「プロダクションコードの話」として扱う

---

## 1. TypeScript の型は “図面”、実データは誰も見てない

まず一番大事な前提。

> **TypeScript の型はコンパイル時だけ存在して、実行時には消える**

です。

### シンプルな例

```ts
type User = {
  id: string;
  name: string;
};

function greet(user: User) {
  console.log(`Hello, ${user.name.toUpperCase()}`);
}

// どこかで…
const data = JSON.parse('{"id": 123, "name": null}');
greet(data as User); // コンパイルは通るが、実行時に落ちうる
```

ポイントはここです。

* `data as User` と書いた瞬間、TypeScript は「そうなんだ」と信じてしまう
* 実データが `{ "id": 123, "name": null }` でも、コンパイル時には一切怒らない
* そして `user.name.toUpperCase()` で実行時に落ちる可能性がある

つまり `type` / `interface` は、

* 「この関数には User 型の値が渡ってくる**はず**」という**約束**を表現しているだけで、
* 「本当に User か」を実行時にチェックしているわけではない

という役割です。

`unknown` / `any` の違いとか、`strictNullChecks` みたいな設定も、あくまで**コンパイル時の話**。
一度 JavaScript にトランスパイルされてしまえば、型情報はきれいさっぱり消えています。

---

## 2. 「外部との境界」で `type` は無力になりやすい

問題が露骨に出るのは、**アプリケーションの外部とデータをやりとりするところ**です。

典型的にはこの辺。

* HTTP API のレスポンス / リクエスト
* フロントのフォーム入力
* 設定ファイル（JSON / YAML）
* `localStorage` / `IndexedDB`
* `process.env` や環境変数
* 外部サービス / SaaS から飛んでくる Webhook やイベント

ざっくり言うと「**自分ではコントロールできない世界**」から入ってくるデータたち。

### API レスポンスに `type` をつけるだけだと？

```ts
type User = {
  id: string;
  name: string;
};

async function fetchUser(): Promise<User> {
  const res = await fetch("/api/user");
  const json = await res.json();
  return json as User; // or `return json;` でもコンパイルは通る
}
```

ここで、もしバックエンド側の誰かがレスポンスを変えてしまったら？

```json
{ "user_id": 1, "full_name": "Alice" }
```

という JSON を返すようになっても、

* TypeScript 的には **何も気づかない** のでコンパイルは普通に通る
* `user.name` を読んだところで `undefined` になり、その先でバグる

`type` はあくまで**図面**だけで、

> **届いた部品（レスポンス）が図面通りかどうかを確認してくれる人はいない**

という状態になっています。

---

## 3. Zod / Valibot の役割：図面 + 検査官を 1 つにまとめる

そこで出てくるのが **Zod** と **Valibot** みたいなスキーマライブラリです。

どちらもざっくり言うと、

> **スキーマ（Schema）を 1 回書けば**
>
> * TypeScript の型定義
> * 実行時のバリデーション
>
> の両方をそこから自動で得られる

という思想のライブラリです。

* Zod は「TypeScript-first」なスキーマ宣言 & バリデーションライブラリで、スキーマから型推論と実行時検証を両方提供します。([Zod][1])
* Valibot は TypeScript 向けのスキーマライブラリで、モジュール式 & ツリーシェイカブルな設計により、極小のバンドルサイズと型安全性を両立しています。([valibot.dev][2])

### 3.1 Zod の基本

```ts
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
});

// スキーマから型を推論
type User = z.infer<typeof UserSchema>;

async function fetchUser(): Promise<User> {
  const res = await fetch("/api/user");
  const json = await res.json();

  // ここで実行時に検査
  const parsed = UserSchema.parse(json); // 失敗したら例外が投げられる

  return parsed; // parsed は User 型として安全
}
```

ポイントは 2 つ。

* `UserSchema` が「User の図面」であり、「User を検査する関数」でもある
* `parse` を通った時点で、**実データがスキーマ通りであることが保証される**

`parse` は失敗すると例外を投げるので、API ハンドラなどでは `safeParse` を使って結果オブジェクトで扱う書き方もよくやります。

```ts
const result = UserSchema.safeParse(json);

if (!result.success) {
  // result.error にどのフィールドがダメか詳細が入っている
  console.error(result.error.format());
  throw new Error("invalid response");
}

const user: User = result.data;
```

Zod はプリミティブ・配列・Union・Intersection・Refine/Transform・JSON Schema 変換など、ひと通り揃っています。([Zod][3])

### 3.2 Valibot の基本

Valibot もやっていることはほぼ同じですが、API のスタイルが少し違います。

```ts
import * as v from "valibot";

const UserSchema = v.object({
  id: v.string(),
  name: v.string(),
});

// スキーマから出力型を推論
type User = v.InferOutput<typeof UserSchema>;

async function fetchUser(): Promise<User> {
  const res = await fetch("/api/user");
  const json = await res.json();

  // 失敗すると ValiError を投げる
  return v.parse(UserSchema, json);
}
```

Valibot の特徴的なところは **`pipe` による関数合成スタイル**です。([valibot.dev][4])

```ts
const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
});

type LoginInput = v.InferOutput<typeof LoginSchema>;

const result = v.safeParse(LoginSchema, unknownInput);

if (result.success) {
  const data: LoginInput = result.output;
} else {
  console.log(result.issues);
}
```

* `string()`, `email()`, `minLength()` のような小さな関数を `pipe` でつなぎ、
* それを `parse` / `safeParse` で実行時に検証 & 型付け

という形です。Valibot はモジュールごとに import するので、使っている関数だけがバンドルに入る設計になっています。([valibot.dev][2])

---

## 4. `type` だけで十分な場所 / 足りなくなる場所

全部に Zod / Valibot を刺す必要はありません。
現実的には、次のように切り分けるとコスパが良いです。

### 4.1 `type` だけで十分なケース

* **アプリ内部だけで完結しているデータ**

  * 例：サービス層内で定義したドメインオブジェクト
    （生成も利用も自分のコードだけで完結している）
* **すでに「入口」でバリデーション済みの中流のデータ**

  * 例：HTTP ハンドラ入口で Zod で `parse` → 以降は `type` ベースで処理
* **小さなスクリプト・テストコード**

  * 壊れても範囲が限定されていて、多少のクラッシュは許容できる場合

この辺は「図面通りのものしかそもそも作らない」世界なので、`type` 頼みでも破綻しにくいです。

### 4.2 Zod / Valibot が欲しくなるケース

* 外部 API のレスポンス / リクエスト
* フロントエンドのフォーム入力（文字列 → number / date / email など）
* 設定ファイル（JSON / YAML）
* `process.env`（必須 / 任意、型、範囲などのチェック）
* `localStorage` / `IndexedDB` に出し入れするデータ
* 外部サービス / SaaS から飛んでくる Webhook やイベント

まとめると、

> **「発生源を自分で完全にはコントロールできないデータ」にはスキーマライブラリを噛ませる価値が高い**

という整理になります。

---

## 5. 手書きバリデーションで頑張る場合との比較

「いや、Zod / Valibot 使わずに、普通に type guard 書けば良くない？」という選択肢もあります。

### 手書きでやるとこうなる

```ts
type User = {
  id: string;
  name: string;
};

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as any).id === "string" &&
    typeof (value as any).name === "string"
  );
}

function parseUser(value: unknown): User {
  if (!isUser(value)) {
    throw new Error("Invalid user");
  }
  return value;
}
```

これでも一応動きますが、

* `type User` と `isUser` で **同じ情報を二重管理** している
* `User` を変更したときに、`isUser` の修正漏れが起きうる
* ネスト・配列・Union などが増えると `isXxx` が一気に地獄化する
* どのフィールドがダメだったか、エラーメッセージを整形するのも全部自前実装

というつらさが出てきます。

Zod / Valibot は要するに、

> **「型定義 + バリデーションロジック」を宣言的に一箇所にまとめるための DSL**

だと思っておくと、採用判断がしやすくなります。

---

## 6. Zod vs Valibot をざっくり比較

細かい API の違いはドキュメントに任せるとして、実務で気になるところだけざっくり。

### 6.1 Zod

* TypeScript-first なスキーマ宣言 & バリデーションライブラリ
* プリミティブ / オブジェクト / Union / Intersection / transform / refine など一通り揃っている
* スキーマから TypeScript 型を自動推論（`z.infer`）([Zod][1])
* JSON Schema 変換などの周辺機能もある([GitHub][5])
* tRPC / React Hook Form / Hono などとの統合がかなり豊富で、「デファクトっぽい」ポジション ([kitchen-sink.trpc.io][6])

### 6.2 Valibot

* TypeScript 向けのスキーマライブラリ
* 小さな関数を `pipe` でつなぐ関数型スタイル
* スキーマから出力型・入力型を推論（`InferOutput` / `InferInput`）
* モジュール式 & ツリーシェイカブルで、バンドルサイズが非常に小さい（コアが < 1kB クラス）([valibot.dev][2])
* `parse` / `safeParse` / `is` / `assert` など Zod と似た API も提供([valibot.dev][7])
* Hono OpenAPI などとの連携や、Prisma/Drizzle/GraphQL から Valibot スキーマを生成するエコシステムも育ってきている ([valibot.dev][8])

ざっくりまとめると、

* **DX / エコシステム重視 → Zod**
* **バンドルサイズ / パフォーマンス重視 → Valibot**

という選び方がしやすいです。

---

## 7. 実務での使い分けパターン（API + フロントの一例）

実際のプロジェクトだと、だいたいこんな配置になることが多いです。

### 7.1 バックエンド（REST API サーバー）の例：入口だけ Zod

Express っぽい API サーバーを想像します。

```ts
import express from "express";
import { z } from "zod";

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

type CreateUserInput = z.infer<typeof CreateUserSchema>;

const app = express();
app.use(express.json());

app.post("/users", async (req, res) => {
  const result = CreateUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid request body",
      errors: result.error.format(),
    });
  }

  const input: CreateUserInput = result.data;

  // ここから先は "内部の世界"
  // type / interface だけで気持ちよく書ける
  const user = await createUser(input);

  res.status(201).json(user);
});
```

このパターンの考え方はシンプルで、

* 「外から入ってくる境界」＝ Zod / Valibot でガッチリ固める
* 一度バリデーションを通したら、その中は普通に `type` / `interface` で扱う

という二段構えです。

tRPC のような RPC 系のフレームワークでも、**入力スキーマに Zod を渡して、同じスキーマをフロントでも使い回す**、という使い方がよくされています。([kitchen-sink.trpc.io][6])

### 7.2 フロントエンドのフォーム + Valibot の例

フロント側のフォームは、**ユーザー入力**という最強の「信用ならないデータ源」なので、ここにもスキーマを噛ませると安心です。

```ts
import * as v from "valibot";

const LoginSchema = v.object({
  email: v.pipe(
    v.string(),
    v.email("メールアドレスの形式が正しくありません")
  ),
  password: v.pipe(
    v.string(),
    v.minLength(8, "8文字以上で入力してください")
  ),
});

type LoginInput = v.InferOutput<typeof LoginSchema>;
```

React コンポーネント側では、`safeParse` を使うと扱いやすいです。

```tsx
function LoginForm() {
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>(
    {}
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const raw = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const result = v.safeParse(LoginSchema, raw);

    if (!result.success) {
      // Valibot の issues をいい感じに整形して setErrors する
      const fieldErrors: Partial<Record<keyof LoginInput, string>> = {};
      for (const issue of result.issues) {
        const path = issue.path?.[0]?.key as keyof LoginInput | undefined;
        if (path) fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    const data = result.output; // LoginInput 型として安全
    setErrors({});
    // ここで fetch("/api/login", { body: JSON.stringify(data) }) など
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* input + errors.email の表示… といった感じ */}
    </form>
  );
}
```

* 入力 → Valibot で検証 → OK なら API へ
* サーバー側でも同じ Valibot スキーマを使って二重にチェック、という構成も取りやすいです

---

## 8. 既存 `type` 定義から Zod / Valibot に移行するステップ

「プロジェクトの途中から導入したい」ケースがほとんどだと思うので、移行ステップも軽く整理しておきます。

### ステップ 1: 「境界」を洗い出す

まずはコードベースをざっと眺めて、

* 外部 API を叩いているところ
* フォームの submit
* `process.env` を触っているところ
* 設定ファイルを読み込んでいるところ
* `localStorage` / `sessionStorage` / `IndexedDB` に出し入れしているところ

など、「外との境界」をリストアップします。

全部を一気に変えようとせず、**壊れるとまずいところ / 触る頻度が高いところ**から手を付けるのがおすすめです。

### ステップ 2: 既存 `type` からスキーマを起こす

たとえば、こんな `type` が既にあるとします。

```ts
// 既存
type User = {
  id: string;
  name: string;
};
```

最初の一歩としては、「型を変えずにスキーマだけ追加する」でも十分です。

```ts
import { z } from "zod";

type User = {
  id: string;
  name: string;
};

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
});
```

Valibot ならこう。

```ts
import * as v from "valibot";

type User = {
  id: string;
  name: string;
};

const UserSchema = v.object({
  id: v.string(),
  name: v.string(),
});
```

この段階では、`User` をそのまま使い続けても OK です。

### ステップ 3: `as` をやめて `parse` / `safeParse` に差し替える

よくあるパターン：

```ts
// Before
async function fetchUser(): Promise<User> {
  const res = await fetch("/api/user");
  const json = await res.json();
  return json as User;
}
```

これをスキーマ経由に置き換えます。

```ts
// After (Zod)
async function fetchUser(): Promise<User> {
  const res = await fetch("/api/user");
  const json = await res.json();
  return UserSchema.parse(json);
}
```

例外で落ちたくない箇所は `safeParse` にして、エラーを握りつぶすか、いい感じに整形して返すようにします。

Valibot 版もほぼ同じです。

```ts
// After (Valibot)
async function fetchUser(): Promise<User> {
  const res = await fetch("/api/user");
  const json = await res.json();
  return v.parse(UserSchema, json);
}
```

### ステップ 4: 「型の源泉」をスキーマに寄せる

慣れてきたら、`type` → スキーマの順ではなく、**スキーマ → 型** の順に切り替えると二重管理が減ります。

```ts
// Before
type User = {
  id: string;
  name: string;
};

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
});
```

を、

```ts
// After
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
});

type User = z.infer<typeof UserSchema>;
```

にするイメージです。Valibot なら `v.InferOutput<typeof UserSchema>`。([valibot.dev][4])

この状態になると、

* スキーマを書き換える
* それに応じて TypeScript の型も自動で更新される

ので、「スキーマと型がズレる」という事故が起きにくくなります。

### ステップ 5: 余裕があれば env / 設定ファイルも固める

最後に、落ちると地味につらい `process.env` や設定ファイルもスキーマ化しておくと安心です。

```ts
// Zod の例
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  DATABASE_URL: z.string().url(),
});

const env = EnvSchema.parse(process.env);

export type Env = z.infer<typeof EnvSchema>;
```

Valibot 版も同じように組めますし、`safeParse` + `fallback` を使えば「壊れたらデフォルト値で動かす」みたいな設計も取りやすいです。([valibot.dev][7])

---

## まとめ

最後に、この記事の内容をざっくり整理すると：

* TypeScript の `type` / `interface` は **コンパイル時の約束** であり、実行時のデータを検査してくれるわけではない

* 外部から入ってくるデータ（API, フォーム, env, 設定ファイル…）に `type` を付けるだけだと、**「そうであって欲しい」と信じているだけ** になりがち

* Zod / Valibot は、**スキーマを 1 回書くだけで「型定義」と「実行時バリデーション」を両取りする** ための仕組み
  → 「図面」と「検査官」を 1 つにまとめるイメージ

* 現実的には：

  * **内部の世界**（自分でしか触らないデータ）
    → `type` / `interface` だけで済ませて OK なことが多い
  * **外部との境界**（API, フォーム, env, 設定ファイル, Webhook など）
    → Zod / Valibot などで一度 `parse` / `safeParse` してから中に流す

* ライブラリ選定の目安はざっくりこんな感じ：

  * **エコシステム・情報量・安心感なら Zod**
    （tRPC / React Hook Form などとの連携も豊富）([kitchen-sink.trpc.io][6])
  * **バンドルサイズやエッジ環境のパフォーマンスを突き詰めるなら Valibot**
    （モジュール式 & ツリーシェイカブルで非常に小さい）([valibot.dev][2])

あとは、既存プロジェクトならいきなり全部を置き換えず、

1. 「外との境界」を洗い出す
2. クリティカルなところからスキーマを追加する
3. `as` キャストを少しずつ `parse` / `safeParse` に置き換える
4. 慣れてきたら「スキーマ → 型」の順に寄せていく

という感じで、少しずつ守備範囲を広げていくのが現実的かなと思います。

---

ここまで読んで「うちのコードベースだと、どこから手を付けるのが良さそうか？」がなんとなくイメージできていれば、この話はいったんゴールです。

[1]: https://zod.dev/?utm_source=chatgpt.com "Zod: Intro"
[2]: https://valibot.dev/?utm_source=chatgpt.com "Valibot: The modular and type safe schema library"
[3]: https://zod.dev/api?utm_source=chatgpt.com "Defining schemas"
[4]: https://valibot.dev/guides/introduction/?utm_source=chatgpt.com "Introduction"
[5]: https://github.com/colinhacks/zod?utm_source=chatgpt.com "colinhacks/zod: TypeScript-first schema validation with ..."
[6]: https://kitchen-sink.trpc.io/react-hook-form?utm_source=chatgpt.com "React Hook Form"
[7]: https://valibot.dev/guides/parse-data/?utm_source=chatgpt.com "Parse data"
[8]: https://valibot.dev/guides/ecosystem/?utm_source=chatgpt.com "Ecosystem"
