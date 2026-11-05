import type { Chapter } from "./chapters";

// Release GitHub qui héberge les audios d'Ibn Ashir et de l'Alfiyya.
const AUDIO_BASE_URL = "https://github.com/kmadou019/tikrar/releases/download/audio-v1";

// Chapitre téléchargé au premier usage, puis conservé sur le téléphone sous `fileName`.
export const hostedAudio = (fileName: string): Pick<Chapter, "source" | "cacheName"> => ({
  source: `${AUDIO_BASE_URL}/${fileName}`,
  cacheName: fileName,
});
