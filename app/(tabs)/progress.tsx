import { useQuery } from "@tanstack/react-query";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Card, Screen, SectionTitle, StatTile } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { fetchPlanForProfile } from "@/lib/content";
import { useAppState } from "@/providers/app-provider";

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

export default function ProgressScreen() {
  const { profile, workoutLogs } = useAppState();
  const { data: plan } = useQuery({
    queryKey: ["plan", profile?.primarySport, profile?.trainingDays],
    queryFn: () => fetchPlanForProfile(profile!),
    enabled: Boolean(profile),
  });

  if (!profile || !plan) {
    return <Screen />;
  }

  const completedIds = new Set(workoutLogs.map((log) => log.sessionId));
  const adherence = Math.round((completedIds.size / plan.sessions.length) * 100);
  const avgReadiness = average(
    workoutLogs.map((log) => {
      if (log.readiness.level === "green") {
        return 3;
      }

      if (log.readiness.level === "yellow") {
        return 2;
      }

      return 1;
    }),
  );
  const bodyweightTrend = workoutLogs
    .map((log) => log.metrics.bodyweightKg)
    .filter((value): value is number => typeof value === "number");
  const latestBodyweight = bodyweightTrend[0] ?? profile.bodyweightKg;
  const avgEffort = average(
    workoutLogs
      .map((log) => log.metrics.perceivedEffort)
      .filter((value): value is number => typeof value === "number"),
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionTitle
          eyebrow="Progress"
          title="Consistency and performance first"
          subtitle="Bodyweight and recovery stay visible, but the app grades success by execution quality and repeatability."
        />

        <View style={styles.grid}>
          <StatTile label="Plan completion" value={`${adherence}%`} helper={`${completedIds.size} of ${plan.sessions.length} sessions`} />
          <StatTile
            label="Avg readiness"
            value={avgReadiness ? avgReadiness.toFixed(1) : "0.0"}
            helper="1 = red, 3 = green"
          />
          <StatTile
            label="Latest bodyweight"
            value={`${latestBodyweight.toFixed(1)} kg`}
            helper="Weight-class aware"
          />
          <StatTile
            label="Avg session RPE"
            value={avgEffort ? avgEffort.toFixed(1) : "--"}
            helper="Lower is not always better"
          />
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Recent training log</Text>
          {workoutLogs.length === 0 ? (
            <Text style={styles.emptyText}>Complete a session to start building trendlines.</Text>
          ) : (
            workoutLogs.slice(0, 6).map((log) => (
              <View key={log.id} style={styles.logRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logTitle}>{log.sport.toUpperCase()}</Text>
                  <Text style={styles.logMeta}>
                    {new Date(log.completedAt).toLocaleDateString()} · readiness {log.readiness.level}
                  </Text>
                </View>
                <Text style={styles.logMeta}>
                  {log.metrics.durationMinutes ? `${log.metrics.durationMinutes} min` : "Logged"}
                </Text>
              </View>
            ))
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>What counts as progress here</Text>
          <Text style={styles.bodyText}>
            Show up consistently, keep your output quality high, and protect movement
            quality. The app favors durable performance over chasing size.
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  card: {
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  bodyText: {
    color: colors.textMuted,
    lineHeight: 22,
  },
  emptyText: {
    color: colors.textMuted,
  },
  logRow: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logTitle: {
    color: colors.text,
    fontWeight: "700",
  },
  logMeta: {
    color: colors.textMuted,
  },
});
