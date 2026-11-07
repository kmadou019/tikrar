import { ALFIYYA_CHAPTERS } from "./alfiyya";
import { BAYQUNIYYA_CHAPTERS } from "./bayquniyya";
import { IBN_ABI_KAFF_CHAPTERS } from "./ibn-abi-kaff";
import { TAHAWIYYA_CHAPTERS } from "./tahawiyya";
import { TUHFA_CHAPTERS } from "./tuhfa";
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
  // Avertissement affiché au-dessus des vers (par exemple sur la fiabilité du texte).
  textNote?: string;
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
    id: "bayquniyya",
    ar: "المنظومة البيقونية",
    fr: "Bayqūniyya (ʿUmar al-Bayqūnī)",
    kicker: "SCIENCE DU HADITH",
    artist: "Bayqūniyya · ʿAbd al-ʿAzīz aṣ-Ṣīnī",
    description: "34 vers sur les types de hadith : authentique, bon, faible et leurs variantes",
    chapters: BAYQUNIYYA_CHAPTERS,
    downloadSize: "≈ 1,6 Mo",
  },
  {
    id: "tuhfa",
    ar: "تحفة الأطفال",
    fr: "Tuḥfat al-aṭfāl (al-Jamzūrī)",
    kicker: "TAJWĪD",
    artist: "Tuḥfat al-aṭfāl · Badr at-Turkī",
    description: "61 vers sur les règles du tajwīd : nūn et mīm sākin, lām, madd",
    chapters: TUHFA_CHAPTERS,
    downloadSize: "≈ 3,7 Mo",
  },
  {
    id: "ibn-abi-kaff",
    ar: "إيصال السالك",
    fr: "Īṣāl as-sālik (naẓm d’Ibn Abī Kaff)",
    kicker: "FONDEMENTS DU DROIT MALIKITE",
    artist: "Īṣāl as-sālik · chaîne عبد الحفيظ جويلي المجبري",
    description: "30 vers sur les seize preuves du rite malikite et les cinq règles juridiques majeures",
    chapters: IBN_ABI_KAFF_CHAPTERS,
    downloadSize: "≈ 1,5 Mo",
  },
  {
    id: "tahawiyya",
    ar: "العقيدة الطحاوية",
    fr: "Al-ʿAqīda aṭ-Ṭaḥāwiyya (matn)",
    kicker: "CROYANCE (ʿAQĪDA)",
    artist: "Al-ʿAqīda aṭ-Ṭaḥāwiyya · Mishary Rashid Alafasy",
    description: "Le texte de la croyance de Ahl as-Sunna, en 30 chapitres à écouter un par un",
    chapters: TAHAWIYYA_CHAPTERS,
    downloadSize: "≈ 13 Mo",
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
