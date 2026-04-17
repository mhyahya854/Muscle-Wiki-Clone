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

// Refined muscle aliases with comments for ambiguous/heuristic mappings
const MUSCLE_ALIASES: Array<[string[], MuscleId]> = [
  [["upper chest", "clavicular", "pectoralis major clavicular"], "upper_chest"],
  [["lower chest", "sternal lower"], "lower_chest"],
  [["chest", "pectoral", "pec"], "mid_chest"], // Heuristic: generic 'chest' may map to mid_chest, but could be ambiguous
  [["anterior deltoid", "front delt", "front delts", "front shoulder"], "front_delts"],
  [["side delt", "lateral delt", "lateral delts", "middle delt"], "lateral_delts"],
  [["rear delt", "rear delts", "posterior delt", "back-deltoids"], "rear_delts"],
  [["lat", "lats", "latissimus"], "lats"],
  [["trap", "traps", "trapezius"], "traps"],
  [["rhomboid", "upper back"], "rhomboids"], // Heuristic: 'upper back' may also refer to traps/lats
  [["spinal erector", "erector", "lower back"], "spinal_erectors"], // Heuristic: 'lower back' could be ambiguous
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

export function mapMuscles(rawValues: Array<string | undefined | null>): MuscleId[] {
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
  if (muscles.some((m) => ["front_delts", "lateral_delts", "rear_delts"].includes(m)))
    return "shoulders";
  if (muscles.some((m) => ["lats", "traps", "rhomboids", "spinal_erectors"].includes(m)))
    return "back";
  if (muscles.some((m) => ["biceps", "triceps", "forearms"].includes(m))) return "arms";
  if (muscles.some((m) => ["abs", "obliques"].includes(m))) return "core";
  return "legs";
}

export function inferEquipment(rawValues: Array<string | undefined | null>): Equipment[] {
  const mapped = rawValues
    .map((value) => (value ? EQUIPMENT_MAP[normalizeText(value)] : undefined))
    .filter(Boolean) as Equipment[];
  return unique(mapped.length ? mapped : (["other"] as Equipment[]));
}

export function inferDifficulty(rawValue?: string | null): Difficulty {
  const normalized = normalizeText(rawValue ?? "");
  if (normalized.includes("advanced")) return "advanced";
  if (normalized.includes("intermediate")) return "intermediate";
  return "beginner";
}

export function inferTrainingStyles(
  bodyRegion: BodyRegion,
  equipment: Equipment[],
  category: string,
) {
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
  if (
    bodyRegion === "shoulders" ||
    bodyRegion === "arms" ||
    bodyRegion === "chest" ||
    normalizedCategory.includes("strength")
  ) {
    styles.add("bodybuilding");
  }
  if (!styles.size) styles.add("bodybuilding");
  return [...styles];
}

export function inferMovementPattern(
  bodyRegion: BodyRegion,
  category: string,
  exerciseName: string,
): MovementPattern {
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

  const name = seed.name.toLowerCase();
  const isHeavyAxial =
    seed.equipment.includes("barbell") && ["hinge", "squat"].includes(seed.movementPattern);
  const isOverhead =
    name.includes("overhead") || (name.includes("press") && seed.bodyRegion === "shoulders");
  const isHighImpact =
    ["squat", "hinge"].includes(seed.movementPattern) && seed.difficulty === "advanced";
  const isSupine = name.includes("bench") || name.includes("floor") || name.includes("lying");
  const isCoreHinge = ["core", "hinge"].includes(seed.movementPattern);
  const isBalance = seed.bodyRegion === "legs" && seed.equipment.includes("bodyweight");
  const isIsometric = name.includes("plank") || name.includes("hold") || name.includes("iso");
  const isHeavy =
    seed.difficulty === "advanced" &&
    (seed.equipment.includes("barbell") || seed.equipment.includes("machine"));

  const notes: ConditionNote[] = [];

  // Scoliosis
  notes.push({
    conditionId: "scoliosis",
    suitability: isHeavyAxial ? "caution" : "suitable",
    note: isHeavyAxial
      ? "Axial loading under fatigue may worsen asymmetrical curves. Prefer split-stance or supported variations."
      : seed.bodyRegion === "back"
        ? "Favor symmetrical loading and supported variations if fatigue changes your posture."
        : "Keep load symmetrical and stop at positions that create sharp pain or twisting.",
  });

  // Arthritis
  notes.push({
    conditionId: "arthritis",
    suitability: isOverhead || seed.difficulty === "advanced" ? "caution" : "suitable",
    note: isOverhead
      ? "Overhead positions can stress shoulder and elbow joints. Reduce ROM and load as needed."
      : "Use pain-free range of motion, slower tempo, and lighter progressions when joints feel irritated.",
  });

  // Osteoporosis
  notes.push({
    conditionId: "osteoporosis",
    suitability: isHeavyAxial ? "caution" : isHighImpact ? "caution" : "suitable",
    note: isHeavyAxial
      ? "Loaded spinal flexion or heavy axial loading should be avoided. Use supported variations."
      : "Weight-bearing resistance exercises are beneficial for bone density when load is appropriate.",
  });

  // Low Back Pain
  notes.push({
    conditionId: "low_back_pain",
    suitability: isCoreHinge || seed.bodyRegion === "back" ? "caution" : "suitable",
    note:
      isCoreHinge || seed.bodyRegion === "back"
        ? "Avoid loaded spinal flexion and excessive hinge depth. Brace core and use supported positions."
        : "Maintain neutral spine and avoid positions that aggravate the lower back.",
  });

  // Hypertension
  notes.push({
    conditionId: "hypertension",
    suitability: isIsometric || isHeavy ? "caution" : "suitable",
    note: isIsometric
      ? "Prolonged isometric holds can spike blood pressure. Use shorter durations and breathe consistently."
      : isHeavy
        ? "Heavy compound lifts may cause acute BP spikes. Monitor intensity and avoid Valsalva breath-holding."
        : "Maintain consistent breathing throughout. Avoid breath-holding.",
  });

  // Diabetes
  notes.push({
    conditionId: "diabetes",
    suitability: "suitable",
    note: "Both aerobic and resistance training improve insulin sensitivity. Monitor blood sugar before, during, and after sessions. Have a fast-acting carb available.",
  });

  // Parkinson's
  notes.push({
    conditionId: "parkinsons",
    suitability: isBalance ? "caution" : "suitable",
    note: isBalance
      ? "Single-leg or balance-intensive variations increase fall risk. Use support or a seated alternative."
      : "Rhythm-based exercises and large-amplitude movements are beneficial. Focus on motor confidence.",
  });

  // Hypermobility
  notes.push({
    conditionId: "hypermobility",
    suitability: isOverhead || name.includes("stretch") ? "caution" : "suitable",
    note:
      isOverhead || name.includes("stretch")
        ? "Avoid pushing into end-range positions. Prioritize midrange control and joint stability over depth."
        : "Focus on muscle co-contraction and joint stability. Avoid locking out joints passively.",
  });

  // Pregnancy / Postpartum
  notes.push({
    conditionId: "pregnancy_postpartum",
    suitability: isSupine || isHeavy ? "caution" : "suitable",
    note: isSupine
      ? "Avoid supine positions after the first trimester due to vena cava compression. Incline or side-lie alternatives preferred."
      : isHeavy
        ? "Reduce load to allow proper breathing and pelvic floor management. Avoid bearing-down pressure."
        : "Functional patterns are generally safe. Prioritize pelvic floor awareness and avoid Valsalva.",
  });

  // Rehab
  notes.push({
    conditionId: "rehab",
    suitability: seed.difficulty === "advanced" ? "caution" : "suitable",
    note:
      seed.difficulty === "advanced"
        ? "Use a regressed variation and reduced ROM until tissue tolerance is established."
        : "Start light with higher reps and shorter ROM. Progress load gradually as pain-free capacity increases.",
  });

  return notes;
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
    sexModelSupport:
      conditionNotes.some(
        (n) => n.conditionId === "pregnancy_postpartum" && n.suitability === "caution",
      ) || input.name.toLowerCase().includes("pregnancy")
        ? ["female"]
        : ["male", "female"],
    conditionNotes,
    movementPattern: mockMatch?.movementPattern ?? input.movementPattern,
    tags: unique([...(input.tags ?? []), ...(mockMatch?.tags ?? [])]),
    regressions: mockMatch?.regressions ?? [],
    progressions: mockMatch?.progressions ?? [],
    related: mockMatch?.related ?? [],
    provenance: input.provenance,
  };
}
