"""Deck QA without PowerPoint: geometry lint plus XML content checks.

1. Every shape must sit inside the 13.33 x 7.5 inch canvas.
2. Rough text fit: estimated wrapped height (characters x font size x 0.5
   divided by box width in points) must not exceed the box height.
3. The packed slide XML must be free of blocklist terms, banned words and
   em or en dashes.
"""

import re
import sys
import zipfile

from pptx import Presentation
from pptx.util import Emu

PATH = "Stonebridge-Case-Study.pptx"
PAGE_W, PAGE_H = 13.333, 7.5

fail = 0

prs = Presentation(PATH)
for si, slide in enumerate(prs.slides, 1):
    for shape in slide.shapes:
        try:
            x, y = Emu(shape.left).inches, Emu(shape.top).inches
            w, h = Emu(shape.width).inches, Emu(shape.height).inches
        except TypeError:
            continue
        if x < -0.01 or y < -0.01 or x + w > PAGE_W + 0.01 or y + h > PAGE_H + 0.01:
            print(f"OUT OF BOUNDS slide {si}: {shape.shape_type} at ({x:.2f},{y:.2f}) {w:.2f}x{h:.2f}")
            fail = 1
        if shape.has_text_frame:
            text = shape.text_frame.text
            if not text.strip():
                continue
            sizes = [
                r.font.size.pt
                for p in shape.text_frame.paragraphs
                for r in p.runs
                if r.font.size is not None
            ]
            size = max(sizes) if sizes else 18
            box_w_pt, box_h_pt = w * 72, h * 72
            if box_w_pt <= 0:
                continue
            est_h = len(text) * size * 0.5 / box_w_pt * (size * 1.2)
            # chars * size * 0.5 = total run length in points; divided by the
            # box width that is the wrapped line count, times line height.
            if est_h > box_h_pt * 1.15:
                print(
                    f"POSSIBLE OVERFLOW slide {si}: {len(text)} chars at {size}pt "
                    f"in {w:.2f}x{h:.2f}in box: est {est_h:.0f}pt vs {box_h_pt:.0f}pt "
                    f"| {text[:60]!r}"
                )
                fail = 1

BLOCK = re.compile(
    r"nucompass|signity|reloaction|envisify|spendly|rithik|guleria|tefileno"
    r"|datawarehouse|\bncm\b|\brac\b|\bcpc\b|\bcpe\b|\bachin\b|\beric\b|\bdota\b"
    r"|great plains|\babbe\b|\bglc2\b|\bkais\b|\bintz\b|\babin\b|\bbpxx\b"
    r"|\bhewa\b|\bunai\b|\bdaiy\b|\bcath\b|\bdaim\b|\btxue\b|\bonco\b|\bkphc\b"
    r"|\bfrcr\b|\blenz\b|\bmerz\b|\bdemo\b|\bdemos\b|demonstration|walkthrough|simulated",
    re.I,
)
DASH = re.compile("[–—]")

with zipfile.ZipFile(PATH) as z:
    for name in z.namelist():
        if not name.endswith((".xml", ".rels")):
            continue
        data = z.read(name).decode("utf-8", errors="ignore")
        # pptxgenjs writes PowerPoint's stock master bullet glyphs as
        # buChar attributes; no slide text references them. Everything
        # else in the XML stays subject to the dash rule.
        data = re.sub(r'buChar char="[^"]*"', 'buChar char=""', data)
        for m in BLOCK.finditer(data):
            print(f"BLOCK/WORD HIT {name}: {m.group(0)!r} at {m.start()}")
            fail = 1
        for m in DASH.finditer(data):
            print(f"DASH HIT {name} at {m.start()}: ...{data[max(0, m.start()-30):m.start()+30]!r}")
            fail = 1

print("LINT PASS" if fail == 0 else "LINT FAIL")
sys.exit(fail)
