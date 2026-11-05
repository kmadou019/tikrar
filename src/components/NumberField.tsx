import { useState } from "react";
import { StyleProp, StyleSheet, TextInput, TextStyle } from "react-native";

type Props = {
  value: number;
  min: number;
  max: number;
  onCommit: (n: number) => void;
  label: string;
  style?: StyleProp<TextStyle>;
  color: string;
};

// Champ numérique : on tape librement, la valeur est validée (bornée) quand le champ perd le focus.
// `text` n'existe que pendant la saisie ; sinon le champ affiche toujours la valeur courante.
export function NumberField({ value, min, max, onCommit, label, style, color }: Props) {
  const [text, setText] = useState<string | null>(null);

  const commit = () => {
    const n = parseInt(text ?? "", 10);
    setText(null);
    if (Number.isNaN(n)) return;
    const clamped = Math.max(min, Math.min(max, n));
    if (clamped !== value) onCommit(clamped);
  };

  return (
    <TextInput
      accessibilityLabel={label}
      value={text ?? String(value)}
      onFocus={() => setText(String(value))}
      onChangeText={(v) => setText(v.replace(/[^0-9]/g, ""))}
      onEndEditing={commit}
      onSubmitEditing={commit}
      keyboardType="number-pad"
      selectTextOnFocus
      maxLength={String(max).length}
      style={[styles.input, { color }, style]}
    />
  );
}

const styles = StyleSheet.create({
  input: { padding: 0, textAlign: "center" },
});
