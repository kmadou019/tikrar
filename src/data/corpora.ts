import { ALFIYYA_CHAPTERS } from "./alfiyya";
import { BAYQUNIYYA_CHAPTERS } from "./bayquniyya";
import { IBN_ABI_KAFF_CHAPTERS } from "./ibn-abi-kaff";
import { TAHAWIYYA_CHAPTERS } from "./tahawiyya";
import { TUHFA_CHAPTERS } from "./tuhfa";
import { ASHIR_FADLI_CHAPTERS } from "./ashir-fadli";
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
  // Octets par seconde d'audio, pour estimer le poids avant téléchargement (mp3 mono 64 kb/s par défaut).
  bytesPerSecond?: number;
  // Avertissement affiché au-dessus des vers (par exemple sur la fiabilité du texte).
  textNote?: string;
  // Récitant de cet enregistrement. Un même texte peut avoir plusieurs enregistrements : chacun est un `Corpus`
  // (ses chapitres, ses repères de vers, ses téléchargements) ; les variantes pointent vers le texte de base par `variantOf`
  // et n'apparaissent pas sur l'accueil : on les choisit depuis l'écran du texte.
  reciter?: string;
  variantOf?: string;
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
    reciter: "Enregistrement d’origine",
  },
  {
    id: "ibn-ashir-fadli",
    variantOf: "ibn-ashir",
    reciter: "Yūsuf al-Faḍlī al-Ḥasanī",
    ar: "المرشد المعين",
    fr: "Matn Ibn ʿĀshir",
    kicker: "FIQH MALIKITE ET CROYANCE",
    artist: "Matn Ibn ʿĀshir · Yūsuf al-Faḍlī al-Ḥasanī (chaîne Al Manhal)",
    description: "Croyance, purification, prière, zakat, jeûne et pèlerinage",
    chapters: ASHIR_FADLI_CHAPTERS,
    downloadSize: "≈ 18 Mo",
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
    bytesPerSecond: 8900,
    groupsNote: "L’audio est découpé par sourate : un juz inclut les sourates qu’il touche, lues en entier.",
  },
];

// Les enregistrements d'un même texte (le texte de base d'abord), dans l'ordre de CORPORA.
export const recitationsOf = (c: Corpus): Corpus[] => {
  const base = c.variantOf ?? c.id;
  return CORPORA.filter((x) => (x.variantOf ?? x.id) === base);
};

// Nom affiché : le texte, suivi du récitant lorsque le texte en a plusieurs.
export const displayName = (c: Corpus): string => (recitationsOf(c).length > 1 && c.reciter ? `${c.fr} · ${c.reciter}` : c.fr);
