import { Redirect, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { KeyboardAwareScrollView } from "@/components/keyboard-aware-scroll-view";
import {
  Card,
  FadeInView,
  Field,
  Pill,
  PrimaryButton,
  Screen,
  SectionTitle,
} from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import {
  buildAthleteProfile,
  getDefaultProfileFormValues,
  goals,
  levels,
  profileSchema,
  ProfileFormValues,
  sports,
  toggleSecondarySportSelection,
  trainingDays,
} from "@/lib/profile-form";
import { useAppState } from "@/providers/app-provider";
import { Sport } from "@/types/domain";

export default function OnboardingScreen() {
  const { session, completeOnboarding } = useAppState();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { control, handleSubmit, watch, setValue } = useForm<ProfileFormValues>({
    defaultValues: getDefaultProfileFormValues(),
  });

  const primarySport = watch("primarySport");
  const secondarySports = watch("secondarySports");

  const toggleSecondarySport = (sport: Sport) => {
    const current = secondarySports ?? [];
    setValue("secondarySports", toggleSecondarySportSelection(current, sport));
  };

  const submit = handleSubmit(async (values) => {
    const parsed = profileSchema.parse(values);
    setSubmitError(null);

    try {
      await completeOnboarding(buildAthleteProfile(parsed));

      router.replace("/(tabs)");
    } catch (error) {
      console.error("Onboarding persistence failed", error);
      setSubmitError("Setup could not be saved. Please try again.");
    }
  });

  if (!session) {
    return <Redirect href="/auth" />;
  }

  return (
    <Screen>
      <KeyboardAwareScrollView contentContainerStyle={styles.content}>
        <FadeInView delay={40}>
          <View style={styles.hero}>
            <Text style={styles.brand}>Endura Lab</Text>
            <SectionTitle
              eyebrow="Setup"
              title="Performance-first training setup"
              subtitle="Pick your sport, training frequency, and weight-conscious goals. The app will seed a six-week block built for output, not size."
            />
          </View>
        </FadeInView>

        <FadeInView delay={120}>
          <Card style={styles.formCard}>
            <View style={styles.sectionBlock}>
              <Text style={styles.blockTitle}>Account</Text>
              <Text style={styles.blockSubtitle}>
                Keep the intake light for now. Sync comes later.
              </Text>
            </View>

            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Field
                  label="Email"
                  value={field.value}
                  onChangeText={field.onChange}
                  keyboardType="email-address"
                  placeholder="athlete@example.com"
                />
              )}
            />

            <Controller
              control={control}
              name="bodyweightKg"
              render={({ field }) => (
                <Field
                  label="Bodyweight (kg)"
                  value={String(field.value)}
                  onChangeText={field.onChange}
                  keyboardType="numeric"
                  placeholder="75"
                />
              )}
            />
          </Card>
        </FadeInView>

        <FadeInView delay={190}>
          <Card style={styles.formCard}>
            <View style={styles.sectionBlock}>
              <Text style={styles.blockTitle}>Training profile</Text>
              <Text style={styles.blockSubtitle}>
                One primary sport, secondary context only.
              </Text>
            </View>

            <Controller
              control={control}
              name="primarySport"
              render={({ field }) => (
                <View style={styles.group}>
                  <Text style={styles.groupLabel}>Primary sport</Text>
                  <View style={styles.pillRow}>
                    {sports.map((sport) => (
                      <Pill
                        key={sport}
                        label={sport}
                        selected={field.value === sport}
                        onPress={() => field.onChange(sport)}
                      />
                    ))}
                  </View>
                </View>
              )}
            />

            <View style={styles.group}>
              <Text style={styles.groupLabel}>Secondary sports</Text>
              <View style={styles.pillRow}>
                {sports.map((sport) => (
                  <Pill
                    key={sport}
                    label={sport}
                    selected={secondarySports.includes(sport) && sport !== primarySport}
                    onPress={() => toggleSecondarySport(sport)}
                  />
                ))}
              </View>
            </View>

            <Controller
              control={control}
              name="trainingDays"
              render={({ field }) => (
                <View style={styles.group}>
                  <Text style={styles.groupLabel}>Training days per week</Text>
                  <View style={styles.pillRow}>
                    {trainingDays.map((day) => (
                      <Pill
                        key={day}
                        label={`${day} days`}
                        selected={field.value === day}
                        onPress={() => field.onChange(day)}
                      />
                    ))}
                  </View>
                </View>
              )}
            />

            <Controller
              control={control}
              name="experienceLevel"
              render={({ field }) => (
                <View style={styles.group}>
                  <Text style={styles.groupLabel}>Experience level</Text>
                  <View style={styles.pillRow}>
                    {levels.map((level) => (
                      <Pill
                        key={level}
                        label={level}
                        selected={field.value === level}
                        onPress={() => field.onChange(level)}
                      />
                    ))}
                  </View>
                </View>
              )}
            />

            <Controller
              control={control}
              name="goalFocus"
              render={({ field }) => (
                <View style={styles.group}>
                  <Text style={styles.groupLabel}>Primary goal bias</Text>
                  <View style={styles.pillRow}>
                    {goals.map((goal) => (
                      <Pill
                        key={goal}
                        label={goal.replaceAll("_", " ")}
                        selected={field.value === goal}
                        onPress={() => field.onChange(goal)}
                      />
                    ))}
                  </View>
                </View>
              )}
            />
          </Card>
        </FadeInView>

        <FadeInView delay={260}>
          <Card style={styles.formCard}>
            <View style={styles.sectionBlock}>
              <Text style={styles.blockTitle}>Limits and class details</Text>
              <Text style={styles.blockSubtitle}>
                Keep this concise so the plan stays athlete-specific.
              </Text>
            </View>

            {primarySport === "bjj" ? (
              <Controller
                control={control}
                name="bjjWeightClass"
                render={({ field }) => (
                  <Field
                    label="BJJ weight class"
                    value={field.value ?? ""}
                    onChangeText={field.onChange}
                    placeholder="For example: 76 kg / featherweight"
                  />
                )}
              />
            ) : null}

            <Controller
              control={control}
              name="injuryNotes"
              render={({ field }) => (
                <Field
                  label="Injury or limitation notes"
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                  placeholder="Low back tightness, shoulder flare-ups, knee history..."
                  multiline
                />
              )}
            />

            {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
            <PrimaryButton label="Build my plan" onPress={submit} />
          </Card>
        </FadeInView>
      </KeyboardAwareScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  hero: {
    gap: 8,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  brand: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  formCard: {
    gap: spacing.md,
  },
  sectionBlock: {
    gap: 4,
  },
  blockTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  blockSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  group: {
    gap: spacing.sm,
  },
  groupLabel: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  submitError: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
});
