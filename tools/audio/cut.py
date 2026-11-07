"""Découpe un enregistrement entier en fichiers de chapitre (mono, 64 kb/s) d'après l'alignement sur le texte.

usage : cut.py --align align.json --chapters chapitres.json --source enregistrement.mp3 --out-dir DOSSIER --prefix NOM

chapitres.json : [{"n": 1, "ar": "…", "fr": "…", "first": 1, "last": 7}, …]  (numéros de vers du texte)

Un chapitre commence juste après le dernier mot du chapitre précédent (il contient donc le titre annoncé par le
récitant, s'il y en a un) ; le premier commence au premier vers, ce qui retire la présentation du récitant.
Écrit DOSSIER/<prefix>-NN.mp3, DOSSIER/chapters_meta.json et DOSSIER/verse_map.json (début de chaque vers dans son chapitre).
"""
import argparse
import json
import os
import subprocess

from common import ffmpeg

TITLE_MAX_GAP = 8.0  # au-delà, on ne suppose pas de titre annoncé entre deux chapitres
TAIL = 1.5  # secondes gardées après le dernier mot


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--align", required=True)
    p.add_argument("--chapters", required=True)
    p.add_argument("--source", required=True)
    p.add_argument("--out-dir", required=True)
    p.add_argument("--prefix", required=True)
    a = p.parse_args()
    al = json.load(open(a.align))
    verses = {v["verse"]: v for v in al["verses"]}
    chapters = json.load(open(a.chapters))
    os.makedirs(a.out_dir, exist_ok=True)

    starts = []
    for k, c in enumerate(chapters):
        s1 = verses[c["first"]]["start"]
        if k == 0:
            start = max(0.0, s1 - 0.15)
        else:
            prev_end = verses[chapters[k - 1]["last"]]["last_word_end"]
            start = prev_end + 0.15 if prev_end is not None and s1 - prev_end <= TITLE_MAX_GAP else s1 - 0.15
        starts.append(min(start, s1))
    last_end = verses[chapters[-1]["last"]]["last_word_end"] or al["duration"]
    ends = starts[1:] + [min(al["duration"], last_end + TAIL)]

    meta, vmap = [], {}
    for c, a0, b0 in zip(chapters, starts, ends):
        name = f"{a.prefix}-{c['n']:02d}.mp3"
        subprocess.run([ffmpeg(), "-y", "-loglevel", "error", "-ss", f"{a0:.2f}", "-to", f"{b0:.2f}", "-i", a.source,
                        "-ac", "1", "-ar", "32000", "-b:a", "64k", f"{a.out_dir}/{name}"], check=True)
        meta.append({"n": c["n"], "ar": c["ar"], "fr": c["fr"], "dur": round(b0 - a0), "file": name, "start": round(a0, 2)})
        vmap[str(c["n"])] = [{"verse": n, "start": round(verses[n]["start"] - a0, 2)} for n in range(c["first"], c["last"] + 1)]
        assert vmap[str(c["n"])][0]["start"] >= 0, f"chapitre {c['n']} : premier vers avant le début du fichier"
    json.dump(meta, open(f"{a.out_dir}/chapters_meta.json", "w"), ensure_ascii=False, indent=1)
    json.dump(vmap, open(f"{a.out_dir}/verse_map.json", "w"), ensure_ascii=False)
    print(len(meta), "chapitres,", sum(len(v) for v in vmap.values()), "vers ;", sum(m["dur"] for m in meta), "s")


if __name__ == "__main__":
    main()
