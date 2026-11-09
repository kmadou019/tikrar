import { useCallback, useMemo } from "react";
import type { Chapter } from "../data/chapters";
import { ensureLocal, isCached, isRemote, useDownloadState } from "../lib/remoteCache";

// État des téléchargements des chapitres d'un texte (vide pour un texte embarqué), et accès à leur fichier.
export function useRemoteCache(chapters: Chapter[]) {
  const state = useDownloadState();

  const cached = useMemo(
    () => new Set(chapters.filter((c) => isRemote(c) && state.cached.has(c.cacheName)).map((c) => c.n)),
    [chapters, state.cached],
  );
  const downloading = useMemo(
    () => new Set(chapters.filter((c) => isRemote(c) && state.downloading.has(c.cacheName)).map((c) => c.n)),
    [chapters, state.downloading],
  );

  // Source à jouer : le fichier local, téléchargé d'abord si besoin.
  const resolve = useCallback(
    async (n: number): Promise<string | number> => {
      const c = chapters[n - 1];
      return isRemote(c) ? ensureLocal(c) : c.source;
    },
    [chapters],
  );

  // Télécharge à l'avance le chapitre suivant, sans bloquer ni signaler d'erreur.
  const prefetch = useCallback(
    (n: number) => {
      const c = chapters[n - 1];
      if (c && isRemote(c) && !isCached(c)) ensureLocal(c).catch(() => {});
    },
    [chapters],
  );

  return { cached, downloading, resolve, prefetch };
}
