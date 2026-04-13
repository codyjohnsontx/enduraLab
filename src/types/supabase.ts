import { AthleteProfile, WorkoutLog } from "@/types/domain";

export type ProfileRow = {
  user_id: string;
  email: string;
  primary_sport: AthleteProfile["primarySport"];
  secondary_sports: AthleteProfile["secondarySports"];
  experience_level: AthleteProfile["experienceLevel"];
  training_days: AthleteProfile["trainingDays"];
  goal_focus: AthleteProfile["goalFocus"];
  bodyweight_kg: number;
  bjj_weight_class: string | null;
  injury_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkoutLogRow = {
  id: string;
  user_id: string;
  session_id: string;
  sport: WorkoutLog["sport"];
  completed_at: string;
  readiness: WorkoutLog["readiness"];
  metrics: WorkoutLog["metrics"];
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileInsert = Omit<ProfileRow, "created_at" | "updated_at">;
export type WorkoutLogInsert = Omit<WorkoutLogRow, "created_at" | "updated_at">;
