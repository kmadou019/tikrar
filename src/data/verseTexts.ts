// Texte des vers, par texte puis par numéro de chapitre : un vers = [premier hémistiche, second hémistiche].
// Vide pour l'instant : sans texte, l'écran des vers affiche seulement le numéro et la durée de chaque vers.
// Exemple :  "alfiyya": { 2: [["كلامنا لفظ مفيد كاستقم", "واسم وفعل ثم حرف الكلم"], …] }
export const VERSE_TEXTS: Record<string, Record<number, [string, string][]>> = {};

export const verseText = (corpusId: string, chapter: number): [string, string][] | undefined =>
  VERSE_TEXTS[corpusId]?.[chapter];
