// React Native port of React Bits' GradientText (web).
//
// Web original uses CSS `background-clip: text` + animated background-position.
// Neither is available in RN, so we reproduce the effect with react-native-svg:
// a wider-than-text linear gradient rect is rendered inside a `<Mask>` shaped
// by the text outline, and its `x` is animated (yoyo or continuous loop).

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from "react-native";
import Svg, {
  Defs,
  G,
  LinearGradient as SvgLinearGradient,
  Mask,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

type Direction = "horizontal" | "vertical";

interface GradientTextProps {
  children: string;
  colors?: string[];
  /** Seconds per half-cycle (yoyo) or per full loop (continuous). */
  animationSpeed?: number;
  direction?: Direction;
  yoyo?: boolean;
  style?: StyleProp<TextStyle>;
}

// 3x — matches the web component's backgroundSize: 300%.
const SCALE = 3;

export default function GradientText({
  children,
  colors = ["#BB9BFF", "#C925AB", "#7C3AED"],
  animationSpeed = 8,
  direction = "horizontal",
  yoyo = true,
  style,
}: GradientTextProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  // Append the first color so the gradient is seamless under continuous loop.
  const stops = useMemo(() => [...colors, colors[0]], [colors]);

  const flat = (StyleSheet.flatten(style) || {}) as TextStyle;
  const fontSize = (flat.fontSize as number) ?? 16;
  const fontWeight = flat.fontWeight != null ? String(flat.fontWeight) : "normal";
  const fontFamily = (flat as { fontFamily?: string }).fontFamily;

  // Unique IDs per instance so multiple GradientTexts on one screen don't collide.
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gradId = `gt-grad-${rawId}`;
  const maskId = `gt-mask-${rawId}`;

  useEffect(() => {
    progress.setValue(0);
    const dur = animationSpeed * 1000;
    const anim = yoyo
      ? Animated.loop(
          Animated.sequence([
            Animated.timing(progress, {
              toValue: 1,
              duration: dur,
              easing: Easing.linear,
              useNativeDriver: false,
            }),
            Animated.timing(progress, {
              toValue: 0,
              duration: dur,
              easing: Easing.linear,
              useNativeDriver: false,
            }),
          ]),
        )
      : Animated.loop(
          Animated.timing(progress, {
            toValue: 1,
            duration: dur,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
        );
    anim.start();
    return () => anim.stop();
  }, [animationSpeed, yoyo, progress]);

  // First render: measure the text using a transparent RN <Text> so the SVG
  // can size itself to the actual rendered glyph metrics.
  if (!size) {
    return (
      <Text
        style={[style, { opacity: 0 }]}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          if (width > 0 && height > 0) {
            setSize({ w: Math.ceil(width), h: Math.ceil(height) });
          }
        }}
      >
        {children}
      </Text>
    );
  }

  const isVertical = direction === "vertical";
  const dim = isVertical ? size.h : size.w;
  const slide = dim * (SCALE - 1);
  const animPos = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-slide, 0],
  });

  // SVG <text> baseline sits on `y`. Approximate baseline at ~80% of the box
  // height so the glyphs visually centre inside the measured RN Text bounds.
  const baselineY = size.h * 0.8;

  return (
    <View style={{ width: size.w, height: size.h }}>
      <Svg width={size.w} height={size.h}>
        <Defs>
          <SvgLinearGradient
            id={gradId}
            x1="0"
            y1="0"
            x2={isVertical ? "0" : "1"}
            y2={isVertical ? "1" : "0"}
          >
            {stops.map((c, i) => (
              <Stop
                key={i}
                offset={i / (stops.length - 1)}
                stopColor={c}
              />
            ))}
          </SvgLinearGradient>

          <Mask id={maskId}>
            <Rect width={size.w} height={size.h} fill="#000" />
            <SvgText
              x={0}
              y={baselineY}
              fontSize={fontSize}
              fontWeight={fontWeight}
              fontFamily={fontFamily}
              fill="#fff"
            >
              {children}
            </SvgText>
          </Mask>
        </Defs>

        <G mask={`url(#${maskId})`}>
          <AnimatedRect
            x={isVertical ? 0 : (animPos as unknown as number)}
            y={isVertical ? (animPos as unknown as number) : 0}
            width={isVertical ? size.w : size.w * SCALE}
            height={isVertical ? size.h * SCALE : size.h}
            fill={`url(#${gradId})`}
          />
        </G>
      </Svg>
    </View>
  );
}
