# STATUS

最終更新: 2026-10-10

## 現状

- `sort.mjs` の dry-run / `--apply` が動く(拡張子・日付の振り分け、同名スキップ、10分以内の新しいファイルは触らない)
- 判定AI(JEV)の呼び出しは `.env` に `JEV_API_KEY` があるときだけ。無ければ文書は「その他」
- ログ・Discord 通知・GAS への生存報告は実装済み。見張り役 GAS(`watch()`)はスライド p30 のコードをそのまま使う

## 決めたこと

- 確からしさ 0.6 未満は「要確認」フォルダへ(人間が見る)→ `decisions/2026-10-10_low-probability-to-human.md`

## 次の一手

- [ ] 自分の Downloads で dry-run を見て、RULES の拡張子を足す
- [ ] 毎朝 7:00 の定例を登録(Windows: タスクスケジューラ / Mac: launchd か cron)
- [ ] 見張り役 GAS を公開して `GAS_URL` を入れる
