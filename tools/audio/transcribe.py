"""Transcrit un ou plusieurs fichiers audio (Whisper, arabe) avec l'horaire de chaque mot.

usage : transcribe.py SORTIE_DOSSIER fichier1.mp3 [fichier2.mp3 ...]   → SORTIE_DOSSIER/<nom>.json
"""
import json
import os
import subprocess
import sys

import numpy as np
from faster_whisper import WhisperModel

from common import SR, ffmpeg

out, files = sys.argv[1], sys.argv[2:]
os.makedirs(out, exist_ok=True)
model = WhisperModel(os.environ.get("TIKRAR_WHISPER", "medium"), device="cpu", compute_type="int8", cpu_threads=int(os.environ.get("TIKRAR_THREADS", "10")))
for f in files:
    name = os.path.splitext(os.path.basename(f))[0]
    dst = f"{out}/{name}.json"
    if os.path.exists(dst):
        continue
    raw = subprocess.run([ffmpeg(), "-i", f, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    audio = np.frombuffer(raw, dtype=np.float32)
    segs, _ = model.transcribe(audio, language="ar", vad_filter=True, word_timestamps=True)
    res = [
        {"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip(),
         "words": [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for w in s.words]}
        for s in segs
    ]
    json.dump({"duration": len(audio) / SR, "segments": res}, open(dst, "w"), ensure_ascii=False)
    print(name, len(res), "segments", flush=True)
print("DONE", flush=True)
