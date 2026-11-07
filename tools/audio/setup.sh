#!/usr/bin/env bash
# Crée l'environnement Python des outils audio (isolé, hors du projet) et affiche son chemin.
set -euo pipefail
VENV="${TIKRAR_AUDIO_VENV:-$HOME/.cache/tikrar-audio-venv}"
if [ ! -x "$VENV/bin/python" ]; then
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install -q faster-whisper imageio-ffmpeg numpy rapidfuzz yt-dlp
fi
echo "$VENV"
