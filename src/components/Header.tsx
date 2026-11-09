import { Pressable, StyleSheet, Text, View } from "react-native";
import { FONT, Theme, ThemeName } from "../theme";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

type Props = {
  t: Theme;
  theme: ThemeName;
  onToggleTheme: () => void;
  onOpenDownloads?: () => void;
  downloadsBusy?: boolean;
  showLogo?: boolean;
  kicker?: string;
  titleAr?: string;
  subtitle: string;
  onBack?: () => void;
};

export function Header({ t, theme, onToggleTheme, onOpenDownloads, downloadsBusy, showLogo, kicker, titleAr, subtitle, onBack }: Props) {
  return (
    <View style={styles.header}>
      {onBack && (
        <Pressable accessibilityLabel="Retour à la liste des textes" onPress={onBack} style={styles.back}>
          <Icon name="back" size={22} color={t.ink} />
        </Pressable>
      )}
      <View style={styles.titles}>
        {showLogo ? (
          <View style={styles.logo}>
            <Logo theme={theme} width={200} />
          </View>
        ) : (
          <>
            <Text style={[styles.kicker, { color: t.muted }]}>{kicker}</Text>
            <Text style={[styles.ar, { color: t.ink }]}>{titleAr}</Text>
          </>
        )}
        <Text style={[styles.sub, { color: t.muted }]}>{subtitle}</Text>
      </View>
      <View style={styles.actions}>
        {onOpenDownloads && (
          <Pressable
            accessibilityLabel={downloadsBusy ? "Téléchargements (en cours)" : "Téléchargements"}
            onPress={onOpenDownloads}
            style={[styles.round, { borderColor: t.line, backgroundColor: t.surface }]}
          >
            <Icon name="download" size={20} color={t.ink} />
            {downloadsBusy && <View style={[styles.dot, { backgroundColor: t.accent, borderColor: t.surface }]} />}
          </Pressable>
        )}
        <Pressable
          accessibilityLabel={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
          onPress={onToggleTheme}
          style={[styles.round, { borderColor: t.line, backgroundColor: t.surface }]}
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} size={20} color={t.ink} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", columnGap: 12, paddingTop: 20, paddingBottom: 8, paddingLeft: 18, paddingRight: 16 },
  back: { width: 44, height: 44, marginLeft: -12, marginRight: -6, alignItems: "center", justifyContent: "center" },
  titles: { flex: 1, minWidth: 0, rowGap: 2 },
  logo: { paddingTop: 4, paddingBottom: 2, alignSelf: "flex-start" },
  kicker: { fontFamily: FONT.sansMedium, fontSize: 11, letterSpacing: 1.5 },
  ar: { alignSelf: "flex-start", fontFamily: FONT.arabic, fontSize: 30, lineHeight: 42, writingDirection: "rtl" },
  sub: { fontFamily: FONT.sans, fontSize: 13 },
  actions: { flexDirection: "row", columnGap: 8 },
  round: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", top: 8, right: 8, width: 11, height: 11, borderRadius: 6, borderWidth: 2 },
});
