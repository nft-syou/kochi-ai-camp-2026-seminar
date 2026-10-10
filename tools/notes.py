"""deck.md のトークメモ(各スライドの <!-- -->)を、ページ番号と見出しつきで deck.notes.md に書き出す。"""
import io, re, sys
src = sys.argv[1] if len(sys.argv) > 1 else "deck.md"
s = io.open(src, encoding="utf-8").read()
out = ["# トークメモ\n"]
for i, sl in enumerate(s.split("\n---\n")[1:], 1):
    h = re.search(r"^# (.*)$", sl, re.M)
    head = re.sub(r"<[^>]+>", "", h.group(1)).replace("<br>", "") if h else "(見出しなし)"
    kind = "中扉" if "_class: crosshead" in sl else ("表紙" if "_class: top" in sl else "")
    notes = [n.strip() for n in re.findall(r"<!--(.*?)-->", sl, re.S) if not n.strip().startswith("_")]
    out.append(f"## p{i:02d} {head}" + (f"　［{kind}］" if kind else ""))
    out.append("\n".join(notes) if notes else "(メモなし)")
    out.append("")
io.open("deck.notes.md", "w", encoding="utf-8", newline="\n").write("\n".join(out))
print(f"deck.notes.md: {i} スライド")
