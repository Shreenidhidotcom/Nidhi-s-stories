"""Cut section recordings (A1, A2 ... B5) into single lines and register them in js/voice-files.js.

Usage, from the repository root:
    python3 tools/add-recordings.py <folder with A1.m4a, A2.m4a, ...>

Each section file must contain the lines of that section in order (see RECORDING-SCRIPT.md),
with a pause of about two seconds after each line. Needs ffmpeg.
Rebuild tools/voice-lines.json first if the content changed:  node tools/make-recording-script.js
"""
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "audio", "voice")
MANIFEST = os.path.join(ROOT, "js", "voice-files.js")
SECTIONS = json.load(open(os.path.join(ROOT, "tools", "voice-lines.json"), encoding="utf-8"))


def speech_spans(path, noise_db=-35, min_silence=0.7):
    """Return (start, end) of each stretch of speech, using ffmpeg's silence detection."""
    out = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af",
                          f"silencedetect=noise={noise_db}dB:d={min_silence}", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    duration = float(re.search(r"Duration: (\d+):(\d+):([\d.]+)", out).groups()[2]) + \
        60 * float(re.search(r"Duration: (\d+):(\d+)", out).group(2)) + \
        3600 * float(re.search(r"Duration: (\d+)", out).group(1))
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    spans, pos = [], 0.0
    for s, e in zip(starts, ends + [duration] * (len(starts) - len(ends))):
        if s - pos > 0.25:
            spans.append((pos, s))
        pos = e
    if duration - pos > 0.25:
        spans.append((pos, duration))
    return spans


def find_file(folder, code):
    for name in os.listdir(folder):
        stem = os.path.splitext(name)[0]
        if stem.upper() == code:
            return os.path.join(folder, name)
    return None


def main(folder):
    os.makedirs(OUT_DIR, exist_ok=True)
    files = {}
    if os.path.exists(MANIFEST):
        m = re.search(r"window\.VOICE_FILES = (\{.*\});", open(MANIFEST, encoding="utf-8").read(), re.S)
        if m:
            files = json.loads(m.group(1))
    problems = []
    for sec in SECTIONS:
        src = find_file(folder, sec["code"])
        if not src:
            continue
        spans = speech_spans(src)
        want = len(sec["lines"])
        if len(spans) != want:
            problems.append(f"{sec['code']}: found {len(spans)} lines, expected {want}. Please record this section again with clear pauses.")
            continue
        for i, ((start, end), line) in enumerate(zip(spans, sec["lines"]), 1):
            name = f"{sec['code']}-{i:02d}.mp3"
            a, b = max(0.0, start - 0.12), end + 0.18
            subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", src, "-ss", f"{a:.3f}", "-to", f"{b:.3f}",
                            "-af", "afade=t=in:d=0.03,loudnorm=I=-18:TP=-2", "-ac", "1", "-ar", "44100", "-b:a", "96k",
                            os.path.join(OUT_DIR, name)], check=True)
            for line_id in line["ids"]:
                files[line_id] = f"audio/voice/{name}"
        print(f"{sec['code']}: {want} lines added")
    head = open(MANIFEST, encoding="utf-8").read().split("window.VOICE_FILES")[0] if os.path.exists(MANIFEST) else ""
    with open(MANIFEST, "w", encoding="utf-8") as f:
        f.write(head + "window.VOICE_FILES = " + json.dumps(dict(sorted(files.items())), indent=2) + ";\n")
    for p in problems:
        print("NOT ADDED", p)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
