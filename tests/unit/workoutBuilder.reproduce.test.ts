import { describe, it, expect } from "vitest";
import { buildWorkout } from "../../src/features/workout/workoutBuilder";
import type { Exercise, LiftMapExercise } from "../../src/lib/types";

const mockExercise = (id: string, overrides: Partial<LiftMapExercise>): Exercise => ({
  id,
  name: `Exercise ${id}`,
  slug: id,
  primaryMuscles: ["mid_chest"],
  secondaryMuscles: ["triceps"],
  equipment: ["dumbbell"],
  difficulty: "beginner",
  trainingStyles: ["bodybuilding"],
  bodyRegion: "chest",
  instructions: [],
  media: { gallery: [] },
  sexModelSupport: ["male", "female"],
  conditionNotes: [],
  movementPattern: "push",
  tags: [],
  regressions: [],
  progressions: [],
  related: [],
  provenance: { primarySource: "mock", mergedSources: ["mock"], rawIds: [], notes: [] },
  ...overrides,
});

describe("workoutBuilder aggregation", () => {
  it("aggregates multiple caution notes into a single note string", () => {
    const pool = [
      mockExercise("warmup-1", { equipment: ["bodyweight"], movementPattern: "mobility" }),
      mockExercise("comp-1", { 
        movementPattern: "push",
        conditionNotes: [
          { conditionId: "scoliosis", suitability: "caution", note: "Scoliosis Note" },
          { conditionId: "hypertension", suitability: "caution", note: "Hypertension Note" }
        ]
      }),
      mockExercise("cooldown-1", { movementPattern: "mobility", tags: ["stretch"] }),
    ];

    const workout = buildWorkout(pool, {
      sex: "male",
      muscles: ["mid_chest"],
      equipment: ["dumbbell"],
      conditions: ["scoliosis", "hypertension"],
      duration: 20,
    });

    const mainEx = workout.exercises.find(e => e.phase === "main");
    expect(mainEx).toBeDefined();
    // Verify that both notes are present and joined by "; "
    expect(mainEx?.note).toBe("Scoliosis Note; Hypertension Note");
  });

  it("does not include notes for conditions not present in the input", () => {
    const pool = [
      mockExercise("warmup-1", { equipment: ["bodyweight"], movementPattern: "mobility" }),
      mockExercise("comp-1", { 
        movementPattern: "push",
        conditionNotes: [
          { conditionId: "scoliosis", suitability: "caution", note: "Scoliosis Note" },
          { conditionId: "hypertension", suitability: "caution", note: "Hypertension Note" }
        ]
      }),
      mockExercise("cooldown-1", { movementPattern: "mobility", tags: ["stretch"] }),
    ];

    const workout = buildWorkout(pool, {
      sex: "male",
      muscles: ["mid_chest"],
      equipment: ["dumbbell"],
      conditions: ["scoliosis"], // Only scoliosis
      duration: 20,
    });

    const mainEx = workout.exercises.find(e => e.phase === "main");
    expect(mainEx?.note).toBe("Scoliosis Note");
  });
});
