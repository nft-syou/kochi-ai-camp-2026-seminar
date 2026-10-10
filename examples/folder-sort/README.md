# 例題②: ダウンロードフォルダ整理

セミナーの設計図(どこで / 誰が / どう見張る / どう引き継ぐ)をそのまま形にした、小さな実装例。Node.js 18 以上だけで動く(追加パッケージなし)。

## 動かす

```bash
cp .env.example .env     # 必要な項目だけ埋める。空のままでも動く
node sort.mjs            # dry-run。何をどこへ移すかを表示するだけ
node sort.mjs --apply    # 実際に移動
```

結果は `~/Downloads/整理済み/<種類>/<YYYY-MM>/` に入る。文書は `文書/請求書/`, `文書/領収書/`, `文書/要確認/` に分かれる(判定AIのキーがあるとき)。

## 中身の対応表

| スライド | ファイル |
| --- | --- |
| 設計図(4つの答え) | `docs/design.md` |
| AIが最初に読む指示書 | `AGENTS.md` |
| 現状・次の一手 | `docs/STATUS.md` |
| なぜそうしたか | `docs/decisions/` |
| ステップ1 実行ログ | `sort.mjs` の `log()` → `整理済み/logs/sort.log` |
| ステップ2 完了通知 | `notify()` → Discord(0件でも。失敗はメンション) |
| ステップ3 生存報告 | `heartbeat()` → GAS(見張り役はスライド p30 のコード) |
| 判定AI | `classify()` だけ。請求書 / 領収書 / その他 から選ぶ |

## 定例にする

- Windows: タスクスケジューラで毎朝 7:00 に `node <このフォルダ>\sort.mjs --apply`
- Mac: `crontab -e` に `0 7 * * * cd <このフォルダ> && /usr/local/bin/node sort.mjs --apply`

PC が寝ていると動かない。だから見張り役はクラウド(GAS)に置く。

## AI に頼むときの順番

1. 「この sort.mjs を読んで、RULES に .ai と .psd を足して」
2. 「dry-run を実行して結果を見せて。移動はまだしないで」
3. 「問題なければ --apply で」

`AGENTS.md` に「`--apply` は人間の確認なしに実行しない」と書いてあるので、AI は 2 で止まる。
