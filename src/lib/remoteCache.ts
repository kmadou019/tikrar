import { Directory, File, Paths } from "expo-file-system";
import type { Chapter } from "../data/chapters";

const dir = new Directory(Paths.document, "remote-audio");
const inFlight = new Map<string, Promise<string>>();

export const isRemote = (c: Chapter): c is Chapter & { source: string; cacheName: string } =>
  typeof c.source === "string" && !!c.cacheName;

const fileOf = (c: Chapter) => new File(dir, c.cacheName as string);

export function isCached(c: Chapter): boolean {
  if (!isRemote(c)) return false;
  const f = fileOf(c);
  return f.exists && f.size > 0;
}

// Renvoie l'URI locale du fichier, en le téléchargeant s'il n'est pas déjà sur le téléphone.
export function ensureLocal(c: Chapter & { source: string; cacheName: string }): Promise<string> {
  if (isCached(c)) return Promise.resolve(fileOf(c).uri);
  const running = inFlight.get(c.cacheName);
  if (running) return running;
  const job = (async () => {
    if (!dir.exists) dir.create({ idempotent: true });
    const f = await File.downloadFileAsync(c.source, fileOf(c), { idempotent: true });
    return f.uri;
  })().finally(() => inFlight.delete(c.cacheName));
  inFlight.set(c.cacheName, job);
  return job;
}

export function removeCached(c: Chapter): void {
  if (!isRemote(c)) return;
  const f = fileOf(c);
  if (f.exists) f.delete();
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
}
