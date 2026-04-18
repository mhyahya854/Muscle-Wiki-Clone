import type {
  BodyRegion,
  ConditionId,
  Equipment,
  Exercise,
  MovementPattern,
  MuscleId,
  Sex,
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
  exercise: Exercise;
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

function scoreExercise(
  exercise: Exercise,
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
    const note = exercise.conditionNotes.find((entry) => entry.conditionId === conditionId);
    if (note?.suitability === "avoid") return -999;
    if (note?.suitability === "caution") score -= 1;
  }

  return score;
}

function pickExercises(
  all: Exercise[],
  muscles: MuscleId[],
  equipment: Equipment[],
  conditions: ConditionId[],
  patterns: MovementPattern[],
  count: number,
  used: Set<string>,
): Exercise[] {
  const scored = all
    .filter((exercise) => !used.has(exercise.id) && patterns.includes(exercise.movementPattern))
    .map((exercise) => ({
      exercise,
      score: scoreExercise(exercise, muscles, equipment, conditions),
    }))
    .filter((entry) => entry.score > -999)
    .sort((a, b) => b.score - a.score);

  const picked: Exercise[] = [];
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
  exercise: Exercise,
  phase: "warmup" | "main" | "cooldown",
  conditions: ConditionId[],
): WorkoutExercise {
  const conditionNote = conditions
    .map((conditionId) =>
      exercise.conditionNotes.find(
        (note) => note.conditionId === conditionId && note.suitability === "caution",
      ),
    )
    .find(Boolean);

  if (phase === "warmup") {
    return { exercise, sets: 2, reps: "10-12", rest: "30s", phase, note: conditionNote?.note };
  }

  if (phase === "cooldown") {
    return {
      exercise,
      sets: 1,
      reps: "30-60s hold",
      rest: "-",
      phase,
      note: conditionNote?.note,
    };
  }

  const isCompound = COMPOUND_PATTERNS.includes(exercise.movementPattern);

  return {
    exercise,
    sets: 3,
    reps: isCompound ? "6-10" : "10-15",
    rest: isCompound ? "90s" : "60s",
    phase,
    note: conditionNote?.note,
  };
}

export function buildWorkout(allExercises: Exercise[], input: WorkoutInput): GeneratedWorkout {
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
      const note = exercise.conditionNotes.find((entry) => entry.conditionId === conditionId);
      if (note?.suitability === "avoid") return false;
    }

    return matchesMuscles || warmupPool.length < slots.warmup * 2;
  });

  const warmupPicked = (warmupFiltered.length >= slots.warmup ? warmupFiltered : warmupPool)
    .slice(0, slots.warmup)
    .map((exercise) => {
      used.add(exercise.id);
      return exercise;
    });

  const compoundPicked = pickExercises(
    availableExercises,
    muscles,
    equipment,
    conditions,
    COMPOUND_PATTERNS,
    Math.ceil(slots.main * 0.6),
    used,
  );

  const isolationPicked = pickExercises(
    availableExercises,
    muscles,
    equipment,
    conditions,
    ISOLATION_PATTERNS,
    slots.main - compoundPicked.length,
    used,
  );

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
