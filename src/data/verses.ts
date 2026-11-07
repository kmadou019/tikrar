import { STARTS as BAYQUNIYYA } from "./verses/bayquniyya";
import { STARTS as TUHFA } from "./verses/tuhfa";

// Début de chaque vers dans l'audio de son chapitre, en secondes depuis le début du fichier.
// Un vers va de son début jusqu'au début du suivant (le dernier, jusqu'à la fin du chapitre) :
// les pauses du récitant font donc partie du vers, et la lecture en boucle garde son rythme naturel.
// Chaque repère est posé au moment le plus silencieux de la pause qui précède le vers.
// Les fichiers de `verses/` sont générés à partir de la transcription de chaque chapitre.
const STARTS: Record<string, Record<number, number[]>> = {
  bayquniyya: BAYQUNIYYA,
  tuhfa: TUHFA,
};

export const verseStarts = (corpusId: string, chapter: number): number[] | undefined => STARTS[corpusId]?.[chapter];
