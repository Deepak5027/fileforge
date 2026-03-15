import asyncio
import os
from pathlib import Path


async def schedule_cleanup(paths: list[str], delay: int = 3600):
    """Delete files after `delay` seconds."""
    await asyncio.sleep(delay)
    for path in paths:
        try:
            p = Path(path)
            if p.exists():
                p.unlink()
        except Exception as e:
            print(f"Cleanup error for {path}: {e}")


def cleanup_now(paths: list[str]):
    """Immediate sync cleanup."""
    for path in paths:
        try:
            p = Path(path)
            if p.exists():
                p.unlink()
        except Exception as e:
            print(f"Cleanup error for {path}: {e}")
