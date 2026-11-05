import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Corpus } from "../data/corpora";
import { est, fmt, totalDuration } from "../data/chapters";
import { FONT, Theme, ThemeName } from "../theme";
import { Header } from "../components/Header";
import { Icon } from "../components/Icon";

type Props = {
  t: Theme;
  theme: ThemeName;
  corpora: Corpus[];
  onToggleTheme: () => void;
  onOpen: (corpus: Corpus) => void;
};

export function HomeScreen({ t, theme, corpora, onToggleTheme, onOpen }: Props) {
  return (
    <View style={{ flex: 1 }}>
      <Header t={t} theme={theme} onToggleTheme={onToggleTheme} kicker="TIKRAR" titleAr="تكرار" subtitle="Choisissez un texte à mémoriser" />
      <ScrollView contentContainerStyle={styles.list}>
        {corpora.map((c) => {
          const ready = c.chapters.length > 0;
          const total = totalDuration(c.chapters);
          return (
            <Pressable
              key={c.id}
              disabled={!ready}
              onPress={() => onOpen(c)}
              accessibilityLabel={`${c.fr}, ${ready ? c.chapters.length + " chapitres" : "bientôt disponible"}`}
              style={[styles.card, { backgroundColor: t.surface, borderColor: t.line, opacity: ready ? 1 : 0.6 }]}
            >
              <View style={styles.cardBody}>
                <Text style={[styles.kicker, { color: t.accent }]}>{c.kicker}</Text>
                <Text style={[styles.ar, { color: t.ink }]}>{c.ar}</Text>
                <Text style={[styles.fr, { color: t.ink }]}>{c.fr}</Text>
                <Text style={[styles.desc, { color: t.muted }]}>{c.description}</Text>
                <Text style={[styles.meta, { color: t.muted }]}>
                  {ready ? `${c.chapters.length} chapitres · ${est(total)} · ${fmt(total)}` : "Bientôt disponible"}
                </Text>
              </View>
              {ready && <Icon name="chevron" size={22} color={t.muted} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, rowGap: 12 },
  card: { flexDirection: "row", alignItems: "center", columnGap: 8, padding: 16, borderRadius: 16, borderWidth: 1 },
  cardBody: { flex: 1, minWidth: 0, rowGap: 2 },
  kicker: { fontFamily: FONT.sansMedium, fontSize: 11, letterSpacing: 1.5 },
  ar: { fontFamily: FONT.arabic, fontSize: 28, lineHeight: 42, writingDirection: "rtl", textAlign: "left", alignSelf: "flex-start" },
  fr: { fontFamily: FONT.sansSemi, fontSize: 16 },
  desc: { fontFamily: FONT.sans, fontSize: 13, lineHeight: 19, paddingTop: 2 },
  meta: { fontFamily: FONT.sans, fontSize: 12, paddingTop: 6, fontVariant: ["tabular-nums"] },
});
