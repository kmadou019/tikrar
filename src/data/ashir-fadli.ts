import { hostedAudio } from "./audioHost";
import type { Chapter } from "./chapters";

// Chapitres : Ibn ʿĀshir · Yūsuf al-Faḍlī al-Ḥasanī
export const ASHIR_FADLI_CHAPTERS: Chapter[] = [
  { n: 1, ar: "المقدمة", fr: "Introduction et basmala", dur: 37, ...hostedAudio("ashir-fadli-01.mp3") },
  { n: 2, ar: "الأحكام العقلية", fr: "Les jugements de la raison", dur: 66, ...hostedAudio("ashir-fadli-02.mp3") },
  { n: 3, ar: "العقيدة", fr: "La croyance : attributs de Dieu", dur: 210, ...hostedAudio("ashir-fadli-03.mp3") },
  { n: 4, ar: "الإسلام والإحسان", fr: "Islam, foi et ihsan", dur: 54, ...hostedAudio("ashir-fadli-04.mp3") },
  { n: 5, ar: "مقدمة في الفقه", fr: "Introduction au fiqh", dur: 52, ...hostedAudio("ashir-fadli-05.mp3") },
  { n: 6, ar: "الطهارة", fr: "La purification : l’eau", dur: 24, ...hostedAudio("ashir-fadli-06.mp3") },
  { n: 7, ar: "فرائض الوضوء", fr: "Les obligations du wuḍūʾ", dur: 36, ...hostedAudio("ashir-fadli-07.mp3") },
  { n: 8, ar: "سنن الوضوء وفضائله", fr: "Les sunan et vertus du wuḍūʾ", dur: 73, ...hostedAudio("ashir-fadli-08.mp3") },
  { n: 9, ar: "نواقض الوضوء", fr: "Ce qui annule le wuḍūʾ", dur: 44, ...hostedAudio("ashir-fadli-09.mp3") },
  { n: 10, ar: "الغسل", fr: "Le grand lavage (ghusl)", dur: 81, ...hostedAudio("ashir-fadli-10.mp3") },
  { n: 11, ar: "التيمم", fr: "Tayammum", dur: 75, ...hostedAudio("ashir-fadli-11.mp3") },
  { n: 12, ar: "الصلاة: الفرائض والسنن", fr: "Prière : conditions, piliers, sunan", dur: 284, ...hostedAudio("ashir-fadli-12.mp3") },
  { n: 13, ar: "الصلوات الخمس", fr: "Les cinq prières et l’imam", dur: 125, ...hostedAudio("ashir-fadli-13.mp3") },
  { n: 14, ar: "الجمعة", fr: "La prière du vendredi", dur: 166, ...hostedAudio("ashir-fadli-14.mp3") },
  { n: 15, ar: "الزكاة", fr: "La zakat", dur: 205, ...hostedAudio("ashir-fadli-15.mp3") },
  { n: 16, ar: "الصيام", fr: "Le jeûne", dur: 128, ...hostedAudio("ashir-fadli-16.mp3") },
  { n: 17, ar: "الحج", fr: "Le pèlerinage (ḥajj)", dur: 371, ...hostedAudio("ashir-fadli-17.mp3") },
  { n: 18, ar: "العمرة والزيارة", fr: "La ʿumra et la visite du Prophète ﷺ", dur: 65, ...hostedAudio("ashir-fadli-18.mp3") },
  { n: 19, ar: "مبادئ التصوف", fr: "Purification de l’âme (tasawwuf)", dur: 197, ...hostedAudio("ashir-fadli-19.mp3") },
];
