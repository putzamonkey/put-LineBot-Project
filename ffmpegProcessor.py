#!/usr/bin/env python3

import sys
import json
import ffmpeg
import os

def probe_video_info(path):
    """
    Returns {'width', 'height', 'fps'} or None if probing fails.
    """
    try:
        data = ffmpeg.probe(path)
        video_streams = [s for s in data["streams"] if s["codec_type"] == "video"]
        if not video_streams:
            return None
        v = video_streams[0]
        width = int(v["width"])
        height = int(v["height"])
        # parse FPS like "30/1"
        fps_str = v.get("r_frame_rate", "0/1")
        num, den = fps_str.split("/")
        fps_val = float(num) / float(den) if float(den) != 0 else 0
        return {"width": width, "height": height, "fps": fps_val}
    except Exception as e:
        sys.stderr.write(f"[Python] ffmpeg.probe failed: {str(e)}\n")
        return None

def generate_output_filename(input_path, extension, is_video):
    """
    Generates the output file path in the appropriate subfolder based on output type.

    Example:
      input_path = './download/video.mp4'
      is_video = True
      => './processed_media/video/video_processed.mkv'

      input_path = './download/audio.mp3'
      is_video = False
      => './processed_media/audio/audio_processed.mp3'
    """
    subfolder = "video" if is_video else "audio"
    output_dir = os.path.join("processed_media", subfolder)
    os.makedirs(output_dir, exist_ok=True)

    base_name = os.path.splitext(os.path.basename(input_path))[0]
    return os.path.join(output_dir, f"{base_name}_processed{extension}")


def main():
    raw_in = sys.stdin.read().strip()
    if not raw_in:
        print(json.dumps({"error": "No input received"}))
        sys.exit(1)

    try:
        data = json.loads(raw_in)
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON input: {str(e)}"}))
        sys.exit(1)

    input_path = data.get("inputPath")
    video_output = data.get("videoOutput", False)
    resolution_obj = data.get("resolution")  # e.g. { "mode": "scale", "value": 0.5 } or { "mode": "resolution", "width": 1280, "height": 720 }
    fps = float(data.get("fps", 0))          # 0 => keep original
    quality = data.get("quality", "standard").lower()
    output_format = data.get("outputFormat", ".mp4")

    if not input_path:
        print(json.dumps({"error": "inputPath is required"}))
        sys.exit(1)

    output_path = generate_output_filename(input_path, output_format, video_output)

    # -----------------------------------
    # AUDIO-ONLY MODE (videoOutput=false)
    # -----------------------------------
    if not video_output:
        sys.stderr.write("[Python] Processing audio only...\n")

        # "low" => 128k
        # "standard" => 256k
        # "high" => 320k
        audio_bitrate = None

        if quality == "low":
            audio_bitrate = "128k"
        elif quality == "standard":
            audio_bitrate = "256k"
        elif quality == "high":
            audio_bitrate = "320k"

        try:
            inp = ffmpeg.input(input_path)
            # Always encode with the chosen bitrate
            out = inp.output(output_path, audio_bitrate=audio_bitrate, vn=None)

            ffmpeg.run(out, overwrite_output=True)
            print(json.dumps({"processedFilePath": output_path}))
            sys.exit(0)
        except ffmpeg.Error as e:
            sys.stderr.write(f"[Python] FFmpeg audio error:\n{e.stderr}\n")
            print(json.dumps({"error": str(e)}))
            sys.exit(1)

    # -----------------------------------
    # VIDEO MODE (videoOutput=true)
    # -----------------------------------
    sys.stderr.write("[Python] Processing video (with audio copy)...\n")

    info = probe_video_info(input_path)
    if not info:
        print(json.dumps({"error": "Could not retrieve video info"}))
        sys.exit(1)

    orig_w = info["width"]
    orig_h = info["height"]
    orig_fps = info["fps"]

    # Separate video & audio streams from the input
    inp = ffmpeg.input(input_path)
    video = inp.video
    audio = inp.audio  # We'll copy this audio track as-is.

    # --- Apply video filters ---
    # Resolution
    if resolution_obj:
        mode = resolution_obj.get("mode")
        if mode == "scale":
            scale_factor = float(resolution_obj.get("value", 1))
            new_w = int(orig_w * scale_factor)
            new_h = int(orig_h * scale_factor)
            video = video.filter("scale", new_w, new_h)
        elif mode == "resolution":
            w = resolution_obj.get("width")
            h = resolution_obj.get("height")
            video = video.filter("scale", w, h)

    # FPS logic
    if fps > 0:
        if fps > orig_fps:
            video = video.filter("minterpolate", fps=fps)
        else:
            video = video.filter("fps", fps)

    # --- Quality settings (video) ---
    # "low" => preset=ultrafast
    # "high" => crf=18
    # "standard" => no special param
    output_kwargs = {
        "vcodec": "libx264",  # re-encode using libx264 so filters apply
        "acodec": "copy"      # copy audio track unchanged
    }

    if quality == "low":
        # preset ultrafast
        output_kwargs["preset"] = "ultrafast"
    elif quality == "high":
        # crf=18
        output_kwargs["crf"] = 18

    # Build final output with both streams
    try:
        out = ffmpeg.output(video, audio, output_path, **output_kwargs)
        ffmpeg.run(out, overwrite_output=True)

        print(json.dumps({"processedFilePath": output_path}))
        sys.exit(0)

    except ffmpeg.Error as e:
        sys.stderr.write(f"[Python] FFmpeg video error:\n{e.stderr}\n")
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
