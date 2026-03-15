"""
Audio/Video conversion using FFmpeg.
FFmpeg must be installed: apt-get install ffmpeg
"""
import subprocess
import shutil


def convert_av(src_path: str, out_path: str, src_fmt: str, tgt_fmt: str):
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError(
            "FFmpeg not installed. Install with: apt-get install ffmpeg"
        )

    src = src_fmt.lower()
    tgt = tgt_fmt.lower()

    cmd = [ffmpeg, "-y", "-i", src_path]

    # Audio-specific quality flags
    if tgt == "mp3":
        cmd += ["-codec:a", "libmp3lame", "-qscale:a", "2"]
    elif tgt == "aac":
        cmd += ["-codec:a", "aac", "-b:a", "192k"]
    elif tgt == "wav":
        cmd += ["-codec:a", "pcm_s16le"]
    elif tgt == "flac":
        cmd += ["-codec:a", "flac"]
    elif tgt == "ogg":
        cmd += ["-codec:a", "libvorbis", "-qscale:a", "4"]
    # Video quality flags
    elif tgt == "mp4":
        cmd += ["-codec:v", "libx264", "-crf", "23", "-preset", "fast",
                "-codec:a", "aac", "-b:a", "128k"]
    elif tgt == "webm":
        cmd += ["-codec:v", "libvpx-vp9", "-crf", "30", "-b:v", "0",
                "-codec:a", "libopus"]
    elif tgt == "avi":
        cmd += ["-codec:v", "libxvid", "-qscale:v", "4",
                "-codec:a", "libmp3lame"]
    elif tgt == "mov":
        cmd += ["-codec:v", "libx264", "-codec:a", "aac"]

    # If video → audio (e.g. mp4 → mp3), strip video stream
    VIDEO_FMTS = {"mp4", "avi", "mov", "mkv", "webm", "flv", "wmv"}
    AUDIO_FMTS = {"mp3", "wav", "flac", "aac", "ogg", "m4a"}
    if src in VIDEO_FMTS and tgt in AUDIO_FMTS:
        cmd += ["-vn"]  # no video

    cmd.append(out_path)

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if result.returncode != 0:
        raise RuntimeError(f"FFmpeg error: {result.stderr[-500:]}")
