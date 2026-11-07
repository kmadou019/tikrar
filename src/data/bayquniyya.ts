import { hostedAudio } from "./audioHost";
import type { Chapter } from "./chapters";

// Chapitres de la Bayqūniyya, découpés d'après la récitation (audio hébergé dans la release audio-v1).
export const BAYQUNIYYA_CHAPTERS: Chapter[] = [
  { n: 1, ar: "مقدمة وأقسام الحديث", fr: "Introduction et divisions du hadith", dur: 12, ...hostedAudio("bayquniyya-01.mp3") },
  { n: 2, ar: "الصحيح والحسن والضعيف", fr: "Le ṣaḥīḥ, le ḥasan et le ḍaʿīf", dur: 24, ...hostedAudio("bayquniyya-02.mp3") },
  { n: 3, ar: "المرفوع والمقطوع والمسند والمتصل", fr: "Le marfūʿ, le maqṭūʿ, le musnad et le muttaṣil", dur: 18, ...hostedAudio("bayquniyya-03.mp3") },
  { n: 4, ar: "المسلسل والعزيز والمشهور", fr: "Le musalsal, l’ʿazīz et le mashhūr", dur: 18, ...hostedAudio("bayquniyya-04.mp3") },
  { n: 5, ar: "المعنعن والمبهم والعالي والنازل", fr: "Le muʿanʿan, le mubham, le ʿālī et le nāzil", dur: 11, ...hostedAudio("bayquniyya-05.mp3") },
  { n: 6, ar: "الموقوف والمرسل والغريب والمنقطع", fr: "Le mawqūf, le mursal, le gharīb et le munqaṭiʿ", dur: 18, ...hostedAudio("bayquniyya-06.mp3") },
  { n: 7, ar: "المعضل والمدلس", fr: "Le muʿḍal et le mudallas", dur: 18, ...hostedAudio("bayquniyya-07.mp3") },
  { n: 8, ar: "الشاذ والمقلوب والفرد والمعلل", fr: "Le shādhdh, le maqlūb, le fard et le muʿall", dur: 24, ...hostedAudio("bayquniyya-08.mp3") },
  { n: 9, ar: "المضطرب والمدرج والمدبج", fr: "Le muḍṭarib, le mudraj et le mudabbaj", dur: 18, ...hostedAudio("bayquniyya-09.mp3") },
  { n: 10, ar: "المتفق والمفترق والمؤتلف والمختلف", fr: "Le muttafiq, le muftariq, le muʾtalif et le mukhtalif", dur: 12, ...hostedAudio("bayquniyya-10.mp3") },
  { n: 11, ar: "المنكر والمتروك والموضوع", fr: "Le munkar, le matrūk et le mawḍūʿ", dur: 18, ...hostedAudio("bayquniyya-11.mp3") },
  { n: 12, ar: "الخاتمة", fr: "Conclusion", dur: 13, ...hostedAudio("bayquniyya-12.mp3") },
];
