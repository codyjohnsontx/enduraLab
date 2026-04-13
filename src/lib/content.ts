import { buildPlanForSport } from "@/data/plans";
import { AthleteProfile, TrainingPlan } from "@/types/domain";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchPlanForProfile(profile: AthleteProfile): Promise<TrainingPlan> {
  await delay(120);
  return buildPlanForSport(profile.primarySport, profile.trainingDays);
}
