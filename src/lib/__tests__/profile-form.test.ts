import {
  buildAthleteProfile,
  getDefaultProfileFormValues,
} from "@/lib/profile-form";
import { AthleteProfile } from "@/types/domain";

describe("profile-form", () => {
  it("uses defaults when no profile exists", () => {
    expect(getDefaultProfileFormValues(null)).toMatchObject({
      email: "",
      primarySport: "cycling",
      trainingDays: 3,
      experienceLevel: "foundation",
      goalFocus: "strength_to_weight",
      bodyweightKg: 75,
      secondarySports: ["bjj"],
    });
  });

  it("preserves an explicit empty secondarySports array", () => {
    const profile: AthleteProfile = {
      email: "athlete@enduralab.app",
      primarySport: "swimming",
      secondarySports: [],
      experienceLevel: "intermediate",
      trainingDays: 4,
      goalFocus: "endurance",
      bodyweightKg: 71,
    };

    expect(getDefaultProfileFormValues(profile).secondarySports).toEqual([]);
  });

  it("removes the primary sport from secondarySports when building the saved profile", () => {
    const result = buildAthleteProfile({
      email: "athlete@enduralab.app",
      primarySport: "cycling",
      trainingDays: 3,
      experienceLevel: "competitive",
      goalFocus: "durability",
      bodyweightKg: 73,
      secondarySports: ["cycling", "bjj", "surfing"],
      bjjWeightClass: "",
      injuryNotes: "",
    });

    expect(result.secondarySports).toEqual(["bjj", "surfing"]);
  });
});
