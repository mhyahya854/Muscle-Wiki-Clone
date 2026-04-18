import type { MuscleId } from "@/lib/types";

let exerciseSourcePromise: Promise<(typeof import("./exerciseSource"))["exerciseSource"]> | null =
  null;

async function loadExerciseSource() {
  if (!exerciseSourcePromise) {
    exerciseSourcePromise = import("./exerciseSource").then((module) => module.exerciseSource);
  }

  return exerciseSourcePromise;
}

export async function loadExerciseLibrary() {
  const source = await loadExerciseSource();
  return source.list();
}

export async function loadExerciseBySlug(slug: string) {
  const source = await loadExerciseSource();
  return source.bySlug(slug);
}

export async function loadExercisesByMuscle(muscle: MuscleId) {
  const source = await loadExerciseSource();
  return source.byMuscle(muscle);
}
