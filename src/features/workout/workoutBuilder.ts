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
const WARMUP_PATTERNS: MovementPattern[] = ["mobility"];

function scoreExercise(
  exercise: Exercise,
  muscles: MuscleId[],
  equipment: Equipment[],
  conditions: ConditionId[],
): number {
  let score = 0;

  // Muscle match
  const primaryHit = exercise.primaryMuscles.filter((m) => muscles.includes(m)).length;
  const secondaryHit = exercise.secondaryMuscles.filter((m) => muscles.includes(m)).length;
  score += primaryHit * 3 + secondaryHit * 1;

  // Equipment match
  if (equipment.length === 0 || exercise.equipment.some((e) => equipment.includes(e))) score += 2;
  if (exercise.equipment.includes("bodyweight")) score += 1; // bonus for always-available

  // Condition filter: hard-exclude "avoid" exercises
  for (const conditionId of conditions) {
    const note = exercise.conditionNotes.find((n) => n.conditionId === conditionId);
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
    .filter((e) => !used.has(e.id) && patterns.includes(e.movementPattern))
    .map((e) => ({ exercise: e, score: scoreExercise(e, muscles, equipment, conditions) }))
    .filter((e) => e.score > -999)
    .sort((a, b) => b.score - a.score);

  const picked: Exercise[] = [];
  const regionsUsed = new Set<BodyRegion>();

  for (const { exercise } of scored) {
    if (picked.length >= count) break;
    // Prefer variety
    if (picked.length > 0 && regionsUsed.has(exercise.bodyRegion) && picked.length < count - 1)
      continue;
    picked.push(exercise);
    regionsUsed.add(exercise.bodyRegion);
    used.add(exercise.id);
  }

  // Fill remaining if variety constraint prevented enough
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
        (n) => n.conditionId === conditionId && n.suitability === "caution",
      ),
    )
    .find(Boolean);

  if (phase === "warmup") {
    return { exercise, sets: 2, reps: "10–12", rest: "30s", phase, note: conditionNote?.note };
  }
  if (phase === "cooldown") {
    return { exercise, sets: 1, reps: "30–60s hold", rest: "—", phase, note: conditionNote?.note };
  }

  const isCompound = COMPOUND_PATTERNS.includes(exercise.movementPattern);
  return {
    exercise,
    sets: isCompound ? 3 : 3,
    reps: isCompound ? "6–10" : "10–15",
    rest: isCompound ? "90s" : "60s",
    phase,
    note: conditionNote?.note,
  };
}

export function buildWorkout(allExercises: Exercise[], input: WorkoutInput): GeneratedWorkout {
  const { sex, muscles, equipment, conditions, duration } = input;
  const all = allExercises.filter((e) => e.sexModelSupport.includes(sex));
  const slots = DURATION_TO_SLOTS[duration] ?? DURATION_TO_SLOTS[35];
  const used = new Set<string>();

  // Warmup: mobility or bodyweight, low intensity
  const warmupPool = all.filter(
    (e) =>
      e.equipment.includes("bodyweight") &&
      (e.movementPattern === "mobility" || e.difficulty === "beginner"),
  );
  const warmupFiltered = warmupPool.filter((e) => {
    const byMuscle =
      e.primaryMuscles.some((m) => muscles.includes(m)) ||
      e.secondaryMuscles.some((m) => muscles.includes(m));
    for (const cid of conditions) {
      const note = e.conditionNotes.find((n) => n.conditionId === cid);
      if (note?.suitability === "avoid") return false;
    }
    return byMuscle || warmupPool.length < slots.warmup * 2;
  });

  const warmupPicked = (warmupFiltered.length >= slots.warmup ? warmupFiltered : warmupPool)
    .slice(0, slots.warmup)
    .map((e) => {
      used.add(e.id);
      return e;
    });

  // Main: compounds first, then isolation
  const compoundPicked = pickExercises(
    all,
    muscles,
    equipment,
    conditions,
    COMPOUND_PATTERNS,
    Math.ceil(slots.main * 0.6),
    used,
  );
  const isolationPicked = pickExercises(
    all,
    muscles,
    equipment,
    conditions,
    ISOLATION_PATTERNS,
    slots.main - compoundPicked.length,
    used,
  );
  const mainPicked = [...compoundPicked, ...isolationPicked];

  // Cooldown: mobility/stretch
  const cooldownPool = all.filter(
    (e) =>
      !used.has(e.id) &&
      (e.movementPattern === "mobility" || e.tags.some((t) => t.includes("stretch"))),
  );
  const cooldownPicked = cooldownPool.slice(0, slots.cooldown).map((e) => {
    used.add(e.id);
    return e;
  });

  const allPhaseExercises: WorkoutExercise[] = [
    ...warmupPicked.map((e) => formatExercise(e, "warmup", conditions)),
    ...mainPicked.map((e) => formatExercise(e, "main", conditions)),
    ...cooldownPicked.map((e) => formatExercise(e, "cooldown", conditions)),
  ];

  const muscleNames = [...new Set(mainPicked.flatMap((e) => e.primaryMuscles))];
  const title =
    muscles.length > 0 ? `${duration}‑Minute Workout` : `${duration}‑Minute Full-Body Workout`;

  return {
    title,
    totalMinutes: duration,
    exercises: allPhaseExercises,
    muscles: muscleNames,
    summary: `${allPhaseExercises.length} exercises · ${slots.warmup} warmup · ${mainPicked.length} working sets · ${slots.cooldown} cooldown`,
  };
}

export function workoutToText(workout: GeneratedWorkout): string {
  const lines: string[] = [`🏋️ LiftMap — ${workout.title}`, `${workout.summary}`, ``];

  let phase: string | null = null;
  for (const item of workout.exercises) {
    if (item.phase !== phase) {
      phase = item.phase;
      lines.push(`── ${phase.toUpperCase()} ──`);
    }
    lines.push(`${item.exercise.name}`);
    lines.push(`  ${item.sets} sets × ${item.reps}   Rest: ${item.rest}`);
    if (item.note) lines.push(`  ⚠ ${item.note}`);
  }
  lines.push(``, `Generated by LiftMap · liftmap.app`);
  return lines.join("\n");
}
