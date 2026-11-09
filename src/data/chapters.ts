import { hostedAudio } from "./audioHost";

export type Chapter = {
  n: number;
  ar: string;
  fr: string;
  dur: number;
  // `require()` d'un fichier embarqué (number) ou URL à télécharger (string, voir cacheName).
  source: number | string;
  cacheName?: string;
};

// Regroupement de chapitres sélectionnable d'un geste (par exemple un juz).
export type ChapterGroup = {
  id: string;
  label: string;
  chapters: number[];
};

export const ASHIR_CHAPTERS: Chapter[] = [
  { n: 1, ar: "المقدمة", fr: "Introduction et basmala", dur: 55, ...hostedAudio("ashir-01-introduction.mp3") },
  { n: 2, ar: "الأحكام العقلية", fr: "Les jugements de la raison", dur: 58, ...hostedAudio("ashir-02-raison.mp3") },
  { n: 3, ar: "العقيدة", fr: "La croyance : attributs de Dieu", dur: 189, ...hostedAudio("ashir-03-croyance.mp3") },
  { n: 4, ar: "الإسلام والإحسان", fr: "Islam, foi et ihsan", dur: 51, ...hostedAudio("ashir-04-islam-ihsan.mp3") },
  { n: 5, ar: "مقدمة في الفقه", fr: "Introduction au fiqh", dur: 43, ...hostedAudio("ashir-05-introduction-fiqh.mp3") },
  { n: 6, ar: "الطهارة", fr: "La purification : l’eau", dur: 21, ...hostedAudio("ashir-06-tahara.mp3") },
  { n: 7, ar: "فرائض الوضوء", fr: "Les obligations du wuḍūʾ", dur: 32, ...hostedAudio("ashir-07-fard-wudu.mp3") },
  { n: 8, ar: "سنن الوضوء وفضائله", fr: "Les sunan et vertus du wuḍūʾ", dur: 64, ...hostedAudio("ashir-08-sunan-wudu.mp3") },
  { n: 9, ar: "نواقض الوضوء", fr: "Ce qui annule le wuḍūʾ", dur: 39, ...hostedAudio("ashir-09-nawaqid-wudu.mp3") },
  { n: 10, ar: "الغسل", fr: "Le grand lavage (ghusl)", dur: 71, ...hostedAudio("ashir-10-ghusl.mp3") },
  { n: 11, ar: "التيمم", fr: "Tayammum", dur: 63, ...hostedAudio("ashir-11-tayammum.mp3") },
  { n: 12, ar: "الصلاة: الفرائض والسنن", fr: "Prière : conditions, piliers, sunan", dur: 245, ...hostedAudio("ashir-12-priere-conditions.mp3") },
  { n: 13, ar: "الصلوات الخمس", fr: "Les cinq prières et l’imam", dur: 115, ...hostedAudio("ashir-13-priere-cinq.mp3") },
  { n: 14, ar: "الجمعة", fr: "La prière du vendredi", dur: 142, ...hostedAudio("ashir-14-vendredi.mp3") },
  { n: 15, ar: "الزكاة", fr: "La zakat", dur: 182, ...hostedAudio("ashir-15-zakat.mp3") },
  { n: 16, ar: "الصيام", fr: "Le jeûne", dur: 112, ...hostedAudio("ashir-16-jeune.mp3") },
  { n: 17, ar: "الحج", fr: "Le pèlerinage (ḥajj)", dur: 314, ...hostedAudio("ashir-17-hajj.mp3") },
  { n: 18, ar: "العمرة والزيارة", fr: "La ʿumra et la visite du Prophète ﷺ", dur: 54, ...hostedAudio("ashir-18-omra.mp3") },
  { n: 19, ar: "مبادئ التصوف", fr: "Purification de l’âme (tasawwuf)", dur: 180, ...hostedAudio("ashir-19-tasawwuf.mp3") },
];

export const totalDuration = (chapters: Chapter[]) => chapters.reduce((s, c) => s + c.dur, 0);

export function fmt(s: number): string {
  s = Math.round(s);
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

export function est(s: number): string {
  if (s < 60) return "≈ " + Math.round(s) + " s";
  const m = Math.round(s / 60);
  if (m < 60) return "≈ " + m + " min";
  return "≈ " + Math.floor(m / 60) + " h " + String(m % 60).padStart(2, "0");
}
