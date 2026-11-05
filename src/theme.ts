export type ThemeName = "light" | "dark";

export type Theme = {
  bg: string; surface: string; line: string; ink: string; muted: string; shadow: string;
  disabledBg: string; disabledInk: string; accent: string; accentInk: string; tint: string;
};

const BASE = {
  light: { bg: "#F5F2EA", surface: "#FBFAF6", line: "#E1DCCF", ink: "#1D2320", muted: "#5A615C", shadow: "rgba(30,35,32,0.07)", disabledBg: "#E7E3D9", disabledInk: "#5A5F5A" },
  dark: { bg: "#101412", surface: "#171C19", line: "#29302C", ink: "#E9E5DB", muted: "#A2A9A2", shadow: "rgba(0,0,0,0.4)", disabledBg: "#222824", disabledInk: "#9CA39B" },
};

const ACCENT = {
  light: { accent: "#3B6852", accentInk: "#FFFFFF", tint: "#E2EBE3" },
  dark: { accent: "#8DBDA2", accentInk: "#0E1D16", tint: "#1C2923" },
};

export const THEMES: Record<ThemeName, Theme> = {
  light: { ...BASE.light, ...ACCENT.light },
  dark: { ...BASE.dark, ...ACCENT.dark },
};

export const FONT = {
  sans: "IBMPlexSans_400Regular",
  sansMedium: "IBMPlexSans_500Medium",
  sansSemi: "IBMPlexSans_600SemiBold",
  arabic: "Amiri_700Bold",
};
