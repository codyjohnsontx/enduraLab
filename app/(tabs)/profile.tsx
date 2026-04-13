import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  Card,
  LabelValue,
  Pill,
  Screen,
  SecondaryButton,
  SectionTitle,
} from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { useAppState } from "@/providers/app-provider";

export default function ProfileScreen() {
  const { profile, repositoryMode, syncStatus, syncError, resetAll, signOut } = useAppState();

  if (!profile) {
    return <Screen />;
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionTitle
          eyebrow="Profile"
          title="Endura Lab settings"
          subtitle="Auth and sync scaffolding are in place. Local preview remains available until the live Supabase project is connected."
        />

        <Card style={styles.card}>
          <LabelValue label="Email" value={profile.email} />
          <LabelValue label="Primary sport" value={profile.primarySport} />
          <LabelValue label="Experience level" value={profile.experienceLevel} />
          <LabelValue label="Training frequency" value={`${profile.trainingDays} days / week`} />
          <LabelValue label="Bodyweight" value={`${profile.bodyweightKg} kg`} />
          {profile.bjjWeightClass ? (
            <LabelValue label="BJJ weight class" value={profile.bjjWeightClass} />
          ) : null}
          {profile.injuryNotes ? (
            <LabelValue label="Limitations" value={profile.injuryNotes} />
          ) : null}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Secondary sports</Text>
          <View style={styles.pillRow}>
            {profile.secondarySports.length ? (
              profile.secondarySports.map((sport) => <Pill key={sport} label={sport} />)
            ) : (
              <Text style={styles.helper}>
                None selected. Keep the plan narrowly focused for this block.
              </Text>
            )}
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Recovery model</Text>
          <Text style={styles.helper}>
            Sleep, soreness, stress, energy, and pain influence how hard the app tells
            you to push. They do not rewrite the block on their own.
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Sync status</Text>
          <Text style={styles.helper}>Mode: {repositoryMode}</Text>
          <Text style={styles.helper}>State: {syncStatus}</Text>
          {syncError ? <Text style={styles.helper}>Latest error: {syncError}</Text> : null}
        </Card>

        <SecondaryButton label="Reset profile and start over" onPress={() => void resetAll()} />
        <SecondaryButton label="Sign out" onPress={() => void signOut()} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    gap: spacing.sm,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  helper: {
    color: colors.textMuted,
    lineHeight: 22,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
