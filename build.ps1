# deck.md -> deck.pdf を書き出し、slide-design-dark の検査を通す
$dir = $PSScriptRoot
Set-Location $dir
$env:CHROME_PATH = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
$env:MARP_NODE_MODULES = "$dir\node_modules\"
$env:PYTHONIOENCODING = "utf-8"
$env:PYTHONUTF8 = "1"   # check-figure-text.py が subprocess の出力を cp932 で読んで落ちるのを防ぐ
$pop = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe\poppler-25.07.0\Library\bin"
if (Test-Path $pop) { $env:Path = "$pop;$env:Path" }

npx marp --no-stdin deck.md --pdf --theme theme/minorun-dark.css --allow-local-files 2>&1 | Where-Object { $_ -notmatch "npm warn|Insecure|local file" }
# トークメモ(各スライドの <!-- --> )を2形式で書き出す: ページ番号・見出しつきの deck.notes.md と、ノート注釈つきPDF(発表者用)
python tools/notes.py deck.md
npx marp --no-stdin deck.md --pdf --pdf-notes --theme theme/minorun-dark.css --allow-local-files -o deck-notes.pdf 2>&1 | Where-Object { $_ -notmatch "npm warn|Insecure|local file" }
Write-Output "--- check-dark-margins"; python tools/check-dark-margins.py deck.pdf
Write-Output "--- check-dark-gaps";    python tools/check-dark-gaps.py deck.pdf
Write-Output "--- check-figure-text";  python tools/check-figure-text.py deck.pdf 2>$null
Write-Output "--- check-svg-box-fit";  node tools/check-svg-box-fit.mjs @(Get-ChildItem images\*.svg | ForEach-Object { $_.FullName }) 2>&1 | Where-Object { $_ -notmatch "npm warn" }
Write-Output "--- asterisk leak (0 が正常)"; (mutool draw -F stext -o - deck.pdf 2>$null | Select-String -Pattern 'c="\*"').Count
Write-Output "--- 見出し一覧"; Select-String -Path deck.md -Pattern '^# ' | ForEach-Object { $_.Line }
