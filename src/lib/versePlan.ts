// Calcul de la lecture par vers, sans dépendance audio : plan de boucles, position courante, etc.
// Toutes les durées sont en secondes de *média* (indépendantes de la vitesse de lecture).

export type PlanMode = "plage" | "chaque";

// Un bloc répété `loops` fois : l'intervalle [a, b[ du fichier, qui couvre les vers first..last.
export type Item = { a: number; b: number; loops: number; first: number; last: number };

// Où l'on en est : bloc `item`, passage `loop` (0 = premier), `off` secondes déjà jouées dans ce passage.
export type Cursor = { item: number; loop: number; off: number };

export type Position = {
  done: boolean;
  cursor: Cursor;
  verse: number; // vers en cours (numéroté à partir de 1)
  count: number; // tour (mode plage) ou répétition du vers (mode chaque), à partir de 1
  pass: number; // fraction du passage en cours, de 0 à 1
};

// Le vers n occupe [starts[n-1], starts[n][ ; le dernier va jusqu'à la fin du chapitre.
export function verseTimes(starts: number[], end: number, n: number): [number, number] {
  return [starts[n - 1], n < starts.length ? starts[n] : end];
}

export function buildItems(starts: number[], end: number, lo: number, hi: number, mode: PlanMode, reps: number): Item[] {
  if (mode === "plage") {
    return [{ a: verseTimes(starts, end, lo)[0], b: verseTimes(starts, end, hi)[1], loops: reps, first: lo, last: hi }];
  }
  const items: Item[] = [];
  for (let v = lo; v <= hi; v++) {
    const [a, b] = verseTimes(starts, end, v);
    items.push({ a, b, loops: reps, first: v, last: v });
  }
  return items;
}

const len = (it: Item) => it.b - it.a;

// Durée de média restant à jouer depuis `from` (ou depuis le début si absent).
export function remainingMedia(items: Item[], from: Cursor = { item: 0, loop: 0, off: 0 }): number {
  let total = 0;
  for (let i = from.item; i < items.length; i++) {
    const it = items[i];
    const loops = i === from.item ? it.loops - from.loop : it.loops;
    total += loops * len(it) - (i === from.item ? from.off : 0);
  }
  return total;
}

// Durée totale d'une lecture complète, pour l'estimation affichée.
export const totalMedia = (items: Item[]) => remainingMedia(items);

// Position atteinte `m` secondes de média après avoir démarré à `from`.
export function locate(items: Item[], starts: number[], from: Cursor, m: number): Position {
  let { item, loop, off } = from;
  let remaining = m;
  for (;;) {
    const it = items[item];
    const left = len(it) - off;
    if (remaining < left) {
      off += remaining;
      break;
    }
    remaining -= left;
    off = 0;
    loop++;
    if (loop >= it.loops) {
      item++;
      loop = 0;
      if (item >= items.length) {
        const last = items[items.length - 1];
        return { done: true, cursor: { item: items.length - 1, loop: last.loops - 1, off: len(last) }, verse: last.last, count: last.loops, pass: 1 };
      }
    }
  }
  const it = items[item];
  const abs = it.a + off;
  let verse = it.first;
  for (let v = it.first; v <= it.last; v++) if (starts[v - 1] <= abs + 1e-6) verse = v;
  return { done: false, cursor: { item, loop, off }, verse, count: loop + 1, pass: off / len(it) };
}

// Curseur pour sauter directement au vers `verse` en gardant le compteur `count`.
export function cursorForVerse(items: Item[], starts: number[], verse: number, count: number): Cursor {
  if (items.length === 1) {
    const it = items[0];
    return { item: 0, loop: Math.min(count, it.loops) - 1, off: Math.max(0, starts[verse - 1] - it.a) };
  }
  const idx = Math.max(0, Math.min(items.length - 1, verse - items[0].first));
  return { item: idx, loop: Math.min(count, items[idx].loops) - 1, off: 0 };
}

// Vers suivant ou précédent dans la plage, en bouclant aux extrémités.
export const stepVerse = (verse: number, lo: number, hi: number, step: 1 | -1) =>
  step === 1 ? (verse < hi ? verse + 1 : lo) : verse > lo ? verse - 1 : hi;
