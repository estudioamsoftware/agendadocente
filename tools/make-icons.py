#!/usr/bin/env python3
"""Genera los iconos de la PWA a partir del logo de Agenda Docente.

La marca es la "A" (gris carbon) junto a la "D" dibujada como un calendario
(naranja) con la grilla de dias y el tilde. Todo se dibuja con geometria, asi
que los iconos salen nitidos en cualquier tamaño.

    python3 tools/make-icons.py

Escribe icon-192.png, icon-512.png, icon-maskable-192.png, icon-maskable-512.png
y logo.svg en la raiz del repo.
"""
import math
import os

from PIL import Image, ImageDraw

CREAM = "#F7EFE7"
CHARCOAL = "#2B2B2B"
ORANGE = "#E8801E"

# --- Geometria de la marca, en una caja de 650 x 432 ---------------------------
MARK_W, MARK_H = 650.0, 432.0

A_APEX = (197, 10)
A_LEFT_FOOT = (18, 424)
A_RIGHT_FOOT = (342, 424)
A_BAR = ((89, 260), (285, 260))
A_STROKE = 27

D_TOP_LEFT_END = (240, 42)      # punta libre de la barra superior
D_RIGHT = 650                   # borde derecho
D_TOP, D_BOTTOM = 42, 427
D_RADIUS = 110
D_BOTTOM_LEFT_END = (345, 427)  # se encuentra con la pata derecha de la A
D_STROKE = 28

RING_XS = (335, 418, 500)       # anillos del calendario
RING_TOP, RING_BOTTOM = 7, 82
RING_STROKE = 22

CELL_XS = (362, 447, 535)       # grilla de dias
CELL_YS = (157, 242, 325)
CELL_SIZE = 36
CELL_RADIUS = 10

CHECK = ((518, 325), (535, 344), (572, 300))
CHECK_STROKE = 22


def _arc_points(cx, cy, r, a0, a1, steps=24):
    return [
        (cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / steps)),
         cy + r * math.sin(math.radians(a0 + (a1 - a0) * i / steps)))
        for i in range(steps + 1)
    ]


def _stroke(draw, pts, width, color, caps=True):
    """Polilinea con uniones y puntas redondeadas (Pillow no tiene line-cap)."""
    draw.line(pts, fill=color, width=int(round(width)), joint="curve")
    if caps:
        ends = (pts[0], pts[-1])
    else:
        ends = ()
    for x, y in list(ends) + list(pts[1:-1]):
        r = width / 2.0
        draw.ellipse((x - r, y - r, x + r, y + r), fill=color)


def draw_mark(draw, x0, y0, width):
    """Dibuja la marca con su esquina superior izquierda en (x0, y0)."""
    s = width / MARK_W

    def P(p):
        return (x0 + p[0] * s, y0 + p[1] * s)

    def W(w):
        return w * s

    # "D" calendario (naranja): barra superior, esquinas redondeadas, barra inferior
    d_path = [P(D_TOP_LEFT_END), P((D_RIGHT - D_RADIUS, D_TOP))]
    d_path += [P(p) for p in _arc_points(D_RIGHT - D_RADIUS, D_TOP + D_RADIUS, D_RADIUS, -90, 0)]
    d_path += [P((D_RIGHT, D_BOTTOM - D_RADIUS))]
    d_path += [P(p) for p in _arc_points(D_RIGHT - D_RADIUS, D_BOTTOM - D_RADIUS, D_RADIUS, 0, 90)]
    d_path += [P(D_BOTTOM_LEFT_END)]
    _stroke(draw, d_path, W(D_STROKE), ORANGE)

    # "A" (gris carbon)
    _stroke(draw, [P(A_LEFT_FOOT), P(A_APEX)], W(A_STROKE), CHARCOAL)
    _stroke(draw, [P(A_APEX), P(A_RIGHT_FOOT)], W(A_STROKE), CHARCOAL)
    _stroke(draw, [P(A_BAR[0]), P(A_BAR[1])], W(A_STROKE), CHARCOAL)

    # Anillos del calendario
    for rx in RING_XS:
        _stroke(draw, [P((rx, RING_TOP)), P((rx, RING_BOTTOM))], W(RING_STROKE), CHARCOAL)

    # Grilla de dias, con tilde naranja en la ultima celda
    half = CELL_SIZE / 2.0
    for row, cy in enumerate(CELL_YS):
        for col, cx in enumerate(CELL_XS):
            if row == 2 and col == 2:
                continue
            box = P((cx - half, cy - half)) + P((cx + half, cy + half))
            draw.rounded_rectangle(box, radius=W(CELL_RADIUS), fill=CHARCOAL)
    _stroke(draw, [P(p) for p in CHECK], W(CHECK_STROKE), ORANGE)


def render_icon(size, mark_ratio, path, supersample=4):
    px = size * supersample
    img = Image.new("RGB", (px, px), CREAM)
    draw = ImageDraw.Draw(img)
    mark_w = px * mark_ratio
    mark_h = mark_w * MARK_H / MARK_W
    draw_mark(draw, (px - mark_w) / 2, (px - mark_h) / 2, mark_w)
    img.resize((size, size), Image.LANCZOS).save(path, optimize=True)
    print("escrito", path)


def render_svg(path):
    """Misma geometria, en vectorial, para usos que no sean el icono de la PWA."""
    pad = 40
    w, h = MARK_W + pad * 2, MARK_H + pad * 2

    def pt(p):
        return f"{p[0] + pad} {p[1] + pad}"

    d_path = (
        f"M {pt(D_TOP_LEFT_END)} "
        f"H {D_RIGHT - D_RADIUS + pad} "
        f"A {D_RADIUS} {D_RADIUS} 0 0 1 {D_RIGHT + pad} {D_TOP + D_RADIUS + pad} "
        f"V {D_BOTTOM - D_RADIUS + pad} "
        f"A {D_RADIUS} {D_RADIUS} 0 0 1 {D_RIGHT - D_RADIUS + pad} {D_BOTTOM + pad} "
        f"H {D_BOTTOM_LEFT_END[0] + pad}"
    )
    cells = ""
    half = CELL_SIZE / 2.0
    for row, cy in enumerate(CELL_YS):
        for col, cx in enumerate(CELL_XS):
            if row == 2 and col == 2:
                continue
            cells += (
                f'<rect x="{cx - half + pad}" y="{cy - half + pad}" width="{CELL_SIZE}" '
                f'height="{CELL_SIZE}" rx="{CELL_RADIUS}" fill="{CHARCOAL}"/>'
            )
    rings = "".join(
        f'<path d="M {rx + pad} {RING_TOP + pad} V {RING_BOTTOM + pad}"/>' for rx in RING_XS
    )
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" role="img" aria-label="Agenda Docente">
  <title>Agenda Docente</title>
  <path d="{d_path}" fill="none" stroke="{ORANGE}" stroke-width="{D_STROKE}" stroke-linecap="round" stroke-linejoin="round"/>
  <g fill="none" stroke="{CHARCOAL}" stroke-width="{A_STROKE}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M {pt(A_LEFT_FOOT)} L {pt(A_APEX)} L {pt(A_RIGHT_FOOT)}"/>
    <path d="M {pt(A_BAR[0])} L {pt(A_BAR[1])}"/>
  </g>
  <g fill="none" stroke="{CHARCOAL}" stroke-width="{RING_STROKE}" stroke-linecap="round">{rings}</g>
  {cells}
  <path d="M {pt(CHECK[0])} L {pt(CHECK[1])} L {pt(CHECK[2])}" fill="none" stroke="{ORANGE}" stroke-width="{CHECK_STROKE}" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
"""
    with open(path, "w", encoding="utf-8") as f:
        f.write(svg)
    print("escrito", path)


if __name__ == "__main__":
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    # "any": la marca ocupa casi todo el cuadrado.
    render_icon(192, 0.84, os.path.join(root, "icon-192.png"))
    render_icon(512, 0.84, os.path.join(root, "icon-512.png"))
    # "maskable": el sistema recorta hasta un 20% de cada lado, asi que la marca
    # entra en la zona segura (circulo del 80%).
    render_icon(192, 0.60, os.path.join(root, "icon-maskable-192.png"))
    render_icon(512, 0.60, os.path.join(root, "icon-maskable-512.png"))
    render_svg(os.path.join(root, "logo.svg"))
