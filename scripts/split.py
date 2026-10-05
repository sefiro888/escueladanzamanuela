# Trocea capturas largas para revisarlas: python scripts/split.py <carpeta>
import sys, glob
from PIL import Image
d = sys.argv[1]
for f in glob.glob(d + '/*.png'):
    im = Image.open(f); h = 2000 if 'desk' in f else 2400
    for i in range(0, im.height, h):
        im.crop((0, i, im.width, min(im.height, i + h))).convert('RGB').save(f.replace('.png', f'_{i // h}.jpg'), quality=70)
    print(f, im.size)
