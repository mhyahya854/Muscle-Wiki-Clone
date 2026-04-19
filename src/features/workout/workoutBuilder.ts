import type {
  BodyRegion,
  ConditionId,
  Equipment,
  Exercise,
  ExerciseSummary,
  MovementPattern,
  MuscleId,
  Sex,
  ConditionNote,
} from "@/lib/types";

export interface WorkoutInput {
  sex: Sex;
  muscles: MuscleId[];
  equipment: Equipment[];
  conditions: ConditionId[];
  duration: 20 | 35 | 50;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

export interface WorkoutExercise {
  exercise: Exercise | ExerciseSummary;
  sets: number;
  reps: string;
  rest: string;
  phase: "warmup" | "main" | "cooldown";
  note?: string;
}

export interface GeneratedWorkout {
  title: string;
  totalMinutes: number;
  exercises: WorkoutExercise[];
  muscles: MuscleId[];
  summary: string;
}

const DURATION_TO_SLOTS: Record<number, { warmup: number; main: number; cooldown: number }> = {
  20: { warmup: 1, main: 3, cooldown: 1 },
  35: { warmup: 2, main: 5, cooldown: 1 },
  50: { warmup: 2, main: 7, cooldown: 2 },
};

const COMPOUND_PATTERNS: MovementPattern[] = ["push", "pull", "squat", "hinge"];
const ISOLATION_PATTERNS: MovementPattern[] = ["isolation", "core"];

/**
 * Score assigned to exercises that should be avoided entirely
 * (e.g., due to medical conditions).
 */
const SCORE_AVOID = -999;

function scoreExercise(
  exercise: Exercise | ExerciseSummary,
  muscles: MuscleId[],
  equipment: Equipment[],
  conditions: ConditionId[],
): number {
  let score = 0;

  const primaryHit = exercise.primaryMuscles.filter((muscle) => muscles.includes(muscle)).length;
  const secondaryHit = exercise.secondaryMuscles.filter((muscle) =>
    muscles.includes(muscle),
  ).length;
  score += primaryHit * 3 + secondaryHit;

  if (equipment.length === 0 || exercise.equipment.some((item) => equipment.includes(item))) {
    score += 2;
  }

  if (exercise.equipment.includes("bodyweight")) {
    score += 1;
  }

  for (const conditionId of conditions) {
    const suitability = ("conditions" in exercise && exercise.conditions)
      ? exercise.conditions[conditionId]
      : (exercise as Exercise).conditionNotes.find((n: ConditionNote) => n.conditionId === conditionId)?.suitability;

    if (suitability === "avoid") return SCORE_AVOID;
    if (suitability === "caution") score -= 1;
  }

  return score;
}

function pickExercises(
  all: (Exercise | ExerciseSummary)[],
  muscles: MuscleId[],
  equipment: Equipment[],
  conditions: ConditionId[],
  patterns: MovementPattern[],
  count: number,
  used: Set<string>,
): (Exercise | ExerciseSummary)[] {
  const scored = all
    .filter((exercise) => !used.has(exercise.id) && patterns.includes(exercise.movementPattern))
    .map((exercise) => ({
      exercise,
      score: scoreExercise(exercise, muscles, equipment, conditions),
    }))
    .filter((entry: { score: number }) => entry.score > SCORE_AVOID)
    .sort((a, b) => b.score - a.score);

  const picked: (Exercise | ExerciseSummary)[] = [];
  const regionsUsed = new Set<BodyRegion>();

  for (const { exercise } of scored) {
    if (picked.length >= count) break;
    if (picked.length > 0 && regionsUsed.has(exercise.bodyRegion) && picked.length < count - 1) {
      continue;
    }

    picked.push(exercise);
    regionsUsed.add(exercise.bodyRegion);
    used.add(exercise.id);
  }

  for (const { exercise } of scored) {
    if (picked.length >= count) break;
    if (!used.has(exercise.id)) {
      picked.push(exercise);
      used.add(exercise.id);
    }
  }

  return picked;
}

function formatExercise(
  exercise: Exercise | ExerciseSummary,
  phase: "warmup" | "main" | "cooldown",
  conditions: ConditionId[],
): WorkoutExercise {
  const matchingNotes = "conditionNotes" in exercise 
    ? conditions
        .map((conditionId) =>
          exercise.conditionNotes.find(
            (note: ConditionNote) => note.conditionId === conditionId && note.suitability === "caution",
          ),
        )
        .filter((note: ConditionNote | undefined): note is ConditionNote => !!note)
        .map((note: ConditionNote) => note.note)
    : [];

  const combinedNote = matchingNotes.length > 0 ? matchingNotes.join("; ") : undefined;

  if (phase === "warmup") {
    return { exercise, sets: 2, reps: "10-12", rest: "30s", phase, note: combinedNote };
  }

  if (phase === "cooldown") {
    return {
      exercise,
      sets: 1,
      reps: "30-60s hold",
      rest: "-",
      phase,
      note: combinedNote,
    };
  }

  const isCompound = COMPOUND_PATTERNS.includes(exercise.movementPattern);

  return {
    exercise,
    sets: 3,
    reps: isCompound ? "6-10" : "10-15",
    rest: isCompound ? "90s" : "60s",
    phase,
    note: combinedNote,
  };
}

export function buildWorkout(
  allExercises: (Exercise | ExerciseSummary)[],
  input: WorkoutInput,
): GeneratedWorkout {
  const { sex, muscles, equipment, conditions, duration } = input;
  const availableExercises = allExercises.filter((exercise) =>
    exercise.sexModelSupport.includes(sex),
  );
  const slots = DURATION_TO_SLOTS[duration] ?? DURATION_TO_SLOTS[35];
  const used = new Set<string>();

  const warmupPool = availableExercises.filter(
    (exercise) =>
      exercise.equipment.includes("bodyweight") &&
      (exercise.movementPattern === "mobility" || exercise.difficulty === "beginner"),
  );

  const warmupFiltered = warmupPool.filter((exercise) => {
    const matchesMuscles =
      exercise.primaryMuscles.some((muscle) => muscles.includes(muscle)) ||
      exercise.secondaryMuscles.some((muscle) => muscles.includes(muscle));

    for (const conditionId of conditions) {
      const suitability = ("conditions" in exercise && exercise.conditions)
        ? exercise.conditions[conditionId]
        : (exercise as Exercise).conditionNotes.find((n: ConditionNote) => n.conditionId === conditionId)?.suitability;

      if (suitability === "avoid") return false;
    }

    return matchesMuscles || warmupPool.length < slots.warmup * 2;
  });

  const warmupPicked = (warmupFiltered.length >= slots.warmup ? warmupFiltered : warmupPool)
    .slice(0, slots.warmup)
    .map((exercise) => {
      used.add(exercise.id);
      return exercise;
    });

  if (warmupPicked.length < slots.warmup) {
    const backupWarmups = availableExercises
      .filter((ex) => !used.has(ex.id) && ex.difficulty === "beginner")
      .slice(0, slots.warmup - warmupPicked.length);
    backupWarmups.forEach((ex) => used.add(ex.id));
    warmupPicked.push(...backupWarmups);
  }

  const compoundPicked = pickExercises(
    availableExercises,
    muscles,
    equipment,
    conditions,
    COMPOUND_PATTERNS,
    Math.ceil(slots.main * 0.6),
    used,
  );

  if (compoundPicked.length < Math.ceil(slots.main * 0.6)) {
    // Fallback: Drop muscle strictness, keep equipment/conditions
    compoundPicked.push(
      ...pickExercises(
        availableExercises,
        [],
        equipment,
        conditions,
        COMPOUND_PATTERNS,
        Math.ceil(slots.main * 0.6) - compoundPicked.length,
        used,
      ),
    );
  }

  const isolationPicked = pickExercises(
    availableExercises,
    muscles,
    equipment,
    conditions,
    ISOLATION_PATTERNS,
    slots.main - compoundPicked.length,
    used,
  );

  if (compoundPicked.length + isolationPicked.length < slots.main) {
    // Fallback: Any pattern
    isolationPicked.push(
      ...pickExercises(
        availableExercises,
        muscles,
        equipment,
        conditions,
        [...COMPOUND_PATTERNS, ...ISOLATION_PATTERNS],
        slots.main - (compoundPicked.length + isolationPicked.length),
        used,
      ),
    );
  }

  const mainPicked = [...compoundPicked, ...isolationPicked];

  const cooldownPool = availableExercises.filter(
    (exercise) =>
      !used.has(exercise.id) &&
      (exercise.movementPattern === "mobility" ||
        exercise.tags.some((tag) => tag.includes("stretch"))),
  );

  const cooldownPicked = cooldownPool.slice(0, slots.cooldown).map((exercise) => {
    used.add(exercise.id);
    return exercise;
  });

  if (cooldownPicked.length < slots.cooldown) {
    const backupCooldowns = warmupPool
      .filter((ex) => !used.has(ex.id))
      .slice(0, slots.cooldown - cooldownPicked.length);
    backupCooldowns.forEach((ex) => used.add(ex.id));
    cooldownPicked.push(...backupCooldowns);
  }

  const exercises: WorkoutExercise[] = [
    ...warmupPicked.map((exercise) => formatExercise(exercise, "warmup", conditions)),
    ...mainPicked.map((exercise) => formatExercise(exercise, "main", conditions)),
    ...cooldownPicked.map((exercise) => formatExercise(exercise, "cooldown", conditions)),
  ];

  const muscleNames = [...new Set(mainPicked.flatMap((exercise) => exercise.primaryMuscles))];
  const title =
    muscles.length > 0 ? `${duration}-Minute Workout` : `${duration}-Minute Full-Body Workout`;

  return {
    title,
    totalMinutes: duration,
    exercises,
    muscles: muscleNames,
    summary: `${exercises.length} exercises · ${slots.warmup} warmup · ${mainPicked.length} working sets · ${slots.cooldown} cooldown`,
  };
}

export function workoutToText(workout: GeneratedWorkout): string {
  const lines: string[] = [`LiftMap - ${workout.title}`, workout.summary, ""];

  let phase: string | null = null;
  for (const item of workout.exercises) {
    if (item.phase !== phase) {
      phase = item.phase;
      lines.push(`-- ${phase.toUpperCase()} --`);
    }

    lines.push(item.exercise.name);
    lines.push(`  ${item.sets} sets x ${item.reps}   Rest: ${item.rest}`);
    if (item.note) lines.push(`  Note: ${item.note}`);
  }

  lines.push("", "Generated by LiftMap - liftmap.app");
  return lines.join("\n");
}
