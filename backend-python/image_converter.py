"""
Image conversion using Pillow only (pure Python, no system packages).
Supports: JPG, PNG, WEBP, BMP, TIFF, GIF
SVG conversion not supported on free tier (needs cairosvg + libcairo system lib)
"""
from pathlib import Path
from PIL import Image
import io


def convert_image(src_path: str, out_path: str, src_fmt: str, tgt_fmt: str):
    src_fmt = src_fmt.lower().lstrip(".")
    tgt_fmt = tgt_fmt.lower().lstrip(".")

    if src_fmt == "svg":
        raise ValueError("SVG conversion requires cairosvg (not available on free tier). Please upgrade.")

    img = Image.open(str(src_path))

    FMT_MAP = {
        "jpg": "JPEG", "jpeg": "JPEG",
        "png": "PNG",
        "webp": "WEBP",
        "bmp": "BMP",
        "tiff": "TIFF", "tif": "TIFF",
        "gif": "GIF",
    }
    pil_fmt = FMT_MAP.get(tgt_fmt)
    if not pil_fmt:
        raise ValueError(f"Unsupported image target format: {tgt_fmt}")

    # Flatten alpha for formats that don't support it
    if img.mode in ("RGBA", "P", "LA"):
        if pil_fmt in ("JPEG", "BMP"):
            bg = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "P":
                img = img.convert("RGBA")
            if img.mode in ("RGBA", "LA"):
                bg.paste(img, mask=img.split()[-1])
            else:
                bg.paste(img)
            img = bg
        else:
            img = img.convert("RGBA")
    elif img.mode != "RGB" and pil_fmt == "JPEG":
        img = img.convert("RGB")

    save_kwargs = {}
    if pil_fmt == "JPEG":
        save_kwargs = {"quality": 92, "optimize": True}
    elif pil_fmt == "WEBP":
        save_kwargs = {"quality": 88}
    elif pil_fmt == "PNG":
        save_kwargs = {"optimize": True}

    img.save(str(out_path), format=pil_fmt, **save_kwargs)
