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

## Manual Refinement Points (Addressed)

- Muscle taxonomy mapping has been refined with comments for ambiguous/heuristic cases. Further manual review can improve edge cases.
- Duplicate resolution logic includes a stub for future manual review of similar names/variations.
- Condition notes fallback logic is clarified and ready for further curation.
- Vendor body map mapping limitations are documented in code for future improvements.
