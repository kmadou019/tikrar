# Tikrar · تكرار

Application Android pour **mémoriser des textes récités en arabe**, en écoutant chaque chapitre en boucle.
*Tikrar* signifie « répétition » : on choisit combien de fois chaque chapitre se répète, on coche ceux que l'on veut enchaîner, et l'application les joue à la suite, y compris écran verrouillé.

## Fonctions

- **Boucle par chapitre** : de 1 à 99 répétitions, saisies au clavier ou avec − et +. Un réglage « pour tous » applique le même nombre partout.
- **Sélection de chapitres** : on coche plusieurs chapitres, « Écouter la sélection » les joue dans l'ordre, chacun répété son nombre de fois, avec la possibilité de refaire la sélection plusieurs *tours* (1 à 20).
- **Juz** (Coran) : une rangée de boutons permet de cocher un juz entier. L'audio étant découpé par sourate, un juz inclut les sourates qu'il touche, lues en entier.
- **Lecteur** : répétition en cours, progression, précédent / suivant, vitesse de 0,75× à 1,5×, lecture écran verrouillé avec commandes de notification.
- **Hors ligne** : chaque chapitre se télécharge au premier usage puis reste sur le téléphone. Un bouton « Tout télécharger » récupère tout un texte d'un coup, et « Supprimer » libère la place.
- **Mode clair et sombre**, au choix ou selon le téléphone. Les réglages (cases cochées, répétitions, tours, vitesse, thème) sont mémorisés.

## Textes

| Texte | Contenu | Source de l'audio |
|---|---|---|
| *al-Murshid al-Muʿīn* (Matn Ibn ʿĀshir) | 19 chapitres, ≈ 34 min | Enregistrement découpé par le projet |
| *Alfiyya d'Ibn Mālik* | 68 chapitres, ≈ 2 h 09 | Récitation de ʿAbd al-Ghanī Ṣādiq al-Faqīh, découpée par le projet |
| Le Coran | 114 sourates, ≈ 7 h 30 | Hafs ʿan ʿĀṣim (Hadr), cheikh Ahmed Diban, via [way2quran.com](https://way2quran.com/en/reciters/ahmed-diban) |

Les découpages en chapitres d'Ibn ʿĀshir et de l'Alfiyya ont été faits à partir d'une transcription automatique (Whisper), en se calant sur les titres que le récitant annonce à voix haute. Quand un titre n'est pas annoncé, la coupe se fait au premier vers du chapitre.

### Droits sur les enregistrements

Les enregistrements appartiennent à leurs récitants. Ils ne sont pas inclus dans ce dépôt ni dans l'APK : l'application les télécharge depuis des sources publiques (la release `audio-v1` de ce dépôt pour Ibn ʿĀshir et l'Alfiyya, way2quran.com pour le Coran). Ce projet est destiné à l'étude personnelle ; pour toute demande de retrait, ouvrez une *issue*.

## Technique

- [Expo](https://expo.dev) SDK 58, React Native 0.88, TypeScript
- `expo-audio` (lecture, arrière-plan, lecteur de l'écran verrouillé), `expo-file-system` (téléchargements), `@react-native-async-storage/async-storage` (réglages)
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
  screens/                   HomeScreen (liste des textes), CorpusScreen (chapitres + lecteur)
  components/                ChapterRow, SelectionBar, GroupChips, DownloadBar, Player, Stepper, NumberField…
  hooks/
    usePlayback.ts           moteur de lecture : répétitions, enchaînement, tours, écran verrouillé
    usePrefs.ts              réglages par texte et réglages globaux
    useRemoteCache.ts        état des téléchargements, « tout télécharger », suppression
  lib/remoteCache.ts         téléchargement et cache des fichiers sur le téléphone
  data/                      définition des textes et de leurs chapitres
  theme.ts                   couleurs et polices
brand/                       logo, icône et variantes (SVG, PNG)
```

### Ajouter un texte

1. Créer ses chapitres dans `src/data/` (numéro, titre arabe, titre français, durée en secondes, source). Pour un audio hébergé, `hostedAudio("nom.mp3")` (dans `audioHost.ts`) ou une URL directe avec un `cacheName`.
2. L'ajouter à la liste `CORPORA` dans `src/data/corpora.ts`. Un champ `groups` optionnel ajoute des boutons de sélection groupée (comme les juz).

### Hébergement des audios

Les audios d'Ibn ʿĀshir et de l'Alfiyya sont des pièces jointes de la release [`audio-v1`](https://github.com/kmadou019/tikrar/releases/tag/audio-v1), nommées `ashir-NN-nom.mp3` et `alfiyya-NN.mp3`. Pour changer d'hébergement, il suffit de modifier l'adresse de base dans `src/data/audioHost.ts`. Le tag `audio-v1` ne doit être ni supprimé ni déplacé, sinon les téléchargements échouent.

## Licences

- Code : voir [LICENSE](LICENSE).
- Polices : Amiri, IBM Plex Sans et Aref Ruqaa (monogramme du logo), sous licence SIL Open Font License.
