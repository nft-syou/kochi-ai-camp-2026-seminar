#!/usr/bin/env bash
# Mac/Linux 用: deck.md -> deck.pdf / deck-notes.pdf / deck.notes.md を書き出し、検査を通す
# 初回: npm install && brew install poppler mupdf-tools && pip3 install pillow
set -euo pipefail
cd "$(dirname "$0")"
export MARP_NODE_MODULES="$PWD/node_modules/"
export PYTHONIOENCODING=utf-8

[ -d node_modules ] || { echo "node_modules が無い。先に npm install"; exit 1; }
npx marp --no-stdin deck.md --pdf --theme theme/minorun-dark.css --allow-local-files 2>&1 | grep -v -E "Insecure|local file" || true
python3 tools/notes.py deck.md
npx marp --no-stdin deck.md --pdf --pdf-notes --theme theme/minorun-dark.css --allow-local-files -o deck-notes.pdf 2>&1 | grep -v -E "Insecure|local file" || true

if command -v pdftoppm >/dev/null && command -v mutool >/dev/null; then
  echo "--- check-dark-margins";  python3 tools/check-dark-margins.py deck.pdf
  echo "--- check-dark-gaps";     python3 tools/check-dark-gaps.py deck.pdf
  echo "--- check-figure-text(p30 の 16pt 未満は意図的)"; python3 tools/check-figure-text.py deck.pdf 2>/dev/null
  echo "--- check-svg-box-fit";   node tools/check-svg-box-fit.mjs images/*.svg
  echo "--- asterisk leak (0 が正常)"; mutool draw -F stext -o - deck.pdf 2>/dev/null | grep -c 'c="\*"' || true
else
  echo "(検査スキップ: brew install poppler mupdf-tools で pdftoppm / mutool を入れると動く)"
fi
echo "--- 見出し一覧"; grep -n '^# ' deck.md
