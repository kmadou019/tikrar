import { SvgXml } from "react-native-svg";
import { LOGO_DARK, LOGO_LIGHT, LOGO_RATIO } from "../assets/logo";
import type { ThemeName } from "../theme";

type Props = { theme: ThemeName; width: number };

export function Logo({ theme, width }: Props) {
  return <SvgXml xml={theme === "dark" ? LOGO_DARK : LOGO_LIGHT} width={width} height={Math.round(width * LOGO_RATIO)} />;
}
