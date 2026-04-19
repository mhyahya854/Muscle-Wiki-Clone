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

function scoreSimilarity(a: string, b: string): number {
  const normA = slugify(a);
  const normB = slugify(b);
  if (normA === normB) return 1;
  if (normA.includes(normB) || normB.includes(normA)) return 0.8;
  return 0;
}

export interface MergeReportEntry {
  slug: string;
  name: string;
  confidence:
    | "exact_match"
    | "slug_match"
    | "name_match"
    | "manual_override"
    | "unresolved_duplicate"
    | "new";
  mergedSources: string[];
  notes: string[];
  warning?: string;
}

const SOURCE_PRIORITY: Record<string, number> = {
  mock: 100,
  manual: 100,
  "exercise-dataset": 50,
  "free-exercise-db": 10,
};


const SAFETY_KEYWORDS = ["safety", "rehab", "caution", "avoid", "pain", "injury", "form", "posture", "spinal", "joint"];

function calculateQualityScore(instructions: string[]): number {
  if (instructions.length === 0) return 0;
  const text = instructions.join(" ").toLowerCase();
  
  // Base points for breadth of instructions
  let score = Math.min(instructions.length, 5); 

  // Bonus for safety/technical keywords
  SAFETY_KEYWORDS.forEach(kw => {
    if (text.includes(kw)) score += 2;
  });

  return score;
}

function mergeExercise(
  primary: LiftMapExercise,
  secondary: LiftMapExercise,
  confidence:
    | "exact_match"
    | "slug_match"
    | "name_match"
    | "manual_override"
    | "unresolved_duplicate",
): LiftMapExercise {
  const primaryPriority = SOURCE_PRIORITY[primary.provenance.primarySource] ?? 0;
  const secondaryPriority = SOURCE_PRIORITY[secondary.provenance.primarySource] ?? 0;

  // Instruction merging: Prefer higher quality source
  let instructions = primary.instructions;
  if (secondaryPriority > primaryPriority) {
    instructions = secondary.instructions;
  } else if (secondaryPriority === primaryPriority) {
    const primaryScore = calculateQualityScore(primary.instructions);
    const secondaryScore = calculateQualityScore(secondary.instructions);
    
    if (secondaryScore > primaryScore) {
      instructions = secondary.instructions;
    }
  }

  // If manual override says the secondary is the primary source, it would ideally be handled prior,
  // but here we just merge fields safely.
  return {
    ...primary,
    // Safely union arrays
    primaryMuscles: unique([...primary.primaryMuscles, ...secondary.primaryMuscles]),
    secondaryMuscles: unique([...primary.secondaryMuscles, ...secondary.secondaryMuscles]),
    equipment: unique([...primary.equipment, ...secondary.equipment]),
    trainingStyles: unique([...primary.trainingStyles, ...secondary.trainingStyles]),
    instructions,
    media: mergeMedia(primary.media, secondary.media),
    tags: unique([...primary.tags, ...secondary.tags]),
    regressions: unique([...primary.regressions, ...secondary.regressions]),
    progressions: unique([...primary.progressions, ...secondary.progressions]),
    related: unique([...primary.related, ...secondary.related]),
    // Specific merge for condition notes: prefer conditions from primary, add non-overlapping from secondary
    conditionNotes: [
      ...primary.conditionNotes,
      ...secondary.conditionNotes.filter(
        (sec) => !primary.conditionNotes.some((pri) => pri.conditionId === sec.conditionId),
      ),
    ],
    provenance: {
      primarySource: primary.provenance.primarySource,
      mergedSources: unique([
        ...primary.provenance.mergedSources,
        ...secondary.provenance.mergedSources,
      ]),
      rawIds: unique([...primary.provenance.rawIds, ...secondary.provenance.rawIds]),
      notes: unique([
        ...primary.provenance.notes,
        ...secondary.provenance.notes,
        `Merged via ${confidence}`,
      ]),
      confidence,
    },
  };
}

export function reconcileExercises(
  manualOverrides: Record<string, { primarySource: string; notes?: string }> = {},
): { exercises: LiftMapExercise[]; report: MergeReportEntry[] } {
  const exerciseDataset = getExerciseDatasetExercises();
  const freeDb = getFreeExerciseDbExercises();

  const merged = new Map<string, LiftMapExercise>();
  const report: MergeReportEntry[] = [];

  // Phase 1: Base Truth (Mock & Curated Dataset)
  // load mocks first, since they represent hand-curated overrides
  for (const exercise of MOCK_EXERCISES) {
    merged.set(exercise.slug, exercise);
    report.push({
      slug: exercise.slug,
      name: exercise.name,
      confidence: "new",
      mergedSources: ["mock"],
      notes: ["Loaded from mock base"],
    });
  }

  for (const exercise of exerciseDataset) {
    const existing = merged.get(exercise.slug);
    if (existing) {
      merged.set(exercise.slug, mergeExercise(existing, exercise, "slug_match"));
    } else {
      merged.set(exercise.slug, exercise);
    }
  }

  // Phase 2: Supplemental Data (FreeDb)
  for (const exercise of freeDb) {
    const defaultSlug = exercise.slug;
    const nameSlug = slugify(exercise.name);

    let targetSlug: string | undefined;
    let confidence:
      | "exact_match"
      | "slug_match"
      | "name_match"
      | "manual_override"
      | "unresolved_duplicate"
      | undefined;

    // Check manual overrides first
    const override = manualOverrides[defaultSlug] || manualOverrides[nameSlug];
    if (override) {
      targetSlug = defaultSlug; // or whatever logic dictates the chosen base
      confidence = "manual_override";
    }
    // Check ID match (Not universally applicable across datasets, but mock if they share same slug base)
    else if (merged.has(defaultSlug)) {
      targetSlug = defaultSlug;
      confidence = "slug_match";
    } else if (merged.has(nameSlug)) {
      targetSlug = nameSlug;
      confidence = "name_match";
    } else {
      // Find best similarity match
      for (const [existingSlug, existingEx] of merged.entries()) {
        if (scoreSimilarity(exercise.name, existingEx.name) > 0.8) {
          targetSlug = existingSlug;
          confidence = "unresolved_duplicate";
          break;
        }
      }
    }

    if (targetSlug && confidence) {
      const existing = merged.get(targetSlug)!;
      merged.set(targetSlug, mergeExercise(existing, exercise, confidence));
      report.push({
        slug: targetSlug,
        name: existing.name,
        confidence,
        mergedSources: unique([
          ...existing.provenance.mergedSources,
          ...exercise.provenance.mergedSources,
        ]),
        notes: [`Merged with freeDb: ${exercise.name}`],
        warning:
          confidence === "unresolved_duplicate"
            ? "Suspicious merging via loose similarity, check manual overrides."
            : undefined,
      });
    } else {
      merged.set(defaultSlug, exercise);
    }
  }

  const values = [...merged.values()].map((ex) => ({
    ...ex,
    conditions: ex.conditionNotes.reduce(
      (acc, note) => {
        acc[note.conditionId] = note.suitability;
        return acc;
      },
      {} as Record<string, string>,
    ),
  })) as unknown as LiftMapExercise[];

  // Backwards compatibility fallback if empty
  if (values.length === 0) {
    return { exercises: MOCK_EXERCISES, report: [] };
  }

  return { exercises: values, report };
}

// Temporary fallback for UI code still using the synchronous getter until Phase 2 is complete
export function getMergedExercises(): LiftMapExercise[] {
  return reconcileExercises({}).exercises;
}
