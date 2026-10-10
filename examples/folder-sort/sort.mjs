#!/usr/bin/env node
// ダウンロードフォルダ整理。セミナーの例題②の実装例。
//
//   担当の分け方(スライド p17)
//     拡張子・日付で振り分ける            → プログラム(このファイルの大半)
//     「請求書・領収書・その他」から選ぶ   → 判定AI(JEV。classify() だけ)
//     整理ルールを考える・このコードを書く → 生成AI(作るときだけ)
//
//   見張り(スライド p24〜p32)
//     ステップ1 実行ログを1行残す(logs/sort.log。成功も0件も)
//     ステップ2 終わったら Discord に通知(0件でも。失敗はメンション)
//     ステップ3 成功したら GAS に生存報告(別の場所の見張り役が読む)
//
// 使い方:  node sort.mjs            … 何をするかを表示するだけ(dry-run)
//          node sort.mjs --apply    … 実際に移動する
// 設定:    .env(.env.example をコピー)。無ければ判定AI・通知・生存報告は飛ばす
import { readdirSync, statSync, mkdirSync, renameSync, existsSync, readFileSync, appendFileSync } from "node:fs";
import { join, extname, basename } from "node:path";
import { homedir } from "node:os";

// ---------- 設定 ----------
loadDotEnv();
const APPLY = process.argv.includes("--apply");
const SRC = process.env.SOURCE_DIR || join(homedir(), "Downloads");
const DEST = process.env.DEST_DIR || join(SRC, "整理済み");
const LOG = join(DEST, "logs", "sort.log");
const MIN_AGE_MIN = Number(process.env.MIN_AGE_MINUTES ?? 10); // ダウンロード中のファイルを触らない

// 拡張子 → フォルダ。ここは「ルールを書き切れる」のでプログラム
const RULES = {
  画像: [".png", ".jpg", ".jpeg", ".gif", ".webp", ".heic", ".svg"],
  動画: [".mp4", ".mov", ".webm", ".mkv"],
  音声: [".mp3", ".m4a", ".wav", ".flac"],
  文書: [".pdf", ".docx", ".xlsx", ".pptx", ".txt", ".md", ".csv"],
  圧縮: [".zip", ".7z", ".rar", ".gz", ".tar"],
  インストーラ: [".exe", ".msi", ".dmg", ".pkg", ".apk"],
};

// ---------- 本体 ----------
const t0 = Date.now();
const result = { moved: 0, skipped: 0, classified: 0, errors: [] };
try {
  const files = readdirSync(SRC, { withFileTypes: true })
    .filter((d) => d.isFile() && !d.name.startsWith(".") && !d.name.endsWith(".crdownload") && !d.name.endsWith(".part"))
    .map((d) => join(SRC, d.name))
    .filter((p) => Date.now() - statSync(p).mtimeMs > MIN_AGE_MIN * 60_000);

  for (const path of files) {
    const st = statSync(path);
    const ext = extname(path).toLowerCase();
    const kind = Object.keys(RULES).find((k) => RULES[k].includes(ext)) ?? "その他";
    let sub = "";
    if (kind === "文書") {
      // ここだけ判定AI。請求書 / 領収書 / その他 から選ぶだけ
      const c = await classify(path);
      if (c) { sub = c.choice; result.classified++; }
    }
    const month = new Date(st.mtimeMs).toISOString().slice(0, 7); // YYYY-MM
    const dir = join(DEST, kind, sub, month);
    const to = join(dir, basename(path));
    console.log(`${APPLY ? "移動" : "予定"}: ${basename(path)} → ${kind}${sub ? "/" + sub : ""}/${month}/`);
    if (APPLY) {
      mkdirSync(dir, { recursive: true });
      if (existsSync(to)) { result.skipped++; continue; } // 同名は上書きしない
      renameSync(path, to);
      result.moved++;
    }
  }
} catch (e) {
  result.errors.push(String(e.message || e)); // 握りつぶさない。下で必ず通知する
}

// ---------- 見張り ----------
const sec = ((Date.now() - t0) / 1000).toFixed(1);
const ok = result.errors.length === 0;
const summary = `${ok ? "OK" : "NG"}${APPLY ? "" : "(dry-run)"}  移動${result.moved}件 判定${result.classified}件 スキップ${result.skipped}件  ${sec}秒${ok ? "" : "  " + result.errors.join(" / ")}`;
log(summary);                                       // ステップ1: 成功も0件も1行
if (APPLY || !ok) await notify(ok, summary);        // ステップ2: 0件でも送る。失敗はメンション(dry-run は失敗時だけ)
if (ok && APPLY) await heartbeat();                 // ステップ3: 成功したときだけ生存報告
console.log(summary);
process.exit(ok ? 0 : 1);

// ---------- 判定AI(JEV) ----------
// 文書を「請求書 / 領収書 / その他」から選ぶ。文章は書かせない。
// API の形は TypeSafe System One(state + questions)。キーが無ければ null を返して「その他」扱い。
async function classify(path) {
  const key = process.env.JEV_API_KEY;
  if (!key) return null;
  const name = basename(path);
  const head = [".txt", ".md", ".csv"].includes(extname(path).toLowerCase()) ? readFileSync(path, "utf8").slice(0, 1500) : "";
  const body = {
    model: "jev-latest",
    state: `ファイル名: ${name}\n${head ? "先頭の内容:\n" + head : "(本文は読めない。ファイル名から判断)"}`,
    questions: {
      doc: { type: "choice", instructions: "この文書の種類", criteria: { 請求書: "請求書・インボイス・支払い依頼", 領収書: "領収書・レシート・支払い証明", その他: "どちらでもない" } },
    },
  };
  const r = await fetch("https://api.typesafe.ai/v1/systemone", {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`判定AI ${r.status}${r.status === 402 ? "(残高不足)" : ""}`); // 残高切れを静かに流さない
  const a = (await r.json()).answers.doc;
  const p = a.probabilities?.[a.choice] ?? 0;
  if (p < Number(process.env.MIN_PROBABILITY ?? 0.6)) return { choice: "要確認" }; // 自信が低いものは人間へ
  return { choice: a.choice, p };
}

// ---------- 通知・ログ・生存報告 ----------
function log(line) {
  mkdirSync(join(DEST, "logs"), { recursive: true });
  const now = new Date(); const ts = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().replace("T", " ").slice(0, 16); // ローカル時刻
  appendFileSync(LOG, `${ts}  ${line}
`);
}
async function notify(ok, text) {
  const url = process.env.DISCORD_WEBHOOK;
  if (!url) return;
  const me = process.env.DISCORD_USER_ID;
  const content = ok ? `✅ フォルダ整理 ${text}` : `🚨 ${me ? `<@${me}> ` : ""}フォルダ整理 失敗 ${text}`;
  await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) }).catch((e) => log(`通知失敗 ${e.message}`));
}
async function heartbeat() {
  const url = process.env.GAS_URL;
  if (!url) return;
  await fetch(url, { method: "POST" }).catch((e) => log(`生存報告失敗 ${e.message}`));
}
function loadDotEnv() {
  const p = join(new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"), ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
