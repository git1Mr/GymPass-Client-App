// app/(tabs)/profile.tsx
// Top: avatar + username + email + Edit Info button.
// Scrollable body: expandable/navigatable themed sections.

import {
    COLORS,
    FONT_SIZES,
    FONT_WEIGHTS,
    RADIUS,
    SHADOWS,
    SPACING,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ── Types ──────────────────────────────────────────────────────────────────
type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface RowItem {
  label: string;
  icon: IoniconsName;
  onPress?: () => void;
  toggle?: boolean;
  value?: boolean;
  onToggle?: (v: boolean) => void;
  danger?: boolean;
}

interface Section {
  id: string;
  title: string;
  icon: IoniconsName;
  rows: RowItem[];
}

// ── Row component ──────────────────────────────────────────────────────────
function ProfileRow({ row }: { row: RowItem }) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={row.onPress}
      activeOpacity={row.toggle ? 1 : 0.7}
      disabled={!row.onPress && !row.toggle}
    >
      <View style={[styles.rowIconWrap, row.danger && styles.rowIconDanger]}>
        <Ionicons
          name={row.icon}
          size={18}
          color={row.danger ? COLORS.error : COLORS.accent}
        />
      </View>
      <Text style={[styles.rowLabel, row.danger && { color: COLORS.error }]}>
        {row.label}
      </Text>
      <View style={styles.rowRight}>
        {row.toggle ? (
          <Switch
            value={row.value}
            onValueChange={row.onToggle}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={row.value ? COLORS.accent : COLORS.white}
          />
        ) : (
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );
}

// ── Collapsible section ────────────────────────────────────────────────────
function ProfileSection({ section }: { section: Section }) {
  const [open, setOpen] = useState(true);

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.7}
      >
        <View style={styles.sectionTitleRow}>
          <Ionicons name={section.icon} size={16} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
        <Ionicons
          name={open ? "chevron-down" : "chevron-up"}
          size={16}
          color={COLORS.textMuted}
        />
      </TouchableOpacity>

      {open && (
        <View style={styles.sectionBody}>
          {section.rows.map((row, i) => (
            <React.Fragment key={row.label}>
              <ProfileRow row={row} />
              {i < section.rows.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      )}
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  const username = user?.name ?? "Member";
  const email = user?.email ?? "—";
  const initials = username
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const SECTIONS: Section[] = [
    {
      id: "general",
      title: "General",
      icon: "settings-outline",
      rows: [
        { label: "Profile", icon: "person-outline", onPress: () => {} },
        { label: "My Address", icon: "location-outline", onPress: () => {} },
        { label: "Language", icon: "language-outline", onPress: () => {} },
        {
          label: "Dark Mode",
          icon: "moon-outline",
          toggle: true,
          value: darkMode,
          onToggle: setDarkMode,
        },
      ],
    },
    {
      id: "club",
      title: "My Club",
      icon: "barbell-outline",
      rows: [
        { label: "Find Club", icon: "search-outline", onPress: () => {} },
        {
          label: "Club Details",
          icon: "information-circle-outline",
          onPress: () => {},
        },
        { label: "Check-in History", icon: "time-outline", onPress: () => {} },
        {
          label: "Schedule a Class",
          icon: "calendar-outline",
          onPress: () => {},
        },
      ],
    },
    {
      id: "perks",
      title: "Perks",
      icon: "star-outline",
      rows: [
        { label: "Loyalty & Rewards", icon: "gift-outline", onPress: () => {} },
      ],
    },
    {
      id: "settings",
      title: "Settings",
      icon: "cog-outline",
      rows: [
        {
          label: "Account Preferences",
          icon: "options-outline",
          onPress: () => {},
        },
      ],
    },
    {
      id: "support",
      title: "Support",
      icon: "help-circle-outline",
      rows: [
        {
          label: "About ",
          icon: "information-outline",
          onPress: () => {},
        },
        {
          label: "General Conditions",
          icon: "document-text-outline",
          onPress: () => {},
        },
        { label: "Privacy Policy", icon: "shield-outline", onPress: () => {} },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar card ── */}
        <View style={styles.avatarCard}>
          {/* Decorative blob */}
          <View style={styles.avatarBlob} />

          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>

          <Text style={styles.userName}>{username}</Text>
          <Text style={styles.userEmail}>{email}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.pointsBadge}>
              <Ionicons name="flash" size={14} color={COLORS.accent} />
              <Text style={styles.pointsBadgeText}>
                {user?.pointsBalance ?? 0} pts
              </Text>
            </View>
            <View style={[styles.pointsBadge, styles.roleBadge]}>
              <Ionicons
                name="shield-checkmark-outline"
                size={14}
                color={COLORS.primary}
              />
              <Text style={[styles.pointsBadgeText, { color: COLORS.primary }]}>
                {user?.role ?? "Member"}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
            <Ionicons name="create-outline" size={16} color={COLORS.white} />
            <Text style={styles.editBtnText}>Edit Info</Text>
          </TouchableOpacity>
        </View>

        {/* ── Sections ── */}
        {SECTIONS.map((section) => (
          <ProfileSection key={section.id} section={section} />
        ))}

        {/* ── Sign out ── */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={signOut}
          activeOpacity={0.75}
        >
          <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionNote}>
          GymPass v1.0.0 · Made with ♥ in Morocco
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  pageHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pageTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.text,
  },

  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },

  // Avatar card
  avatarCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: "center",
    marginBottom: SPACING.lg,
    overflow: "hidden",
    ...SHADOWS.card,
  },
  avatarBlob: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.accent,
    opacity: 0.2,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarInitials: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.white,
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    opacity: 0.75,
    marginBottom: SPACING.md,
  },
  badgeRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  roleBadge: {},
  pointsBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.accent,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
  },
  editBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },

  // Sections
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surfaceElevated,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sectionBody: {},

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    gap: SPACING.sm,
  },
  rowIconWrap: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accentMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  rowIconDanger: { backgroundColor: "#FFE9E8" },
  rowLabel: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.medium,
  },
  rowRight: {},
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: SPACING.md + 34 + SPACING.sm,
  },

  // Sign out
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: "#FFF0F0",
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  signOutText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.error,
  },

  versionNote: {
    textAlign: "center",
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.lg,
  },
});
