"""Genera assets/img/ a partir de los PNG originales de fuentes/.

- Fotos de clase en WebP a 640 / 1280 / 1920 px.
- Adornos en WebP a 720 / 1400 px.
- Logo claro (letras blancas y bailarina rosa, fondo transparente) y logo oscuro.
- Favicon, iconos de app e imagen para compartir (Open Graph).

Uso: python scripts/prepare_assets.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "fuentes"
OUT = ROOT / "assets" / "img"
OUT.mkdir(parents=True, exist_ok=True)

PHOTOS = {
    "funky": "Clase de funk entre generaciones-1.png",
    "flamenco": "Clase de flamenco en movimiento-2.png",
    "zumba": "Clase de Zumba llena de energía-3.png",
    "ballet": "Clase de ballet en estudio luminoso-4.png",
    "baile-moderno": "Danza contemporánea en luz rosa-5.png",
    "country": "Clase de baile country en línea-6.png",
    "salsa": "Giro de salsa con luz cálida-1.png",
    "comercial": "Coreografía sincronizada en luz rosa-2.png",
    "k-pop": "Clase de K-pop en estudio rosado-3.png",
}
DECOR = {
    "funky": "Estrellas y movimiento para danza-3.png",
    "flamenco": "Abanico flamenco, flor y notas musicales-2.png",
    "zumba": "Maracas, flor rosa y cinta danzante-1.png",
    "ballet": "Zapatillas de punta con lazos rosados-4.png",
    "baile-moderno": "Trazos de danza rosa y negro-5.png",
    "country": "Bota western, sombrero y estrellas rosas-4.png",
    "salsa": "Maracas, flor rosa y cinta danzante-1.png",
    "comercial": "Destellos y ritmo en escena-2.png",
    "k-pop": "Estrellas, audífonos y notas musicales-3.png",
    "cintas": "Cintas danzantes con destellos musicales-1.png",
}
LOGO = SRC / "Logo restaurado de Escuela de Danza Manuela.png"
PINK = (231, 113, 160)
ROSE = (242, 150, 186)
NOIR = (16, 9, 13)


def save_sizes(im, name, widths, quality=80):
    for w in widths:
        if im.width < w:
            continue
        h = round(im.height * w / im.width)
        im.resize((w, h), Image.LANCZOS).save(OUT / f"{name}-{w}.webp", "WEBP", quality=quality, method=6)


def photos():
    for slug, file in PHOTOS.items():
        im = Image.open(SRC / file).convert("RGB")
        save_sizes(im, slug, (640, 1280))
        # 1920: se reescala en dos pasos con enfoque suave
        big = im.resize((1920, round(im.height * 1920 / im.width)), Image.LANCZOS)
        big = big.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
        big.save(OUT / f"{slug}-1920.webp", "WEBP", quality=78, method=6)
    # Baile nupcial: recorte vertical de la pareja de la foto de salsa
    im = Image.open(SRC / PHOTOS["salsa"]).convert("RGB")
    crop = im.crop((800, 0, 1520, 941))
    save_sizes(crop, "bodas", (640,))
    crop.resize((720, round(941 * 720 / 720)), Image.LANCZOS).save(OUT / "bodas-720.webp", "WEBP", quality=80, method=6)
    wide = im.crop((300, 60, 1672, 941))
    save_sizes(wide, "bodas-wide", (640, 1280))
    wide.resize((1920, round(wide.height * 1920 / wide.width)), Image.LANCZOS).save(OUT / "bodas-wide-1920.webp", "WEBP", quality=78, method=6)


def decor():
    for slug, file in DECOR.items():
        im = Image.open(SRC / file)
        im = im.convert("RGBA") if im.mode == "RGBA" else im.convert("RGB")
        save_sizes(im, f"deco-{slug}", (720, 1400), quality=78)


def logo_layers():
    """Separa las letras blancas y la bailarina negra del fondo rosa."""
    im = Image.open(LOGO).convert("RGB").crop((100, 280, 1175, 930))
    w, h = im.size
    px = im.load()
    white = Image.new("L", (w, h))
    black = Image.new("L", (w, h))
    wp, bp = white.load(), black.load()
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            aw = max(0.0, min(1.0, (g - PINK[1]) / (255 - PINK[1])))
            ab = max(0.0, min(1.0, (PINK[0] - r) / PINK[0])) if g <= PINK[1] + 8 else 0.0
            wp[x, y] = int(aw * 255)
            bp[x, y] = int(ab * 255) if ab > 0.12 else 0
    return white, black


def logos():
    white, black = logo_layers()
    w, h = white.size
    # Logo claro (para fondos oscuros)
    light = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    light.paste(Image.new("RGBA", (w, h), (255, 248, 251, 255)), (0, 0), white)
    light.paste(Image.new("RGBA", (w, h), ROSE + (255,)), (0, 0), black)
    # Logo oscuro (para fondos claros)
    dark = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    dark.paste(Image.new("RGBA", (w, h), (31, 17, 26, 255)), (0, 0), white)
    dark.paste(Image.new("RGBA", (w, h), (214, 79, 135, 255)), (0, 0), black)
    for name, im in (("logo-light", light), ("logo-dark", dark)):
        bbox = im.getbbox()
        im = im.crop(bbox)
        im.resize((640, round(im.height * 640 / im.width)), Image.LANCZOS).save(OUT / f"{name}.png", optimize=True)
        im.resize((640, round(im.height * 640 / im.width)), Image.LANCZOS).save(OUT / f"{name}.webp", "WEBP", quality=90)
    # Bailarina sola (para favicon, sello y adornos)
    dancer = black.copy()
    ImageDraw.Draw(dancer).rectangle((425, 160, 535, 300), fill=0)  # quita el «de»
    dancer = dancer.crop((430, 0, 740, 300))
    bbox = dancer.getbbox()
    dancer = dancer.crop(bbox)
    sil = Image.new("RGBA", dancer.size, (0, 0, 0, 0))
    sil.paste(Image.new("RGBA", dancer.size, ROSE + (255,)), (0, 0), dancer)
    sil.save(OUT / "bailarina.png", optimize=True)
    # Iconos
    for size, name in ((48, "favicon-48.png"), (180, "apple-touch-icon.png"), (192, "icon-192.png"), (512, "icon-512.png")):
        icon = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(icon)
        d.rounded_rectangle((0, 0, size - 1, size - 1), radius=size // 5, fill=NOIR + (255,))
        s = sil.copy()
        scale = size * 0.78 / max(s.size)
        s = s.resize((max(1, round(s.width * scale)), max(1, round(s.height * scale))), Image.LANCZOS)
        icon.alpha_composite(s, ((size - s.width) // 2, (size - s.height) // 2))
        icon.save(OUT / name, optimize=True)
    return light.crop(light.getbbox())


def og_image(light_logo):
    bg = Image.open(SRC / PHOTOS["flamenco"]).convert("RGB")
    bg = bg.resize((1200, round(bg.height * 1200 / bg.width)), Image.LANCZOS).crop((0, 20, 1200, 650))
    bg = ImageEnhance.Brightness(bg).enhance(0.55)
    grad = Image.new("L", (1200, 630))
    gd = ImageDraw.Draw(grad)
    for x in range(1200):
        gd.line([(x, 0), (x, 630)], fill=int(235 * max(0, 1 - x / 820)))
    bg.paste(Image.new("RGB", (1200, 630), NOIR), (0, 0), grad)
    lg = light_logo.resize((560, round(light_logo.height * 560 / light_logo.width)), Image.LANCZOS)
    bg.paste(lg, (70, 110), lg)
    d = ImageDraw.Draw(bg)
    try:
        f1 = ImageFont.truetype("C:/Windows/Fonts/georgiai.ttf", 34)
        f2 = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 22)
    except OSError:
        f1 = f2 = ImageFont.load_default()
    d.text((74, 120 + lg.height + 30), "Baila con el corazón, los pies te seguirán", font=f1, fill=(246, 201, 216))
    d.text((76, 120 + lg.height + 86), "FLAMENCO · BALLET · FUNKY · SALSA · K-POP · BAILE NUPCIAL · MADRID", font=f2, fill=(232, 180, 160))
    d.rectangle((76, 120 + lg.height + 76, 196, 120 + lg.height + 78), fill=(232, 180, 160))
    bg.save(OUT / "og-escuela-danza-manuela.jpg", quality=86, optimize=True)


if __name__ == "__main__":
    photos()
    decor()
    og_image(logos())
    print("OK", len(list(OUT.iterdir())), "archivos")
