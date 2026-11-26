"""Builds the hostelgames word mark as Nunjucks includes with outlined glyphs (Fredoka Bold),
so no web font is needed: the card is the O, a die is the A.

  includes/logomark.njk       two lines  (HOSTEL / GAMES), 462 x 222  – hub (hostelgames.com)
  includes/logomark-line.njk  one line   (HOSTELGAMES),    832 x 124  – tag on every game page

Colours are CSS custom properties with fallbacks (--lg-ink, --lg-red, --lg-gold, --lg-card,
--lg-heart, --lg-die, --lg-edge), so the header can switch light / dark.

Usage (from the repo root):
  pip install fonttools brotli
  npm pack @fontsource/fredoka --pack-destination /tmp && tar -xzf /tmp/fontsource-fredoka-*.tgz -C /tmp
  python3 packages/core/scripts/build-logo.py /tmp/package/files/fredoka-latin-700-normal.woff2
"""
import os
import sys

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

font = TTFont(sys.argv[1])
gs = font.getGlyphSet()
cmap = font.getBestCmap()
upm = font["head"].unitsPerEm
cap = font["OS/2"].sCapHeight or 700

INK = "var(--lg-ink,#202020)"
RED = "var(--lg-red,#D2452F)"
GOLD = "var(--lg-gold,#d68400)"
CARD = "var(--lg-card,#ffffff)"
HEART = "var(--lg-heart,#c8243b)"
DIE = "var(--lg-die,#f4cf71)"
EDGE = "var(--lg-edge,#202020)"

HEART_D = ("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 "
           "4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 "
           "11.54L12 21.35z")


def glyph(ch, size):
    """Path (origin at baseline-left, y down) and advance width for one character."""
    name = cmap[ord(ch)]
    pen = SVGPathPen(gs)
    s = size / upm
    gs[name].draw(TransformPen(pen, (s, 0, 0, -s, 0, 0)))
    return pen.getCommands(), gs[name].width * s


def letter(ch, size, colour, rot=0):
    d, adv = glyph(ch, size)
    capw = adv
    caph = cap * size / upm

    def place(x, cy):
        # baseline so that the capital letter is centred on cy
        by = cy + caph / 2
        cx = x + capw / 2
        t = f"translate({x:.2f} {by:.2f})"
        if rot:
            t = f"rotate({rot} {cx:.2f} {cy:.2f}) " + t
        return f'<path transform="{t}" d="{d}" style="fill:{colour}"/>'
    return adv, place


def card(w=74, h=100, rot=10):
    def place(x, cy):
        cx, top = x + w / 2, cy - h / 2
        sw = 4
        out = [f'<g transform="rotate({rot} {cx:.2f} {cy:.2f})">',
               f'<rect x="{x + sw/2:.2f}" y="{top + sw/2:.2f}" width="{w - sw}" height="{h - sw}" rx="8" '
               f'style="fill:{CARD};stroke:{EDGE};stroke-width:{sw}"/>']
        def heart(px, py, size, flip=False):
            s = size / 24
            tr = f"translate({px:.2f} {py:.2f}) scale({s:.4f})"
            if flip:
                tr = f"rotate(180 {px + size/2:.2f} {py + size/2:.2f}) " + tr
            return f'<path transform="{tr}" d="{HEART_D}" style="fill:{HEART}"/>'
        out.append(heart(x + 9, top + 9, 16))
        out.append(heart(cx - 20, cy - 20, 40))
        out.append(heart(x + w - 25, top + h - 25, 16, flip=True))
        out.append("</g>")
        return "".join(out)
    return w, place


def die(ch="A", w=78, rot=-8):
    d, adv = glyph(ch, 54)
    caph = cap * 54 / upm

    def place(x, cy):
        cx = x + w / 2
        top = cy - w / 2
        sw = 4
        out = [f'<g transform="rotate({rot} {cx:.2f} {cy:.2f})">',
               f'<rect x="{x + sw/2:.2f}" y="{top + sw/2:.2f}" width="{w - sw}" height="{w - sw}" rx="14" '
               f'style="fill:{DIE};stroke:{EDGE};stroke-width:{sw}"/>',
               f'<circle cx="{x + 12:.2f}" cy="{top + 12:.2f}" r="4" style="fill:{EDGE}"/>',
               f'<circle cx="{x + w - 12:.2f}" cy="{top + w - 12:.2f}" r="4" style="fill:{EDGE}"/>',
               f'<path transform="translate({cx - adv/2:.2f} {cy + caph/2:.2f})" d="{d}" style="fill:{EDGE}"/>',
               "</g>"]
        return "".join(out)
    return w, place


def row(items, gap):
    """items: (width, place, margin_before, margin_after). Returns total width and a placer."""
    total = sum(w + mb + ma for w, _, mb, ma in items) + gap * (len(items) - 1)

    def place(x0, cy):
        out, x = [], x0
        for i, (w, p, mb, ma) in enumerate(items):
            x += mb
            out.append(p(x, cy))
            x += w + ma + (gap if i < len(items) - 1 else 0)
        return "".join(out)
    return total, place


def L(ch, size, colour, rot=0, spacing=0):
    w, p = letter(ch, size, colour, rot)
    return (w, p, 0, spacing)


top = [L("H", 104, INK, -4), card() + (12, 10),
       L("S", 104, INK, 3), L("T", 104, RED), L("E", 104, INK, -3), L("L", 104, GOLD)]
bottom = [L("G", 86, GOLD, spacing=6), die() + (10, 8),
          L("M", 86, RED, spacing=6), L("E", 86, INK, spacing=6), L("S", 86, GOLD, spacing=6)]
INCLUDES = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "includes")


def write(name, size, body, what):
    head = ("{#- The hostelgames word mark, " + what + ", " + size + " (viewBox units).\n"
            "    Generated by scripts/build-logo.py – do not edit by hand. -#}\n")
    with open(os.path.join(INCLUDES, name), "w") as f:
        f.write(head + body + "\n")
    print(name, size)


# One line, for the tag on every game page
line = [L("H", 100, INK, -4), card(70, 96) + (10, 8), L("S", 100, INK, 3), L("T", 100, RED),
        L("E", 100, INK, -3), L("L", 100, GOLD, spacing=14), L("G", 100, GOLD, spacing=2),
        die(w=76) + (8, 8), L("M", 100, RED, spacing=4), L("E", 100, INK, spacing=4),
        L("S", 100, GOLD)]
w0, p0 = row(line, 4)
write("logomark-line.njk", f"{w0 + 20:.0f} x 124", p0(10, 62), "one line (HOSTELGAMES)")

# Two lines, for the hub
w1, p1 = row(top, 6)
w2, p2 = row(bottom, 4)
W = max(w1, w2) + 24
cy1, cy2 = 62, 166
H = 222
body = p1((W - w1) / 2, cy1) + p2((W - w2) / 2, cy2)
write("logomark.njk", f"{W:.0f} x {H}", body, "two lines (HOSTEL / GAMES)")
