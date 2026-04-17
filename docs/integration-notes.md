# LiftMap Integration Notes

## Sources Found
- `src/data/local/imports/exercise-dataset`
  - Used as the primary local exercise source.
  - Provides the combined JSON dataset plus local JPG thumbnails and GIF assets now moved into `public/media/exercises/images` and `public/media/exercises/gifs`.
- `src/data/local/imports/free-exercise-db`
  - Used as a secondary fallback source for exercise metadata and local gallery images.
  - Gallery folders were moved into `public/media/exercises/free-db`.
- `src/vendor/bodymap/react-muscle-highlighter`
  - Chosen as the production body-map library.
  - Wrapped by LiftMap code in `src/features/bodymap` so vendor slugs stay isolated from app types.
- `src/vendor/experiments/react-body-highlighter`
  - Kept only as an experimental reference. Not imported by production routes.
- `archive/vendor/vue-human-muscle-anatomy`
  - Vue-only anatomy component. Archived and not wired into the React frontend.
- `archive/docs/exercisedb-api`
  - Docs-only reference. Not wired into the app.

## What Is Live
- The app now reads from a normalized local exercise source in `src/features/exercises/exerciseSource.ts`.
- `exercises-dataset` is preferred when duplicate exercises exist.
- `free-exercise-db` fills media and metadata gaps where it adds value.
- Mock LiftMap data remains as a safe fallback and supplements progression, related exercise, and condition note coverage.

## Adapter Boundaries
- `src/lib/adapters/exerciseDatasetAdapter.ts`
  - Normalizes the combined imported dataset.
- `src/lib/adapters/freeExerciseDbAdapter.ts`
  - Normalizes the secondary dataset and local gallery folders.
- `src/lib/adapters/exerciseMergeAdapter.ts`
  - Deduplicates by slug/name and merges media, tags, and fallback metadata.

## Remaining Manual Refinement Points
- Muscle taxonomy still uses heuristic mapping for third-party labels like chest variants, delts, upper back, and lower back.
- Duplicate resolution currently matches by normalized slug/name. A deeper manual review would improve edge cases where two sources use similar names for different variations.
- Condition notes are LiftMap-authored fallback logic unless a mock entry already provides curated notes.
- The vendored body map maps vendor slugs to LiftMap muscles through a wrapper. Unsupported vendor areas remain intentionally unmapped.
