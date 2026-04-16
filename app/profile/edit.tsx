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
  SecondaryButton,
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

export default function EditProfileScreen() {
  const { session, profile, updateProfile } = useAppState();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { control, handleSubmit, reset, setValue, watch } = useForm<ProfileFormValues>({
    defaultValues: getDefaultProfileFormValues(profile),
  });

  const primarySport = watch("primarySport");
  const secondarySports = watch("secondarySports");

  if (!session) {
    return <Redirect href="/auth" />;
  }

  if (!profile) {
    return <Redirect href="/onboarding" />;
  }

  const toggleSecondarySport = (sport: Sport) => {
    const current = secondarySports ?? [];
    setValue("secondarySports", toggleSecondarySportSelection(current, sport));
  };

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      const parsed = profileSchema.parse(values);
      await updateProfile(buildAthleteProfile(parsed));
      router.back();
    } catch (error) {
      console.error("Profile update failed", error);
      setSubmitError("Profile could not be saved. Check the form and try again.");
    }
  });

  return (
    <Screen>
      <KeyboardAwareScrollView contentContainerStyle={styles.content}>
        <FadeInView delay={40}>
          <SectionTitle
            eyebrow="Profile"
            title="Edit training profile"
            subtitle="Keep the synced profile aligned with your current sport focus, weight, and constraints."
          />
        </FadeInView>

        <FadeInView delay={100}>
          <Card style={styles.formCard}>
            <Text style={styles.groupLabel}>Account email</Text>
            <Text style={styles.readOnlyValue}>{profile.email}</Text>
            <Text style={styles.helper}>
              Email comes from auth. Profile edits here only change training data.
            </Text>
          </Card>
        </FadeInView>

        <FadeInView delay={160}>
          <Card style={styles.formCard}>
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

        <FadeInView delay={220}>
          <Card style={styles.formCard}>
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
            <PrimaryButton label="Save profile" onPress={submit} />
            <SecondaryButton
              label="Reset form"
              onPress={() => {
                setSubmitError(null);
                reset(getDefaultProfileFormValues(profile));
              }}
            />
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
  formCard: {
    gap: spacing.md,
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
  helper: {
    color: colors.textMuted,
    lineHeight: 20,
  },
  readOnlyValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  submitError: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 20,
  },
});
