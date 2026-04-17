import type { ExerciseDataSource, MuscleId } from "@/lib/types";
import { getMergedExercises } from "@/lib/adapters/exerciseMergeAdapter";

const EXERCISES = getMergedExercises();

export const exerciseSource: ExerciseDataSource = {
  async list() {
    return EXERCISES;
  },
  async bySlug(slug) {
    return EXERCISES.find((exercise) => exercise.slug === slug);
  },
  async byMuscle(muscle: MuscleId) {
    return EXERCISES.filter(
      (exercise) =>
        exercise.primaryMuscles.includes(muscle) || exercise.secondaryMuscles.includes(muscle),
    );
  },
};
