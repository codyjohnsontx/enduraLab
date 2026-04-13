import {
  AppDataRepository,
  AthleteProfile,
  AuthSession,
  RemoteProfile,
  RemoteWorkoutLog,
  WorkoutLog,
} from "@/types/domain";
import { env } from "@/lib/env";
import {
  loadLocalPreviewSession,
  persistLocalPreviewSession,
} from "@/lib/storage";
import { supabase } from "@/lib/supabase";

const sports = ["cycling", "bjj", "swimming", "surfing"] as const;
const levels = ["foundation", "intermediate", "competitive"] as const;
const goalFocuses = ["strength_to_weight", "endurance", "durability", "mobility"] as const;
const readinessLevels = ["green", "yellow", "red"] as const;
const trainingDays = [2, 3, 4] as const;

function isEnumValue<T extends readonly string[]>(value: unknown, allowed: T): value is T[number] {
  return typeof value === "string" && allowed.includes(value as T[number]);
}

function toFiniteNumber(value: unknown, fieldName: string): number {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid ${fieldName} value from repository.`);
  }

  return parsed;
}

function toOptionalFiniteNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseMetrics(value: unknown): WorkoutLog["metrics"] {
  const raw = typeof value === "string" ? JSON.parse(value) : value;

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Invalid workout metrics payload from repository.");
  }

  const metrics = raw as Record<string, unknown>;

  return {
    durationMinutes: toOptionalFiniteNumber(metrics.durationMinutes),
    perceivedEffort: toOptionalFiniteNumber(metrics.perceivedEffort),
    distanceKm: toOptionalFiniteNumber(metrics.distanceKm),
    elevationMeters: toOptionalFiniteNumber(metrics.elevationMeters),
    averagePowerWatts: toOptionalFiniteNumber(metrics.averagePowerWatts),
    roundsCompleted: toOptionalFiniteNumber(metrics.roundsCompleted),
    sparringRounds: toOptionalFiniteNumber(metrics.sparringRounds),
    swimDistanceMeters: toOptionalFiniteNumber(metrics.swimDistanceMeters),
    intervalPacePer100m:
      typeof metrics.intervalPacePer100m === "string" ? metrics.intervalPacePer100m : undefined,
    waveCount: toOptionalFiniteNumber(metrics.waveCount),
    bodyweightKg: toOptionalFiniteNumber(metrics.bodyweightKg),
  };
}

function parseReadiness(value: unknown): WorkoutLog["readiness"] {
  const raw = typeof value === "string" ? JSON.parse(value) : value;

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Invalid readiness payload from repository.");
  }

  const readiness = raw as Record<string, unknown>;

  if (!isEnumValue(readiness.level, readinessLevels)) {
    throw new Error("Invalid readiness level from repository.");
  }

  return {
    sleepHours: toFiniteNumber(readiness.sleepHours, "sleepHours"),
    soreness: toFiniteNumber(readiness.soreness, "soreness"),
    energy: toFiniteNumber(readiness.energy, "energy"),
    stress: toFiniteNumber(readiness.stress, "stress"),
    pain: toFiniteNumber(readiness.pain, "pain"),
    level: readiness.level,
  };
}

function mapProfileRowToRemoteProfile(row: Record<string, unknown>): RemoteProfile {
  if (!isEnumValue(row.primary_sport, sports)) {
    throw new Error("Invalid primary sport from repository.");
  }

  if (!isEnumValue(row.experience_level, levels)) {
    throw new Error("Invalid experience level from repository.");
  }

  if (!isEnumValue(row.goal_focus, goalFocuses)) {
    throw new Error("Invalid goal focus from repository.");
  }

  const parsedTrainingDays = toFiniteNumber(row.training_days, "training_days");
  if (!trainingDays.includes(parsedTrainingDays as 2 | 3 | 4)) {
    throw new Error("Invalid training days from repository.");
  }

  const secondarySports = Array.isArray(row.secondary_sports)
    ? row.secondary_sports.filter((sport): sport is AthleteProfile["secondarySports"][number] =>
        isEnumValue(sport, sports),
      )
    : [];

  return {
    userId: String(row.user_id),
    email: String(row.email),
    primarySport: row.primary_sport,
    secondarySports,
    experienceLevel: row.experience_level,
    trainingDays: parsedTrainingDays as AthleteProfile["trainingDays"],
    goalFocus: row.goal_focus,
    bodyweightKg: toFiniteNumber(row.bodyweight_kg, "bodyweight_kg"),
    bjjWeightClass: (row.bjj_weight_class as string | null) ?? undefined,
    injuryNotes: (row.injury_notes as string | null) ?? undefined,
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

function mapWorkoutRowToRemoteWorkoutLog(row: Record<string, unknown>): RemoteWorkoutLog {
  if (!isEnumValue(row.sport, sports)) {
    throw new Error("Invalid workout sport from repository.");
  }

  return {
    id: String(row.id),
    sessionId: String(row.session_id),
    userId: String(row.user_id),
    sport: row.sport,
    completedAt: String(row.completed_at),
    readiness: parseReadiness(row.readiness),
    metrics: parseMetrics(row.metrics),
    notes: (row.notes as string | null) ?? undefined,
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

const localPreviewRepository: AppDataRepository = {
  mode: "local-preview",
  isConfigured: false,
  async getSession() {
    return loadLocalPreviewSession();
  },
  async signInWithMagicLink() {
    return { mode: "local-preview", sent: false };
  },
  async startLocalPreviewSession(email: string) {
    const session: AuthSession = {
      userId: `preview-${email.toLowerCase()}`,
      email,
      source: "local-preview",
    };
    await persistLocalPreviewSession(session);
    return session;
  },
  async signOut() {
    await persistLocalPreviewSession(null);
  },
  async loadProfile() {
    return null;
  },
  async saveProfile(profile, session) {
    return {
      ...profile,
      userId: session.userId,
      updatedAt: new Date().toISOString(),
    };
  },
  async loadWorkoutLogs() {
    return [];
  },
  async saveWorkoutLog(workoutLog, session) {
    return {
      ...workoutLog,
      userId: session.userId,
      updatedAt: new Date().toISOString(),
    };
  },
};

const supabaseRepository: AppDataRepository = {
  mode: "supabase",
  isConfigured: true,
  async getSession() {
    const { data, error } = await supabase!.auth.getSession();

    if (error) {
      console.error("Supabase getSession failed", error);
      return null;
    }

    const session = data.session;

    if (!session?.user) {
      return null;
    }

    return {
      userId: session.user.id,
      email: session.user.email ?? "",
      source: "supabase",
    };
  },
  async signInWithMagicLink(email: string) {
    const { error } = await supabase!.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "enduralab://",
      },
    });

    if (error) {
      console.error("Supabase signInWithMagicLink failed", error);
      throw new Error(error.message);
    }

    return { mode: "supabase", sent: true };
  },
  async startLocalPreviewSession(email: string) {
    const fallbackSession: AuthSession = {
      userId: `preview-${email.toLowerCase()}`,
      email,
      source: "local-preview",
    };
    return fallbackSession;
  },
  async signOut() {
    const { error } = await supabase!.auth.signOut();

    if (error) {
      console.error("Supabase signOut failed", error);
      throw new Error(error.message);
    }
  },
  async loadProfile(userId: string) {
    const { data, error } = await supabase!
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapProfileRowToRemoteProfile(data) : null;
  },
  async saveProfile(profile, session) {
    const payload = {
      user_id: session.userId,
      email: profile.email,
      primary_sport: profile.primarySport,
      secondary_sports: profile.secondarySports,
      experience_level: profile.experienceLevel,
      training_days: profile.trainingDays,
      goal_focus: profile.goalFocus,
      bodyweight_kg: profile.bodyweightKg,
      bjj_weight_class: profile.bjjWeightClass ?? null,
      injury_notes: profile.injuryNotes ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase!
      .from("profiles")
      .upsert(payload)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return mapProfileRowToRemoteProfile(data);
  },
  async loadWorkoutLogs(userId: string) {
    const { data, error } = await supabase!
      .from("workout_logs")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => mapWorkoutRowToRemoteWorkoutLog(row));
  },
  async saveWorkoutLog(workoutLog, session) {
    const payload = {
      id: workoutLog.id,
      user_id: session.userId,
      session_id: workoutLog.sessionId,
      sport: workoutLog.sport,
      completed_at: workoutLog.completedAt,
      readiness: workoutLog.readiness,
      metrics: workoutLog.metrics,
      notes: workoutLog.notes ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase!
      .from("workout_logs")
      .upsert(payload)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return mapWorkoutRowToRemoteWorkoutLog(data);
  },
};

export function createRepository(): AppDataRepository {
  if (env.hasSupabase && supabase) {
    return supabaseRepository;
  }

  return localPreviewRepository;
}
