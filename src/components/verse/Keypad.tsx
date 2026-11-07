import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { FONT, Theme } from "../../theme";
import { Icon } from "../Icon";

type Props = {
  t: Theme;
  visible: boolean;
  title: string;
  max: number;
  initial: string;
  bottomInset: number;
  onClose: () => void;
  onConfirm: (value: number) => void;
};

// Clavier numérique en bas d'écran, pour saisir un numéro de vers ou un nombre de répétitions.
export function Keypad({ t, visible, title, max, initial, bottomInset, onClose, onConfirm }: Props) {
  const [text, setText] = useState(initial);
  const [fresh, setFresh] = useState(true);

  // Chaque ouverture repart de la valeur courante : le premier chiffre tapé la remplace.
  const [lastKey, setLastKey] = useState(`${title}|${initial}|${visible}`);
  const key = `${title}|${initial}|${visible}`;
  if (key !== lastKey) {
    setLastKey(key);
    setText(initial);
    setFresh(true);
  }

  const value = text === "" ? null : parseInt(text, 10);
  const bad = value != null && (value < 1 || value > max);
  const ok = value != null && !bad;

  const press = (d: string) => {
    const next = (fresh ? d : text + d).replace(/^0+/, "");
    if (next.length > 3) return;
    setText(next);
    setFresh(false);
  };
  const back = () => {
    setText(text.slice(0, -1));
    setFresh(false);
  };

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable accessibilityLabel="Fermer la saisie" onPress={onClose} style={[styles.scrim, { backgroundColor: t.scrim }]} />
        <View style={[styles.sheet, { backgroundColor: t.surface, paddingBottom: 18 + bottomInset }]}>
          <View style={[styles.grabber, { backgroundColor: t.line }]} />
          <View style={styles.head}>
            <Text style={[styles.title, { color: t.ink }]}>{title}</Text>
            <Text style={[styles.help, { color: bad ? t.danger : t.muted }]}>{bad ? `Entre 1 et ${max}` : `De 1 à ${max}`}</Text>
          </View>
          <View accessibilityLiveRegion="polite" style={[styles.display, { borderColor: bad ? t.danger : t.accent, backgroundColor: t.bg }]}>
            <Text style={[styles.shown, { color: t.ink }]}>{text}</Text>
            <View style={[styles.caret, { backgroundColor: t.accent }]} />
          </View>
          <View style={styles.grid}>
            {digits.map((d) => (
              <Pressable key={d} accessibilityLabel={d} onPress={() => press(d)} style={[styles.key, { backgroundColor: t.bg }]}>
                <Text style={[styles.keyText, { color: t.ink }]}>{d}</Text>
              </Pressable>
            ))}
            <Pressable accessibilityLabel="Effacer" onPress={back} style={styles.key}>
              <Icon name="backspace" size={24} color={t.ink} />
            </Pressable>
            <Pressable accessibilityLabel="0" onPress={() => press("0")} style={[styles.key, { backgroundColor: t.bg }]}>
              <Text style={[styles.keyText, { color: t.ink }]}>0</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Valider"
              disabled={!ok}
              onPress={() => ok && onConfirm(value as number)}
              style={[styles.key, { backgroundColor: ok ? t.accent : t.disabledBg }]}
            >
              <Text style={[styles.keyText, { color: ok ? t.accentInk : t.disabledInk, fontFamily: FONT.sansSemi }]}>OK</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  scrim: { flex: 1 },
  sheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 10, paddingHorizontal: 16, rowGap: 12 },
  grabber: { alignSelf: "center", width: 40, height: 4, borderRadius: 2 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontFamily: FONT.sansSemi, fontSize: 16 },
  help: { fontFamily: FONT.sans, fontSize: 13 },
  display: { height: 64, borderRadius: 14, borderWidth: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", columnGap: 2 },
  shown: { fontFamily: FONT.sansSemi, fontSize: 34, fontVariant: ["tabular-nums"] },
  caret: { width: 2, height: 34 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  key: { width: "31.8%", height: 54, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  keyText: { fontFamily: FONT.sansMedium, fontSize: 22 },
});
