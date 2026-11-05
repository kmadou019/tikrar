import { Pressable, StyleSheet, Text, View } from "react-native";
import { FONT, Theme } from "../theme";
import type { BulkState } from "../hooks/useRemoteCache";

type Props = {
  t: Theme;
  cachedCount: number;
  total: number;
  bulk: BulkState | null;
  onDownloadAll: () => void;
  onCancel: () => void;
  onRemoveAll: () => void;
};

export function DownloadBar({ t, cachedCount, total, bulk, onDownloadAll, onCancel, onRemoveAll }: Props) {
  const complete = cachedCount >= total;
  const label = bulk
    ? `Téléchargement ${bulk.done}/${bulk.total}…`
    : complete
      ? `Tout est disponible hors ligne (${total}/${total})`
      : `Hors ligne : ${cachedCount}/${total} téléchargés`;
  const action = bulk ? { text: "Annuler", onPress: onCancel } : complete ? { text: "Supprimer", onPress: onRemoveAll } : { text: "Tout télécharger", onPress: onDownloadAll };

  return (
    <View style={[styles.wrap, { borderBottomColor: t.line }]}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: t.ink }]}>{label}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={action.onPress}
          style={[styles.btn, { borderColor: bulk || complete ? t.line : t.accent, backgroundColor: bulk || complete ? "transparent" : t.accent }]}
        >
          <Text style={[styles.btnText, { color: bulk || complete ? t.ink : t.accentInk }]}>{action.text}</Text>
        </Pressable>
      </View>
      {bulk && (
        <View style={[styles.track, { backgroundColor: t.line }]}>
          <View style={{ height: 4, width: `${Math.round((bulk.done / bulk.total) * 100)}%`, backgroundColor: t.accent }} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 8, paddingBottom: 8, paddingHorizontal: 16, rowGap: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", columnGap: 12 },
  label: { flex: 1, fontFamily: FONT.sans, fontSize: 13, fontVariant: ["tabular-nums"] },
  btn: { minHeight: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  btnText: { fontFamily: FONT.sansSemi, fontSize: 14 },
  track: { height: 4, borderRadius: 2, overflow: "hidden" },
});
