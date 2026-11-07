"""Génère les fichiers de données de l'application à partir de l'alignement.

usage : emit.py --map verse_map.json --texts texts.json --corpus CLE --id ID-DU-TEXTE --label "…" --data-dir tikrar/src/data
              [--chapters-meta chapters_meta.json --const NOM_CONSTANTE --chapters-file bayquniyya.ts]

verse_map.json : {"1": [{"verse": 1, "start": 0.4, "extra": false}, …], …} (début de chaque vers dans son chapitre).
Écrit data/verses/ID.ts (repères) et data/verseTexts/ID.ts (texte). Un vers « extra » (récité mais absent du texte)
n'a pas de texte. Avec --chapters-meta, écrit aussi la liste des chapitres (audio hébergé).
"""
import argparse
import json


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--map", required=True)
    p.add_argument("--texts", required=True)
    p.add_argument("--corpus", required=True)
    p.add_argument("--id", required=True)
    p.add_argument("--label", required=True)
    p.add_argument("--data-dir", required=True)
    p.add_argument("--chapters-meta")
    p.add_argument("--const")
    p.add_argument("--chapters-file")
    a = p.parse_args()
    vmap = json.load(open(a.map))
    texts = {v["n"]: v for v in json.load(open(a.texts, encoding="utf-8"))[a.corpus]}
    starts = [f"// {a.label}", "// Début de chaque vers (en secondes) dans l'audio de son chapitre.", "export const STARTS: Record<number, number[]> = {"]
    tx = [f"// {a.label}", "// Texte des vers par chapitre : [premier hémistiche, second hémistiche].",
          "// Les vers sans texte (absents de la source) s'affichent avec leur seul numéro.", "export const TEXTS: Record<number, [string, string][]> = {"]
    for num in sorted(vmap, key=int):
        vs = vmap[num]
        if not vs:
            continue
        starts.append(f"  {num}: [{', '.join(f'{v['start']:g}' for v in vs)}],")
        tx.append(f"  {num}: [")
        for v in vs:
            t = None if v.get("extra") else texts.get(v["verse"])
            tx.append("    [" + json.dumps(t["h1"], ensure_ascii=False) + ", " + json.dumps(t["h2"], ensure_ascii=False) + "]," if t else '    ["", ""],')
        tx.append("  ],")
    starts.append("};\n")
    tx.append("};\n")
    open(f"{a.data_dir}/verses/{a.id}.ts", "w", encoding="utf-8").write("\n".join(starts))
    open(f"{a.data_dir}/verseTexts/{a.id}.ts", "w", encoding="utf-8").write("\n".join(tx))
    print("écrit", f"{a.data_dir}/verses/{a.id}.ts", "et", f"{a.data_dir}/verseTexts/{a.id}.ts")
    if a.chapters_meta:
        meta = json.load(open(a.chapters_meta))
        lines = ['import { hostedAudio } from "./audioHost";', 'import type { Chapter } from "./chapters";', "",
                 f"// Chapitres : {a.label}", f"export const {a.const}: Chapter[] = ["]
        for c in meta:
            lines.append('  { n: %d, ar: %s, fr: %s, dur: %d, ...hostedAudio("%s") },' % (c["n"], json.dumps(c["ar"], ensure_ascii=False), json.dumps(c["fr"], ensure_ascii=False), c["dur"], c["file"]))
        lines.append("];\n")
        open(f"{a.data_dir}/{a.chapters_file}", "w", encoding="utf-8").write("\n".join(lines))
        print("écrit", f"{a.data_dir}/{a.chapters_file}")


if __name__ == "__main__":
    main()
