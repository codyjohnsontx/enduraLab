import { Link } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  Card,
  FadeInView,
  ListRow,
  MetricStrip,
  ReadinessPill,
  Screen,
  SectionTitle,
} from "@/components/ui";
import { colors, spacing, sportColors } from "@/constants/theme";
import { fetchPlanForProfile } from "@/lib/content";
import { useAppState } from "@/providers/app-provider";
import { TrainingSession } from "@/types/domain";

function getCompletionRate(total: number, completed: number) {
  if (!total) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}

function getTrendLabel(sport: string, sessionsCompleted: number) {
  if (sport === "cycling") {
    return `${sessionsCompleted} quality rides banked`;
  }

  if (sport === "bjj") {
    return `${sessionsCompleted} sessions supporting the weight class`;
  }

  if (sport === "swimming") {
    return `${sessionsCompleted} sessions reinforcing pace control`;
  }

  return `${sessionsCompleted} sessions building paddle resilience`;
}

export default function DashboardScreen() {
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
  const nextSession = plan.sessions.find((session) => !completedIds.has(session.id));
  const currentWeekSessions = plan.sessions.filter((session) => session.week === (nextSession?.week ?? 1));
  const completedThisWeek = currentWeekSessions.filter((session) => completedIds.has(session.id)).length;
  const adherence = getCompletionRate(currentWeekSessions.length, completedThisWeek);
  const latestReadiness = workoutLogs[0]?.readiness.level ?? "green";
  const upcoming = plan.sessions.filter((session) => !completedIds.has(session.id)).slice(0, 3);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <FadeInView delay={30}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.dateLabel}>Today</Text>
              <Text style={styles.headerTitle}>Training</Text>
              <Text style={styles.headerMeta}>
                {profile.primarySport} · {profile.trainingDays} days per week
              </Text>
            </View>
            <View style={[styles.sportDot, { backgroundColor: sportColors[profile.primarySport] }]} />
          </View>
        </FadeInView>

        <FadeInView delay={110}>
          <Card style={styles.primaryCard}>
            <View style={styles.primaryTop}>
              <View style={styles.primaryMeta}>
                <Text style={styles.primaryKicker}>
                  {nextSession ? `Week ${nextSession.week} · Day ${nextSession.dayIndex}` : "Block complete"}
                </Text>
                <Text style={styles.primaryTitle}>
                  {nextSession ? nextSession.title : "Current block completed"}
                </Text>
                <Text style={styles.primarySubtitle}>
                  {nextSession
                    ? `${nextSession.durationMinutes} min · ${nextSession.emphasis.join(" · ")}`
                    : "Reset the profile when you want to start a fresh block."}
                </Text>
              </View>
              <ReadinessPill level={latestReadiness} />
            </View>

            <View style={styles.metricGrid}>
              <MetricStrip
                label="Week adherence"
                value={`${adherence}%`}
                helper={`${completedThisWeek}/${currentWeekSessions.length} sessions`}
              />
              <MetricStrip
                label="Readiness"
                value={latestReadiness.toUpperCase()}
                helper="Latest session"
              />
              <MetricStrip
                label="Performance cue"
                value={getTrendLabel(profile.primarySport, workoutLogs.length)}
                helper={profile.goalFocus.replaceAll("_", " ")}
              />
            </View>

            {nextSession ? (
              <View style={styles.ctaRow}>
                <Text style={styles.coachNote}>{nextSession.recommendation}</Text>
                <Link href={`/workout/${nextSession.id}` as const} style={styles.sessionLink}>
                  Start workout
                </Link>
              </View>
            ) : null}
          </Card>
        </FadeInView>

        <FadeInView delay={190}>
          <View style={styles.sectionWrap}>
            <SectionTitle
              eyebrow="Queue"
              title="Upcoming sessions"
              subtitle="Planned work stays fixed so execution stays honest."
            />
            <Card style={styles.listCard}>
              {upcoming.map((session: TrainingSession) => (
                <Link
                  key={session.id}
                  href={`/workout/${session.id}` as const}
                  style={styles.linkReset}
                >
                  <ListRow
                    title={session.title}
                    subtitle={`Week ${session.week} · Day ${session.dayIndex} · ${session.durationMinutes} min`}
                    trailing="Open"
                  />
                </Link>
              ))}
            </Card>
          </View>
        </FadeInView>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.sm,
  },
  headerCopy: {
    gap: 2,
  },
  dateLabel: {
    color: colors.textSoft,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    fontSize: 11,
    fontWeight: "700",
  },
  headerTitle: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -1,
  },
  headerMeta: {
    color: colors.textMuted,
    fontSize: 14,
  },
  sportDot: {
    width: 18,
    height: 18,
    borderRadius: 999,
  },
  primaryCard: {
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  primaryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  primaryMeta: {
    flex: 1,
    gap: 4,
  },
  primaryKicker: {
    color: colors.textSoft,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    fontSize: 11,
    fontWeight: "700",
  },
  primaryTitle: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "800",
    letterSpacing: -0.7,
  },
  primarySubtitle: {
    color: colors.textMuted,
    lineHeight: 21,
    fontSize: 14,
  },
  metricGrid: {
    gap: 2,
  },
  ctaRow: {
    gap: spacing.md,
  },
  coachNote: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  sessionLink: {
    color: "#FFFFFF",
    backgroundColor: colors.primary,
    fontWeight: "800",
    fontSize: 15,
    paddingVertical: 14,
    borderRadius: 16,
    textAlign: "center",
    overflow: "hidden",
  },
  sectionWrap: {
    gap: spacing.sm,
  },
  listCard: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  linkReset: {
    textDecorationLine: "none",
  },
});
