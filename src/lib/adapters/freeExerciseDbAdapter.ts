import rawExercises from "@/data/local/imports/free-exercise-db/dist/exercises.json";
import {
  buildBaseExercise,
  inferBodyRegion,
  inferDifficulty,
  inferEquipment,
  inferMovementPattern,
  inferTrainingStyles,
  mapMuscles,
  resolveFreeDbMedia,
  unique,
} from "@/lib/adapters/normalization";
import type { LiftMapExercise } from "@/lib/types";

type FreeExerciseDbRecord = {
  id: string;
  name: string;
  level?: string | null;
  equipment?: string | null;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  instructions?: string[];
  category?: string;
  images?: string[];
};

export function getFreeExerciseDbExercises(): LiftMapExercise[] {
  const records = rawExercises as FreeExerciseDbRecord[];
  return records.map((record) => {
    const primaryMuscles = mapMuscles(record.primaryMuscles ?? []);
    const secondaryMuscles = mapMuscles(record.secondaryMuscles ?? []);
    const bodyRegion = inferBodyRegion(primaryMuscles, secondaryMuscles);
    const equipment = inferEquipment([record.equipment ?? undefined]);
    const difficulty = inferDifficulty(record.level);
    const name = record.name.trim();

    return buildBaseExercise({
      id: record.id,
      name,
      primaryMuscles,
      secondaryMuscles,
      equipment,
      difficulty,
      trainingStyles: inferTrainingStyles(bodyRegion, equipment, record.category ?? ""),
      bodyRegion,
      instructions: record.instructions ?? [],
      media: resolveFreeDbMedia(record.id, record.images),
      movementPattern: inferMovementPattern(
        bodyRegion,
        record.category ?? "",
        name,
        primaryMuscles,
      ),
      tags: unique([
        record.category ?? "",
        ...(record.primaryMuscles ?? []),
        ...(record.secondaryMuscles ?? []),
      ]).filter(Boolean),
      provenance: {
        primarySource: "free-exercise-db",
        mergedSources: ["free-exercise-db"],
        rawIds: [record.id],
        notes: [],
      },
    });
  });
}
