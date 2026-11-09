import { useSyncExternalStore } from "react";
import { Directory, File, Paths } from "expo-file-system";
import type { Chapter } from "../data/chapters";

// Téléchargements : un état unique pour toute l'application (écrans des textes, des vers, des téléchargements).
// Les fichiers sont conservés dans le stockage de l'application (non effacés par le système).

const dir = new Directory(Paths.document, "remote-audio");
const PARALLEL_DOWNLOADS = 3;
const MAX_FAILURES = 3;

export type RemoteChapter = Chapter & { source: string; cacheName: string };

export type DownloadState = {
  cached: ReadonlySet<string>; // noms de fichiers présents sur le téléphone
  downloading: ReadonlySet<string>; // téléchargements en cours
  bulk: { done: number; total: number } | null; // téléchargement groupé en cours
};

export const isRemote = (c: Chapter): c is RemoteChapter => typeof c.source === "string" && !!c.cacheName;

function scan(): Set<string> {
  const out = new Set<string>();
  try {
    if (dir.exists) for (const e of dir.list()) if (e instanceof File && e.size > 0) out.add(e.name);
  } catch {
    // dossier illisible : on repart d'un cache vide
  }
  return out;
}

let state: DownloadState = { cached: scan(), downloading: new Set(), bulk: null };
const listeners = new Set<() => void>();

function emit(patch: Partial<DownloadState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getDownloadState = () => state;
export const useDownloadState = () => useSyncExternalStore(subscribe, getDownloadState);

const fileOf = (c: RemoteChapter) => new File(dir, c.cacheName);
export const isCached = (c: Chapter): boolean => isRemote(c) && state.cached.has(c.cacheName);

// Taille réelle d'un chapitre téléchargé, en octets (0 s'il n'est pas sur le téléphone).
export function cachedBytes(c: Chapter): number {
  if (!isRemote(c) || !state.cached.has(c.cacheName)) return 0;
  try {
    return fileOf(c).size ?? 0;
  } catch {
    return 0;
  }
}

const inFlight = new Map<string, Promise<string>>();

// Renvoie l'URI locale du fichier, en le téléchargeant s'il n'est pas déjà sur le téléphone.
export function ensureLocal(c: RemoteChapter): Promise<string> {
  if (state.cached.has(c.cacheName)) return Promise.resolve(fileOf(c).uri);
  const running = inFlight.get(c.cacheName);
  if (running) return running;
  emit({ downloading: new Set(state.downloading).add(c.cacheName) });
  const job = (async () => {
    if (!dir.exists) dir.create({ idempotent: true });
    const f = await File.downloadFileAsync(c.source, fileOf(c), { idempotent: true });
    emit({ cached: new Set(state.cached).add(c.cacheName) });
    return f.uri;
  })().finally(() => {
    const d = new Set(state.downloading);
    d.delete(c.cacheName);
    inFlight.delete(c.cacheName);
    emit({ downloading: d });
  });
  inFlight.set(c.cacheName, job);
  return job;
}

let cancelled = false;

// Télécharge d'un coup les chapitres demandés (3 à la fois) ; s'arrête après quelques échecs (réseau coupé).
// Renvoie le nombre d'échecs.
export async function downloadMany(chapters: Chapter[]): Promise<number> {
  const todo = chapters.filter((c): c is RemoteChapter => isRemote(c) && !state.cached.has(c.cacheName));
  if (!todo.length || state.bulk) return 0;
  cancelled = false;
  let next = 0;
  let done = 0;
  let failed = 0;
  emit({ bulk: { done, total: todo.length } });
  const worker = async () => {
    while (!cancelled && next < todo.length) {
      const c = todo[next++];
      try {
        await ensureLocal(c);
        emit({ bulk: { done: ++done, total: todo.length } });
      } catch {
        if (++failed >= MAX_FAILURES) cancelled = true;
      }
    }
  };
  await Promise.all(Array.from({ length: PARALLEL_DOWNLOADS }, worker));
  emit({ bulk: null });
  return failed;
}

export const cancelDownloads = () => {
  cancelled = true;
};

export function removeChapters(chapters: Chapter[]): void {
  const next = new Set(state.cached);
  for (const c of chapters) {
    if (!isRemote(c)) continue;
    try {
      const f = fileOf(c);
      if (f.exists) f.delete();
    } catch {
      // fichier déjà absent ou verrouillé
    }
    next.delete(c.cacheName);
  }
  emit({ cached: next });
}

// Supprime les fichiers du cache qui ne correspondent plus à aucun chapitre (anciennes révisions d'un audio).
export function purgeStaleCache(validNames: Set<string>): void {
  try {
    if (!dir.exists) return;
    for (const entry of dir.list()) {
      if (entry instanceof File && !validNames.has(entry.name)) entry.delete();
    }
  } catch {
    // nettoyage facultatif : une erreur ne doit jamais empêcher l'application de démarrer
  }
  emit({ cached: scan() });
}
