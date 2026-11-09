import { useEffect, useState } from "react";
import { BackHandler, StyleSheet, View, useColorScheme } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { CORPORA, Corpus } from "./src/data/corpora";
import type { Chapter } from "./src/data/chapters";
import { purgeStaleCache } from "./src/lib/remoteCache";
import { THEMES } from "./src/theme";
import { useSettings } from "./src/hooks/usePrefs";
import { HomeScreen } from "./src/screens/HomeScreen";
import { CorpusScreen } from "./src/screens/CorpusScreen";
import { VerseScreen } from "./src/screens/VerseScreen";

const SPEEDS = [0.75, 1, 1.25, 1.5];

function Main() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const { settings, ready, update } = useSettings();
  const [corpus, setCorpus] = useState<Corpus | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);

  // Au démarrage : retire du téléphone les anciennes révisions des audios (remplacés sur la release).
  useEffect(() => {
    purgeStaleCache(new Set(CORPORA.flatMap((c) => c.chapters.map((ch) => ch.cacheName ?? ""))));
  }, []);

  useEffect(() => {
    if (!corpus) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (chapter) setChapter(null);
      else setCorpus(null);
      return true;
    });
    return () => sub.remove();
  }, [corpus, chapter]);

  const themeName = settings.theme ?? (scheme === "dark" ? "dark" : "light");
  const t = THEMES[themeName];
  const speed = SPEEDS[settings.speedIdx] ?? 1;
  const cycleSpeed = () => update({ speedIdx: (settings.speedIdx + 1) % SPEEDS.length });
  const toggleTheme = () => update({ theme: themeName === "dark" ? "light" : "dark" });

  if (!ready) return <View style={{ flex: 1, backgroundColor: t.bg }} />;

  return (
    <View style={[styles.root, { backgroundColor: t.bg, paddingTop: insets.top }]}>
      <StatusBar style={themeName === "dark" ? "light" : "dark"} />
      {corpus && chapter ? (
        <VerseScreen
          key={`${corpus.id}-${chapter.n}`}
          t={t}
          corpus={corpus}
          chapter={chapter}
          speed={speed}
          onCycleSpeed={cycleSpeed}
          onBack={() => setChapter(null)}
        />
      ) : corpus ? (
        <CorpusScreen
          key={corpus.id}
          t={t}
          theme={themeName}
          corpus={corpus}
          speed={speed}
          onCycleSpeed={cycleSpeed}
          onToggleTheme={toggleTheme}
          onBack={() => setCorpus(null)}
          onOpenChapter={setChapter}
        />
      ) : (
        <HomeScreen t={t} theme={themeName} corpora={CORPORA} onToggleTheme={toggleTheme} onOpen={setCorpus} />
      )}
    </View>
  );
}

export default function App() {
  // Imports directs des .ttf : l'index des paquets embarquerait tous les poids.
  const [loaded] = useFonts({
    Amiri_700Bold: require("@expo-google-fonts/amiri/700Bold/Amiri_700Bold.ttf"),
    IBMPlexSans_400Regular: require("@expo-google-fonts/ibm-plex-sans/400Regular/IBMPlexSans_400Regular.ttf"),
    IBMPlexSans_500Medium: require("@expo-google-fonts/ibm-plex-sans/500Medium/IBMPlexSans_500Medium.ttf"),
    IBMPlexSans_600SemiBold: require("@expo-google-fonts/ibm-plex-sans/600SemiBold/IBMPlexSans_600SemiBold.ttf"),
  });
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <Main />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
