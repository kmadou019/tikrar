"""Fonctions communes : normalisation de l'arabe, lecture audio, enveloppe d'énergie, recherche de silence."""
import re
import subprocess

import imageio_ffmpeg
import numpy as np

SR = 16000
FRAME = 160  # 10 ms


def ffmpeg():
    return imageio_ffmpeg.get_ffmpeg_exe()


def norm(text):
    """Texte arabe sans voyelles ni ponctuation, lettres unifiées : sert à comparer le texte et la récitation."""
    text = re.sub(r"[ً-ٰٟـۖ-ۭ]", "", text)
    text = text.translate({ord(c): "ا" for c in "أإآٱ"}).replace("ى", "ي").replace("ة", "ه").replace("ؤ", "و").replace("ئ", "ي")
    return re.sub(r"[^ء-ي ]+", "", text).strip()


def load_audio(path):
    raw = subprocess.run([ffmpeg(), "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def envelope(audio):
    """Niveau sonore en dB par tranche de 10 ms, lissé sur 30 ms."""
    n = len(audio) // FRAME
    x = audio[: n * FRAME].reshape(n, FRAME)
    db = 20 * np.log10(np.sqrt((x ** 2).mean(axis=1)) + 1e-7)
    return np.convolve(db, np.ones(3) / 3, mode="same")


def valley(env, lo, hi, near=None):
    """Milieu du plateau le plus calme de [lo, hi] (secondes), le plus proche de `near`."""
    a = max(0, int(lo * SR / FRAME))
    b = min(len(env) - 1, int(hi * SR / FRAME))
    if b <= a:
        return (lo + hi) / 2
    seg = env[a : b + 1]
    quiet = set(np.where(seg <= seg.min() + 1.5)[0].tolist())
    target = (int(near * SR / FRAME) - a) if near is not None else sorted(quiet)[len(quiet) // 2]
    start = min(quiet, key=lambda q: abs(q - target))
    lo_i = hi_i = start
    while lo_i - 1 in quiet:
        lo_i -= 1
    while hi_i + 1 in quiet:
        hi_i += 1
    return (a + (lo_i + hi_i) / 2 + 0.5) * FRAME / SR
