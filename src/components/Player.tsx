import { Pressable, StyleSheet, Text, View } from "react-native";
import { Chapter, fmt } from "../data/chapters";
import { FONT, Theme } from "../theme";
import { Icon } from "./Icon";

type Props = {
  t: Theme;
  chapter: Chapter;
  rep: number;
  repTotal: number;
  playing: boolean;
  loading: boolean;
  progress: number;
  elapsed: number;
  tourLabel: string;
  speedLabel: string;
  bottomInset: number;
  onCycleSpeed: () => void;
  onPrev: () => void;
  onToggle: () => void;
  onNext: () => void;
  onStop: () => void;
};

export function Player(p: Props) {
  const { t, chapter } = p;
  const dots = p.repTotal <= 12 ? Array.from({ length: p.repTotal }, (_, i) => i < p.rep) : [];
  return (
    <View style={[styles.wrap, { backgroundColor: t.surface, borderTopColor: t.line, shadowColor: t.shadow, paddingBottom: 14 + p.bottomInset }]}>
      <View style={[styles.track, { backgroundColor: t.line }]}>
        <View style={{ height: 4, width: `${Math.round(Math.min(1, p.progress) * 100)}%`, backgroundColor: t.accent }} />
      </View>

      <View style={styles.info}>
        <View style={styles.titleCol}>
          <View style={styles.titleRow}>
            <Text style={[styles.curNum, { color: t.accent }]}>{String(chapter.n).padStart(2, "0")}</Text>
            <Text numberOfLines={1} style={[styles.curAr, { color: t.ink }]}>{chapter.ar}</Text>
          </View>
          <Text numberOfLines={1} style={[styles.meta, { color: t.muted }]}>
            {fmt(p.elapsed)} / {fmt(chapter.dur)} · {chapter.fr}
          </Text>
        </View>
        <View style={styles.repCol}>
          <View style={styles.repRow}>
            <Text style={[styles.repLabel, { color: t.muted }]}>RÉPÉTITION</Text>
            <Text style={[styles.rep, { color: t.accent }]}>{p.rep}</Text>
            <Text style={[styles.repTotal, { color: t.muted }]}>/{p.repTotal}</Text>
          </View>
          <View style={styles.dots}>
            {dots.map((on, i) => (
              <View key={i} style={[styles.dot, { backgroundColor: on ? t.accent : t.line }]} />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.statusRow}>
        <Text style={[styles.status, { color: t.muted }]}>{p.loading ? "Téléchargement…" : p.playing ? "En lecture" : "En pause"}</Text>
        <Text style={[styles.tour, { color: t.ink }]}>{p.tourLabel}</Text>
      </View>

      <View style={styles.buttons}>
        <Pressable accessibilityLabel={`Changer la vitesse, actuellement ${p.speedLabel}`} onPress={p.onCycleSpeed} style={[styles.pillBtn, { borderColor: t.line }]}>
          <Text style={[styles.speed, { color: t.ink }]}>{p.speedLabel}</Text>
        </Pressable>
        <Pressable accessibilityLabel="Chapitre précédent" onPress={p.onPrev} style={styles.skip}>
          <Icon name="prev" size={22} color={t.ink} />
        </Pressable>
        <Pressable accessibilityLabel={p.playing ? "Pause" : "Reprendre"} onPress={p.onToggle} style={[styles.main, { backgroundColor: t.accent }]}>
          <Icon name={p.playing ? "pause" : "play"} size={26} color={t.accentInk} />
        </Pressable>
        <Pressable accessibilityLabel="Chapitre suivant" onPress={p.onNext} style={styles.skip}>
          <Icon name="next" size={22} color={t.ink} />
        </Pressable>
        <Pressable accessibilityLabel="Arrêter" onPress={p.onStop} style={[styles.pillBtn, { borderColor: t.line }]}>
          <Icon name="stop" size={16} color={t.ink} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, borderTopWidth: StyleSheet.hairlineWidth, elevation: 12, shadowOpacity: 1, shadowRadius: 14, shadowOffset: { width: 0, height: -10 } },
  track: { height: 4, marginHorizontal: -16 },
  info: { flexDirection: "row", alignItems: "center", columnGap: 12, paddingTop: 12 },
  titleCol: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: "row", alignItems: "baseline", columnGap: 8 },
  curNum: { fontFamily: FONT.sansSemi, fontSize: 12, fontVariant: ["tabular-nums"] },
  curAr: { flexShrink: 1, fontFamily: FONT.arabic, fontSize: 21, lineHeight: 30, writingDirection: "rtl" },
  meta: { fontFamily: FONT.sans, fontSize: 12, fontVariant: ["tabular-nums"] },
  repCol: { alignItems: "flex-end", rowGap: 5 },
  repRow: { flexDirection: "row", alignItems: "baseline", columnGap: 6 },
  repLabel: { fontFamily: FONT.sans, fontSize: 11, letterSpacing: 0.9 },
  rep: { fontFamily: FONT.sansSemi, fontSize: 24, lineHeight: 26, fontVariant: ["tabular-nums"] },
  repTotal: { fontFamily: FONT.sans, fontSize: 15, fontVariant: ["tabular-nums"] },
  dots: { flexDirection: "row", columnGap: 4 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  statusRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 8 },
  status: { fontFamily: FONT.sans, fontSize: 12 },
  tour: { fontFamily: FONT.sansSemi, fontSize: 12 },
  buttons: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 8 },
  pillBtn: { width: 60, height: 44, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  speed: { fontFamily: FONT.sansSemi, fontSize: 14, fontVariant: ["tabular-nums"] },
  skip: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  main: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
});
