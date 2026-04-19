import fs from "fs";
import path from "path";
import { reconcileExercises } from "../src/lib/adapters/exerciseMergeAdapter";
import type { ConditionId, LiftMapExercise, MuscleId } from "../src/lib/types";
import { LiftMapExerciseSchema } from "../src/lib/schemas";
import { MUSCLES_BY_ID } from "../src/features/bodymap/muscles";

// Paths
const DATA_DIR = path.join(process.cwd(), "src/data/generated");
const OVERRIDES_PATH = path.join(process.cwd(), "src/data/manual/merge-overrides.json");

// Ensure dirs
const EXERCISES_DIR = path.join(DATA_DIR, "exercises");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(EXERCISES_DIR)) {
  fs.mkdirSync(EXERCISES_DIR, { recursive: true });
}

// Load overrides
let manualOverrides = {};
if (fs.existsSync(OVERRIDES_PATH)) {
  manualOverrides = JSON.parse(fs.readFileSync(OVERRIDES_PATH, "utf-8"));
}

console.log("Reconciling exercises...");
const { exercises, report } = reconcileExercises(manualOverrides);

console.log(`Resolved ${exercises.length} unique exercises.`);

// 0. Strict Validation
console.log("Valiating schemas...");
let validationErrors = 0;
exercises.forEach((ex) => {
  const result = LiftMapExerciseSchema.safeParse(ex);
  if (!result.success) {
    console.error(`- [SCHEMA ERROR] ${ex.slug || "Unknown Slug"}:`);
    console.error(result.error.format());
    validationErrors++;
  }
});

if (validationErrors > 0) {
  console.error(`\n[FAIL] Data sync failed with ${validationErrors} schema errors. Build aborted.`);
  process.exit(1);
}
console.log("Validation passed.");

// 1. exerciseBySlug.json
const exerciseBySlug = exercises.reduce(
  (acc, ex) => {
    acc[ex.slug] = ex;
    return acc;
  },
  {} as Record<string, LiftMapExercise>,
);

// 2. Filterable summaries (for Explore)
const indexSummaries = exercises.map((ex) => ({
  id: ex.id,
  slug: ex.slug,
  name: ex.name,
  bodyRegion: ex.bodyRegion,
  primaryMuscles: ex.primaryMuscles,
  secondaryMuscles: ex.secondaryMuscles,
  equipment: ex.equipment,
  difficulty: ex.difficulty,
  movementPattern: ex.movementPattern,
  trainingStyles: ex.trainingStyles,
  // Compact conditions map instead of full notes for the index/Explore page
  conditions: ex.conditionNotes.reduce(
    (acc, note) => {
      acc[note.conditionId] = note.suitability;
      return acc;
    },
    {} as Record<string, string>,
  ),
  sexModelSupport: ex.sexModelSupport,
  media: { thumbnail: ex.media?.thumbnail || "", hero: ex.media?.hero || "" },
  tags: ex.tags,
  searchStr: [
    ex.name,
    ex.bodyRegion,
    ...ex.tags,
    ...ex.equipment,
    ...ex.trainingStyles,
    ...ex.primaryMuscles.map((m) => MUSCLES_BY_ID[m]?.name ?? ""),
    ...ex.secondaryMuscles.map((m) => MUSCLES_BY_ID[m]?.name ?? ""),
  ]
    .join(" ")
    .toLowerCase(),
}));

// 3. Counts (for Home/Muscle picking)
const countsByMuscle: Record<string, number> = {};
const countsByBodyRegion: Record<string, number> = {};

exercises.forEach((ex) => {
  ex.primaryMuscles.forEach((m) => {
    countsByMuscle[m] = (countsByMuscle[m] || 0) + 1;
  });
  ex.secondaryMuscles.forEach((m) => {
    countsByMuscle[m] = (countsByMuscle[m] || 0) + 1;
  });
  countsByBodyRegion[ex.bodyRegion] = (countsByBodyRegion[ex.bodyRegion] || 0) + 1;
});

const exerciseCounts = {
  total: exercises.length,
  byMuscle: countsByMuscle,
  byBodyRegion: countsByBodyRegion,
};

// 4. Precompute Condition-to-Exercise Indexes
const exercisesByCondition: Record<
  string,
  { suitable: string[]; caution: string[]; avoid: string[] }
> = {};
exercises.forEach((ex) => {
  ex.conditionNotes.forEach((note) => {
    if (!exercisesByCondition[note.conditionId]) {
      exercisesByCondition[note.conditionId] = { suitable: [], caution: [], avoid: [] };
    }
    exercisesByCondition[note.conditionId][note.suitability].push(ex.slug);
  });
});

// 5. Precompute muscle indexes (for Body Map)
const exercisesByMuscle: Record<string, string[]> = {};
exercises.forEach((ex) => {
  const muscles = [...new Set([...ex.primaryMuscles, ...ex.secondaryMuscles])];
  muscles.forEach((muscle) => {
    if (!exercisesByMuscle[muscle]) exercisesByMuscle[muscle] = [];
    exercisesByMuscle[muscle].push(ex.slug);
  });
});

// 6. Precompute Relations
const exercisesById = exercises.reduce(
  (acc, ex) => {
    acc[ex.id] = ex.slug;
    return acc;
  },
  {} as Record<string, string>,
);

const relationsBySlug: Record<
  string,
  { progressions: string[]; regressions: string[]; related: string[] }
> = {};

const relationalErrors: string[] = [];

exercises.forEach((ex) => {
  const validateSlugs = (slugs: string[], type: string) =>
    slugs.filter((s) => {
      if (!exerciseBySlug[s]) {
        relationalErrors.push(
          `[RELATIONAL ERROR] Exercise "${ex.slug}" has missing ${type}: "${s}"`,
        );
        return false;
      }
      return true;
    });

  const resolveIdsToSlugs = (ids: string[]) =>
    ids
      .map((id) => {
        const slug = exercisesById[id];
        if (!slug) {
          // If not an ID, maybe it's already a slug?
          if (exerciseBySlug[id]) return id;
          relationalErrors.push(
            `[RELATIONAL ERROR] Exercise "${ex.slug}" has unresolvable related ID/Slug: "${id}"`,
          );
          return undefined;
        }
        return slug;
      })
      .filter(Boolean) as string[];

  relationsBySlug[ex.slug] = {
    progressions: validateSlugs(ex.progressions, "progression"),
    regressions: validateSlugs(ex.regressions, "regression"),
    related: validateSlugs(resolveIdsToSlugs(ex.related), "related"),
  };
});

if (relationalErrors.length > 0) {
  console.error(
    `\n[FAIL] Data sync failed with ${relationalErrors.length} relational integrity errors:`,
  );
  relationalErrors.slice(0, 50).forEach((err) => console.error(err));
  if (relationalErrors.length > 50) console.error(`... and ${relationalErrors.length - 50} more.`);
  console.error("\nBuild aborted.");
  process.exit(1);
}

// Write outputs
function writeJson(filename: string, data: unknown) {
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`Wrote ${filename}`);
}

// Write individual exercise files (Sharding)
console.log(`Sharding ${exercises.length} exercises...`);
exercises.forEach((ex) => {
  const filepath = path.join(EXERCISES_DIR, `${ex.slug}.json`);
  fs.writeFileSync(filepath, JSON.stringify(ex, null, 2));
});
console.log("Sharding complete.");

// Write remaining outputs
// Note: We no longer write exerciseBySlug.json to avoid the massive 8MB payload.
// Detail pages now load individual {slug}.json files.
writeJson("exerciseIndex.json", indexSummaries);
writeJson("exerciseCounts.json", exerciseCounts);
writeJson("exercisesByCondition.json", exercisesByCondition);
writeJson("exercisesByMuscle.json", exercisesByMuscle);
writeJson("exerciseRelations.json", relationsBySlug);
writeJson("merge-report.json", report);

console.log("Data generation complete.");
