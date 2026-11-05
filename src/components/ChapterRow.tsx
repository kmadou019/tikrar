import { Pressable, StyleSheet, Text, View } from "react-native";
import { Chapter, fmt } from "../data/chapters";
import { FONT, Theme } from "../theme";
import { Icon } from "./Icon";
import { Stepper } from "./Stepper";

type Props = {
  t: Theme;
  chapter: Chapter;
  checked: boolean;
  reps: number;
  isActive: boolean;
  isPlaying: boolean;
  currentRep: number;
  cloud?: "missing" | "downloading" | "ready";
  onToggle: () => void;
  onDec: () => void;
  onInc: () => void;
  onSet: (n: number) => void;
  onPlay: () => void;
};

export function ChapterRow({ t, chapter, checked, reps, isActive, isPlaying, currentRep, cloud, onToggle, onDec, onInc, onSet, onPlay }: Props) {
  const num = String(chapter.n).padStart(2, "0");
  return (
    <View style={[styles.row, { borderBottomColor: t.line, backgroundColor: isActive ? t.tint : "transparent" }]}>
      <View style={styles.left}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
          accessibilityLabel={`Sélectionner le chapitre ${chapter.n}`}
          onPress={onToggle}
          style={styles.checkHit}
        >
          <View style={[styles.box, { borderColor: checked ? t.accent : t.muted, backgroundColor: checked ? t.accent : "transparent" }]}>
            {checked && <Icon name="check" size={14} color={t.accentInk} strokeWidth={3} />}
          </View>
        </Pressable>
        <Text style={[styles.num, { color: isActive ? t.accent : t.muted }]}>{num}</Text>
      </View>

      <View style={styles.body}>
        <Text style={[styles.ar, { color: t.ink }]}>{chapter.ar}</Text>
        <Text style={[styles.fr, { color: t.muted }]}>{chapter.fr}</Text>
        <View style={styles.controls}>
          {isActive ? (
            <Text style={[styles.status, { color: t.accent }]}>
              {(isPlaying ? "En lecture" : "En pause") + ` · rép. ${currentRep}/${reps}`}
            </Text>
          ) : (
            <Text style={[styles.dur, { color: t.muted }]}>{fmt(chapter.dur)}{cloud === "missing" ? " · à télécharger" : cloud === "downloading" ? " · téléchargement…" : cloud === "ready" ? " · hors ligne" : ""}</Text>
          )}
          <View style={{ flex: 1 }} />
          <Stepper
            t={t}
            value={reps}
            onDec={onDec}
            onInc={onInc}
            onSet={onSet}
            labelSet={`Nombre de répétitions, chapitre ${chapter.n}`}
            labelDec={`Une répétition de moins, chapitre ${chapter.n}`}
            labelInc={`Une répétition de plus, chapitre ${chapter.n}`}
          />
          <Pressable
            accessibilityLabel={(isPlaying ? "Mettre en pause le chapitre " : "Écouter le chapitre ") + chapter.n}
            onPress={onPlay}
            style={[
              styles.play,
              { borderColor: isActive ? t.accent : t.line, backgroundColor: isActive ? t.accent : "transparent" },
            ]}
          >
            <Icon name={isPlaying ? "pause" : "play"} size={16} color={isActive ? t.accentInk : t.ink} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", paddingVertical: 10, paddingLeft: 8, paddingRight: 16, columnGap: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  left: { width: 44, alignItems: "center" },
  checkHit: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  box: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  num: { fontFamily: FONT.sansSemi, fontSize: 12, fontVariant: ["tabular-nums"] },
  body: { flex: 1, minWidth: 0, paddingTop: 2 },
  ar: { fontFamily: FONT.arabic, fontSize: 24, lineHeight: 37, writingDirection: "rtl", textAlign: "right" },
  fr: { fontFamily: FONT.sans, fontSize: 13, textAlign: "right" },
  controls: { flexDirection: "row", alignItems: "center", columnGap: 8, paddingTop: 4 },
  status: { fontFamily: FONT.sansSemi, fontSize: 12, fontVariant: ["tabular-nums"] },
  dur: { fontFamily: FONT.sans, fontSize: 13, fontVariant: ["tabular-nums"] },
  play: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" },
});
