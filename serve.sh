#!/usr/bin/env bash
# Mac/Linux 用: 発表者ビュー。起動後 http://localhost:8080/deck.md を開き、P キーで発表者ビュー。Ctrl+C で停止
# 初回: npm install
cd "$(dirname "$0")"
[ -d node_modules ] || { echo "node_modules が無い。先に npm install"; exit 1; }
npx marp -s . --theme theme/minorun-dark.css --allow-local-files
