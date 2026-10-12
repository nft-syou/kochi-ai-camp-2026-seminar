# 高知AI活用キャンプ2026 セミナー資料「作る前に、4つだけ決める。」

2026-10-10 の合宿で話した、壊れない自動化の設計メモ(どこで動かす / 誰がやる / どう見張る / どう引き継ぐ)。Marp 製。

- ブラウザで読む: https://nft-syou.github.io/kochi-ai-camp-2026-seminar/
- スライド PDF: [`deck.pdf`](deck.pdf)
- トークメモ: [`deck.notes.md`](deck.notes.md)

- 正本: `deck.md`。トークメモは各スライドの `<!-- -->`
- 書き出し: `deck.pdf`(投影用)/ `deck-notes.pdf`(ノート注釈つき)/ `deck.notes.md`(ページ番号つきメモ)

## 初回(Mac)

```bash
npm install                        # Marp CLI(ローカル)
brew install poppler mupdf-tools   # 検査ツール用(任意)
pip3 install pillow                # 検査ツール用(任意)
```

## 使い方

| やること | Mac | Windows |
|---|---|---|
| PDF 書き出し+検査 | `./build.sh` | `.\build.ps1` |
| 発表者ビュー(ブラウザ、P キー) | `./serve.sh` → http://localhost:8080/deck.md | `.\serve.ps1` → 同じ |

図(`images/watch-*.svg`)は `python3 images/make-watch.py` で生成。

## 出典・ライセンス

- `theme/minorun-dark.css` と `tools/` は [minorun365/minorun-marp-skill](https://github.com/minorun365/minorun-marp-skill)(Apache License 2.0)から複製したもの。原文は `LICENSE-minorun-marp-skill`
  - `tools/check-figure-text.py` は Windows で動くよう subprocess の文字コード指定を2行追加している(コメントで明記)
- `images/ill-*.png` は fal.ai(nano-banana-pro)で生成。`images/watch-*.svg` は `images/make-watch.py` で生成
- スライド本文・トークメモ: © syou

## 例題の実装例

- [`examples/folder-sort/`](examples/folder-sort/): 例題② ダウンロードフォルダ整理(Node)。設計図・AGENTS.md・見張りまで一式
