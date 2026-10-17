#!/usr/bin/env python3
"""Render the Lumen benchmark figure, once per theme (like ../diagrams).

Numbers: `cargo bench --bench svm_sim` on Lumen bench/every-dex 4334039e
and `cargo bench --bench route_solver` on Lumen main 26e316ff, Apple M1 Pro,
10 cores, aarch64 — the sBPF interpreter, no JIT. Run 2026-10-17.

    python3 build_bench.py
"""
import math
import os

THEMES = {
    # page tokens from css/styles.css; bar blue checked against each surface
    "light": dict(fg="#1b1b1b", muted="#6d6d6d", rule="#e4e4e4", mark="#0b5fd0"),
    "dark":  dict(fg="#e6e4e1", muted="#9b9b9b", rule="#2a2c2e", mark="#4f8ff0"),
}

# (label, p50 µs, p99 µs)
SVM = [
    ("Raydium V4 · 15 626 CU", 101.1, 151.4),
    ("Raydium V4 on the hot path", 116.2, 140.3),
    ("Meteora DAMM v2 · 28 647 CU", 168.8, 219.0),
    ("Orca V2 · 48 563 CU", 251.6, 307.0),
    ("PumpSwap · 106 189 CU", 638.2, 767.2),
    ("Orca Whirlpool · 171 355 CU", 796.8, 909.5),
    ("Meteora DLMM · 303 795 CU", 1395.8, 1553.0),
    ("System transfer (the floor)", 4.5, 5.5),
]
THROUGHPUT = [("1 thread", 9606), ("2 threads", 18429), ("4 threads", 29967), ("8 threads", 50505)]
# (label, p50 µs)
SEARCH = [
    ("Pair, 8 pools", 3.8),
    ("Pair, 64 pools", 12.2),
    ("Pair, 518 pools (largest on mainnet)", 91.9),
    ("Triangle, 8 + 2 + 8 pools", 47.1),
    ("Triangle, 64 + 8 + 64 pools", 413.0),
    ("Triangle, 518 + 8 + 518 pools", 3014.7),
    ("WSOL–USDC: 14 343 triangles screened", 87.0),
]

W, LABEL_W, PLOT_X0, PLOT_X1 = 760, 250, 262, 640
ROW, BAR = 30, 16
FONT = "Geologica, Helvetica, Arial, sans-serif"


def us(v):
    if v >= 1000:
        return f"{v / 1000:.1f} ms"
    return f"{v:.1f} µs" if v < 10 else f"{v:.0f} µs"


def thousands(n):
    return f"{n:,}".replace(",", " ")


def bar(x0, x1, y, h, fill):
    # square at the baseline, 4px rounded data end
    r = min(4, (x1 - x0) / 2)
    return (f'<path d="M{x0},{y} H{x1 - r} A{r},{r} 0 0 1 {x1},{y + r} V{y + h - r} '
            f'A{r},{r} 0 0 1 {x1 - r},{y + h} H{x0} Z" fill="{fill}"/>')


def text(x, y, s, fill, size=13, anchor="start", weight=400):
    return (f'<text x="{x}" y="{y}" fill="{fill}" font-size="{size}" font-weight="{weight}" '
            f'text-anchor="{anchor}" font-family="{FONT}">{s}</text>')


def panel_head(y, title, sub, t):
    return [text(0, y, title, t["fg"], 15, weight=500), text(0, y + 19, sub, t["muted"], 12)], y + 38


def render(t):
    out, y = [], 18

    # 1. one transaction through the SVM
    head, y = panel_head(y, "One swap through the SVM, by DEX", "bar: median · line: 99th percentile · on each DEX's mainnet fixture pool", t)
    out += head
    xmax = 1700.0
    sx = lambda v: PLOT_X0 + (PLOT_X1 - PLOT_X0) * v / xmax
    top = y
    for label, p50, p99 in SVM:
        cy = y + ROW / 2
        out.append(text(0, cy + 4, label, t["fg"]))
        out.append(bar(PLOT_X0, sx(p50), cy - BAR / 2, BAR, t["mark"]))
        out.append(f'<line x1="{sx(p50)}" y1="{cy}" x2="{sx(p99)}" y2="{cy}" stroke="{t["mark"]}" stroke-width="2"/>')
        out.append(f'<line x1="{sx(p99)}" y1="{cy - 5}" x2="{sx(p99)}" y2="{cy + 5}" stroke="{t["mark"]}" stroke-width="2"/>')
        out.append(text(sx(p99) + 8, cy + 4, f"{us(p50)}  ·  p99 {us(p99)}", t["fg"], 12))
        # ponytail: labels assume p99 sits left of ~1.6 ms; widen W if a DEX outgrows it
        y += ROW
    out.append(f'<line x1="{PLOT_X0}" y1="{top}" x2="{PLOT_X0}" y2="{y}" stroke="{t["rule"]}"/>')
    y += 34

    # 2. throughput
    head, y = panel_head(y, "Swaps per second, one bank", "Raydium V4 swaps on parallel threads", t)
    out += head
    xmax = 60000.0
    sx = lambda v: PLOT_X0 + (PLOT_X1 - PLOT_X0) * v / xmax
    top = y
    for label, v in THROUGHPUT:
        cy = y + ROW / 2
        out.append(text(0, cy + 4, label, t["fg"]))
        out.append(bar(PLOT_X0, sx(v), cy - BAR / 2, BAR, t["mark"]))
        out.append(text(sx(v) + 8, cy + 4, thousands(v), t["fg"], 12))
        y += ROW
    out.append(f'<line x1="{PLOT_X0}" y1="{top}" x2="{PLOT_X0}" y2="{y}" stroke="{t["rule"]}"/>')
    y += 34

    # 3. route search, log scale -> dots, not bars
    head, y = panel_head(y, "Route search after a pool moves", "median, log scale · synthetic markets of the given size", t)
    out += head
    lo, hi = 1.0, 10000.0
    sx = lambda v: PLOT_X0 + (PLOT_X1 - PLOT_X0) * (math.log10(v) - math.log10(lo)) / (math.log10(hi) - math.log10(lo))
    top, rows_h = y, ROW * len(SEARCH)
    for tick, name in [(1, "1 µs"), (10, "10 µs"), (100, "100 µs"), (1000, "1 ms"), (10000, "10 ms")]:
        out.append(f'<line x1="{sx(tick)}" y1="{top}" x2="{sx(tick)}" y2="{top + rows_h}" stroke="{t["rule"]}"/>')
        out.append(text(sx(tick), top + rows_h + 16, name, t["muted"], 11, "middle"))
    for label, v in SEARCH:
        cy = y + ROW / 2
        out.append(text(0, cy + 4, label, t["fg"]))
        out.append(f'<circle cx="{sx(v):.1f}" cy="{cy}" r="5" fill="{t["mark"]}"/>')
        out.append(text(sx(v) + 10, cy + 4, us(v), t["fg"], 12))
        y += ROW
    y += 26

    body = "\n  ".join(out)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {y}" width="{W}" height="{y}" '
            f'role="img" aria-label="Lumen benchmarks">\n  {body}\n</svg>\n')


here = os.path.dirname(os.path.abspath(__file__))
for name, t in THEMES.items():
    path = os.path.join(here, f"bench-{name}.svg")
    open(path, "w").write(render(t))
    print(" ", os.path.basename(path))
