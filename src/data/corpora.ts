import { ALFIYYA_CHAPTERS } from "./alfiyya";
import { ASHIR_CHAPTERS, Chapter, ChapterGroup } from "./chapters";
import { MUSHAF_CHAPTERS, MUSHAF_GROUPS } from "./mushaf";

export type Corpus = {
  id: string;
  ar: string;
  fr: string;
  kicker: string;
  artist: string;
  description: string;
  chapters: Chapter[];
  groups?: ChapterGroup[];
  groupsNote?: string;
  // Poids total des fichiers à télécharger, affiché avant « Tout télécharger ».
  downloadSize?: string;
  unit?: string;
};

export const CORPORA: Corpus[] = [
  {
    id: "ibn-ashir",
    ar: "المرشد المعين",
    fr: "Matn Ibn ʿĀshir",
    kicker: "FIQH MALIKITE ET CROYANCE",
    artist: "Matn Ibn ʿĀshir",
    description: "Croyance, purification, prière, zakat, jeûne et pèlerinage",
    chapters: ASHIR_CHAPTERS,
    downloadSize: "≈ 16 Mo",
  },
  {
    id: "alfiyya",
    ar: "ألفية ابن مالك",
    fr: "Alfiyya d’Ibn Mālik",
    kicker: "GRAMMAIRE ARABE",
    artist: "Alfiyya d’Ibn Mālik",
    description: "La synthèse de la grammaire arabe en mille vers",
    chapters: ALFIYYA_CHAPTERS,
    downloadSize: "≈ 60 Mo",
  },
  {
    id: "mushaf-hadr",
    ar: "القرآن الكريم",
    fr: "Coran · Ahmed Diban (Hafs, Hadr)",
    kicker: "RÉCITATION RAPIDE · 114 SOURATES",
    artist: "Ahmed Diban · Hafs ʿan ʿĀṣim (Hadr)",
    description: "Chaque sourate se télécharge au premier usage (source : way2quran.com), puis reste disponible hors ligne",
    chapters: MUSHAF_CHAPTERS,
    groups: MUSHAF_GROUPS,
    downloadSize: "≈ 226 Mo",
    unit: "sourates",
    groupsNote: "L’audio est découpé par sourate : un juz inclut les sourates qu’il touche, lues en entier.",
  },
];
