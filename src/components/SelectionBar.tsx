import { Pressable, StyleSheet, Text, View } from "react-native";
import { FONT, Theme } from "../theme";
import { Icon } from "./Icon";
import { NumberField } from "./NumberField";
import { Stepper } from "./Stepper";

type Props = {
  t: Theme;
  allChecked: boolean;
  allValue: number;
  tours: number;
  disabled: boolean;
  subtitle: string;
  onToggleAll: () => void;
  onAllDec: () => void;
  onAllInc: () => void;
  onAllSet: (n: number) => void;
  onToursSet: (n: number) => void;
  onToursDec: () => void;
  onToursInc: () => void;
  onPlay: () => void;
};

export function SelectionBar(p: Props) {
  const { t } = p;
  return (
    <View style={[styles.wrap, { borderBottomColor: t.line }]}>
      <View style={styles.top}>
        <Pressable onPress={p.onToggleAll} style={styles.toggleAll}>
          <Text style={[styles.toggleText, { color: t.accent }]}>{p.allChecked ? "Tout décocher" : "Tout cocher"}</Text>
        </Pressable>
        <View style={styles.allReps}>
          <Text style={[styles.small, { color: t.muted }]} numberOfLines={2}>Répétitions pour tous</Text>
          <Stepper
            t={t}
            value={p.allValue}
            onDec={p.onAllDec}
            onInc={p.onAllInc}
            onSet={p.onAllSet}
            labelSet="Nombre de répétitions pour tous les chapitres"
            labelDec="Une répétition de moins pour tous les chapitres"
            labelInc="Une répétition de plus pour tous les chapitres"
            buttonWidth={40}
          />
        </View>
      </View>
      <View style={styles.bottom}>
        <View style={[styles.tours, { borderColor: t.line, backgroundColor: t.surface }]}>
          <Pressable accessibilityLabel="Un tour de moins" onPress={p.onToursDec} style={styles.toursBtn}>
            <Icon name="minus" size={16} color={t.ink} />
          </Pressable>
          <View style={styles.toursMid}>
            <NumberField value={p.tours} min={1} max={20} onCommit={p.onToursSet} label="Nombre de tours de la sélection" color={t.ink} style={styles.toursValue} />
            <Text style={[styles.toursWord, { color: t.muted }]}>{p.tours > 1 ? "tours" : "tour"}</Text>
          </View>
          <Pressable accessibilityLabel="Un tour de plus" onPress={p.onToursInc} style={styles.toursBtn}>
            <Icon name="plus" size={16} color={t.ink} />
          </Pressable>
        </View>
        <Pressable
          disabled={p.disabled}
          onPress={p.onPlay}
          style={[styles.playSel, { backgroundColor: p.disabled ? t.disabledBg : t.accent }]}
        >
          <Icon name="play" size={18} color={p.disabled ? t.disabledInk : t.accentInk} />
          <View>
            <Text style={[styles.playTitle, { color: p.disabled ? t.disabledInk : t.accentInk }]}>Écouter la sélection</Text>
            <Text style={[styles.playSub, { color: p.disabled ? t.disabledInk : t.accentInk }]}>{p.subtitle}</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 2, paddingBottom: 12, paddingHorizontal: 16, rowGap: 6, borderBottomWidth: StyleSheet.hairlineWidth },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", columnGap: 8 },
  toggleAll: { height: 44, paddingHorizontal: 2, justifyContent: "center" },
  toggleText: { fontFamily: FONT.sansSemi, fontSize: 14 },
  allReps: { flexShrink: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", columnGap: 8 },
  small: { flexShrink: 1, fontFamily: FONT.sans, fontSize: 12, textAlign: "right" },
  bottom: { flexDirection: "row", columnGap: 8, alignItems: "stretch" },
  tours: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 14 },
  toursBtn: { width: 40, height: 56, alignItems: "center", justifyContent: "center" },
  toursMid: { alignItems: "center", minWidth: 38 },
  toursValue: { minWidth: 30, fontFamily: FONT.sansSemi, fontSize: 17, fontVariant: ["tabular-nums"] },
  toursWord: { fontFamily: FONT.sans, fontSize: 11 },
  playSel: { flex: 1, minWidth: 0, minHeight: 56, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", columnGap: 10, paddingVertical: 6, paddingHorizontal: 12 },
  playTitle: { fontFamily: FONT.sansSemi, fontSize: 15 },
  playSub: { fontFamily: FONT.sans, fontSize: 12 },
});
