"""見張りの段階ビルドアップ図(watch-1/2/3.svg)を1つの定義から生成する。
python images/make-watch.py  で images/ に書き出す。色は deck.md の配色に合わせる。"""
import io, os

F = "BIZ UDPGothic, Yu Gothic, sans-serif"
ORANGE, ORANGE_D, LINE, DIM, WHITE, GRAY = "#ffa94d", "#c9611f", "#ffc999", "#a09aa4", "#ffffff", "#5a5a66"


def text(x, y, s, size=24, fill=WHITE, anchor="middle", weight="normal"):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}" font-family="{F}">{s}</text>'


def box(x, y, w, h, label, kind="solid"):
    if kind == "solid":
        r = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="16" fill="#1d1d25"/>'
    elif kind == "main":
        r = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="16" fill="{ORANGE_D}"/>'
    else:
        r = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="16" fill="none" stroke="{GRAY}" stroke-width="3"/>'
    return r + text(x + w / 2, y + h / 2 + 9, label, 26, weight="bold")


def arrow(pts, label=None, lx=0, ly=0):
    p = " ".join(f"{x},{y}" for x, y in pts)
    s = f'<polyline points="{p}" fill="none" stroke="{LINE}" stroke-width="3" marker-end="url(#ar)"/>'
    if label:
        s += text(lx, ly, label, 23, DIM)
    return s


def build(stage):
    parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 400" width="1000" height="400">',
        f'<defs><marker id="ar" markerUnits="userSpaceOnUse" markerWidth="18" markerHeight="18" refX="16" refY="9" orient="auto">'
        f'<path d="M0,0 L18,9 L0,18 Z" fill="{LINE}"/></marker></defs>',
    ]
    # 段階1: 自動化 → ログ
    parts.append(box(20, 180, 240, 110, "自動化", "solid"))
    parts.append(box(380, 180, 240, 110, "ログ", "outline"))
    parts.append(arrow([(270, 235), (368, 235)], "毎回 1行", 319, 222))
    if stage >= 2:
        # 段階2: 自動化 → 通知 → あなた(下の経路)
        parts.append(box(740, 180, 240, 110, "自分", "outline"))
        parts.append(arrow([(140, 300), (140, 360), (860, 360), (860, 302)], "完了通知(0件でも)", 500, 350))
    if stage >= 3:
        # 段階3: 別の場所の見張り役。ログを読んで、古ければあなたへ警告
        parts.append(f'<rect x="360" y="4" width="280" height="140" rx="18" fill="none" stroke="{GRAY}" stroke-width="2" stroke-dasharray="10 8"/>')
        parts.append(text(500, 44, "別の場所(クラウド)", 23, DIM))
        parts.append(box(400, 60, 200, 70, "見張り役", "main"))
        parts.append(arrow([(500, 170), (500, 138)], "最終成功時刻を読む", 655, 160, ))
        parts.append(arrow([(610, 95), (860, 95), (860, 168)], "古ければ警告", 760, 82))
    parts.append("</svg>")
    return "\n".join(parts)


here = os.path.dirname(os.path.abspath(__file__))
for st in (1, 2, 3):
    io.open(os.path.join(here, f"watch-{st}.svg"), "w", encoding="utf-8", newline="\n").write(build(st))
    print("watch-%d.svg" % st)
