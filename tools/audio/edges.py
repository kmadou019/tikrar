"""Frontières de chapitres posées dans des silences.

Les horaires de mots d'une transcription sont fiables à ±0,5 s seulement : couper à ces horaires peut tomber au milieu
d'un mot (le dernier mot d'un chapitre se retrouve alors au début du suivant). `quiet_after` cherche le premier vrai
silence à partir de l'horaire estimé.
"""
import numpy as np

from common import FRAME, SR


def levels(env):
    voiced = float(np.percentile(env, 85))
    floor = float(np.percentile(env, 5))
    return floor + 0.35 * (voiced - floor)  # seuil de « silence » : un tiers de l'écart entre le bruit de fond et la voix


def quiet_after(env, t, back=0.15, span=1.3, min_run=6):
    """Milieu du premier silence (au moins 60 ms sous le seuil) à partir de t-back, jusqu'à t+span.

    « Premier » est important : la pause suivante peut être celle d'un autre vers, dans le chapitre voisin. Si l'horaire
    estimé tombe dans un mot, le premier silence est la fin de ce mot. À défaut de silence : le point le plus calme
    de [t-0.3, t+0.8].
    """
    thr = levels(env)
    a = max(0, int((t - back) * SR / FRAME))
    b = min(len(env) - 1, int((t + span) * SR / FRAME))
    run_start = None
    for i in range(a, b + 1):
        if env[i] < thr:
            if run_start is None:
                run_start = i
            if i - run_start + 1 >= min_run:
                j = i
                while j + 1 < len(env) and j + 1 <= b + 30 and env[j + 1] < thr:
                    j += 1
                return (run_start + j) / 2 * FRAME / SR + 0.005
        else:
            run_start = None
    a2, b2 = max(0, int((t - 0.3) * SR / FRAME)), min(len(env) - 1, int((t + 0.8) * SR / FRAME))
    return (a2 + int(np.argmin(env[a2 : b2 + 1]))) * FRAME / SR + 0.005

