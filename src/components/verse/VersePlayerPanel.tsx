import { Pressable, StyleSheet, Text, View } from "react-native";
import { FONT, Theme } from "../../theme";
import { Icon } from "../Icon";

type Props = {
  t: Theme;
  modeLabel: string;
  rangeTitle: string;
  curInfo: string;
  count: number;
  reps: number;
  countWord: string;
  loopPct: number;
  playing: boolean;
  speedLabel: string;
  canStep: boolean;
  bottomInset: number;
  onCycleSpeed: () => void;
  onPrev: () => void;
  onToggle: () => void;
  onNext: () => void;
  onStop: () => void;
};

export function VersePlayerPanel(p: Props) {
  const { t } = p;
  return (
    <View style={[styles.wrap, { backgroundColor: t.surface, borderTopColor: t.line, shadowColor: t.shadow, paddingBottom: 14 + p.bottomInset }]}>
      <View style={[styles.track, { backgroundColor: t.line }]}>
        <View style={{ height: 4, width: `${Math.round(Math.min(1, p.loopPct) * 100)}%`, backgroundColor: t.accent }} />
      </View>
      <View style={styles.info}>
        <View style={styles.infoLeft}>
          <Text style={[styles.mode, { color: t.muted }]}>{p.modeLabel.toUpperCase()}</Text>
          <Text style={[styles.range, { color: t.ink }]}>{p.rangeTitle}</Text>
          <Text numberOfLines={1} style={[styles.cur, { color: t.muted }]}>{p.curInfo}</Text>
        </View>
        <View style={styles.infoRight}>
          <View style={styles.countRow}>
            <Text style={[styles.count, { color: t.accent }]}>{p.count}</Text>
            <Text style={[styles.reps, { color: t.muted }]}>/{p.reps}</Text>
          </View>
          <Text style={[styles.countWord, { color: t.muted }]}>{p.countWord}</Text>
        </View>
      </View>
      <View style={styles.buttons}>
        <Pressable accessibilityLabel={`Changer la vitesse, actuellement ${p.speedLabel}`} onPress={p.onCycleSpeed} style={[styles.pill, { borderColor: t.line }]}>
          <Text style={[styles.speed, { color: t.ink }]}>{p.speedLabel}</Text>
        </Pressable>
        <Pressable accessibilityLabel="Vers précédent" disabled={!p.canStep} onPress={p.onPrev} style={[styles.skip, { opacity: p.canStep ? 1 : 0.3 }]}>
          <Icon name="prev" size={22} color={t.ink} />
        </Pressable>
        <Pressable accessibilityLabel={p.playing ? "Pause" : "Reprendre"} onPress={p.onToggle} style={[styles.main, { backgroundColor: t.accent }]}>
          <Icon name={p.playing ? "pause" : "play"} size={26} color={t.accentInk} />
        </Pressable>
        <Pressable accessibilityLabel="Vers suivant" disabled={!p.canStep} onPress={p.onNext} style={[styles.skip, { opacity: p.canStep ? 1 : 0.3 }]}>
          <Icon name="next" size={22} color={t.ink} />
        </Pressable>
        <Pressable accessibilityLabel="Arrêter et modifier la plage" onPress={p.onStop} style={[styles.pill, { borderColor: t.line }]}>
          <Icon name="stop" size={16} color={t.ink} />
        </Pressable>
      </View>
      <View style={styles.foot}>
        <Text style={[styles.footText, { color: t.muted }]}>{p.playing ? "En lecture" : "En pause"}</Text>
        <Text style={[styles.footText, { color: t.muted }]}>Le carré arrête et revient au réglage</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, borderTopWidth: StyleSheet.hairlineWidth, elevation: 12, shadowOpacity: 1, shadowRadius: 14, shadowOffset: { width: 0, height: -10 } },
  track: { height: 4, marginHorizontal: -16 },
  info: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", columnGap: 12, paddingTop: 12 },
  infoLeft: { flex: 1, minWidth: 0 },
  mode: { fontFamily: FONT.sansMedium, fontSize: 11, letterSpacing: 0.9 },
  range: { fontFamily: FONT.sansSemi, fontSize: 18, fontVariant: ["tabular-nums"] },
  cur: { fontFamily: FONT.sans, fontSize: 12, fontVariant: ["tabular-nums"] },
  infoRight: { alignItems: "flex-end" },
  countRow: { flexDirection: "row", alignItems: "baseline", columnGap: 2 },
  count: { fontFamily: FONT.sansSemi, fontSize: 34, lineHeight: 36, fontVariant: ["tabular-nums"] },
  reps: { fontFamily: FONT.sans, fontSize: 17, fontVariant: ["tabular-nums"] },
  countWord: { fontFamily: FONT.sans, fontSize: 12 },
  buttons: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 10 },
  pill: { width: 60, height: 44, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  speed: { fontFamily: FONT.sansSemi, fontSize: 14, fontVariant: ["tabular-nums"] },
  skip: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  main: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  foot: { flexDirection: "row", justifyContent: "space-between", paddingTop: 8 },
  footText: { fontFamily: FONT.sans, fontSize: 12 },
});
