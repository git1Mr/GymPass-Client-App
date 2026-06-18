import AccessAnyGym from "@/components/AccessAnyGym";
import { COLORS, FONTS, FONT_SIZES } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface TabItemProps {
  name: IoniconsName;
  label: string;
  focused: boolean;
}

// CaFit tab grammar: the active tab swaps its icon for a bold label with a
// small brand dot underneath; inactive tabs are dim icons only.
function TabItem({ name, label, focused }: TabItemProps) {
  if (!focused) {
    return (
      <View style={styles.item}>
        <Ionicons name={name} size={23} color={COLORS.tabInactive} />
      </View>
    );
  }
  return (
    <View style={styles.item}>
      <Text style={styles.activeLabel} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.activeDot} />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  // Bake insets.bottom into the height so the tab bar never overlaps
  // the Android gesture bar or iPhone home indicator.
  const TAB_CONTENT_HEIGHT = 64;
  const tabBarHeight = TAB_CONTENT_HEIGHT + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          // Deep-purple bar with a faint top hairline separating it from the
          // aurora canvas; the violet FAB floats above it.
          backgroundColor: COLORS.tabBar,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          elevation: 0,
          height: tabBarHeight,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 12,
        },
        tabBarActiveTintColor: COLORS.tabActive,
        tabBarInactiveTintColor: COLORS.tabInactive,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabItem name="home-outline" label="Accueil" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explorer",
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabItem name="map-outline" label="Explorer" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          // Center slot: the floating QR FAB replaces the navigation button
          // entirely — it opens the check-in modal, never the route.
          tabBarButton: () => (
            <View style={styles.fabSlot} pointerEvents="box-none">
              <AccessAnyGym variant="fab" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: "Forfaits",
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabItem name="flash-outline" label="Forfaits" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabItem name="person-outline" label="Profil" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  item: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 64,
  },
  activeLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.tabActive,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
  fabSlot: {
    flex: 1,
    alignItems: "center",
    // Pull the FAB up so it floats half outside the bar, CaFit-style.
    marginTop: -26,
  },
});
