import { MOCK_EXERCISES } from "@/data/mock/mockExercises";
import { getExerciseDatasetExercises } from "@/lib/adapters/exerciseDatasetAdapter";
import { getFreeExerciseDbExercises } from "@/lib/adapters/freeExerciseDbAdapter";
import { slugify, unique } from "@/lib/adapters/normalization";
import type { ExerciseMedia, LiftMapExercise } from "@/lib/types";

function mergeMedia(primary: ExerciseMedia, secondary: ExerciseMedia): ExerciseMedia {
  return {
    thumbnail: primary.thumbnail ?? secondary.thumbnail,
    hero: primary.hero ?? secondary.hero ?? primary.thumbnail ?? secondary.thumbnail,
    animation: primary.animation ?? secondary.animation,
    gallery: unique([...(primary.gallery ?? []), ...(secondary.gallery ?? [])]),
  };
}

function mergeExercise(primary: LiftMapExercise, secondary: LiftMapExercise): LiftMapExercise {
  return {
    ...primary,
    primaryMuscles: unique([...primary.primaryMuscles, ...secondary.primaryMuscles]),
    secondaryMuscles: unique([...primary.secondaryMuscles, ...secondary.secondaryMuscles]),
    equipment: unique([...primary.equipment, ...secondary.equipment]),
    trainingStyles: unique([...primary.trainingStyles, ...secondary.trainingStyles]),
    instructions:
      primary.instructions.length >= secondary.instructions.length ? primary.instructions : secondary.instructions,
    media: mergeMedia(primary.media, secondary.media),
    tags: unique([...primary.tags, ...secondary.tags]),
    regressions: unique([...primary.regressions, ...secondary.regressions]),
    progressions: unique([...primary.progressions, ...secondary.progressions]),
    related: unique([...primary.related, ...secondary.related]),
    conditionNotes: primary.conditionNotes.length ? primary.conditionNotes : secondary.conditionNotes,
    provenance: {
      primarySource: primary.provenance.primarySource,
      mergedSources: unique([...primary.provenance.mergedSources, ...secondary.provenance.mergedSources]),
      rawIds: unique([...primary.provenance.rawIds, ...secondary.provenance.rawIds]),
      notes: unique([
        ...primary.provenance.notes,
        ...secondary.provenance.notes,
        secondary.provenance.primarySource === "free-exercise-db"
          ? "Merged supplemental fields from free-exercise-db."
          : "Merged fallback fields from another source.",
      ]),
    },
  };
}

export function getMergedExercises(): LiftMapExercise[] {
  const exerciseDataset = getExerciseDatasetExercises();
  const freeDb = getFreeExerciseDbExercises();
  const merged = new Map<string, LiftMapExercise>();

  for (const exercise of exerciseDataset) {
    merged.set(exercise.slug, exercise);
  }

  for (const exercise of freeDb) {
    const key = merged.has(exercise.slug) ? exercise.slug : slugify(exercise.name);
    const existing = merged.get(key);
    merged.set(key, existing ? mergeExercise(existing, exercise) : exercise);
  }

  for (const exercise of MOCK_EXERCISES) {
    const existing = merged.get(exercise.slug);
    if (existing) {
      merged.set(exercise.slug, mergeExercise(existing, exercise));
    } else {
      merged.set(exercise.slug, exercise);
    }
  }

  const values = [...merged.values()];
  return values.length ? values : MOCK_EXERCISES;
}
