import { useCallback, useRef, useState } from "react";
import type { Chapter } from "../data/chapters";
import { ensureLocal, isCached, isRemote, removeCached } from "../lib/remoteCache";

const PARALLEL_DOWNLOADS = 3;
const MAX_FAILURES = 3;

export type BulkState = { done: number; total: number };

// Suit l'état de téléchargement des chapitres distants (vide pour les textes embarqués).
export function useRemoteCache(chapters: Chapter[]) {
  // L'écran est recréé pour chaque texte : l'état initial lit donc directement le disque.
  const [cached, setCached] = useState<Set<number>>(() => new Set(chapters.filter(isCached).map((c) => c.n)));
  const [downloading, setDownloading] = useState<Set<number>>(new Set());
  const [bulk, setBulk] = useState<BulkState | null>(null);
  const cancelled = useRef(false);

  const resolve = useCallback(
    async (n: number): Promise<string | number> => {
      const c = chapters[n - 1];
      if (!isRemote(c)) return c.source;
      if (isCached(c)) return ensureLocal(c);
      setDownloading((s) => new Set(s).add(n));
      try {
        const uri = await ensureLocal(c);
        setCached((s) => new Set(s).add(n));
        return uri;
      } finally {
        setDownloading((s) => {
          const next = new Set(s);
          next.delete(n);
          return next;
        });
      }
    },
    [chapters],
  );

  // Télécharge à l'avance le chapitre suivant, sans bloquer ni signaler d'erreur.
  const prefetch = useCallback(
    (n: number) => {
      const c = chapters[n - 1];
      if (c && isRemote(c) && !isCached(c)) resolve(n).catch(() => {});
    },
    [chapters, resolve],
  );

  // Télécharge d'un coup tous les chapitres manquants ; s'arrête après quelques échecs (réseau coupé).
  // Renvoie le nombre d'échecs.
  const downloadAll = useCallback(async (): Promise<number> => {
    const todo = chapters.filter((c) => isRemote(c) && !isCached(c));
    if (!todo.length) return 0;
    cancelled.current = false;
    let next = 0;
    let done = 0;
    let failed = 0;
    setBulk({ done, total: todo.length });
    const worker = async () => {
      while (!cancelled.current && next < todo.length) {
        const c = todo[next++];
        try {
          await resolve(c.n);
          done++;
          setBulk({ done, total: todo.length });
        } catch {
          if (++failed >= MAX_FAILURES) cancelled.current = true;
        }
      }
    };
    await Promise.all(Array.from({ length: PARALLEL_DOWNLOADS }, worker));
    setBulk(null);
    return failed;
  }, [chapters, resolve]);

  const cancelDownloadAll = useCallback(() => {
    cancelled.current = true;
  }, []);

  const removeAll = useCallback(() => {
    chapters.forEach(removeCached);
    setCached(new Set());
  }, [chapters]);

  return { cached, downloading, bulk, resolve, prefetch, downloadAll, cancelDownloadAll, removeAll };
}
