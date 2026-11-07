"""Aligne la récitation (mots transcrits avec horaires) sur le texte exact des vers.

Deux modes :
  whole     un enregistrement entier  → début de chaque vers dans l'enregistrement
  chapters  un fichier par chapitre   → vers de chaque chapitre et leur début dans le fichier du chapitre

L'alignement compare les mots (distance de Levenshtein) et tolère mots manquants, mots en trop (titres annoncés,
erreurs de reconnaissance) ; chaque début de vers est ensuite posé au moment le plus silencieux de la pause qui le précède.
"""
import argparse
import glob
import json
import os

import numpy as np
from rapidfuzz.distance import Levenshtein
from rapidfuzz.process import cdist

from common import SR, FRAME, envelope, load_audio, norm, valley

GAP_ASR = 0.45  # mot entendu absent du texte (titre annoncé, erreur)
GAP_TEXT = 0.45  # mot du texte non entendu
SIM_OFFSET = 0.45
MATCH_MIN = 0.7  # similarité minimale pour qu'un couple de mots compte comme correspondance


def text_words(verses):
    words, owner = [], []
    for vi, v in enumerate(verses):
        for w in (norm(v["h1"]) + " " + norm(v["h2"])).split():
            words.append(w)
            owner.append(vi)
    return words, np.array(owner)


def asr_words(tr):
    out = []
    for seg in tr["segments"]:
        for w in seg["words"]:
            n = norm(w["w"]).replace(" ", "")
            if n:
                out.append((n, w["s"], w["e"]))
    return out


def align(a_words, t_words):
    """Alignement global (fin du texte libre) : renvoie les couples (i, j) fiables et l'indice de fin dans le texte."""
    m, n = len(a_words), len(t_words)
    if m == 0 or n == 0:
        return [], 0
    sim = cdist([w[0] for w in a_words], t_words, scorer=Levenshtein.normalized_similarity, dtype=np.float32)
    score = (sim - SIM_OFFSET) * 2
    H = np.zeros((m + 1, n + 1), dtype=np.float32)
    P = np.zeros((m + 1, n + 1), dtype=np.int8)  # 0 diagonale, 1 mot entendu en trop, 2 mot du texte manquant
    H[0, :] = -GAP_TEXT * np.arange(n + 1)
    P[0, 1:] = 2
    H[:, 0] = -GAP_ASR * np.arange(m + 1)
    P[1:, 0] = 1
    for i in range(1, m + 1):
        row, prev, srow, prow = H[i], H[i - 1], score[i - 1], P[i]
        left = row[0]
        for j in range(1, n + 1):
            d = prev[j - 1] + srow[j - 1]
            u = prev[j] - GAP_ASR
            l = left - GAP_TEXT
            if d >= u and d >= l:
                left, prow[j] = d, 0
            elif u >= l:
                left, prow[j] = u, 1
            else:
                left, prow[j] = l, 2
            row[j] = left
    j = j_end = int(np.argmax(H[m]))
    i, pairs = m, []
    while i > 0 or j > 0:
        mv = P[i, j]
        if i > 0 and j > 0 and mv == 0:
            if sim[i - 1, j - 1] >= MATCH_MIN:
                pairs.append((i - 1, j - 1))
            i, j = i - 1, j - 1
        elif i > 0 and (mv == 1 or j == 0):
            i -= 1
        else:
            j -= 1
    pairs.reverse()
    return pairs, j_end


def verse_estimates(pairs, a_words, owner, first_word):
    """Pour chaque vers touché par des correspondances : (début estimé, fin du dernier mot, nombre de correspondances)."""
    by = {}
    for i, j in pairs:
        by.setdefault(int(owner[j]), []).append((i, j))
    out = {}
    for v, ps in by.items():
        i, j = ps[0]
        start = a_words[i][1] - min(0.3 * (j - first_word[v]), 1.0)
        out[v] = (start, max(a_words[i][2] for i, _ in ps), len(ps))
    return out


def unmatched_runs(a_words, pairs, min_len=6):
    matched = {i for i, _ in pairs}
    runs, run = [], []
    for i in range(len(a_words)):
        if i in matched:
            if len(run) >= min_len:
                runs.append((a_words[run[0]][1], a_words[run[-1]][2], len(run)))
            run = []
        else:
            run.append(i)
    if len(run) >= min_len:
        runs.append((a_words[run[0]][1], a_words[run[-1]][2], len(run)))
    return runs


def interpolate(starts, duration):
    xs = list(starts)
    for k, x in enumerate(xs):
        if x is None:
            lo = next((xs[p] for p in range(k - 1, -1, -1) if xs[p] is not None), 0.0)
            hi = next((xs[q] for q in range(k + 1, len(xs)) if xs[q] is not None), duration)
            xs[k] = lo + (hi - lo) / 2
    return xs


def refine(env, starts, duration, chapter_first=True):
    """Pose chaque début de vers au moment le plus silencieux autour de l'estimation (les horaires de mots
    sont fiables à ±0,5 s). Fenêtre retenue après essai de quatre largeurs : 1,5 s avant, 0,5 s après."""
    out = []
    for k, t in enumerate(starts):
        lo = 0.0 if (k == 0 and chapter_first) else max(0.0, t - 1.5)
        out.append(round(valley(env, lo, min(duration, t + 0.5), near=max(0.0, t - 0.1)), 2))
    return out


# --------------------------------------------------------------------------------------------- mode whole
def align_whole(tr, verses, audio_path, chunk=250):
    a = asr_words(tr)
    t_words, owner = text_words(verses)
    first_word = {v: int(np.argmax(owner == v)) for v in range(len(verses))}
    est, cursor, i0 = {}, 0, 0
    runs = []
    while cursor < len(t_words) and i0 < len(a):
        end = min(len(a), i0 + chunk)
        final = end == len(a)
        window = min(len(t_words) - cursor, int((end - i0) * 1.6) + 60)
        pairs, _ = align(a[i0:end], t_words[cursor : cursor + window])
        pairs = [(i0 + i, cursor + j) for i, j in pairs]
        if not pairs:
            i0 = len(a) if final else end - chunk // 2
            continue
        runs += unmatched_runs(a[i0:end], [(i - i0, j) for i, j in pairs])
        e = verse_estimates(pairs, a, owner, first_word)
        vs = sorted(e)
        if not final and len(vs) > 1:
            last = vs[-1]  # le dernier vers peut être coupé par la fin du morceau : il sera réaligné au suivant
            for v in vs[:-1]:
                est[v] = e[v]
            cursor = first_word[last]
            i0 = min(i for i, j in pairs if int(owner[j]) == last)
        else:
            for v in vs:
                est[v] = e[v]
            nxt = vs[-1] + 1
            cursor = first_word[nxt] if nxt < len(verses) else len(t_words)
            i0 = end
    duration = tr["duration"]
    starts = interpolate([est[v][0] if v in est else None for v in range(len(verses))], duration)
    env = envelope(load_audio(audio_path))
    refined = refine(env, starts, duration, chapter_first=False)
    out = []
    for v in range(len(verses)):
        e = est.get(v)
        out.append({"verse": v + 1, "start": refined[v], "last_word_end": round(e[1], 2) if e else None,
                    "matched": e[2] if e else 0, "words": int((owner == v).sum())})
    return {"verses": out, "unmatched_runs": [(round(a_, 1), round(b_, 1), n) for a_, b_, n in runs], "duration": duration}


# ------------------------------------------------------------------------------------------ mode chapters
def align_chapter(a_words, verses, t_words, owner, cursor):
    window = min(len(t_words) - cursor, int(len(a_words) * 1.6) + 40)
    pairs, _ = align(a_words, t_words[cursor : cursor + window])
    pairs = [(i, cursor + j) for i, j in pairs]
    first_word = {v: int(np.argmax(owner == v)) for v in range(len(verses))}
    est = verse_estimates(pairs, a_words, owner, first_word)
    if not est:
        return [], cursor, []
    vs = list(range(min(est), max(est) + 1))
    nwords = {v: int((owner == v).sum()) for v in vs}
    if est[vs[-1]][2] < 0.5 * nwords[vs[-1]]:
        vs = vs[:-1]  # dernier vers trop peu présent : il appartient au chapitre suivant
    out = [{"verse": v, "start": est[v][0] if v in est else None, "matched": est[v][2] if v in est else 0, "words": nwords[v]} for v in vs]
    nxt = vs[-1] + 1
    return out, (first_word[nxt] if nxt < len(verses) else len(t_words)), unmatched_runs(a_words, pairs)


def run_chapters(args):
    verses = json.load(open(args.texts, encoding="utf-8"))[args.corpus]
    t_words, owner = text_words(verses)
    files = sorted(glob.glob(f"{args.transcripts}/{args.prefix}-*.json"))
    last_num = max(int(os.path.basename(f)[:-5].split("-")[1]) for f in files)
    cursor, result = 0, {}
    for f in files:
        name = os.path.basename(f)[:-5]
        num = int(name.split("-")[1])
        tr = json.load(open(f))
        a = asr_words(tr)
        entries, cursor, runs = align_chapter(a, verses, t_words, owner, cursor)
        if not entries:
            print(f"ch{num:>2} {name}: aucun vers aligné")
            result[num] = []
            continue
        env = envelope(load_audio(f"{args.audio}/{name}.mp3"))
        rel = refine(env, interpolate([e["start"] for e in entries], tr["duration"]), tr["duration"])
        ratio = sum(e["matched"] for e in entries) / max(1, sum(e["words"] for e in entries))
        notes = [f"faible correspondance {ratio:.2f}"] if ratio < 0.7 else []
        if runs:
            notes.append("mots non reconnus " + ", ".join(f"{x:.0f}-{y:.0f}s({n})" for x, y, n in runs))
        result[num] = [{"verse": e["verse"] + 1, "start": s, "matched": e["matched"], "words": e["words"]} for e, s in zip(entries, rel)]
        # vers récités en fin de dernier chapitre mais absents du texte : ajoutés sans texte (2 segments = 1 vers)
        tail = [r for r in runs if r[1] >= tr["duration"] - 8 and r[2] >= 6]
        if tail and num == last_num:
            segs = [s for s in tr["segments"] if s["start"] >= tail[0][0] - 0.2]
            if len(segs) % 2 == 0:
                ex = refine(env, [segs[k]["start"] for k in range(0, len(segs), 2)], tr["duration"], chapter_first=False)
                nxt = entries[-1]["verse"] + 2
                result[num] += [{"verse": nxt + k, "start": s, "matched": 0, "words": 0, "extra": True} for k, s in enumerate(ex)]
                notes.append(f"+{len(ex)} vers sans texte")
            else:
                notes.append("fin du dernier chapitre : nombre impair de segments, vers ajoutés non créés")
        print(f"ch{num:>2} {name:<30} vers {entries[0]['verse'] + 1:>4}-{entries[-1]['verse'] + 1:<4} corr={ratio:.2f} {' | '.join(notes)}")
    json.dump(result, open(args.out, "w"), ensure_ascii=False)
    print("vers couverts :", sum(len(v) for v in result.values()), "/", len(verses))


def run_whole(args):
    verses = json.load(open(args.texts, encoding="utf-8"))[args.corpus]
    tr = json.load(open(args.transcript))
    res = align_whole(tr, verses, args.audio)
    json.dump(res, open(args.out, "w"), ensure_ascii=False)
    ok = sum(1 for v in res["verses"] if v["matched"] >= 0.5 * v["words"])
    print(f"{len(res['verses'])} vers, {ok} bien alignés ; mots non reconnus (≥6) : {res['unmatched_runs'][:10]}")


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="mode", required=True)
    w = sub.add_parser("whole")
    w.add_argument("--texts", required=True); w.add_argument("--corpus", required=True)
    w.add_argument("--transcript", required=True); w.add_argument("--audio", required=True); w.add_argument("--out", required=True)
    c = sub.add_parser("chapters")
    c.add_argument("--texts", required=True); c.add_argument("--corpus", required=True)
    c.add_argument("--transcripts", required=True); c.add_argument("--prefix", required=True)
    c.add_argument("--audio", required=True); c.add_argument("--out", required=True)
    args = p.parse_args()
    run_whole(args) if args.mode == "whole" else run_chapters(args)
