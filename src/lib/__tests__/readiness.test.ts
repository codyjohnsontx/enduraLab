import { evaluateReadiness } from "@/lib/readiness";

describe("evaluateReadiness", () => {
  it("returns red when pain is high", () => {
    expect(
      evaluateReadiness({
        sleepHours: 8,
        soreness: 1,
        energy: 4,
        stress: 1,
        pain: 4,
      }),
    ).toMatchObject({ level: "red" });
  });

  it("returns yellow at the middle threshold", () => {
    expect(
      evaluateReadiness({
        sleepHours: 7,
        soreness: 2,
        energy: 2,
        stress: 1,
        pain: 0,
      }),
    ).toMatchObject({ level: "yellow" });
  });

  it("returns green when the score is above the yellow band", () => {
    expect(
      evaluateReadiness({
        sleepHours: 8,
        soreness: 1,
        energy: 5,
        stress: 1,
        pain: 0,
      }),
    ).toMatchObject({ level: "green" });
  });

  it("returns red at the low score boundary", () => {
    expect(
      evaluateReadiness({
        sleepHours: 5,
        soreness: 3,
        energy: 1,
        stress: 2,
        pain: 1,
      }),
    ).toMatchObject({ level: "red" });
  });
});
