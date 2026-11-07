# Tikrar · تكرار

Application Android pour **mémoriser des textes récités en arabe**, en écoutant chaque chapitre en boucle.
*Tikrar* signifie « répétition » : on choisit combien de fois chaque chapitre se répète, on coche ceux que l'on veut enchaîner, et l'application les joue à la suite, y compris écran verrouillé.

## Fonctions

- **Boucle par chapitre** : de 1 à 99 répétitions, saisies au clavier ou avec − et +. Un réglage « pour tous » applique le même nombre partout.
- **Sélection de chapitres** : on coche plusieurs chapitres, « Écouter la sélection » les joue dans l'ordre, chacun répété son nombre de fois, avec la possibilité de refaire la sélection plusieurs *tours* (1 à 20).
- **Écoute par vers** (poèmes) : un tap sur le titre d'un chapitre ouvre ses vers. On choisit un vers ou une plage (du vers 3 au vers 7), puis soit **la plage en boucle**, soit **chaque vers N fois**, avec N saisi au clavier (jusqu'à 999). La reprise est **sans trou** : le chapitre est décodé en mémoire et la boucle est calée à l'échantillon près, les pauses du récitant restant celles de l'enregistrement.
- **Juz** (Coran) : une rangée de boutons permet de cocher un juz entier. L'audio étant découpé par sourate, un juz inclut les sourates qu'il touche, lues en entier.
- **Lecteur** : répétition en cours, progression, précédent / suivant, vitesse de 0,75× à 1,5×, lecture écran verrouillé avec commandes de notification.
- **Hors ligne** : chaque chapitre se télécharge au premier usage puis reste sur le téléphone. Un bouton « Tout télécharger » récupère tout un texte d'un coup, et « Supprimer » libère la place.
- **Mode clair et sombre**, au choix ou selon le téléphone. Les réglages (cases cochées, répétitions, tours, vitesse, thème) sont mémorisés.

## Textes

| Texte | Contenu | Source de l'audio |
|---|---|---|
| *al-Murshid al-Muʿīn* (Matn Ibn ʿĀshir) | 19 chapitres, ≈ 34 min | Enregistrement découpé par le projet |
| *Alfiyya d'Ibn Mālik* | 68 chapitres, ≈ 2 h 09 | Récitation de ʿAbd al-Ghanī Ṣādiq al-Faqīh, découpée par le projet |
| *Bayqūniyya* (ʿUmar al-Bayqūnī) | 12 chapitres, ≈ 3 min 30 | Récitation du Dr ʿAbd al-ʿAzīz aṣ-Ṣīnī, découpée par le projet |
| *Tuḥfat al-aṭfāl* (al-Jamzūrī) | 10 chapitres, ≈ 8 min 30 | Récitation du cheikh Badr at-Turkī, découpée par le projet |
| *Naẓm Ibn Abī Kaff* (uṣūl al-fiqh malikite) | 3 chapitres, ≈ 3 min | Enregistrement de la chaîne YouTube « عبد الحفيظ جويلي المجبري » (récitant non identifié), découpé par le projet |
| *al-ʿAqīda aṭ-Ṭaḥāwiyya* (matn en prose) | 30 chapitres, ≈ 27 min | Lecture attribuée à Mishary Rashid Alafasy d'après le titre de la vidéo YouTube (chaîne non indiquée), découpée par le projet ; chapitres d'après les sections de [Wikisource](https://ar.wikisource.org/wiki/%D9%85%D8%AA%D9%86_%D8%A7%D9%84%D8%B9%D9%82%D9%8A%D8%AF%D8%A9_%D8%A7%D9%84%D8%B7%D8%AD%D8%A7%D9%88%D9%8A%D8%A9) (CC BY-SA 4.0). Pas de texte dans l'application |
| Le Coran | 114 sourates, ≈ 7 h 30 | Hafs ʿan ʿĀṣim (Hadr), cheikh Ahmed Diban, via [way2quran.com](https://way2quran.com/en/reciters/ahmed-diban) |

Les découpages en chapitres d'Ibn ʿĀshir, de l'Alfiyya, de la Bayqūniyya et de la Tuḥfa ont été faits à partir d'une transcription automatique (Whisper), en se calant sur les titres que le récitant annonce à voix haute. Quand un titre n'est pas annoncé, la coupe se fait au premier vers du chapitre.

### Droits sur les enregistrements

Les enregistrements appartiennent à leurs récitants. Ils ne sont pas inclus dans ce dépôt ni dans l'APK : l'application les télécharge depuis des sources publiques (la release `audio-v1` de ce dépôt pour Ibn ʿĀshir et l'Alfiyya, way2quran.com pour le Coran). Ce projet est destiné à l'étude personnelle ; pour toute demande de retrait, ouvrez une *issue*.

## Technique

- [Expo](https://expo.dev) SDK 58, React Native 0.88, TypeScript
- `expo-audio` (lecture de chapitres entiers, arrière-plan, lecteur de l'écran verrouillé), `react-native-audio-api` (moteur de la lecture par vers : boucles exactes, notification de lecture), `expo-file-system` (téléchargements), `@react-native-async-storage/async-storage` (réglages)
- Polices : Amiri (texte arabe) et IBM Plex Sans (interface), embarquées

### Lancer en développement

```bash
npm install
npx expo start
```

L'application s'ouvre dans Expo Go, mais la lecture en arrière-plan et les commandes de l'écran verrouillé ne fonctionnent que dans une version construite (voir ci-dessous).

### Contrôles

```bash
npx tsc --noEmit     # typage
npx expo lint        # lint
npx expo-doctor      # cohérence du projet
```

### Construire l'APK

La construction se fait dans le cloud avec [EAS](https://docs.expo.dev/build/introduction/), avec un compte Expo :

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

- Pour installer une nouvelle version par-dessus la précédente, augmentez `android.versionCode` dans `app.json`.
- Le profil `preview` produit un APK pour processeurs 64 bits uniquement (`arm64-v8a`, voir `expo-build-properties` dans `app.json`).

## Organisation du code

```
App.tsx                      navigation accueil ↔ texte, thème, vitesse
src/
  screens/                   HomeScreen (liste des textes), CorpusScreen (chapitres + lecteur), VerseScreen (vers d'un chapitre)
  components/                ChapterRow, SelectionBar, GroupChips, DownloadBar, Player, Stepper, NumberField…
  hooks/
    usePlayback.ts           lecture de chapitres entiers : répétitions, enchaînement, tours, écran verrouillé
    useVersePlayer.ts        lecture par vers : préparation, position, notification, commandes
    usePrefs.ts              réglages par texte et réglages globaux
    useRemoteCache.ts        état des téléchargements, « tout télécharger », suppression
  lib/remoteCache.ts         téléchargement et cache des fichiers sur le téléphone
  lib/versePlan.ts           calcul pur de la lecture par vers (blocs, tours, position), sans dépendance audio
  lib/versePlayer.ts         moteur audio : décodage du chapitre, sources bouclées à l'échantillon près
  data/                      définition des textes et de leurs chapitres
  theme.ts                   couleurs et polices
brand/                       logo, icône et variantes (SVG, PNG)
```

### Données des vers

- `src/data/verses/<texte>.ts` : début de chaque vers (en secondes) dans l'audio de son chapitre. Un vers va de son début au début du suivant, pauses comprises. Un chapitre absent de ces fichiers s'affiche « non découpé » (écoute du chapitre entier seulement).
- `src/data/verseTexts.ts` : texte des vers, `[premier hémistiche, second hémistiche]` par vers, par texte et par numéro de chapitre. Tant qu'il est vide, l'écran n'affiche que le numéro et la durée de chaque vers.
- Les repères sont produits à partir de la transcription de chaque chapitre (Whisper, horaires de mots), puis **affinés sur le signal audio** : chaque repère est posé au moment le plus silencieux de la pause qui précède le vers.

### Sources des textes

Le texte des vers vient de quatre fichiers de collation préparés pour le projet, qui consignent leurs sources et leurs variantes :

| Poème | Vers | Source principale | Remarque |
|---|---|---|---|
| Bayqūniyya | 34 | [alukah.net](https://www.alukah.net/hosnihamama/1/118948/) (consonnes), vocalisation collationnée avec [diarfitri88/takhrij-frontend](https://github.com/diarfitri88/takhrij-frontend) | Quelques divergences de vocalisation entre sources, forme la plus répandue retenue. |
| Tuḥfat al-aṭfāl | 61 | [mushafshamil.com](https://mushafshamil.com/books/tuhfat-al-atfal/) | Nombre de vers conforme à la tradition. |
| Alfiyya | 1002 | Édition ʿAbd al-Muḥsin al-Qāsim (Médine, 2021), transcription [altwasolbook-hash/alfiya-memorizer](https://github.com/altwasolbook-hash/alfiya-memorizer), contrôlée avec OpenITI et Wikisource | Numérotation de cette édition. |
| Naẓm Ibn Abī Kaff | 30 | PDF fourni par l'utilisateur (« نسخة مراجعة ومصححة على نسخة الشيخ عليوي »), collation partielle avec [virtualmosque.com](https://virtualmosque.com/?p=3436) | Texte entièrement vocalisé, lu visuellement sur le PDF : une erreur de vocalisation reste possible. |
| Ibn ʿĀshir | 311 + 5 | [chariaa.weebly.com](https://chariaa.weebly.com/160515781606-157515761606-1593157515881585.html), **source unique** | Vocalisation irrégulière, passages altérés, 311 vers au lieu de 316 ou 317 : les cinq derniers vers (312 à 316) n'ont pas de texte dans l'application. À collationner sur une édition imprimée avant de s'y fier pour mémoriser. |

Les poèmes sont anciens et dans le domaine public ; la vocalisation et la mise en forme viennent des sources ci-dessus. Aucun vers n'a été reconstitué de mémoire.

### Ajouter un texte

1. Créer ses chapitres dans `src/data/` (numéro, titre arabe, titre français, durée en secondes, source). Pour un audio hébergé, `hostedAudio("nom.mp3")` (dans `audioHost.ts`) ou une URL directe avec un `cacheName`.
2. L'ajouter à la liste `CORPORA` dans `src/data/corpora.ts`. Un champ `groups` optionnel ajoute des boutons de sélection groupée (comme les juz).

### Hébergement des audios

Les audios d'Ibn ʿĀshir, de l'Alfiyya, de la Bayqūniyya et de la Tuḥfa sont des pièces jointes de la release [`audio-v1`](https://github.com/kmadou019/tikrar/releases/tag/audio-v1), nommées `ashir-NN-nom.mp3`, `alfiyya-NN.mp3`, `bayquniyya-NN.mp3` et `tuhfa-NN.mp3`. Pour changer d'hébergement, il suffit de modifier l'adresse de base dans `src/data/audioHost.ts`. Le tag `audio-v1` ne doit être ni supprimé ni déplacé, sinon les téléchargements échouent.

## Licences

- Code : voir [LICENSE](LICENSE).
- Polices : Amiri, IBM Plex Sans et Aref Ruqaa (monogramme du logo), sous licence SIL Open Font License.
