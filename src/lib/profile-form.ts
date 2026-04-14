import { z } from "zod";

import { AthleteProfile, Sport } from "@/types/domain";

export const sports = ["cycling", "bjj", "swimming", "surfing"] as const;
export const levels = ["foundation", "intermediate", "competitive"] as const;
export const goals = [
  "strength_to_weight",
  "endurance",
  "durability",
  "mobility",
] as const;
export const trainingDays = [2, 3, 4] as const;

export const profileSchema = z.object({
  email: z.string().email(),
  primarySport: z.enum(sports),
  trainingDays: z.union([z.literal(2), z.literal(3), z.literal(4)]),
  experienceLevel: z.enum(levels),
  goalFocus: z.enum(goals),
  bodyweightKg: z.coerce.number().min(35).max(180),
  secondarySports: z.array(z.enum(sports)).default([]),
  bjjWeightClass: z.string().optional(),
  injuryNotes: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export function getDefaultProfileFormValues(profile?: AthleteProfile | null): ProfileFormValues {
  return {
    email: profile?.email ?? "",
    primarySport: profile?.primarySport ?? "cycling",
    trainingDays: profile?.trainingDays ?? 3,
    experienceLevel: profile?.experienceLevel ?? "foundation",
    goalFocus: profile?.goalFocus ?? "strength_to_weight",
    bodyweightKg: profile?.bodyweightKg ?? 75,
    secondarySports: profile?.secondarySports.length ? profile.secondarySports : ["bjj"],
    bjjWeightClass: profile?.bjjWeightClass ?? "",
    injuryNotes: profile?.injuryNotes ?? "",
  };
}

export function toggleSecondarySportSelection(current: Sport[], sport: Sport) {
  if (current.includes(sport)) {
    return current.filter((item) => item !== sport);
  }

  return [...current, sport];
}

export function buildAthleteProfile(values: ProfileFormValues): AthleteProfile {
  return {
    email: values.email,
    primarySport: values.primarySport,
    trainingDays: values.trainingDays,
    experienceLevel: values.experienceLevel,
    goalFocus: values.goalFocus,
    bodyweightKg: values.bodyweightKg,
    secondarySports: values.secondarySports.filter(
      (sport): sport is Sport => sport !== values.primarySport,
    ),
    bjjWeightClass: values.bjjWeightClass,
    injuryNotes: values.injuryNotes,
  };
}
