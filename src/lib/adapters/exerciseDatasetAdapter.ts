import rawExercises from "@/data/local/imports/exercise-dataset/data/exercises.json";
import {
  buildBaseExercise,
  inferBodyRegion,
  inferDifficulty,
  inferEquipment,
  inferMovementPattern,
  inferTrainingStyles,
  mapMuscles,
  resolveExerciseDatasetMedia,
  slugify,
  unique,
} from "@/lib/adapters/normalization";
import type { LiftMapExercise } from "@/lib/types";

type ExerciseDatasetRecord = {
  id: string;
  name: string;
  category?: string;
  body_part?: string;
  equipment?: string;
  instruction_steps?: {
    en?: string[];
  };
  instructions?: {
    en?: string;
  };
  muscle_group?: string;
  secondary_muscles?: string[];
  target?: string;
  image?: string;
  gif_url?: string;
};

export function getExerciseDatasetExercises(): LiftMapExercise[] {
  const records = rawExercises as ExerciseDatasetRecord[];
  return records.map((record) => {
    const primaryMuscles = mapMuscles([record.target, record.muscle_group, record.body_part]);
    const secondaryMuscles = mapMuscles(record.secondary_muscles ?? []);
    const bodyRegion = inferBodyRegion(primaryMuscles, secondaryMuscles);
    const equipment = inferEquipment([record.equipment]);
    const difficulty = inferDifficulty(record.category);
    const name = record.name.trim();
    const instructions = unique([
      ...(record.instruction_steps?.en ?? []),
      ...(record.instructions?.en ? [record.instructions.en] : []),
    ]);

    return buildBaseExercise({
      id: record.id,
      name,
      slug: slugify(name),
      primaryMuscles,
      secondaryMuscles,
      equipment,
      difficulty,
      trainingStyles: inferTrainingStyles(bodyRegion, equipment, record.category ?? ""),
      bodyRegion,
      instructions,
      media: resolveExerciseDatasetMedia(record.image, record.gif_url),
      movementPattern: inferMovementPattern(bodyRegion, record.category ?? "", name),
      tags: unique([record.category ?? "", record.body_part ?? "", record.target ?? ""]).filter(
        Boolean,
      ),
      provenance: {
        primarySource: "exercise-dataset",
        mergedSources: ["exercise-dataset"],
        rawIds: [record.id],
        notes: [],
      },
    });
  });
}
