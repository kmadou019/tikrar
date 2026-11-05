import { Pressable, StyleSheet, Text, View } from "react-native";
import { FONT, Theme } from "../theme";
import { Icon } from "./Icon";

type Props = { t: Theme; subtitle: string; bottomInset: number; onReplay: () => void; onClose: () => void };

export function FinishedCard({ t, subtitle, bottomInset, onReplay, onClose }: Props) {
  return (
    <View style={[styles.wrap, { backgroundColor: t.surface, borderTopColor: t.line, shadowColor: t.shadow, paddingBottom: 18 + bottomInset }]}>
      <View style={styles.head}>
        <View style={[styles.badge, { backgroundColor: t.tint }]}>
          <Icon name="check" size={20} color={t.accent} strokeWidth={2.4} />
        </View>
        <View>
          <Text style={[styles.title, { color: t.ink }]}>Sélection terminée</Text>
          <Text style={[styles.sub, { color: t.muted }]}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onReplay} style={[styles.replay, { backgroundColor: t.accent }]}>
          <Text style={[styles.replayText, { color: t.accentInk }]}>Réécouter</Text>
        </Pressable>
        <Pressable onPress={onClose} style={[styles.close, { borderColor: t.line }]}>
          <Text style={[styles.closeText, { color: t.ink }]}>Fermer</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 18, paddingHorizontal: 16, rowGap: 14, borderTopWidth: StyleSheet.hairlineWidth, elevation: 12, shadowOpacity: 1, shadowRadius: 14, shadowOffset: { width: 0, height: -10 } },
  head: { flexDirection: "row", alignItems: "center", columnGap: 12 },
  badge: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: FONT.sansSemi, fontSize: 16 },
  sub: { fontFamily: FONT.sans, fontSize: 13 },
  actions: { flexDirection: "row", columnGap: 8 },
  replay: { flex: 1, minHeight: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  replayText: { fontFamily: FONT.sansSemi, fontSize: 15 },
  close: { minHeight: 52, paddingHorizontal: 20, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  closeText: { fontFamily: FONT.sansMedium, fontSize: 15 },
});
