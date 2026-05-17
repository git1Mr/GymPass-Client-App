import { Stack } from "expo-router";
import React, { JSX } from "react";

export default function AuthLayout(): JSX.Element {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
