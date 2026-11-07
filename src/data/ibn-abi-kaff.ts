import { hostedAudio } from "./audioHost";
import type { Chapter } from "./chapters";

// Chapitres : Naẓm Ibn Abī Kaff : 30 vers (texte vocalisé du PDF fourni, lu visuellement).
export const IBN_ABI_KAFF_CHAPTERS: Chapter[] = [
  { n: 1, ar: "المقدمة", fr: "Introduction", dur: 40, ...hostedAudio("ibn-abi-kaff-01.mp3") },
  { n: 2, ar: "أدلة المذهب الستة عشر", fr: "Les seize preuves du rite", dur: 103, ...hostedAudio("ibn-abi-kaff-02.mp3") },
  { n: 3, ar: "القواعد الفقهية الخمس والخاتمة", fr: "Les cinq règles juridiques et la conclusion", dur: 51, ...hostedAudio("ibn-abi-kaff-03.mp3") },
];
