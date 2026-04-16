import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { KeyboardAwareScrollView } from "@/components/keyboard-aware-scroll-view";
import {
  Card,
  Field,
  LabelValue,
  Pill,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionTitle,
} from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { useAppState } from "@/providers/app-provider";

export default function ProfileScreen() {
  const {
    profile,
    repositoryMode,
    syncStatus,
    syncError,
    resetAll,
    signOut,
    updatePassword,
  } = useAppState();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  if (!profile) {
    return <Screen />;
  }

  const handlePasswordUpdate = async () => {
    if (password.length < 6) {
      setPasswordMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== passwordConfirmation) {
      setPasswordMessage("Passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordMessage("Saving password...");

    try {
      await updatePassword(password);
      setPassword("");
      setPasswordConfirmation("");
      setPasswordMessage("Password saved. You can now sign in with email and password.");
    } catch (error) {
      console.error("Password update failed", error);
      setPasswordMessage("Password could not be saved. Try again.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <Screen>
      <KeyboardAwareScrollView contentContainerStyle={styles.content}>
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
          {syncError ? <Text style={styles.helper}>Sync failed, please try again.</Text> : null}
        </Card>

        {repositoryMode === "supabase" ? (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Password login</Text>
            <Text style={styles.helper}>
              Set a password so you can sign back in without waiting for another magic link.
            </Text>
            <Field
              label="New password"
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              textContentType="newPassword"
            />
            <Field
              label="Confirm password"
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
              placeholder="Repeat password"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              textContentType="newPassword"
            />
            {passwordMessage ? <Text style={styles.helper}>{passwordMessage}</Text> : null}
            <PrimaryButton
              label={isUpdatingPassword ? "Saving password..." : "Save password"}
              onPress={() => void handlePasswordUpdate()}
              disabled={isUpdatingPassword}
            />
          </Card>
        ) : null}

        <SecondaryButton label="Edit profile" onPress={() => router.push("/profile/edit")} />
        <SecondaryButton label="Reset profile and start over" onPress={() => void resetAll()} />
        <SecondaryButton label="Sign out" onPress={() => void signOut()} />
      </KeyboardAwareScrollView>
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
