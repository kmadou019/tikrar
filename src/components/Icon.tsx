import Svg, { Circle, Path, Polyline, Rect } from "react-native-svg";

export type IconName = "play" | "pause" | "stop" | "prev" | "next" | "plus" | "minus" | "check" | "moon" | "sun" | "back" | "chevron" | "jump" | "loop" | "rows" | "download" | "backspace" | "arrow";

type Props = { name: IconName; size: number; color: string; strokeWidth?: number };

export function Icon({ name, size, color, strokeWidth = 2 }: Props) {
  const stroke = { fill: "none", stroke: color, strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const fill = { fill: color };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === "play" && <Path d="M8 5.5v13l11-6.5z" {...fill} />}
      {name === "pause" && (
        <>
          <Rect x={6.5} y={5} width={4} height={14} rx={1} {...fill} />
          <Rect x={13.5} y={5} width={4} height={14} rx={1} {...fill} />
        </>
      )}
      {name === "stop" && <Rect x={6} y={6} width={12} height={12} rx={2} {...fill} />}
      {name === "prev" && (
        <>
          <Rect x={5} y={6} width={2.2} height={12} rx={1} {...fill} />
          <Path d="M19 6.5v11L9.5 12z" {...fill} />
        </>
      )}
      {name === "next" && (
        <>
          <Rect x={16.8} y={6} width={2.2} height={12} rx={1} {...fill} />
          <Path d="M5 6.5v11l9.5-5.5z" {...fill} />
        </>
      )}
      {name === "minus" && <Path d="M6 12h12" {...stroke} />}
      {name === "plus" && <Path d="M6 12h12M12 6v12" {...stroke} />}
      {name === "check" && <Polyline points="5 12.5 10 17.5 19 7" {...stroke} />}
      {name === "jump" && <Path d="M9 4 7 20M17 4l-2 16M4.5 9h16M3.5 15h16" {...stroke} />}
      {name === "loop" && (
        <>
          <Path d="M17 2.5 20.5 6 17 9.5" {...stroke} />
          <Path d="M3.5 11.5V10a4 4 0 0 1 4-4h13" {...stroke} />
          <Path d="M7 21.5 3.5 18 7 14.5" {...stroke} />
          <Path d="M20.5 12.5V14a4 4 0 0 1-4 4h-13" {...stroke} />
        </>
      )}
      {name === "rows" && <Path d="M4 6h3M4 12h3M4 18h3M11 6h9M11 12h9M11 18h9" {...stroke} />}
      {name === "download" && <Path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" {...stroke} />}
      {name === "backspace" && (
        <>
          <Path d="M9 5h10.5a1.5 1.5 0 0 1 1.5 1.5v11a1.5 1.5 0 0 1-1.5 1.5H9l-6-7z" {...stroke} strokeWidth={1.9} />
          <Path d="m12 9.5 5 5M17 9.5l-5 5" {...stroke} strokeWidth={1.9} />
        </>
      )}
      {name === "arrow" && <Path d="M5 12h13M13 7l5 5-5 5" {...stroke} />}
      {name === "back" && <Path d="M15 5l-7 7 7 7" {...stroke} />}
      {name === "chevron" && <Path d="M9 5l7 7-7 7" {...stroke} />}
      {name === "moon" && <Path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" {...stroke} strokeWidth={1.8} />}
      {name === "sun" && (
        <>
          <Circle cx={12} cy={12} r={4} {...stroke} strokeWidth={1.8} />
          <Path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" {...stroke} strokeWidth={1.8} />
        </>
      )}
    </Svg>
  );
}
