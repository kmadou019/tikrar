import { Pressable, StyleSheet, Text, View } from "react-native";
import { FONT, Theme } from "../theme";
import { Icon } from "./Icon";
import { NumberField } from "./NumberField";

type Props = {
  t: Theme;
  value: number;
  onDec: () => void;
  onInc: () => void;
  onSet: (n: number) => void;
  labelDec: string;
  labelInc: string;
  labelSet: string;
  buttonWidth?: number;
};

export function Stepper({ t, value, onDec, onInc, onSet, labelDec, labelInc, labelSet, buttonWidth = 44 }: Props) {
  return (
    <View style={[styles.pill, { borderColor: t.line, backgroundColor: t.surface }]}>
      <Pressable accessibilityLabel={labelDec} onPress={onDec} style={[styles.btn, { width: buttonWidth }]}>
        <Icon name="minus" size={16} color={t.ink} />
      </Pressable>
      <View style={styles.valueBox}>
        <Text style={[styles.times, { color: t.ink }]}>×</Text>
        <NumberField value={value} min={1} max={99} onCommit={onSet} label={labelSet} color={t.ink} style={styles.value} />
      </View>
      <Pressable accessibilityLabel={labelInc} onPress={onInc} style={[styles.btn, { width: buttonWidth }]}>
        <Icon name="plus" size={16} color={t.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: "row", alignItems: "center", height: 44, borderWidth: 1, borderRadius: 22 },
  btn: { height: 44, alignItems: "center", justifyContent: "center" },
  valueBox: { flexDirection: "row", alignItems: "center", minWidth: 34, justifyContent: "center" },
  times: { fontFamily: FONT.sansSemi, fontSize: 15 },
  value: { minWidth: 22, height: 44, fontFamily: FONT.sansSemi, fontSize: 15, fontVariant: ["tabular-nums"] },
});
