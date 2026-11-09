import { hostedAudio } from "./audioHost";
import type { Chapter } from "./chapters";

// Chapitres de la Tuḥfat al-aṭfāl, découpés d'après la récitation (audio hébergé dans la release audio-v1).
export const TUHFA_CHAPTERS: Chapter[] = [
  { n: 1, ar: "المقدمة", fr: "Introduction", dur: 35, ...hostedAudio("tuhfa-01.mp3") },
  { n: 2, ar: "أحكام النون الساكنة والتنوين", fr: "Règles du nūn sākin et du tanwīn", dur: 85, ...hostedAudio("tuhfa-02.mp3") },
  { n: 3, ar: "أحكام الميم والنون المشددتين", fr: "Règles du mīm et du nūn chaddés", dur: 13, ...hostedAudio("tuhfa-03.mp3") },
  { n: 4, ar: "أحكام الميم الساكنة", fr: "Règles du mīm sākin", dur: 46, ...hostedAudio("tuhfa-04.mp3") },
  { n: 5, ar: "أحكام لام التعريف", fr: "Règles du lām de l’article", dur: 49, ...hostedAudio("tuhfa-05.mp3") },
  { n: 6, ar: "المثلان والمتقاربان والمتجانسان", fr: "Les mithlān, mutaqāribān et mutajānisān", dur: 43, ...hostedAudio("tuhfa-06.mp3") },
  { n: 7, ar: "المد الأصلي والفرعي", fr: "Le madd naturel et le madd secondaire", dur: 54, ...hostedAudio("tuhfa-07.mp3") },
  { n: 8, ar: "أحكام المد", fr: "Les règles du madd", dur: 48, ...hostedAudio("tuhfa-08.mp3") },
  { n: 9, ar: "أقسام المد اللازم", fr: "Les types du madd lāzim", dur: 73, ...hostedAudio("tuhfa-09.mp3") },
  { n: 10, ar: "الخاتمة", fr: "Conclusion", dur: 29, ...hostedAudio("tuhfa-10.mp3") },
];
