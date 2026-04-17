import type {
  BodyRegion,
  ConditionNote,
  ConditionSuitability,
  Difficulty,
  Equipment,
  ExerciseImportProvenance,
  ExerciseMedia,
  LiftMapExercise,
  MovementPattern,
  MuscleId,
  TrainingStyle,
} from "@/lib/types";
import { MOCK_EXERCISES_BY_SLUG } from "@/data/mock/mockExercises";

const MUSCLE_ALIASES: Array<[string[], MuscleId]> = [
  [["upper chest", "clavicular", "pectoralis major clavicular"], "upper_chest"],
  [["lower chest", "sternal lower"], "lower_chest"],
  [["chest", "pectoral", "pec"], "mid_chest"],
  [["anterior deltoid", "front delt", "front delts", "front shoulder"], "front_delts"],
  [["side delt", "lateral delt", "lateral delts", "middle delt"], "lateral_delts"],
  [["rear delt", "rear delts", "posterior delt", "back-deltoids"], "rear_delts"],
  [["lat", "lats", "latissimus"], "lats"],
  [["trap", "traps", "trapezius"], "traps"],
  [["rhomboid", "upper back"], "rhomboids"],
  [["spinal erector", "erector", "lower back"], "spinal_erectors"],
  [["bicep", "biceps"], "biceps"],
  [["tricep", "triceps"], "triceps"],
  [["forearm", "forearms"], "forearms"],
  [["abdominal", "abdominals", "abs"], "abs"],
  [["oblique", "obliques"], "obliques"],
  [["glute", "glutes", "gluteal"], "glutes"],
  [["quad", "quads", "quadriceps"], "quads"],
  [["hamstring", "hamstrings"], "hamstrings"],
  [["calf", "calves"], "calves"],
  [["adductor", "adductors"], "adductors"],
  [["abductor", "abductors"], "abductors"],
  [["hip flexor", "hip flexors"], "hip_flexors"],
  [["tibialis"], "tibialis"],
];

const EQUIPMENT_MAP: Record<string, Equipment> = {
  "body weight": "bodyweight",
  "body only": "bodyweight",
  band: "bands",
  bands: "bands",
  barbell: "barbell",
  cable: "cable",
  dumbbell: "dumbbell",
  dumbbells: "dumbbell",
  kettlebell: "kettlebell",
  lever: "machine",
  machine: "machine",
  "medicine ball": "medicine-ball",
  other: "other",
  ring: "rings",
  rings: "rings",
  "foam roll": "foam-roll",
  "smith machine": "smith-machine",
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function basename(path: string | undefined) {
  if (!path) return undefined;
  const clean = path.replace(/\\/g, "/");
  return clean.split("/").filter(Boolean).pop();
}

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ");
}

export function unique<T>(values: T[]) {
  return [...new Set(values)];
}

export function mapMuscles(rawValues: Array<string | undefined | null>) {
  const hits: MuscleId[] = [];
  for (const raw of rawValues) {
    if (!raw) continue;
    const normalized = normalizeText(raw);
    for (const [aliases, muscle] of MUSCLE_ALIASES) {
      if (aliases.some((alias) => normalized.includes(alias))) {
        hits.push(muscle);
        break;
      }
    }
  }
  return unique(hits);
}

export function inferBodyRegion(primary: MuscleId[], secondary: MuscleId[]): BodyRegion {
  const muscles = [...primary, ...secondary];
  if (muscles.some((m) => ["upper_chest", "mid_chest", "lower_chest"].includes(m))) return "chest";
  if (muscles.some((m) => ["front_delts", "lateral_delts", "rear_delts"].includes(m))) return "shoulders";
  if (muscles.some((m) => ["lats", "traps", "rhomboids", "spinal_erectors"].includes(m))) return "back";
  if (muscles.some((m) => ["biceps", "triceps", "forearms"].includes(m))) return "arms";
  if (muscles.some((m) => ["abs", "obliques"].includes(m))) return "core";
  return "legs";
}

export function inferEquipment(rawValues: Array<string | undefined | null>) {
  const mapped = rawValues
    .map((value) => (value ? EQUIPMENT_MAP[normalizeText(value)] : undefined))
    .filter(Boolean) as Equipment[];
  return unique(mapped.length ? mapped : ["other"]);
}

export function inferDifficulty(rawValue?: string | null): Difficulty {
  const normalized = normalizeText(rawValue ?? "");
  if (normalized.includes("advanced")) return "advanced";
  if (normalized.includes("intermediate")) return "intermediate";
  return "beginner";
}

export function inferTrainingStyles(bodyRegion: BodyRegion, equipment: Equipment[], category: string) {
  const styles = new Set<TrainingStyle>();
  const normalizedCategory = normalizeText(category);
  if (normalizedCategory.includes("stretch") || normalizedCategory.includes("plyometric")) {
    styles.add("calisthenics");
  }
  if (equipment.some((item) => ["bodyweight", "rings", "bands"].includes(item))) {
    styles.add("calisthenics");
  }
  if (equipment.some((item) => ["barbell", "smith-machine"].includes(item))) {
    styles.add("powerlifting");
  }
  if (bodyRegion === "shoulders" || bodyRegion === "arms" || bodyRegion === "chest" || normalizedCategory.includes("strength")) {
    styles.add("bodybuilding");
  }
  if (!styles.size) styles.add("bodybuilding");
  return [...styles];
}

export function inferMovementPattern(bodyRegion: BodyRegion, category: string, exerciseName: string): MovementPattern {
  const normalized = `${normalizeText(category)} ${normalizeText(exerciseName)}`;
  if (normalized.includes("squat") || normalized.includes("lunge")) return "squat";
  if (normalized.includes("deadlift") || normalized.includes("hinge")) return "hinge";
  if (normalized.includes("row") || normalized.includes("pull")) return "pull";
  if (normalized.includes("press") || normalized.includes("push")) return "push";
  if (normalized.includes("stretch") || normalized.includes("roll")) return "mobility";
  if (bodyRegion === "core") return "core";
  if (bodyRegion === "arms" || bodyRegion === "shoulders") return "isolation";
  return "isolation";
}

export function resolveExerciseDatasetMedia(image?: string, gif?: string): ExerciseMedia {
  const imageName = basename(image);
  const gifName = basename(gif);
  const thumbnail = imageName ? `/media/exercises/images/${imageName}` : undefined;
  const animation = gifName ? `/media/exercises/gifs/${gifName}` : undefined;
  return {
    thumbnail,
    hero: animation ?? thumbnail,
    animation,
    gallery: thumbnail ? [thumbnail] : [],
  };
}

export function resolveFreeDbMedia(id: string, images: string[] = []): ExerciseMedia {
  const gallery = images.map((image) => `/media/exercises/free-db/${id}/${basename(image)}`);
  return {
    thumbnail: gallery[0],
    hero: gallery[0],
    animation: undefined,
    gallery,
  };
}

function genericConditionNote(
  conditionId: "scoliosis" | "arthritis",
  suitability: ConditionSuitability,
  note: string,
): ConditionNote {
  return { conditionId, suitability, note };
}

export function inferConditionNotes(seed: {
  slug: string;
  name: string;
  bodyRegion: BodyRegion;
  equipment: Equipment[];
  difficulty: Difficulty;
  movementPattern: MovementPattern;
}): ConditionNote[] {
  const mockMatch = MOCK_EXERCISES_BY_SLUG[seed.slug];
  if (mockMatch?.conditionNotes.length) return mockMatch.conditionNotes;

  const scoliosisSuitability: ConditionSuitability =
    seed.equipment.includes("barbell") && ["hinge", "squat"].includes(seed.movementPattern)
      ? "caution"
      : "suitable";
  const arthritisSuitability: ConditionSuitability =
    seed.difficulty === "advanced" || seed.name.toLowerCase().includes("overhead")
      ? "caution"
      : "suitable";

  const regionHint =
    seed.bodyRegion === "back"
      ? "Favor symmetrical loading and supported variations if fatigue changes your posture."
      : seed.bodyRegion === "legs"
        ? "Use controlled tempo and adjust range of motion if stability changes."
        : "Keep load symmetrical and stop short of positions that create sharp pain or twisting.";

  return [
    genericConditionNote("scoliosis", scoliosisSuitability, regionHint),
    genericConditionNote(
      "arthritis",
      arthritisSuitability,
      "Use pain-free range of motion, slower tempo, and lighter progressions when joints feel irritated.",
    ),
  ];
}

export function buildBaseExercise(input: {
  id: string;
  name: string;
  slug?: string;
  primaryMuscles: MuscleId[];
  secondaryMuscles: MuscleId[];
  equipment: Equipment[];
  difficulty: Difficulty;
  trainingStyles: TrainingStyle[];
  bodyRegion: BodyRegion;
  instructions: string[];
  media: ExerciseMedia;
  movementPattern: MovementPattern;
  tags?: string[];
  provenance: ExerciseImportProvenance;
}): LiftMapExercise {
  const slug = input.slug ?? slugify(input.name);
  const mockMatch = MOCK_EXERCISES_BY_SLUG[slug];
  const conditionNotes = inferConditionNotes({
    slug,
    name: input.name,
    bodyRegion: input.bodyRegion,
    equipment: input.equipment,
    difficulty: input.difficulty,
    movementPattern: input.movementPattern,
  });

  return {
    id: input.id,
    name: input.name,
    slug,
    primaryMuscles: input.primaryMuscles,
    secondaryMuscles: input.secondaryMuscles,
    equipment: input.equipment,
    difficulty: input.difficulty,
    trainingStyles: unique([...(mockMatch?.trainingStyles ?? []), ...input.trainingStyles]),
    bodyRegion: input.bodyRegion,
    instructions: input.instructions.filter(Boolean),
    media: input.media,
    sexModelSupport: ["male", "female"],
    conditionNotes,
    movementPattern: mockMatch?.movementPattern ?? input.movementPattern,
    tags: unique([...(input.tags ?? []), ...(mockMatch?.tags ?? [])]),
    regressions: mockMatch?.regressions ?? [],
    progressions: mockMatch?.progressions ?? [],
    related: mockMatch?.related ?? [],
    provenance: input.provenance,
  };
}
