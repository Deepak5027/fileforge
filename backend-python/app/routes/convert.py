import os
import uuid
import shutil
import asyncio
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse

from app.services.document_converter import convert_document
from app.services.image_converter import convert_image
from app.services.data_converter import convert_data
from app.services.audio_video_converter import convert_av
from app.utils.file_cleanup import schedule_cleanup
from app.utils.format_registry import get_category

router = APIRouter()

UPLOAD_DIR = Path("/tmp/fileforge/uploads")
OUTPUT_DIR = Path("/tmp/fileforge/outputs")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


@router.post("/process")
async def process_conversion(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    targetFormat: str = Form(...),
    conversionId: str = Form(...),
):
    """
    Receives a file from Node.js backend, converts it, returns download URL.
    """
    # Read & size-check
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 50MB)")

    # Save upload
    src_ext = Path(file.filename).suffix.lower().lstrip(".")
    job_id = str(uuid.uuid4())
    src_path = UPLOAD_DIR / f"{job_id}.{src_ext}"
    out_path = OUTPUT_DIR / f"{job_id}.{targetFormat.lower()}"

    src_path.write_bytes(content)

    try:
        category = get_category(src_ext)

        if category == "image":
            await asyncio.get_event_loop().run_in_executor(
                None, convert_image, str(src_path), str(out_path), src_ext, targetFormat
            )
        elif category == "document":
            await asyncio.get_event_loop().run_in_executor(
                None, convert_document, str(src_path), str(out_path), src_ext, targetFormat
            )
        elif category == "data":
            await asyncio.get_event_loop().run_in_executor(
                None, convert_data, str(src_path), str(out_path), src_ext, targetFormat
            )
        elif category in ("audio", "video"):
            await asyncio.get_event_loop().run_in_executor(
                None, convert_av, str(src_path), str(out_path), src_ext, targetFormat
            )
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported format: {src_ext}")

        if not out_path.exists():
            raise HTTPException(status_code=500, detail="Conversion produced no output")

        # Schedule file cleanup in 1 hour
        background_tasks.add_task(schedule_cleanup, [str(src_path), str(out_path)], delay=3600)

        # Return internal path — Node will generate signed URL or serve directly
        download_path = f"/convert/download/{job_id}/{targetFormat.lower()}"
        return {
            "status": "done",
            "downloadUrl": download_path,
            "storagePath": str(out_path),
            "conversionId": conversionId,
        }

    except HTTPException:
        raise
    except Exception as e:
        # Clean up on failure
        for p in [src_path, out_path]:
            if p.exists():
                p.unlink()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download/{job_id}/{ext}")
async def download_file(job_id: str, ext: str, background_tasks: BackgroundTasks):
    """Serve converted file for download."""
    # Sanitize
    safe_id = "".join(c for c in job_id if c.isalnum() or c == "-")
    safe_ext = "".join(c for c in ext if c.isalnum())

    out_path = OUTPUT_DIR / f"{safe_id}.{safe_ext}"
    if not out_path.exists():
        raise HTTPException(status_code=404, detail="File not found or expired")

    return FileResponse(
        path=str(out_path),
        filename=f"converted.{safe_ext}",
        media_type="application/octet-stream",
    )
