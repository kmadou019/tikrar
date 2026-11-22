import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Corpus } from "../data/corpora";
import { FONT, Theme } from "../theme";

type Props = { t: Theme; items: Corpus[]; current: string; onSelect: (c: Corpus) => void };

// Choix du récitant : un enregistrement par puce ; la sélection de chapitres de chaque enregistrement est conservée.
export function ReciterChips({ t, items, current, onSelect }: Props) {
  return (
    <View style={[styles.wrap, { borderBottomColor: t.line }]}>
      <Text style={[styles.label, { color: t.muted }]}>Récitant</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map((c) => {
          const on = c.id === current;
          return (
            <Pressable
              key={c.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`Récitant : ${c.reciter ?? c.fr}`}
              onPress={() => !on && onSelect(c)}
              style={[styles.chip, { borderColor: on ? t.accent : t.line, backgroundColor: on ? t.accent : t.surface }]}
            >
              <Text style={[styles.text, { color: on ? t.accentInk : t.ink }]} numberOfLines={1}>{c.reciter ?? c.fr}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 4, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  label: { fontFamily: FONT.sansMedium, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", paddingHorizontal: 16, paddingBottom: 6 },
  row: { paddingHorizontal: 16, columnGap: 8 },
  chip: { height: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  text: { fontFamily: FONT.sansSemi, fontSize: 14 },
});
