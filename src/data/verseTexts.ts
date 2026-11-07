import { TEXTS as BAYQUNIYYA } from "./verseTexts/bayquniyya";
import { TEXTS as IBN_ABI_KAFF } from "./verseTexts/ibn-abi-kaff";
import { TEXTS as IBN_ASHIR } from "./verseTexts/ibn-ashir";
import { TEXTS as TUHFA } from "./verseTexts/tuhfa";

// Texte des vers, par texte puis par numéro de chapitre : un vers = [premier hémistiche, second hémistiche].
// Un texte ou un chapitre absent s'affiche sans texte : seulement le numéro et la durée de chaque vers.
export const VERSE_TEXTS: Record<string, Record<number, [string, string][]>> = {
  bayquniyya: BAYQUNIYYA,
  "ibn-abi-kaff": IBN_ABI_KAFF,
  "ibn-ashir": IBN_ASHIR,
  tuhfa: TUHFA,
};

export const verseText = (corpusId: string, chapter: number): [string, string][] | undefined =>
  VERSE_TEXTS[corpusId]?.[chapter];
