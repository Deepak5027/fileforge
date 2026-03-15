CATEGORY_MAP = {
    # Documents
    "pdf": "document",
    "docx": "document",
    "doc": "document",
    "txt": "document",
    "rtf": "document",
    "odt": "document",
    "md": "document",
    "html": "document",
    "htm": "document",
    "epub": "document",
    # Images
    "jpg": "image",
    "jpeg": "image",
    "png": "image",
    "webp": "image",
    "bmp": "image",
    "svg": "image",
    "tiff": "image",
    "tif": "image",
    "gif": "image",
    "ico": "image",
    # Data
    "csv": "data",
    "json": "data",
    "xml": "data",
    "yaml": "data",
    "yml": "data",
    "xlsx": "data",
    "xls": "data",
    # Audio
    "mp3": "audio",
    "wav": "audio",
    "flac": "audio",
    "aac": "audio",
    "ogg": "audio",
    "m4a": "audio",
    "wma": "audio",
    # Video
    "mp4": "video",
    "avi": "video",
    "mov": "video",
    "mkv": "video",
    "webm": "video",
    "flv": "video",
    "wmv": "video",
}

SUPPORTED_PAIRS = {
    "document": [
        ("pdf", "docx"), ("pdf", "txt"), ("docx", "pdf"), ("docx", "rtf"),
        ("docx", "odt"), ("docx", "txt"), ("html", "pdf"), ("html", "txt"),
        ("epub", "pdf"), ("epub", "txt"), ("txt", "md"), ("md", "txt"),
        ("txt", "html"), ("rtf", "docx"), ("odt", "docx"),
    ],
    "image": [
        ("jpg", "png"), ("jpg", "webp"), ("jpg", "bmp"), ("jpg", "tiff"),
        ("png", "jpg"), ("png", "webp"), ("png", "bmp"), ("png", "gif"),
        ("webp", "jpg"), ("webp", "png"), ("bmp", "jpg"), ("bmp", "png"),
        ("tiff", "jpg"), ("tiff", "png"), ("svg", "png"), ("gif", "png"),
    ],
    "data": [
        ("csv", "json"), ("csv", "xlsx"), ("json", "csv"), ("json", "xml"),
        ("xml", "json"), ("xml", "yaml"), ("yaml", "xml"), ("yaml", "json"),
        ("xlsx", "csv"), ("xlsx", "json"),
    ],
    "audio": [
        ("mp3", "wav"), ("wav", "mp3"), ("flac", "mp3"), ("aac", "mp3"),
        ("ogg", "mp3"), ("m4a", "mp3"),
    ],
    "video": [
        ("mp4", "avi"), ("avi", "mp4"), ("mov", "mp4"), ("mkv", "mp4"),
        ("webm", "mp4"), ("flv", "mp4"), ("mp4", "mp3"),
    ],
}


def get_category(ext: str) -> str | None:
    return CATEGORY_MAP.get(ext.lower().lstrip("."))


def is_supported(from_fmt: str, to_fmt: str) -> bool:
    cat = get_category(from_fmt)
    if not cat:
        return False
    return (from_fmt.lower(), to_fmt.lower()) in SUPPORTED_PAIRS.get(cat, [])
