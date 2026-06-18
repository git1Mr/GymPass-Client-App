import React, { useId } from "react";
import { StyleSheet } from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Rect,
  Stop,
} from "react-native-svg";

interface GradientFillProps {
  /** Gradient stops, evenly distributed. */
  colors: readonly string[];
  /** Diagonal by default — matches the kit's light→saturated button sweep. */
  vertical?: boolean;
}

// Absolute-fill linear gradient. The parent must set borderRadius and
// overflow:"hidden"; this only paints the surface (expo-linear-gradient
// isn't a dependency — gradients in this app are all react-native-svg).
export default function GradientFill({
  colors,
  vertical = false,
}: GradientFillProps): React.ReactElement {
  const id = `gf-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
      <Defs>
        <SvgLinearGradient
          id={id}
          x1="0"
          y1="0"
          x2={vertical ? "0" : "1"}
          y2="1"
        >
          {colors.map((c, i) => (
            <Stop
              key={i}
              offset={colors.length === 1 ? 0 : i / (colors.length - 1)}
              stopColor={c}
            />
          ))}
        </SvgLinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
