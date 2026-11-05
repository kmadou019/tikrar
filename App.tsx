import { useEffect, useState } from "react";
import { BackHandler, StyleSheet, View, useColorScheme } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { CORPORA, Corpus } from "./src/data/corpora";
import { THEMES } from "./src/theme";
import { useSettings } from "./src/hooks/usePrefs";
import { HomeScreen } from "./src/screens/HomeScreen";
import { CorpusScreen } from "./src/screens/CorpusScreen";

const SPEEDS = [0.75, 1, 1.25, 1.5];

function Main() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const { settings, ready, update } = useSettings();
  const [corpus, setCorpus] = useState<Corpus | null>(null);

  useEffect(() => {
    if (!corpus) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      setCorpus(null);
      return true;
    });
    return () => sub.remove();
  }, [corpus]);

  const themeName = settings.theme ?? (scheme === "dark" ? "dark" : "light");
  const t = THEMES[themeName];
  const speed = SPEEDS[settings.speedIdx] ?? 1;
  const toggleTheme = () => update({ theme: themeName === "dark" ? "light" : "dark" });

  if (!ready) return <View style={{ flex: 1, backgroundColor: t.bg }} />;

  return (
    <View style={[styles.root, { backgroundColor: t.bg, paddingTop: insets.top }]}>
      <StatusBar style={themeName === "dark" ? "light" : "dark"} />
      {corpus ? (
        <CorpusScreen
          key={corpus.id}
          t={t}
          theme={themeName}
          corpus={corpus}
          speed={speed}
          onCycleSpeed={() => update({ speedIdx: (settings.speedIdx + 1) % SPEEDS.length })}
          onToggleTheme={toggleTheme}
          onBack={() => setCorpus(null)}
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
