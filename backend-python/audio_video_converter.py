"""
Audio/Video conversion - FFmpeg not available on free tier.
This stub returns a clear error message.
Upgrade to Render Starter ($7/mo) to enable FFmpeg.
"""


def convert_av(src_path: str, out_path: str, src_fmt: str, tgt_fmt: str):
    raise ValueError(
        "Audio/Video conversion requires FFmpeg which is not available on the free tier. "
        "Please upgrade to Render Starter plan ($7/month) to enable MP4, MP3, AVI conversions."
    )
