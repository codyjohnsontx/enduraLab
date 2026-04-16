export type Sport = "cycling" | "bjj" | "swimming" | "surfing";

export type GoalFocus =
  | "strength_to_weight"
  | "endurance"
  | "durability"
  | "mobility";

export type ExperienceLevel = "foundation" | "intermediate" | "competitive";

export type ReadinessLevel = "green" | "yellow" | "red";

export type RepositoryMode = "supabase" | "local-preview";

export type SyncStatus = "idle" | "syncing" | "error";

export type AthleteProfile = {
  email: string;
  primarySport: Sport;
  secondarySports: Sport[];
  experienceLevel: ExperienceLevel;
  trainingDays: 2 | 3 | 4;
  goalFocus: GoalFocus;
  bodyweightKg: number;
  bjjWeightClass?: string;
  injuryNotes?: string;
};

export type SessionExercise = {
  name: string;
  prescription: string;
  purpose: string;
  cue: string;
};

export type TrainingSession = {
  id: string;
  sport: Sport;
  week: number;
  dayIndex: number;
  title: string;
  durationMinutes: number;
  emphasis: string[];
  recommendation: string;
  blocks: {
    warmup: SessionExercise[];
    main: SessionExercise[];
    accessory: SessionExercise[];
    mobility: SessionExercise[];
    cooldown: SessionExercise[];
  };
};

export type TrainingPlan = {
  id: string;
  sport: Sport;
  title: string;
  description: string;
  goalFocus: GoalFocus[];
  trainingDays: 2 | 3 | 4;
  sessions: TrainingSession[];
};

export type ReadinessInput = {
  sleepHours: number;
  soreness: number;
  energy: number;
  stress: number;
  pain: number;
};

export type WorkoutMetrics = {
  durationMinutes?: number;
  perceivedEffort?: number;
  distanceKm?: number;
  elevationMeters?: number;
  averagePowerWatts?: number;
  roundsCompleted?: number;
  sparringRounds?: number;
  swimDistanceMeters?: number;
  intervalPacePer100m?: string;
  waveCount?: number;
  bodyweightKg?: number;
};

export type WorkoutLog = {
  id: string;
  sessionId: string;
  sport: Sport;
  completedAt: string;
  readiness: ReadinessInput & { level: ReadinessLevel };
  metrics: WorkoutMetrics;
  notes?: string;
};

export type AuthSession = {
  userId: string;
  email: string;
  source: RepositoryMode;
};

export type PasswordAuthResult = {
  session: AuthSession | null;
  emailConfirmationRequired?: boolean;
};

export type RemoteProfile = AthleteProfile & {
  userId: string;
  updatedAt: string;
};

export type RemoteWorkoutLog = WorkoutLog & {
  userId: string;
  updatedAt: string;
};

export type AppState = {
  session: AuthSession | null;
  profile: AthleteProfile | null;
  workoutLogs: WorkoutLog[];
  onboardingCompleted: boolean;
};

export type AppDataRepository = {
  mode: RepositoryMode;
  isConfigured: boolean;
  getSession: () => Promise<AuthSession | null>;
  subscribeToAuthChanges: (listener: (session: AuthSession | null) => void) => () => void;
  signInWithMagicLink: (email: string) => Promise<{ mode: RepositoryMode; sent: boolean }>;
  signInWithPassword: (email: string, password: string) => Promise<PasswordAuthResult>;
  signUpWithPassword: (email: string, password: string) => Promise<PasswordAuthResult>;
  updatePassword: (password: string) => Promise<void>;
  startLocalPreviewSession: (email: string) => Promise<AuthSession>;
  signOut: () => Promise<void>;
  loadProfile: (userId: string) => Promise<RemoteProfile | null>;
  saveProfile: (profile: AthleteProfile, session: AuthSession) => Promise<RemoteProfile>;
  loadWorkoutLogs: (userId: string) => Promise<RemoteWorkoutLog[]>;
  saveWorkoutLog: (workoutLog: WorkoutLog, session: AuthSession) => Promise<RemoteWorkoutLog>;
};
