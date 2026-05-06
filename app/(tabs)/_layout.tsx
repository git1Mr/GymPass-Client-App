// app/(tabs)/_layout.tsx
// Fix: uses useSafeAreaInsets to calculate exact paddingBottom so the tab bar
// never bleeds into the Android gesture/navigation area.

import { COLORS, FONT_SIZES, FONT_WEIGHTS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface TabIconProps {
  name: IoniconsName;
  focused: boolean;
}

function TabIcon({ name, focused }: TabIconProps) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons
        name={name}
        size={24}
        color={focused ? COLORS.tabActive : COLORS.tabInactive}
      />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  // TAB_CONTENT_HEIGHT: visible content area (icons + labels).
  // We add the device's bottom inset on top so the bar never
  // overlaps the Android gesture bar or iPhone home indicator.
  const TAB_CONTENT_HEIGHT = 58;
  const tabBarHeight = TAB_CONTENT_HEIGHT + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.tabBar,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: tabBarHeight,
          // Let the OS control the bottom safe area — do NOT hardcode paddingBottom.
          // Instead we bake insets.bottom into the total height above and add a
          // small visual padding for the label.
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: COLORS.tabActive,
        tabBarInactiveTintColor: COLORS.tabInactive,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon
              name={focused ? "home" : "home-outline"}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon name={focused ? "map" : "map-outline"} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: "Plans",
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon
              name={focused ? "flash" : "flash-outline"}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon
              name={focused ? "person" : "person-outline"}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    marginTop: 2,
  },
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  iconWrapActive: {
    backgroundColor: COLORS.primaryMuted,
  },
});
