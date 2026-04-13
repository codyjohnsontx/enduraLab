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
import {
  ProfileInsert,
  ProfileRow,
  WorkoutLogInsert,
  WorkoutLogRow,
} from "@/types/supabase";

function mapProfileRowToRemoteProfile(row: ProfileRow): RemoteProfile {
  return {
    userId: row.user_id,
    email: row.email,
    primarySport: row.primary_sport,
    secondarySports: row.secondary_sports,
    experienceLevel: row.experience_level,
    trainingDays: row.training_days,
    goalFocus: row.goal_focus,
    bodyweightKg: row.bodyweight_kg,
    bjjWeightClass: row.bjj_weight_class ?? undefined,
    injuryNotes: row.injury_notes ?? undefined,
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

function mapWorkoutRowToRemoteWorkoutLog(row: WorkoutLogRow): RemoteWorkoutLog {
  return {
    id: row.id,
    sessionId: row.session_id,
    userId: row.user_id,
    sport: row.sport,
    completedAt: row.completed_at,
    readiness: row.readiness,
    metrics: row.metrics,
    notes: row.notes ?? undefined,
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

const localPreviewRepository: AppDataRepository = {
  mode: "local-preview",
  isConfigured: false,
  async getSession() {
    return loadLocalPreviewSession();
  },
  subscribeToAuthChanges() {
    return () => undefined;
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
    const { data } = await supabase!.auth.getSession();
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
  subscribeToAuthChanges(listener) {
    const {
      data: { subscription },
    } = supabase!.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        listener(null);
        return;
      }

      listener({
        userId: session.user.id,
        email: session.user.email ?? "",
        source: "supabase",
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  },
  async signInWithMagicLink(email: string) {
    await supabase!.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "enduralab://",
      },
    });

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
    await supabase!.auth.signOut();
  },
  async loadProfile(userId: string) {
    const { data, error } = await supabase!
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle<ProfileRow>();

    if (error) {
      throw error;
    }

    return data ? mapProfileRowToRemoteProfile(data) : null;
  },
  async saveProfile(profile, session) {
    const payload: ProfileInsert = {
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
      .single<ProfileRow>();

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
      .order("completed_at", { ascending: false })
      .returns<WorkoutLogRow[]>();

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => mapWorkoutRowToRemoteWorkoutLog(row));
  },
  async saveWorkoutLog(workoutLog, session) {
    const payload: WorkoutLogInsert = {
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
      .single<WorkoutLogRow>();

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
