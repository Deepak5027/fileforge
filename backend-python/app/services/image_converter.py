"""
Image conversion using Pillow + cairosvg.
Handles: JPG, PNG, WEBP, BMP, TIFF, GIF, SVG
"""
from pathlib import Path
from PIL import Image
import io


def convert_image(src_path: str, out_path: str, src_fmt: str, tgt_fmt: str):
    src = Path(src_path)
    out = Path(out_path)
    src_fmt = src_fmt.lower().lstrip(".")
    tgt_fmt = tgt_fmt.lower().lstrip(".")

    # SVG → raster: use cairosvg
    if src_fmt == "svg":
        try:
            import cairosvg
        except ImportError:
            raise RuntimeError("cairosvg not installed. Run: pip install cairosvg")

        png_data = cairosvg.svg2png(url=str(src))
        if tgt_fmt == "png":
            out.write_bytes(png_data)
            return
        # Convert PNG bytes → target via Pillow
        img = Image.open(io.BytesIO(png_data))
    else:
        img = Image.open(str(src))

    # Normalise mode
    if img.mode in ("RGBA", "P", "LA"):
        if tgt_fmt in ("jpg", "jpeg", "bmp"):
            # JPEG/BMP don't support alpha — flatten onto white
            bg = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "P":
                img = img.convert("RGBA")
            bg.paste(img, mask=img.split()[3] if img.mode == "RGBA" else None)
            img = bg
        else:
            img = img.convert("RGBA")
    elif img.mode != "RGB":
        img = img.convert("RGB")

    # PIL format names
    FMT_MAP = {
        "jpg": "JPEG", "jpeg": "JPEG",
        "png": "PNG",
        "webp": "WEBP",
        "bmp": "BMP",
        "tiff": "TIFF", "tif": "TIFF",
        "gif": "GIF",
        "ico": "ICO",
    }
    pil_fmt = FMT_MAP.get(tgt_fmt)
    if not pil_fmt:
        raise ValueError(f"Unsupported image target format: {tgt_fmt}")

    save_kwargs = {}
    if pil_fmt == "JPEG":
        save_kwargs["quality"] = 92
        save_kwargs["optimize"] = True
    elif pil_fmt == "WEBP":
        save_kwargs["quality"] = 88
        save_kwargs["method"] = 4
    elif pil_fmt == "PNG":
        save_kwargs["optimize"] = True

    img.save(str(out), format=pil_fmt, **save_kwargs)
