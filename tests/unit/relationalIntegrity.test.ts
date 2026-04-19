/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import type { LiftMapExercise } from "../../src/lib/types";

function validateRelationalIntegrity(exercises: LiftMapExercise[]): string[] {
  const errors: string[] = [];
  const exerciseBySlug = Object.fromEntries(exercises.map((ex) => [ex.slug, ex]));

  exercises.forEach((ex) => {
    const check = (slugs: string[], type: string) => {
      slugs.forEach((s) => {
        if (!exerciseBySlug[s]) {
          errors.push(`Exercise "${ex.slug}" has missing ${type}: "${s}"`);
        }
      });
    };

    check(ex.progressions, "progression");
    check(ex.regressions, "regression");
    check(ex.related, "related");
  });

  return errors;
}

const mockEx = (
  slug: string,
  relations: Partial<Pick<LiftMapExercise, "progressions" | "regressions" | "related">>,
): any => ({
  slug,
  progressions: relations.progressions || [],
  regressions: relations.regressions || [],
  related: relations.related || [],
});

describe("relational integrity check", () => {
  it("detects missing progression slugs", () => {
    const data = [mockEx("squat", { progressions: ["missing-advanced-squat"] })];
    const errors = validateRelationalIntegrity(data);
    expect(errors).toContain('Exercise "squat" has missing progression: "missing-advanced-squat"');
  });

  it("passes when all relations exist", () => {
    const data = [
      mockEx("squat", { progressions: ["overhead-squat"] }),
      mockEx("overhead-squat", { regressions: ["squat"] }),
    ];
    const errors = validateRelationalIntegrity(data);
    expect(errors.length).toBe(0);
  });

  it("detects missing related slugs", () => {
    const data = [mockEx("bench", { related: ["deadlift"] })];
    const errors = validateRelationalIntegrity(data);
    expect(errors).toContain('Exercise "bench" has missing related: "deadlift"');
  });
});
