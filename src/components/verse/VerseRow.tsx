import { Pressable, StyleSheet, Text, View } from "react-native";
import { FONT, Theme } from "../../theme";

type Props = {
  t: Theme;
  n: number;
  dur: string;
  text?: [string, string];
  inRange: boolean;
  isEdge: boolean; // premier ou dernier vers de la plage
  isFirst: boolean;
  isLast: boolean;
  isCur: boolean;
  onPress: () => void;
};

export function VerseRow({ t, n, dur, text, inRange, isEdge, isFirst, isLast, isCur, onPress }: Props) {
  const strong = isEdge || isCur;
  const top = inRange ? (isFirst ? 14 : 0) : 14;
  const bottom = inRange ? (isLast ? 14 : 0) : 14;
  return (
    <View style={styles.item}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: inRange }}
        accessibilityLabel={`Vers ${n}, ${dur}${isCur ? ", en cours de lecture" : ""}`}
        onPress={onPress}
        style={[
          styles.row,
          {
            paddingVertical: text ? 10 : 8,
            paddingRight: text ? 12 : 14,
            borderTopLeftRadius: top,
            borderTopRightRadius: top,
            borderBottomLeftRadius: bottom,
            borderBottomRightRadius: bottom,
            borderBottomColor: inRange ? "transparent" : t.line,
            backgroundColor: isCur ? t.now : inRange ? t.tint : "transparent",
          },
        ]}
      >
        <View style={[styles.num, { paddingTop: text ? 4 : 0 }]}>
          <View
            style={[
              styles.circle,
              {
                borderColor: strong || inRange ? t.accent : t.line,
                backgroundColor: strong ? t.accent : "transparent",
              },
            ]}
          >
            <Text style={[styles.circleText, { color: strong ? t.accentInk : inRange ? t.accent : t.muted }]}>{n}</Text>
          </View>
          {text && <Text style={[styles.under, { color: t.muted }]}>{dur}</Text>}
        </View>
        {text ? (
          <View style={styles.verse}>
            <Text style={[styles.h1, { color: t.ink }]}>{text[0]}</Text>
            <Text style={[styles.h2, { color: t.ink }]}>{text[1]}</Text>
          </View>
        ) : (
          <View style={styles.plain}>
            <Text style={[styles.plainTitle, { color: t.ink }]}>Vers {n}</Text>
            <View style={styles.plainRight}>
              {isCur && <Text style={[styles.cur, { color: t.accent }]}>en cours</Text>}
              <Text style={[styles.plainDur, { color: t.muted }]}>{dur}</Text>
            </View>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { marginHorizontal: 8 },
  row: { flexDirection: "row", columnGap: 8, paddingLeft: 4, borderBottomWidth: StyleSheet.hairlineWidth },
  num: { width: 44, alignItems: "center", rowGap: 4 },
  circle: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  circleText: { fontFamily: FONT.sansSemi, fontSize: 13, fontVariant: ["tabular-nums"] },
  under: { fontFamily: FONT.sans, fontSize: 11, fontVariant: ["tabular-nums"] },
  verse: { flex: 1, minWidth: 0 },
  h1: { fontFamily: FONT.arabic, fontSize: 21, lineHeight: 36, writingDirection: "rtl", textAlign: "right" },
  h2: { fontFamily: FONT.arabic, fontSize: 21, lineHeight: 36, writingDirection: "rtl", textAlign: "left" },
  plain: { flex: 1, minHeight: 34, flexDirection: "row", alignItems: "center", justifyContent: "space-between", columnGap: 8 },
  plainTitle: { fontFamily: FONT.sansMedium, fontSize: 15 },
  plainRight: { flexDirection: "row", alignItems: "center", columnGap: 8 },
  cur: { fontFamily: FONT.sansSemi, fontSize: 12 },
  plainDur: { fontFamily: FONT.sans, fontSize: 13, fontVariant: ["tabular-nums"] },
});
