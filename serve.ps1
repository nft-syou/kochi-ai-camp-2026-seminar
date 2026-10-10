# 発表者ビュー用のサーバーを起動する。ブラウザで http://localhost:8080/deck.md を開き、P キーで発表者ビュー(次のスライド+トークメモ)。
# 止めるときは Ctrl+C
Set-Location $PSScriptRoot
$env:CHROME_PATH = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
npx marp -s . --theme theme/minorun-dark.css --allow-local-files
