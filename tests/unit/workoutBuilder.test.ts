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

const pool = [
  mockExercise("warmup-1", { equipment: ["bodyweight"], movementPattern: "mobility" }),
  mockExercise("warmup-2", { equipment: ["bodyweight"], difficulty: "beginner" }),
  mockExercise("comp-1", { movementPattern: "push" }),
  mockExercise("comp-2", { movementPattern: "pull" }),
  mockExercise("comp-3", { movementPattern: "squat" }),
  mockExercise("iso-1", { movementPattern: "isolation", primaryMuscles: ["biceps"] }),
  mockExercise("iso-2", { movementPattern: "isolation", primaryMuscles: ["triceps"] }),
];

describe("workoutBuilder", () => {
  it("handles sparse candidate pools gracefully with fallbacks", () => {
    const workout = buildWorkout(pool, {
      sex: "male",
      muscles: ["mid_chest"],
      equipment: ["dumbbell"],
      conditions: [],
      duration: 20, // requires 1 warmup, 3 main, 1 cooldown
    });

    expect(workout.exercises.length).toBe(5); // 1 + 3 + 1
    expect(workout.exercises.filter((e) => e.phase === "warmup").length).toBe(1);
    expect(workout.exercises.filter((e) => e.phase === "main").length).toBe(3);
    expect(workout.exercises.filter((e) => e.phase === "cooldown").length).toBe(1);
  });

  it("avoids exercises with avoid suitabilities", () => {
    const unsafePool = [
      ...pool,
      mockExercise("bad-1", {
        conditionNotes: [{ conditionId: "arthritis", suitability: "avoid", note: "bad" }],
      }),
    ];

    const workout = buildWorkout(unsafePool, {
      sex: "male",
      muscles: ["mid_chest"],
      equipment: ["dumbbell"],
      conditions: ["arthritis"],
      duration: 20,
    });

    const hasBad = workout.exercises.some((e) => e.exercise.id === "bad-1");
    expect(hasBad).toBe(false);
  });

  it("aggregates caution notes from multiple conditions", () => {
    const multiNotePool = [
      mockExercise("warmup-1", { equipment: ["bodyweight"], movementPattern: "mobility" }),
      mockExercise("multi-1", {
        movementPattern: "push",
        primaryMuscles: ["mid_chest", "lower_chest"], // Two hits to beat comp-1
        conditionNotes: [
          { conditionId: "scoliosis", suitability: "caution", note: "Scoliosis note" },
          { conditionId: "arthritis", suitability: "caution", note: "Arthritis note" },
        ],
      }),
    ];

    const workout = buildWorkout(multiNotePool, {
      sex: "male",
      muscles: ["mid_chest", "lower_chest"],
      equipment: ["dumbbell"],
      conditions: ["scoliosis", "arthritis"],
      duration: 20,
    });

    const multiExercise = workout.exercises.find((e) => e.exercise.id === "multi-1");
    expect(multiExercise).toBeDefined();
    expect(multiExercise?.note).toContain("Scoliosis note; Arthritis note");
  });
});
