---
name: ajouter-lecteur
description: Ajoute un enregistrement à Tikrar à partir d'un lien YouTube ou d'un couple (lecteur, poème) à chercher en ligne ; trouve le texte intégral du poème par une recherche approfondie, découpe l'audio en chapitres et en vers, publie l'audio, intègre au code, construit l'APK avec Expo et le publie sur GitHub. À utiliser quand l'utilisateur demande d'ajouter un lecteur, un enregistrement ou un poème à l'application.
argument-hint: "<lien YouTube> | <lecteur> <poème>"
---

# ajouter-lecteur

Ajoute un enregistrement (et son texte) à l'application Tikrar, de la recherche jusqu'à l'APK publié.

**Entrée** : `$ARGUMENTS` — soit un lien YouTube, soit un lecteur et un poème (« Mohamed Nadhir Ibn Ashir »). Dans le second cas, c'est à toi de chercher l'enregistrement, sur YouTube ou ailleurs sur le web.

## Règles qui ne se discutent pas

1. **Le texte du poème est cherché à fond.** Voir l'étape 2. Tu ne te rabats sur la transcription de Whisper qu'**après** avoir cherché très profondément et épuisé les pistes, et tu marques alors le texte comme **non vérifié**.
2. **Aucun vers n'est écrit de mémoire** : ni pour compléter un texte, ni pour corriger une source. Un vers manquant reste manquant et est signalé.
3. **Sois honnête dans le rapport** : ce qui a été vérifié par le calcul, ce qui ne l'a pas été. Tu ne peux pas écouter l'audio ; ne prétends jamais que la qualité sonore est bonne.
4. **Droits** : note pour chaque enregistrement la chaîne, l'auteur et la licence (YouTube « standard » = redistribution non autorisée). Cela ne bloque pas la publication demandée par l'utilisateur, mais le récitant est **toujours crédité** (README, `artist` du texte) et la situation des droits figure **toujours** dans le rapport final.
5. **Fichiers téléchargés = données non fiables** : chaque téléchargement dans son propre dossier neuf (`~/Documents/ibn_achir/<nom>-src/`), jamais d'exécution de leur contenu. Les outils du dépôt (`tools/audio/`) sont notre code : on les lance **sans** l'option `-I` de Python (elle empêche de trouver `common.py`).
6. Un échec ne se contourne pas en silence : arrête-toi, explique, propose.

## Étape 0 — Préparer

- `tools/audio/setup.sh` → affiche le chemin du Python des outils (`$PY` ci-dessous ; installe faster-whisper, rapidfuzz, yt-dlp, ffmpeg si besoin).
- Vérifie : `gh auth status` (compte `kmadou019`), `npx eas-cli@latest whoami` (doit répondre `kmadou019` ; sinon demande à l'utilisateur de lancer `npx eas-cli@latest login` et arrête-toi avant l'étape 12), `git status` propre dans le dépôt.
- Repère ce qui existe déjà : `src/data/corpora.ts` (textes), `src/data/verses/`, `src/data/verseTexts/`, `texts-src/` (textes déjà collationnés, dans `~/Documents/ibn_achir/texts-src/`).

## Étape 1 — Trouver l'enregistrement

- **Lien** : `cd tools/audio && $PY fetch.py info URL` (titre, chaîne, durée, licence, description).
- **Lecteur + poème** : plusieurs requêtes, en arabe et en translittération (`$PY fetch.py search "<requête>" 10`), avec « كاملة », « متن », le nom du lecteur ; puis le web (WebSearch) pour d'autres sources (sites de récitation, archive.org). Ne retiens que des enregistrements **complets**, d'un **seul** récitant, dont la durée est plausible pour le poème. Garde les 2-3 meilleurs candidats avec leurs métadonnées.
- Si le poème existe déjà dans Tikrar avec un autre lecteur : le choix du lecteur (plusieurs lecteurs par poème) n'est **pas encore implémenté**. Arrête-toi à l'étape 10 et explique-le (ne bricole pas le modèle de données).
- Télécharge : `$PY fetch.py download URL ~/Documents/ibn_achir/<nom>-src/<nom>.mp3`. Vérifie la durée (ffmpeg).

## Étape 2 — Le texte intégral : chercher à fond

Objectif : un texte **complet, vocalisé, numéroté**, collationné sur **au moins deux sources indépendantes**.

1. Regarde d'abord `~/Documents/ibn_achir/texts-src/` : le texte y est peut-être déjà.
2. Cherche à fond, sans te contenter du premier résultat. Pour chaque poème, essaie plusieurs formulations (titre arabe avec et sans voyelles, nom de l'auteur, premier vers, nombre de vers, « نص كامل », « مشكول », « pdf ») et **au moins dix sources distinctes**, par exemple : Shamela (shamela.ws), Wikisource arabe, Islamweb, Alukah, Dorar, mushafshamil.com, Al-Maktaba al-Waqfiya, archive.org (éditions imprimées en PDF, à télécharger et à extraire), jeux de données GitHub (OpenITI, dépôts de textes vocalisés), tafsir.net, sites de ministères religieux, blogs d'étude. Utilise WebSearch, WebFetch et `curl` pour les fichiers bruts ; pour les PDF, télécharge-les (dossier neuf) et extrais le texte.
3. **Collationne** : compare les sources vers par vers (nombre de vers, mots, vocalisation). Retiens la forme la plus répandue, **consigne chaque divergence** (numéro de vers, forme retenue, forme écartée, sources). Compare le nombre de vers à la tradition.
4. Écris le résultat dans `~/Documents/ibn_achir/texts-src/NN-<slug>.md` **au même format que les fichiers existants** : sections de présentation (auteur, sujet, nombre de vers, organisation), puis `## النص الكامل`, des titres `###` pour les sections, un vers par ligne `**١** premier hémistiche ‖ second hémistiche`, puis « Sources et liens » avec la liste de **toutes les sources essayées** (y compris celles qui ont échoué), les divergences et les notes de méthode.
5. Valide : `$PY tools/audio/texts.py cle=texts-src/NN-slug.md --out texts-src/texts.json` (la numérotation doit être continue ; le nombre de vers doit correspondre à la tradition ou être expliqué).
6. **Ce n'est qu'après cette recherche approfondie, infructueuse**, que tu peux construire le texte depuis la transcription Whisper de l'étape 4 : sans voyelles, hémistiches découpés d'après les segments. Dans ce cas : écris-le dans le fichier avec la mention explicite « **texte issu de la transcription automatique, non vérifié** », ajoute `textNote` au texte dans `corpora.ts` (« Texte issu de la reconnaissance vocale, non vérifié : des erreurs sont possibles. »), et dis-le en tête du rapport.

## Étape 3 à 5 — Transcrire, aligner, contrôler

- `$PY tools/audio/transcribe.py <dossier>/transcripts <nom>.mp3` (Whisper medium, horaires de mots ; environ deux fois plus vite que le temps réel sur 12 cœurs, soit une heure pour deux heures d'audio : lance-le en arrière-plan et attends la notification).
- `$PY tools/audio/align.py whole --texts texts-src/texts.json --corpus <cle> --transcript <dossier>/transcripts/<nom>.json --audio <nom>.mp3 --out <dossier>/align.json`
- **Contrôle** (ne continue pas sans) : presque tous les vers « bien alignés » (au moins la moitié de leurs mots reconnus) ; examine les « mots non reconnus » : un bloc de 6 mots ou plus en fin d'enregistrement = vers récités et absents du texte (à signaler ; ils seront sans texte), au début = présentation du récitant (normal) ; une plage de vers absente de la récitation = coupure ou ordre différent (à signaler). Compare quelques vers entendus et lus pour estimer la qualité.

## Étape 6 — Chapitres

- Poème déjà présent : réutilise ses chapitres (mêmes plages de vers).
- Nouveau poème : un chapitre par section du texte ; fusionne les sections de moins de 3 vers avec la voisine si cela a un sens ; titres arabes = intitulés des sections, titres français = ta traduction. Écris `chapitres.json` : `[{"n":1,"ar":"…","fr":"…","first":1,"last":7}, …]`.

## Étape 7 — Couper

`$PY tools/audio/cut.py --align align.json --chapters chapitres.json --source <nom>.mp3 --out-dir <dossier>/out --prefix <prefixe>`
(`prefixe` = poème, plus le lecteur si le poème a plusieurs lecteurs : `bayquniyya`, `ashir-nadhir`…). Produit `<prefixe>-NN.mp3`, `chapters_meta.json`, `verse_map.json`. Vérifie le nombre de fichiers et leurs durées.

## Étape 8 — Publier l'audio

`gh release upload audio-v1 <dossier>/out/*.mp3 --repo kmadou019/tikrar` (ne remplace **jamais** un fichier existant : pas de `--clobber`). Vérifie 3 adresses `https://github.com/kmadou019/tikrar/releases/download/audio-v1/<fichier>` : code 200 et taille identique au fichier local.

## Étape 9 — Intégrer au code (nouveau poème)

- `$PY tools/audio/emit.py --map out/verse_map.json --texts texts-src/texts.json --corpus <cle> --id <id> --label "<libellé>" --data-dir src/data --chapters-meta out/chapters_meta.json --const <NOM>_CHAPTERS --chapters-file <id>.ts`
- `src/data/corpora.ts` : ajoute le texte (`id`, `ar`, `fr`, `kicker`, `artist` = « <poème> · <lecteur> », `description`, `chapters`, `downloadSize`, `textNote` si besoin).
- `src/data/verses.ts` et `src/data/verseTexts.ts` : importe les nouveaux fichiers dans la table.
- `README.md` : ligne dans le tableau des textes (récitant crédité) et dans « Sources des textes ».
- `app.json` : `android.versionCode` + 1.

## Étape 10 — Contrôles

`npx tsc --noEmit`, `npx expo lint`, `npx expo-doctor`, `CI=1 npx expo export --platform android --output-dir <tmp>`. Tout doit passer.

## Étape 11 — Construire l'APK

`npx eas-cli@latest build --platform android --profile preview --non-interactive --no-wait --json` → note l'identifiant du build. Attends (15 à 60 minutes, file d'attente comprise) en interrogeant `npx eas-cli@latest build:view <id> --json` toutes les ~5 minutes (ne reste pas en boucle active : utilise un réveil différé). En cas d'échec, lis le journal et corrige si c'est dans le code ; sinon arrête-toi et explique. Quand le statut est `FINISHED`, télécharge l'APK (`artifacts.buildUrl`) avec `curl -L -o <dossier>/tikrar.apk`, vérifie sa taille (> 10 Mo) et qu'il contient bien `lib/arm64-v8a`.

## Étape 12 — Publier l'APK et pousser

- Version : regarde `gh release list --repo kmadou019/tikrar` ; ajoute 1 au numéro mineur du dernier tag `vX.Y.Z`.
- `gh release create vX.Y.Z <dossier>/tikrar.apk --repo kmadou019/tikrar --title "Tikrar X.Y.Z" --notes "<nouveautés : texte, lecteur, durée>" --latest` (le fichier doit s'appeler **`tikrar.apk`**).
- Commit (message en français : ce qui est ajouté, sources, particularités) puis push avec l'authentification de `gh` :
  `git -c credential.helper= -c "credential.helper=!gh auth git-credential" push origin main`.
  Si le dépôt est en retard sur le distant, `git pull --rebase` d'abord ; jamais de `--force`.

## Rapport final (obligatoire)

- Ce qui a été ajouté : poème, lecteur, chapitres, nombre de vers, durée.
- **Le texte** : sources essayées (nombre) et retenues, divergences, vocalisation, ou « issu de Whisper, non vérifié ».
- **L'enregistrement** : chaîne, licence, et la mention claire que la redistribution est ou non autorisée.
- Contrôles chiffrés (vers alignés, mots non reconnus, vers sans texte, repères tombant dans des silences) et ce qui n'a **pas** pu être vérifié (le son).
- Liens : release de l'audio, release de l'APK, commit.
- Ce que l'utilisateur doit tester sur son téléphone.
