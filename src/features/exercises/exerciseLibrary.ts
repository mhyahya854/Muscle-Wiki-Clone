import type { MuscleId } from "@/lib/types";

import { exerciseRepository } from "./exerciseRepository";

export async function getExerciseSummaries() {
  return exerciseRepository.getExerciseSummaries();
}

export async function getExerciseBySlug(slug: string) {
  return exerciseRepository.getExerciseBySlug(slug);
}

export async function getExercisesByMuscle(muscle: MuscleId) {
  return exerciseRepository.getExercisesByMuscle(muscle);
}

export async function getExercisesByCondition(conditionId: string) {
  return exerciseRepository.getExercisesByCondition(conditionId);
}

export async function getExerciseRelations(slug: string) {
  return exerciseRepository.getExerciseRelations(slug);
}
