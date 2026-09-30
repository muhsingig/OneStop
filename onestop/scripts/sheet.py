# contact sheet: python scripts/sheet.py out.png f0001.png f0002.png ...  (3 columns, 640px wide cells)
import os
import sys
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
cw, ch, cols = 640, 360, 3
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cw * cols, (ch + 22) * rows), (40, 40, 40))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((cw, ch), Image.LANCZOS)
    x, y = (i % cols) * cw, (i // cols) * (ch + 22)
    sheet.paste(im, (x, y + 22))
    d.text((x + 6, y + 4), os.path.basename(f), fill=(255, 255, 0))
sheet.save(out)
