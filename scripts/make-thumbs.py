"""Make small WebP versions of project images for the home page.

For every project folder in public/img with numbered images (1.png, 2.png, ...),
writes thumb-1.webp, thumb-2.webp next to them (max 960px wide). Re-run after
adding or changing project images.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "public" / "img"
MAX_W = 960

for folder in sorted(p for p in ROOT.iterdir() if p.is_dir()):
    for n in (1, 2):
        src = next((folder / f"{n}{ext}" for ext in (".png", ".jpg", ".jpeg", ".webp") if (folder / f"{n}{ext}").exists()), None)
        if not src:
            continue
        dst = folder / f"thumb-{n}.webp"
        im = Image.open(src).convert("RGB")
        if im.width > MAX_W:
            im = im.resize((MAX_W, round(im.height * MAX_W / im.width)), Image.LANCZOS)
        im.save(dst, "WEBP", quality=80, method=6)
        print(f"{dst.relative_to(ROOT)}  {dst.stat().st_size // 1024} KB")
