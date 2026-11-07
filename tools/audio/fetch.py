"""Recherche et téléchargement d'enregistrements (YouTube) avec yt-dlp.

usage :
  fetch.py search "requête" [N]        → liste JSON de candidats (titre, chaîne, durée, licence, url)
  fetch.py info URL                    → métadonnées d'une vidéo (titre, chaîne, durée, licence, description)
  fetch.py download URL sortie.mp3     → piste audio en mp3
"""
import json
import subprocess
import sys

from common import ffmpeg

BASE = ["yt-dlp", "--js-runtimes", "node", "--no-playlist", "--no-warnings"]


def run(args):
    return subprocess.run(BASE + args, capture_output=True, text=True, check=True).stdout


def fields(d):
    return {k: d.get(k) for k in ("id", "title", "channel", "uploader", "duration", "duration_string", "license", "upload_date", "webpage_url", "view_count")}


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "search":
        n = sys.argv[3] if len(sys.argv) > 3 else "8"
        out = run(["--flat-playlist", "--dump-json", f"ytsearch{n}:{sys.argv[2]}"])
        rows = [json.loads(l) for l in out.splitlines() if l.strip()]
        print(json.dumps([{**fields(r), "url": r.get("url") or r.get("webpage_url")} for r in rows], ensure_ascii=False, indent=1))
    elif cmd == "info":
        d = json.loads(run(["--skip-download", "--dump-json", sys.argv[2]]))
        print(json.dumps({**fields(d), "description": (d.get("description") or "")[:1500]}, ensure_ascii=False, indent=1))
    elif cmd == "download":
        out = sys.argv[3]
        base = out[:-4] if out.endswith(".mp3") else out
        run(["-x", "--audio-format", "mp3", "--audio-quality", "0", "--ffmpeg-location", ffmpeg(), "-o", base + ".%(ext)s", sys.argv[2]])
        print(base + ".mp3")
