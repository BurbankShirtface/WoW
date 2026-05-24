from PIL import Image
from pathlib import Path

src = Path(__file__).resolve().parent.parent / "assets" / "whizLogo.png"
out = src.parent
img = Image.open(src).convert("RGBA")

sizes = {
    "favicon-16x16.png": 16,
    "favicon-32x32.png": 32,
    "apple-touch-icon.png": 180,
    "android-chrome-192x192.png": 192,
    "android-chrome-512x512.png": 512,
}

for name, size in sizes.items():
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(out / name, format="PNG", optimize=True)
    print("wrote", name, size)

ico_sizes = [(16, 16), (32, 32), (48, 48)]
ico_images = [img.resize(s, Image.Resampling.LANCZOS) for s in ico_sizes]
ico_images[0].save(
    out / "favicon.ico",
    format="ICO",
    sizes=ico_sizes,
    append_images=ico_images[1:],
)
print("wrote favicon.ico")
