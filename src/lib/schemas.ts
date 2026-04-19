import { z } from "zod";

export const SexSchema = z.enum(["male", "female"]);
export const BodyViewSchema = z.enum(["front", "back"]);

export const TrainingStyleSchema = z.enum(["bodybuilding", "powerlifting", "calisthenics"]);
export const DifficultySchema = z.enum(["beginner", "intermediate", "advanced"]);

export const EquipmentSchema = z.enum([
  "barbell",
  "dumbbell",
  "cable",
  "machine",
  "bodyweight",
  "kettlebell",
  "bands",
  "rings",
  "smith-machine",
  "medicine-ball",
  "foam-roll",
  "other",
]);

export const MovementPatternSchema = z.enum([
  "push",
  "pull",
  "squat",
  "hinge",
  "carry",
  "core",
  "isolation",
  "mobility",
]);

export const MuscleIdSchema = z.enum([
  "upper_chest",
  "mid_chest",
  "lower_chest",
  "front_delts",
  "lateral_delts",
  "rear_delts",
  "lats",
  "traps",
  "rhomboids",
  "spinal_erectors",
  "biceps",
  "triceps",
  "forearms",
  "abs",
  "obliques",
  "glutes",
  "quads",
  "hamstrings",
  "calves",
  "adductors",
  "abductors",
  "hip_flexors",
  "tibialis",
]);

export const BodyRegionSchema = z.enum(["chest", "back", "shoulders", "arms", "core", "legs"]);

export const ConditionIdSchema = z.enum([
  "scoliosis",
  "arthritis",
  "osteoporosis",
  "low_back_pain",
  "hypertension",
  "diabetes",
  "parkinsons",
  "hypermobility",
  "pregnancy_postpartum",
  "rehab",
]);

export const ConditionSuitabilitySchema = z.enum(["suitable", "caution", "avoid"]);

export const ConditionNoteSchema = z.object({
  conditionId: ConditionIdSchema,
  suitability: ConditionSuitabilitySchema,
  note: z.string(),
});

export const ExerciseMediaSchema = z.object({
  thumbnail: z.string().optional(),
  hero: z.string().optional(),
  animation: z.string().optional(),
  gallery: z.array(z.string()),
});

export const ExerciseImportProvenanceSchema = z.object({
  primarySource: z.enum(["exercise-dataset", "free-exercise-db", "mock", "manual"]),
  mergedSources: z.array(z.enum(["exercise-dataset", "free-exercise-db", "mock", "manual"])),
  rawIds: z.array(z.string()),
  notes: z.array(z.string()),
  confidence: z
    .enum(["exact_match", "slug_match", "name_match", "manual_override", "unresolved_duplicate"])
    .optional(),
});

export const LiftMapExerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  primaryMuscles: z.array(MuscleIdSchema),
  secondaryMuscles: z.array(MuscleIdSchema),
  equipment: z.array(EquipmentSchema),
  difficulty: DifficultySchema,
  trainingStyles: z.array(TrainingStyleSchema),
  bodyRegion: BodyRegionSchema,
  instructions: z.array(z.string()),
  media: ExerciseMediaSchema,
  sexModelSupport: z.array(SexSchema),
  conditionNotes: z.array(ConditionNoteSchema),
  movementPattern: MovementPatternSchema,
  tags: z.array(z.string()),
  regressions: z.array(z.string()),
  progressions: z.array(z.string()),
  related: z.array(z.string()),
  provenance: ExerciseImportProvenanceSchema,
});
