import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Line,
  Pattern,
  Rect,
  Stop,
} from "react-native-svg";

interface GradientSurfaceProps {
  radius?: number;
  dimmer?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export default function GradientSurface({
  radius = 22,
  dimmer = 0,
  style,
  children,
}: GradientSurfaceProps): React.ReactElement {
  return (
    <View
      style={[
        styles.shell,
        {
          borderRadius: radius,
        },
        style,
      ]}
    >
      <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        <Defs>
          <SvgLinearGradient
            id="gs-base"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <Stop offset="0"    stopColor="#3C0008" />
            <Stop offset="0.32" stopColor="#2A0820" />
            <Stop offset="0.72" stopColor="#5A4D85" />
            <Stop offset="1"    stopColor="#9f99c7" />
          </SvgLinearGradient>
          <Pattern
            id="gs-hatch"
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(45)"
          >
            <Line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1.4"
            />
          </Pattern>
          <Pattern
            id="gs-hatch2"
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(-45)"
          >
            <Line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              stroke="rgba(255,255,255,0.025)"
              strokeWidth="1.2"
            />
          </Pattern>
          {dimmer > 0 && (
            <SvgLinearGradient id="gs-dim" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#000000" stopOpacity="0" />
              <Stop offset="0.55" stopColor="#000000" stopOpacity="0" />
              <Stop offset="1" stopColor="#000000" stopOpacity={String(dimmer)} />
            </SvgLinearGradient>
          )}
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#gs-base)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#gs-hatch)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#gs-hatch2)" />
        {dimmer > 0 && (
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#gs-dim)" />
        )}
      </Svg>

      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    shadowColor: "#3C0008",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 6,
  },
  inner: {
    position: "relative",
    zIndex: 1,
  },
});
