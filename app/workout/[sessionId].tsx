import { useQuery } from "@tanstack/react-query";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { Control, Controller, useForm } from "react-hook-form";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useEffect } from "react";
import { z } from "zod";

import {
  Card,
  FadeInView,
  Field,
  ListRow,
  Pill,
  PrimaryButton,
  ReadinessPill,
  Screen,
  SectionTitle,
} from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { fetchPlanForProfile } from "@/lib/content";
import { evaluateReadiness } from "@/lib/readiness";
import { useAppState } from "@/providers/app-provider";

const schema = z.object({
  sleepHours: z.coerce.number().min(0).max(12),
  soreness: z.coerce.number().min(1).max(5),
  energy: z.coerce.number().min(1).max(5),
  stress: z.coerce.number().min(1).max(5),
  pain: z.coerce.number().min(1).max(5),
  durationMinutes: z.coerce.number().min(0).max(240),
  perceivedEffort: z.coerce.number().min(1).max(10),
  distanceKm: z.coerce.number().optional(),
  averagePowerWatts: z.coerce.number().optional(),
  roundsCompleted: z.coerce.number().optional(),
  sparringRounds: z.coerce.number().optional(),
  swimDistanceMeters: z.coerce.number().optional(),
  intervalPacePer100m: z.string().optional(),
  waveCount: z.coerce.number().optional(),
  bodyweightKg: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function WorkoutSessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { authReady, session: authSession, profile, logWorkout } = useAppState();
  const { data: plan } = useQuery({
    queryKey: ["plan", profile?.primarySport, profile?.trainingDays],
    queryFn: () => fetchPlanForProfile(profile!),
    enabled: Boolean(profile),
  });

  const trainingSession = plan?.sessions.find((item) => item.id === sessionId);

  const { control, handleSubmit, reset, watch } = useForm<FormValues>({
    defaultValues: {
      sleepHours: 7,
      soreness: 2,
      energy: 4,
      stress: 2,
      pain: 1,
      durationMinutes: trainingSession?.durationMinutes ?? 45,
      perceivedEffort: 7,
      notes: "",
      bodyweightKg: profile?.bodyweightKg,
    },
  });

  useEffect(() => {
    if (!trainingSession) {
      return;
    }

    reset((currentValues) => ({
      ...currentValues,
      durationMinutes: trainingSession.durationMinutes,
      bodyweightKg: currentValues.bodyweightKg ?? profile?.bodyweightKg,
    }));
  }, [profile?.bodyweightKg, reset, trainingSession]);

  if (!authReady) {
    return (
      <Screen>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator color={colors.primaryDark} size="large" />
        </View>
      </Screen>
    );
  }

  if (authReady && !authSession) {
    return <Redirect href="/auth" />;
  }

  if (!profile || !trainingSession) {
    return <Screen />;
  }

  const readiness = evaluateReadiness({
    sleepHours: Number(watch("sleepHours")),
    soreness: Number(watch("soreness")),
    energy: Number(watch("energy")),
    stress: Number(watch("stress")),
    pain: Number(watch("pain")),
  });

  const submit = handleSubmit((values) => {
    const parsed = schema.parse(values);

    void logWorkout({
      sessionId: trainingSession.id,
      sport: trainingSession.sport,
      readiness: {
        sleepHours: parsed.sleepHours,
        soreness: parsed.soreness,
        energy: parsed.energy,
        stress: parsed.stress,
        pain: parsed.pain,
        level: readiness.level,
      },
      metrics: {
        durationMinutes: parsed.durationMinutes,
        perceivedEffort: parsed.perceivedEffort,
        distanceKm: parsed.distanceKm,
        averagePowerWatts: parsed.averagePowerWatts,
        roundsCompleted: parsed.roundsCompleted,
        sparringRounds: parsed.sparringRounds,
        swimDistanceMeters: parsed.swimDistanceMeters,
        intervalPacePer100m: parsed.intervalPacePer100m,
        waveCount: parsed.waveCount,
        bodyweightKg: parsed.bodyweightKg,
      },
      notes: parsed.notes,
    });

    router.replace("/(tabs)");
  });

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <FadeInView delay={40}>
          <View style={styles.header}>
            <SectionTitle
              eyebrow={`Week ${trainingSession.week} · Day ${trainingSession.dayIndex}`}
              title={trainingSession.title}
              subtitle={`${trainingSession.durationMinutes} min · ${trainingSession.emphasis.join(" · ")}`}
            />
          </View>
        </FadeInView>

        <FadeInView delay={100}>
          <Card style={styles.playerCard}>
            <View style={styles.playerTop}>
              <View style={styles.playerStat}>
                <Text style={styles.playerLabel}>Session progress</Text>
                <Text style={styles.playerValue}>0%</Text>
              </View>
              <View style={styles.playerStat}>
                <Text style={styles.playerLabel}>Planned duration</Text>
                <Text style={styles.playerValue}>{trainingSession.durationMinutes}m</Text>
              </View>
              <ReadinessPill level={readiness.level} />
            </View>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.helper}>{readiness.recommendation}</Text>
            <Text style={styles.helper}>{trainingSession.recommendation}</Text>
          </Card>
        </FadeInView>

        <FadeInView delay={160}>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Session blocks</Text>
            {(["warmup", "main", "accessory", "mobility", "cooldown"] as const).map((block) => (
              <View key={block} style={styles.blockWrap}>
                <Text style={styles.blockTitle}>{block}</Text>
                {trainingSession.blocks[block].map((exercise) => (
                  <View key={`${block}-${exercise.name}`} style={styles.exerciseWrap}>
                    <ListRow
                      title={exercise.name}
                      subtitle={exercise.prescription}
                      trailing={block === "main" ? "Focus" : undefined}
                    />
                    <Text style={styles.helper}>{exercise.purpose}</Text>
                    <Text style={styles.cue}>Cue: {exercise.cue}</Text>
                  </View>
                ))}
              </View>
            ))}
          </Card>
        </FadeInView>

        <FadeInView delay={220}>
          <Card style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>Readiness inputs</Text>
              <Text style={styles.caption}>Quick set</Text>
            </View>
            <MetricSelector control={control} name="sleepHours" label="Sleep hours" options={[5, 6, 7, 8, 9]} />
            <MetricSelector control={control} name="energy" label="Energy" options={[1, 2, 3, 4, 5]} />
            <MetricSelector control={control} name="soreness" label="Soreness" options={[1, 2, 3, 4, 5]} />
            <MetricSelector control={control} name="stress" label="Stress" options={[1, 2, 3, 4, 5]} />
            <MetricSelector control={control} name="pain" label="Pain" options={[1, 2, 3, 4, 5]} />
          </Card>
        </FadeInView>

        <FadeInView delay={280}>
          <Card style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>Log session</Text>
              <Text style={styles.caption}>After training</Text>
            </View>
            <Controller
              control={control}
              name="durationMinutes"
              render={({ field }) => (
                <Field
                  label="Duration (min)"
                  value={String(field.value ?? "")}
                  onChangeText={field.onChange}
                  keyboardType="numeric"
                />
              )}
            />
            <MetricSelector control={control} name="perceivedEffort" label="Session RPE" options={[5, 6, 7, 8, 9, 10]} />

            {profile.primarySport === "cycling" ? (
              <>
                <Controller
                  control={control}
                  name="distanceKm"
                  render={({ field }) => (
                    <Field
                      label="Distance (km)"
                      value={String(field.value ?? "")}
                      onChangeText={field.onChange}
                      keyboardType="numeric"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="averagePowerWatts"
                  render={({ field }) => (
                    <Field
                      label="Average power (W)"
                      value={String(field.value ?? "")}
                      onChangeText={field.onChange}
                      keyboardType="numeric"
                    />
                  )}
                />
              </>
            ) : null}

            {profile.primarySport === "bjj" ? (
              <>
                <Controller
                  control={control}
                  name="roundsCompleted"
                  render={({ field }) => (
                    <Field
                      label="Rounds completed"
                      value={String(field.value ?? "")}
                      onChangeText={field.onChange}
                      keyboardType="numeric"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="sparringRounds"
                  render={({ field }) => (
                    <Field
                      label="Sparring rounds"
                      value={String(field.value ?? "")}
                      onChangeText={field.onChange}
                      keyboardType="numeric"
                    />
                  )}
                />
              </>
            ) : null}

            {profile.primarySport === "swimming" ? (
              <>
                <Controller
                  control={control}
                  name="swimDistanceMeters"
                  render={({ field }) => (
                    <Field
                      label="Distance (meters)"
                      value={String(field.value ?? "")}
                      onChangeText={field.onChange}
                      keyboardType="numeric"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="intervalPacePer100m"
                  render={({ field }) => (
                    <Field
                      label="Pace / 100m"
                      value={field.value ?? ""}
                      onChangeText={field.onChange}
                      placeholder="1:42"
                    />
                  )}
                />
              </>
            ) : null}

            {profile.primarySport === "surfing" ? (
              <Controller
                control={control}
                name="waveCount"
                render={({ field }) => (
                  <Field
                    label="Wave count"
                    value={String(field.value ?? "")}
                    onChangeText={field.onChange}
                    keyboardType="numeric"
                  />
                )}
              />
            ) : null}

            <Controller
              control={control}
              name="bodyweightKg"
              render={({ field }) => (
                <Field
                  label="Bodyweight (kg)"
                  value={String(field.value ?? "")}
                  onChangeText={field.onChange}
                  keyboardType="numeric"
                />
              )}
            />

            <Controller
              control={control}
              name="notes"
              render={({ field }) => (
                <Field
                  label="Notes"
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                  multiline
                  placeholder="What felt strong, what felt off, what to protect next time..."
                />
              )}
            />

            <PrimaryButton label="Complete session" onPress={submit} />
          </Card>
        </FadeInView>
      </ScrollView>
    </Screen>
  );
}

function MetricSelector({
  control,
  name,
  label,
  options,
}: {
  control: Control<FormValues>;
  name: "sleepHours" | "energy" | "soreness" | "stress" | "pain" | "perceivedEffort";
  label: string;
  options: number[];
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <View style={styles.selectorGroup}>
          <Text style={styles.selectorLabel}>{label}</Text>
          <View style={styles.selectorRow}>
            {options.map((option) => (
              <Pill
                key={`${name}-${option}`}
                label={String(option)}
                selected={Number(field.value) === option}
                onPress={() => field.onChange(option)}
              />
            ))}
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    paddingTop: spacing.sm,
  },
  playerCard: {
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  playerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  playerStat: {
    gap: 4,
  },
  playerLabel: {
    color: colors.textSoft,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
    fontWeight: "700",
  },
  playerValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    width: "18%",
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  card: {
    gap: spacing.sm,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    alignItems: "center",
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  caption: {
    color: colors.textSoft,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "700",
  },
  helper: {
    color: colors.textMuted,
    lineHeight: 22,
    fontSize: 13,
  },
  blockWrap: {
    gap: 8,
    paddingTop: 6,
  },
  blockTitle: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  exerciseWrap: {
    gap: 5,
  },
  cue: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },
  selectorGroup: {
    gap: spacing.sm,
  },
  selectorLabel: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  selectorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
