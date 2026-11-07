# Outils audio

Scripts utilisés pour ajouter un enregistrement à Tikrar : télécharger, transcrire, aligner sur le texte, couper en chapitres, générer les données. Ils sont enchaînés par le skill `ajouter-lecteur` (`.claude/skills/ajouter-lecteur/SKILL.md`).

```bash
PY="$(tools/audio/setup.sh)/bin/python"      # environnement isolé (faster-whisper, rapidfuzz, yt-dlp, ffmpeg)
cd tools/audio                                # à lancer sans l'option -I de Python

$PY fetch.py search "<requête>" 10            # candidats YouTube
$PY fetch.py download <url> enregistrement.mp3
$PY texts.py <cle>=texte.md --out texts.json  # vers du texte (format Markdown du projet)
$PY transcribe.py transcripts enregistrement.mp3
$PY align.py whole --texts texts.json --corpus <cle> --transcript transcripts/enregistrement.json --audio enregistrement.mp3 --out align.json
$PY cut.py --align align.json --chapters chapitres.json --source enregistrement.mp3 --out-dir out --prefix <prefixe>
$PY emit.py --map out/verse_map.json --texts texts.json --corpus <cle> --id <id> --label "<libellé>" --data-dir ../../src/data
```

`align.py chapters` fait le même travail pour un enregistrement déjà coupé en fichiers de chapitre (un JSON de transcription par fichier).

Principe de l'alignement : les mots entendus sont comparés aux mots du texte (distance de Levenshtein, programmation dynamique) ; chaque début de vers est ensuite posé au moment le plus silencieux de la pause qui le précède (fenêtre de 1,5 s avant à 0,5 s après l'estimation, choisie en comparant quatre largeurs sur 95 vers).
