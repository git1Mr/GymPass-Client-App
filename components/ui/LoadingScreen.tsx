import { COLORS } from "@/constants/theme";
import React, { JSX, useEffect, useRef } from "react";
import { ActivityIndicator, Animated, StyleSheet, View } from "react-native";

export default function LoadingScreen(): JSX.Element {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect((): void => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.glow} />
      <ActivityIndicator size="large" color={COLORS.accent} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.primary,
    opacity: 0.3,
  },
});
