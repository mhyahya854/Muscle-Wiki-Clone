export type Sex = "male" | "female";
export type SexModelSupport = Sex[];
export type BodyView = "front" | "back";

export type TrainingStyle = "bodybuilding" | "powerlifting" | "calisthenics";
export type Difficulty = "beginner" | "intermediate" | "advanced";
export type Equipment =
  | "barbell"
  | "dumbbell"
  | "cable"
  | "machine"
  | "bodyweight"
  | "kettlebell"
  | "bands"
  | "rings"
  | "smith-machine"
  | "medicine-ball"
  | "foam-roll"
  | "other";

export type MovementPattern =
  | "push"
  | "pull"
  | "squat"
  | "hinge"
  | "carry"
  | "core"
  | "isolation"
  | "mobility";

export type VendorBodySlug =
  | "abs"
  | "adductors"
  | "biceps"
  | "calves"
  | "chest"
  | "deltoids"
  | "forearm"
  | "gluteal"
  | "hamstring"
  | "lower-back"
  | "neck"
  | "obliques"
  | "quadriceps"
  | "tibialis"
  | "trapezius"
  | "triceps"
  | "upper-back";

export type MuscleId =
  | "upper_chest"
  | "mid_chest"
  | "lower_chest"
  | "front_delts"
  | "lateral_delts"
  | "rear_delts"
  | "lats"
  | "traps"
  | "rhomboids"
  | "spinal_erectors"
  | "biceps"
  | "triceps"
  | "forearms"
  | "abs"
  | "obliques"
  | "glutes"
  | "quads"
  | "hamstrings"
  | "calves"
  | "adductors"
  | "abductors"
  | "hip_flexors"
  | "tibialis";

export type BodyRegion = "chest" | "back" | "shoulders" | "arms" | "core" | "legs";

export interface Muscle {
  id: MuscleId;
  name: string;
  region: BodyRegion;
  view: BodyView;
  vendorSlug?: VendorBodySlug;
  isDefault?: boolean;
}

export type ConditionId =
  | "scoliosis"
  | "arthritis"
  | "osteoporosis"
  | "low_back_pain"
  | "hypertension"
  | "diabetes"
  | "parkinsons"
  | "hypermobility"
  | "pregnancy_postpartum"
  | "rehab";

export type ConditionSuitability = "suitable" | "caution" | "avoid";

export interface ConditionNote {
  conditionId: ConditionId;
  suitability: ConditionSuitability;
  note: string;
}

export interface Condition {
  id: ConditionId;
  label: string;
  shortLabel: string;
  description: string;
  available: boolean;
}

export interface ExerciseMedia {
  thumbnail?: string;
  hero?: string;
  animation?: string;
  gallery: string[];
}

export interface ExerciseImportProvenance {
  primarySource: "exercise-dataset" | "free-exercise-db" | "mock" | "manual";
  mergedSources: Array<"exercise-dataset" | "free-exercise-db" | "mock" | "manual">;
  rawIds: string[];
  notes: string[];
  confidence?:
    | "exact_match"
    | "slug_match"
    | "name_match"
    | "manual_override"
    | "unresolved_duplicate";
}

export interface LiftMapExercise {
  id: string;
  name: string;
  slug: string;
  primaryMuscles: MuscleId[];
  secondaryMuscles: MuscleId[];
  equipment: Equipment[];
  difficulty: Difficulty;
  trainingStyles: TrainingStyle[];
  bodyRegion: BodyRegion;
  instructions: string[];
  media: ExerciseMedia;
  sexModelSupport: SexModelSupport;
  conditionNotes: ConditionNote[];
  movementPattern: MovementPattern;
  tags: string[];
  regressions: string[];
  progressions: string[];
  related: string[];
  provenance: ExerciseImportProvenance;
  conditions?: Record<ConditionId, ConditionSuitability>;
  searchStr?: string; // Precomputed search index
}

export interface ExerciseSummary {
  id: string;
  slug: string;
  name: string;
  bodyRegion: BodyRegion;
  primaryMuscles: MuscleId[];
  secondaryMuscles: MuscleId[];
  equipment: Equipment[];
  difficulty: Difficulty;
  movementPattern: MovementPattern;
  trainingStyles: TrainingStyle[];
  conditions: Record<ConditionId, ConditionSuitability>;
  sexModelSupport: SexModelSupport;
  media: { thumbnail?: string; hero?: string };
  tags: string[];
  searchStr?: string;
}

export interface NormalizedExerciseDataSource {
  getExerciseSummaries(): Promise<ExerciseSummary[]>;
  getCounts(): Promise<Record<string, unknown>>;
  getExerciseBySlug(slug: string): Promise<LiftMapExercise | undefined>;
  getExercisesByMuscle(muscle: MuscleId): Promise<string[]>;
  getExercisesByCondition(
    conditionId: string,
  ): Promise<{ suitable: string[]; caution: string[]; avoid: string[] }>;
  getExerciseRelations(
    slug: string,
  ): Promise<{ progressions: string[]; regressions: string[]; related: string[] }>;
}

export type Exercise = LiftMapExercise;
export type ExerciseDataSource = NormalizedExerciseDataSource;
