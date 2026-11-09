import type { Chapter } from "./chapters";

// Release GitHub qui héberge les audios des textes (Ibn ʿĀshir, Alfiyya, Bayqūniyya, Tuḥfa, Īṣāl as-sālik, Ṭaḥāwiyya).
const AUDIO_BASE_URL = "https://github.com/kmadou019/tikrar/releases/download/audio-v1";

// À augmenter chaque fois que des fichiers de la release sont REMPLACÉS : le téléphone garde les chapitres téléchargés
// sous leur nom, et sans changement de révision il ne verrait pas la nouvelle version. Les anciennes copies sont
// supprimées au démarrage (voir purgeStaleCache).
// 2 : frontières de chapitres recalées sur des silences (le dernier mot d'un chapitre n'est plus coupé).
const AUDIO_REVISION = 2;

// Chapitre téléchargé au premier usage, puis conservé sur le téléphone sous `<nom>.r<révision>.mp3`.
export const hostedAudio = (fileName: string): Pick<Chapter, "source" | "cacheName"> => ({
  source: `${AUDIO_BASE_URL}/${fileName}`,
  cacheName: fileName.replace(/\.mp3$/, `.r${AUDIO_REVISION}.mp3`),
});
