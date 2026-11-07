"""Lit un fichier de texte de poème (Markdown) et en extrait les vers.

Format attendu, après un titre « النص الكامل » : un vers par ligne, `**١** premier hémistiche ‖ second hémistiche`,
avec éventuellement des titres de sections (`###`). Écrit un JSON {corpus: [{n, h1, h2, section}]}.
"""
import json
import re
import sys

AR_DIGITS = {ord(c): str(i) for i, c in enumerate("٠١٢٣٤٥٦٧٨٩")}


def parse(path):
    text = open(path, encoding="utf-8").read()
    body = text[text.index("النص الكامل"):]
    section, verses = None, []
    for line in body.split("\n"):
        m = re.match(r"^#{2,4}\s+(.+?)\s*$", line)
        if m and "النص الكامل" not in m.group(1):
            section = m.group(1)
            continue
        m = re.match(r"^\*\*([٠-٩]+)\*\*\s*(.+?)\s*‖\s*(.+?)\s*$", line)
        if m:
            verses.append({"n": int(m.group(1).translate(AR_DIGITS)), "h1": m.group(2), "h2": m.group(3), "section": section})
    nums = [v["n"] for v in verses]
    assert nums == list(range(1, len(nums) + 1)), "numérotation des vers non continue"
    return verses


if __name__ == "__main__":
    # usage : texts.py corpus=fichier.md [corpus=fichier.md ...] --out texts.json
    out = sys.argv[sys.argv.index("--out") + 1]
    data = {}
    for arg in sys.argv[1:]:
        if "=" in arg and not arg.startswith("--"):
            key, path = arg.split("=", 1)
            data[key] = parse(path)
            print(key, len(data[key]), "vers,", len({v["section"] for v in data[key]}), "sections")
    json.dump(data, open(out, "w", encoding="utf-8"), ensure_ascii=False)
