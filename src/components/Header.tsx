import { Pressable, StyleSheet, Text, View } from "react-native";
import { FONT, Theme, ThemeName } from "../theme";
import { Icon } from "./Icon";

type Props = {
  t: Theme;
  theme: ThemeName;
  onToggleTheme: () => void;
  kicker: string;
  titleAr: string;
  subtitle: string;
  onBack?: () => void;
};

export function Header({ t, theme, onToggleTheme, kicker, titleAr, subtitle, onBack }: Props) {
  return (
    <View style={styles.header}>
      {onBack && (
        <Pressable accessibilityLabel="Retour à la liste des textes" onPress={onBack} style={styles.back}>
          <Icon name="back" size={22} color={t.ink} />
        </Pressable>
      )}
      <View style={styles.titles}>
        <Text style={[styles.kicker, { color: t.muted }]}>{kicker}</Text>
        <Text style={[styles.ar, { color: t.ink }]}>{titleAr}</Text>
        <Text style={[styles.sub, { color: t.muted }]}>{subtitle}</Text>
      </View>
      <Pressable
        accessibilityLabel={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
        onPress={onToggleTheme}
        style={[styles.theme, { borderColor: t.line, backgroundColor: t.surface }]}
      >
        <Icon name={theme === "dark" ? "sun" : "moon"} size={20} color={t.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", columnGap: 12, paddingTop: 20, paddingBottom: 8, paddingLeft: 18, paddingRight: 16 },
  back: { width: 44, height: 44, marginLeft: -12, marginRight: -6, alignItems: "center", justifyContent: "center" },
  titles: { flex: 1, minWidth: 0, rowGap: 2 },
  kicker: { fontFamily: FONT.sansMedium, fontSize: 11, letterSpacing: 1.5 },
  ar: { alignSelf: "flex-start", fontFamily: FONT.arabic, fontSize: 30, lineHeight: 42, writingDirection: "rtl" },
  sub: { fontFamily: FONT.sans, fontSize: 13 },
  theme: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" },
});
