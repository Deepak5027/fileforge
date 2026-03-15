"""
Document conversion using LibreOffice CLI, pypdf, python-docx, pandoc, weasyprint.
Handles: PDF, DOCX, TXT, RTF, ODT, HTML, MD, EPUB
"""
import subprocess
import shutil
import os
from pathlib import Path


def _libreoffice_convert(src_path: str, out_dir: str, target_fmt: str) -> Path:
    """Use LibreOffice headless to convert a document."""
    soffice = shutil.which("soffice") or shutil.which("libreoffice")
    if not soffice:
        raise RuntimeError(
            "LibreOffice not installed. Install with: apt-get install libreoffice"
        )
    fmt_map = {
        "docx": "docx",
        "doc": "doc",
        "pdf": "pdf",
        "odt": "odt",
        "rtf": "rtf",
        "txt": "txt",
        "html": "html",
    }
    lo_fmt = fmt_map.get(target_fmt, target_fmt)

    result = subprocess.run(
        [soffice, "--headless", "--convert-to", lo_fmt, "--outdir", out_dir, src_path],
        capture_output=True, text=True, timeout=120
    )
    if result.returncode != 0:
        raise RuntimeError(f"LibreOffice error: {result.stderr}")

    # LibreOffice names the output file based on the input filename
    src_stem = Path(src_path).stem
    out_file = Path(out_dir) / f"{src_stem}.{lo_fmt}"
    if not out_file.exists():
        # Try without extension
        candidates = list(Path(out_dir).glob(f"{src_stem}.*"))
        if candidates:
            out_file = candidates[0]
        else:
            raise RuntimeError("LibreOffice produced no output file")
    return out_file


def _pandoc_convert(src_path: str, out_path: str, src_fmt: str, tgt_fmt: str):
    """Use pandoc for markdown/txt/epub conversions."""
    pandoc = shutil.which("pandoc")
    if not pandoc:
        raise RuntimeError("Pandoc not installed. Install with: apt-get install pandoc")

    result = subprocess.run(
        [pandoc, src_path, "-f", src_fmt, "-t", tgt_fmt, "-o", out_path],
        capture_output=True, text=True, timeout=60
    )
    if result.returncode != 0:
        raise RuntimeError(f"Pandoc error: {result.stderr}")


def _html_to_pdf(src_path: str, out_path: str):
    """HTML → PDF via WeasyPrint."""
    try:
        from weasyprint import HTML
        HTML(filename=src_path).write_pdf(out_path)
    except ImportError:
        raise RuntimeError("WeasyPrint not installed. Run: pip install weasyprint")


def _epub_to_text(src_path: str, out_path: str):
    try:
        import ebooklib
        from ebooklib import epub
        import html2text
        book = epub.read_epub(src_path)
        h = html2text.HTML2Text()
        h.ignore_links = True
        texts = []
        for item in book.get_items_of_type(ebooklib.ITEM_DOCUMENT):
            texts.append(h.handle(item.get_content().decode("utf-8", errors="ignore")))
        Path(out_path).write_text("\n\n".join(texts), encoding="utf-8")
    except ImportError:
        raise RuntimeError("ebooklib/html2text not installed")


def _txt_to_md(src_path: str, out_path: str):
    """Simple passthrough — plain text is valid markdown."""
    shutil.copy2(src_path, out_path)


def _md_to_txt(src_path: str, out_path: str):
    try:
        import markdown, html2text
        md_content = Path(src_path).read_text(encoding="utf-8")
        html = markdown.markdown(md_content)
        h = html2text.HTML2Text()
        h.ignore_links = False
        Path(out_path).write_text(h.handle(html), encoding="utf-8")
    except ImportError:
        # Fallback: just copy
        shutil.copy2(src_path, out_path)


def convert_document(src_path: str, out_path: str, src_fmt: str, tgt_fmt: str):
    src = src_fmt.lower()
    tgt = tgt_fmt.lower()
    out = Path(out_path)
    out_dir = str(out.parent)

    # txt/md special cases
    if src == "txt" and tgt == "md":
        return _txt_to_md(src_path, out_path)
    if src == "md" and tgt == "txt":
        return _md_to_txt(src_path, out_path)

    # Pandoc handles md/txt/epub → various
    PANDOC_PAIRS = {
        ("md", "html"), ("md", "pdf"), ("md", "docx"),
        ("txt", "html"), ("epub", "txt"), ("epub", "html"),
    }
    if (src, tgt) in PANDOC_PAIRS:
        fmt_map = {"md": "markdown", "txt": "plain", "html": "html",
                   "pdf": "pdf", "docx": "docx", "epub": "epub"}
        return _pandoc_convert(src_path, out_path,
                               fmt_map.get(src, src), fmt_map.get(tgt, tgt))

    # HTML → PDF via WeasyPrint
    if src in ("html", "htm") and tgt == "pdf":
        return _html_to_pdf(src_path, out_path)

    # EPUB → PDF via pandoc
    if src == "epub" and tgt == "pdf":
        return _pandoc_convert(src_path, out_path, "epub", "pdf")

    # Everything else: LibreOffice
    lo_out = _libreoffice_convert(src_path, out_dir, tgt)
    if str(lo_out) != out_path:
        shutil.move(str(lo_out), out_path)
