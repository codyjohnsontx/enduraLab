import { ReadinessInput, ReadinessLevel } from "@/types/domain";

export function evaluateReadiness(input: ReadinessInput): {
  level: ReadinessLevel;
  recommendation: string;
} {
  const score =
    input.energy * 2 +
    input.sleepHours -
    input.soreness -
    input.stress -
    input.pain * 1.5;

  if (input.pain >= 4 || score <= 3) {
    return {
      level: "red",
      recommendation:
        "Swap to mobility and recovery work today. Keep the pattern, lower the load.",
    };
  }

  if (score <= 8) {
    return {
      level: "yellow",
      recommendation:
        "Keep the session, but trim one main set and bias control over output.",
    };
  }

  return {
    level: "green",
    recommendation: "Run the planned session as written and keep quality high.",
  };
}
