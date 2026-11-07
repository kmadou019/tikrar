import { Pressable, StyleSheet, Text, View } from "react-native";
import type { PlanMode } from "../../lib/versePlan";
import { FONT, Theme } from "../../theme";
import { Icon } from "../Icon";

type Props = {
  t: Theme;
  lo: number | null;
  hi: number | null;
  mode: PlanMode;
  reps: number;
  rangeInfo: string;
  playSub: string;
  preparing: null | "download" | "decode";
  onStart: () => void;
  onEnd: () => void;
  onReps: () => void;
  onMode: (mode: PlanMode) => void;
  onRepsStep: (delta: number) => void;
  onPlay: () => void;
  bottomInset: number;
};

export function SetupPanel(p: Props) {
  const { t } = p;
  const hasRange = p.lo != null && p.hi != null;
  const n = hasRange ? (p.hi as number) - (p.lo as number) + 1 : 0;
  const rangeBorder = hasRange ? t.accent : t.line;
  const repsTitle = p.mode === "plage" ? "Tours de la plage" : "Répétitions par vers";
  const repsHelp =
    p.mode === "plage"
      ? hasRange && n > 1
        ? `${p.lo} → ${p.hi}, puis retour au ${p.lo}`
        : "Le vers en boucle"
      : hasRange
        ? `${p.lo} × ${p.reps}, puis ${n > 1 ? `${(p.lo as number) + 1} × ${p.reps}…` : "fin"}`
        : "Chaque vers, l’un après l’autre";
  const disabled = !hasRange;

  return (
    <View style={[styles.wrap, { backgroundColor: t.surface, borderTopColor: t.line, shadowColor: t.shadow, paddingBottom: 16 + p.bottomInset }]}>
      <View style={styles.top}>
        <View style={styles.rangeRow}>
          <Text style={[styles.rangeLabel, { color: t.ink }]}>Vers</Text>
          <Pressable
            accessibilityLabel={hasRange ? `Vers de début : ${p.lo}, modifier au clavier` : "Saisir le vers de début"}
            onPress={p.onStart}
            style={[styles.numBtn, { borderColor: rangeBorder, backgroundColor: t.bg }]}
          >
            <Text style={[styles.numText, { color: t.ink }]}>{hasRange ? p.lo : "—"}</Text>
          </Pressable>
          <Icon name="arrow" size={18} color={t.muted} />
          <Pressable
            accessibilityLabel={hasRange ? `Vers de fin : ${p.hi}, modifier au clavier` : "Saisir le vers de fin"}
            onPress={p.onEnd}
            style={[styles.numBtn, { borderColor: rangeBorder, backgroundColor: t.bg }]}
          >
            <Text style={[styles.numText, { color: t.ink }]}>{hasRange ? p.hi : "—"}</Text>
          </Pressable>
        </View>
        <Text style={[styles.info, { color: t.muted }]}>{p.rangeInfo}</Text>
      </View>

      <View accessibilityRole="radiogroup" style={[styles.seg, { backgroundColor: t.bg }]}>
        {(["plage", "chaque"] as PlanMode[]).map((m) => {
          const on = p.mode === m;
          return (
            <Pressable
              key={m}
              accessibilityState={{ selected: on }}
              onPress={() => p.onMode(m)}
              style={[styles.segBtn, { backgroundColor: on ? t.surface : "transparent", shadowColor: t.shadow, shadowOpacity: on ? 1 : 0, elevation: on ? 1 : 0 }]}
            >
              <Icon name={m === "plage" ? "loop" : "rows"} size={16} color={on ? t.accent : t.muted} />
              <Text style={[styles.segText, { color: on ? t.accent : t.muted }]}>{m === "plage" ? "La plage en boucle" : "Chaque vers N fois"}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.repsRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.repsTitle, { color: t.ink }]}>{repsTitle}</Text>
          <Text style={[styles.repsHelp, { color: t.muted }]}>{repsHelp}</Text>
        </View>
        <View style={styles.stepper}>
          <Pressable accessibilityLabel="Une répétition de moins" onPress={() => p.onRepsStep(-1)} style={[styles.round, { borderColor: t.line }]}>
            <Icon name="minus" size={16} color={t.ink} />
          </Pressable>
          <Pressable
            accessibilityLabel={`Nombre de répétitions : ${p.reps}, modifier au clavier`}
            onPress={p.onReps}
            style={[styles.repsBtn, { borderColor: t.line, backgroundColor: t.bg }]}
          >
            <Text style={[styles.numText, { color: t.ink }]}>{p.reps}</Text>
          </Pressable>
          <Pressable accessibilityLabel="Une répétition de plus" onPress={() => p.onRepsStep(1)} style={[styles.round, { borderColor: t.line }]}>
            <Icon name="plus" size={16} color={t.ink} />
          </Pressable>
        </View>
      </View>

      {p.preparing ? (
        <View style={[styles.play, { backgroundColor: t.disabledBg }]}>
          <Icon name="download" size={18} color={t.accent} />
          <View>
            <Text style={[styles.playTitle, { color: t.ink }]}>{p.preparing === "download" ? "Téléchargement de l’audio…" : "Préparation de l’audio…"}</Text>
            <Text style={[styles.playSub, { color: t.muted }]}>L’écoute démarre dès que c’est prêt</Text>
          </View>
        </View>
      ) : (
        <Pressable disabled={disabled} onPress={p.onPlay} style={[styles.play, { backgroundColor: disabled ? t.disabledBg : t.accent }]}>
          <Icon name="play" size={18} color={disabled ? t.disabledInk : t.accentInk} />
          <View>
            <Text style={[styles.playTitle, { color: disabled ? t.disabledInk : t.accentInk }]}>Écouter</Text>
            <Text style={[styles.playSub, { color: disabled ? t.disabledInk : t.accentInk }]}>{disabled ? "Choisissez d’abord un vers" : p.playSub}</Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 12, paddingHorizontal: 16, rowGap: 10, borderTopWidth: StyleSheet.hairlineWidth, elevation: 12, shadowOpacity: 1, shadowRadius: 14, shadowOffset: { width: 0, height: -10 } },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", columnGap: 10 },
  rangeRow: { flexDirection: "row", alignItems: "center", columnGap: 6 },
  rangeLabel: { fontFamily: FONT.sansSemi, fontSize: 14, marginRight: 2 },
  numBtn: { minWidth: 56, height: 44, borderRadius: 10, borderWidth: 1.5, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  numText: { fontFamily: FONT.sansSemi, fontSize: 18, fontVariant: ["tabular-nums"] },
  info: { flex: 1, textAlign: "right", fontFamily: FONT.sans, fontSize: 12, lineHeight: 16 },
  seg: { flexDirection: "row", padding: 4, columnGap: 4, borderRadius: 14 },
  segBtn: { flex: 1, minHeight: 48, borderRadius: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", columnGap: 6, paddingHorizontal: 6, shadowOffset: { width: 0, height: 1 }, shadowRadius: 3 },
  segText: { fontFamily: FONT.sansSemi, fontSize: 13.5 },
  repsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", columnGap: 10 },
  repsTitle: { fontFamily: FONT.sansMedium, fontSize: 14 },
  repsHelp: { fontFamily: FONT.sans, fontSize: 12 },
  stepper: { flexDirection: "row", alignItems: "center", columnGap: 4 },
  round: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  repsBtn: { minWidth: 68, height: 44, borderRadius: 10, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  play: { minHeight: 56, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", columnGap: 10 },
  playTitle: { fontFamily: FONT.sansSemi, fontSize: 16 },
  playSub: { fontFamily: FONT.sans, fontSize: 12 },
});
