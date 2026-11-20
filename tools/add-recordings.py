"""Cut recorded sections (A1, A2 ... B5) into single lines and register them in js/voice-files.js.

Usage, from the repository root:
    python3 tools/add-recordings.py <folder with the recordings>

File names say which sections a file holds: "A1.mp3" holds section A1; "A2-4.mp3", "A2-A4.mp3"
or "A_2-4.mp3" hold sections A2, A3 and A4 in that order. Any prefix before the code is ignored.

The lines must be read in script order (RECORDING-SCRIPT.md). Pauses between lines can be short:
the file is split at every pause, and the pieces are matched to the script lines by sentence count,
length and number of syllables. Lines whose length or syllables look wrong are listed as "check".

Writes audio/voice/<code>-<nn>.mp3, js/voice-files.js and tools/voice-check.html (a page to listen
to every line next to its text). Needs ffmpeg, numpy and scipy.
Rebuild tools/voice-lines.json first if the content changed:  node tools/make-recording-script.js
"""
import html, json, math, os, re, subprocess, sys, tempfile

import numpy as np
from scipy.signal import butter, find_peaks, sosfiltfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "audio", "voice")
MANIFEST = os.path.join(ROOT, "js", "voice-files.js")
CHECK_PAGE = os.path.join(ROOT, "tools", "voice-check.html")
SECTIONS = {s["code"]: s for s in json.load(open(os.path.join(ROOT, "tools", "voice-lines.json"), encoding="utf-8"))}
SR, HOP = 16000, 0.01

# Syllable counts for words the simple rule gets wrong.
SPECIAL = {"ayu": 2, "ayu's": 2, "ojo": 2, "ojo's": 2, "amma": 2, "hello": 2, "chapati": 3, "ready": 2, "story": 2,
           "evening": 2, "tummy": 2, "comfy": 2, "sorry": 2, "secretly": 3, "rainbow": 2, "jasmine": 2, "mango": 2,
           "banana": 3, "carrot": 2, "fizzy": 2, "fuzzy": 2, "sparkly": 3, "little": 2, "waited": 2, "treasure": 2,
           "toilet": 2, "breakfast": 2, "bedtime": 2, "outside": 2, "glowing": 2, "blooming": 2, "flowers": 2,
           "pieces": 2, "hungry": 2, "you've": 1, "can't": 1, "that's": 1, "let's": 1}


def syllables(text):
    def one(word):
        w = re.sub(r"[^a-z'\-]", "", word.lower())
        if not w:
            return 0
        if w in SPECIAL:
            return SPECIAL[w]
        if "-" in w:
            return sum(one(p) for p in w.split("-"))
        w = w.replace("'", "")
        n = len(re.findall(r"[aeiouy]+", w))
        if w.endswith("e") and not w.endswith(("le", "ee")) and n > 1:
            n -= 1
        if w.endswith("ed") and not w.endswith(("ted", "ded")) and n > 1:
            n -= 1
        return max(1, n)
    return sum(one(x) for x in text.split())


def sentences(text):
    return max(1, len([p for p in re.split(r"[.!?]+(?:\s|$)", text.strip()) if p.strip()]))


def sections_in(stem):
    """'A1' -> ['A1'];  'A2-4', 'A2-A4', 'A_2-4', 'xyz-B_1-4' -> ['A2','A3','A4'] / ['B1'..'B4']."""
    m = None
    for m in re.finditer(r"(?<![A-Z0-9])([AB])[_ ]?(\d+)(?:\s*(?:-|–|TO)\s*\1?[_ ]?(\d+))?", stem.upper()):
        pass
    if not m:
        return []
    first, last = int(m.group(2)), int(m.group(3) or m.group(2))
    return [f"{m.group(1)}{n}" for n in range(first, last + 1)]


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def frames_db(x):
    n = int(SR * HOP)
    k = len(x) // n
    return 20 * np.log10(np.sqrt((x[:k * n].reshape(k, n) ** 2).mean(1) + 1e-12))


def pieces(x, min_gap=0.12):
    """Stretches of speech between pauses, as (start, end) in seconds."""
    db = frames_db(x)
    quiet = db < min(np.percentile(db, 10) + 12, -30)
    out, pos, run = [], 0.0, None
    for i, q in enumerate(np.append(quiet, True)):
        if q and run is None:
            run = i
        if not q and run is not None:
            if (i - run) * HOP >= min_gap:
                if run * HOP - pos > 0.08:
                    out.append((pos, run * HOP))
                pos = i * HOP
            run = None
    end = len(db) * HOP
    if run is not None and run * HOP - pos > 0.08:
        out.append((pos, run * HOP))
    elif run is None and end - pos > 0.08:
        out.append((pos, end))
    return out


def syllable_peaks(x):
    y = sosfiltfilt(butter(4, [300, 2500], btype="band", fs=SR, output="sos"), x)
    n = int(SR * HOP)
    k = len(y) // n
    rms = np.sqrt((y[:k * n].reshape(k, n) ** 2).mean(1) + 1e-10)
    db = 20 * np.log10(np.convolve(rms, np.hanning(7) / np.hanning(7).sum(), "same") + 1e-9)
    peaks, _ = find_peaks(db, prominence=3.5, distance=9, height=db.max() - 30)
    t = peaks * HOP
    return lambda a, b: int(((t >= a) & (t < b)).sum())


def align(segs, lines, peaks):
    """Group consecutive pieces into one group per line, choosing the grouping that fits best."""
    K, N = len(segs), len(lines)
    syl = [syllables(t) for t in lines]
    sent = [sentences(t) for t in lines]
    per_syl = sum(b - a for a, b in segs) / sum(syl)
    gaps = [0.0] + [segs[k][0] - segs[k - 1][1] for k in range(1, K)]
    cost = np.full((N + 1, K + 1), np.inf)
    back = np.zeros((N + 1, K + 1), int)
    cost[0, 0] = 0
    for i in range(1, N + 1):
        for k in range(i, K + 1):
            for j in range(max(i - 1, k - 6), k):
                if not np.isfinite(cost[i - 1, j]):
                    continue
                a, b = segs[j][0], segs[k - 1][1]
                c = 4 * math.log((b - a) / (per_syl * syl[i - 1] + 0.35)) ** 2
                c += 6 * math.log((peaks(a, b) + 1) / (syl[i - 1] + 1)) ** 2
                c += 0.6 * abs((k - j) - sent[i - 1])
                if j > 0:
                    c += 4 * max(0.0, 0.35 - gaps[j])
                if cost[i - 1, j] + c < cost[i, k]:
                    cost[i, k], back[i, k] = cost[i - 1, j] + c, j
    groups, k = [], K
    for i in range(N, 0, -1):
        groups.append((back[i, k], k))
        k = back[i, k]
    groups.reverse()
    out = []
    for i, (j, k) in enumerate(groups):
        a, b = segs[j][0], segs[k - 1][1]
        ratio = (b - a) / (per_syl * syl[i] + 0.35)
        found = peaks(a, b)
        check = ratio < 0.55 or ratio > 1.8 or abs(found - syl[i]) > max(3, 0.3 * syl[i])
        out.append({"from": j, "to": k, "start": a, "end": b, "check": check})
    return out


def main(folder):
    os.makedirs(OUT_DIR, exist_ok=True)
    files = {}
    if os.path.exists(MANIFEST):
        m = re.search(r"window\.VOICE_FILES = (\{.*\});", open(MANIFEST, encoding="utf-8").read(), re.S)
        if m:
            files = json.loads(m.group(1))
    problems, checks = [], []
    for name in sorted(os.listdir(folder)):
        codes = [c for c in sections_in(os.path.splitext(name)[0]) if c in SECTIONS]
        if not codes:
            continue
        src = os.path.join(folder, name)
        x = load(src)
        segs = pieces(x)
        items = [(c, n, line) for c in codes for n, line in enumerate(SECTIONS[c]["lines"], 1)]
        if len(segs) < len(items):
            problems.append(f"{name}: found {len(segs)} pieces of speech for {len(items)} lines. "
                            "Some lines are missing or run together; please record these sections again.")
            continue
        result = align(segs, [t["text"] for _, _, t in items], syllable_peaks(x))
        for (code, n, line), r in zip(items, result):
            before = segs[r["from"]][0] - segs[r["from"] - 1][1] if r["from"] > 0 else 0.2
            after = segs[r["to"]][0] - segs[r["to"] - 1][1] if r["to"] < len(segs) else 0.3
            a = max(0.0, r["start"] - min(0.1, before / 2))
            b = r["end"] + min(0.15, after / 2)
            clip = f"{code}-{n:02d}.mp3"
            # atrim resets the clip to start at 0, so the fades are timed from the start of the line.
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src, "-af",
                            f"atrim=start={a:.3f}:end={b:.3f},asetpts=PTS-STARTPTS,"
                            f"afade=t=in:d=0.02,afade=t=out:st={max(0, b - a - 0.04):.3f}:d=0.04",
                            "-ac", "1", "-ar", "44100", "-b:a", "96k", os.path.join(OUT_DIR, clip)], check=True)
            if np.abs(load(os.path.join(OUT_DIR, clip))).max() < 0.02:
                sys.exit(f"{clip} came out silent; nothing was changed in js/voice-files.js.")
            for line_id in line["ids"]:
                files[line_id] = f"audio/voice/{clip}"
            if r["check"]:
                checks.append(f"{code}-{n:02d}  {line['text']}")
        print(f"{name}: {', '.join(codes)}, {len(items)} lines added")
    head = open(MANIFEST, encoding="utf-8").read().split("window.VOICE_FILES")[0] if os.path.exists(MANIFEST) else ""
    with open(MANIFEST, "w", encoding="utf-8") as f:
        f.write(head + "window.VOICE_FILES = " + json.dumps(dict(sorted(files.items())), indent=2) + ";\n")
    write_check_page(CHECK_PAGE, "../audio/voice/", {c.split()[0] for c in checks})
    for c in checks:
        print("CHECK", c)
    for p in problems:
        print("NOT ADDED", p)


def write_check_page(path, audio_base, flagged=()):
    """A page listing every script line with its recording, to listen and check the cut."""
    rows = []
    for code, sec in SECTIONS.items():
        have = os.path.exists(os.path.join(OUT_DIR, f"{code}-01.mp3"))
        rows.append(f'<h2>{code} · {html.escape(sec["voice"])}{"" if have else " · not recorded yet"}'
                    f'{"<button class=all data-sec=" + code + ">Play all</button>" if have else ""}</h2><ol>')
        for n, line in enumerate(sec["lines"], 1):
            clip = f"{code}-{n:02d}"
            ok = os.path.exists(os.path.join(OUT_DIR, clip + ".mp3"))
            mark = ' <span class="flag">check</span>' if clip in flagged else ""
            btn = f'<button class=play data-src="{audio_base}{clip}.mp3" aria-label="Play {clip}">▶</button>' if ok else "<span class=none>–</span>"
            rows.append(f'<li data-sec="{code}">{btn}<span class=t><b>{clip}</b> {html.escape(line["text"])}{mark}</span></li>')
        rows.append("</ol>")
    page = """<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ojo voice check</title>
<style>
body{font-family:system-ui,sans-serif;margin:0;padding:16px;max-width:720px;margin:auto;color:#2b2140;background:#fffaf0}
h1{font-size:1.4rem;margin:.2em 0}p{color:#5a4f6b;line-height:1.45}
h2{font-size:1.05rem;margin:1.4em 0 .4em;display:flex;align-items:center;gap:10px}
ol{list-style:none;padding:0;margin:0}
li{display:flex;gap:10px;align-items:center;padding:8px;border-radius:12px}
li.on{background:#ffe9a8}
.t{line-height:1.35}.t b{color:#8a6d00;font-size:.8rem;margin-right:4px}
button{font:inherit;border:0;border-radius:999px;cursor:pointer}
.play{width:44px;height:44px;flex:none;background:#f6b800;color:#2b2140;font-size:1rem}
.all{padding:6px 14px;background:#2b2140;color:#fff;font-size:.85rem}
.flag{background:#ffd2c2;color:#8a2a00;border-radius:6px;padding:1px 6px;font-size:.75rem;margin-left:4px}
.none{width:44px;text-align:center;color:#aaa}
</style></head><body>
<h1>Ojo voice check</h1>
<p>Tap ▶ to hear a line, or <b>Play all</b> to hear a whole section while you read along.
Lines marked <span class="flag">check</span> were a different length from what the text suggests: please listen to those first.</p>
""" + "\n".join(rows) + """
<script>
const a=new Audio();let queue=[],cur=null;
function play(li){if(cur)cur.classList.remove('on');cur=li;li.classList.add('on');a.src=li.querySelector('.play').dataset.src;a.play();}
a.onended=()=>{if(cur)cur.classList.remove('on');const n=queue.shift();if(n)play(n);else cur=null;};
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.classList.contains('play')){queue=[];play(b.closest('li'));}
 if(b.classList.contains('all')){queue=[...document.querySelectorAll('li[data-sec="'+b.dataset.sec+'"]')].filter(l=>l.querySelector('.play'));play(queue.shift());}});
</script></body></html>
"""
    with open(path, "w", encoding="utf-8") as f:
        f.write(page)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
