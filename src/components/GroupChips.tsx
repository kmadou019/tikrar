import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { ChapterGroup } from "../data/chapters";
import { FONT, Theme } from "../theme";

type Props = {
  t: Theme;
  groups: ChapterGroup[];
  checked: number[];
  note?: string;
  onToggle: (group: ChapterGroup) => void;
};

export function GroupChips({ t, groups, checked, note, onToggle }: Props) {
  return (
    <View style={[styles.wrap, { borderBottomColor: t.line }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {groups.map((g) => {
          const on = g.chapters.every((n) => checked.includes(n));
          return (
            <Pressable
              key={g.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              accessibilityLabel={`Sélectionner ${g.label}`}
              onPress={() => onToggle(g)}
              style={[styles.chip, { borderColor: on ? t.accent : t.line, backgroundColor: on ? t.accent : t.surface }]}
            >
              <Text style={[styles.label, { color: on ? t.accentInk : t.ink }]}>{g.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {note && <Text style={[styles.note, { color: t.muted }]}>{note}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 8, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  row: { paddingHorizontal: 16, columnGap: 8 },
  chip: { height: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  label: { fontFamily: FONT.sansSemi, fontSize: 14, fontVariant: ["tabular-nums"] },
  note: { fontFamily: FONT.sans, fontSize: 12, lineHeight: 17, paddingHorizontal: 16, paddingTop: 6 },
});
